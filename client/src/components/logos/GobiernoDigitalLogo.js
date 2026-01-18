import React, { useState } from 'react';

const GobiernoDigitalLogo = ({ width = 70, height = 70 }) => {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <svg width={width} height={height} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gdGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0056b3"/>
            <stop offset="100%" stopColor="#007bff"/>
          </linearGradient>
        </defs>
        <rect x="15" y="15" width="70" height="70" fill="url(#gdGradient)" rx="8"/>
        <text x="50" y="58" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#fff" fontFamily="Arial, sans-serif">GD</text>
      </svg>
    );
  }

  return (
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Logo_Gobierno_de_Colombia_2022.svg/512px-Logo_Gobierno_de_Colombia_2022.svg.png" 
      alt="Gobierno Digital"
      width={width}
      height={height}
      style={{ objectFit: 'contain' }}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
};

export default GobiernoDigitalLogo;




