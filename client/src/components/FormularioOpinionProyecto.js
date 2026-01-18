import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { 
  FaUser, FaIdCard, FaEnvelope, FaPhone, FaBuilding, FaAlignLeft, FaComments, FaLightbulb
} from 'react-icons/fa';
import { useToast } from '../context/ToastContext';
import FormField from '../components/FormField';
import './FormularioOpinionProyecto.css';

const FormularioOpinionProyecto = ({ proyectoId, proyectoTitulo, onSuccess }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    nombre: '',
    documento: '',
    email: '',
    telefono: '',
    organizacion: '',
    tipo_organizacion: 'ciudadano',
    opinion: '',
    argumentos: '',
    sugerencias: ''
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
    return true;
  };

  const validateDocumento = (value) => {
    if (!value || value.trim() === '') return 'Este campo es obligatorio';
    if (value.length < 5) return 'El documento debe tener al menos 5 caracteres';
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
    const fields = ['nombre', 'documento', 'email', 'opinion'];
    const filledFields = fields.filter(field => {
      return formData[field] && formData[field].toString().trim() !== '';
    }).length;
    setFormProgress(Math.round((filledFields / fields.length) * 100));
  }, [formData]);

  // Autoguardado en localStorage
  useEffect(() => {
    const saveDraft = () => {
      try {
        localStorage.setItem(`opinion_draft_${proyectoId}`, JSON.stringify({
          ...formData,
          savedAt: new Date().toISOString()
        }));
      } catch (error) {
        console.error('Error guardando borrador:', error);
      }
    };

    const timer = setTimeout(saveDraft, 1000);
    return () => clearTimeout(timer);
  }, [formData, proyectoId]);

  // Cargar borrador al montar (solo una vez)
  useEffect(() => {
    if (draftLoadedRef.current) return; // Ya se cargó
    
    try {
      const draft = localStorage.getItem(`opinion_draft_${proyectoId}`);
      const toastShown = sessionStorage.getItem(`opinion_draft_${proyectoId}_toast_shown`);
      
      if (draft && !toastShown) {
        const parsedDraft = JSON.parse(draft);
        const savedAt = new Date(parsedDraft.savedAt);
        const daysDiff = (new Date() - savedAt) / (1000 * 60 * 60 * 24);
        if (daysDiff < 7) {
          // Verificar si el borrador tiene datos reales
          const hasData = parsedDraft.nombre || parsedDraft.email || parsedDraft.opinion;
          if (hasData) {
            setFormData(prev => ({ ...prev, ...parsedDraft }));
            // Solo mostrar toast si hay datos significativos y no se ha mostrado en esta sesión
            if (parsedDraft.nombre || parsedDraft.email || parsedDraft.opinion) {
              showToast('Borrador recuperado automáticamente', 'info', 3000);
              sessionStorage.setItem(`opinion_draft_${proyectoId}_toast_shown`, 'true');
            }
          } else {
            localStorage.removeItem(`opinion_draft_${proyectoId}`);
          }
        } else {
          localStorage.removeItem(`opinion_draft_${proyectoId}`);
        }
      }
      draftLoadedRef.current = true;
    } catch (error) {
      console.error('Error cargando borrador:', error);
      draftLoadedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proyectoId]); // Solo ejecutar cuando cambie proyectoId

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

    if (!formData.nombre || !formData.documento || !formData.email || !formData.opinion) {
      setError('Por favor complete todos los campos obligatorios');
      setLoading(false);
      return;
    }

    try {
      await api.post('/opiniones', {
        proyecto_id: proyectoId,
        ...formData
      });

      setEnviado(true);
      showToast('Opinión enviada exitosamente. Será revisada antes de su publicación.', 'success');
      if (onSuccess) onSuccess();
      
      // Limpiar borrador
      localStorage.removeItem(`opinion_draft_${proyectoId}`);
      
      // Resetear formulario
      setFormData({
        nombre: '',
        documento: '',
        email: '',
        telefono: '',
        organizacion: '',
        tipo_organizacion: 'ciudadano',
        opinion: '',
        argumentos: '',
        sugerencias: ''
      });
      setFormProgress(0);
    } catch (err) {
      console.error('Error enviando opinión:', err);
      const errorMsg = err.response?.data?.error || 'Error al enviar la opinión. Por favor, intente nuevamente.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (enviado) {
    return (
      <div className="opinion-success">
        <h3>✓ Opinión Enviada</h3>
        <p>Su opinión ha sido registrada y será revisada antes de su publicación.</p>
        <button onClick={() => setEnviado(false)} className="btn">
          Enviar Otra Opinión
        </button>
      </div>
    );
  }

  return (
    <form className="formulario-opinion" onSubmit={handleSubmit}>
      <h3>Dar su Opinión sobre este Proyecto</h3>
      <p className="opinion-subtitle">Su opinión es importante para nosotros</p>

      {error && (
        <div className="opinion-error">
          <strong>Error:</strong> {error}
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

      <div className="form-row">
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
          helpText="Mínimo 3 caracteres"
        />

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
          helpText="Mínimo 5 caracteres"
        />
      </div>

      <div className="form-row">
        <FormField
          label="Email"
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
          placeholder="Ej: 3001234567"
          helpText="Opcional"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="tipo_organizacion">Tipo</label>
          <select
            id="tipo_organizacion"
            name="tipo_organizacion"
            value={formData.tipo_organizacion}
            onChange={handleChange}
          >
            <option value="ciudadano">Ciudadano</option>
            <option value="organizacion">Organización</option>
            <option value="empresa">Empresa</option>
            <option value="ong">ONG</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="organizacion">Organización (si aplica)</label>
          <input
            type="text"
            id="organizacion"
            name="organizacion"
            value={formData.organizacion}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="opinion" className="form-field-label">
          Su Opinión <span className="required-asterisk">*</span>
        </label>
        <textarea
          id="opinion"
          name="opinion"
          value={formData.opinion}
          onChange={handleChange}
          rows="5"
          required
          className="form-field-input"
          placeholder="Exprese su opinión sobre este proyecto..."
          maxLength={2000}
        />
        <div className="form-field-char-count">
          {formData.opinion?.length || 0} / 2000 caracteres
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="argumentos" className="form-field-label">
          Argumentos (opcional)
        </label>
        <textarea
          id="argumentos"
          name="argumentos"
          value={formData.argumentos}
          onChange={handleChange}
          rows="4"
          className="form-field-input"
          placeholder="Presente sus argumentos a favor o en contra..."
          maxLength={1500}
        />
        <div className="form-field-char-count">
          {formData.argumentos?.length || 0} / 1500 caracteres
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="sugerencias" className="form-field-label">
          Sugerencias (opcional)
        </label>
        <textarea
          id="sugerencias"
          name="sugerencias"
          value={formData.sugerencias}
          onChange={handleChange}
          rows="4"
          className="form-field-input"
          placeholder="Tiene alguna sugerencia para mejorar este proyecto?"
          maxLength={1500}
        />
        <div className="form-field-char-count">
          {formData.sugerencias?.length || 0} / 1500 caracteres
        </div>
      </div>

      <button type="submit" className="btn" disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar Opinión'}
      </button>
    </form>
  );
};

export default FormularioOpinionProyecto;














