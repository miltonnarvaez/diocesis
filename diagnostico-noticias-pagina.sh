#!/bin/bash

echo "=========================================="
echo "  Diagnóstico Página de Noticias"
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
echo "Respuesta (primeros 300 caracteres):"
echo "$BODY" | head -c 300
echo ""
echo ""

# 4. Verificar logs del backend
echo "4. Últimas 20 líneas de logs del backend:"
echo "----------------------------------------"
pm2 logs concejo-backend --lines 20 --nostream 2>/dev/null || echo "⚠️  No se pudieron obtener logs de PM2"
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

# 7. Verificar que la ruta está registrada
echo "7. Verificando ruta en index.js:"
echo "----------------------------------------"
cd /var/www/concejoguachual/server 2>/dev/null
if [ -f "index.js" ]; then
    grep -n "noticias" index.js | head -3
else
    echo "⚠️  index.js no encontrado"
fi
echo ""

# 8. Verificar conexión a BD
echo "8. Verificando conexión a la base de datos:"
echo "----------------------------------------"
cd /var/www/concejoguachual/server 2>/dev/null
node -e "
const pool = require('./config/database');
pool.getConnection()
  .then(conn => {
    console.log('✅ Conectado a MySQL');
    return conn.query('SELECT COUNT(*) as total FROM noticias');
  })
  .then(([rows]) => {
    console.log('Total de noticias en la base de datos:', rows[0].total);
    return pool.getConnection();
  })
  .then(conn => {
    return conn.query('SELECT COUNT(*) as total FROM noticias WHERE publicada = TRUE');
  })
  .then(([rows]) => {
    console.log('Noticias publicadas:', rows[0].total);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error de conexión:', err.message);
    process.exit(1);
  });
" 2>&1
echo ""

# 9. Verificar logs de Nginx
echo "9. Últimas 5 líneas de error.log de Nginx:"
echo "----------------------------------------"
sudo tail -5 /var/log/nginx/error.log 2>/dev/null || echo "⚠️  No se pudieron obtener logs de Nginx"
echo ""

# 10. Probar desde el navegador (instrucciones)
echo "10. Para probar desde el navegador:"
echo "----------------------------------------"
echo "Abre: https://camsoft.com.co/concejoguachucal/api/noticias"
echo "Debería devolver JSON (no HTML de error)"
echo ""
echo "Abre: https://camsoft.com.co/concejoguachucal/noticias"
echo "Debería mostrar la página de noticias"
echo ""

echo "=========================================="
echo "  Diagnóstico completado"
echo "=========================================="
