import { catalog } from "./data/catalog";
import {
  ClothingItem,
  OutfitRecommendation,
  RecommendationInput
} from "./types";

const occasionFormalityTarget: Record<string, number> = {
  casual: 4,
  business: 7,
  formal: 9,
  party: 6,
  wedding: 9,
  travel: 4,
  workout: 3
};

function itemFitsInput(item: ClothingItem, input: RecommendationInput): boolean {
  const genderAllowed =
    item.suitableGenders.includes("any") ||
    item.suitableGenders.includes(input.gender);
  if (!genderAllowed) {
    return false;
  }

  if (!item.occasions.includes(input.occasion)) {
    return false;
  }

  const withinTemp =
    input.climate.temperatureC >= item.minTempC &&
    input.climate.temperatureC <= item.maxTempC;

  return withinTemp;
}

function scoreItem(item: ClothingItem, input: RecommendationInput): number {
  let score = 0;

  if (input.climate.humidityPercent >= 65 && item.breathable) {
    score += 15;
  }

  if (input.climate.rainChancePercent >= 50 && item.rainFriendly) {
    score += 15;
  }

  if (input.climate.windKmph >= 25 && item.windFriendly) {
    score += 10;
  }

  const target = occasionFormalityTarget[input.occasion] ?? 5;
  const gap = Math.abs(item.formality - target);
  score += Math.max(0, 20 - gap * 3);

  if (input.preferredColors?.some((color) => item.colors.includes(color))) {
    score += 8;
  }

  if (input.avoidColors?.some((color) => item.colors.includes(color))) {
    score -= 10;
  }

  return score;
}

function pickBestByCategory(
  items: ClothingItem[],
  category: ClothingItem["category"],
  input: RecommendationInput
): ClothingItem | undefined {
  const choices = items.filter((item) => item.category === category);
  if (choices.length === 0) {
    return undefined;
  }

  const sorted = choices.sort(
    (a, b) => scoreItem(b, input) - scoreItem(a, input)
  );
  return sorted[0];
}

export function recommendOutfit(input: RecommendationInput): OutfitRecommendation {
  const filtered = catalog.filter((item) => itemFitsInput(item, input));

  const top = pickBestByCategory(filtered, "top", input);
  const bottom = pickBestByCategory(filtered, "bottom", input);
  const footwear = pickBestByCategory(filtered, "footwear", input);
  const outerwear = pickBestByCategory(filtered, "outerwear", input);

  const items = [top, bottom, footwear, outerwear].filter(
    (item): item is ClothingItem => Boolean(item)
  );

  const reason: string[] = [];
  if (input.climate.rainChancePercent >= 50) {
    reason.push("rain chance is high so weather-safe options are prioritized");
  }
  if (input.climate.humidityPercent >= 65) {
    reason.push("humidity is high so breathable fabrics are preferred");
  }
  reason.push(`style tuned for ${input.occasion} occasion`);

  const score = items.reduce((total, item) => total + scoreItem(item, input), 0);

  return {
    score,
    reason,
    items
  };
}
