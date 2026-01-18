# Solución al Problema de Build en el Servidor

## Problema

Al ejecutar `npm run build` en el servidor, puede fallar con errores relacionados con memoria insuficiente, especialmente en servidores con recursos limitados.

## Error Común

```
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
```

## Soluciones

### Solución 1: Usar el script de build optimizado (Recomendado)

El proyecto ahora incluye un script de build optimizado que aumenta automáticamente el límite de memoria:

```bash
cd client
npm run build:prod
```

Este script configura Node.js para usar hasta 4GB de memoria durante el build.

### Solución 2: Usar NODE_OPTIONS manualmente

Si el script `build:prod` no está disponible, puedes ejecutar:

```bash
cd client
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Solución 3: Aumentar aún más la memoria (si es necesario)

Si 4GB no es suficiente, puedes aumentar a 6GB o 8GB:

```bash
NODE_OPTIONS="--max-old-space-size=6144" npm run build  # 6GB
NODE_OPTIONS="--max-old-space-size=8192" npm run build  # 8GB
```

**Nota:** Asegúrate de que tu servidor tenga suficiente RAM disponible. Si tu servidor tiene menos de 4GB de RAM total, considera aumentar el tamaño del droplet o usar un servidor con más recursos.

### Solución 4: Limpiar antes de construir

A veces, archivos temporales pueden causar problemas. Limpia antes de construir:

```bash
cd client
rm -rf node_modules build
npm install
npm run build:prod
```

## Verificar Memoria Disponible

Para verificar cuánta memoria tiene tu servidor:

```bash
free -h
```

Para verificar cuánta memoria está usando Node.js durante el build:

```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build 2>&1 | grep -i memory
```

## Prevención

Para evitar este problema en el futuro:

1. **Siempre usa `npm run build:prod`** en lugar de `npm run build` en el servidor
2. **Actualiza los scripts de deployment** para usar `build:prod`
3. **Monitorea el uso de memoria** durante el build

## Script de Actualización Recomendado

Actualiza tu script de actualización (`update.sh`) para usar:

```bash
#!/bin/bash
cd /var/www/concejoguachual
git pull origin main
cd server
npm install
cd ../client
npm install
npm run build:prod  # Usa build:prod en lugar de build
pm2 restart concejo-backend
echo "Actualización completada"
```




