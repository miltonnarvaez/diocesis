import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';
import { FaComments, FaFileAlt } from 'react-icons/fa';
import './Foros.css';

const Foros = () => {
  const [categoria, setCategoria] = useState('');

  const { data: foros = [], isLoading } = useQuery({
    queryKey: ['foros', categoria],
    queryFn: async () => {
      try {
        const url = categoria ? `/foros?categoria=${categoria}` : '/foros';
        const response = await api.get(url);
        return response.data;
      } catch (error) {
        console.error('Error obteniendo foros:', error);
        return [];
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
  });

  const categorias = [
    { value: '', label: 'Todas las Categorías' },
    { value: 'General', label: 'General' },
    { value: 'Presupuesto', label: 'Presupuesto' },
    { value: 'Proyectos', label: 'Proyectos' },
    { value: 'Servicios', label: 'Servicios' },
    { value: 'Transparencia', label: 'Transparencia' }
  ];

  if (isLoading) {
    return <div className="loading">Cargando foros...</div>;
  }

  return (
    <div className="foros-page">
      <Breadcrumbs />
      <section className="section">
        <div className="container">
          <h1 className="page-title">Foros de Discusión</h1>
          <p className="page-subtitle">
            Participa en las discusiones sobre temas de interés para el Diócesis de Ipiales
          </p>

          <div className="foros-filters">
            {categorias.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategoria(cat.value)}
                className={`filter-btn ${categoria === cat.value ? 'active' : ''}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {foros.length === 0 ? (
            <div className="no-results">
              <p>No hay foros activos en este momento.</p>
            </div>
          ) : (
            <div className="foros-grid">
              {foros.map((foro) => (
                <Link key={foro.id} to={`/foros/${foro.id}`} className="foro-card">
                  {foro.destacado && <span className="foro-badge">⭐ Destacado</span>}
                  <div className="foro-header">
                    <span className="foro-categoria">{foro.categoria}</span>
                    <span className="foro-fecha">
                      {new Date(foro.fecha_inicio).toLocaleDateString('es-CO')}
                      {foro.fecha_fin && ` - ${new Date(foro.fecha_fin).toLocaleDateString('es-CO')}`}
                    </span>
                  </div>
                  <h2>{foro.titulo}</h2>
                  <p>{foro.descripcion}</p>
                  <div className="foro-stats">
                    <span><FaComments /> {foro.comentarios_aprobados || 0} comentarios</span>
                    <span><FaFileAlt /> {foro.total_comentarios || 0} total</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Foros;














