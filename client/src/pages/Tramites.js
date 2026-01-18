import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';
import './Tramites.css';

const Tramites = () => {
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [busqueda, setBusqueda] = useState('');

  const { data: tramites = [], isLoading } = useQuery({
    queryKey: ['tramites', categoriaFiltro],
    queryFn: async () => {
      try {
        const params = {};
        if (categoriaFiltro !== 'todas') {
          params.categoria = categoriaFiltro;
        }
        const response = await api.get('/tramites', { params });
        return response.data;
      } catch (error) {
        console.error('Error obteniendo trámites:', error);
        return [];
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
  });

  const categorias = [
    { value: 'todas', label: 'Todas las categorías' },
    { value: 'documentos', label: 'Documentos' },
    { value: 'certificaciones', label: 'Certificaciones' },
    { value: 'permisos', label: 'Permisos' },
    { value: 'licencias', label: 'Licencias' },
    { value: 'registros', label: 'Registros' },
    { value: 'consultas', label: 'Consultas' },
    { value: 'reclamos', label: 'Reclamos' },
    { value: 'otros', label: 'Otros' }
  ];

  const tramitesFiltrados = tramites.filter(tramite => {
    if (!busqueda) return true;
    const busquedaLower = busqueda.toLowerCase();
    return (
      tramite.nombre.toLowerCase().includes(busquedaLower) ||
      (tramite.descripcion && tramite.descripcion.toLowerCase().includes(busquedaLower))
    );
  });

  const tramitesDestacados = tramitesFiltrados.filter(t => t.destacado);
  const tramitesNormales = tramitesFiltrados.filter(t => !t.destacado);

  if (isLoading) {
    return (
      <div className="tramites-page">
        <div className="container">
          <div className="loading">Cargando trámites...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="tramites-page">
      <Breadcrumbs />
      <section className="tramites-hero">
        <div className="container">
          <h1>Trámites del Diócesis</h1>
          <p>Consulta los trámites disponibles y sus requisitos</p>
        </div>
      </section>

      <section className="tramites-content">
        <div className="container">
          <div className="tramites-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Buscar trámite..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className="category-filters">
              {categorias.map(cat => (
                <button
                  key={cat.value}
                  className={`filter-btn ${categoriaFiltro === cat.value ? 'active' : ''}`}
                  onClick={() => setCategoriaFiltro(cat.value)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {tramitesDestacados.length > 0 && (
            <div className="tramites-section">
              <h2>⭐ Trámites Destacados</h2>
              <div className="tramites-grid">
                {tramitesDestacados.map(tramite => (
                  <TramiteCard key={tramite.id} tramite={tramite} destacado />
                ))}
              </div>
            </div>
          )}

          <div className="tramites-section">
            {tramitesDestacados.length > 0 && <h2>Todos los Trámites</h2>}
            {tramitesNormales.length === 0 && tramitesDestacados.length === 0 ? (
              <div className="empty-state">
                <p>No se encontraron trámites.</p>
              </div>
            ) : (
              <div className="tramites-grid">
                {tramitesNormales.map(tramite => (
                  <TramiteCard key={tramite.id} tramite={tramite} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

const TramiteCard = ({ tramite, destacado = false }) => {
  const requisitos = tramite.requisitos ? (typeof tramite.requisitos === 'string' ? JSON.parse(tramite.requisitos) : tramite.requisitos) : [];
  const documentos = tramite.documentos_necesarios ? (typeof tramite.documentos_necesarios === 'string' ? JSON.parse(tramite.documentos_necesarios) : tramite.documentos_necesarios) : [];
  const pasos = tramite.pasos ? (typeof tramite.pasos === 'string' ? JSON.parse(tramite.pasos) : tramite.pasos) : [];

  return (
    <div className={`tramite-card ${destacado ? 'destacado' : ''}`}>
      {destacado && <div className="tramite-badge-destacado">⭐ Destacado</div>}
      <h3>{tramite.nombre}</h3>
      {tramite.descripcion && <p className="tramite-descripcion">{tramite.descripcion}</p>}
      
      <div className="tramite-info">
        {tramite.costo > 0 && (
          <div className="info-item">
            <strong>💰 Costo:</strong> ${tramite.costo.toLocaleString()}
          </div>
        )}
        {tramite.tiempo_respuesta && (
          <div className="info-item">
            <strong>⏱️ Tiempo:</strong> {tramite.tiempo_respuesta}
          </div>
        )}
        {tramite.categoria && (
          <div className="info-item">
            <strong>📁 Categoría:</strong> {tramite.categoria}
          </div>
        )}
      </div>

      {requisitos.length > 0 && (
        <div className="tramite-details">
          <h4>Requisitos:</h4>
          <ul>
            {requisitos.map((req, idx) => (
              <li key={idx}>{req}</li>
            ))}
          </ul>
        </div>
      )}

      {documentos.length > 0 && (
        <div className="tramite-details">
          <h4>Documentos Necesarios:</h4>
          <ul>
            {documentos.map((doc, idx) => (
              <li key={idx}>{doc}</li>
            ))}
          </ul>
        </div>
      )}

      {pasos.length > 0 && (
        <div className="tramite-details">
          <h4>Pasos:</h4>
          <ol>
            {pasos.map((paso, idx) => (
              <li key={idx}>{paso}</li>
            ))}
          </ol>
        </div>
      )}

      {tramite.contacto_responsable && (
        <div className="tramite-contacto">
          <h4>Contacto:</h4>
          <p>
            <strong>{tramite.contacto_responsable}</strong>
            {tramite.telefono_contacto && <><br />📞 {tramite.telefono_contacto}</>}
            {tramite.email_contacto && <><br />✉️ {tramite.email_contacto}</>}
            {tramite.horario_atencion && <><br />🕐 {tramite.horario_atencion}</>}
          </p>
        </div>
      )}
    </div>
  );
};

export default Tramites;















