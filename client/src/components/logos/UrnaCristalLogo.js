import React, { useState } from 'react';

const UrnaCristalLogo = ({ width = 70, height = 70 }) => {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <svg width={width} height={height} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="crystalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4A90E2" stopOpacity="0.9"/>
            <stop offset="50%" stopColor="#87CEEB" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#B0E0E6" stopOpacity="0.9"/>
          </linearGradient>
        </defs>
        <rect x="20" y="25" width="60" height="60" fill="url(#crystalGradient)" stroke="#2E5C8A" strokeWidth="2.5" rx="3"/>
        <path d="M 20 25 L 35 10 L 95 10 L 80 25 Z" fill="#87CEEB" opacity="0.8" stroke="#2E5C8A" strokeWidth="2.5"/>
        <path d="M 80 25 L 95 10 L 95 70 L 80 85 Z" fill="#4A90E2" opacity="0.7" stroke="#2E5C8A" strokeWidth="2.5"/>
        <line x1="50" y1="25" x2="50" y2="85" stroke="#2E5C8A" strokeWidth="1.5" opacity="0.6"/>
        <line x1="20" y1="55" x2="80" y2="55" stroke="#2E5C8A" strokeWidth="1.5" opacity="0.6"/>
      </svg>
    );
  }

  return (
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Logo_Urna_de_Cristal.png/512px-Logo_Urna_de_Cristal.png" 
      alt="Urna de Cristal"
      width={width}
      height={height}
      style={{ objectFit: 'contain' }}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
};

export default UrnaCristalLogo;




