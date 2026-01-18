# Guía: Desinstalar XAMPP de Forma Segura

## ⚠️ IMPORTANTE: Antes de Desinstalar

XAMPP contiene:
- **MySQL**: Base de datos (tus datos están aquí)
- **Apache**: Servidor web (no se usa en este proyecto Node.js)
- **phpMyAdmin**: Interfaz web para MySQL
- **PHP**: No se usa en este proyecto

**Si desinstalas XAMPP, perderás:**
- ✅ Todos los datos de la base de datos `diocesis`
- ✅ Todos los usuarios creados
- ✅ Todas las tablas y registros

## 📋 Paso 1: Hacer Backup de la Base de Datos

### Opción A: Backup desde phpMyAdmin (Más Fácil)

1. **Abrir phpMyAdmin:**
   - Ve a: `http://localhost/phpmyadmin`

2. **Exportar la base de datos:**
   - Selecciona la base de datos `diocesis` en el panel izquierdo
   - Haz clic en la pestaña "Exportar"
   - Método: "Rápido"
   - Formato: "SQL"
   - Haz clic en "Continuar"
   - Guarda el archivo como `diocesis_backup.sql`

### Opción B: Backup desde la línea de comandos

```powershell
# Navegar a la carpeta de MySQL de XAMPP
cd C:\xampp\mysql\bin

# Crear backup
.\mysqldump.exe -u root diocesis > "C:\Users\Milton Narvaez\Documents\cursor\diocesis\database\diocesis_backup.sql"
```

### Opción C: Backup completo de todas las bases de datos

```powershell
cd C:\xampp\mysql\bin
.\mysqldump.exe -u root --all-databases > "C:\Users\Milton Narvaez\Documents\cursor\diocesis\database\all_databases_backup.sql"
```

## 📋 Paso 2: Verificar que el Backup se Creó Correctamente

1. Verifica que el archivo existe y tiene contenido
2. Abre el archivo y verifica que contiene comandos SQL (CREATE TABLE, INSERT, etc.)

## 📋 Paso 3: Instalar MySQL Standalone (Alternativa a XAMPP)

### Opción A: MySQL Community Server (Recomendado)

1. **Descargar MySQL:**
   - Ve a: https://dev.mysql.com/downloads/installer/
   - Descarga "MySQL Installer for Windows"
   - Elige "mysql-installer-community" (gratuita)

2. **Instalar MySQL:**
   - Ejecuta el instalador
   - Selecciona "Server only" o "Developer Default"
   - Durante la instalación:
     - **Tipo de configuración**: "Development Computer"
     - **Autenticación**: "Use Strong Password Encryption"
     - **Contraseña root**: Crea una contraseña y **GUÁRDALA**
     - **Servicio Windows**: Marca "Start MySQL Server at System Startup"

3. **Verificar instalación:**
   ```powershell
   mysql --version
   ```

### Opción B: MariaDB (Alternativa ligera)

1. **Descargar MariaDB:**
   - Ve a: https://mariadb.org/download/
   - Descarga el instalador para Windows

2. **Instalar MariaDB:**
   - Similar a MySQL, pero más ligero
   - Compatible con MySQL

## 📋 Paso 4: Restaurar la Base de Datos

### Opción A: Restaurar desde phpMyAdmin

1. Abre phpMyAdmin (si instalaste MySQL con XAMPP, o usa otra herramienta como MySQL Workbench)
2. Crea la base de datos `diocesis`:
   ```sql
   CREATE DATABASE diocesis CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Selecciona la base de datos `diocesis`
4. Ve a la pestaña "Importar"
5. Selecciona el archivo `diocesis_backup.sql`
6. Haz clic en "Continuar"

### Opción B: Restaurar desde la línea de comandos

```powershell
# Si instalaste MySQL standalone, la ruta será diferente
cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"

