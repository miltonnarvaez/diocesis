import React, { createContext, useState, useContext, useEffect } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility debe ser usado dentro de AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  const [textSize, setTextSize] = useState(1);
  const [grayscale, setGrayscale] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [readableFont, setReadableFont] = useState(false);
  const [underlineLinks, setUnderlineLinks] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Aplicar estilos de accesibilidad al body
    const body = document.body;
    // Solo aplicar fontSize si es diferente de 1 (tamaño por defecto)
    if (textSize !== 1) {
      body.style.fontSize = `${textSize}rem`;
    } else {
      body.style.fontSize = '';
    }
    body.style.filter = grayscale ? 'grayscale(100%)' : 'none';
    body.classList.toggle('high-contrast', highContrast);
    body.classList.toggle('readable-font', readableFont);
    body.classList.toggle('underline-links', underlineLinks);
  }, [textSize, grayscale, highContrast, readableFont, underlineLinks]);

  const resetAccessibility = () => {
    setTextSize(1);
    setGrayscale(false);
    setHighContrast(false);
    setReadableFont(false);
    setUnderlineLinks(false);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        textSize,
        setTextSize,
        grayscale,
        setGrayscale,
        highContrast,
        setHighContrast,
        readableFont,
        setReadableFont,
        underlineLinks,
        setUnderlineLinks,
        isOpen,
        setIsOpen,
        resetAccessibility
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};


















