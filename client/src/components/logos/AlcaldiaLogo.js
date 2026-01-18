import React from 'react';

const AlcaldiaLogo = ({ width = 70, height = 70 }) => {
  return (
    <img 
      src={`${process.env.PUBLIC_URL || ''}/images/escudo.png`}
      alt="Alcaldía de Ipiales"
      width={width}
      height={height}
      style={{ objectFit: 'contain' }}
      loading="lazy"
    />
  );
};

export default AlcaldiaLogo;




