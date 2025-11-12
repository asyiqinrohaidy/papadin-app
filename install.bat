@echo off
echo ============================================
echo    PAPADIN SYSTEM - Windows Setup Script
echo ============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed!
    echo Please install Python from: https://www.python.org/
    pause
    exit /b 1
)

echo [INFO] Node.js and Python detected!
echo.

REM Install Frontend Dependencies
echo ============================================
echo [1/3] Installing Frontend Dependencies...
echo ============================================
cd papadin-frontend
if exist package.json (
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Frontend installation failed!
        pause
        exit /b 1
    )
    echo [SUCCESS] Frontend dependencies installed!
) else (
    echo [ERROR] package.json not found in papadin-frontend!
    pause
    exit /b 1
)
cd ..
echo.

REM Install Backend Dependencies
echo ============================================
echo [2/3] Installing Backend Dependencies...
echo ============================================
cd papadin-backend
if exist package.json (
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Backend installation failed!
        pause
        exit /b 1
    )
    echo [SUCCESS] Backend dependencies installed!
) else (
    echo [ERROR] package.json not found in papadin-backend!
    pause
    exit /b 1
)
cd ..
echo.

REM Install Python Dependencies
echo ============================================
echo [3/3] Installing Python AI Dependencies...
echo ============================================
cd papadin-ai

REM Create virtual environment
if not exist venv (
    echo [INFO] Creating Python virtual environment...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create virtual environment!
        pause
        exit /b 1
    )
)

REM Activate and install
call venv\Scripts\activate.bat
if exist requirements.txt (
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo [ERROR] Python dependencies installation failed!
        pause
        exit /b 1
    )
    echo [SUCCESS] Python dependencies installed!
) else (
    echo [ERROR] requirements.txt not found!
    pause
    exit /b 1
)
cd ..
echo.

echo ============================================
echo    Installation Complete!
echo ============================================
echo.
echo Next Steps:
echo 1. Add serviceAccountKey.json to papadin-backend/
echo 2. Create .env file in papadin-ai/ with your OPENAI_API_KEY
echo 3. Update Firebase config in src/firebase.js
echo 4. Run start.bat to launch all services
echo.
pause
