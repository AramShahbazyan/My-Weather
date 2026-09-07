// Netlify serverless function: acts as a secure proxy to WeatherAPI.com.
//
// The real API key lives ONLY here, as the environment variable
// WEATHER_API_KEY (set in the Netlify dashboard for production, and in a
// local .env file for local testing). It is never sent to the browser.
//
// The frontend calls:  /api/weather?city=Yerevan
// This function calls: https://api.weatherapi.com/v1/current.json?key=...&q=Yerevan

exports.handler = async (event) => {
  const city = event.queryStringParameters && event.queryStringParameters.city;

  if (!city || !city.trim()) {
    return jsonResponse(400, { error: "Please provide a city name." });
  }

  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) {
    // This means WEATHER_API_KEY was not set (missing .env locally, or
    // missing environment variable in the Netlify dashboard).
    return jsonResponse(500, {
      error: "Server is missing WEATHER_API_KEY configuration.",
    });
  }

  const url = `https://api.weatherapi.com/v1/current.json?key=${encodeURIComponent(
    apiKey
  )}&q=${encodeURIComponent(city)}&aqi=no`;

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
