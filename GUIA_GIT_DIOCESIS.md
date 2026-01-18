# 📦 Guía para Configurar Git y Subir el Proyecto Diócesis

Esta guía te ayudará a crear un repositorio Git y subirlo a GitHub para luego clonarlo en el servidor.

---

## 🔧 PASO 1: INICIALIZAR GIT LOCALMENTE

Abre PowerShell o Git Bash en la carpeta del proyecto y ejecuta:

```bash
# Navegar a la carpeta del proyecto
cd "C:\Users\Milton Narvaez\Documents\cursor\diocesis"

# Inicializar repositorio Git
git init

# Verificar que se creó correctamente
git status
```

---

## 📝 PASO 2: CONFIGURAR GIT (Si no lo has hecho antes)

```bash
# Configurar tu nombre (solo la primera vez)
git config --global user.name "Tu Nombre"

# Configurar tu email (solo la primera vez)
git config --global user.email "tu-email@gmail.com"
```

---

## ➕ PASO 3: AGREGAR ARCHIVOS AL REPOSITORIO

```bash
# Agregar todos los archivos (excepto los que están en .gitignore)
git add .

# Verificar qué archivos se agregaron
git status
```

**Nota:** El archivo `.gitignore` ya está configurado para excluir:
- `node_modules/`
- `client/build/`
- `server/.env`
- `server/uploads/`
- Y otros archivos temporales

---

## 💾 PASO 4: HACER EL PRIMER COMMIT

```bash
# Crear el commit inicial
git commit -m "Initial commit - Diócesis de Ipiales"

# Verificar el commit
git log
```

---

## 🌐 PASO 5: CREAR REPOSITORIO EN GITHUB

1. Ve a [GitHub.com](https://github.com) e inicia sesión
2. Haz clic en el botón **"+"** (arriba a la derecha) → **"New repository"**
3. Configura el repositorio:
   - **Repository name:** `diocesis` (o `diocesis-ipiales`)
   - **Description:** "Sitio web de la Diócesis de Ipiales"
   - **Visibility:** Private (recomendado) o Public
   - **NO marques** "Initialize this repository with a README" (ya tenemos archivos)
4. Haz clic en **"Create repository"**

---

## 🔗 PASO 6: CONECTAR EL REPOSITORIO LOCAL CON GITHUB

GitHub te mostrará comandos. Ejecuta estos (reemplaza `TU_USUARIO` con tu usuario de GitHub):

```bash
# Agregar el repositorio remoto
git remote add origin https://github.com/TU_USUARIO/diocesis.git

# Verificar que se agregó correctamente
git remote -v
```

**Ejemplo:**
```bash
git remote add origin https://github.com/miltonnarvaez/diocesis.git
```

---

## 📤 PASO 7: SUBIR EL CÓDIGO A GITHUB

```bash
# Cambiar a la rama main (si estás en otra)
git branch -M main

# Subir el código a GitHub
git push -u origin main
```

**Si te pide autenticación:**
- Si usas HTTPS, GitHub pedirá tu usuario y un **Personal Access Token** (no tu contraseña)
- Para crear un token: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token

---

## ✅ PASO 8: VERIFICAR EN GITHUB

1. Ve a tu repositorio en GitHub: `https://github.com/TU_USUARIO/diocesis`
2. Deberías ver todos los archivos del proyecto

---

## 🖥️ PASO 9: CLONAR EN EL SERVIDOR

Ahora en el servidor (droplet), ejecuta:

```bash
# Conectarse al servidor
ssh root@TU_IP_DEL_DROPLET

# Ir al directorio /var/www
cd /var/www

# Clonar el repositorio
git clone https://github.com/TU_USUARIO/diocesis.git

# Entrar al directorio
cd diocesis

# Verificar que se clonó correctamente
ls -la
```

**Si el repositorio es privado**, necesitarás autenticarte:

### Opción A: Usar Personal Access Token

```bash
# Cuando pida usuario, pon tu usuario de GitHub
# Cuando pida contraseña, pon tu Personal Access Token
git clone https://github.com/TU_USUARIO/diocesis.git
```

### Opción B: Usar SSH (Recomendado para servidores)

**En tu máquina local, generar clave SSH (si no tienes una):**

```bash
# Generar clave SSH
ssh-keygen -t ed25519 -C "tu-email@gmail.com"

# Ver la clave pública
cat ~/.ssh/id_ed25519.pub
```

**En GitHub:**
1. Settings → SSH and GPG keys → New SSH key
2. Pega la clave pública
3. Guarda

**En el servidor, configurar SSH:**

```bash
# Generar clave SSH en el servidor
ssh-keygen -t ed25519 -C "servidor-diocesis"

# Ver la clave pública
cat ~/.ssh/id_ed25519.pub
```

**Agregar la clave SSH del servidor a GitHub:**
1. Copia la clave pública del servidor
2. En GitHub: Settings → SSH and GPG keys → New SSH key
3. Pega la clave y guarda

**Clonar usando SSH:**

```bash
# Clonar usando SSH (más seguro)
git clone git@github.com:TU_USUARIO/diocesis.git
```

---

## 🔄 PASO 10: ACTUALIZAR CÓDIGO EN EL FUTURO

### En tu máquina local:

```bash
cd "C:\Users\Milton Narvaez\Documents\cursor\diocesis"

# Ver cambios
git status

# Agregar cambios
git add .

# Hacer commit
git commit -m "Descripción de los cambios"

# Subir a GitHub
git push origin main
```

### En el servidor:

```bash
cd /var/www/diocesis

# Actualizar código desde GitHub
git pull origin main

# Luego ejecutar el script de actualización
./update.sh
```

---

## 📋 COMANDOS ÚTILES DE GIT

```bash
# Ver estado del repositorio
git status

# Ver cambios específicos
git diff

# Ver historial de commits
git log --oneline

# Deshacer cambios no guardados
git checkout -- archivo.txt

# Ver ramas
git branch

# Crear nueva rama
git checkout -b nombre-rama

# Cambiar de rama
git checkout main
```

---

## ⚠️ ARCHIVOS QUE NO SE SUBEN (Gracias a .gitignore)

- `node_modules/` - Dependencias (se instalan con `npm install`)
- `client/build/` - Build del frontend (se genera con `npm run build`)
- `server/.env` - Variables de entorno (configurar manualmente en el servidor)
- `server/uploads/` - Archivos subidos por usuarios
- `*.log` - Archivos de log

---

## 🔐 SEGURIDAD IMPORTANTE

**NUNCA subas estos archivos a GitHub:**
- `server/.env` (contiene contraseñas y secretos)
- Archivos con información sensible
- Claves privadas SSH

El `.gitignore` ya está configurado para excluirlos automáticamente.

---

## ✅ CHECKLIST FINAL

- [ ] Git inicializado localmente
- [ ] Repositorio creado en GitHub
- [ ] Código subido a GitHub
- [ ] Repositorio clonado en el servidor
- [ ] Verificado que todos los archivos están presentes

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error: "fatal: not a git repository"
```bash
# Asegúrate de estar en la carpeta correcta
cd "C:\Users\Milton Narvaez\Documents\cursor\diocesis"
git init
```

### Error: "Permission denied" al hacer push
```bash
# Verificar que el remote está configurado
git remote -v

# Si es necesario, reconfigurar
git remote set-url origin https://github.com/TU_USUARIO/diocesis.git
```

### Error: "Authentication failed"
- Usa un Personal Access Token en lugar de tu contraseña
- O configura SSH keys

---

¡Listo! Ahora tienes tu proyecto en GitHub y puedes clonarlo en el servidor. 🎉
