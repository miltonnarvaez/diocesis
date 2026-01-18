import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';
import { FaUsers, FaCalendarAlt } from 'react-icons/fa';
import './Juventud.css';

const Juventud = () => {
  const [filtroTipo, setFiltroTipo] = useState('todos');

  const { data: actividades = [] } = useQuery({
    queryKey: ['juventud-actividades', filtroTipo],
    queryFn: async () => {
      const params = {};
      if (filtroTipo !== 'todos') {
        params.tipo = filtroTipo;
      }
      params.inscripcion_abierta = 'true';
      const response = await api.get('/juventud/actividades', { params });
      return response.data;
    }
  });

  const { data: grupos = [] } = useQuery({
    queryKey: ['juventud-grupos'],
    queryFn: async () => {
      const response = await api.get('/juventud/grupos');
      return response.data;
    }
  });

  return (
    <div className="juventud-page">
      <Breadcrumbs />
      <div className="container">
        <div className="page-header">
          <h1><FaUsers /> Juventud</h1>
          <p>Actividades y grupos juveniles</p>
        </div>

        <div className="filtros-section">
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
            <option value="todos">Todas las actividades</option>
            <option value="retiro">Retiros</option>
            <option value="campamento">Campamentos</option>
            <option value="formacion">Formación</option>
            <option value="servicio">Servicio</option>
          </select>
        </div>

        <div className="juventud-content">
          <section className="actividades-section">
            <h2>Actividades</h2>
            <div className="actividades-grid">
              {actividades.map(actividad => (
                <div key={actividad.id} className="actividad-card">
                  {actividad.imagen_url && (
                    <img src={actividad.imagen_url} alt={actividad.titulo} />
                  )}
                  <div className="actividad-content">
                    <h3>{actividad.titulo}</h3>
                    {actividad.descripcion && <p>{actividad.descripcion}</p>}
                    {actividad.fecha_inicio && (
                      <div><FaCalendarAlt /> {new Date(actividad.fecha_inicio).toLocaleDateString()}</div>
                    )}
                    {actividad.lugar && <div><strong>Lugar:</strong> {actividad.lugar}</div>}
                    {actividad.edad_minima && actividad.edad_maxima && (
                      <div><strong>Edad:</strong> {actividad.edad_minima}-{actividad.edad_maxima} años</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grupos-section">
            <h2>Grupos Juveniles</h2>
            <div className="grupos-grid">
              {grupos.map(grupo => (
                <div key={grupo.id} className="grupo-card">
                  <h3>{grupo.nombre}</h3>
                  {grupo.descripcion && <p>{grupo.descripcion}</p>}
                  {grupo.parroquia_nombre && <div><strong>Parroquia:</strong> {grupo.parroquia_nombre}</div>}
                  {grupo.contacto && <div><strong>Contacto:</strong> {grupo.contacto}</div>}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Juventud;












