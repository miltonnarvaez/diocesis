import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaPlus, FaEnvelope, FaCalendarAlt, FaComments, FaTimes } from 'react-icons/fa';
import './FloatingActionButton.css';

const FloatingActionButton = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Ocultar en la página del repositorio
  if (location.pathname.includes('/repositorio-upload')) {
    return null;
  }

  const actions = [
    { icon: FaEnvelope, label: 'Contacto', path: '/contacto', color: '#4A90E2' },
    { icon: FaCalendarAlt, label: 'Agenda', path: '/agenda', color: '#2E5C8A' },
    { icon: FaComments, label: 'Opiniones', path: '/opiniones', color: '#87CEEB' }
  ];

  return (
    <div className="fab-container">
      <div className={`fab-menu ${isOpen ? 'open' : ''}`}>
        {actions.map((action, index) => (
          <Link
            key={index}
            to={action.path}
            className="fab-action"
            style={{ 
              '--delay': `${index * 0.1}s`,
              '--action-color': action.color
            }}
            onClick={() => setIsOpen(false)}
          >
            <action.icon />
            <span className="fab-label">{action.label}</span>
          </Link>
        ))}
      </div>
      <button
        className={`fab-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Acciones rápidas"
        aria-expanded={isOpen}
      >
        {isOpen ? <FaTimes style={{ display: 'block' }} /> : <FaPlus style={{ display: 'block' }} />}
      </button>
    </div>
  );
};

export default FloatingActionButton;





