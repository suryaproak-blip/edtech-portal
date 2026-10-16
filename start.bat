@echo off
title EdTech Portal (MongoDB)
echo ========================================================
echo   Launching EdTech Portal with MongoDB...
echo ========================================================

cd /d "%~dp0server"

:: Open the browser in 2 seconds once server initializes
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:5000"

:: Start the Express + MongoDB server
node server.js
pause
