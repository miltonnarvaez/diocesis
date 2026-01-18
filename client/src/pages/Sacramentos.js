import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';
import { FaBaby, FaRing, FaHandsHelping, FaCross, FaChurch, FaCalendarAlt, FaFileAlt, FaDollarSign, FaClock, FaHeartbeat } from 'react-icons/fa';
import './Sacramentos.css';

const Sacramentos = () => {
  const [sacramentoSeleccionado, setSacramentoSeleccionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState({
    nombre_solicitante: '',
    documento: '',
    email: '',
    telefono: '',
    fecha_evento: '',
    observaciones: ''
  });

  const { data: sacramentos = [], isLoading } = useQuery({
    queryKey: ['sacramentos'],
    queryFn: async () => {
      const response = await api.get('/sacramentos');
      return response.data;
    }
  });

  const iconosSacramentos = {
    bautismo: FaBaby,
    confirmacion: FaCross,
    eucaristia: FaHandsHelping,
    matrimonio: FaRing,
    orden_sacerdotal: FaChurch,
    uncion_enfermos: FaHeartbeat,
    reconciliacion: FaCross
  };

  const handleSolicitar = (sacramento) => {
    setSacramentoSeleccionado(sacramento);
    setMostrarFormulario(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sacramentos/solicitudes', {
        ...formData,
        sacramento_id: sacramentoSeleccionado.id
      });
      alert('Solicitud enviada exitosamente. Nos pondremos en contacto contigo pronto.');
      setMostrarFormulario(false);
      setFormData({
        nombre_solicitante: '',
        documento: '',
        email: '',
        telefono: '',
        fecha_evento: '',
        observaciones: ''
      });
    } catch (error) {
      alert('Error al enviar la solicitud. Por favor intenta de nuevo.');
    }
  };

  if (isLoading) {
    return <div className="loading">Cargando sacramentos...</div>;
  }

  return (
    <div className="sacramentos-page">
      <Breadcrumbs />
      <section className="section">
        <div className="container">
          <h1 className="page-title">Sacramentos</h1>
          <p className="page-intro">
            Los sacramentos son signos visibles de la gracia invisible de Dios. 
            Conoce los sacramentos disponibles y solicita información.
          </p>

          <div className="sacramentos-grid">
            {sacramentos.map((sacramento) => {
              const Icono = iconosSacramentos[sacramento.nombre.toLowerCase().replace(/\s+/g, '_')] || FaCross;
              return (
                <div key={sacramento.id} className="sacramento-card">
                  <div className="sacramento-header">
                    <Icono className="sacramento-icon" />
                    <h2>{sacramento.nombre}</h2>
                    {sacramento.destacado && <span className="destacado-badge">Destacado</span>}
                  </div>
                  
                  {sacramento.descripcion && (
                    <p className="sacramento-descripcion">{sacramento.descripcion}</p>
                  )}
                  
                  <div className="sacramento-info">
                    {sacramento.tiempo_preparacion && (
                      <div className="info-item">
                        <FaClock /> <span>Tiempo de preparación: {sacramento.tiempo_preparacion}</span>
                      </div>
                    )}
                    
                    {sacramento.costo > 0 && (
                      <div className="info-item">
                        <FaDollarSign /> <span>Costo: ${sacramento.costo.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {sacramento.horario_atencion && (
                      <div className="info-item">
                        <FaCalendarAlt /> <span>Horario: {sacramento.horario_atencion}</span>
                      </div>
                    )}
                  </div>
                  
                  {sacramento.requisitos && sacramento.requisitos.length > 0 && (
                    <div className="requisitos">
                      <h3>Requisitos:</h3>
                      <ul>
                        {sacramento.requisitos.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {sacramento.contacto_responsable && (
                    <div className="contacto">
                      <p><strong>Contacto:</strong> {sacramento.contacto_responsable}</p>
                      {sacramento.telefono_contacto && <p>Tel: {sacramento.telefono_contacto}</p>}
                      {sacramento.email_contacto && <p>Email: {sacramento.email_contacto}</p>}
                    </div>
                  )}
                  
                  <button 
                    className="btn-solicitar"
                    onClick={() => handleSolicitar(sacramento)}
                  >
                    Solicitar Información
                  </button>
                </div>
              );
            })}
          </div>

          {mostrarFormulario && (
            <div className="modal-overlay" onClick={() => setMostrarFormulario(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Solicitar Información: {sacramentoSeleccionado?.nombre}</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      value={formData.nombre_solicitante}
                      onChange={(e) => setFormData({ ...formData, nombre_solicitante: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Documento de Identidad *</label>
                    <input
                      type="text"
                      required
                      value={formData.documento}
                      onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Fecha del Evento (si aplica)</label>
                    <input
                      type="date"
                      value={formData.fecha_evento}
                      onChange={(e) => setFormData({ ...formData, fecha_evento: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Observaciones</label>
                    <textarea
                      value={formData.observaciones}
                      onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                      rows="4"
                    />
                  </div>
                  <div className="form-actions">
                    <button type="button" onClick={() => setMostrarFormulario(false)}>Cancelar</button>
                    <button type="submit">Enviar Solicitud</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Sacramentos;

