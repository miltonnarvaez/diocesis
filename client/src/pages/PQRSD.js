import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';
import { FaSearch, FaUser, FaIdCard, FaPhone, FaEnvelope, FaFileAlt, FaAlignLeft } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';
import FormField from '../components/FormField';
import './PQRSD.css';

const PQRSD = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    tipo: 'peticion',
    grupo_interes: 'general',
    nombre: '',
    documento: '',
    email: '',
    telefono: '',
    asunto: '',
    descripcion: '',
    aceptaTerminos: false
  });

  const [enviado, setEnviado] = useState(false);
  const [numeroRadicado, setNumeroRadicado] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formProgress, setFormProgress] = useState(0);
  const draftLoadedRef = useRef(false);

  // Funciones de validación
  const validateDocumento = (value) => {
    if (!value || value.trim() === '') return 'Este campo es obligatorio';
    if (value.length < 5) return 'El documento debe tener al menos 5 caracteres';
    if (!/^[0-9]+$/.test(value)) return 'El documento solo debe contener números';
    return true;
  };

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
    const fields = ['tipo', 'nombre', 'documento', 'email', 'asunto', 'descripcion', 'aceptaTerminos'];
    const filledFields = fields.filter(field => {
      if (field === 'aceptaTerminos') return formData[field];
      return formData[field] && formData[field].toString().trim() !== '';
    }).length;
    setFormProgress(Math.round((filledFields / fields.length) * 100));
  }, [formData]);

  // Autoguardado en localStorage
  useEffect(() => {
    const saveDraft = () => {
      try {
        localStorage.setItem('pqrsd_draft', JSON.stringify({
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
      const draft = localStorage.getItem('pqrsd_draft');
      const toastShown = sessionStorage.getItem('pqrsd_draft_toast_shown');
      
      if (draft && !toastShown) {
        const parsedDraft = JSON.parse(draft);
        // Solo cargar si tiene menos de 7 días
        const savedAt = new Date(parsedDraft.savedAt);
        const daysDiff = (new Date() - savedAt) / (1000 * 60 * 60 * 24);
        if (daysDiff < 7) {
          // Verificar si el borrador tiene datos reales
          const hasData = parsedDraft.nombre || parsedDraft.email || parsedDraft.asunto || parsedDraft.descripcion;
          if (hasData) {
            setFormData(prev => ({ ...prev, ...parsedDraft }));
            // Solo mostrar toast si hay datos significativos y no se ha mostrado en esta sesión
            if (parsedDraft.nombre || parsedDraft.email || parsedDraft.descripcion) {
              showToast('Borrador recuperado automáticamente', 'info', 3000);
              sessionStorage.setItem('pqrsd_draft_toast_shown', 'true');
            }
          } else {
            localStorage.removeItem('pqrsd_draft');
          }
        } else {
          localStorage.removeItem('pqrsd_draft');
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.aceptaTerminos) {
      setError('Debe aceptar la Política de Privacidad y el Tratamiento de Datos Personales');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/pqrsd', {
        tipo: formData.tipo,
        grupo_interes: formData.grupo_interes || 'general',
        nombre: formData.nombre,
        documento: formData.documento,
        email: formData.email,
        telefono: formData.telefono || null,
        asunto: formData.asunto,
        descripcion: formData.descripcion
      });

      setNumeroRadicado(response.data.numero_radicado);
      setEnviado(true);
      showToast(`Solicitud enviada exitosamente. Número de radicado: ${response.data.numero_radicado}`, 'success');
      
      // Limpiar borrador
      localStorage.removeItem('pqrsd_draft');
      
      // Resetear formulario
      setFormData({
        tipo: 'peticion',
        grupo_interes: 'general',
        nombre: '',
        documento: '',
        email: '',
        telefono: '',
        asunto: '',
        descripcion: '',
        aceptaTerminos: false
      });
      setFormProgress(0);
    } catch (err) {
      console.error('Error enviando PQRSD:', err);
      const errorMsg = err.response?.data?.error || 'Error al enviar la solicitud. Por favor, intente nuevamente.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      setLoading(false);
    }
  };

  return (
    <div className="pqrsd-page">
      <Breadcrumbs />
      <section className="section">
        <div className="container">
          <h1 className="page-title">PQRSD - Peticiones, Quejas, Reclamos, Sugerencias y Denuncias</h1>
          
          <div className="pqrsd-consulta-link" style={{
            background: '#e7f3ff',
            border: '1px solid #b3d9ff',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <strong>¿Ya tiene un número de radicado?</strong>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.95em', color: '#666' }}>
                Consulte el estado de su solicitud ingresando su número de radicado
              </p>
            </div>
            <Link 
              to="/pqrsd/consulta" 
              className="btn btn-secondary"
              style={{ whiteSpace: 'nowrap' }}
            >
              <FaSearch /> Consultar Estado
            </Link>
          </div>
          
          <div className="pqrsd-info">
            <p>
              De acuerdo con la <strong>Ley 1712 de 2014</strong> (Ley de Transparencia y del Derecho de Acceso a la Información Pública Nacional), 
              usted tiene derecho a presentar solicitudes de información, peticiones, quejas, reclamos, sugerencias y denuncias.
            </p>
            <p>
              <strong>Plazos de respuesta:</strong>
            </p>
            <ul>
              <li><strong>Peticiones:</strong> 15 días hábiles</li>
              <li><strong>Quejas y Reclamos:</strong> 15 días hábiles</li>
              <li><strong>Sugerencias:</strong> Respuesta según corresponda</li>
              <li><strong>Denuncias:</strong> Según la naturaleza del caso</li>
            </ul>
          </div>

          {error && (
            <div className="pqrsd-error" style={{ 
              background: '#fee', 
              border: '1px solid #fcc', 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '1rem',
              color: '#c33'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {enviado ? (
            <div className="pqrsd-success">
              <h2>✓ Solicitud Enviada</h2>
              <p>Su solicitud ha sido recibida correctamente. Le responderemos en el plazo establecido por la ley.</p>
              <p><strong>Número de radicado:</strong> <span style={{ fontSize: '1.2em', color: '#4A90E2' }}>{numeroRadicado}</span></p>
              <p style={{ marginTop: '1rem' }}>
                <strong>Importante:</strong> Guarde este número de radicado para consultar el estado de su solicitud.
              </p>
              <div style={{ marginTop: '1.5rem' }}>
                <button 
                  onClick={() => navigate(`/pqrsd/consulta/${numeroRadicado}`)}
                  className="btn btn-secondary"
                  style={{ marginRight: '1rem' }}
                >
                  Consultar Estado
                </button>
                <button 
                  onClick={() => {
                    setEnviado(false);
                    setNumeroRadicado('');
                  }}
                  className="btn"
                >
                  Enviar Otra Solicitud
                </button>
              </div>
            </div>
          ) : (
            <form className="pqrsd-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="tipo">Tipo de Solicitud *</label>
                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  required
                >
                  <option value="peticion">Petición</option>
                  <option value="queja">Queja</option>
                  <option value="reclamo">Reclamo</option>
                  <option value="sugerencia">Sugerencia</option>
                  <option value="denuncia">Denuncia</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="grupo_interes">Grupo de Interés</label>
                <select
                  id="grupo_interes"
                  name="grupo_interes"
                  value={formData.grupo_interes}
                  onChange={handleChange}
                >
                  <option value="general">General</option>
                  <option value="dupla_naranja">Dupla Naranja (Mujeres)</option>
                  <option value="adultos_mayores">Adultos Mayores</option>
                  <option value="jovenes">Jóvenes</option>
                  <option value="personas_discapacidad">Personas con Discapacidad</option>
                  <option value="comunidades_etnicas">Comunidades Étnicas</option>
                  <option value="empresarios">Empresarios</option>
                </select>
                <small style={{ display: 'block', marginTop: '0.5rem', color: '#666' }}>
                  Seleccione el grupo de interés al que pertenece (opcional)
                </small>
              </div>

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

              <div className="form-row">
                <FormField
                  label="Número de Documento"
                  name="documento"
                  type="text"
                  value={formData.documento}
                  onChange={handleChange}
                  required
                  validation={validateDocumento}
                  icon={FaIdCard}
                  placeholder="Ej: 1234567890"
                  helpText="Solo números, mínimo 5 dígitos"
                />

                <FormField
                  label="Teléfono"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleChange}
                  validation={validateTelefono}
                  icon={FaPhone}
                  placeholder="Ej: 3001234567"
                  helpText="Opcional"
                />
              </div>

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
                label="Asunto"
                name="asunto"
                type="text"
                value={formData.asunto}
                onChange={handleChange}
                required
                icon={FaFileAlt}
                placeholder="Resumen breve de su solicitud"
                maxLength={255}
                showCharCount
              />

              <div className="form-field">
                <label htmlFor="descripcion" className="form-field-label">
                  Descripción Detallada <span className="required-asterisk">*</span>
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="6"
                  required
                  className="form-field-input"
                  placeholder="Describa su solicitud de manera detallada..."
                  maxLength={2000}
                />
                <div className="form-field-char-count">
                  {formData.descripcion?.length || 0} / 2000 caracteres
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="aceptaTerminos"
                    checked={formData.aceptaTerminos}
                    onChange={handleChange}
                    required
                  />
                  Acepto la <a href="/politica-privacidad" target="_blank">Política de Privacidad</a> y 
                  el <a href="/tratamiento-datos" target="_blank">Tratamiento de Datos Personales</a> *
                </label>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
            </form>
          )}

          <div className="pqrsd-contact">
            <h3>Información de Contacto</h3>
            <p>
              <strong>Correo electrónico:</strong> contacto@diocesisdeipiales.org<br />
              <strong>Teléfono:</strong> +57 (2) XXX-XXXX<br />
              <strong>Dirección:</strong> Calle Principal, Ipiales, Nariño<br />
              <strong>Horario de atención:</strong> Lunes a Viernes: 8:00 AM - 12:00 PM y 2:00 PM - 6:00 PM
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PQRSD;



