import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaChurch } from 'react-icons/fa';
import './Parroquias.css';

const Parroquias = () => {
  const [zonaFiltro, setZonaFiltro] = useState('todas');
  const [busqueda, setBusqueda] = useState('');

  const { data: parroquias = [], isLoading } = useQuery({
    queryKey: ['parroquias', zonaFiltro],
    queryFn: async () => {
      const params = {};
      if (zonaFiltro !== 'todas') {
        params.zona_pastoral = zonaFiltro;
      }
      const response = await api.get('/parroquias', { params });
      return response.data;
    }
  });

  const zonas = [
    { value: 'todas', label: 'Todas las zonas' },
    { value: 'zona_1', label: 'Zona Pastoral 1' },
    { value: 'zona_2', label: 'Zona Pastoral 2' },
    { value: 'zona_3', label: 'Zona Pastoral 3' },
    { value: 'zona_4', label: 'Zona Pastoral 4' }
  ];

  const parroquiasFiltradas = parroquias.filter(parroquia => {
    if (!busqueda) return true;
    const busquedaLower = busqueda.toLowerCase();
    return (
      parroquia.nombre.toLowerCase().includes(busquedaLower) ||
      (parroquia.direccion && parroquia.direccion.toLowerCase().includes(busquedaLower)) ||
      (parroquia.parroco && parroquia.parroco.toLowerCase().includes(busquedaLower))
    );
  });

  if (isLoading) {
    return <div className="loading">Cargando parroquias...</div>;
  }

  return (
    <div className="parroquias-page">
      <Breadcrumbs />
      <section className="section">
        <div className="container">
          <h1 className="page-title">Parroquias de la Diócesis</h1>
          
          <div className="parroquias-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Buscar parroquia..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-buttons">
              {zonas.map((zona) => (
                <button
                  key={zona.value}
                  onClick={() => setZonaFiltro(zona.value)}
                  className={`filter-btn ${zonaFiltro === zona.value ? 'active' : ''}`}
                >
                  {zona.label}
                </button>
              ))}
            </div>
          </div>

          {parroquiasFiltradas.length === 0 ? (
            <div className="no-results">
              <p>No se encontraron parroquias.</p>
            </div>
          ) : (
            <div className="parroquias-grid">
              {parroquiasFiltradas.map((parroquia) => (
                <div key={parroquia.id} className="parroquia-card">
                  <div className="parroquia-header">
                    <FaChurch className="parroquia-icon" />
                    <h2>{parroquia.nombre}</h2>
                    {parroquia.zona_pastoral && (
                      <span className="zona-badge">{parroquia.zona_pastoral}</span>
                    )}
                  </div>
                  
                  {parroquia.parroco && (
                    <p className="parroco"><strong>Párroco:</strong> {parroquia.parroco}</p>
                  )}
                  
                  {parroquia.direccion && (
                    <p className="parroquia-info">
                      <FaMapMarkerAlt /> {parroquia.direccion}
                    </p>
                  )}
                  
                  {parroquia.telefono && (
                    <p className="parroquia-info">
                      <FaPhone /> {parroquia.telefono}
                    </p>
                  )}
                  
                  {parroquia.email && (
                    <p className="parroquia-info">
                      <FaEnvelope /> {parroquia.email}
                    </p>
                  )}
                  
                  {parroquia.horarios_misa && parroquia.horarios_misa.length > 0 && (
                    <div className="horarios-misa">
                      <h3><FaClock /> Horarios de Misa</h3>
                      <ul>
                        {parroquia.horarios_misa.map((horario, idx) => (
                          <li key={idx}>
                            {horario.dia_semana}: {horario.hora}
                            {horario.tipo && ` (${horario.tipo})`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {parroquia.descripcion && (
                    <p className="parroquia-descripcion">{parroquia.descripcion}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Parroquias;












