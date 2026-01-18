# Verificar Noticias en la Base de Datos

## 🔍 Comandos para Verificar Noticias

### 1. Conectarse a MySQL

```bash
mysql -u root -p
# Ingresa tu contraseña de root
```

### 2. Seleccionar la Base de Datos

```sql
USE concejo_guachucal;
```

### 3. Ver Todas las Noticias

```sql
SELECT * FROM noticias;
```

### 4. Ver Solo Noticias Publicadas

```sql
SELECT * FROM noticias WHERE publicada = TRUE;
```

### 5. Contar Total de Noticias

```sql
SELECT COUNT(*) as total FROM noticias;
```

### 6. Contar Noticias Publicadas

```sql
SELECT COUNT(*) as publicadas FROM noticias WHERE publicada = TRUE;
```

### 7. Ver Noticias con Información Básica

```sql
SELECT 
    id,
    titulo,
    publicada,
    fecha_publicacion,
    creado_en
FROM noticias
ORDER BY creado_en DESC;
```

### 8. Ver Últimas 5 Noticias

```sql
SELECT 
    id,
    titulo,
    publicada,
    fecha_publicacion
FROM noticias
ORDER BY creado_en DESC
LIMIT 5;
```

### 9. Ver Estructura de la Tabla (si no existe)

```sql
DESCRIBE noticias;
```

### 10. Salir de MySQL

```sql
EXIT;
```

## 📋 Script Rápido (desde la terminal)

```bash
mysql -u root -p -e "
USE concejo_guachucal;
SELECT 'Total de noticias:' as info, COUNT(*) as cantidad FROM noticias
UNION ALL
SELECT 'Noticias publicadas:', COUNT(*) FROM noticias WHERE publicada = TRUE
UNION ALL
SELECT 'Noticias no publicadas:', COUNT(*) FROM noticias WHERE publicada = FALSE;
"
```

## 🔧 Si la Tabla No Existe

Si la tabla `noticias` no existe, necesitas crearla. Ejecuta:

```bash
cd /var/www/concejoguachual/server
mysql -u root -p concejo_guachucal < database/noticias.sql
```

O verifica si existe el archivo SQL:

```bash
ls -la /var/www/concejoguachual/server/database/ | grep noticias
```

## 📝 Ver Noticias desde el Backend (API)

También puedes probar el endpoint directamente:

```bash
# Desde el servidor
curl http://localhost:5000/api/noticias

# Desde el navegador
https://camsoft.com.co/concejoguachucal/api/noticias
```

## ⚠️ Si No Hay Noticias

Si no hay noticias, puedes:

1. **Crear noticias desde el panel de administración:**
   - Ve a: `https://camsoft.com.co/concejoguachucal/admin/noticias`
   - Inicia sesión como administrador
   - Crea una nueva noticia

2. **Insertar una noticia de prueba directamente en MySQL:**
   ```sql
   INSERT INTO noticias (
       titulo,
       contenido,
       resumen,
       publicada,
       fecha_publicacion,
       creado_en,
       actualizado_en
   ) VALUES (
       'Noticia de Prueba',
       'Este es el contenido de la noticia de prueba.',
       'Resumen de la noticia de prueba',
       TRUE,
       NOW(),
       NOW(),
       NOW()
   );
   ```
