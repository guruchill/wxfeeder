import { loadConfig } from "../config.js";
import { fetchCurrentWeather } from "./weather.js";
import { temperatureToColor } from "./color.js";
import { iconUrlForCondition } from "./icon.js";
import { withPilcrowClient, updateSnippet, setManualLightUp } from "./pilcrowClient.js";

function localTimeHHMM(timezone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date());
  const hh = parts.find((p) => p.type === "hour").value;
  const mm = parts.find((p) => p.type === "minute").value;
  return `${hh}:${mm}`;
}

const PA_PER_MB = 100;
const METERS_PER_MILE = 1609.344;

function paToMb(pa) {
  return pa == null ? null : pa / PA_PER_MB;
}

function metersToMiles(m) {
  return m == null ? null : m / METERS_PER_MILE;
}

function fmt1(value) {
  return value == null ? "N/A" : value.toFixed(1);
}

function buildMarkdown({
  timeStr,
  tempRounded,
  humidityRounded,
  pressureMb,
  visibilityMi,
  condition,
  iconUrl,
}) {
  return (
    `**Weather at ${timeStr}**\n\n` +
    `Temperature: ${tempRounded}C  \n` +
    `Relative Humidity: ${humidityRounded}%  \n` +
    `Barometric Pressure: ${fmt1(pressureMb)} mb  \n` +
    `Visibility: ${fmt1(visibilityMi)} mi\n\n` +
    `![${condition}](${iconUrl})`
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetries(fn, { attempts = 3, delayMs = 2000 } = {}) {
  let lastErr;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      console.error(`[${new Date().toISOString()}] attempt ${i}/${attempts} failed: ${err.message}`);
      if (i < attempts) await sleep(delayMs * i);
    }
  }
  throw lastErr;
}

async function runOnce() {
  const config = loadConfig();
  const weather = await fetchCurrentWeather(config);

  const timeStr = localTimeHHMM(config.timezone);
  const tempRounded = Math.round(weather.temperatureC);
  const humidityRounded = Math.round(weather.relativeHumidity);
  const pressureMb = paToMb(weather.barometricPressurePa);
  const visibilityMi = metersToMiles(weather.visibilityMeters);

  const markdown = buildMarkdown({
    timeStr,
    tempRounded,
    humidityRounded,
    pressureMb,
    visibilityMi,
    condition: weather.condition,
    iconUrl: iconUrlForCondition(weather.iconUrl),
  });

  const color = temperatureToColor(weather.temperatureC);

  await withPilcrowClient(config, async (client) => {
    await updateSnippet(client, config.snippetId, markdown);
    await setManualLightUp(client, config.snippetId, color);
  });

  console.log(
    `[${new Date().toISOString()}] OK time=${timeStr} tempC=${weather.temperatureC.toFixed(2)}->${tempRounded} ` +
      `humidity=${weather.relativeHumidity.toFixed(1)}->${humidityRounded} pressureMb=${fmt1(pressureMb)} ` +
      `visibilityMi=${fmt1(visibilityMi)} condition="${weather.condition}" color=${color}`
  );
}

withRetries(runOnce).catch((err) => {
  console.error(`[${new Date().toISOString()}] FAILED after retries: ${err.stack || err.message}`);
  process.exitCode = 1;
});
