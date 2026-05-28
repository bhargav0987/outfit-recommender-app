export type Gender = "men" | "women" | "any";

export type Occasion =
  | "casual"
  | "business"
  | "formal"
  | "party"
  | "wedding"
  | "travel"
  | "workout";

export interface ClimateInput {
  temperatureC: number;
  humidityPercent: number;
  rainChancePercent: number;
  windKmph: number;
}

export interface RecommendationInput {
  gender: Gender;
  occasion: Occasion;
  climate: ClimateInput;
  preferredColors?: string[];
  avoidColors?: string[];
}

export interface ClothingItem {
  id: string;
  name: string;
  category: "top" | "bottom" | "outerwear" | "footwear" | "accessory";
  suitableGenders: Gender[];
  colors: string[];
  occasions: Occasion[];
  minTempC: number;
  maxTempC: number;
  breathable: boolean;
  rainFriendly: boolean;
  windFriendly: boolean;
  formality: number;
}

export interface OutfitRecommendation {
  score: number;
  reason: string[];
  items: ClothingItem[];
}
