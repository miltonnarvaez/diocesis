import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';
import { FaGlobeAmericas, FaUsers } from 'react-icons/fa';
import './Misiones.css';

const Misiones = () => {
  const [filtroTipo, setFiltroTipo] = useState('todos');

  const { data: misiones = [] } = useQuery({
    queryKey: ['misiones', filtroTipo],
    queryFn: async () => {
      const params = {};
      if (filtroTipo !== 'todos') {
        params.tipo = filtroTipo;
      }
      const response = await api.get('/misiones', { params });
      return response.data;
    }
  });

  const { data: misioneros = [] } = useQuery({
    queryKey: ['misiones-misioneros'],
    queryFn: async () => {
      const response = await api.get('/misiones/misioneros', { params: { activo: 'true' } });
      return response.data;
    }
  });

  return (
    <div className="misiones-page">
      <Breadcrumbs />
      <div className="container">
        <div className="page-header">
          <h1><FaGlobeAmericas /> Misiones</h1>
          <p>Proyectos misioneros y misioneros de la diócesis</p>
        </div>

        <div className="filtros-section">
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
            <option value="todos">Todas las misiones</option>
            <option value="local">Misiones Locales</option>
            <option value="nacional">Misiones Nacionales</option>
            <option value="internacional">Misiones Internacionales</option>
          </select>
        </div>

        <div className="misiones-content">
          <section className="misiones-section">
            <h2>Proyectos Misioneros</h2>
            <div className="misiones-grid">
              {misiones.map(mision => (
                <div key={mision.id} className="mision-card">
                  {mision.imagen_url && (
                    <img src={mision.imagen_url} alt={mision.nombre} />
                  )}
                  <div className="mision-content">
                    <h3>{mision.nombre}</h3>
                    {mision.descripcion && <p>{mision.descripcion}</p>}
                    {mision.ubicacion && <div><strong>Ubicación:</strong> {mision.ubicacion}</div>}
                    {mision.estado && <span className={`badge badge-${mision.estado}`}>{mision.estado}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="misioneros-section">
            <h2><FaUsers /> Misioneros</h2>
            <div className="misioneros-grid">
              {misioneros.map(misionero => (
                <div key={misionero.id} className="misionero-card">
                  <h3>{misionero.nombre_completo}</h3>
                  {misionero.tipo && <div><strong>Tipo:</strong> {misionero.tipo}</div>}
                  {misionero.mision_nombre && <div><strong>Misión:</strong> {misionero.mision_nombre}</div>}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Misiones;












