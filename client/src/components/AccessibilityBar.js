import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { FaMoon, FaSun } from 'react-icons/fa';
import './AccessibilityBar.css';

const AccessibilityBar = () => {
  const {
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
  } = useAccessibility();
  const { t } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const barRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [voiceControl, setVoiceControl] = useState(false);
  const [listeningText, setListeningText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const updateMenuPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      updateMenuPosition();
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', updateMenuPosition);
      window.addEventListener('scroll', updateMenuPosition, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [isOpen, setIsOpen]);

  const increaseText = () => {
    setTextSize(Math.min(textSize + 0.1, 1.5));
  };

  const decreaseText = () => {
    setTextSize(Math.max(textSize - 0.1, 0.8));
  };

  // Comandos de voz
  useEffect(() => {
    if (!voiceControl) {
      // Detener reconocimiento si se desactiva
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignorar errores al detener
        }
        recognitionRef.current = null;
      }
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tu navegador no soporta reconocimiento de voz. Prueba con Chrome o Edge.');
      setVoiceControl(false);
      return;
    }

    // Verificar si estamos en HTTPS o localhost (requerido para algunos navegadores)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      console.warn('El reconocimiento de voz puede requerir HTTPS en producción');
    }

    // Limpiar reconocimiento anterior si existe
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignorar errores
      }
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = true;
    recognition.interimResults = true; // Habilitar resultados intermedios para mostrar en tiempo real
    recognition.maxAlternatives = 1;

    let isRestarting = false;

    recognition.onresult = (event) => {
      if (!voiceControl) return;
      
      // Mostrar resultados intermedios
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Mostrar texto reconocido (intermedio y final)
      const displayText = finalTranscript || interimTranscript;
      setListeningText(displayText);
      
      if (finalTranscript) {
        const command = finalTranscript.toLowerCase().trim();
        console.log('Comando reconocido:', command);
        setListeningText(''); // Limpiar después de procesar
        
        // Comandos de navegación
        if (command.includes('inicio') || command.includes('home')) {
          navigate('/');
        } else if (command.includes('acerca')) {
          navigate('/acerca');
        } else if (command.includes('noticias')) {
          navigate('/noticias');
        } else if (command.includes('convocatorias')) {
          navigate('/convocatorias');
        } else if (command.includes('gaceta')) {
          navigate('/gaceta');
        } else if (command.includes('sesiones')) {
          navigate('/sesiones');
        } else if (command.includes('transparencia')) {
          navigate('/transparencia');
        } else if (command.includes('galería') || command.includes('galeria')) {
          navigate('/galeria');
        } else if (command.includes('encuestas')) {
          navigate('/encuestas');
        } else if (command.includes('trámites') || command.includes('tramites')) {
          navigate('/tramites');
        } else if (command.includes('contacto')) {
          navigate('/#contacto');
        } else if (command.includes('pqrs')) {
          navigate('/pqrsd');
        } else if (command.includes('cerrar') || command.includes('desactivar') || command.includes('apagar')) {
          setVoiceControl(false);
        } else {
          // Si no coincide con ningún comando, mostrar mensaje
          setListeningText(`Comando no reconocido: "${command}"`);
          setTimeout(() => setListeningText(''), 2000);
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Error en reconocimiento de voz:', event.error, event);
      
      if (event.error === 'no-speech') {
        // "no-speech" es normal cuando no se detecta voz, no es un error crítico
        // No mostrar error, solo mantener el estado de escucha
        console.log('No se detectó voz, continuando escucha...');
        setListeningText('Escuchando... (di un comando)');
        // No reiniciar, el onend se encargará si es necesario
        return;
      } else if (event.error === 'aborted') {
        // Reconocimiento abortado, no reiniciar
        console.log('Reconocimiento abortado');
        setListeningText('Reconocimiento detenido');
        return;
      } else if (event.error === 'network') {
        setListeningText('Error de red. Verifica tu conexión.');
        setTimeout(() => {
          alert('Error de red en el reconocimiento de voz. Verifica tu conexión.');
          setVoiceControl(false);
        }, 2000);
      } else if (event.error === 'not-allowed') {
        setListeningText('Permiso denegado');
        setTimeout(() => {
          alert('Permiso de micrófono denegado. Por favor, permite el acceso al micrófono en la configuración del navegador.');
          setVoiceControl(false);
        }, 2000);
      } else if (event.error === 'audio-capture') {
        setListeningText('No se detectó micrófono');
        setTimeout(() => {
          alert('No se detectó ningún micrófono. Verifica que tengas un micrófono conectado.');
          setVoiceControl(false);
        }, 2000);
      } else {
        setListeningText(`Error: ${event.error}`);
        // Otros errores: intentar reiniciar una vez
        if (!isRestarting && voiceControl) {
          isRestarting = true;
          setTimeout(() => {
            if (voiceControl && recognitionRef.current === recognition) {
              try {
                recognition.start();
                isRestarting = false;
                setListeningText('Reiniciando...');
              } catch (e) {
                console.error('Error al reiniciar reconocimiento:', e);
                setListeningText('Error al reiniciar');
                setVoiceControl(false);
              }
            }
          }, 2000);
        }
      }
    };

    recognition.onend = () => {
      if (!voiceControl) return;
      
      console.log('Reconocimiento finalizado, reiniciando...');
      
      // Solo reiniciar si no estamos en proceso de reinicio y el control está activo
      if (!isRestarting && recognitionRef.current === recognition) {
        isRestarting = true;
        // Esperar un poco más antes de reiniciar para evitar bucles
        setTimeout(() => {
          if (voiceControl && recognitionRef.current === recognition) {
            try {
              recognition.start();
              isRestarting = false;
              setListeningText('Escuchando... (di un comando)');
            } catch (e) {
              console.error('Error al reiniciar reconocimiento:', e);
              // Si falla el reinicio, desactivar
              setVoiceControl(false);
              setListeningText('Error al reiniciar');
            }
          }
        }, 1000);
      }
    };

    recognition.onstart = () => {
      console.log('Reconocimiento de voz iniciado');
      setIsListening(true);
      setListeningText('Escuchando... (di un comando como "inicio", "noticias", "contacto")');
      isRestarting = false;
    };

    recognition.onspeechstart = () => {
      console.log('Inicio de habla detectado');
      setIsListening(true);
      setListeningText('Hablando...');
    };

    recognition.onspeechend = () => {
      console.log('Fin de habla detectado');
      setIsListening(false);
      setListeningText('Procesando...');
    };

    recognition.onaudiostart = () => {
      console.log('Audio iniciado');
      setListeningText('Micrófono activo - Escuchando...');
    };

    recognition.onaudioend = () => {
      console.log('Audio finalizado');
    };

    recognition.onnomatch = () => {
      console.log('No se encontró coincidencia');
      setListeningText('No se entendió. Intenta de nuevo.');
      setTimeout(() => setListeningText('Escuchando...'), 2000);
    };

    recognitionRef.current = recognition;
    
    // Verificar permisos del micrófono antes de iniciar
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        console.log('Permisos de micrófono confirmados');
        try {
          recognition.start();
          setListeningText('Iniciando reconocimiento...');
        } catch (e) {
          console.error('Error al iniciar reconocimiento:', e);
          setListeningText(`Error al iniciar: ${e.message}`);
          setTimeout(() => {
            alert('No se pudo iniciar el reconocimiento de voz. Verifica los permisos del micrófono.');
            setVoiceControl(false);
          }, 2000);
        }
      })
      .catch((err) => {
        console.error('Error al obtener permisos de micrófono:', err);
        setListeningText('Error: Permisos de micrófono requeridos');
        setTimeout(() => {
          alert('Se requiere permiso para acceder al micrófono. Por favor, permite el acceso en la configuración del navegador.');
          setVoiceControl(false);
        }, 2000);
      });

    return () => {
      if (recognitionRef.current === recognition) {
        try {
          recognition.stop();
        } catch (e) {
          // Ignorar errores al limpiar
        }
        recognitionRef.current = null;
        setIsListening(false);
        setListeningText('');
      }
    };
  }, [voiceControl, navigate]);

  return (
    <div className={`accessibility-bar ${isOpen ? 'open' : ''}`} ref={barRef}>
      <button
        ref={buttonRef}
        className="accessibility-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('accesibilidad.titulo')}
        title={t('accesibilidad.titulo')}
      >
      </button>
      {isOpen && (
        <div 
          className="accessibility-menu"
          ref={menuRef}
          style={{
            top: `${menuPosition.top}px`,
            right: `${menuPosition.right}px`
          }}
        >
          <button onClick={increaseText} className="accessibility-option">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-4v-2h4v-2h-4V9h4V7H9v10h5v2z"/>
            </svg>
            {t('accesibilidad.aumentarTexto')}
          </button>
          <button onClick={decreaseText} className="accessibility-option">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 10H9v-2h5v2z"/>
            </svg>
            {t('accesibilidad.disminuirTexto')}
          </button>
          <button
            onClick={() => setGrayscale(!grayscale)}
            className={`accessibility-option ${grayscale ? 'active' : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            </svg>
            {t('accesibilidad.escalaGrises')}
          </button>
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`accessibility-option ${highContrast ? 'active' : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            {t('accesibilidad.altoContraste')}
          </button>
          <button
            onClick={() => setReadableFont(!readableFont)}
            className={`accessibility-option ${readableFont ? 'active' : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z"/>
            </svg>
            {t('accesibilidad.fuenteLegible')}
          </button>
          <button
            onClick={() => setUnderlineLinks(!underlineLinks)}
            className={`accessibility-option ${underlineLinks ? 'active' : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.79 16.95c3.03-.39 5.21-3.11 5.21-6.16V4.25C18 3.56 17.44 3 16.75 3s-1.25.56-1.25 1.25v6.65c0 1.67-1.13 3.19-2.77 3.52V3.25C12.73 2.56 12.17 2 11.48 2S10.23 2.56 10.23 3.25V13.5c-1.6-.33-2.77-1.85-2.77-3.6V3.25C7.46 2.56 6.9 2 6.21 2S4.96 2.56 4.96 3.25v6.65c0 3.05 2.18 5.77 5.21 6.16v1.34c0 .69.56 1.25 1.25 1.25s1.25-.56 1.25-1.25v-1.34c.25-.03.5-.08.75-.13v1.28c0 .69.56 1.25 1.25 1.25s1.25-.56 1.25-1.25v-1.28c.25.05.5.1.75.13zm-1.04-2.09c-.25.05-.5.09-.75.13v-1.28c.25-.03.5-.08.75-.13v1.28z"/>
            </svg>
            {t('accesibilidad.subrayarEnlaces')}
          </button>
          <button
            onClick={toggleTheme}
            className={`accessibility-option ${isDarkMode ? 'active' : ''}`}
            aria-label={isDarkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
            {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
          </button>
          <button
            onClick={() => setVoiceControl(!voiceControl)}
            className={`accessibility-option ${voiceControl ? 'active' : ''}`}
            aria-label="Control por voz"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
            </svg>
            {voiceControl ? 'Desactivar Voz' : 'Navegación por Voz'}
            {voiceControl && <span className="voice-indicator">●</span>}
          </button>
          {voiceControl && listeningText && (
            <div className="voice-listening-text">
              <span className="voice-listening-label">Escuchando:</span>
              <span className="voice-listening-content">{listeningText}</span>
            </div>
          )}
          <button onClick={resetAccessibility} className="accessibility-option reset">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            {t('accesibilidad.restablecer')}
          </button>
        </div>
      )}
    </div>
  );
};

export default AccessibilityBar;


