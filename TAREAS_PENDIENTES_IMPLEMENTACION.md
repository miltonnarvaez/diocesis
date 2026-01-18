# Tareas Pendientes de Implementación
## Portal Web Concejo Municipal de Guachucal

**Fecha de creación:** [Fecha a completar]  
**Objetivo:** Lista detallada de tareas pendientes para completar el cumplimiento normativo y funcional del portal

---

## 🔴 ALTA PRIORIDAD

### 1. Completar Integración Backend de PQRSD (Sistema de Seguimiento)

**Estado:** ⚠️ Formulario frontend implementado, falta backend completo

**Tareas específicas:**

#### Backend:
- [ ] Crear tabla `pqrsd` en base de datos con campos:
  - `id`, `tipo`, `nombre`, `documento`, `email`, `telefono`, `asunto`, `descripcion`
  - `numero_radicado`, `estado` (pendiente, en_proceso, resuelto, cerrado)
  - `fecha_creacion`, `fecha_respuesta`, `respuesta`, `usuario_responde`
  - `archivos_adjuntos` (si aplica)
- [ ] Crear ruta API `POST /api/pqrsd` para crear solicitudes
- [ ] Crear ruta API `GET /api/pqrsd` para listar solicitudes (con autenticación admin)
- [ ] Crear ruta API `GET /api/pqrsd/:numero_radicado` para consulta pública por número
- [ ] Crear ruta API `PUT /api/pqrsd/:id` para actualizar estado y respuesta (admin)
- [ ] Implementar generación automática de número de radicado (formato: CMG-YYYYMMDD-XXXX)
- [ ] Implementar envío de email de confirmación al usuario
- [ ] Implementar notificaciones por email cuando se responda una solicitud

#### Frontend:
- [ ] Conectar formulario PQRSD con API backend
- [ ] Mostrar número de radicado después de enviar
- [ ] Crear página `/pqrsd/consulta` para consultar estado por número de radicado
- [ ] Crear panel admin `/admin/pqrsd` para gestionar solicitudes:
  - Listado con filtros (tipo, estado, fecha)
  - Vista detallada de cada solicitud
  - Formulario para responder
  - Cambio de estado
  - Historial de seguimiento

**Archivos a crear/modificar:**
- `database/pqrsd.sql` (nueva tabla)
- `server/routes/pqrsd.js` (nueva ruta)
- `client/src/pages/admin/AdminPQRSD.js` (nuevo componente)
- `client/src/pages/PQRSDConsulta.js` (nuevo componente)
- `client/src/pages/PQRSD.js` (modificar para conectar con API)

**Estimación:** 2-3 días

---

### 2. Crear Galería Multimedia Dedicada

**Estado:** ⚠️ Videos y fotos existen pero dispersos, falta galería centralizada

**Tareas específicas:**

#### Base de datos:
- [ ] Crear tabla `galeria_multimedia` con campos:
  - `id`, `titulo`, `descripcion`, `tipo` (foto, video)
  - `archivo_url`, `thumbnail_url`
  - `categoria` (sesiones, eventos, autoridades, actividades, otros)
  - `fecha_evento`, `fecha_publicacion`
  - `publicada`, `destacada`
  - `tags` (JSON o tabla separada)
- [ ] Crear tabla `galeria_categorias` para categorías personalizables

#### Backend:
- [ ] Crear ruta API `GET /api/galeria` con filtros (categoria, tipo, fecha)
- [ ] Crear ruta API `POST /api/galeria` para subir archivos (admin)
- [ ] Crear ruta API `PUT /api/galeria/:id` para editar (admin)
- [ ] Crear ruta API `DELETE /api/galeria/:id` para eliminar (admin)
- [ ] Implementar subida de imágenes y videos
- [ ] Implementar generación de thumbnails para imágenes
- [ ] Implementar conversión/optimización de videos

#### Frontend:
- [ ] Crear página `/galeria` con:
  - Grid de imágenes/videos
  - Filtros por categoría y tipo
  - Vista de lightbox para imágenes
  - Reproductor de video integrado
  - Búsqueda por tags
