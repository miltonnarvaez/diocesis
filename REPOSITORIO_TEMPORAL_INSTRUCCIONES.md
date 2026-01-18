# 📁 Repositorio Temporal de Archivos - Instrucciones

## Descripción

Este sistema permite que el Concejo Municipal suba archivos e información de manera organizada, sin necesidad de acceder al panel de administrador. Los archivos se organizan automáticamente en carpetas según su categoría.

## 🎯 Cómo Funciona

1. **El Concejo sube archivos** → Accede a `/repositorio-upload` y sube los archivos organizados por categoría
2. **Los archivos se guardan** → Se almacenan en `server/uploads/repositorio-temporal/` organizados por carpetas
3. **El Administrador revisa** → Desde `/admin/repositorio` puede ver, descargar, mover o eliminar archivos
4. **Procesamiento** → El administrador puede procesar los archivos y cargarlos a la base de datos desde sus respectivas secciones

## 📂 Estructura de Carpetas

El repositorio tiene las siguientes carpetas organizadas:

- **acerca-de/** - Información sobre el Concejo, misión, visión, etc.
- **miembros/** - Información de miembros del Concejo, autoridades
- **historia/** - Documentos históricos del Concejo
- **gaceta/** - Documentos de gaceta municipal
- **sesiones/** - Actas, documentos de sesiones
- **transparencia/** - Documentos de transparencia
- **documentos-generales/** - Otros documentos varios

## 🔗 Acceso

### Para el Concejo (Subir Archivos)
**URL:** `http://localhost:3000/repositorio-upload` (o la URL de producción)

**Características:**
- Interfaz simple y fácil de usar
- No requiere autenticación
- Drag & drop para subir archivos
- Soporte para múltiples archivos
- Organización automática por categoría

### Para el Administrador (Revisar y Procesar)
**URL:** `http://localhost:3000/admin/repositorio`

**Características:**
- Requiere autenticación de administrador
- Ver todos los archivos organizados por categoría
- Descargar archivos
- Mover archivos entre categorías
- Eliminar archivos
- Ver estadísticas del repositorio

## 📋 Formatos Aceptados

- **Imágenes:** JPEG, JPG, PNG, GIF, WEBP
- **Documentos:** PDF, DOC, DOCX, TXT
- **Hojas de cálculo:** XLS, XLSX, CSV
- **Presentaciones:** PPT, PPTX
- **Datos:** JSON, XML
- **Comprimidos:** ZIP, RAR

**Tamaño máximo:** 50MB por archivo

## 🚀 Uso

### Para Subir Archivos:

1. Accede a `/repositorio-upload`
2. Selecciona la categoría correspondiente
3. Arrastra archivos o haz clic para seleccionar
4. Haz clic en "Subir Archivo(s)"
5. Espera la confirmación de subida exitosa

### Para Revisar Archivos (Admin):

1. Inicia sesión como administrador
2. Ve a `/admin/repositorio`
3. Filtra por categoría si es necesario
4. Descarga, mueve o elimina archivos según necesites
5. Procesa los archivos desde sus respectivas secciones del admin

## 📝 Notas Importantes

- Los archivos se guardan con un timestamp para evitar conflictos de nombres
- El nombre original se mantiene (sin el timestamp) para referencia
- Los archivos están disponibles físicamente en el servidor para procesamiento manual si es necesario
- Se recomienda revisar periódicamente y procesar los archivos para mantener el repositorio organizado

## 🔧 Ubicación Física

Los archivos se almacenan en:
```
server/uploads/repositorio-temporal/
├── acerca-de/
├── miembros/
├── historia/
├── gaceta/
├── sesiones/
├── transparencia/
├── documentos-oficiales/
└── documentos-generales/
```

## 📞 Soporte

Si tienes problemas o preguntas, contacta al administrador del sistema.
