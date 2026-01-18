# Solución: Error MySQL Plugin Table

## Problema
MySQL no puede iniciar porque la tabla `mysql.plugin` está corrupta.

## Solución Rápida (Ya eliminamos los archivos corruptos)

### Paso 1: Iniciar MySQL en modo seguro

Abre PowerShell como Administrador y ejecuta:

```powershell
cd C:\xampp\mysql\bin
.\mysqld.exe --console --skip-grant-tables
```

Deja esta ventana abierta (MySQL estará corriendo en modo seguro).

### Paso 2: En otra terminal, conectarte y recrear la tabla

Abre otra terminal PowerShell y ejecuta:

```powershell
cd C:\xampp\mysql\bin
.\mysql.exe -u root
```

Dentro de MySQL, ejecuta estos comandos:

```sql
USE mysql;

CREATE TABLE IF NOT EXISTS plugin (
  name VARCHAR(64) NOT NULL DEFAULT '',
  dl VARCHAR(128) NOT NULL DEFAULT '',
  PRIMARY KEY (name)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='MySQL plugins';

exit;
```

### Paso 3: Detener MySQL en modo seguro

En la primera terminal donde está corriendo `mysqld.exe`, presiona `Ctrl+C` para detenerlo.

### Paso 4: Iniciar MySQL normalmente

Abre XAMPP y haz clic en "Start" junto a MySQL. Debería iniciar correctamente ahora.

## Alternativa: Si la solución anterior no funciona

### Opción B: Recrear toda la base de datos del sistema

1. **Haz backup de tu base de datos:**
```powershell
Copy-Item "C:\xampp\mysql\data\diocesis" "C:\xampp\mysql\data\diocesis_backup" -Recurse
```

2. **Elimina la base de datos mysql corrupta:**
```powershell
Remove-Item "C:\xampp\mysql\data\mysql" -Recurse -Force
```

3. **Inicia MySQL desde XAMPP** (recreará las tablas del sistema automáticamente)

4. **Restaura tu base de datos:**
```powershell
cd C:\Users\Milton Narvaez\Documents\cursor\diocesis
cd database
# Ejecuta los scripts SQL necesarios
```

## Verificación

Después de aplicar la solución, verifica que MySQL esté corriendo:

```powershell
netstat -ano | findstr ":3306"
```

Si ves una línea con `:3306`, MySQL está corriendo correctamente.





