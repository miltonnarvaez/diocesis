#!/bin/bash

# Script para configurar SSL para camsoft.com.co
# Ejecutar en el servidor como root

echo "=== Verificando configuración actual de Nginx ==="
echo ""
echo "Archivos disponibles:"
ls -la /etc/nginx/sites-available/
echo ""
echo "Archivos habilitados:"
ls -la /etc/nginx/sites-enabled/
echo ""
echo "=== Buscando server_name en configuraciones ==="
grep -r "server_name" /etc/nginx/sites-enabled/ || echo "No se encontró server_name"
echo ""
echo "=== Verificando configuración de Nginx ==="
nginx -t
echo ""
echo "=== Si necesitas editar la configuración, ejecuta: ==="
echo "sudo nano /etc/nginx/sites-available/[nombre-del-archivo]"
echo ""
echo "=== Después de editar, asegúrate de que server_name incluya: ==="
echo "server_name camsoft.com.co www.camsoft.com.co;"
echo ""
echo "=== Luego reinicia Nginx: ==="
echo "sudo systemctl restart nginx"
echo ""
echo "=== Finalmente, obtén el certificado SSL: ==="
echo "sudo certbot --nginx -d camsoft.com.co -d www.camsoft.com.co"




