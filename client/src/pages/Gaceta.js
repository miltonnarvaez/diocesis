import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { getFileUrl } from '../utils/fileUtils';
import Breadcrumbs from '../components/Breadcrumbs';
import {
  FaClipboardList, FaFileContract, FaBook,
  FaBalanceScale, FaClipboardCheck
} from 'react-icons/fa';
import './Gaceta.css';

const Gaceta = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tipoFiltro = searchParams.get('tipo') || '';

  const { data: documentos = [], isLoading } = useQuery({
    queryKey: ['gaceta', tipoFiltro],
    queryFn: async () => {
      const url = tipoFiltro ? `/gaceta?tipo=${tipoFiltro}` : '/gaceta';
      const response = await api.get(url);
      return response.data;
    }
  });

  const tipos = [
    { value: 'carta_pastoral', label: 'CARTAS PASTORALES', icono: FaFileContract },
    { value: 'decreto', label: 'DECRETOS', icono: FaFileContract },
    { value: 'comunicado', label: 'COMUNICADOS', icono: FaClipboardList },
    { value: 'circular', label: 'CIRCULARES', icono: FaClipboardCheck },
    { value: 'boletin', label: 'BOLETINES', icono: FaBook },
    { value: 'manual', label: 'MANUALES', icono: FaBook },
    { value: 'directorio', label: 'DIRECTORIO', icono: FaBalanceScale }
  ];

  if (isLoading) {
    return <div className="loading">Cargando documentos...</div>;
  }

  return (
    <div className="gaceta-page">
      <Breadcrumbs />
      <section className="section">
        <div className="container">
          <h1 className="page-title">Gaceta</h1>

          <div className="gaceta-filters">
            <a href="/gaceta" className={`filter-btn ${!tipoFiltro ? 'active' : ''}`}>
              Todos
            </a>
            {tipos.map((tipo) => (
              <a
                key={tipo.value}
                href={`/gaceta?tipo=${tipo.value}`}
                className={`filter-btn ${tipoFiltro === tipo.value ? 'active' : ''}`}
              >
                <span className="filter-icon">{React.createElement(tipo.icono)}</span>
                {tipo.label}
              </a>
            ))}
          </div>

          {documentos.length === 0 ? (
            <div className="no-results">
              <p>No hay documentos disponibles en este momento.</p>
            </div>
          ) : (
            <div className="documentos-grid">
              {documentos.map((documento) => (
                <div key={documento.id} className="documento-card">
                  <div className="documento-content">
                    <span className="documento-tipo">{documento.tipo.toUpperCase()}</span>
                    {documento.numero && (
                      <span className="documento-numero">N° {documento.numero}</span>
                    )}
                    <h2>{documento.titulo}</h2>
                    {documento.descripcion && <p>{documento.descripcion}</p>}
                    {documento.fecha && (
                      <p className="documento-fecha">
                        Fecha: {new Date(documento.fecha).toLocaleDateString('es-CO')}
                      </p>
                    )}
                    {(documento.actualizado_en || documento.fecha_actualizacion) && (
                      <p className="documento-actualizacion">
                        <strong>Última actualización:</strong>{' '}
                        {new Date(documento.actualizado_en || documento.fecha_actualizacion).toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                    <div className="documento-actions">
                      {documento.archivo_url && (
                        <a
                          href={getFileUrl(documento.archivo_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn"
                        >
                          Ver documento →
                        </a>
                      )}
                      <Link to={`/gaceta/${documento.id}`} className="btn btn-secondary">
                        Ver detalles →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Gaceta;

