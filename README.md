# Diócesis

Sistema web completo para la gestión de la Diócesis.

## Características

- Portal web institucional
- Gestión de noticias y convocatorias
- Sistema de transparencia y acceso a la información pública
- Gaceta municipal con documentos oficiales
- Galería multimedia
- Sistema de encuestas ciudadanas
- Foros de participación ciudadana
- Gestión de PQRSD
- Panel de administración completo

## Tecnologías

- **Frontend**: React.js
- **Backend**: Node.js + Express
- **Base de datos**: MySQL
- **Autenticación**: JWT

## Instalación

### Requisitos previos

- Node.js (v14 o superior)
- MySQL (v8 o superior)
- npm o yarn

### Configuración

1. Clonar el repositorio
2. Instalar dependencias del servidor: `cd server && npm install`
3. Instalar dependencias del cliente: `cd client && npm install`
4. Configurar variables de entorno en `server/.env`
5. Configurar la base de datos ejecutando los scripts SQL en `database/`
6. Iniciar el servidor: `cd server && npm start`
7. Iniciar el cliente: `cd client && npm start`

## Estructura del Proyecto

```
diocesis/
├── client/          # Aplicación React frontend
├── server/          # API Express backend
├── database/        # Scripts SQL de base de datos
└── scripts/         # Scripts de utilidad
```

## Licencia

Este proyecto es propiedad de la Diócesis.