- [ ] Crear página `/galeria/:id` para vista detallada
- [ ] Crear panel admin `/admin/galeria`:
  - Listado de archivos
  - Formulario de subida múltiple
  - Edición de metadatos
  - Organización por categorías
  - Gestión de tags

**Archivos a crear:**
- `database/galeria_multimedia.sql`
- `server/routes/galeria.js`
- `server/utils/imageProcessor.js` (para thumbnails)
- `client/src/pages/Galeria.js`
- `client/src/pages/GaleriaDetalle.js`
- `client/src/pages/admin/AdminGaleria.js`
- `client/src/components/Lightbox.js` (para imágenes)
- `client/src/components/VideoPlayer.js` (reproductor integrado)

**Estimación:** 3-4 días

---

### 3. Implementar Sistema de Encuestas Ciudadanas

**Estado:** ❌ No implementado

**Tareas específicas:**

#### Base de datos:
- [ ] Crear tabla `encuestas` con campos:
  - `id`, `titulo`, `descripcion`, `fecha_inicio`, `fecha_fin`
  - `activa`, `publicada`, `tipo` (simple, multiple_choice, rating)
  - `resultados_publicos` (boolean)
- [ ] Crear tabla `encuesta_preguntas` con campos:
  - `id`, `encuesta_id`, `pregunta`, `tipo` (texto, opcion_multiple, escala)
  - `opciones` (JSON para opciones múltiples)
  - `orden`
- [ ] Crear tabla `encuesta_respuestas` con campos:
  - `id`, `encuesta_id`, `pregunta_id`, `respuesta` (JSON)
  - `ip_address`, `fecha_respuesta`
  - `usuario_id` (opcional, si requiere autenticación)

#### Backend:
- [ ] Crear ruta API `GET /api/encuestas` (solo activas y publicadas)
- [ ] Crear ruta API `GET /api/encuestas/:id`
- [ ] Crear ruta API `POST /api/encuestas/:id/respuestas` (para votar)
- [ ] Crear ruta API `GET /api/encuestas/:id/resultados` (si resultados_publicos = true)
- [ ] Crear rutas admin para CRUD completo de encuestas
- [ ] Implementar validación de una respuesta por IP/usuario
- [ ] Implementar cálculo de resultados en tiempo real

#### Frontend:
- [ ] Crear página `/encuestas` con listado de encuestas activas
- [ ] Crear página `/encuestas/:id` con formulario de respuesta
- [ ] Crear componente de visualización de resultados (gráficos)
- [ ] Crear panel admin `/admin/encuestas`:
  - CRUD de encuestas
  - Gestión de preguntas
  - Visualización de resultados
  - Exportación de datos (CSV)

**Archivos a crear:**
- `database/encuestas.sql`
- `server/routes/encuestas.js`
- `client/src/pages/Encuestas.js`
- `client/src/pages/EncuestaDetalle.js`
- `client/src/pages/admin/AdminEncuestas.js`
- `client/src/components/EncuestaForm.js`
- `client/src/components/ResultadosGrafico.js` (usar Chart.js o similar)

**Estimación:** 4-5 días

---

### 4. Implementar Exportación de Datos Abiertos (CSV, JSON, XML)

**Estado:** ⚠️ Estructura lista, falta implementar exportación

**Tareas específicas:**

#### Backend:
- [ ] Crear ruta API `GET /api/datos-abiertos/exportar` con parámetros:
  - `categoria` (presupuesto, contratacion, etc.)
  - `formato` (csv, json, xml)
  - `fecha_desde`, `fecha_hasta` (opcional)
- [ ] Implementar conversión a CSV:
  - Usar librería `csv-writer` o similar
  - Incluir metadatos en encabezado
- [ ] Implementar conversión a JSON:
  - Formato JSON-LD con Schema.org
  - Incluir metadatos de dataset
