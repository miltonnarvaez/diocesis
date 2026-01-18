@echo off
echo Iniciando servicios del Concejo Municipal de Guachucal...
echo.
echo Iniciando servidor backend...
start "Servidor Backend" cmd /k "cd server && set PORT=5001 && npm start"
timeout /t 3 /nobreak >nul
echo.
echo Iniciando cliente frontend...
start "Cliente Frontend" cmd /k "cd client && set PORT=3001 && npm start"
echo.
echo Servicios iniciados. Verifique las ventanas que se abrieron.
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3001
pause












