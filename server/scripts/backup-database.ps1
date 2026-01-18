# Script PowerShell para hacer backup de la base de datos MySQL
# Uso: .\backup-database.ps1

$XAMPP_MYSQL_PATH = "C:\xampp\mysql\bin"
$BACKUP_DIR = "C:\Users\Milton Narvaez\Documents\cursor\diocesis\database\backups"
$DB_NAME = "diocesis"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = "$BACKUP_DIR\diocesis_backup_$TIMESTAMP.sql"

# Crear directorio de backups si no existe
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR -Force | Out-Null
    Write-Host "✅ Directorio de backups creado: $BACKUP_DIR" -ForegroundColor Green
}

# Verificar que MySQL está disponible
if (-not (Test-Path "$XAMPP_MYSQL_PATH\mysqldump.exe")) {
    Write-Host "❌ Error: No se encontró mysqldump.exe en $XAMPP_MYSQL_PATH" -ForegroundColor Red
    Write-Host "   Verifica que XAMPP esté instalado o ajusta la ruta en el script." -ForegroundColor Yellow
    exit 1
}

Write-Host "🔄 Creando backup de la base de datos '$DB_NAME'..." -ForegroundColor Cyan
Write-Host "   Destino: $BACKUP_FILE" -ForegroundColor Gray

# Crear el backup
& "$XAMPP_MYSQL_PATH\mysqldump.exe" -u root $DB_NAME > $BACKUP_FILE 2>&1

if ($LASTEXITCODE -eq 0) {
    $fileSize = (Get-Item $BACKUP_FILE).Length / 1KB
    Write-Host "✅ Backup creado exitosamente!" -ForegroundColor Green
    Write-Host "   Archivo: $BACKUP_FILE" -ForegroundColor Gray
    Write-Host "   Tamaño: $([math]::Round($fileSize, 2)) KB" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📋 Para restaurar este backup:" -ForegroundColor Cyan
    Write-Host "   mysql -u root $DB_NAME < `"$BACKUP_FILE`"" -ForegroundColor Yellow
} else {
    Write-Host "❌ Error al crear el backup" -ForegroundColor Red
    Write-Host "   Verifica que MySQL esté corriendo y que la base de datos exista." -ForegroundColor Yellow
    exit 1
}
