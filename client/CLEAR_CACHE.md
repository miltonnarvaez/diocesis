# Instrucciones para limpiar la caché y solucionar el problema de recarga constante

## Problema
El navegador está usando código antiguo en caché que apunta al puerto 5001 en lugar de 5000.

## Solución

### Opción 1: Hard Refresh del navegador (RECOMENDADO)
1. **Chrome/Edge**: Presiona `Ctrl + Shift + R` o `Ctrl + F5`
2. **Firefox**: Presiona `Ctrl + Shift + R` o `Ctrl + F5`
3. **Safari**: Presiona `Cmd + Shift + R`

### Opción 2: Limpiar caché del navegador
1. Abre las herramientas de desarrollador (F12)
2. Haz clic derecho en el botón de recargar
3. Selecciona "Vaciar caché y recargar de forma forzada"

### Opción 3: Limpiar caché completo
1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Application" (Chrome) o "Storage" (Firefox)
3. Haz clic en "Clear storage" o "Limpiar almacenamiento"
4. Marca todas las opciones y haz clic en "Clear site data"

### Opción 4: Reiniciar el servidor de desarrollo
1. Detén el servidor de React (Ctrl+C en la terminal)
2. Elimina la carpeta `node_modules/.cache` si existe:
   ```powershell
   cd client
   Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
   ```
3. Reinicia el servidor:
   ```powershell
   npm start
   ```

## Verificación
Después de limpiar la caché, verifica en la consola del navegador que las peticiones van a:
- ✅ `http://localhost:5000/api/...` (CORRECTO)
- ❌ `http://localhost:5001/api/...` (INCORRECTO - aún en caché)

## Nota
El código ya está corregido para usar el puerto 5000. Solo necesitas limpiar la caché del navegador.
















