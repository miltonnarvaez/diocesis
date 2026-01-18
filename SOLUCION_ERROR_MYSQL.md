# Solución: Error de Conexión a MySQL (ECONNREFUSED)

## 🔍 Problema Identificado

Los logs muestran:
```
Error: connect ECONNREFUSED ::1:3306
```

**Causa**: El servidor Node.js está intentando conectarse a MySQL usando IPv6 (`::1`) pero MySQL no está escuchando en esa interfaz o no está corriendo.

## 🛠️ Soluciones Paso a Paso

### Solución 1: Verificar que MySQL está Corriendo

```bash
# Verificar estado de MySQL
sudo systemctl status mysql

# Si no está corriendo, iniciarlo
sudo systemctl start mysql
sudo systemctl enable mysql  # Para que inicie automáticamente
```

### Solución 2: Verificar en qué Puerto/Interfaz está Escuchando MySQL

```bash
# Verificar qué está escuchando en el puerto 3306
sudo netstat -tulpn | grep 3306
# o
sudo ss -tulpn | grep 3306

# Deberías ver algo como:
# tcp  0  0 127.0.0.1:3306  0.0.0.0:*  LISTEN  12345/mysqld
# o
# tcp  0  0 0.0.0.0:3306    0.0.0.0:*  LISTEN  12345/mysqld
```

**Si no ves nada**, MySQL no está corriendo o no está escuchando en el puerto 3306.

### Solución 3: Verificar la Configuración de la Base de Datos

```bash
cd /var/www/concejoguachucal/server
cat .env | grep DB_
```

**Debería tener:**
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=concejo_guachucal
```

### Solución 4: Forzar IPv4 en la Configuración

El problema es que Node.js está intentando usar IPv6 (`::1`). Necesitamos forzar IPv4 (`127.0.0.1`).

**Opción A: Cambiar DB_HOST en .env**
```bash
cd /var/www/concejoguachual/server
nano .env

# Cambiar:
DB_HOST=127.0.0.1
# En lugar de:
# DB_HOST=localhost
```

**Opción B: Verificar y modificar `server/config/database.js`**

Si el archivo usa `localhost`, cambiarlo a `127.0.0.1` o agregar configuración explícita.

### Solución 5: Probar Conexión Manual a MySQL

```bash
# Probar conexión desde la línea de comandos
mysql -u root -p -h 127.0.0.1

# Si funciona, MySQL está corriendo
# Si no funciona, hay un problema con MySQL o las credenciales
```

### Solución 6: Verificar que MySQL Acepta Conexiones

```bash
# Verificar configuración de bind-address en MySQL
sudo cat /etc/mysql/mysql.conf.d/mysqld.cnf | grep bind-address

# Debería ser:
# bind-address = 127.0.0.1
# o
# bind-address = 0.0.0.0
```

**Si está en `127.0.0.1`**, MySQL solo acepta conexiones IPv4, lo cual está bien.
**Si está en `0.0.0.0`**, MySQL acepta conexiones de todas las interfaces.

### Solución 7: Reiniciar MySQL y el Backend

```bash
# Reiniciar MySQL
sudo systemctl restart mysql

# Verificar que está corriendo
sudo systemctl status mysql

# Reiniciar el backend
cd /var/www/concejoguachucal/server
pm2 restart concejo-backend

# Ver logs para confirmar que se conectó
pm2 logs concejo-backend --lines 20
```

## 📝 Script de Verificación Completo

```bash
#!/bin/bash
echo "=========================================="
echo "  Verificación de MySQL"
echo "=========================================="

echo -e "\n1. Estado de MySQL:"
sudo systemctl status mysql --no-pager -l | head -10

echo -e "\n2. Puerto 3306:"
sudo netstat -tulpn | grep 3306 || echo "❌ MySQL no está escuchando en 3306"

echo -e "\n3. Configuración bind-address:"
sudo grep -E "bind-address|port" /etc/mysql/mysql.conf.d/mysqld.cnf 2>/dev/null || \
sudo grep -E "bind-address|port" /etc/mysql/my.cnf 2>/dev/null || \
echo "⚠️  No se encontró configuración"

echo -e "\n4. Variables de entorno DB:"
cd /var/www/concejoguachual/server 2>/dev/null
if [ -f ".env" ]; then
    grep "^DB_" .env | sed 's/PASSWORD=.*/PASSWORD=***/'
else
    echo "⚠️  .env no encontrado"
fi

echo -e "\n5. Test de conexión manual:"
mysql -u root -p -h 127.0.0.1 -e "SELECT 1;" 2>&1 | head -3 || echo "❌ No se pudo conectar"

echo -e "\n=========================================="
```

## 🔧 Cambios Necesarios en el Código

Si el problema persiste, necesitamos verificar `server/config/database.js` y asegurarnos de que use `127.0.0.1` en lugar de `localhost` cuando esté en producción, o configurar el pool de conexiones para preferir IPv4.

## ⚠️ Errores Comunes

### Error: "ECONNREFUSED ::1:3306"
**Causa**: Node.js intenta IPv6 pero MySQL solo escucha IPv4
**Solución**: Cambiar `DB_HOST=localhost` a `DB_HOST=127.0.0.1` en `.env`

### Error: "Can't connect to MySQL server"
**Causa**: MySQL no está corriendo
**Solución**: `sudo systemctl start mysql`

### Error: "Access denied for user"
**Causa**: Credenciales incorrectas
**Solución**: Verificar usuario y contraseña en `.env`
