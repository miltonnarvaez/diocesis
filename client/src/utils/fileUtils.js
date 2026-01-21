// Función helper para construir URL completa del archivo
export const getFileUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Construir URL completa
  if (process.env.NODE_ENV === 'production') {
    // En producción, usar la ruta relativa desde la raíz
    return path;
  } else {
    // En desarrollo, usar la base URL del API (puerto 5001 para Diócesis)
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    return `${baseURL}${path}`;
  }
};

















