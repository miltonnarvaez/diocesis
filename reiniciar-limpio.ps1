# Script para reiniciar servicios limpiando caché
Write-Host "Deteniendo servicios..." -ForegroundColor Yellow

# Detener procesos de Node
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "Limpiando cache del cliente..." -ForegroundColor Yellow
cd client
if (Test-Path ".cache") { Remove-Item -Recurse -Force .cache }
if (Test-Path "build") { Remove-Item -Recurse -Force build }
if (Test-Path "node_modules/.cache") { Remove-Item -Recurse -Force node_modules/.cache }

Write-Host "Iniciando servicios..." -ForegroundColor Green
cd ..

# Iniciar servidor
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm start"

# Esperar 3 segundos
Start-Sleep -Seconds 3

# Iniciar cliente
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; npm start"

Write-Host "Servicios iniciados. Espera a que abra el navegador y presiona Ctrl+Shift+R para limpiar cache." -ForegroundColor Green
Write-Host "O abre el navegador en modo incógnito: Ctrl+Shift+N" -ForegroundColor Cyan
