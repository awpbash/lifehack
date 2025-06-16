export interface ProductInfo {
  name: string;
  price: string;
  image: string;
  url: string;
}

export interface Alternative {
  name: string;
  brand: string;
  score: number;
  price: string;
  savings: string;
}

export interface SustainabilityData {
  sustainabilityScore: number;
  carbonFootprint: number;
  waterUsage: string;
  recyclableContent: number;
  certifications: string[];
  alternatives: Alternative[];
}

export interface Stats {
  analyzed: number;
  co2Saved: number;
  ecoChoices: number;
}

export interface ChromeMessage {
  action: string;
  enabled?: boolean;
  productInfo?: ProductInfo;
}

export interface BrandData {
  score: number;
  carbonFootprint: number;
  waterUsage: string;
  recyclable: number;
}