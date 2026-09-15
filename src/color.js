const STOPS = [
  { temp: 0, rgb: [0x00, 0x00, 0xff] },
  { temp: 9.25, rgb: [0x00, 0xff, 0x00] },
  { temp: 18.5, rgb: [0xff, 0xa5, 0x00] },
  { temp: 27.75, rgb: [0xff, 0xff, 0x00] },
  { temp: 37, rgb: [0xff, 0x00, 0x00] },
];

function toHex([r, g, b]) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0").toUpperCase()).join("");
}

export function temperatureToColor(tempC) {
  if (tempC <= STOPS[0].temp) return toHex(STOPS[0].rgb);
  if (tempC >= STOPS[STOPS.length - 1].temp) return toHex(STOPS[STOPS.length - 1].rgb);

  for (let i = 0; i < STOPS.length - 1; i++) {
    const a = STOPS[i];
    const b = STOPS[i + 1];
    if (tempC >= a.temp && tempC <= b.temp) {
      const t = (tempC - a.temp) / (b.temp - a.temp);
      const rgb = a.rgb.map((c, idx) => Math.round(c + (b.rgb[idx] - c) * t));
      return toHex(rgb);
    }
  }
  // Unreachable given the clamps above.
  throw new Error(`temperatureToColor: no interval matched for ${tempC}`);
}
