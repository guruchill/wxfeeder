// Maps NWS's structured icon URL (e.g. https://api.weather.gov/icons/land/day/skc)
// onto a simple black-and-white outline glyph, instead of using NWS's own
// (colored, non-outline) PNG icons.
//
// The glyphs themselves (Tabler Icons, MIT licensed, composited with a white
// halo stroke behind a black stroke so they read on both light and dark
// backgrounds) are hosted at github.com/guruchill/wxfeeder-icons and served
// through jsDelivr. They are NOT embedded as data: URIs — Pilcrow's markdown
// renderer strips the src attribute entirely from <img> tags using a data:
// scheme, so a data URI silently renders as a src-less broken image. A
// regular https:// URL is required.
//
// Pinned to a commit SHA rather than @master: jsDelivr's cache for a
// floating branch ref proved unreliable while iterating on these icons
// (purges got throttled and different edge nodes served different stale
// versions). A commit SHA is immutable content, so it doesn't have that
// ambiguity. Bump WXFEEDER_ICONS_COMMIT after pushing changes to
// guruchill/wxfeeder-icons.
const WXFEEDER_ICONS_COMMIT = "2b0592cb7e50f9e2d2dc956d671834a7e8122283";
const ICON_BASE_URL = `https://cdn.jsdelivr.net/gh/guruchill/wxfeeder-icons@${WXFEEDER_ICONS_COMMIT}`;

// NWS condition codes -> icon name (matches a filename at ICON_BASE_URL).
// See https://www.weather.gov/forecast-icons/ for the code vocabulary.
const CODE_TO_ICON = {
  skc: "sun", // clear — overridden to "moon" at night, see below
  few: "cloud",
  sct: "cloud",
  bkn: "cloud",
  ovc: "cloud",
  rain: "cloud-rain",
  rain_showers: "cloud-rain",
  rain_showers_hi: "cloud-rain",
  snow: "cloud-snow",
  rain_snow: "cloud-snow",
  rain_sleet: "cloud-snow",
  snow_sleet: "cloud-snow",
  sleet: "cloud-snow",
  fzra: "cloud-snow",
  rain_fzra: "cloud-snow",
  snow_fzra: "cloud-snow",
  blizzard: "cloud-snow",
  tsra: "cloud-storm",
  tsra_sct: "cloud-storm",
  tsra_hi: "cloud-storm",
  tornado: "tornado",
  hurricane: "storm",
  tropical_storm: "storm",
  fog: "cloud-fog",
  freezing_fog: "cloud-fog",
  haze: "haze",
  dust: "mist",
  smoke: "mist",
  hot: "sun",
  cold: "snowflake",
};

const DEFAULT_ICON = "cloud";

function parseNwsIconUrl(nwsIconUrl) {
  const parts = new URL(nwsIconUrl).pathname.split("/").filter(Boolean);
  const anchor = parts.includes("land") ? "land" : parts.includes("marine") ? "marine" : null;
  if (!anchor) return null;
  const idx = parts.indexOf(anchor);
  const dayNight = parts[idx + 1]; // "day" | "night"
  const firstSegment = parts[idx + 2]; // e.g. "bkn,40" or "wind_skc"
  if (!firstSegment) return null;
  const code = firstSegment.split(",")[0].replace(/^wind_/, "");
  return { dayNight, code };
}

function iconNameForCondition(nwsIconUrl) {
  const parsed = parseNwsIconUrl(nwsIconUrl);
  if (!parsed) return DEFAULT_ICON;
  const name = CODE_TO_ICON[parsed.code] || DEFAULT_ICON;
  if (parsed.code === "skc" && parsed.dayNight === "night") return "moon";
  return name;
}

export function iconUrlForCondition(nwsIconUrl) {
  const name = iconNameForCondition(nwsIconUrl);
  return `${ICON_BASE_URL}/${name}.svg`;
}
