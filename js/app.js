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
const forecastEl = document.getElementById("forecast");
const themeToggle = document.getElementById("theme-toggle");
const weatherFxEl = document.getElementById("weather-fx");
const mascotEl = document.getElementById("mascot");
const mascotFaceEl = document.getElementById("mascot-face");
const mascotTipEl = document.getElementById("mascot-tip");

// --- Dark mode ---
// The initial theme is already set (in index.html, before paint) to avoid
// a flash of the wrong theme. Here we just wire up the toggle button and
// remember the user's choice for next time.
function setToggleIcon(theme) {
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
}

setToggleIcon(document.documentElement.getAttribute("data-theme"));

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  setToggleIcon(next);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = input.value.trim();
  if (!city) return;

  await fetchWeather(city);
});

// Show Yerevan's weather by default when the page first loads.
// The search field itself stays empty (just the placeholder) and fully
// usable for any other city.
const DEFAULT_CITY = "Yerevan";
window.addEventListener("DOMContentLoaded", () => {
  fetchWeather(DEFAULT_CITY);
});

async function fetchWeather(city) {
  setLoading(true);
  setStatus("");
  resultEl.classList.add("hidden");

  try {
    const response = await fetch(
      `/api/weather?city=${encodeURIComponent(city)}&days=3`
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

  const forecastDays = data.forecast && data.forecast.forecastday;
  renderForecast(forecastDays);
  renderWeatherEffect(current.condition.text, current.is_day);
  renderMascot(forecastDays);

  resultEl.classList.remove("hidden");
}

function renderForecast(forecastDays) {
  forecastEl.innerHTML = "";

  if (!forecastDays || forecastDays.length === 0) return;

  forecastDays.forEach((day, index) => {
    const card = document.createElement("div");
    card.className = "forecast-day";

    const icon = day.day.condition.icon.startsWith("//")
      ? `https:${day.day.condition.icon}`
      : day.day.condition.icon;

    card.innerHTML = `
      <span class="forecast-label">${dayLabel(day.date, index)}</span>
      <img src="${icon}" alt="${day.day.condition.text}" width="40" height="40" />
      <span class="forecast-temps">
        <span class="forecast-max">${Math.round(day.day.maxtemp_c)}°</span>
        <span class="forecast-min">${Math.round(day.day.mintemp_c)}°</span>
      </span>
    `;

    forecastEl.appendChild(card);
  });
}

function dayLabel(dateString, index) {
  if (index === 0) return "Today";

  // Parse as a local date (avoid timezone shifting the weekday).
  const [year, month, dayNum] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, dayNum);
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

// --- Weather-based background effect (rain / snow / sun / clouds) ---

let currentWeatherFx = null; // avoid rebuilding the same effect every search

function renderWeatherEffect(conditionText, isDay) {
  const category = weatherCategory(conditionText, isDay);

  if (category === currentWeatherFx) return;
  currentWeatherFx = category;

  weatherFxEl.innerHTML = "";
  document.body.className = `weather-${category}`;

  if (category === "rain" || category === "thunder") {
    for (let i = 0; i < 60; i++) {
      const drop = document.createElement("span");
      drop.className = "raindrop";
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.animationDuration = `${0.4 + Math.random() * 0.5}s`;
      drop.style.animationDelay = `${Math.random() * -2}s`;
      weatherFxEl.appendChild(drop);
    }
  } else if (category === "snow") {
    for (let i = 0; i < 45; i++) {
      const flake = document.createElement("span");
      flake.className = "snowflake";
      flake.textContent = "❄";
      flake.style.left = `${Math.random() * 100}%`;
      flake.style.fontSize = `${8 + Math.random() * 10}px`;
      flake.style.setProperty("--drift", `${Math.random() * 60 - 30}px`);
      flake.style.animationDuration = `${5 + Math.random() * 5}s`;
      flake.style.animationDelay = `${Math.random() * -8}s`;
      weatherFxEl.appendChild(flake);
    }
  }
}

function weatherCategory(conditionText, isDay) {
  const text = (conditionText || "").toLowerCase();

  if (text.includes("thunder")) return "thunder";
  if (
    text.includes("snow") ||
    text.includes("blizzard") ||
    text.includes("sleet") ||
    text.includes("ice")
  )
    return "snow";
  if (text.includes("rain") || text.includes("drizzle")) return "rain";
  if (text.includes("fog") || text.includes("mist")) return "fog";
  if (text.includes("sun") || text.includes("clear"))
    return isDay ? "sunny" : "clear-night";
  return "cloudy";
}

// --- Mascot tip, based on tomorrow's forecast ---

function renderMascot(forecastDays) {
  if (!forecastDays || forecastDays.length === 0) {
    mascotEl.classList.add("hidden");
    return;
  }

  // forecastDays[0] is today; use tomorrow when we have it.
  const tomorrow = forecastDays[1] || forecastDays[0];
  const { face, tip } = mascotTip(tomorrow);

  mascotFaceEl.textContent = face;
  mascotTipEl.textContent = tip;
  mascotEl.classList.remove("hidden");
}

function mascotTip(day) {
  const text = (day.day.condition.text || "").toLowerCase();
  const maxTemp = day.day.maxtemp_c;
  const minTemp = day.day.mintemp_c;

  if (text.includes("thunder")) {
    return { face: "⛈️", tip: "Thunderstorms tomorrow — better stay indoors!" };
  }
  if (
    text.includes("snow") ||
    text.includes("blizzard") ||
    text.includes("sleet") ||
    text.includes("ice")
  ) {
    return { face: "🏂", tip: "Snow tomorrow — grab your snowboard!" };
  }
  if (text.includes("rain") || text.includes("drizzle")) {
    return { face: "☔", tip: "Rain tomorrow — take an umbrella!" };
  }
  if (maxTemp >= 32) {
    return { face: "🥤", tip: "Hot tomorrow — stay hydrated!" };
  }
  if (minTemp <= 0) {
    return { face: "🧣", tip: "Freezing tomorrow — bundle up warm!" };
  }
  if (text.includes("fog") || text.includes("mist")) {
    return { face: "🌫️", tip: "Foggy tomorrow — drive carefully!" };
  }
  if (text.includes("sun") || text.includes("clear")) {
    return { face: "🕶️", tip: "Sunny tomorrow — don't forget your sunglasses!" };
  }
  return { face: "🙂", tip: "Calm weather tomorrow — have a great day!" };
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  if (isLoading) setStatus("Loading...");
}
