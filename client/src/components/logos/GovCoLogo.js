import React, { useState } from 'react';

const GovCoLogo = ({ width = 70, height = 70 }) => {
  const [imageError, setImageError] = useState(false);
  const [localImageError, setLocalImageError] = useState(false);

  if (imageError && localImageError) {
    // Fallback final a SVG
    return (
      <svg width={width} height={height} viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="10" width="20" height="40" fill="#FFCD00" rx="2"/>
        <rect x="0" y="20" width="20" height="10" fill="#003893"/>
        <rect x="0" y="30" width="20" height="10" fill="#CE1126"/>
        <line x1="20" y1="30" x2="25" y2="30" stroke="#333" strokeWidth="1"/>
        <text x="30" y="35" fontSize="18" fontWeight="bold" fill="#003893" fontFamily="Arial, sans-serif">GOV.CO</text>
      </svg>
    );
  }

  if (imageError) {
    // Fallback a logo local
    return (
      <img 
        src={`${process.env.PUBLIC_URL || ''}/images/logoGovCO.png`}
        alt="GOV.CO"
        width={width}
        height={height}
        style={{ objectFit: 'contain' }}
        onError={() => setLocalImageError(true)}
      />
    );
  }

  return (
    <img 
      src="https://www.gov.co/images/logo-govco.svg" 
      alt="GOV.CO"
      width={width}
      height={height}
      style={{ objectFit: 'contain' }}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
};

export default GovCoLogo;




