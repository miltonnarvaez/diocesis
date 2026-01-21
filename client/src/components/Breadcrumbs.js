import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaNewspaper, 
  FaFileAlt, 
  FaEye, 
  FaImages, 
  FaPoll, 
  FaCalendarAlt,
  FaComments,
  FaFileContract,
  FaSearch,
  FaEnvelope,
  FaInfoCircle,
  FaChevronRight
} from 'react-icons/fa';
import './Breadcrumbs.css';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Solo mostrar breadcrumbs en la sección de noticias
  const isNoticiasPage = pathnames[0] === 'noticias' || location.pathname.includes('/noticias');
  if (!isNoticiasPage) {
    return null;
  }

  // Mapeo de rutas a nombres e iconos
  const routeMap = {
    '': { name: 'Inicio', icon: FaHome },
    'acerca': { name: 'Acerca de', icon: FaInfoCircle },
    'noticias': { name: 'Noticias', icon: FaNewspaper },
    'convocatorias': { name: 'Convocatorias', icon: FaCalendarAlt },
    'gaceta': { name: 'Gaceta', icon: FaFileAlt },
    'transparencia': { name: 'Transparencia', icon: FaEye },
    'galeria': { name: 'Galería', icon: FaImages },
    'encuestas': { name: 'Encuestas', icon: FaPoll },
    'sesiones': { name: 'Sesiones', icon: FaCalendarAlt },
    'foros': { name: 'Foros', icon: FaComments },
    'pqrsd': { name: 'PQRSD', icon: FaFileContract },
    'datos-abiertos': { name: 'Datos Abiertos', icon: FaFileAlt },
    'busqueda': { name: 'Búsqueda', icon: FaSearch },
    'contacto': { name: 'Contacto', icon: FaEnvelope },
    'politica-privacidad': { name: 'Política de Privacidad', icon: FaFileAlt },
    'tratamiento-datos': { name: 'Tratamiento de Datos', icon: FaFileAlt },
    'mapa-sitio': { name: 'Mapa del Sitio', icon: FaInfoCircle },
    'plan-accion': { name: 'Plan de Acción', icon: FaFileAlt }
  };

  // Si estamos en la página de inicio, no mostrar breadcrumbs
  if (pathnames.length === 0) {
    return null;
  }

  const buildPath = (index) => {
    const path = '/' + pathnames.slice(0, index + 1).join('/');
    return path;
  };

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumbs-list">
        <li className="breadcrumb-item">
          <Link to="/" className="breadcrumb-link">
            <FaHome className="breadcrumb-icon" />
            <span>Inicio</span>
          </Link>
        </li>
        {pathnames.map((name, index) => {
          const route = routeMap[name] || { name: name.charAt(0).toUpperCase() + name.slice(1), icon: FaInfoCircle };
          const Icon = route.icon;
          const isLast = index === pathnames.length - 1;
          const path = buildPath(index);

          return (
            <li key={index} className="breadcrumb-item">
              <FaChevronRight className="breadcrumb-separator" />
              {isLast ? (
                <span className="breadcrumb-current">
                  <Icon className="breadcrumb-icon" />
                  <span>{route.name}</span>
                </span>
              ) : (
                <Link to={path} className="breadcrumb-link">
                  <Icon className="breadcrumb-icon" />
                  <span>{route.name}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;





