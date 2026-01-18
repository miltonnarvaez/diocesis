import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import './AnimatedSection.css';

const AnimatedSection = ({ children, className = '', animationType = 'fadeInUp', id, ...props }) => {
  // En móvil, usar un threshold más bajo y rootMargin más permisivo
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const [ref, isIntersecting, hasIntersected] = useIntersectionObserver({
    threshold: isMobile ? 0.01 : 0.1,
    rootMargin: isMobile ? '100px 0px 0px 0px' : '0px 0px -50px 0px'
  });

  // Si es una sección hero, siempre mostrar inmediatamente
  const isHeroSection = className.includes('hero') || className.includes('-hero');
  
  // En móvil o secciones hero, mostrar inmediatamente para evitar problemas de visibilidad
  const shouldAnimate = hasIntersected || isMobile || isHeroSection;
  const animationClass = shouldAnimate ? `animate-${animationType}` : '';
  const visibleClass = shouldAnimate ? 'visible' : '';
  const combinedClassName = `animated-section ${animationClass} ${visibleClass} ${className}`.trim();

  return (
    <section
      ref={ref}
      id={id}
      className={combinedClassName}
      {...props}
    >
      {children}
    </section>
  );
};

export default AnimatedSection;
