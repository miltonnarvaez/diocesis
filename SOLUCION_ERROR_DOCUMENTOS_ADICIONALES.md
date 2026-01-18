# Solución: Error "Unknown column 'documentos_adicionales'"

## 🔍 Problema
Al crear una noticia, aparece el error:
```
Error al crear noticia: Error creando noticia: Unknown column 'documentos_adicionales' in 'field list'
```

**Causa**: La tabla `noticias` no tiene la columna `documentos_adicionales` que el código está intentando usar.

## ✅ Solución

### Opción 1: Usando el Script (Recomendado)

```bash
cd /var/www/concejoguachual/server
node scripts/agregar-columna-documentos-noticias.js
```

**Deberías ver:**
```
✅ Conectado a MySQL
🔄 Agregando columna documentos_adicionales...
✅ Columna documentos_adicionales agregada exitosamente
📋 Estructura de la tabla noticias:
   - id (int, NOT NULL)
   - titulo (varchar, NOT NULL)
   ...
   - documentos_adicionales (text, NULL)
🎉 ¡Configuración completada!
```

### Opción 2: Directamente en MySQL

```bash
mysql -u concejo_user -pConcejo_2025*+- concejo_guachucal
```

Dentro de MySQL:
```sql
-- Verificar si la columna existe
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'concejo_guachucal' 
AND TABLE_NAME = 'noticias' 
AND COLUMN_NAME = 'documentos_adicionales';

-- Si no existe, agregarla
ALTER TABLE noticias 
ADD COLUMN documentos_adicionales TEXT NULL 
AFTER categoria;

-- Verificar que se agregó
DESCRIBE noticias;
```

### Opción 3: Usando el Archivo SQL

```bash
cd /var/www/concejoguachual/server
mysql -u concejo_user -pConcejo_2025*+- concejo_guachucal < database/agregar_columna_documentos_adicionales.sql
```

## ✅ Verificar que Funciona

1. **Verificar en la base de datos:**
   ```bash
   mysql -u concejo_user -pConcejo_2025*+- concejo_guachucal -e "DESCRIBE noticias;" | grep documentos
   ```

2. **Probar crear una noticia:**
   - Ve a: `https://camsoft.com.co/concejoguachucal/admin/noticias`
   - Haz clic en "Crear Noticia"
   - Completa el formulario y sube documentos adicionales
   - Debería crear la noticia sin errores

## 📝 Descripción de la Columna

La columna `documentos_adicionales` almacena un JSON con información de los documentos:
- Nombre del archivo
- Ruta del archivo
- Tamaño
- Tipo MIME

Ejemplo de contenido:
```json
[
  {
    "nombre": "documento.pdf",
    "ruta": "/uploads/documents/abc123.pdf",
    "tamaño": 102400,
    "tipo": "application/pdf"
  }
]
```
