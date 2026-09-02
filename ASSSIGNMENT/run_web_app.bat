@echo off
title Smart Campus Bike Sharing - Web App
cd /d "%~dp0"
echo ================================================
echo SMART CAMPUS BIKE SHARING MANAGEMENT WEB APP
echo ================================================
echo.
where g++ >nul 2>nul
if errorlevel 1 (
  echo ERROR: g++ was not found in PATH.
  echo Please install MinGW/GCC and reopen VS Code.
  pause
  exit /b 1
)
echo Compiling C++ web server...
g++ -std=c++11 server\main.cpp -o bike_web_server.exe -lws2_32
if errorlevel 1 (
  echo.
  echo COMPILATION FAILED.
  pause
  exit /b 1
)
echo.
echo Compilation successful.
echo Starting server at http://localhost:8080
echo Keep this window open while using the web app.
echo.
start "" "http://localhost:8080"
bike_web_server.exe
pause
