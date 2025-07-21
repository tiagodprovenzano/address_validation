// Enum and interfaces for address validation responses

export enum ValidationStatus {
  VALID = 'valid',
  CORRECTED = 'corrected',
  UNVERIFIABLE = 'unverifiable',
}

export interface AddressMatch {
  canonical: string;
  latitude?: number;
  longitude?: number;
}

export interface ValidationResult {
  valid: boolean;
  similarity: number; // percentage 0-100 with two decimals
  status: ValidationStatus;
  match?: AddressMatch;
} 