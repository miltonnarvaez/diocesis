import React from 'react';
import './TexturePattern.css';

const TexturePattern = () => {
  return (
    <div className="texture-pattern" aria-hidden="true">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="texturePattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            {/* Sol de 16 picos (símbolo Pasto) */}
            <g transform="translate(20, 20)">
              <circle cx="15" cy="15" r="8" fill="none" stroke="rgba(108, 117, 125, 0.25)" strokeWidth="1.5"/>
              {[...Array(16)].map((_, i) => {
                const angle = (i * 360) / 16;
                const rad = (angle * Math.PI) / 180;
                const x1 = 15 + Math.cos(rad) * 8;
                const y1 = 15 + Math.sin(rad) * 8;
                const x2 = 15 + Math.cos(rad) * 12;
                const y2 = 15 + Math.sin(rad) * 12;
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="rgba(108, 117, 125, 0.25)"
                    strokeWidth="1.5"
                  />
                );
              })}
            </g>
            
            {/* Manos unidas (ayuda mutua) */}
            <g transform="translate(60, 20)">
              <circle cx="12" cy="18" r="4" fill="none" stroke="rgba(108, 117, 125, 0.25)" strokeWidth="1.5"/>
              <circle cx="18" cy="18" r="4" fill="none" stroke="rgba(108, 117, 125, 0.25)" strokeWidth="1.5"/>
              <path d="M 8 18 Q 12 14 15 18 Q 18 14 22 18" fill="none" stroke="rgba(108, 117, 125, 0.25)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="10" y1="12" x2="10" y2="18" stroke="rgba(108, 117, 125, 0.25)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="20" y1="12" x2="20" y2="18" stroke="rgba(108, 117, 125, 0.25)" strokeWidth="1.5" strokeLinecap="round"/>
            </g>
            
            {/* Espiral (símbolo de vida y crecimiento) */}
            <g transform="translate(100, 20)">
              <path d="M 15 15 Q 15 10 20 10 Q 25 10 25 15 Q 25 20 20 20 Q 15 20 15 15 Q 15 12 18 12 Q 21 12 21 15 Q 21 18 18 18 Q 15 18 15 15" 
                    fill="none" stroke="rgba(108, 117, 125, 0.25)" strokeWidth="1.5"/>
            </g>
            
            {/* Círculo con puntos (símbolo de comunidad) */}
            <g transform="translate(140, 20)">
              <circle cx="15" cy="15" r="10" fill="none" stroke="rgba(108, 117, 125, 0.25)" strokeWidth="1.5"/>
              <circle cx="15" cy="10" r="1.5" fill="rgba(108, 117, 125, 0.25)"/>
              <circle cx="15" cy="20" r="1.5" fill="rgba(108, 117, 125, 0.25)"/>
              <circle cx="10" cy="15" r="1.5" fill="rgba(108, 117, 125, 0.25)"/>
              <circle cx="20" cy="15" r="1.5" fill="rgba(108, 117, 125, 0.25)"/>
            </g>
            
            {/* Sol con círculo central */}
            <g transform="translate(20, 60)">
              <circle cx="15" cy="15" r="6" fill="none" stroke="rgba(108, 117, 125, 0.25)" strokeWidth="1.5"/>
              <circle cx="15" cy="15" r="2" fill="rgba(108, 117, 125, 0.25)"/>
              {[...Array(8)].map((_, i) => {
                const angle = (i * 360) / 8;
                const rad = (angle * Math.PI) / 180;
                const x1 = 15 + Math.cos(rad) * 6;
                const y1 = 15 + Math.sin(rad) * 6;
                const x2 = 15 + Math.cos(rad) * 9;
                const y2 = 15 + Math.sin(rad) * 9;
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="rgba(108, 117, 125, 0.25)"
                    strokeWidth="1.5"
                  />
                );
              })}
            </g>
            
            {/* Manos en círculo (unión) */}
            <g transform="translate(60, 60)">
              <circle cx="15" cy="15" r="8" fill="none" stroke="rgba(108, 117, 125, 0.25)" strokeWidth="1.5"/>
              <circle cx="10" cy="12" r="2.5" fill="none" stroke="rgba(108, 117, 125, 0.25)" strokeWidth="1.5"/>
              <circle cx="20" cy="12" r="2.5" fill="none" stroke="rgba(108, 117, 125, 0.25)" strokeWidth="1.5"/>
              <path d="M 8 18 Q 15 14 22 18" fill="none" stroke="rgba(108, 117, 125, 0.25)" strokeWidth="1.5" strokeLinecap="round"/>
            </g>
            
            {/* Patrón geométrico (diseño tradicional) */}
            <g transform="translate(100, 60)">
              <rect x="10" y="10" width="10" height="10" fill="none" stroke="rgba(108, 117, 125, 0.25)" strokeWidth="1.5"/>
              <line x1="15" y1="10" x2="15" y2="20" stroke="rgba(108, 117, 125, 0.25)" strokeWidth="1.5"/>
              <line x1="10" y1="15" x2="20" y2="15" stroke="rgba(108, 117, 125, 0.25)" strokeWidth="1.5"/>
              <circle cx="15" cy="15" r="2" fill="rgba(108, 117, 125, 0.25)"/>
            </g>
            
            {/* Sol de 8 picos */}
            <g transform="translate(140, 60)">
              <circle cx="15" cy="15" r="7" fill="none" stroke="rgba(108, 117, 125, 0.25)" strokeWidth="1.5"/>
              {[...Array(8)].map((_, i) => {
                const angle = (i * 360) / 8;
                const rad = (angle * Math.PI) / 180;
                const x1 = 15 + Math.cos(rad) * 7;
                const y1 = 15 + Math.sin(rad) * 7;
                const x2 = 15 + Math.cos(rad) * 11;
                const y2 = 15 + Math.sin(rad) * 11;
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="rgba(108, 117, 125, 0.25)"
                    strokeWidth="1.5"
                  />
                );
              })}
            </g>
            
            {/* Repetición del patrón */}
            <g transform="translate(20, 100)">
              <circle cx="15" cy="15" r="8" fill="none" stroke="rgba(108, 117, 125, 0.25)" strokeWidth="1.5"/>
              {[...Array(16)].map((_, i) => {
                const angle = (i * 360) / 16;
                const rad = (angle * Math.PI) / 180;
                const x1 = 15 + Math.cos(rad) * 8;
                const y1 = 15 + Math.sin(rad) * 8;
                const x2 = 15 + Math.cos(rad) * 12;
                const y2 = 15 + Math.sin(rad) * 12;
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="rgba(108, 117, 125, 0.25)"
                    strokeWidth="1.5"
                  />
                );
              })}
            </g>
            
            <g transform="translate(60, 100)">
              <circle cx="12" cy="18" r="4" fill="none" stroke="rgba(108, 117, 125, 0.25)" strokeWidth="1.5"/>
              <circle cx="18" cy="18" r="4" fill="none" stroke="rgba(108, 117, 125, 0.25)" strokeWidth="1.5"/>
              <path d="M 8 18 Q 12 14 15 18 Q 18 14 22 18" fill="none" stroke="rgba(108, 117, 125, 0.25)" strokeWidth="1.5" strokeLinecap="round"/>
            </g>
            
            <g transform="translate(100, 100)">
              <path d="M 15 15 Q 15 10 20 10 Q 25 10 25 15 Q 25 20 20 20 Q 15 20 15 15" 
                    fill="none" stroke="rgba(108, 117, 125, 0.25)" strokeWidth="1.5"/>
            </g>
            
            <g transform="translate(140, 100)">
              <circle cx="15" cy="15" r="10" fill="none" stroke="rgba(108, 117, 125, 0.25)" strokeWidth="1.5"/>
              <circle cx="15" cy="10" r="1.5" fill="rgba(108, 117, 125, 0.25)"/>
              <circle cx="15" cy="20" r="1.5" fill="rgba(108, 117, 125, 0.25)"/>
              <circle cx="10" cy="15" r="1.5" fill="rgba(108, 117, 125, 0.25)"/>
              <circle cx="20" cy="15" r="1.5" fill="rgba(108, 117, 125, 0.25)"/>
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#texturePattern)" opacity="0.08" style={{background: 'transparent'}}/>
      </svg>
    </div>
  );
};

export default TexturePattern;

