import React, { useState, useEffect, useRef } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ onFinish }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const hasFinishedRef = useRef(false);
  const animationTimeoutRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  useEffect(() => {
    const startTime = Date.now();
    const minDisplayTime = 2000; // Mínimo 2 segundos para mostrar la presentación
    const maxDisplayTime = 3500; // Máximo 3.5 segundos

    const hideSplash = () => {
      if (hasFinishedRef.current) return;
      
      setIsAnimating(true);
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        if (!hasFinishedRef.current && onFinish) {
          hasFinishedRef.current = true;
          onFinish();
        }
      }, 500); // 0.5s para la animación de salida
    };

    const checkAndHide = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDisplayTime - elapsed);
      
      setTimeout(hideSplash, remaining);
    };

    // Si la página ya está cargada, mostrar la presentación por el tiempo mínimo
    if (document.readyState === 'complete') {
      checkAndHide();
    } else {
      // Esperar a que la página cargue, pero con timeout máximo
      const handleLoad = () => {
        checkAndHide();
      };
      
      window.addEventListener('load', handleLoad, { once: true });
      
      // Timeout de seguridad: máximo 3.5 segundos
      animationTimeoutRef.current = setTimeout(hideSplash, maxDisplayTime);
    }

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      window.removeEventListener('load', checkAndHide);
    };
  }, [onFinish]);

  // No renderizar si ya no es visible
  if (!isVisible) return null;

  const logoSrc = `${process.env.PUBLIC_URL || ''}/images/logo.png`;

  return (
    <div className={`splash-screen ${isAnimating ? 'fade-out' : 'fade-in'}`}>
      <div className="splash-content">
        <div className="splash-logo">
          <img 
            src={logoSrc}
            alt="Logo Diócesis de Ipiales"
            className="splash-logo-img"
            onError={(e) => {
              // Fallback a escudo_Colombia.png si logo.png falla
              const fallbackSrc = `${process.env.PUBLIC_URL || ''}/images/escudo_Colombia.png`;
              if (e.target.src !== fallbackSrc) {
                e.target.src = fallbackSrc;
              }
            }}
          />
        </div>
        <div className="splash-text">
          <h1>DIÓCESIS DE IPIALES</h1>
          <p>En comunión, participación y misión</p>
        </div>
      </div>
      {/* Loader de puntos fuera del content para posición fija */}
      <div className="splash-loader">
        <div className="loader-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;

