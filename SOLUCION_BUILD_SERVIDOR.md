# Solución: Error "Missing script: build:prod" en el Servidor

## Problema

El script `build:prod` no existe en el servidor porque el código no está actualizado.

## Solución Rápida: Usar el comando manual

Mientras actualizas el código, puedes usar este comando directamente:

```bash
cd /var/www/concejoguachual/client
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

## Solución Permanente: Actualizar el código

### Paso 1: Actualizar desde GitHub

```bash
cd /var/www/concejoguachual
git pull origin main
```

### Paso 2: Verificar que el script existe

```bash
cd client
npm run
```

Deberías ver `build:prod` en la lista.

### Paso 3: Ejecutar el build

```bash
npm run build:prod
```

## Si git pull no funciona

Si hay conflictos o cambios locales, puedes hacer:

```bash
cd /var/www/concejoguachual
git fetch origin
git reset --hard origin/main
```

**⚠️ Advertencia:** Esto sobrescribirá cualquier cambio local no guardado.

## Verificar package.json

Después de actualizar, verifica que `package.json` tiene el script:

```bash
cat client/package.json | grep -A 5 "scripts"
```

Deberías ver:
```json
"scripts": {
  "start": "react-scripts start",
  "build": "react-scripts build",
  "build:prod": "NODE_OPTIONS=--max-old-space-size=4096 react-scripts build",
  ...
}
```




