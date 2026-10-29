@echo off
echo ============================================================
echo   Starting OmniConvert: Anything-to-Anything Local Converter
echo ============================================================
echo.

start "OmniConvert Backend (FastAPI)" cmd /k "python backend/run_server.py"

timeout /t 2 /nobreak > nul

start "OmniConvert Frontend (Vite)" cmd /k "cd frontend && npm run dev"

echo.
echo Both services are booting up:
echo  - Backend API: http://127.0.0.1:8000 (Swagger docs: http://127.0.0.1:8000/docs)
echo  - Frontend UI:  http://localhost:5173
echo.
pause

