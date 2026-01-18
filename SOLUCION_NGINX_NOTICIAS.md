# Solución: Nginx No Responde Correctamente

## 🔍 Problema Identificado

- Backend funcionando: ✅
- Endpoint local funcionando: ✅
- Nginx devuelve 404 o 301 cuando se prueba localmente

## ✅ Solución

### 1. Verificar que el Sitio está Habilitado

```bash
# Ver qué sitios están habilitados
ls -la /etc/nginx/sites-enabled/

# Verificar que milton está habilitado
ls -la /etc/nginx/sites-enabled/ | grep milton
```

Si no está habilitado:
```bash
sudo ln -s /etc/nginx/sites-available/milton /etc/nginx/sites-enabled/milton
sudo nginx -t
sudo systemctl reload nginx
```

### 2. Verificar el server_name en la Configuración

```bash
sudo grep "server_name" /etc/nginx/sites-available/milton
```

### 3. Probar con el Dominio Correcto (desde el navegador)

Abre en el navegador:
- `https://camsoft.com.co/concejoguachucal/api/noticias`

Debería devolver JSON `[]`

### 4. Verificar si hay Redirect de HTTP a HTTPS

```bash
sudo grep -A 5 "listen 80" /etc/nginx/sites-available/milton
sudo grep -A 5 "listen 443" /etc/nginx/sites-available/milton
```

Si hay redirect de HTTP a HTTPS, eso explicaría el 301.

### 5. Probar desde el Navegador

1. Abre: `https://camsoft.com.co/concejoguachucal/api/noticias`
   - Debería devolver JSON `[]`

2. Abre: `https://camsoft.com.co/concejoguachucal/noticias`
   - Debería mostrar la página con "No se encontraron noticias"

### 6. Verificar Logs de Acceso

```bash
sudo tail -20 /var/log/nginx/access.log
```

## 📝 Nota sobre el 404/301

El `curl` local puede devolver 404 o 301 porque:
- No está usando el `server_name` correcto
- Hay un redirect de HTTP a HTTPS
- El sitio no está habilitado correctamente

**Lo importante es probar desde el navegador con el dominio real.**
