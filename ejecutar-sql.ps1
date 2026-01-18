# Script para ejecutar archivos SQL en MySQL
param(
    [string]$archivoSQL,
    [string]$baseDatos = "diocesis"
)

$mysqlPath = "C:\xampp\mysql\bin\mysql.exe"
$usuario = "root"
$password = ""

Write-Host "Ejecutando: $archivoSQL" -ForegroundColor Green
Write-Host "Base de datos: $baseDatos" -ForegroundColor Green

if (Test-Path $archivoSQL) {
    $contenido = Get-Content $archivoSQL -Raw -Encoding UTF8
    
    # Remover CREATE DATABASE y USE si existen (ya estamos especificando la BD)
    $contenido = $contenido -replace "CREATE DATABASE IF NOT EXISTS.*?;", ""
    $contenido = $contenido -replace "USE\s+\w+;", ""
    
    # Guardar en archivo temporal
    $tempFile = [System.IO.Path]::GetTempFileName() + ".sql"
    $contenido | Out-File -FilePath $tempFile -Encoding UTF8 -NoNewline
    
    # Ejecutar
    if ($password) {
        & $mysqlPath -h 127.0.0.1 -u $usuario -p$password $baseDatos -e "source $tempFile"
    } else {
        & $mysqlPath -h 127.0.0.1 -u $usuario $baseDatos -e "source $tempFile"
    }
    
    Remove-Item $tempFile
    Write-Host "✅ Completado!" -ForegroundColor Green
} else {
    Write-Host "❌ Archivo no encontrado: $archivoSQL" -ForegroundColor Red
}







