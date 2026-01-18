import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';
import {
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaClipboardList, FaComments, FaCheckCircle,
  FaUser, FaFileAlt
} from 'react-icons/fa';
import { useToast } from '../context/ToastContext';
import FormField from '../components/FormField';
import './Contacto.css';

const Contacto = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: ''
  });

  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formProgress, setFormProgress] = useState(0);
  const draftLoadedRef = useRef(false);

  // Funciones de validación
  const validateNombre = (value) => {
    if (!value || value.trim() === '') return 'Este campo es obligatorio';
    if (value.length < 3) return 'El nombre debe tener al menos 3 caracteres';
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'El nombre solo debe contener letras';
    return true;
  };

  const validateEmail = (value) => {
    if (!value || value.trim() === '') return 'Este campo es obligatorio';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Ingrese un email válido';
    return true;
  };

  const validateTelefono = (value) => {
    if (value && value.trim() !== '') {
      const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
      if (!phoneRegex.test(value)) return 'Ingrese un teléfono válido';
    }
    return true;
  };

  // Calcular progreso del formulario
  useEffect(() => {
    const fields = ['nombre', 'email', 'asunto', 'mensaje'];
    const filledFields = fields.filter(field => {
      return formData[field] && formData[field].toString().trim() !== '';
    }).length;
    setFormProgress(Math.round((filledFields / fields.length) * 100));
  }, [formData]);

  // Autoguardado en localStorage
  useEffect(() => {
    const saveDraft = () => {
      try {
        localStorage.setItem('contacto_draft', JSON.stringify({
          ...formData,
          savedAt: new Date().toISOString()
        }));
      } catch (error) {
        console.error('Error guardando borrador:', error);
      }
    };

    const timer = setTimeout(saveDraft, 1000);
    return () => clearTimeout(timer);
  }, [formData]);

  // Cargar borrador al montar (solo una vez)
  useEffect(() => {
    if (draftLoadedRef.current) return; // Ya se cargó
    
    try {
      const draft = localStorage.getItem('contacto_draft');
      const toastShown = sessionStorage.getItem('contacto_draft_toast_shown');
      
      if (draft && !toastShown) {
        const parsedDraft = JSON.parse(draft);
        const savedAt = new Date(parsedDraft.savedAt);
        const daysDiff = (new Date() - savedAt) / (1000 * 60 * 60 * 24);
        if (daysDiff < 7) {
          // Verificar si el borrador tiene datos reales
          const hasData = parsedDraft.nombre || parsedDraft.email || parsedDraft.asunto || parsedDraft.mensaje;
          if (hasData) {
            setFormData(prev => ({ ...prev, ...parsedDraft }));
            // Solo mostrar toast si hay datos significativos y no se ha mostrado en esta sesión
            if (parsedDraft.nombre || parsedDraft.email || parsedDraft.mensaje) {
              showToast('Borrador recuperado automáticamente', 'info', 3000);
              sessionStorage.setItem('contacto_draft_toast_shown', 'true');
            }
          } else {
            localStorage.removeItem('contacto_draft');
          }
        } else {
          localStorage.removeItem('contacto_draft');
        }
      }
      draftLoadedRef.current = true;
    } catch (error) {
      console.error('Error cargando borrador:', error);
      draftLoadedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.nombre || !formData.email || !formData.asunto || !formData.mensaje) {
      setError('Por favor complete todos los campos obligatorios');
      setLoading(false);
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor ingrese un email válido');
      setLoading(false);
      return;
    }

    try {
      await api.post('/contacto', formData);
      setEnviado(true);
      showToast('Mensaje enviado exitosamente. Te responderemos pronto.', 'success');
      
      // Limpiar borrador
      localStorage.removeItem('contacto_draft');
      
      // Resetear formulario
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        asunto: '',
        mensaje: ''
      });
      setFormProgress(0);
    } catch (err) {
      console.error('Error enviando mensaje de contacto:', err);
      const errorMsg = err.response?.data?.error || 'Error al enviar el mensaje. Por favor, intente nuevamente.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contacto-page page-container">
      <Breadcrumbs />
      <section className="section">
        <div className="container">
          <div className="page-header">
            <div className="page-header-icon"><FaEnvelope /></div>
            <div>
              <h1>Contacto</h1>
              <p>Estamos aquí para ayudarte. Envíanos tu mensaje y te responderemos lo antes posible.</p>
            </div>
          </div>

          <div className="contacto-cards-grid">
            <div className="contacto-card contacto-info-card">
              <div className="contacto-card-header">
                <div className="contacto-card-icon">📍</div>
                <h3>Información de Contacto</h3>
              </div>
              <div className="contacto-card-content">
                <div className="contacto-info-item">
                  <span className="contacto-icon"><FaMapMarkerAlt /></span>
                  <div>
                    <strong>Dirección</strong>
                    <p>Cra. 6 No. 7-01, Ipiales, Nariño</p>
                  </div>
                </div>
                <div className="contacto-info-item">
                  <span className="contacto-icon"><FaPhone /></span>
                  <div>
                    <strong>Teléfono</strong>
                    <p>+57 315 466 9018</p>
                  </div>
                </div>
                <div className="contacto-info-item">
                  <span className="contacto-icon"><FaEnvelope /></span>
                  <div>
                    <strong>Correo Electrónico</strong>
                    <p>diocesisdeipiales@gmail.com</p>
                  </div>
                </div>
                <div className="contacto-info-item">
                  <span className="contacto-icon"><FaClock /></span>
                  <div>
                    <strong>Horario de Atención</strong>
                    <p>Lunes a Viernes: 8:00 AM - 12:00 PM y 2:00 PM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="contacto-card contacto-pqrs-card">
              <div className="contacto-card-header">
                <div className="contacto-card-icon"><FaClipboardList /></div>
                <h3>PQRS</h3>
              </div>
              <div className="contacto-card-content">
                <p className="contacto-card-question">¿Tiene alguna petición, queja, reclamo, sugerencia o denuncia?</p>
                <a href="/pqrsd" className="contacto-card-button">
                  Envíe su PQRS aquí
                </a>
              </div>
            </div>

            <div className="contacto-card contacto-mensaje-card">
              <div className="contacto-card-header">
                <div className="contacto-card-icon"><FaComments /></div>
                <h3>Mensaje General</h3>
              </div>
              <div className="contacto-card-content">
                <p className="contacto-card-question">¿Tiene alguna consulta o mensaje general?</p>
                <button 
                  onClick={() => {
                    const formSection = document.querySelector('.contacto-form-section');
                    if (formSection) {
                      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="contacto-card-button"
                >
                  Enviar Mensaje de Contacto
                </button>
              </div>
            </div>
          </div>

          <div className="contacto-form-section">
              {enviado ? (
                <div className="contacto-success">
                  <div className="success-icon">✓</div>
                  <h2>¡Mensaje Enviado!</h2>
                  <p>Gracias por contactarnos. Hemos recibido tu mensaje y te responderemos a la brevedad posible.</p>
                  <button 
                    onClick={() => setEnviado(false)} 
                    className="btn btn-secondary"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <form className="contacto-form" onSubmit={handleSubmit}>
                  <h2 className="contacto-form-title">Enviar Mensaje de Contacto</h2>
                  
                  {error && (
                    <div className="form-error">
                      {error}
                    </div>
                  )}

                  {/* Progress Indicator */}
                  {formProgress > 0 && (
                    <div className="form-progress-container">
                      <div className="form-progress-bar">
                        <div 
                          className="form-progress-fill" 
                          style={{ width: `${formProgress}%` }}
                        ></div>
                      </div>
                      <span className="form-progress-text">{formProgress}% completado</span>
                    </div>
                  )}

                  <FormField
                    label="Nombre Completo"
                    name="nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    validation={validateNombre}
                    icon={FaUser}
                    placeholder="Ingrese su nombre completo"
                    helpText="Mínimo 3 caracteres, solo letras"
                  />

                  <FormField
                    label="Correo Electrónico"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    validation={validateEmail}
                    icon={FaEnvelope}
                    placeholder="ejemplo@correo.com"
                  />

                  <FormField
                    label="Teléfono"
                    name="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={handleChange}
                    validation={validateTelefono}
                    icon={FaPhone}
                    placeholder="+57 (2) XXX-XXXX"
                    helpText="Opcional"
                  />

                  <FormField
                    label="Asunto"
                    name="asunto"
                    type="text"
                    value={formData.asunto}
                    onChange={handleChange}
                    required
                    icon={FaFileAlt}
                    placeholder="Ingrese el asunto de su mensaje"
                    maxLength={255}
                    showCharCount
                  />

                  <div className="form-field">
                    <label htmlFor="mensaje" className="form-field-label">
                      Mensaje <span className="required-asterisk">*</span>
                    </label>
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      rows="6"
                      required
                      className="form-field-input"
                      placeholder="Escriba su mensaje aquí..."
                      maxLength={2000}
                    />
                    <div className="form-field-char-count">
                      {formData.mensaje?.length || 0} / 2000 caracteres
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar Mensaje'}
                  </button>
                </form>
              )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contacto;






