# Registers (or re-registers) the Windows Scheduled Task that runs WxFeeder
# on a recurring interval. Run this once from an elevated or normal
# PowerShell prompt (elevation only needed if you pick a system-level
# trigger; the default here runs under the current user).
#
# Usage:
#   .\Register-ScheduledTask.ps1                  # every 30 minutes (default)
#   .\Register-ScheduledTask.ps1 -IntervalMinutes 15

param(
    [string]$TaskName = "WxFeeder",
    [int]$IntervalMinutes = 30
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$runScript = Join-Path $root "scripts\Run-WxFeeder.ps1"

if (-not (Test-Path $runScript)) {
    throw "Could not find $runScript"
}

$action = New-ScheduledTaskAction -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$runScript`"" `
    -WorkingDirectory $root

$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) `
    -RepetitionInterval (New-TimeSpan -Minutes $IntervalMinutes) `
    -RepetitionDuration (New-TimeSpan -Days 3650)

$settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -DontStopOnIdleEnd `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 5) `
    -MultipleInstances IgnoreNew

Register-ScheduledTask -TaskName $TaskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Description "Fetches current weather for the configured location and pushes it to a Pilcrow snippet via MCP." `
    -Force | Out-Null

Write-Host "Registered scheduled task '$TaskName' to run every $IntervalMinutes minutes."
Write-Host "View it in Task Scheduler, or run: Get-ScheduledTask -TaskName '$TaskName'"
