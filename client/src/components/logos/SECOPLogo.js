import React, { useState } from 'react';

const SECOPLogo = ({ width = 70, height = 70 }) => {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <svg width={width} height={height} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="15" y="15" width="70" height="70" fill="#dc3545" rx="6"/>
        <rect x="20" y="20" width="60" height="60" fill="none" stroke="#fff" strokeWidth="3" rx="4"/>
        <path d="M 35 50 L 50 50 L 45 42 M 50 50 L 45 58" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <text x="50" y="80" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#fff" fontFamily="Arial, sans-serif">SECOP</text>
      </svg>
    );
  }

  return (
    <img 
      src="https://www.contratacion.gov.co/sites/default/files/logo-secop.png" 
      alt="SECOP"
      width={width}
      height={height}
      style={{ objectFit: 'contain' }}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
};

export default SECOPLogo;




