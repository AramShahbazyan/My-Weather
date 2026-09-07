// Netlify serverless function: acts as a secure proxy to WeatherAPI.com.
//
// The real API key lives ONLY here, as the environment variable
// WEATHER_API_KEY (set in the Netlify dashboard for production, and in a
// local .env file for local testing). It is never sent to the browser.
//
// The frontend calls:  /api/weather?city=Yerevan
// This function calls: https://api.weatherapi.com/v1/forecast.json?key=...&q=Yerevan&days=3
//
// forecast.json returns BOTH current weather (data.current) and the
// forecast (data.forecast.forecastday[]) in one response.
//
// NOTE: WeatherAPI.com's free plan only allows up to 3 forecast days.
// If you upgrade your plan later, you can raise MAX_DAYS below.
const MAX_DAYS = 3;

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const city = params.city;

  if (!city || !city.trim()) {
    return jsonResponse(400, { error: "Please provide a city name." });
  }

  const requestedDays = parseInt(params.days, 10);
  const days = Number.isFinite(requestedDays)
    ? Math.min(Math.max(requestedDays, 1), MAX_DAYS)
    : MAX_DAYS;

  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) {
    // This means WEATHER_API_KEY was not set (missing .env locally, or
    // missing environment variable in the Netlify dashboard).
    return jsonResponse(500, {
      error: "Server is missing WEATHER_API_KEY configuration.",
    });
  }

  const url = `https://api.weatherapi.com/v1/forecast.json?key=${encodeURIComponent(
    apiKey
  )}&q=${encodeURIComponent(city)}&days=${days}&aqi=no&alerts=no`;

  try {
    const upstreamResponse = await fetch(url);
    const data = await upstreamResponse.json();

    if (!upstreamResponse.ok) {
      // WeatherAPI.com returns { error: { code, message } } on failure.
      const message =
        (data && data.error && data.error.message) ||
        "Could not fetch weather for that location.";
      return jsonResponse(upstreamResponse.status, { error: message });
    }

    return jsonResponse(200, data);
  } catch (err) {
    return jsonResponse(502, { error: "Failed to reach the weather service." });
  }
};

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
