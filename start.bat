@echo off
echo ============================================
echo    PAPADIN SYSTEM - Starting All Services
echo ============================================
echo.
echo This will start:
echo   1. React Frontend (Port 3000)
echo   2. Node.js Backend (Port 5001)
echo   3. Python AI Backend (Port 5000)
echo.
echo Press Ctrl+C in any window to stop that service
echo.
pause

REM Start Frontend
start "Papadin Frontend" cmd /k "cd papadin-frontend && npm start"

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start Node.js Backend
start "Papadin Backend" cmd /k "cd papadin-backend && node server.js"

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start Python AI Backend
start "Papadin AI" cmd /k "cd papadin-ai && venv\Scripts\activate && python app.py"

echo.
echo ============================================
echo    All Services Started!
echo ============================================
echo.
echo Check the opened windows for each service.
echo.
echo URLs:
echo   Frontend: http://localhost:3000
echo   Node.js Backend: http://localhost:5001
echo   Python AI: http://localhost:5000
echo.
echo To stop all services:
echo   Close each command window or press Ctrl+C
echo.
pause
