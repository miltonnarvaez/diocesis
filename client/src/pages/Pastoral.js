import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';
import { FaUsers, FaHandsHelping, FaCalendarAlt } from 'react-icons/fa';
import './Pastoral.css';

const Pastoral = () => {
  const [filtroTipo, setFiltroTipo] = useState('todos');

  const { data: comisiones = [] } = useQuery({
    queryKey: ['pastoral-comisiones'],
    queryFn: async () => {
      const response = await api.get('/pastoral/comisiones');
      return response.data;
    }
  });

  const { data: grupos = [] } = useQuery({
    queryKey: ['pastoral-grupos', filtroTipo],
    queryFn: async () => {
      const params = {};
      if (filtroTipo !== 'todos') {
        params.tipo = filtroTipo;
      }
      const response = await api.get('/pastoral/grupos', { params });
      return response.data;
    }
  });

  return (
    <div className="pastoral-page">
      <Breadcrumbs />
      <div className="container">
        <div className="page-header">
          <h1><FaUsers /> Pastoral</h1>
          <p>Comisiones, grupos y movimientos pastorales</p>
        </div>

        <div className="pastoral-content">
          <section className="comisiones-section">
            <h2>Comisiones Pastorales</h2>
            <div className="comisiones-grid">
              {comisiones.map(comision => (
                <div key={comision.id} className="comision-card">
                  {comision.imagen_url && (
                    <img src={comision.imagen_url} alt={comision.nombre} className="comision-image" />
                  )}
                  <div className="comision-content">
                    <h3>{comision.nombre}</h3>
                    {comision.descripcion && <p>{comision.descripcion}</p>}
                    {comision.coordinador && (
                      <div className="comision-info">
                        <strong>Coordinador:</strong> {comision.coordinador}
                      </div>
                    )}
                    {comision.telefono && (
                      <div className="comision-info">
                        <strong>Teléfono:</strong> {comision.telefono}
                      </div>
                    )}
                    {comision.email && (
                      <div className="comision-info">
                        <strong>Email:</strong> {comision.email}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grupos-section">
            <h2>Grupos y Movimientos</h2>
            <div className="filtros">
              <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                <option value="todos">Todos los tipos</option>
                <option value="grupo">Grupos</option>
                <option value="movimiento">Movimientos</option>
                <option value="asociacion">Asociaciones</option>
              </select>
            </div>
            <div className="grupos-grid">
              {grupos.map(grupo => (
                <div key={grupo.id} className="grupo-card">
                  <h3>{grupo.nombre}</h3>
                  {grupo.descripcion && <p>{grupo.descripcion}</p>}
                  {grupo.parroquia_nombre && (
                    <div className="grupo-info">
                      <strong>Parroquia:</strong> {grupo.parroquia_nombre}
                    </div>
                  )}
                  {grupo.comision_nombre && (
                    <div className="grupo-info">
                      <strong>Comisión:</strong> {grupo.comision_nombre}
                    </div>
                  )}
                  {grupo.contacto && (
                    <div className="grupo-info">
                      <strong>Contacto:</strong> {grupo.contacto}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Pastoral;












