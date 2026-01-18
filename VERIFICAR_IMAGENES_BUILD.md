# Verificación de Imágenes para el Build

## Imágenes Requeridas

Las siguientes imágenes deben existir en `client/public/images/`:

### Imágenes Críticas (deben existir):
1. ✅ `escudo.png` - Usado en: Escudo.js, AlcaldiaLogo.js, Home.js
2. ✅ `logo-texto.png` - Usado en: LogoTexto.js
3. ✅ `logoGovCO.png` - Usado en: Header.js, GovCoLogo.js
4. ✅ `hero-grupo-personas.jpg` - Usado en: Home.js (hero section)
5. ⚠️ `bandera.png` - Usado en: Bandera.js (tiene fallback SVG si no existe)

### Verificación de Rutas

Todas las imágenes usan la ruta:
```javascript
`${process.env.PUBLIC_URL || ''}/images/[nombre-imagen]`
```

### Imágenes Externas (no requieren verificación local):
- Logos de entidades gubernamentales (URLs externas)
- Imágenes de Unsplash (URLs externas)

## Archivos a Limpiar (opcional)

Hay archivos innecesarios en `client/public/images/`:
- Archivos HTML descargados
- Archivos `.descarga`
- Carpetas de archivos descargados

Estos no afectan el build pero ocupan espacio.

## Comandos para Verificar

```bash
# Verificar que las imágenes críticas existen
cd client/public/images
ls escudo.png logo-texto.png logoGovCO.png hero-grupo-personas.jpg bandera.png
```

## Antes del Build

1. ✅ Verificar que todas las imágenes críticas existan
2. ✅ Verificar que las rutas en el código sean correctas
3. ✅ Probar que las imágenes se carguen correctamente en desarrollo
4. ⚠️ Opcional: Limpiar archivos innecesarios




