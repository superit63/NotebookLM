@echo off
REM ================================================
REM INCOSEARCH Backend - Windows Development Setup
REM ================================================

echo.
echo ========================================
echo   INCOSEARCH Backend Setup (Windows)
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

echo [1/5] Node.js version:
node -v

REM Install dependencies
echo.
echo [2/5] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed!
    pause
    exit /b 1
)

REM Copy .env if not exists
echo.
echo [3/5] Setting up environment...
if not exist .env (
    copy .env.example .env
    echo [INFO] Created .env file. Please edit it with your settings!
)

REM Setup Prisma
echo.
echo [4/5] Setting up database...
call npx prisma generate
call npx prisma db push
call npx tsx src/scripts/seed.ts

REM Done
echo.
echo [5/5] Setup complete!
echo.
echo ========================================
echo   INCOSEARCH Backend Ready!
echo ========================================
echo.
echo To start the development server:
echo   npm run dev
echo.
echo Default credentials:
echo   Admin: admin / admin123
echo   User:  user / user123
echo.
pause
