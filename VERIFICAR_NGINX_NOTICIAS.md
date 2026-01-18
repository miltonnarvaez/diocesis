# Verificar Nginx para Noticias

## ✅ Estado Actual
- Backend funcionando: ✅
- Endpoint local funcionando: ✅ (devuelve `[]`)
- Conexión a BD: ✅

## 🔍 Próximos Pasos

### 1. Verificar Configuración de Nginx

```bash
sudo grep -A 10 "location.*concejoguachucal/api" /etc/nginx/sites-available/milton
```

**Debería mostrar:**
```nginx
location /concejoguachucal/api {
    rewrite ^/concejoguachucal/api/(.*) /api/$1 break;
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### 2. Probar el Endpoint a través de Nginx

```bash
# Desde el servidor, probar a través de Nginx
curl http://localhost/concejoguachucal/api/noticias
# o
curl -H "Host: camsoft.com.co" http://localhost/concejoguachucal/api/noticias
```

### 3. Verificar que Nginx está Corriendo

```bash
sudo systemctl status nginx
```

### 4. Verificar Logs de Nginx

```bash
sudo tail -20 /var/log/nginx/error.log
```

### 5. Verificar si hay Noticias en la BD

```bash
mysql -u concejo_user -pConcejo_2025*+- concejo_guachucal -e "SELECT COUNT(*) as total FROM noticias; SELECT COUNT(*) as publicadas FROM noticias WHERE publicada = TRUE;"
```

## 🛠️ Si el Problema es Nginx

Si el endpoint no funciona a través de Nginx:

1. **Verificar y recargar Nginx:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

2. **Reiniciar Nginx si es necesario:**
   ```bash
   sudo systemctl restart nginx
   ```

## 📝 Nota

El endpoint devuelve `[]` porque probablemente no hay noticias en la base de datos. Esto es normal y correcto. La página debería mostrar "No se encontraron noticias" en lugar de un error de conexión.
