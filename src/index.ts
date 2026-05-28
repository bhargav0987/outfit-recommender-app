import cors from "cors";
import express from "express";
import { recommendOutfit } from "./recommend";
import { RecommendationInput } from "./types";

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "outfit-recommender-app" });
});

app.post("/recommend", (req, res) => {
  const input = req.body as RecommendationInput;

  if (!input?.gender || !input?.occasion || !input?.climate) {
    return res.status(400).json({
      error: "gender, occasion and climate are required"
    });
  }

  if (typeof input.climate.temperatureC !== "number") {
    return res.status(400).json({
      error: "climate.temperatureC must be a number"
    });
  }

  const recommendation = recommendOutfit(input);
  return res.json(recommendation);
});

app.listen(port, () => {
  console.log(`Outfit recommender API running on port ${port}`);
});
