@echo off
title Waveme IoT Server
color 0A
echo ========================================
echo   Waveme IoT Server Launcher
echo ========================================
echo.

:: Kill any existing instances
echo [1/3] Stopping any existing services...
taskkill /F /IM mosquitto.exe >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 "') do taskkill /F /PID %%a >nul 2>&1
timeout /t 1 /nobreak >nul

:: Start Mosquitto in a new window
echo [2/3] Starting Mosquitto MQTT Broker (ports 1883 + 9001)...
start "Mosquitto Broker" cmd /k "cd /d "%~dp0" && "C:\Program Files\mosquitto\mosquitto.exe" -v -c mosquitto_waveme.conf"
timeout /t 2 /nobreak >nul

:: Start relay server in a new window
echo [3/3] Starting HTTP-to-MQTT Relay Server (port 3000)...
start "Waveme Relay Server" cmd /k "cd /d "%~dp0" && node mqtt_relay_server.js"

echo.
echo ========================================
echo   All services started!
echo.
echo   MQTT Broker  : localhost:1883
echo   WebSockets   : localhost:9001
echo   Relay Server : http://192.168.1.187:3000
echo.
echo   Close the two new windows to stop.
echo ========================================
echo.
pause
