import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaPrayingHands, FaBook, FaStar } from 'react-icons/fa';
import './Oraciones.css';

const Oraciones = () => {
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroIntencion, setFiltroIntencion] = useState('');

  const { data: oraciones = [], isLoading } = useQuery({
    queryKey: ['oraciones', filtroCategoria, filtroIntencion],
    queryFn: async () => {
      const params = {};
      if (filtroCategoria) params.categoria = filtroCategoria;
      if (filtroIntencion) params.intencion = filtroIntencion;
      const response = await api.get('/oraciones', { params });
      return response.data;
    }
  });

  const { data: novenas = [] } = useQuery({
    queryKey: ['novenas'],
    queryFn: async () => {
      const response = await api.get('/oraciones/novenas/todas');
      return response.data;
    }
  });

  const categorias = [
    { value: '', label: 'Todas' },
    { value: 'oracion_dia', label: 'Oración del Día' },
    { value: 'novena', label: 'Novenas' },
    { value: 'rosario', label: 'Rosario' },
    { value: 'letania', label: 'Letanías' },
    { value: 'oracion_especial', label: 'Oraciones Especiales' },
    { value: 'oracion_intencion', label: 'Por Intención' }
  ];

  const intenciones = [
    { value: '', label: 'Todas' },
    { value: 'salud', label: 'Salud' },
    { value: 'trabajo', label: 'Trabajo' },
    { value: 'familia', label: 'Familia' },
    { value: 'misericordia', label: 'Misericordia' }
  ];

  return (
    <div className="oraciones-page">
      <div className="container">
        <div className="page-header">
          <h1><FaPrayingHands /> Oraciones y Devociones</h1>
          <p>Encuentra oraciones para fortalecer tu vida espiritual</p>
        </div>

        <div className="filtros">
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="filtro-select"
          >
            {categorias.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <select
            value={filtroIntencion}
            onChange={(e) => setFiltroIntencion(e.target.value)}
            className="filtro-select"
          >
            {intenciones.map(int => (
              <option key={int.value} value={int.value}>{int.label}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="loading">Cargando oraciones...</div>
        ) : (
          <>
            {oraciones.length > 0 && (
              <section className="oraciones-section">
                <h2>Oraciones</h2>
                <div className="oraciones-grid">
                  {oraciones.map(oracion => (
                    <div key={oracion.id} className="oracion-card">
                      {oracion.destacada && <FaStar className="destacada-icon" />}
                      <h3>{oracion.titulo}</h3>
                      {oracion.intencion && (
                        <span className="badge">{oracion.intencion}</span>
                      )}
                      <p className="oracion-preview">
                        {oracion.contenido.substring(0, 150)}...
                      </p>
                      <Link to={`/oraciones/${oracion.id}`} className="btn btn-link">
                        Leer completa
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {novenas.length > 0 && (
              <section className="novenas-section">
                <h2>Novenas</h2>
                <div className="novenas-grid">
                  {novenas.map(novena => (
                    <div key={novena.id} className="novena-card">
                      <h3>{novena.titulo}</h3>
                      {novena.descripcion && <p>{novena.descripcion}</p>}
                      <div className="novena-fechas">
                        <span>Inicio: {new Date(novena.fecha_inicio).toLocaleDateString('es-CO')}</span>
                        <span>Fin: {new Date(novena.fecha_fin).toLocaleDateString('es-CO')}</span>
                      </div>
                      <Link to={`/oraciones/novenas/${novena.id}`} className="btn btn-primary">
                        Ver Novena
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Oraciones;
