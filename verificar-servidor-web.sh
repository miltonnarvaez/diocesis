#!/bin/bash

echo "=== Verificando Servidor Web Instalado ==="
echo ""

# Verificar Nginx
if command -v nginx &> /dev/null; then
    echo "✅ Nginx está instalado"
    echo "   Versión: $(nginx -v 2>&1)"
    echo "   Estado: $(systemctl is-active nginx 2>/dev/null || echo 'No activo')"
    echo ""
else
    echo "❌ Nginx NO está instalado"
    echo ""
fi

# Verificar Apache
if command -v apache2 &> /dev/null || command -v httpd &> /dev/null; then
    echo "✅ Apache está instalado"
    if command -v apache2 &> /dev/null; then
        echo "   Versión: $(apache2 -v | head -n 1)"
        echo "   Estado: $(systemctl is-active apache2 2>/dev/null || echo 'No activo')"
    else
        echo "   Versión: $(httpd -v | head -n 1)"
        echo "   Estado: $(systemctl is-active httpd 2>/dev/null || echo 'No activo')"
    fi
    echo ""
else
    echo "❌ Apache NO está instalado"
    echo ""
fi

# Verificar servicios corriendo en puertos comunes
echo "=== Servicios en Puertos Web Comunes ==="
echo ""
echo "Puerto 80 (HTTP):"
sudo netstat -tlnp | grep :80 || echo "   Ningún servicio en puerto 80"
echo ""
echo "Puerto 443 (HTTPS):"
sudo netstat -tlnp | grep :443 || echo "   Ningún servicio en puerto 443"
echo ""
echo "Puerto 5000 (Node.js común):"
sudo netstat -tlnp | grep :5000 || echo "   Ningún servicio en puerto 5000"
echo ""
echo "Puerto 3000 (React común):"
sudo netstat -tlnp | grep :3000 || echo "   Ningún servicio en puerto 3000"
echo ""

# Verificar PM2 (si está instalado)
if command -v pm2 &> /dev/null; then
    echo "✅ PM2 está instalado"
    echo "   Procesos corriendo:"
    pm2 list
else
    echo "❌ PM2 NO está instalado"
fi

echo ""
echo "=== Verificación Completada ==="








