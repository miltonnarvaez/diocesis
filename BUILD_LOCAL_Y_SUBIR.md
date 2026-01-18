# Build Local y Subir al Servidor

## Opción Recomendada: Build Local

Si el build falla en el servidor por problemas de memoria, puedes hacerlo localmente y luego subir la carpeta `build` al servidor.

## Paso 1: Build Local

En tu máquina local (Windows):

```bash
cd client
npm run build:prod
```

O si prefieres el comando manual:
```bash
cd client
set NODE_OPTIONS=--max-old-space-size=4096
npm run build
```

Esto creará la carpeta `client/build` con todos los archivos compilados.

## Paso 2: Subir la Carpeta Build al Servidor

### Opción A: Usar SCP (desde Git Bash o WSL)

```bash
# Desde la raíz del proyecto
scp -r client/build/* usuario@TU_IP_SERVIDOR:/var/www/concejoguachual/client/build/
```

### Opción B: Usar WinSCP o FileZilla

1. Conecta al servidor usando WinSCP o FileZilla
2. Navega a `/var/www/concejoguachual/client/`
3. Si existe, elimina o respalda la carpeta `build` antigua
4. Sube la carpeta `build` completa desde tu máquina local

### Opción C: Usar rsync (si está disponible)

```bash
rsync -avz --delete client/build/ usuario@TU_IP_SERVIDOR:/var/www/concejoguachual/client/build/
```

## Paso 3: Configurar Permisos en el Servidor

Una vez subida la carpeta, conecta al servidor y configura los permisos:

```bash
ssh usuario@TU_IP_SERVIDOR
cd /var/www/concejoguachual
sudo chown -R www-data:www-data client/build
sudo chmod -R 755 client/build
```

## Paso 4: Reiniciar Nginx

```bash
sudo systemctl restart nginx
```

## Ventajas del Build Local

1. ✅ **Más recursos**: Tu máquina local probablemente tiene más RAM
2. ✅ **Más rápido**: No depende de la conexión durante el build
3. ✅ **Más confiable**: Evita problemas de memoria en servidores pequeños
4. ✅ **Puedes verificar**: Puedes probar el build localmente antes de subirlo

## Desventajas

1. ⚠️ **Tamaño**: La carpeta `build` puede ser grande (varios MB)
2. ⚠️ **Tiempo de subida**: Depende de tu velocidad de internet

## Script Automatizado (Opcional)

Puedes crear un script que haga todo automáticamente:

**build-and-deploy.sh** (para usar en Git Bash o WSL):
```bash
#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}Construyendo proyecto...${NC}"
cd client
npm run build:prod

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Build exitoso!${NC}"
    echo -e "${GREEN}Subiendo al servidor...${NC}"
    
    # Reemplaza con tus credenciales
    SERVER_USER="usuario"
    SERVER_IP="TU_IP_SERVIDOR"
    SERVER_PATH="/var/www/concejoguachual/client/build"
    
    # Subir archivos
    scp -r build/* ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/
    
    echo -e "${GREEN}Archivos subidos!${NC}"
    echo -e "${GREEN}Conectando al servidor para configurar permisos...${NC}"
    
    ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
        cd /var/www/concejoguachual
        sudo chown -R www-data:www-data client/build
        sudo chmod -R 755 client/build
        sudo systemctl restart nginx
        echo "Permisos configurados y Nginx reiniciado"
EOF
    
    echo -e "${GREEN}¡Deploy completado!${NC}"
else
    echo -e "${RED}Error en el build${NC}"
    exit 1
fi
```

## Nota sobre .gitignore

Asegúrate de que `client/build` esté en `.gitignore` para no subir archivos compilados al repositorio:

```gitignore
# Build
client/build
```

## Verificación

Después de subir, verifica que todo funciona:

1. Visita tu sitio web
2. Verifica que los archivos estáticos se cargan correctamente
3. Revisa los logs de Nginx si hay problemas:
   ```bash
   sudo tail -f /var/log/nginx/concejo_error.log
   ```




