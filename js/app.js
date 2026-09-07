// Frontend logic for the weather app.
// IMPORTANT: this file never contains the API key.
// It calls our own Netlify function ("/api/weather"), which is the only
// place the real WeatherAPI.com key is used (kept secret on the server).

const form = document.getElementById("search-form");
const input = document.getElementById("city-input");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const submitButton = form.querySelector("button[type=submit]");

const iconEl = document.getElementById("icon");
const locationEl = document.getElementById("location");
const updatedEl = document.getElementById("updated");
const tempEl = document.getElementById("temp");
const conditionEl = document.getElementById("condition");
const feelslikeEl = document.getElementById("feelslike");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = input.value.trim();
  if (!city) return;

  await fetchWeather(city);
});

async function fetchWeather(city) {
  setLoading(true);
  setStatus("");
  resultEl.classList.add("hidden");

  try {
    const response = await fetch(
      `/api/weather?city=${encodeURIComponent(city)}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not fetch weather.");
    }

    renderWeather(data);
  } catch (err) {
    setStatus(err.message || "Something went wrong. Please try again.", true);
  } finally {
    setLoading(false);
  }
}

function renderWeather(data) {
  const { location, current } = data;

  iconEl.src = current.condition.icon.startsWith("//")
    ? `https:${current.condition.icon}`
    : current.condition.icon;
  iconEl.alt = current.condition.text;

  locationEl.textContent = `${location.name}, ${location.country}`;
  updatedEl.textContent = `Updated: ${location.localtime}`;

  tempEl.textContent = `${Math.round(current.temp_c)}°C`;
  conditionEl.textContent = current.condition.text;

  feelslikeEl.textContent = `${Math.round(current.feelslike_c)}°C`;
  humidityEl.textContent = `${current.humidity}%`;
  windEl.textContent = `${current.wind_kph} km/h`;

  resultEl.classList.remove("hidden");
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  if (isLoading) setStatus("Loading...");
}
