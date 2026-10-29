Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Starting OmniConvert: Anything-to-Anything Local Converter" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "python backend/run_server.py"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location frontend; npm run dev"

Write-Host "Services started in dedicated terminals:" -ForegroundColor Yellow
Write-Host " -> Backend API:  http://127.0.0.1:8000 (Swagger: http://127.0.0.1:8000/docs)" -ForegroundColor White
Write-Host " -> Frontend App: http://localhost:5173" -ForegroundColor White
Write-Host ""

