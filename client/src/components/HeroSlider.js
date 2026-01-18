import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './HeroSlider.css';

const HeroSlider = ({ slides = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Si no hay slides, usar slides por defecto
  const defaultSlides = [
    {
      id: 1,
      title: '',
      subtitle: '',
      image: `${process.env.PUBLIC_URL || ''}/images/slider0.png`,
      link: '/acerca'
    },
    {
      id: 2,
      title: '',
      subtitle: '',
      image: `${process.env.PUBLIC_URL || ''}/images/slider1.jpg`,
      link: '/historia'
    },
    {
      id: 3,
      title: '',
      subtitle: '',
      image: `${process.env.PUBLIC_URL || ''}/images/slider2.jpg`,
      link: '/acerca'
    }
  ];

  const slidesToShow = slides.length > 0 ? slides : defaultSlides;

  // Auto-play del slider
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesToShow.length);
    }, 6000); // Cambiar cada 6 segundos

    return () => clearInterval(interval);
  }, [isAutoPlaying, slidesToShow.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000); // Reanudar auto-play después de 8 segundos
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slidesToShow.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slidesToShow.length) % slidesToShow.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  return (
    <div className="hero-slider">
      <div className="slider-container">
        {slidesToShow.map((slide, index) => (
          <div
            key={slide.id || index}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 0%',
              backgroundRepeat: 'no-repeat',
              backgroundAttachment: 'scroll'
            }}
            role="img"
            aria-label={slide.title || `Slide ${index + 1}`}
          >
            <div className="slide-overlay"></div>
          </div>
        ))}
      </div>

      {/* Controles de navegación */}
      <button className="slider-nav slider-prev" onClick={prevSlide} aria-label="Slide anterior">
        <FaChevronLeft />
      </button>
      <button className="slider-nav slider-next" onClick={nextSlide} aria-label="Slide siguiente">
        <FaChevronRight />
      </button>

      {/* Indicadores */}
      <div className="slider-indicators">
        {slidesToShow.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Ir al slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;







