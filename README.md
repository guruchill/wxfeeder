# WxFeeder

Fetches the current weather for a configured location from the National
Weather Service and pushes it into a Pilcrow snippet — both the markdown
body and the snippet's manual light-up color (interpolated from
temperature) — by talking directly to Pilcrow's MCP server. No Claude
runtime is involved at execution time; this is a plain Node.js MCP client.

A small example of building against [Pilcrow](https://thepilcrow.app)'s MCP
server.

## Setup

1. `npm install`
2. Copy `config.example.json` to `config.local.json` and fill in your
   Pilcrow API key, snippet ID, [NWS station
   ID](https://www.weather.gov/documentation/services-web-api#/default/station_observation_latest)
   (find yours via [weather.gov](https://www.weather.gov/) — search your
   location, then check the "Current conditions" station listed), and IANA
   timezone. This file is gitignored — never commit it.
3. Test a single run: `npm start` (or `node src/run.js`). Check the console
   output and confirm the snippet updated in Pilcrow.

## Files

- `config.local.json` — per-install settings: Pilcrow API key, snippet ID,
  NWS station ID, timezone. Gitignored; copy from `config.example.json`.
- `config.js` — loads and validates `config.local.json`, plus the Pilcrow
  MCP URL and weather request user agent (fixed, not per-install).
- `src/weather.js` — fetches the latest observation from the configured NWS
  station, with a fallback to recent history if the latest reading has null
  fields.
- `src/color.js` — linear RGB interpolation from temperature to a light-up
  hex color per the 5-stop scale (blue → green → orange → yellow → red).
- `src/pilcrowClient.js` — thin MCP client wrapper (Streamable HTTP
  transport, bearer auth) calling `update_snippet` and `set_manual_light_up`.
- `src/run.js` — orchestrates one run, with automatic retry (3 attempts) on
  transient network failures.
- `scripts/Run-WxFeeder.ps1` — runs the harness once, logs to
  `logs/wxfeeder.log`, and surfaces failures via exit code.
- `scripts/Run-WxFeeder-Hidden.vbs` — what Task Scheduler actually invokes;
  launches `Run-WxFeeder.ps1` with no console window, since PowerShell's own
  `-WindowStyle Hidden` still flashes one briefly.
- `scripts/Register-ScheduledTask.ps1` — registers the Windows Scheduled
  Task.
- `scripts/Unregister-ScheduledTask.ps1` — removes it.

## Scheduling on Windows

```powershell
# Registers a task that runs every 30 minutes under your current user account
.\scripts\Register-ScheduledTask.ps1

# Or choose a different interval:
.\scripts\Register-ScheduledTask.ps1 -IntervalMinutes 15

# Remove it later:
.\scripts\Unregister-ScheduledTask.ps1
```

You can also open Task Scheduler and inspect/adjust the task named
`WxFeeder` directly (run history, triggers, etc.).

## Logs

`logs/wxfeeder.log` accumulates one entry per run; it's rotated to
`wxfeeder.log.old` once it passes 5MB. The log directory is gitignored.

## License

MIT — see [LICENSE](LICENSE).
