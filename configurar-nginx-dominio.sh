#!/bin/bash

# Script para configurar Nginx para el dominio de la Diócesis de Ipiales
# Uso: sudo bash configurar-nginx-dominio.sh

echo "🌐 Configuración de Nginx para Diócesis de Ipiales"
echo "=================================================="
echo ""

# Solicitar dominio
read -p "Ingresa tu dominio (ejemplo: diocesisipiales.org): " DOMINIO

if [ -z "$DOMINIO" ]; then
    echo "❌ Error: Debes ingresar un dominio"
    exit 1
fi

# Confirmar dominio
echo ""
echo "📋 Dominio configurado: $DOMINIO"
read -p "¿Es correcto? (s/n): " CONFIRMAR

if [ "$CONFIRMAR" != "s" ] && [ "$CONFIRMAR" != "S" ]; then
    echo "❌ Configuración cancelada"
    exit 1
fi

# Nombre del archivo de configuración
CONFIG_FILE="/etc/nginx/sites-available/$DOMINIO"

echo ""
echo "📝 Creando configuración de Nginx..."

# Crear archivo de configuración
sudo tee "$CONFIG_FILE" > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMINIO www.$DOMINIO;

    # Redirección de www a no-www (opcional, descomenta si lo prefieres)
    # if (\$host = www.$DOMINIO) {
    #     return 301 http://$DOMINIO\$request_uri;
    # }

    # Frontend (React) - Ruta /diocesis
    location /diocesis {
        alias /var/www/diocesis/client/build;
        try_files \$uri \$uri/ @diocesis;
        index index.html;
    }
    
    # Fallback para React Router
    location @diocesis {
        rewrite ^.*$ /diocesis/index.html last;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Archivos estáticos (uploads, imágenes)
    location /uploads {
        alias /var/www/diocesis/server/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /images {
        alias /var/www/diocesis/server/images;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Redirección de la raíz a /diocesis
    location = / {
        return 301 /diocesis;
    }

    # Compresión gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Logs
    access_log /var/log/nginx/${DOMINIO}.access.log;
    error_log /var/log/nginx/${DOMINIO}.error.log;
}
EOF

echo "✅ Archivo de configuración creado: $CONFIG_FILE"

# Crear enlace simbólico
echo ""
echo "🔗 Creando enlace simbólico..."
sudo ln -sf "$CONFIG_FILE" "/etc/nginx/sites-enabled/$DOMINIO"

# Verificar configuración
echo ""
echo "🔍 Verificando configuración de Nginx..."
if sudo nginx -t; then
    echo "✅ Configuración válida"
    
    # Preguntar si quiere reiniciar Nginx
    echo ""
    read -p "¿Reiniciar Nginx ahora? (s/n): " REINICIAR
    
    if [ "$REINICIAR" = "s" ] || [ "$REINICIAR" = "S" ]; then
        echo "🔄 Reiniciando Nginx..."
        sudo systemctl restart nginx
        
        if [ $? -eq 0 ]; then
            echo "✅ Nginx reiniciado correctamente"
        else
            echo "❌ Error al reiniciar Nginx"
            exit 1
        fi
    else
        echo "⚠️  No olvides reiniciar Nginx con: sudo systemctl restart nginx"
    fi
else
    echo "❌ Error en la configuración de Nginx"
    echo "Revisa el archivo: $CONFIG_FILE"
    exit 1
fi

echo ""
echo "✅ Configuración completada!"
echo ""
echo "📋 Resumen:"
echo "   - Dominio: $DOMINIO"
echo "   - Archivo: $CONFIG_FILE"
echo "   - Enlace: /etc/nginx/sites-enabled/$DOMINIO"
echo ""
echo "🌐 Próximos pasos:"
echo "   1. Configura los registros DNS para que apunten a 161.35.188.174"
echo "   2. Espera la propagación DNS (5 minutos - 48 horas)"
echo "   3. Verifica con: nslookup $DOMINIO"
echo "   4. Visita: http://$DOMINIO/diocesis"
echo "   5. (Opcional) Configura SSL con: sudo certbot --nginx -d $DOMINIO -d www.$DOMINIO"
echo ""
