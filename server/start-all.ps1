# MetaMeal Full Stack Startup Script
Write-Host "Starting MetaMeal Full Stack Application..." -ForegroundColor Cyan

# Get the current directory (server folder)
$serverPath = $PSScriptRoot
$clientPath = Join-Path (Split-Path $serverPath -Parent) "client"

Write-Host ""
Write-Host "[1/3] Starting Python ML Service on port 5001..." -ForegroundColor Yellow
Start-Process -FilePath "cmd" -ArgumentList "/k", "cd /d `"$serverPath`" && echo Starting ML Service... && python ml_service.py" -WindowStyle Normal

Write-Host "Waiting for ML service to initialize..."
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "[2/3] Starting Node.js Backend on port 5002..." -ForegroundColor Yellow
Start-Process -FilePath "cmd" -ArgumentList "/k", "cd /d `"$serverPath`" && echo Starting Node.js Backend... && npm run dev" -WindowStyle Normal

Write-Host "Waiting for backend to initialize..."
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "[3/3] Starting React Frontend on port 3000..." -ForegroundColor Yellow
Start-Process -FilePath "cmd" -ArgumentList "/k", "cd /d `"$clientPath`" && echo Starting React Frontend... && npm start" -WindowStyle Normal

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "All services are starting up!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services:" -ForegroundColor White
Write-Host "- Python ML Service: http://localhost:5001" -ForegroundColor Cyan
Write-Host "- Node.js Backend: http://localhost:5002" -ForegroundColor Cyan
Write-Host "- React Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: Each service will open in its own terminal window." -ForegroundColor Yellow
Write-Host "Wait for all services to fully start before using the app." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to close this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
