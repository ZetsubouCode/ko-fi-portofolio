@echo off
setlocal

cd /d "%~dp0"

set "PORT=%~1"
if "%PORT%"=="" set "PORT=4173"
set "BASE_PATH=/ko-fi-portofolio/"

where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Install Node.js first.
  exit /b 1
)

if not exist "node_modules\" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 exit /b 1
)

echo Building production site...
call npm run build
if errorlevel 1 exit /b 1

echo.
echo Preview server will run at:
echo http://127.0.0.1:%PORT%%BASE_PATH%
echo.
echo Press Ctrl+C in this window to stop the server.
echo.

start "" "http://127.0.0.1:%PORT%%BASE_PATH%"
call npm run preview -- --host 127.0.0.1 --port %PORT% --strictPort
