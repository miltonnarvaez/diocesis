import React from 'react';
import './Escudo.css';

const Escudo = () => {
  // Usar logo.png directamente ya que existe
  const logoSrc = `${process.env.PUBLIC_URL || ''}/images/logo.png`;
  
  return (
    <div className="escudo-container">
      <img
        src={logoSrc}
        alt="Escudo de la Diócesis de Ipiales"
        className="escudo-image"
        onError={(e) => {
          // Si falla logo.png, intentar con escudo_Colombia.png como fallback
          const fallbackSrc = `${process.env.PUBLIC_URL || ''}/images/escudo_Colombia.png`;
          if (e.target.src !== fallbackSrc) {
            e.target.src = fallbackSrc;
          } else {
            // Si todos fallan, ocultar sin causar errores
            e.target.style.display = 'none';
          }
        }}
      />
    </div>
  );
};

export default Escudo;


