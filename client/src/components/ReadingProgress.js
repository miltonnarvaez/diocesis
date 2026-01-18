import React, { useState, useEffect } from 'react';
import { FaBookOpen } from 'react-icons/fa';
import './ReadingProgress.css';

const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateProgress = () => {
      const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = windowHeight > 0 ? (window.scrollY / windowHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, scrolled)));

      // Mostrar solo si hay scroll significativo
      setIsVisible(scrolled > 5);

      // Calcular tiempo estimado de lectura restante (simplificado)
      if (scrolled > 0 && scrolled < 100) {
        // Estimación simple basada en scroll restante
        const remainingScroll = 100 - scrolled;
        // Asumir velocidad promedio de lectura (aproximadamente 1% por minuto)
        const estimatedMinutes = Math.ceil(remainingScroll / 10); // 10% por minuto
        
        if (estimatedMinutes > 0 && estimatedMinutes < 60) {
          setTimeRemaining(estimatedMinutes);
        } else {
          setTimeRemaining(null);
        }
      } else {
        setTimeRemaining(null);
      }
    };

    let rafId = null;
    const handleScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(updateProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateProgress(); // Inicial

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="reading-progress-container">
      <div className="reading-progress-bar">
        <div 
          className="reading-progress-fill" 
          style={{ width: `${progress}%` }}
        >
          <div className="reading-progress-indicator">
            <FaBookOpen />
          </div>
        </div>
      </div>
      {timeRemaining && (
        <div className="reading-progress-time">
          ~{timeRemaining} min restantes
        </div>
      )}
      <div className="reading-progress-percentage">
        {Math.round(progress)}%
      </div>
    </div>
  );
};

export default ReadingProgress;



