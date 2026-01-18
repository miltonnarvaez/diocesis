import React, { useState } from 'react';

const ContraloriaLogo = ({ width = 70, height = 70 }) => {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <svg width={width} height={height} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="#dc3545"/>
        <circle cx="50" cy="50" r="35" fill="#ffc107"/>
        <text x="50" y="58" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#fff" fontFamily="Arial, sans-serif">C</text>
      </svg>
    );
  }

  return (
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/LogoCGRhorizontal.svg/512px-LogoCGRhorizontal.svg.png" 
      alt="Contraloría"
      width={width}
      height={height}
      style={{ objectFit: 'contain' }}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
};

export default ContraloriaLogo;




