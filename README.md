# Outfit Recommender App

A TypeScript + Express app with a connected frontend UI that recommends outfits for men and women based on climate and occasion.

## What this MVP includes

- Browser UI for entering weather and occasion details
- Rule-based recommendation engine
- Occasion-aware and weather-aware scoring
- Gender-aware (without hardcoded stereotypes) catalog filtering
- REST API endpoint used by the frontend

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
Open `http://localhost:4000` in your browser to use the UI.

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
