// Interfaces for external API responses
export interface WeaviateResponse {
  data?: {
    Get?: {
      Address?: Array<{
        canonical: string;
        latitude?: number;
        longitude?: number;
        _additional?: {
          distance?: number;
        };
      }>;
    };
  };
}
export interface OllamaResponse {
  response?: string;
}
export interface GoogleGeocodingResponse {
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
