const form = document.getElementById("recommend-form");
const statusText = document.getElementById("status-text");
const resultNode = document.getElementById("result");

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
