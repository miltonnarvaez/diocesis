# Guía para Configurar MySQL y Conectar el Backend

## Paso 1: Instalar MySQL

### Opción A: Instalador de MySQL (Recomendado)

1. **Descargar MySQL Installer:**
   - Ve a: https://dev.mysql.com/downloads/installer/
   - Descarga "MySQL Installer for Windows"
   - Elige la versión "mysql-installer-community" (gratuita)

2. **Instalar MySQL:**
   - Ejecuta el instalador
   - Selecciona "Developer Default" o "Server only"
   - Durante la instalación:
     - **Configuración del servidor**: Elige "Standalone MySQL Server"
     - **Tipo de configuración**: Elige "Development Computer"
     - **Autenticación**: Elige "Use Strong Password Encryption"
     - **Contraseña root**: Crea una contraseña y **GUÁRDALA** (la necesitarás)
     - **Servicio Windows**: Asegúrate de que "Start MySQL Server at System Startup" esté marcado

3. **Verificar instalación:**
   - Abre PowerShell o CMD
   - Ejecuta: `mysql --version`
   - Si no funciona, agrega MySQL al PATH:
     - Busca "Variables de entorno" en Windows
     - Edita la variable "Path"
     - Agrega: `C:\Program Files\MySQL\MySQL Server 8.0\bin` (o la ruta donde instalaste MySQL)

### Opción B: XAMPP (Más fácil, incluye MySQL)

1. **Descargar XAMPP:**
   - Ve a: https://www.apachefriends.org/
   - Descarga XAMPP para Windows
   - Instala normalmente

2. **Iniciar MySQL:**
   - Abre el Panel de Control de XAMPP
   - Haz clic en "Start" junto a MySQL
   - La contraseña por defecto del root suele estar vacía ("")

## Paso 2: Configurar el archivo .env

El archivo `.env` ya está creado en `server/.env`. Verifica o edita estos valores:

```env
# Configuración del servidor
PORT=5000
NODE_ENV=development

# Configuración de MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=TU_CONTRASEÑA_AQUI  # Cambia esto por tu contraseña de MySQL
DB_NAME=concejo_guachucal

# Configuración de JWT
JWT_SECRET=concejo_guachucal_secret_key_cambiar_en_produccion
JWT_EXPIRE=7d

# Configuración de archivos
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

**Importante:** 
- Si usas XAMPP y no configuraste contraseña, deja `DB_PASSWORD=` vacío
- Si instalaste MySQL con contraseña, ponla en `DB_PASSWORD=`

## Paso 3: Crear la Base de Datos

### Método 1: Usando la línea de comandos (Recomendado)

1. **Abrir MySQL Command Line Client:**
   - Busca "MySQL Command Line Client" en el menú de Windows
   - Ingresa tu contraseña cuando te la pida

2. **Ejecutar el script SQL:**
   ```sql
   source C:\Users\Milton Narvaez\Documents\cursor\concejo\database\schema.sql;
   ```
   
   O copia y pega el contenido de `database/schema.sql` directamente en la consola de MySQL.

### Método 2: Usando MySQL Workbench (Más visual)

1. **Descargar MySQL Workbench:**
   - Si instalaste MySQL Installer, ya viene incluido
   - Si no, descárgalo de: https://dev.mysql.com/downloads/workbench/

2. **Conectar al servidor:**
   - Abre MySQL Workbench
   - Conecta a "Local instance MySQL" (o crea una nueva conexión)
   - Usa tu usuario root y contraseña

3. **Ejecutar el script:**
   - Abre el archivo `database/schema.sql`
   - Copia todo el contenido
   - Pégalo en MySQL Workbench
   - Ejecuta el script (botón ⚡ o F5)

### Método 3: Usando phpMyAdmin (Si usas XAMPP)

1. **Abrir phpMyAdmin:**
   - Ve a: http://localhost/phpmyadmin
   - Usuario: `root`
   - Contraseña: (vacía si no la configuraste)

2. **Ejecutar el script:**
   - Haz clic en la pestaña "SQL"
   - Abre el archivo `database/schema.sql` en un editor de texto
   - Copia todo el contenido
   - Pégalo en el área de SQL
   - Haz clic en "Continuar"

## Paso 4: Verificar la Conexión

1. **Verificar que MySQL esté corriendo:**
   - Abre el "Administrador de tareas" de Windows
   - Busca el proceso "mysqld.exe" o "MySQL"
   - Si no está, inícialo desde:
     - XAMPP: Panel de Control → Start MySQL
     - MySQL Installer: Servicios de Windows → MySQL80 → Iniciar

2. **Probar la conexión:**
   ```bash
   mysql -u root -p
   ```
   - Ingresa tu contraseña
   - Si conecta, escribe: `SHOW DATABASES;`
   - Deberías ver `concejo_guachucal` en la lista
   - Escribe `exit;` para salir

## Paso 5: Iniciar el Backend

1. **Abrir terminal en la carpeta del proyecto:**
   ```powershell
   cd C:\Users\Milton Narvaez\Documents\cursor\concejo\server
   ```

2. **Instalar dependencias (si no lo has hecho):**
   ```powershell
   npm install
   ```

3. **Iniciar el servidor:**
   ```powershell
   npm run dev
   ```

4. **Verificar que funciona:**
   - Deberías ver: `✅ Conectado a MySQL`
   - Y: `🚀 Servidor corriendo en http://localhost:5000`

## Solución de Problemas

### Error: "ECONNREFUSED"
- **Causa**: MySQL no está corriendo
- **Solución**: Inicia el servicio MySQL (XAMPP o Servicios de Windows)

### Error: "Access denied for user 'root'@'localhost'"
- **Causa**: Contraseña incorrecta en `.env`
- **Solución**: Verifica `DB_PASSWORD` en `server/.env`

### Error: "Unknown database 'concejo_guachucal'"
- **Causa**: La base de datos no existe
- **Solución**: Ejecuta el script `database/schema.sql`

### MySQL no se encuentra en el PATH
- **Solución**: Agrega la ruta de MySQL al PATH de Windows:
  - `C:\Program Files\MySQL\MySQL Server 8.0\bin`
  - O usa la ruta completa: `"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"`

## Credenciales por Defecto

Después de ejecutar `schema.sql`, puedes iniciar sesión en el panel de administración:

- **URL**: http://localhost:3000/admin
- **Email**: admin@concejo.guachucal.gov.co
- **Contraseña**: admin123

⚠️ **IMPORTANTE**: Cambia esta contraseña después del primer inicio de sesión.

## Siguiente Paso

Una vez que el backend esté corriendo correctamente, el frontend podrá conectarse y mostrar datos reales de la base de datos.















