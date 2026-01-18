import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaMicrophone, FaCalendarAlt, FaStar } from 'react-icons/fa';
import './Homilias.css';

const Homilias = () => {
  const [filtroTipo, setFiltroTipo] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const { data: homilias = [], isLoading } = useQuery({
    queryKey: ['homilias', filtroTipo, busqueda],
    queryFn: async () => {
      const params = {};
      if (filtroTipo) params.tipo_homilia = filtroTipo;
      if (busqueda) params.busqueda = busqueda;
      const response = await api.get('/homilias', { params });
      return response.data;
    }
  });

  const tipos = [
    { value: '', label: 'Todas' },
    { value: 'dominical', label: 'Homilías Dominicales' },
    { value: 'festiva', label: 'Homilías Festivas' },
    { value: 'retiro', label: 'Retiros' },
    { value: 'especial', label: 'Especiales' }
  ];

  return (
    <div className="homilias-page">
      <div className="container">
        <div className="page-header">
          <h1><FaMicrophone /> Homilías</h1>
          <p>Archivo de homilías del Obispo y sacerdotes de la Diócesis</p>
        </div>

        <div className="filtros-busqueda">
          <input
            type="text"
            placeholder="Buscar homilías..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="busqueda-input"
          />
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="filtro-select"
          >
            {tipos.map(tipo => (
              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="loading">Cargando homilías...</div>
        ) : homilias.length === 0 ? (
          <div className="no-results">No se encontraron homilías.</div>
        ) : (
          <div className="homilias-grid">
            {homilias.map(homilia => (
              <div key={homilia.id} className="homilia-card">
                {homilia.destacada && <FaStar className="destacada-icon" />}
                <div className="homilia-header">
                  <h3>{homilia.titulo}</h3>
                  <span className="homilia-autor">{homilia.autor}</span>
                </div>
                <div className="homilia-meta">
                  <span><FaCalendarAlt /> {new Date(homilia.fecha_homilia).toLocaleDateString('es-CO')}</span>
                  {homilia.tema && <span className="homilia-tema">{homilia.tema}</span>}
                </div>
                {homilia.evangelio && (
                  <p className="homilia-evangelio">
                    <strong>Evangelio:</strong> {homilia.evangelio.substring(0, 100)}...
                  </p>
                )}
                <p className="homilia-preview">
                  {homilia.contenido.substring(0, 200)}...
                </p>
                <Link to={`/homilias/${homilia.id}`} className="btn btn-primary">
                  Leer completa
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Homilias;
