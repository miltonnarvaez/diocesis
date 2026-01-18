import React, { useRef } from 'react';
import './RippleButton.css';

const RippleButton = ({ 
  children, 
  className = '', 
  onClick, 
  disabled = false,
  type = 'button',
  ...props 
}) => {
  const buttonRef = useRef(null);

  const createRipple = (event) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add('ripple');

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);

    if (onClick) {
      onClick(event);
    }
  };

  return (
    <button
      ref={buttonRef}
      type={type}
      className={`ripple-button ${className}`}
      onClick={createRipple}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default RippleButton;