- [ ] Implementar conversión a XML:
  - Estructura XML válida
  - Incluir XSD schema
- [ ] Crear endpoint de catálogo de datos abiertos `/api/datos-abiertos/catalogo`
- [ ] Implementar metadatos según estándar DCAT (Data Catalog Vocabulary)

#### Frontend:
- [ ] Agregar botones de exportación en página de Transparencia
- [ ] Crear página `/datos-abiertos` con:
  - Catálogo de datasets disponibles
  - Descripción de cada dataset
  - Formatos disponibles
  - Frecuencia de actualización
  - Licencia de uso
- [ ] Implementar descarga directa de archivos

**Archivos a crear/modificar:**
- `server/routes/datosAbiertos.js`
- `server/utils/dataExporter.js`
- `client/src/pages/DatosAbiertos.js`
- `client/src/pages/Transparencia.js` (agregar botones de exportación)

**Librerías necesarias:**
- `csv-writer` o `papaparse`
- `xml2js` o `fast-xml-parser`

**Estimación:** 2-3 días

---

### 5. Agregar Contenido Real en Categorías de Transparencia

**Estado:** ⚠️ Estructura completa, falta contenido

**Tareas específicas:**

- [ ] Recopilar documentos reales del Concejo para cada categoría:
  - [ ] Presupuesto (presupuesto general, ejecución presupuestal)
  - [ ] Contratación Pública (procesos, licitaciones, adjudicaciones)
  - [ ] Plan Anual de Compras
  - [ ] Rendición de Cuentas (informes de gestión)
  - [ ] Estados Financieros (balances, reportes contables)
  - [ ] Control Interno (informes, auditorías)
  - [ ] Declaración de Renta
  - [ ] Estructura Organizacional (organigrama, manual de funciones)
  - [ ] Plan de Desarrollo (municipal y seguimiento)
  - [ ] Normatividad (normas, reglamentos)
  - [ ] Servicios Ciudadanos
  - [ ] Auditorías (externa e interna)
  - [ ] Bienes Inmuebles (inventario, patrimonio)
  - [ ] Personal (planta, nómina, convocatorias)
- [ ] Subir documentos al sistema desde panel de administración
- [ ] Verificar que los documentos sean PDF accesibles
- [ ] Agregar fechas de actualización a cada documento
- [ ] Establecer calendario de actualización periódica

**Nota:** Esta tarea requiere coordinación con el área administrativa del Concejo

**Estimación:** Variable (depende de disponibilidad de documentos)

---

### 6. Verificar Certificado SSL/HTTPS en Producción

**Estado:** ⚠️ Pendiente verificación en producción

**Tareas específicas:**

- [ ] Configurar certificado SSL en servidor de producción
- [ ] Verificar que todas las rutas redirijan a HTTPS
- [ ] Configurar HSTS (HTTP Strict Transport Security)
- [ ] Verificar que los recursos externos usen HTTPS
- [ ] Realizar prueba de seguridad SSL (SSL Labs)
- [ ] Documentar configuración de seguridad

**Archivos a modificar:**
- Configuración del servidor (Nginx/Apache)
- `server/index.js` (agregar redirección HTTPS si es necesario)

**Estimación:** 1 día

---

## 🟡 MEDIA PRIORIDAD

### 7. Implementar Schema.org Markup para SEO

**Estado:** ⚠️ Metadatos básicos implementados, falta Schema.org

**Tareas específicas:**

- [ ] Implementar Schema.org `Organization` en página principal
- [ ] Implementar Schema.org `WebSite` con SearchAction
- [ ] Implementar Schema.org `BreadcrumbList` en todas las páginas
- [ ] Implementar Schema.org `Article` para noticias
- [ ] Implementar Schema.org `GovernmentOrganization` para información institucional
- [ ] Implementar Schema.org `Dataset` para datos abiertos
- [ ] Agregar JSON-LD en `<head>` de cada página relevante
- [ ] Validar con Google Rich Results Test

