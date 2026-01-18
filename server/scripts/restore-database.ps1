# Script PowerShell para restaurar la base de datos MySQL desde un backup
# Uso: .\restore-database.ps1 -BackupFile "ruta\al\backup.sql"

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile
)

$XAMPP_MYSQL_PATH = "C:\xampp\mysql\bin"
$MYSQL_STANDALONE_PATH = "C:\Program Files\MySQL\MySQL Server 8.0\bin"
$DB_NAME = "diocesis"

# Determinar qué MySQL usar
$MYSQL_PATH = $null
if (Test-Path "$XAMPP_MYSQL_PATH\mysql.exe") {
    $MYSQL_PATH = $XAMPP_MYSQL_PATH
    Write-Host "📦 Usando MySQL de XAMPP" -ForegroundColor Cyan
} elseif (Test-Path "$MYSQL_STANDALONE_PATH\mysql.exe") {
    $MYSQL_PATH = $MYSQL_STANDALONE_PATH
    Write-Host "📦 Usando MySQL Standalone" -ForegroundColor Cyan
} else {
    Write-Host "❌ Error: No se encontró MySQL" -ForegroundColor Red
    Write-Host "   Verifica que XAMPP o MySQL esté instalado." -ForegroundColor Yellow
    exit 1
}

# Verificar que el archivo de backup existe
if (-not (Test-Path $BackupFile)) {
    Write-Host "❌ Error: El archivo de backup no existe: $BackupFile" -ForegroundColor Red
    exit 1
}

Write-Host "🔄 Restaurando base de datos '$DB_NAME' desde backup..." -ForegroundColor Cyan
Write-Host "   Archivo: $BackupFile" -ForegroundColor Gray

# Restaurar el backup
Get-Content $BackupFile | & "$MYSQL_PATH\mysql.exe" -u root $DB_NAME

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Base de datos restaurada exitosamente!" -ForegroundColor Green
} else {
    Write-Host "❌ Error al restaurar el backup" -ForegroundColor Red
    Write-Host "   Verifica que MySQL esté corriendo y que la base de datos exista." -ForegroundColor Yellow
    exit 1
}
