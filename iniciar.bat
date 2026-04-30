@echo off
title BelaHub - Iniciando...
echo.
echo  ================================================
echo   BelaHub - Iniciando servidores locais
echo  ================================================
echo.

echo  [1/2] Iniciando Backend (porta 5000)...
start "BelaHub Backend" cmd /k "cd /d "%~dp0backend" && echo BelaHub Backend && node server.js"

timeout /t 3 /nobreak > nul

echo  [2/2] Iniciando Frontend (porta 3000)...
start "BelaHub Frontend" cmd /k "cd /d "%~dp0frontend" && echo BelaHub Frontend && npm start"

echo.
echo  Aguarde alguns segundos...
echo  Frontend: http://localhost:3000
echo  Backend:  http://localhost:5000
echo.
timeout /t 5 /nobreak > nul