**Archivos a crear/modificar:**
- `client/src/components/SchemaMarkup.js` (componente reutilizable)
- `client/src/pages/Home.js` (agregar Organization, WebSite)
- `client/src/pages/NoticiaDetalle.js` (agregar Article)
- `client/src/pages/Acerca.js` (agregar GovernmentOrganization)
- `client/src/pages/DatosAbiertos.js` (agregar Dataset)

**Estimación:** 1-2 días

---

### 8. Crear Sección de Historia del Concejo

**Estado:** ❌ No implementado

**Tareas específicas:**

#### Base de datos:
- [ ] Crear tabla `historia_concejo` con campos:
  - `id`, `titulo`, `contenido` (HTML), `fecha_evento`
  - `imagen_url`, `orden`, `publicada`
  - `categoria` (fundacion, hitos, autoridades_historicas)

#### Backend:
- [ ] Crear ruta API `GET /api/historia`
- [ ] Crear rutas admin para CRUD de historia

#### Frontend:
- [ ] Agregar sección "Historia" en página `/acerca`
- [ ] Crear línea de tiempo (timeline) visual
- [ ] Crear panel admin `/admin/historia` para gestionar contenido

**Archivos a crear:**
- `database/historia_concejo.sql`
- `server/routes/historia.js`
- `client/src/components/Timeline.js` (componente de línea de tiempo)
- `client/src/pages/Acerca.js` (agregar sección historia)
- `client/src/pages/admin/AdminHistoria.js`

**Estimación:** 2 días

---

### 9. Implementar Foros de Discusión

**Estado:** ❌ No implementado

**Tareas específicas:**

#### Base de datos:
- [ ] Crear tabla `foros` con campos:
  - `id`, `titulo`, `descripcion`, `categoria`
  - `fecha_inicio`, `fecha_fin`, `activo`
- [ ] Crear tabla `foro_comentarios` con campos:
  - `id`, `foro_id`, `usuario_nombre`, `email`, `comentario`
  - `fecha_comentario`, `moderado`, `aprobado`
  - `ip_address` (para moderación)
- [ ] Crear tabla `foro_votos` (opcional, para likes/dislikes)

#### Backend:
- [ ] Crear ruta API `GET /api/foros` (solo activos)
- [ ] Crear ruta API `GET /api/foros/:id/comentarios`
- [ ] Crear ruta API `POST /api/foros/:id/comentarios`
- [ ] Implementar sistema de moderación:
  - Aprobación manual de comentarios
  - Filtro de palabras prohibidas
  - Límite de comentarios por IP
- [ ] Crear rutas admin para gestión de foros y moderación

#### Frontend:
- [ ] Crear página `/foros` con listado de foros activos
- [ ] Crear página `/foros/:id` con:
  - Descripción del foro
  - Formulario de comentarios
  - Listado de comentarios aprobados
  - Sistema de votación (opcional)
- [ ] Crear panel admin `/admin/foros`:
  - CRUD de foros
  - Moderación de comentarios
  - Estadísticas de participación

**Archivos a crear:**
- `database/foros.sql`
- `server/routes/foros.js`
- `server/middleware/moderation.js` (filtro de contenido)
- `client/src/pages/Foros.js`
- `client/src/pages/ForoDetalle.js`
- `client/src/pages/admin/AdminForos.js`

**Estimación:** 4-5 días

---

### 10. Crear Sección Específica de Trámites del Concejo

**Estado:** ⚠️ Solo enlace externo, falta sección propia

**Tareas específicas:**

#### Base de datos:
- [ ] Crear tabla `tramites` con campos:
  - `id`, `nombre`, `descripcion`, `categoria`
  - `requisitos` (JSON o texto), `costo`, `tiempo_respuesta`
  - `documentos_necesarios`, `pasos` (JSON)
  - `activo`, `destacado`

#### Backend:
- [ ] Crear ruta API `GET /api/tramites`
- [ ] Crear rutas admin para CRUD de trámites

