
$ErrorActionPreference = "Stop"

$baseDir = "C:\Users\sieuq\.notebooklm-mcp-cli"
$authFile = Join-Path $baseDir "auth.json"
$profileDir = Join-Path $baseDir "profiles\default"
$cookiesFile = Join-Path $profileDir "cookies.json"
$metadataFile = Join-Path $profileDir "metadata.json"

Write-Host "Reading auth.json from $authFile..."
if (-not (Test-Path $authFile)) {
    Write-Error "auth.json not found at $authFile"
}

$authData = Get-Content $authFile | ConvertFrom-Json

# Create profile directory
if (-not (Test-Path $profileDir)) {
    Write-Host "Creating profile directory: $profileDir"
    New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
}

# 1. Save cookies.json
Write-Host "Saving cookies to $cookiesFile..."
$authData.cookies | ConvertTo-Json -Depth 10 | Set-Content $cookiesFile

# 2. Save metadata.json
Write-Host "Saving metadata to $metadataFile..."
$metadata = @{
    csrf_token = $authData.csrf_token
    session_id = $authData.session_id
    email = "" # Email is not strictly required but good to have if we knew it
    last_validated = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.ffffff")
}
$metadata | ConvertTo-Json -Depth 10 | Set-Content $metadataFile

Write-Host "Migration complete!"
Write-Host "You can now run 'nlm notebook list' to verify."
