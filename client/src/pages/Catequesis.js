import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaBook, FaDownload, FaPlay } from 'react-icons/fa';
import './Catequesis.css';

const Catequesis = () => {
  const [filtroNivel, setFiltroNivel] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const { data: materiales = [], isLoading } = useQuery({
    queryKey: ['catequesis', filtroNivel, busqueda],
    queryFn: async () => {
      const params = {};
      if (filtroNivel) params.nivel = filtroNivel;
      if (busqueda) params.busqueda = busqueda;
      const response = await api.get('/catequesis', { params });
      return response.data;
    }
  });

  const niveles = [
    { value: '', label: 'Todos' },
    { value: 'primera_comunion', label: 'Primera Comunión' },
    { value: 'confirmacion', label: 'Confirmación' },
    { value: 'bautismo', label: 'Bautismo' },
    { value: 'matrimonio', label: 'Matrimonio' },
    { value: 'adultos', label: 'Adultos' },
    { value: 'jovenes', label: 'Jóvenes' },
    { value: 'general', label: 'General' }
  ];

  return (
    <div className="catequesis-page">
      <div className="container">
        <div className="page-header">
          <h1><FaBook /> Catequesis Online</h1>
          <p>Materiales de formación catequética para catequistas y fieles</p>
        </div>

        <div className="filtros-busqueda">
          <input
            type="text"
            placeholder="Buscar materiales..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="busqueda-input"
          />
          <select
            value={filtroNivel}
            onChange={(e) => setFiltroNivel(e.target.value)}
            className="filtro-select"
          >
            {niveles.map(nivel => (
              <option key={nivel.value} value={nivel.value}>{nivel.label}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="loading">Cargando materiales...</div>
        ) : materiales.length === 0 ? (
          <div className="no-results">No hay materiales disponibles.</div>
        ) : (
          <div className="materiales-grid">
            {materiales.map(material => (
              <div key={material.id} className="material-card">
                <div className="material-icon">
                  <FaBook />
                </div>
                <h3>{material.titulo}</h3>
                {material.descripcion && (
                  <p className="material-descripcion">{material.descripcion.substring(0, 150)}...</p>
                )}
                {material.categoria && (
                  <span className="badge">{material.categoria}</span>
                )}
                <div className="material-actions">
                  {material.material_descargable && (
                    <a
                      href={material.material_descargable}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                    >
                      <FaDownload /> Descargar
                    </a>
                  )}
                  {material.video_url && (
                    <a
                      href={material.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                    >
                      <FaPlay /> Ver Video
                    </a>
                  )}
                  <Link to={`/catequesis/${material.id}`} className="btn btn-primary">
                    Ver Detalles
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Catequesis;
