import { Injectable } from '@nestjs/common';

@Injectable()
export class ParserService {
  private readonly libpostalUrl: string;

  constructor() {
    this.libpostalUrl =
      process.env.LIBPOSTAL_URL ?? 'http://libpostal:5000/parse';
  }

  async parse(raw: string): Promise<{ components: Record<string, string> }> {
    const response = await fetch(this.libpostalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Libpostal service responded with ${response.status}: ${text}`,
      );
    }

    return (await response.json()) as { components: Record<string, string> };
  }
}
