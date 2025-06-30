@echo off
echo Starting MetaMeal Full Stack Application...

echo.
echo [1/3] Starting Python ML Service on port 5001...
start "ML Service" cmd /k "cd /d "%~dp0" && echo Starting ML Service... && python ml_service.py"

echo Waiting for ML service to initialize...
timeout /t 5 >nul

echo.
echo [2/3] Starting Node.js Backend on port 5002...
start "Node Backend" cmd /k "cd /d "%~dp0" && echo Starting Node.js Backend... && npm run dev"

echo Waiting for backend to initialize...
timeout /t 3 >nul

echo.
echo [3/3] Starting React Frontend on port 3000...
start "React Frontend" cmd /k "cd /d "%~dp0\..\client" && echo Starting React Frontend... && npm start"

echo.
echo ============================================
echo All services are starting up!
echo ============================================
echo.
echo Services:
echo - Python ML Service: http://localhost:5001
echo - Node.js Backend: http://localhost:5002  
echo - React Frontend: http://localhost:3000
echo.
echo Note: Each service will open in its own terminal window.
echo Wait for all services to fully start before using the app.
echo.
echo Press any key to close this window...
pause >nul
