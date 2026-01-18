# Script para iniciar servicios de Diócesis
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Iniciando Servicios - Diócesis" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar directorios
if (-not (Test-Path "server") -or -not (Test-Path "client")) {
    Write-Host "Error: Ejecuta este script desde la raíz del proyecto" -ForegroundColor Red
    exit 1
}

# Iniciar servidor backend en puerto 5001
Write-Host "Iniciando Backend (puerto 5001)..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\server
    $env:PORT = "5001"
    npm start
}

# Esperar un momento
Start-Sleep -Seconds 3

# Iniciar cliente frontend en puerto 3001
Write-Host "Iniciando Frontend (puerto 3001)..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\client
    $env:PORT = "3001"
    npm start
}

Write-Host ""
Write-Host "Servicios iniciados en segundo plano!" -ForegroundColor Green
Write-Host "- Backend: http://localhost:5001" -ForegroundColor Cyan
Write-Host "- Frontend: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para ver los logs, ejecuta:" -ForegroundColor Gray
Write-Host "  Receive-Job -Id $($backendJob.Id)" -ForegroundColor Gray
Write-Host "  Receive-Job -Id $($frontendJob.Id)" -ForegroundColor Gray
Write-Host ""
Write-Host "Presiona Ctrl+C para detener los servicios" -ForegroundColor Yellow

# Mantener el script corriendo
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "`nDeteniendo servicios..." -ForegroundColor Yellow
    Stop-Job -Id $backendJob.Id, $frontendJob.Id
    Remove-Job -Id $backendJob.Id, $frontendJob.Id
}





