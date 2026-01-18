# Comandos para Solucionar Error de MySQL

## 🔍 Problema
El servidor está intentando conectarse a MySQL usando IPv6 (`::1`) pero MySQL no responde.

## ✅ Solución Rápida

### 1. Verificar que MySQL está Corriendo

```bash
sudo systemctl status mysql
```

**Si no está corriendo:**
```bash
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 2. Verificar Puerto 3306

```bash
sudo netstat -tulpn | grep 3306
```

**Deberías ver algo como:**
```
tcp  0  0 127.0.0.1:3306  0.0.0.0:*  LISTEN  12345/mysqld
```

### 3. Cambiar DB_HOST en .env (RECOMENDADO)

```bash
cd /var/www/concejoguachual/server
nano .env
```

**Cambiar:**
```
DB_HOST=127.0.0.1
```

**En lugar de:**
```
DB_HOST=localhost
```

**Guardar y salir:** `Ctrl+X`, luego `Y`, luego `Enter`

### 4. Reiniciar el Backend

```bash
pm2 restart concejo-backend
pm2 logs concejo-backend --lines 20
```

**Deberías ver:**
```
✅ Conectado a MySQL
   Base de datos: concejo_guachucal
🚀 Servidor corriendo en http://localhost:5000
```

## 🔧 Alternativa: Si no puedes editar .env

El código ya fue modificado para usar `127.0.0.1` automáticamente cuando `DB_HOST=localhost`. Solo necesitas reiniciar:

```bash
cd /var/www/concejoguachual/server
pm2 restart concejo-backend
pm2 logs concejo-backend --lines 20
```

## 📋 Verificación Completa

```bash
# 1. MySQL corriendo
sudo systemctl status mysql

# 2. Puerto 3306 activo
sudo netstat -tulpn | grep 3306

# 3. Test de conexión manual
mysql -u root -p -h 127.0.0.1 -e "SELECT 1;"

# 4. Reiniciar backend
pm2 restart concejo-backend

# 5. Ver logs
pm2 logs concejo-backend --lines 30
```

## ⚠️ Si el Problema Persiste

1. **Verificar credenciales en .env:**
```bash
cd /var/www/concejoguachual/server
cat .env | grep DB_
```

2. **Verificar que la base de datos existe:**
   ```bash
   mysql -u root -p -h 127.0.0.1 -e "SHOW DATABASES LIKE 'concejo_guachucal';"
   ```

3. **Ver logs de MySQL:**
   ```bash
   sudo tail -f /var/log/mysql/error.log
   ```
