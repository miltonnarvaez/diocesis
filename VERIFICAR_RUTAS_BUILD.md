# Verificación de Rutas para el Build

## Problema
Las rutas no están usando el prefijo `/concejoguachucal` en producción. Al hacer clic en PQRS, va a `camsoft.com.co/pqrs` en lugar de `camsoft.com.co/concejoguachucal/pqrs`.

## Solución Aplicada

### 1. BrowserRouter basename
**Archivo**: `client/src/index.js`
```javascript
<BrowserRouter basename={process.env.NODE_ENV === 'production' ? '/concejoguachucal' : ''}>
```

### 2. API baseURL
**Archivo**: `client/src/services/api.js`
- En desarrollo: `http://localhost:5000/api`
- En producción: `/concejoguachucal/api`

### 3. Redirects en API
**Archivo**: `client/src/services/api.js`
- Los redirects de autenticación usan: `/concejoguachucal/admin/login`

## Verificación

### Antes del Build:
1. ✅ Verificar que `package.json` tiene `"homepage": "/concejoguachucal"`
2. ✅ Verificar que todos los enlaces usan `Link` de React Router (no `href`)
3. ✅ Verificar que `navigate()` se usa correctamente

### Después del Build:
1. Verificar que las rutas funcionan con el prefijo `/concejoguachucal`
2. Probar navegación entre páginas
3. Verificar que las llamadas API van a `/concejoguachucal/api`

## Comandos para Probar

```bash
# Hacer build
cd client
npm run build:prod

# Verificar que el build se creó correctamente
ls -la build

# Probar en el servidor
# Las rutas deberían ser:
# - camsoft.com.co/concejoguachucal/
# - camsoft.com.co/concejoguachucal/pqrs
# - camsoft.com.co/concejoguachucal/contacto
# etc.
```

## Nota Importante

El `package.json` tiene `"homepage": "/concejoguachucal"`, lo cual hace que:
- `process.env.PUBLIC_URL` sea `/concejoguachucal` en el build
- Los assets se generen con el prefijo correcto
- El basename se configure automáticamente

Si las rutas aún no funcionan después del build, verificar:
1. Que el build se haya hecho correctamente
2. Que Nginx esté sirviendo desde `/concejoguachucal`
3. Que no haya caché del navegador