# Restaurar la base de datos
.\mysql.exe -u root -p diocesis < "C:\Users\Milton Narvaez\Documents\cursor\diocesis\database\diocesis_backup.sql"
```

## 📋 Paso 5: Actualizar la Configuración del Proyecto

### Actualizar `server/.env`

Abre `server/.env` y verifica/actualiza:

```env
# Configuración de MySQL
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=TU_NUEVA_CONTRASEÑA_DE_MYSQL  # Si cambiaste la contraseña
DB_NAME=diocesis
```

**Nota:** Si instalaste MySQL standalone y configuraste una contraseña para root, actualiza `DB_PASSWORD` en el `.env`.

## 📋 Paso 6: Verificar que Todo Funciona

1. **Iniciar el servidor:**
   ```powershell
   cd "C:\Users\Milton Narvaez\Documents\cursor\diocesis\server"
   npm start
   ```

2. **Verificar la conexión:**
   - Deberías ver: `✅ Conectado a MySQL`
   - Si ves errores, verifica las credenciales en `server/.env`

## 📋 Paso 7: Desinstalar XAMPP

Una vez que hayas verificado que todo funciona con MySQL standalone:

1. **Cerrar XAMPP:**
   - Abre el Panel de Control de XAMPP
   - Detén todos los servicios (MySQL, Apache)
   - Cierra el panel

2. **Desinstalar XAMPP:**
   - Ve a "Configuración" → "Aplicaciones" → "Aplicaciones y características"
   - Busca "XAMPP"
   - Haz clic en "Desinstalar"

3. **Eliminar carpetas residuales (opcional):**
   - `C:\xampp` (si existe)
   - `C:\Users\Milton Narvaez\AppData\Roaming\XAMPP` (si existe)

## ✅ Ventajas de Desinstalar XAMPP

1. **Menos recursos:** Solo MySQL en lugar de MySQL + Apache + PHP
2. **Más control:** MySQL como servicio de Windows
3. **Mejor rendimiento:** MySQL optimizado para producción
4. **Menos conflictos:** No hay conflictos de puertos con Apache

## ⚠️ Desventajas

1. **Sin phpMyAdmin:** Necesitarás otra herramienta para administrar MySQL:
   - **MySQL Workbench** (recomendado): https://dev.mysql.com/downloads/workbench/
   - **DBeaver** (gratuito): https://dbeaver.io/
   - **HeidiSQL** (gratuito): https://www.heidisql.com/

2. **Configuración manual:** Necesitas configurar MySQL manualmente

## 🔄 Alternativa: Mantener XAMPP pero Solo Usar MySQL

Si prefieres mantener XAMPP pero no usar Apache:

1. **Desactivar Apache:**
   - En el Panel de Control de XAMPP, simplemente no inicies Apache
   - Solo inicia MySQL

2. **Ventajas:**
   - Mantienes phpMyAdmin
   - No necesitas reinstalar nada
   - Puedes usar Apache más adelante si lo necesitas

## 📝 Resumen de Comandos Útiles

### Verificar que MySQL está corriendo
```powershell
Get-Service | Where-Object {$_.Name -like "*mysql*"}
```

### Iniciar MySQL manualmente (si instalaste standalone)
```powershell
Start-Service MySQL80
```

### Detener MySQL
```powershell
Stop-Service MySQL80
```

### Conectarse a MySQL
```powershell
mysql -u root -p
```

## 🆘 Si Algo Sale Mal

1. **Restaurar desde el backup:**
   ```powershell
   mysql -u root -p diocesis < diocesis_backup.sql
   ```

2. **Reinstalar XAMPP:**
   - Si prefieres volver a XAMPP, simplemente reinstálalo
   - Restaura el backup desde phpMyAdmin

3. **Verificar logs:**
   - MySQL logs: `C:\ProgramData\MySQL\MySQL Server 8.0\Data\*.err`
   - O en XAMPP: `C:\xampp\mysql\data\*.err`
