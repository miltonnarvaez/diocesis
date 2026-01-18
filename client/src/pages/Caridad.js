import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';
import { FaHeart, FaHandsHelping, FaUsers } from 'react-icons/fa';
import './Caridad.css';

const Caridad = () => {
  const [showVoluntarioForm, setShowVoluntarioForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre_completo: '',
    documento: '',
    email: '',
    telefono: '',
    direccion: '',
    habilidades: '',
    disponibilidad: '',
    area_interes: '',
    proyecto_id: null
  });

  const { data: proyectos = [] } = useQuery({
    queryKey: ['caridad-proyectos'],
    queryFn: async () => {
      const response = await api.get('/caridad/proyectos');
      return response.data;
    }
  });

  const { data: campanas = [] } = useQuery({
    queryKey: ['caridad-campanas'],
    queryFn: async () => {
      const response = await api.get('/caridad/campañas');
      return response.data;
    }
  });

  const voluntarioMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/caridad/voluntarios', data);
      return response.data;
    },
    onSuccess: () => {
      alert('Registro de voluntario exitoso');
      setShowVoluntarioForm(false);
      setFormData({
        nombre_completo: '',
        documento: '',
        email: '',
        telefono: '',
        direccion: '',
        habilidades: '',
        disponibilidad: '',
        area_interes: '',
        proyecto_id: null
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    voluntarioMutation.mutate(formData);
  };

  return (
    <div className="caridad-page">
      <Breadcrumbs />
      <div className="container">
        <div className="page-header">
          <h1><FaHeart /> Caridad y Solidaridad</h1>
          <p>Proyectos, campañas y oportunidades de voluntariado</p>
        </div>

        <div className="caridad-content">
          <section className="proyectos-section">
            <h2>Proyectos de Caridad</h2>
            <div className="proyectos-grid">
              {proyectos.map(proyecto => (
                <div key={proyecto.id} className="proyecto-card">
                  {proyecto.imagen_url && (
                    <img src={proyecto.imagen_url} alt={proyecto.titulo} />
                  )}
                  <div className="proyecto-content">
                    <h3>{proyecto.titulo}</h3>
                    {proyecto.descripcion && <p>{proyecto.descripcion}</p>}
                    {proyecto.estado && (
                      <span className={`badge badge-${proyecto.estado}`}>
                        {proyecto.estado}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="campanas-section">
            <h2>Campañas de Ayuda</h2>
            <div className="campanas-grid">
              {campanas.map(campana => (
                <div key={campana.id} className="campana-card">
                  <h3>{campana.titulo}</h3>
                  {campana.descripcion && <p>{campana.descripcion}</p>}
                  {campana.activa && <span className="badge badge-activa">Activa</span>}
                </div>
              ))}
            </div>
          </section>

          <section className="voluntarios-section">
            <h2><FaUsers /> Ser Voluntario</h2>
            <button onClick={() => setShowVoluntarioForm(true)} className="btn btn-primary">
              Registrarse como Voluntario
            </button>
          </section>
        </div>

        {showVoluntarioForm && (
          <div className="modal-overlay" onClick={() => setShowVoluntarioForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Registro de Voluntario</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nombre Completo *</label>
                  <input
                    type="text"
                    value={formData.nombre_completo}
                    onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Documento *</label>
                  <input
                    type="text"
                    value={formData.documento}
                    onChange={(e) => setFormData({...formData, documento: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Dirección</label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Habilidades</label>
                  <textarea
                    value={formData.habilidades}
                    onChange={(e) => setFormData({...formData, habilidades: e.target.value})}
                    rows="3"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Enviar</button>
                  <button type="button" onClick={() => setShowVoluntarioForm(false)} className="btn btn-secondary">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Caridad;












