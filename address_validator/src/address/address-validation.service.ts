import { Injectable } from '@nestjs/common';
import {
  ValidationResult,
  ValidationStatus,
} from 'src/types/address-validation';
import { ParserService } from '../parser/parser.service';

interface GoogleGeocodingResponse {
  status: string;
  results?: Array<{
    formatted_address: string;
    geometry?: {
      location?: {
        lat: number;
        lng: number;
      };
    };
  }>;
}

const FIELDS = ['house_number', 'postcode', 'state', 'city', 'road'];

function padPostcode(postcode: string): string {
  if (!postcode) return '';
  return postcode.padStart(5, '0');
}

function allFieldsMatch(
  input: Record<string, string>,
  google: Record<string, string>,
): boolean {
  for (const field of FIELDS) {
    let inputValue = (input[field] || '').toLowerCase();
    let googleValue = (google[field] || '').toLowerCase();
    if (field === 'postcode') {
      inputValue = padPostcode(inputValue);
      googleValue = padPostcode(googleValue);
    }
    // If input has a value but Google's value is different, reject
    if (inputValue && googleValue && inputValue !== googleValue) {
      return false;
    }
    // If input has a value but Google is missing it, reject
    if (inputValue && !googleValue) {
      return false;
    }
    // If input is missing a value, Google can add it (this is OK)
  }
  return true;
}

@Injectable()
export class AddressValidationService {
  constructor(private readonly parserService: ParserService) {}

  private async correctWithQwen(raw: string): Promise<string | null> {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://ollama:11434';
    try {
      const prompt = `You are an address spell checker. Correct any misspellings in the following address, but keep the formatting. Respond with ONLY the corrected address, no explanations.\nAddress: ${raw}`;
      const res = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'qwen3:0.6b',
          prompt,
          stream: false,
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const corrected = (data.response ?? '').trim();
      if (!corrected || corrected.toLowerCase() === raw.toLowerCase())
        return null;
      return corrected as string;
    } catch {
      return null;
    }
  }

  private async qwenIsSameAddress(
    user: string,
    google: string,
    userParsed: Record<string, string>,
    googleParsed: Record<string, string>,
  ): Promise<boolean> {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://ollama:11434';
    try {
      // Only send road, city, state for comparison
      const userRoad = userParsed.road || '';
      const userCity = userParsed.city || '';
      const userState = userParsed.state || '';
      const googleRoad = googleParsed.road || '';
      const googleCity = googleParsed.city || '';
      const googleState = googleParsed.state || '';
      const prompt = `You are helping correct an address. Compare these address fields and determine if they represent the same address, only with small typos:

User: road="${userRoad}", city="${userCity}", state="${userState}"
Google: road="${googleRoad}", city="${googleCity}", state="${googleState}"

Rules:
- Road suffixes like 'road' and 'rd' should be considered the same.
- City typos up to 3 letters are OK

Are these the same address? Could this be only a typo? Reply only: YES or NO`;

      console.log('Qwen prompt:', prompt);
      const res = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'qwen3:0.6b',
          prompt,
          stream: false,
        }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      console.log('Qwen response:', data.response);
      // Remove <think>...</think> blocks
      let response = (data.response ?? '').toLowerCase();
      response = response.replace(/<think>[\s\S]*?<\/think>/g, '');
      // Only consider the first YES or NO in the response, ignore any reasoning
      const match = response.match(/\b(yes|no)\b/);
      if (!match) return false;
      return match[1] === 'yes';
    } catch {
      return false;
    }
  }

  async validate(rawAddress: string): Promise<ValidationResult> {
    const googleKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!googleKey) {
      return {
        valid: false,
        similarity: 0,
        status: ValidationStatus.UNVERIFIABLE,
      };
    }

    // Parse input
    const parsedInput = await this.parserService.parse(rawAddress);

    // Google geocode input
    const googleResult = await this.lookupWithGoogle(rawAddress, googleKey);
    console.log('Google geocode result:', googleResult);
    if (googleResult) {
      const parsedGoogle = await this.parserService.parse(
        googleResult.canonical,
      );
      console.log('Parsed Google canonical:', parsedGoogle);
      if (allFieldsMatch(parsedInput.components, parsedGoogle.components)) {
        return {
          valid: true,
          similarity: 100,
          status: ValidationStatus.VALID,
          match: googleResult,
        };
      }
    }

    // If not all fields match, try Qwen correction as before
    const corrected = await this.correctWithQwen(rawAddress);
    if (corrected) {
      const parsedQwen = await this.parserService.parse(corrected);
      if (!allFieldsMatch(parsedInput.components, parsedQwen.components)) {
        const googleCorrected = await this.lookupWithGoogle(
          corrected,
          googleKey,
        );
        console.log('Google geocode result (Qwen corrected):', googleCorrected);
        if (googleCorrected) {
          const parsedGoogleCorrected = await this.parserService.parse(
            googleCorrected.canonical,
          );
          console.log(
            'Parsed Google canonical (Qwen corrected):',
            parsedGoogleCorrected,
          );
          if (
            allFieldsMatch(
              parsedQwen.components,
              parsedGoogleCorrected.components,
            )
          ) {
            return {
              valid: true,
              similarity: 100,
              status: ValidationStatus.CORRECTED,
              match: googleCorrected,
            };
          }
        }
      }
    }

    // Extra: If Google returned something, ask Qwen if it's the same as the user input (allowing typos, not changing house number or zip)
    if (googleResult) {
      const parsedGoogle = await this.parserService.parse(
        googleResult.canonical,
      );
      const isSame = await this.qwenIsSameAddress(
        rawAddress,
        googleResult.canonical,
        parsedInput.components,
        parsedGoogle.components,
      );
      if (isSame) {
        return {
          valid: true,
          similarity: 100,
          status: ValidationStatus.CORRECTED,
          match: googleResult,
        };
      }
    }

    // Else unverifiable
    return {
      valid: false,
      similarity: 0,
      status: ValidationStatus.UNVERIFIABLE,
    };
  }

  private async lookupWithGoogle(
    address: string,
    apiKey: string,
  ): Promise<{
    canonical: string;
    latitude?: number;
    longitude?: number;
  } | null> {
    try {
      const encoded = encodeURIComponent(address);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${apiKey}`;
      const res = await fetch(url);
      if (!res.ok) return null;

      const data = (await res.json()) as GoogleGeocodingResponse;
      if (data.status !== 'OK' || !data.results?.length) return null;

      const result = data.results[0];
      const canonical = result.formatted_address.toLowerCase();
      const location = result.geometry?.location;

      return {
        canonical,
        latitude: location?.lat,
        longitude: location?.lng,
      };
    } catch {
      return null;
    }
  }
}
