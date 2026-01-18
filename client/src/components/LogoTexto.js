import React from 'react';
import './LogoTexto.css';

const LogoTexto = () => {
  const imagePath = `${process.env.PUBLIC_URL || ''}/images/logo-texto.png`;
  
  return (
    <div className="logo-texto-container">
      <img
        src={imagePath}
        alt="Diócesis"
        className="logo-texto-image"
        onError={(e) => {
          console.error('Error cargando logo-texto:', imagePath);
          e.target.style.display = 'none';
        }}
      />
    </div>
  );
};

export default LogoTexto;

