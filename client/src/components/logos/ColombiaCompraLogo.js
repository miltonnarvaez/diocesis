import React, { useState } from 'react';

const ColombiaCompraLogo = ({ width = 70, height = 70 }) => {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <svg width={width} height={height} viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="5" width="6" height="50" fill="#000"/>
        <rect x="9" y="5" width="3" height="50" fill="#000"/>
        <rect x="15" y="5" width="6" height="50" fill="#000"/>
        <rect x="24" y="5" width="2" height="50" fill="#000"/>
        <rect x="29" y="5" width="6" height="50" fill="#000"/>
        <rect x="38" y="5" width="3" height="50" fill="#000"/>
        <rect x="44" y="5" width="4" height="50" fill="#000"/>
        <rect x="55" y="5" width="10" height="18" fill="#FFCD00"/>
        <rect x="55" y="23" width="10" height="18" fill="#003893"/>
        <rect x="55" y="41" width="10" height="18" fill="#CE1126"/>
        <text x="70" y="32" fontSize="11" fontWeight="600" fill="#333" fontFamily="Arial, sans-serif">Colombia</text>
        <text x="70" y="45" fontSize="11" fontWeight="600" fill="#333" fontFamily="Arial, sans-serif">Compra</text>
      </svg>
    );
  }

  return (
    <img 
      src="https://www.colombiacompra.gov.co/sites/default/files/logo-colombia-compra-eficiente.png" 
      alt="Colombia Compra Eficiente"
      width={width}
      height={height}
      style={{ objectFit: 'contain' }}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
};

export default ColombiaCompraLogo;




