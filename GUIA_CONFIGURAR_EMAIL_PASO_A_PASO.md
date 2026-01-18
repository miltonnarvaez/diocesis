# Guía Paso a Paso: Configurar Email para PQRSD

## Paso 1: Preparar tu Email de Gmail

### Opción A: Si ya tienes Gmail con verificación en 2 pasos activada

1. Ve a: https://myaccount.google.com/apppasswords
2. Si te pide iniciar sesión, hazlo
3. En "Seleccionar app" elige: **Correo**
4. En "Seleccionar dispositivo" elige: **Otro (nombre personalizado)**
5. Escribe: **Concejo Guachucal**
6. Haz clic en **Generar**
7. **COPIA LA CONTRASEÑA** que aparece (16 caracteres, ejemplo: `abcd efgh ijkl mnop`)
8. **IMPORTANTE**: Esta contraseña solo se muestra una vez, guárdala bien

### Opción B: Si NO tienes verificación en 2 pasos activada

1. Ve a: https://myaccount.google.com/security
2. Busca "Verificación en 2 pasos" y actívala
3. Sigue las instrucciones para configurarla
4. Luego sigue con la Opción A

---

## Paso 2: Configurar el archivo .env

1. Abre el archivo `server/.env` en un editor de texto
2. Agrega o modifica estas líneas al final del archivo:

```env
# ============================================
# CONFIGURACIÓN DE EMAIL PARA PQRSD
# ============================================

# Servidor SMTP de Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Tu email de Gmail (el que usaste para generar la contraseña de aplicación)
SMTP_USER=tu-email@gmail.com

# La contraseña de aplicación que generaste (sin espacios)
SMTP_PASSWORD=abcdefghijklmnop

# Nombre que aparecerá como remitente
SMTP_FROM=Concejo Municipal de Guachucal <tu-email@gmail.com>

# URL del frontend (cambia esto cuando esté en producción)
FRONTEND_URL=http://localhost:3000

# Información de contacto (opcional)
NOMBRE_CONCEJO=Concejo Municipal de Guachucal
EMAIL_CONTACTO=contacto@concejo.guachucal.gov.co
TELEFONO_CONTACTO=+57 (2) XXX-XXXX
```

3. **Reemplaza**:
   - `tu-email@gmail.com` → Tu email real de Gmail
   - `abcdefghijklmnop` → La contraseña de aplicación que copiaste (sin espacios)
   - `http://localhost:3000` → La URL donde está tu frontend (si es diferente)

4. **Guarda** el archivo

---

## Paso 3: Verificar la Configuración

1. Reinicia el servidor backend:
   ```bash
   # Detén el servidor (Ctrl+C) y vuelve a iniciarlo
   cd server
   npm start
   ```

2. Busca en la consola uno de estos mensajes:
   - ✅ `Servidor de email configurado correctamente` → ¡Todo bien!
   - ⚠️ `Configuración de email no válida` → Revisa las credenciales
   - ⚠️ `SMTP_USER y SMTP_PASSWORD no configurados` → Agrega las variables al .env

---

## Paso 4: Probar el Sistema

1. Ve a: http://localhost:3000/pqrsd
2. Llena el formulario con un email real (el tuyo para probar)
3. Envía la solicitud
4. Revisa tu bandeja de entrada (y spam si no aparece)
5. Deberías recibir un email de confirmación con el número de radicado

---

## Ejemplo de Configuración Completa

Aquí tienes un ejemplo de cómo debería verse tu `.env`:

```env
# Configuración del servidor
PORT=5000
NODE_ENV=development

# Configuración de MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=mi_contraseña_mysql
DB_NAME=concejo_guachucal

# Configuración de JWT
JWT_SECRET=concejo_guachucal_secret_key_cambiar_en_produccion
JWT_EXPIRE=7d

# ============================================
# CONFIGURACIÓN DE EMAIL PARA PQRSD
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=concejo.guachucal@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
SMTP_FROM=Concejo Municipal de Guachucal <concejo.guachucal@gmail.com>
FRONTEND_URL=http://localhost:3000
NOMBRE_CONCEJO=Concejo Municipal de Guachucal
EMAIL_CONTACTO=contacto@concejo.guachucal.gov.co
TELEFONO_CONTACTO=+57 (2) XXX-XXXX
```

---

## Solución de Problemas

### Error: "Invalid login"
- Verifica que `SMTP_USER` sea tu email completo
- Verifica que `SMTP_PASSWORD` sea la contraseña de aplicación (16 caracteres, sin espacios)
- Asegúrate de haber copiado bien la contraseña

### Error: "Connection timeout"
- Verifica tu conexión a internet
- Verifica que `SMTP_HOST=smtp.gmail.com` y `SMTP_PORT=587`

### No recibo emails
- Revisa la carpeta de spam/correo no deseado
- Verifica que el email del destinatario sea correcto
- Revisa los logs del servidor para ver si hay errores

### El servidor no inicia
- Verifica que no haya errores de sintaxis en el archivo .env
- Asegúrate de que no haya espacios alrededor del signo `=`
- No uses comillas en los valores (a menos que sea necesario)

---

## Notas Importantes

1. **Seguridad**: Nunca compartas tu contraseña de aplicación
2. **Producción**: En producción, considera usar un servicio profesional como SendGrid o Mailgun
3. **Límites**: Gmail tiene límites de envío (500 emails/día para cuentas gratuitas)
4. **Sin Email**: Si no configuras el email, el sistema funcionará igual, solo no enviará emails

---

¿Necesitas ayuda con algún paso específico? ¡Dime cuál!













