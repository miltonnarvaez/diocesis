import React, { useState } from 'react';
import { getFileUrl } from '../utils/fileUtils';
import './NoticiaImage.css';

const NoticiaImage = ({ src, alt, className = '' }) => {
  // Procesar la URL para agregar el prefijo en producción
  const imageUrl = src ? getFileUrl(src) : null;
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  if (!src) {
    return (
      <div className={`noticia-image-placeholder ${className}`}>
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="#e9ecef" />
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#6c757d" fontSize="14">
            Sin imagen
          </text>
        </svg>
      </div>
    );
  }

  if (imageError) {
    return (
      <div className={`noticia-image-placeholder ${className}`}>
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="#e9ecef" />
          <circle cx="100" cy="80" r="20" fill="#6c757d" opacity="0.3" />
          <path d="M 60 140 L 100 100 L 140 140" stroke="#6c757d" strokeWidth="2" fill="none" opacity="0.3" />
          <text x="50%" y="170" textAnchor="middle" dominantBaseline="middle" fill="#6c757d" fontSize="12">
            Imagen no disponible
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div className={`noticia-image-wrapper ${className}`}>
      {imageLoading && (
        <div className="noticia-image-loading">
          <div className="spinner"></div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={alt || 'Imagen de noticia'}
        className="noticia-image"
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
        style={{ display: imageLoading ? 'none' : 'block' }}
      />
    </div>
  );
};

export default NoticiaImage;

















