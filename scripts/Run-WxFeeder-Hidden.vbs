' Launches Run-WxFeeder.ps1 with no visible window at all. PowerShell's own
' -WindowStyle Hidden still flashes a console briefly (conhost.exe creates
' the window before the style is applied); WScript.Shell.Run with style 0
' does not create one in the first place. Used as the Scheduled Task's
' action instead of invoking powershell.exe directly.
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
ps1Path = scriptDir & "\Run-WxFeeder.ps1"

Set shell = CreateObject("WScript.Shell")
cmd = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File """ & ps1Path & """"
exitCode = shell.Run(cmd, 0, True)
WScript.Quit(exitCode)
