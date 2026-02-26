Write-Host "Starting Babel Fish Application..." -ForegroundColor Green
Write-Host ""
Write-Host "Opening in default browser..." -ForegroundColor Yellow

# Open the HTML file in the default browser
Start-Process "index.html"

Write-Host ""
Write-Host "Application started! The website should open in your browser." -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
