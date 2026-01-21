# ⚠️ IMPORTANTE: Configuración en Raíz

## 📋 Estado Actual

**La aplicación ahora está configurada para funcionar desde la raíz del dominio, NO desde `/diocesis`.**

### Cambios Realizados en el Servidor:

1. ✅ **Build movido a la raíz**: El build ahora se sirve directamente desde `/var/www/diocesis/client/build` (no desde `/diocesis`)
2. ✅ **package.json actualizado**: `homepage: "."` (raíz)
3. ✅ **Nginx configurado**: Los dominios `camsoft.com.co` y `diocesisdeipiales.org` abren directamente sin `/diocesis`

### Dominios Configurados:

- `camsoft.com.co` → Abre directamente en la raíz
- `diocesisdeipiales.org` → Abre directamente en la raíz

---

## 🚫 NO HACER

**NUNCA volver a agregar referencias a `/diocesis` en:**

- ❌ `client/package.json` → `homepage` debe ser `"."` (NO `"/diocesis"`)
- ❌ `client/src/services/api.js` → NO usar `/diocesis` en basename
- ❌ `client/src/App.js` → NO agregar ruta `/diocesis`
- ❌ Cualquier componente que construya URLs → NO usar `/diocesis` como prefijo
- ❌ Configuración de Nginx → NO servir desde `/diocesis`

---

## ✅ HACER

**Siempre usar rutas relativas o absolutas desde la raíz:**

- ✅ `homepage: "."` en `package.json`
- ✅ Rutas API: `/api` (no `/diocesis/api`)
- ✅ Rutas de navegación: `/`, `/noticias`, `/acerca`, etc. (no `/diocesis/...`)
- ✅ URLs de archivos: `/uploads/...` (no `/diocesis/uploads/...`)

---

## 📝 Archivos Actualizados

Los siguientes archivos han sido actualizados para funcionar desde la raíz:

1. `client/src/services/api.js` - Eliminadas referencias a `/diocesis`
2. `client/src/App.js` - Eliminada ruta redundante `/diocesis`
3. `client/src/components/Breadcrumbs.js` - Eliminadas referencias a `/diocesis`
4. `client/src/utils/fileUtils.js` - Eliminadas referencias a `/diocesis`
5. `client/src/pages/admin/AdminNoticias.js` - Eliminadas referencias a `/diocesis`
6. `client/src/pages/DatosAbiertos.js` - Eliminadas referencias a `/diocesis`
7. `client/src/pages/admin/AdminConfiguracion.js` - Eliminadas referencias a `/diocesis`

---

## 🔍 Verificación

Para verificar que no hay referencias a `/diocesis` en el código:

```bash
# Buscar referencias a /diocesis en el código fuente
grep -r "/diocesis" client/src --exclude-dir=node_modules

# Solo deberían aparecer referencias en:
# - URLs externas (como https://diocesisdeipiales.org)
# - Comentarios
# - Archivos de configuración/documentación
```

---

## 🎯 Regla de Oro

**Si estás construyendo una URL o ruta, NO uses `/diocesis` como prefijo.**

Usa siempre rutas relativas desde la raíz:
- ✅ `/api/...`
- ✅ `/uploads/...`
- ✅ `/noticias`
- ❌ `/diocesis/api/...`
- ❌ `/diocesis/uploads/...`
- ❌ `/diocesis/noticias`

---

**Última actualización:** $(date)
