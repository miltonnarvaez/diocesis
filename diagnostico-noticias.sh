#!/bin/bash

echo "=========================================="
echo "  Diagnóstico: Página de Noticias"
echo "=========================================="
echo ""

# 1. Verificar PM2
echo "1. Verificando estado de PM2..."
pm2 status
echo ""

# 2. Verificar logs del backend
echo "2. Últimas 20 líneas de logs del backend:"
echo "----------------------------------------"
pm2 logs concejo-backend --lines 20 --nostream
echo ""

# 3. Probar endpoint localmente
echo "3. Probando endpoint /api/noticias localmente:"
echo "----------------------------------------"
curl -s http://localhost:5000/api/noticias | head -c 500
echo ""
echo ""

# 4. Verificar MySQL
echo "4. Verificando estado de MySQL:"
echo "----------------------------------------"
sudo systemctl status mysql --no-pager -l | head -10
echo ""

# 5. Verificar conexión a BD desde Node
echo "5. Verificando conexión a la base de datos:"
echo "----------------------------------------"
cd /var/www/concejoguachucal/server
node -e "
const pool = require('./config/database');
pool.getConnection()
  .then(conn => {
    console.log('✅ Conectado a MySQL');
    return conn.query('SELECT COUNT(*) as total FROM noticias');
  })
  .then(([rows]) => {
    console.log('Total de noticias en BD:', rows[0].total);
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
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
"
echo ""

# 6. Verificar configuración de Nginx
echo "6. Verificando configuración de Nginx:"
echo "----------------------------------------"
sudo nginx -t
echo ""

# 7. Verificar que el proxy está configurado
echo "7. Verificando configuración del proxy en Nginx:"
echo "----------------------------------------"
sudo grep -A 5 "location.*api" /etc/nginx/sites-available/* 2>/dev/null | head -20
echo ""

echo "=========================================="
echo "  Diagnóstico completado"
echo "=========================================="
