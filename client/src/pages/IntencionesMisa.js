import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { FaCross, FaCalendarAlt, FaChurch, FaCheckCircle } from 'react-icons/fa';
import './IntencionesMisa.css';

const IntencionesMisa = () => {
  const [formData, setFormData] = useState({
    nombre_solicitante: '',
    documento: '',
    email: '',
    telefono: '',
    fecha_misa: '',
    parroquia_id: '',
    tipo_intencion: 'difuntos',
    intencion_especifica: '',
    nombre_difunto: '',
    monto_donacion: '',
    observaciones: ''
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const { data: parroquias = [] } = useQuery({
    queryKey: ['parroquias'],
    queryFn: async () => {
      const response = await api.get('/parroquias');
      return response.data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/intenciones-misa', data);
      return response.data;
    },
    onSuccess: () => {
      setShowSuccess(true);
      setFormData({
        nombre_solicitante: '',
        documento: '',
        email: '',
        telefono: '',
        fecha_misa: '',
        parroquia_id: '',
        tipo_intencion: 'difuntos',
        intencion_especifica: '',
        nombre_difunto: '',
        monto_donacion: '',
        observaciones: ''
      });
      setTimeout(() => setShowSuccess(false), 5000);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      parroquia_id: formData.parroquia_id || null,
      monto_donacion: parseFloat(formData.monto_donacion) || 0
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="intenciones-misa-page">
      <div className="container">
        <div className="page-header">
          <h1><FaCross /> Solicitar Intención de Misa</h1>
          <p>Puedes solicitar una misa con una intención especial para tus seres queridos o necesidades</p>
        </div>

        {showSuccess && (
          <div className="alert alert-success">
            <FaCheckCircle /> Tu solicitud ha sido registrada exitosamente. Nos pondremos en contacto contigo pronto.
          </div>
        )}

        <form onSubmit={handleSubmit} className="intencion-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nombre Completo *</label>
              <input
                type="text"
                name="nombre_solicitante"
                value={formData.nombre_solicitante}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Documento</label>
              <input
                type="text"
                name="documento"
                value={formData.documento}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fecha de la Misa *</label>
              <input
                type="date"
                name="fecha_misa"
                value={formData.fecha_misa}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="form-group">
              <label>Parroquia</label>
              <select
                name="parroquia_id"
                value={formData.parroquia_id}
                onChange={handleChange}
              >
                <option value="">Seleccione una parroquia</option>
                {parroquias.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Tipo de Intención *</label>
            <select
              name="tipo_intencion"
              value={formData.tipo_intencion}
              onChange={handleChange}
              required
            >
              <option value="difuntos">Por Difuntos</option>
              <option value="salud">Por la Salud</option>
              <option value="accion_gracias">Acción de Gracias</option>
              <option value="trabajo">Por el Trabajo</option>
              <option value="familia">Por la Familia</option>
              <option value="otra">Otra</option>
            </select>
          </div>

          {formData.tipo_intencion === 'difuntos' && (
            <div className="form-group">
              <label>Nombre del Difunto</label>
              <input
                type="text"
                name="nombre_difunto"
                value={formData.nombre_difunto}
                onChange={handleChange}
                placeholder="Nombre de la persona fallecida"
              />
            </div>
          )}

          <div className="form-group">
            <label>Intención Específica *</label>
            <textarea
              name="intencion_especifica"
              value={formData.intencion_especifica}
              onChange={handleChange}
              rows="4"
              required
              placeholder="Describe la intención específica para esta misa"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Donación Voluntaria (opcional)</label>
              <input
                type="number"
                name="monto_donacion"
                value={formData.monto_donacion}
                onChange={handleChange}
                min="0"
                placeholder="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Observaciones</label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows="3"
              placeholder="Cualquier información adicional"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Enviando...' : 'Solicitar Intención de Misa'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IntencionesMisa;
