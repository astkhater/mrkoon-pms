# Mrkoon PMS — one-shot commit + push helper.
# Usage:  .\push.ps1 "your commit message"
# If no message provided, auto-generates one with timestamp.

param(
  [string]$Message = ""
)

# Always run from the repo folder this script lives in.
Set-Location -Path $PSScriptRoot

# Clear any stale lock files from interrupted git operations.
Remove-Item -Path .git\index.lock -ErrorAction SilentlyContinue
Remove-Item -Path .git\HEAD.lock  -ErrorAction SilentlyContinue

# Default message: timestamp + short status summary.
if ([string]::IsNullOrWhiteSpace($Message)) {
  $stamp = Get-Date -Format "yyyy-MM-dd HH:mm"
  $changed = (git status --porcelain | Measure-Object).Count
  $Message = "chore: batch push @ $stamp ($changed files)"
}

Write-Host "→ git add ." -ForegroundColor Cyan
git add .

Write-Host "→ git commit" -ForegroundColor Cyan
git commit -m "$Message"

Write-Host "→ git push" -ForegroundColor Cyan
git push

Write-Host "Done." -ForegroundColor Green
