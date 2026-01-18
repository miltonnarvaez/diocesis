import React, { useState } from 'react';

const PresidenciaLogo = ({ width = 70, height = 70 }) => {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <svg width={width} height={height} viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="18" height="60" fill="#FFCD00" rx="3"/>
        <rect x="0" y="18" width="18" height="18" fill="#003893"/>
        <rect x="0" y="36" width="18" height="18" fill="#CE1126"/>
        <line x1="18" y1="30" x2="25" y2="30" stroke="#333" strokeWidth="2"/>
        <text x="30" y="38" fontSize="14" fontWeight="bold" fill="#CE1126" fontFamily="Arial, sans-serif">PRESIDENCIA</text>
      </svg>
    );
  }

  return (
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Logo_Presidencia_de_la_Rep%C3%BAblica_de_Colombia_2022.svg/512px-Logo_Presidencia_de_la_Rep%C3%BAblica_de_Colombia_2022.svg.png" 
      alt="Presidencia de la República"
      width={width}
      height={height}
      style={{ objectFit: 'contain' }}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
};

export default PresidenciaLogo;




