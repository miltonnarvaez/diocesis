# Crear Tablas de PQRSD

El error "Error al procesar la solicitud" generalmente ocurre porque las tablas de PQRSD no existen en la base de datos.

## Solución Rápida

### Opción 1: Usar el script automático (Recomendado)

Desde la carpeta `server/` ejecuta:

```bash
npm run setup-pqrsd
```

O desde la raíz del proyecto:

```bash
cd server
npm run setup-pqrsd
```

### Opción 2: Ejecutar manualmente con MySQL

1. Abre MySQL (línea de comandos o cliente gráfico)
2. Conecta a la base de datos:
   ```sql
   USE concejo_guachucal;
   ```
3. Ejecuta el script SQL:
   ```sql
   SOURCE database/pqrsd.sql;
   ```

O desde la línea de comandos:

```bash
mysql -u root -p concejo_guachucal < database/pqrsd.sql
```

### Opción 3: Copiar y pegar el SQL directamente

Abre tu cliente MySQL y ejecuta el contenido del archivo `database/pqrsd.sql`

## Verificar que las tablas se crearon

Ejecuta en MySQL:

```sql
USE concejo_guachucal;
SHOW TABLES LIKE 'pqrsd%';
```

Deberías ver:
- `pqrsd`
- `pqrsd_seguimiento`

## Después de crear las tablas

1. Reinicia el servidor backend si está corriendo
2. Intenta crear una PQRSD nuevamente
3. El error debería desaparecer

## Si el error persiste

1. Verifica los logs del servidor backend en la consola
2. Verifica que MySQL esté corriendo
3. Verifica las credenciales en `server/.env`
4. Verifica que la base de datos `concejo_guachucal` exista













