import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminNavbar.css';

const AdminNavbar = ({ title, showBackButton = true }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const parts = path.split('/').filter(p => p);
    
    const breadcrumbs = [
      { name: 'Dashboard', path: '/admin' }
    ];

    if (parts.length > 1) {
      const section = parts[1];
      const sectionNames = {
        'noticias': 'Noticias',
        'convocatorias': 'Convocatorias',
        'actividades': 'Agenda',
        'gaceta': 'Gaceta',
        'transparencia': 'Transparencia',
        'sesiones': 'Sesiones',
        'autoridades': 'Autoridades',
        'configuracion': 'Configuración',
        'usuarios': 'Usuarios',
        'pqrsd': 'PQRSD',
        'galeria': 'Galería',
        'encuestas': 'Encuestas',
        'repositorio': 'Repositorio Temporal'
      };
      
      breadcrumbs.push({
        name: sectionNames[section] || section,
        path: `/admin/${section}`
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="admin-navbar">
      <div className="admin-navbar-top">
        <div className="admin-navbar-left">
          {showBackButton && (
            <Link to="/admin" className="admin-nav-back">
              <span className="admin-nav-icon">←</span>
              <span>Dashboard</span>
            </Link>
          )}
          <div className="admin-nav-breadcrumbs">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.path}>
                {index > 0 && <span className="breadcrumb-separator">/</span>}
                {index === breadcrumbs.length - 1 ? (
                  <span className="breadcrumb-current">{crumb.name}</span>
                ) : (
                  <Link to={crumb.path} className="breadcrumb-link">
                    {crumb.name}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="admin-navbar-right">
          <div className="admin-user-info">
            <span className="admin-user-name">
              {user?.nombre || user?.email || 'Usuario'}
            </span>
            <button onClick={logout} className="admin-logout-btn">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
      {title && (
        <div className="admin-navbar-title">
          <h1>{title}</h1>
        </div>
      )}
    </div>
  );
};

export default AdminNavbar;















