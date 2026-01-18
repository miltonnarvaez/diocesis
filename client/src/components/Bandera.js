import React, { useState } from 'react';
import './Bandera.css';

const Bandera = () => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="bandera-container">
      <img
        src={`${process.env.PUBLIC_URL || ''}/images/bandera.png`}
        alt="Escudo de la Diócesis de Ipiales"
        className="bandera-image"
        style={{ display: imageLoaded ? 'block' : 'none' }}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageLoaded(false)}
      />
      <svg
        className="bandera-svg"
        viewBox="0 0 300 200"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: imageLoaded ? 'none' : 'block' }}
      >
        {/* Bandera: blanco arriba, verde abajo */}
        <rect width="300" height="100" fill="#ffffff" />
        <rect y="100" width="300" height="100" fill="#28a745" />
        {/* Sol de 16 picos en el centro */}
        <circle cx="150" cy="100" r="20" fill="#ffc107" />
        {[...Array(16)].map((_, i) => {
          const angle = (i * 360) / 16;
          const rad = (angle * Math.PI) / 180;
          const x1 = 150 + Math.cos(rad) * 20;
          const y1 = 100 + Math.sin(rad) * 20;
          const x2 = 150 + Math.cos(rad) * 28;
          const y2 = 100 + Math.sin(rad) * 28;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#ffc107"
              strokeWidth="2"
            />
          );
        })}
        {/* Texto IPIALES */}
        <text
          x="150"
          y="170"
          textAnchor="middle"
          fontSize="18"
          fontWeight="bold"
          fill="#2E5C8A"
          fontFamily="Arial, sans-serif"
        >
          IPIALES
        </text>
      </svg>
    </div>
  );
};

export default Bandera;


