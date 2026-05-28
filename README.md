# Outfit Recommender App

A TypeScript + Express API that recommends outfits for men and women based on climate and occasion.

## What this MVP includes

- Rule-based recommendation engine
- Occasion-aware and weather-aware scoring
- Gender-aware (without hardcoded stereotypes) catalog filtering
- REST API endpoint to request outfit suggestions

## Tech stack

- Node.js
- TypeScript
- Express

## Run locally

```bash
npm install
npm run dev
```

Server starts at `http://localhost:4000`.

## API

### Health check

- `GET /health`

### Get recommendation

- `POST /recommend`
- Body example:

```json
{
  "gender": "women",
  "occasion": "business",
  "climate": {
    "temperatureC": 27,
    "humidityPercent": 72,
    "rainChancePercent": 35,
    "windKmph": 12
  },
  "preferredColors": ["navy", "black"],
  "avoidColors": ["white"]
}
```

## Next improvements

- Integrate live weather API by city
- Add wardrobe upload and user profile persistence
- Move from rules to hybrid ML ranking
- Add frontend (web/mobile) for one-tap daily outfit suggestion
