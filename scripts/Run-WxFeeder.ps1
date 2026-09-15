# Invoked by the Windows Scheduled Task. Runs the harness once, logs the
# result, and surfaces a non-zero exit code to Task Scheduler on failure.
#
# Deliberately NOT using $ErrorActionPreference = "Stop" around the node
# invocation: with Stop set, PowerShell treats the first line node writes to
# stderr (via `2>&1`) as a terminating error and aborts immediately — even
# though node's own retry logic logs "attempt N/3 failed" to stderr as
# normal, expected behavior on every transient network blip. That bug caused
# every run with so much as one retry to be reported as a hard failure
# without node ever getting to finish its retries. Success/failure is
# determined solely by $LASTEXITCODE below.

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$logDir = Join-Path $root "logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}
$logFile = Join-Path $logDir "wxfeeder.log"

# Keep the log from growing forever: archive once it passes 5MB.
if ((Test-Path $logFile) -and ((Get-Item $logFile).Length -gt 5MB)) {
    Move-Item -Path $logFile -Destination (Join-Path $logDir "wxfeeder.log.old") -Force
}

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

try {
    $output = & node "src/run.js" 2>&1 | Out-String
    $exitCode = $LASTEXITCODE
    Add-Content -Path $logFile -Value "[$timestamp] wrapper exit=$exitCode"
    Add-Content -Path $logFile -Value $output.TrimEnd()
    exit $exitCode
} catch {
    Add-Content -Path $logFile -Value "[$timestamp] WRAPPER ERROR: $_"
    exit 1
}
