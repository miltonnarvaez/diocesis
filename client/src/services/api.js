import axios from 'axios';

// VERSIÓN: 2.5 - Detección mejorada de entorno
// Determinar el baseURL según el entorno
const getBaseURL = () => {
  // Si hay una variable de entorno, usarla (tiene prioridad)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Detectar si estamos en desarrollo (localhost o 127.0.0.1)
  const isDevelopment = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    return 'http://localhost:5001/api';
  }
  
  // En producción, usar el basename relativo
  const basename = window.location.pathname.startsWith('/diocesis') ? '/diocesis' : '';
  return `${basename}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 segundos de timeout
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // No establecer Content-Type si es FormData (el navegador lo hará automáticamente)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo redirigir a login si es un error 401 Y estamos en una ruta de admin
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const basename = process.env.NODE_ENV === 'production' ? '/diocesis' : '';
      const isAdminRoute = currentPath.includes('/admin') && !currentPath.includes('/admin/login');
      
      // Limpiar tokens
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Solo redirigir si estamos en una ruta de admin protegida
      if (isAdminRoute) {
        window.location.href = `${basename}/admin/login`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;