#### Frontend:
- [ ] Crear página `/tramites` con:
  - Listado de trámites disponibles
  - Filtros por categoría
  - Búsqueda
  - Vista detallada de cada trámite
- [ ] Crear panel admin `/admin/tramites` para gestionar trámites

**Archivos a crear:**
- `database/tramites.sql`
- `server/routes/tramites.js`
- `client/src/pages/Tramites.js`
- `client/src/pages/TramiteDetalle.js`
- `client/src/pages/admin/AdminTramites.js`

**Estimación:** 2-3 días

---

### 11. Verificar Formatos Accesibles de Documentos PDF

**Estado:** ⚠️ Pendiente verificación

**Tareas específicas:**

- [ ] Auditar documentos PDF existentes con herramienta de accesibilidad
- [ ] Verificar que los PDFs tengan:
  - Etiquetas de estructura
  - Texto seleccionable (no solo imágenes escaneadas)
  - Orden de lectura lógico
  - Textos alternativos en imágenes
  - Metadatos de idioma
- [ ] Convertir PDFs escaneados a PDFs accesibles (OCR si es necesario)
- [ ] Crear versiones HTML alternativas para documentos importantes
- [ ] Establecer estándar de accesibilidad para nuevos documentos
- [ ] Documentar proceso de creación de PDFs accesibles

**Herramientas recomendadas:**
- Adobe Acrobat Pro (verificación de accesibilidad)
- PDF Accessibility Checker (PAC)
- WAVE (para versiones HTML)

**Estimación:** Variable (depende de cantidad de documentos)

---

### 12. Documentar Políticas de Seguridad y Respaldo

**Estado:** ⚠️ Pendiente documentación

**Tareas específicas:**

- [ ] Crear documento de política de seguridad:
  - Controles de acceso
  - Encriptación de datos
  - Gestión de contraseñas
  - Auditoría de accesos
- [ ] Crear documento de política de respaldo:
  - Frecuencia de respaldos
  - Retención de respaldos
  - Procedimiento de restauración
  - Pruebas de restauración
- [ ] Implementar sistema de respaldo automático:
  - Respaldo de base de datos (diario)
  - Respaldo de archivos (semanal)
  - Almacenamiento en ubicación segura
- [ ] Crear procedimiento de respuesta a incidentes
- [ ] Documentar configuración de seguridad del servidor

**Archivos a crear:**
- `docs/POLITICA_SEGURIDAD.md`
- `docs/POLITICA_RESPALDO.md`
- `scripts/backup-database.sh`
- `scripts/backup-files.sh`

**Estimación:** 2-3 días

---

## 🟢 BAJA PRIORIDAD

### 13. Expandir Información para Grupos de Interés

**Estado:** ⚠️ Solo Dupla Naranja implementada

**Tareas específicas:**

- [ ] Crear secciones para otros grupos de interés:
  - [ ] Adultos mayores
  - [ ] Jóvenes
  - [ ] Personas con discapacidad
  - [ ] Comunidades étnicas
  - [ ] Empresarios
- [ ] Agregar información específica para cada grupo
- [ ] Crear enlaces y recursos relevantes
- [ ] Implementar filtros en PQRSD por grupo de interés

**Archivos a modificar:**
- `client/src/pages/Home.js` (agregar secciones)
- `client/src/pages/PQRSD.js` (agregar campo grupo_interes)

**Estimación:** 1-2 días

---

### 14. Implementar Sistema de Búsqueda Avanzada

**Estado:** ⚠️ Solo búsqueda básica en noticias

**Tareas específicas:**

- [ ] Implementar búsqueda global en todo el sitio:
  - Noticias
  - Documentos de transparencia
  - Gaceta
  - Sesiones
  - Convocatorias
- [ ] Agregar filtros avanzados:
  - Por tipo de contenido
  - Por fecha
  - Por categoría
- [ ] Implementar búsqueda por palabras clave
- [ ] Agregar sugerencias de búsqueda
- [ ] Mostrar resultados destacados

