export interface User {
  id: number;
  username: string;
  email: string;
  location: string;
  created_at: Date;
}

export interface Garden {
  id: number;
  userId: number;
  name: string;
  description?: string;
  location: string;
  size: number;
  soilType: string;
  sunExposure: string;
  created_at: Date;
  updated_at: Date;
}

export interface Plant {
  id: number;
  commonName: string;
  latinName: string;
  categoryId: number;
  description: string;
  waterNeeds: WaterNeedsType;
  sunNeeds: SunNeedsType;
  soilPreference: string;
  growingZone: string;
  nativeToIreland: boolean;
  isPerennial: boolean;
  floweringSeason?: string;
  harvestSeason?: string;
  pollinatorFriendly: boolean;
  pestResistant: boolean;
  imageUrl?: string;
  sustainabilityRating: number;
  waterConservationRating: number;
  biodiversityValue: number;
}

export type WaterNeedsType = "Low" | "Medium" | "High";
export type SunNeedsType = "Full Sun" | "Partial Shade" | "Full Shade";
export type PlantStatusType = "Planned" | "Planted" | "Harvested" | "Removed";

export interface SustainabilityMetrics {
  id: number;
  gardenId: number;
  recordDate: Date;
  waterUsage?: number;
  compostAmount?: number;
  pesticidesUsed: boolean;
  organicPractices: boolean;
  rainwaterHarvested?: number;
  foodProduced?: number;
}

export interface WeatherData {
  id: number;
  location: string;
  date: Date;
  temperature: number;
  rainfall: number;
  windSpeed: number;
  windDirection: string;
  humidity: number;
  weatherDescription: string;
  forecast?: any; // Parsed from JSON string
  source: string;
  created_at: Date;
}

export interface PlantRecommendation {
  name: string;
  confidence: number;
  description?: string;
  imageUrl?: string;
  sustainabilityRating?: number;
}
