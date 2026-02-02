@echo off
REM ================================================
REM INCOSEARCH Frontend - Windows Development Setup
REM ================================================

echo.
echo ========================================
echo   INCOSEARCH Frontend Setup (Windows)
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/3] Node.js version:
node -v

REM Install dependencies
echo.
echo [2/3] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed!
    pause
    exit /b 1
)

REM Copy .env if not exists
echo.
echo [3/3] Setting up environment...
if not exist .env (
    copy .env.example .env
    echo [INFO] Created .env file. Please edit it with your settings!
)

echo.
echo ========================================
echo   INCOSEARCH Frontend Ready!
echo ========================================
echo.
echo To start the development server:
echo   npm run dev
echo.
echo To build for production:
echo   npm run build
echo.
pause
