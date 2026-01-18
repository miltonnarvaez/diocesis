# Script para verificar el endpoint del repositorio
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Verificando Endpoint del Repositorio" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si el servidor está corriendo
Write-Host "Probando endpoint: http://localhost:5000/api/repositorio/categorias" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/repositorio/categorias" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Endpoint disponible!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Respuesta:" -ForegroundColor Cyan
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Error al conectar con el servidor" -ForegroundColor Red
    Write-Host ""
    Write-Host "Detalles:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Posibles soluciones:" -ForegroundColor Yellow
    Write-Host "1. Verifica que el servidor esté corriendo en http://localhost:5000" -ForegroundColor White
    Write-Host "2. Reinicia el servidor:" -ForegroundColor White
    Write-Host "   cd server" -ForegroundColor Gray
    Write-Host "   npm start" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. O usa el script de inicio completo:" -ForegroundColor White
    Write-Host "   .\iniciar-servicios.ps1" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Presione cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
