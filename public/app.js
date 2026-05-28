const form = document.getElementById("recommend-form");
const statusText = document.getElementById("status-text");
const resultNode = document.getElementById("result");
const weatherText = document.getElementById("weather-text");
const refreshWeatherButton = document.getElementById("refresh-weather");
const temperatureInput = form.elements.namedItem("temperatureC");
const humidityInput = form.elements.namedItem("humidityPercent");
const rainChanceInput = form.elements.namedItem("rainChancePercent");
const windInput = form.elements.namedItem("windKmph");

function splitList(value) {
  return value
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

function renderRecommendation(payload) {
  const items = (payload.items || [])
    .map(
      (item) =>
        `<li><strong>${item.name}</strong> <span>(${item.category})</span></li>`
    )
    .join("");

  const reasons = (payload.reason || []).map((line) => `<li>${line}</li>`).join("");

  resultNode.innerHTML = `
    <p><strong>Total score:</strong> ${payload.score}</p>
    <h3>Suggested Items</h3>
    <ul>${items || "<li>No matching items found</li>"}</ul>
    <h3>Why this outfit</h3>
    <ul>${reasons || "<li>No reason available</li>"}</ul>
  `;
}

function setWeatherFields(weather) {
  temperatureInput.value = String(Math.round(weather.temperatureC));
  humidityInput.value = String(Math.round(weather.humidityPercent));
  rainChanceInput.value = String(Math.round(weather.rainChancePercent));
  windInput.value = String(Math.round(weather.windKmph));
}

function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      () => reject(new Error("Location permission denied")),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

async function fetchCurrentWeather(latitude, longitude) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,wind_speed_10m"
  );
  url.searchParams.set("hourly", "precipitation_probability");
  url.searchParams.set("forecast_days", "1");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Weather lookup failed");
  }

  const data = await response.json();
  const hourlyRain = Array.isArray(data?.hourly?.precipitation_probability)
    ? data.hourly.precipitation_probability
    : [];

  // Use next 3-hour peak as practical rain chance for outfit planning.
  const rainChancePercent = hourlyRain
    .slice(0, 3)
    .reduce((max, value) => Math.max(max, Number(value) || 0), 0);

  return {
    temperatureC: Number(data?.current?.temperature_2m) || 0,
    humidityPercent: Number(data?.current?.relative_humidity_2m) || 0,
    windKmph: Number(data?.current?.wind_speed_10m) || 0,
    rainChancePercent
  };
}

async function autofillWeather() {
  try {
    weatherText.textContent = "Fetching local weather...";
    const location = await getCurrentLocation();
    const weather = await fetchCurrentWeather(location.latitude, location.longitude);
    setWeatherFields(weather);
    weatherText.textContent =
      "Weather auto-filled from your current location.";
  } catch (error) {
    weatherText.textContent =
      "Could not auto-fill weather. You can still enter values manually.";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusText.textContent = "Fetching recommendation...";
  resultNode.innerHTML = "";

  const formData = new FormData(form);
  const payload = {
    gender: formData.get("gender"),
    occasion: formData.get("occasion"),
    climate: {
      temperatureC: Number(formData.get("temperatureC")),
      humidityPercent: Number(formData.get("humidityPercent")),
      rainChancePercent: Number(formData.get("rainChancePercent")),
      windKmph: Number(formData.get("windKmph"))
    },
    preferredColors: splitList(String(formData.get("preferredColors") || "")),
    avoidColors: splitList(String(formData.get("avoidColors") || ""))
  };

  try {
    const response = await fetch("/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Unable to get recommendation");
    }

    const data = await response.json();
    statusText.textContent = "Recommendation ready";
    renderRecommendation(data);
  } catch (error) {
    statusText.textContent = "Request failed";
    resultNode.innerHTML = `<p>${error.message || "Unexpected error"}</p>`;
  }
});

refreshWeatherButton.addEventListener("click", () => {
  autofillWeather();
});

autofillWeather();