**Archivos a crear/modificar:**
- `server/routes/busqueda.js` (nueva ruta de búsqueda)
- `client/src/components/BusquedaAvanzada.js`
- `client/src/pages/Busqueda.js` (página de resultados)

**Estimación:** 2-3 días

---

### 15. Agregar Fechas de Actualización Visibles en Documentos

**Estado:** ⚠️ Fechas existen en BD pero no siempre visibles

**Tareas específicas:**

- [ ] Agregar campo `fecha_actualizacion` visible en:
  - Documentos de transparencia
  - Documentos de gaceta
  - Noticias
  - Convocatorias
- [ ] Mostrar "Última actualización" en cada documento
- [ ] Implementar indicador visual de documentos recientes
- [ ] Agregar filtro por fecha de actualización

**Archivos a modificar:**
- `client/src/pages/Transparencia.js`
- `client/src/pages/Gaceta.js`
- `client/src/pages/Noticias.js`
- `client/src/pages/Convocatorias.js`

**Estimación:** 1 día

---

### 16. Crear Formularios Específicos de Opinión sobre Proyectos

**Estado:** ⚠️ Solo PQRSD genérico

**Tareas específicas:**

- [ ] Crear formulario específico para opinar sobre proyectos de acuerdo
- [ ] Vincular formularios con proyectos específicos en Gaceta
- [ ] Implementar visualización de opiniones recibidas (si se permite)
- [ ] Crear panel admin para gestionar opiniones sobre proyectos

**Archivos a crear:**
- `database/opiniones_proyectos.sql`
- `server/routes/opiniones.js`
- `client/src/components/FormularioOpinionProyecto.js`
- `client/src/pages/admin/AdminOpiniones.js`

**Estimación:** 2 días

---

## 📋 RESUMEN DE TAREAS POR PRIORIDAD

### Alta Prioridad (6 tareas):
1. ✅ Completar integración backend de PQRSD
2. ✅ Crear galería multimedia dedicada
3. ✅ Implementar sistema de encuestas ciudadanas
4. ✅ Implementar exportación de datos abiertos
5. ⚠️ Agregar contenido real en transparencia (requiere coordinación)
6. ✅ Verificar certificado SSL/HTTPS

### Media Prioridad (6 tareas):
7. ✅ Implementar Schema.org markup
8. ✅ Crear sección de historia del Concejo
9. ✅ Implementar foros de discusión
10. ✅ Crear sección de trámites
11. ⚠️ Verificar formatos accesibles PDF (requiere auditoría)
12. ✅ Documentar políticas de seguridad

### Baja Prioridad (4 tareas):
13. ✅ Expandir información para grupos de interés
14. ✅ Implementar búsqueda avanzada
15. ✅ Agregar fechas de actualización visibles
16. ✅ Crear formularios de opinión sobre proyectos

---

## 📊 ESTIMACIÓN TOTAL

- **Alta Prioridad:** ~15-18 días de desarrollo
- **Media Prioridad:** ~15-18 días de desarrollo
- **Baja Prioridad:** ~7-9 días de desarrollo
- **Total estimado:** ~37-45 días de desarrollo (sin contar tareas que requieren coordinación externa)

---

## 🎯 PLAN DE IMPLEMENTACIÓN SUGERIDO

### Fase 1 (Semanas 1-2): Funcionalidades Críticas
1. Completar backend PQRSD
2. Verificar SSL/HTTPS
3. Implementar exportación de datos abiertos

### Fase 2 (Semanas 3-4): Participación Ciudadana
1. Sistema de encuestas
2. Galería multimedia
3. Schema.org markup

### Fase 3 (Semanas 5-6): Contenido y Mejoras
1. Sección de historia
2. Foros de discusión
3. Sección de trámites
4. Búsqueda avanzada

### Fase 4 (Semanas 7+): Optimización y Documentación
1. Documentación de seguridad
2. Verificación de accesibilidad PDF
3. Mejoras menores
4. Agregar contenido real

---

**Última actualización:** [Fecha a completar]













