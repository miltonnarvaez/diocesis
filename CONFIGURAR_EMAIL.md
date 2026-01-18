# Configuración de Email para PQRSD

El sistema de PQRSD ahora envía emails automáticos de confirmación cuando se recibe una solicitud y cuando se responde.

## Configuración Requerida

Para que los emails funcionen, necesitas configurar las variables de entorno en el archivo `server/.env`:

### Variables de Email (SMTP)

```env
# Configuración SMTP para envío de emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-contraseña-de-aplicacion
SMTP_FROM=Concejo Municipal de Guachucal <tu-email@gmail.com>

# Información del Concejo (opcional, se usan valores por defecto si no se configuran)
NOMBRE_CONCEJO=Concejo Municipal de Guachucal
EMAIL_CONTACTO=contacto@concejo.guachucal.gov.co
TELEFONO_CONTACTO=+57 (2) XXX-XXXX

# URL del frontend (para enlaces en los emails)
FRONTEND_URL=http://localhost:3000
```

## Configuración para Gmail

### Opción 1: Contraseña de Aplicación (Recomendado)

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Activa la verificación en 2 pasos si no está activada
3. Ve a "Seguridad" > "Contraseñas de aplicaciones"
4. Genera una nueva contraseña de aplicación para "Correo"
5. Usa esa contraseña en `SMTP_PASSWORD`

### Opción 2: OAuth2 (Más seguro, más complejo)

Requiere configuración adicional con OAuth2 de Google.

## Configuración para Otros Proveedores SMTP

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=tu-email@outlook.com
SMTP_PASSWORD=tu-contraseña
```

### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=tu-email@yahoo.com
SMTP_PASSWORD=tu-contraseña-de-aplicacion
```

### Servidor SMTP Propio
```env
SMTP_HOST=mail.tudominio.com
SMTP_PORT=587
SMTP_USER=noreply@tudominio.com
SMTP_PASSWORD=tu-contraseña
```

## Verificación

Una vez configurado, cuando inicies el servidor verás uno de estos mensajes:

- ✅ `Servidor de email configurado correctamente` - Todo está bien
- ⚠️ `Configuración de email no válida` - Revisa las credenciales
- ⚠️ `SMTP_USER y SMTP_PASSWORD no configurados` - Agrega las variables al .env

## Emails que se Envían

### 1. Email de Confirmación (al crear PQRSD)
- Se envía automáticamente cuando se recibe una solicitud
- Incluye:
  - Número de radicado
  - Tipo de solicitud
  - Asunto
  - Fecha de recepción
  - Plazos de respuesta según Ley 1712
  - Enlace para consultar el estado

### 2. Email de Respuesta (al resolver PQRSD)
- Se envía cuando un administrador marca la solicitud como "resuelto" y agrega una respuesta
- Incluye:
  - Número de radicado
  - Respuesta completa
  - Fecha de respuesta
  - Enlace para ver detalles completos

## Notas Importantes

1. **No bloquea la operación**: Si el email falla, la solicitud se guarda igual. El error se registra en los logs pero no afecta al usuario.

2. **Privacidad**: Los emails solo se envían a la dirección proporcionada por el usuario en el formulario.

3. **Sin configuración**: Si no configuras el email, el sistema funcionará normalmente pero no enviará emails. Verás advertencias en los logs.

4. **Producción**: En producción, asegúrate de:
   - Usar un servicio de email confiable
   - Configurar SPF y DKIM en tu dominio
   - Usar HTTPS para el frontend
   - Considerar servicios como SendGrid, Mailgun o AWS SES para mayor confiabilidad

## Prueba

Para probar que funciona:

1. Configura las variables en `server/.env`
2. Reinicia el servidor backend
3. Crea una PQRSD desde el formulario público
4. Verifica que recibas el email de confirmación
5. Desde el panel admin, marca una solicitud como "resuelto" con respuesta
6. Verifica que recibas el email de respuesta

## Solución de Problemas

### Error: "Invalid login"
- Verifica que `SMTP_USER` y `SMTP_PASSWORD` sean correctos
- Si usas Gmail, asegúrate de usar una contraseña de aplicación, no tu contraseña normal

### Error: "Connection timeout"
- Verifica que `SMTP_HOST` y `SMTP_PORT` sean correctos
- Verifica tu conexión a internet
- Algunos proveedores bloquean conexiones desde ciertas IPs

### No se reciben emails
- Revisa la carpeta de spam
- Verifica los logs del servidor para ver si hay errores
- Asegúrate de que el email del destinatario sea válido













