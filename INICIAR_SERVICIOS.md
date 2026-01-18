# Cómo Iniciar los Servicios

## Opción 1: Iniciar manualmente en terminales separadas

### Terminal 1 - Servidor Backend:
```bash
cd server
npm start
```

### Terminal 2 - Cliente Frontend:
```bash
cd client
npm start
```

## Opción 2: Usar scripts de PowerShell (Windows)

### Crear archivo `iniciar-servicios.ps1`:
```powershell
# Iniciar servidor backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm start"

# Esperar 3 segundos
Start-Sleep -Seconds 3

# Iniciar cliente frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; npm start"
```

Ejecutar con:
```powershell
.\iniciar-servicios.ps1
```

## Opción 3: Usar scripts batch (Windows)

### Crear archivo `iniciar-servicios.bat`:
```batch
@echo off
start "Servidor Backend" cmd /k "cd server && npm start"
timeout /t 3 /nobreak >nul
start "Cliente Frontend" cmd /k "cd client && npm start"
```

Ejecutar haciendo doble clic en el archivo `.bat`

## Verificar que los servicios estén corriendo:

- **Backend**: Debe estar en `http://localhost:5000` (o el puerto configurado en `.env`)
- **Frontend**: Debe estar en `http://localhost:3000`

## Solución de problemas:

1. **Si el backend no inicia:**
   - Verificar que el archivo `.env` existe en la carpeta `server/`
   - Verificar que la base de datos MySQL está corriendo
   - Verificar que las dependencias están instaladas: `cd server && npm install`

2. **Si el frontend no inicia:**
   - Verificar que las dependencias están instaladas: `cd client && npm install`
   - Verificar que el puerto 3000 no está en uso

3. **Si hay errores de módulos:**
   - Ejecutar `npm install` en ambas carpetas (`server` y `client`)












