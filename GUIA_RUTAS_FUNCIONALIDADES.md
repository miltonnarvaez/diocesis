# Guía de Rutas y Funcionalidades

## 📍 Dónde Ver Cada Funcionalidad

### 1. Fechas de Actualización Visibles

**Rutas públicas:**
- `/transparencia` - Ver documentos con fecha de actualización
- `/gaceta` - Ver documentos de gaceta con fecha de actualización
- `/noticias` - Ver noticias con fecha de actualización
- `/noticias/:id` - Ver detalle de noticia con fecha de actualización
- `/convocatorias` - Ver convocatorias con fecha de actualización
- `/convocatorias/:id` - Ver detalle de convocatoria con fecha de actualización

**Cómo verlo:**
- Busca el texto "Última actualización:" en cada tarjeta de documento/noticia/convocatoria
- Aparece en formato: "Última actualización: [día] de [mes] de [año]"

---

### 2. Schema.org Markup para SEO

**Dónde está implementado:**
- Página principal (`/`) - OrganizationSchema y WebSiteSchema
- Página Acerca (`/acerca`) - OrganizationSchema
- Detalle de Noticia (`/noticias/:id`) - ArticleSchema
- Datos Abiertos (`/datos-abiertos`) - DatasetSchema

**Cómo verlo:**
1. Abre cualquier página mencionada
2. Haz clic derecho → "Ver código fuente" (o Ctrl+U)
3. Busca `<script type="application/ld+json">`
4. También puedes usar herramientas de desarrollador (F12) → Console

**Herramientas para validar:**
- Google Rich Results Test: https://search.google.com/test/rich-results
- Schema.org Validator: https://validator.schema.org/

---

### 3. Galería Multimedia Dedicada

**Rutas:**
- Página pública: `/galeria`
- Panel admin: `/admin/galeria` (requiere login)

**Funcionalidades visibles:**
- Grid de imágenes y videos
- Filtros por categoría (Sesiones, Eventos, Autoridades, Actividades, Otros)
- Filtros por tipo (Fotografías, Videos)
- Lightbox para ver imágenes en grande (clic en cualquier imagen)
- Reproductor de video integrado
- Badge "⭐ Destacada" en elementos destacados

**Cómo usar:**
1. Ve a `/galeria`
2. Usa los filtros en la parte superior
3. Haz clic en una imagen para verla en lightbox
4. Los videos se reproducen directamente en la página

---

### 4. Sistema de Encuestas Ciudadanas

**Rutas:**
- Lista de encuestas: `/encuestas`
- Responder encuesta: `/encuestas/:id`
- Ver resultados: `/encuestas/:id/resultados` (si está finalizada y resultados públicos)
- Panel admin: `/admin/encuestas` (requiere login)

**Funcionalidades visibles:**
- Lista de encuestas activas (🟢) y finalizadas (🔴)
- Formulario de respuesta con:
  - Preguntas de texto libre
  - Preguntas de opción múltiple (radio buttons)
  - Preguntas de escala (slider 1-10)
- Visualización de resultados:
  - Gráficos de barras para opciones múltiples
  - Promedios para escalas
  - Lista de respuestas de texto

**Cómo usar:**
1. Ve a `/encuestas`
2. Haz clic en "Participar →" en una encuesta activa
3. Completa el formulario y envía
4. Si la encuesta está finalizada, verás "Ver Resultados →"

**Panel Admin:**
1. Ve a `/admin/encuestas`
2. Crea una nueva encuesta con el botón "+ Nueva Encuesta"
3. Agrega preguntas con el botón "+ Agregar Pregunta"
4. Configura fechas, visibilidad y resultados públicos
5. Usa "Resultados" para ver estadísticas detalladas

---

### 5. Exportación de Datos Abiertos (CSV, JSON, XML)

**Ruta:**
- `/datos-abiertos`

**Funcionalidades visibles:**
- Catálogo de datasets disponibles:
  - Documentos de Transparencia
  - Documentos de Gaceta Municipal
  - Noticias del Concejo Municipal
  - Convocatorias Públicas
- Botones de descarga para cada formato:
  - **CSV** - Para Excel y análisis de datos
  - **JSON** - Para desarrolladores y APIs
  - **XML** - Para sistemas legacy

**Cómo usar:**
1. Ve a `/datos-abiertos`
2. Revisa la descripción de cada dataset
3. Haz clic en el botón del formato deseado (CSV, JSON, XML)
4. El archivo se descargará automáticamente

**Información mostrada:**
- Nombre del dataset
- Descripción
- Nivel de acceso (público)
- Licencia (Creative Commons 4.0)
- Contacto técnico
- Enlaces de descarga

---

## 🔐 Rutas que Requieren Autenticación

Para acceder a los paneles de administración:
1. Ve a `/admin/login`
2. Inicia sesión con tus credenciales de administrador
3. Accede a:
   - `/admin` - Dashboard principal
   - `/admin/galeria` - Gestión de galería
   - `/admin/encuestas` - Gestión de encuestas
   - `/admin/noticias` - Gestión de noticias
   - `/admin/convocatorias` - Gestión de convocatorias
   - `/admin/gaceta` - Gestión de gaceta
   - `/admin/transparencia` - Gestión de transparencia
   - `/admin/pqrsd` - Gestión de PQRSD
   - Y más...

---

## 📝 Notas Importantes

1. **Fechas de actualización**: Se muestran automáticamente si el campo `actualizado_en` o `fecha_actualizacion` existe en la base de datos.

2. **Schema.org**: Los schemas están en el HTML pero no son visibles en la página. Son para motores de búsqueda.

3. **Galería**: Asegúrate de tener imágenes/videos subidos desde el panel admin para ver contenido.

4. **Encuestas**: Las encuestas solo se muestran si están activas, publicadas y dentro del rango de fechas.

5. **Datos Abiertos**: Los archivos se generan dinámicamente al hacer clic en descargar. Pueden tardar unos segundos si hay muchos registros.

---

## 🛠️ Archivos de Código Principales

- **Fechas de actualización**: `client/src/pages/Transparencia.js`, `Gaceta.js`, `Noticias.js`, etc.
- **Schema.org**: `client/src/components/SchemaMarkup.js`
- **Galería**: `client/src/pages/Galeria.js`, `client/src/pages/admin/AdminGaleria.js`
- **Encuestas**: `client/src/pages/Encuestas.js`, `client/src/pages/admin/AdminEncuestas.js`
- **Datos Abiertos**: `client/src/pages/DatosAbiertos.js`, `server/routes/datosAbiertos.js`


