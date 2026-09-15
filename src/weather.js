const NWS_BASE = "https://api.weather.gov";

async function getJson(url, userAgent) {
  const res = await fetch(url, {
    headers: { "User-Agent": userAgent, Accept: "application/geo+json" },
  });
  if (!res.ok) {
    throw new Error(`NWS request to ${url} failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

function extractReading(properties) {
  const temperatureC = properties.temperature?.value;
  const relativeHumidity = properties.relativeHumidity?.value;
  if (temperatureC == null || relativeHumidity == null) return null;
  return {
    temperatureC,
    relativeHumidity,
    condition: properties.textDescription,
    iconUrl: properties.icon,
    observedAt: properties.timestamp,
    // Supplementary fields — less reliably reported by every station, so
    // they're allowed to be null rather than triggering the fallback below.
    barometricPressurePa: properties.barometricPressure?.value ?? null,
    visibilityMeters: properties.visibility?.value ?? null,
  };
}

export async function fetchCurrentWeather(config) {
  const latest = await getJson(
    `${NWS_BASE}/stations/${config.stationId}/observations/latest`,
    config.weatherUserAgent
  );
  const reading = extractReading(latest.properties);
  if (reading) return reading;

  // The latest observation can occasionally have null fields; fall back to
  // the most recent complete reading in the station's recent history.
  const recent = await getJson(
    `${NWS_BASE}/stations/${config.stationId}/observations?limit=5`,
    config.weatherUserAgent
  );
  for (const feature of recent.features) {
    const fallback = extractReading(feature.properties);
    if (fallback) return fallback;
  }

  throw new Error(
    `No complete observation (temperature + humidity) found in the last 5 readings from station ${config.stationId}`
  );
}
