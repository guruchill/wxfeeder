import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const PILCROW_MCP_URL = "https://thepilcrow.app/app/api/mcp";
export const WEATHER_USER_AGENT = "(WxFeeder scheduled-task, github.com/wxfeeder)";

const REQUIRED_FIELDS = ["pilcrowApiKey", "snippetId", "stationId", "timezone"];

export function loadConfig() {
  const configPath = path.join(__dirname, "config.local.json");
  let local;
  try {
    local = JSON.parse(readFileSync(configPath, "utf8"));
  } catch (err) {
    throw new Error(
      `Could not read config.local.json — copy config.example.json to config.local.json and fill in the values. (${err.message})`
    );
  }

  const missing = REQUIRED_FIELDS.filter((field) => !local[field]);
  if (missing.length > 0) {
    throw new Error(`config.local.json is missing required field(s): ${missing.join(", ")}`);
  }

  return {
    snippetId: local.snippetId,
    mcpUrl: PILCROW_MCP_URL,
    stationId: local.stationId,
    timezone: local.timezone,
    weatherUserAgent: WEATHER_USER_AGENT,
    apiKey: local.pilcrowApiKey,
  };
}
