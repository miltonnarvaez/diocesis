#!/bin/bash

echo "=========================================="
echo "  Verificación del Servidor API"
echo "=========================================="
echo ""

# 1. Verificar PM2
echo "1. Estado de PM2:"
echo "----------------------------------------"
pm2 status
echo ""

# 2. Verificar puerto 5000
echo "2. Verificando puerto 5000:"
echo "----------------------------------------"
sudo netstat -tulpn | grep 5000 || sudo ss -tulpn | grep 5000 || echo "⚠️  Puerto 5000 no está en uso"
echo ""

# 3. Probar endpoint local
echo "3. Probando endpoint /api/noticias localmente:"
echo "----------------------------------------"
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:5000/api/noticias 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
echo "Código HTTP: $HTTP_CODE"
echo "Respuesta (primeros 200 caracteres):"
echo "$BODY" | head -c 200
echo ""
echo ""

# 4. Verificar logs del backend
echo "4. Últimas 15 líneas de logs del backend:"
echo "----------------------------------------"
pm2 logs concejo-backend --lines 15 --nostream 2>/dev/null || echo "⚠️  No se pudieron obtener logs de PM2"
echo ""

# 5. Verificar configuración de Nginx
echo "5. Verificando configuración de Nginx:"
echo "----------------------------------------"
sudo nginx -t 2>&1
echo ""

# 6. Verificar proxy_pass en Nginx
echo "6. Configuración del proxy API en Nginx:"
echo "----------------------------------------"
sudo grep -A 8 "location.*concejoguachucal/api" /etc/nginx/sites-available/* 2>/dev/null || \
sudo grep -A 8 "location.*api" /etc/nginx/sites-available/* 2>/dev/null | head -20
echo ""

# 7. Verificar que el servidor puede iniciar
echo "7. Verificando dependencias del servidor:"
echo "----------------------------------------"
cd /var/www/concejoguachual/server 2>/dev/null
if [ -f "package.json" ]; then
    echo "✅ package.json encontrado"
    if [ -d "node_modules" ]; then
        echo "✅ node_modules existe"
    else
        echo "⚠️  node_modules no existe - ejecuta: npm install"
    fi
else
    echo "❌ package.json no encontrado"
fi
echo ""

# 8. Verificar variables de entorno
echo "8. Verificando archivo .env:"
echo "----------------------------------------"
if [ -f ".env" ]; then
    echo "✅ .env existe"
    echo "Variables configuradas:"
    grep -E "^(DB_|PORT=)" .env 2>/dev/null | sed 's/=.*/=***/' || echo "⚠️  No se encontraron variables DB_ o PORT"
else
    echo "⚠️  .env no existe"
fi
echo ""

# 9. Verificar MySQL
echo "9. Estado de MySQL:"
echo "----------------------------------------"
sudo systemctl status mysql --no-pager -l 2>/dev/null | head -8 || echo "⚠️  No se pudo verificar MySQL"
echo ""

# 10. Probar desde el navegador (instrucciones)
echo "10. Para probar desde el navegador:"
echo "----------------------------------------"
echo "Abre: https://camsoft.com.co/concejoguachucal/api/noticias"
echo "Debería devolver JSON (no HTML de error)"
echo ""

echo "=========================================="
echo "  Diagnóstico completado"
echo "=========================================="
