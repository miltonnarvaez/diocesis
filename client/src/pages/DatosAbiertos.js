import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';
import { FaFileAlt } from 'react-icons/fa';
import './DatosAbiertos.css';

const DatosAbiertos = () => {
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('json');
  const [filters, setFilters] = useState({
    categoria: '',
    tipo: '',
    fecha_desde: '',
    fecha_hasta: ''
  });

  const { data: catalogo = [], isLoading } = useQuery({
    queryKey: ['datos-abiertos-catalogo'],
    queryFn: async () => {
      const response = await api.get('/datos-abiertos/catalogo');
      return response.data;
    }
  });

  const handleDownload = async (dataset) => {
    try {
      const params = new URLSearchParams({
        formato: selectedFormat,
        ...filters
      });

      // Eliminar parámetros vacíos
      Object.keys(params).forEach(key => {
        if (!params.get(key)) {
          params.delete(key);
        }
      });

      const url = `/api/datos-abiertos/exportar/${dataset.id}?${params.toString()}`;
      // En producción usar ruta relativa, en desarrollo usar localhost:5001
      if (process.env.NODE_ENV === 'production') {
        const basename = window.location.pathname.startsWith('/diocesis') ? '/diocesis' : '';
        window.location.href = `${basename}${url}`;
      } else {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
        window.location.href = `${apiUrl}${url}`;
      }
    } catch (error) {
      console.error('Error descargando datos:', error);
      alert('Error al descargar los datos. Por favor, intenta nuevamente.');
    }
  };

  if (isLoading) {
    return <div className="loading">Cargando catálogo de datos...</div>;
  }

  return (
    <div className="datos-abiertos-page">
      <Breadcrumbs />
      <section className="section">
        <div className="container">
          <div className="datos-abiertos-header">
            <h1 className="page-title">Datos Abiertos</h1>
            <p className="datos-abiertos-intro">
              En cumplimiento de la <strong>Ley 1712 de 2014</strong> y los estándares de datos abiertos,
              el Diócesis de Ipiales pone a disposición de la ciudadanía los siguientes datasets
              en formatos abiertos y reutilizables.
            </p>
          </div>

          <div className="formatos-info">
            <h2>Formatos Disponibles</h2>
            <div className="formatos-grid">
              <div className="formato-card">
                <span className="formato-icon"><FaFileAlt /></span>
                <h3>CSV</h3>
                <p>Formato de texto plano separado por comas, ideal para análisis en hojas de cálculo</p>
              </div>
              <div className="formato-card">
                <span className="formato-icon"><FaFileAlt /></span>
                <h3>JSON</h3>
                <p>Formato estructurado con metadatos Schema.org, ideal para aplicaciones web</p>
              </div>
              <div className="formato-card">
                <span className="formato-icon"><FaFileAlt /></span>
                <h3>XML</h3>
                <p>Formato estructurado con esquema DCAT, ideal para integración con sistemas gubernamentales</p>
              </div>
            </div>
          </div>

          <div className="catalogo-datasets">
            <h2>Catálogo de Datasets</h2>
            <div className="datasets-grid">
              {catalogo.map((dataset) => (
                <div key={dataset.id} className="dataset-card">
                  <div className="dataset-header">
                    <h3>{dataset.nombre}</h3>
                    <span className="dataset-categoria">{dataset.categoria}</span>
                  </div>
                  <p className="dataset-descripcion">{dataset.descripcion}</p>
                  <div className="dataset-info">
                    <p><strong>Frecuencia de actualización:</strong> {dataset.frecuencia}</p>
                    <p><strong>Formatos disponibles:</strong> {dataset.formatos.join(', ').toUpperCase()}</p>
                    <p><strong>Última actualización:</strong> {
                      new Date(dataset.ultimaActualizacion).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    }</p>
                  </div>
                  
                  <div className="dataset-actions">
                    <select
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className="format-select"
                    >
                      {dataset.formatos.map(format => (
                        <option key={format} value={format}>{format.toUpperCase()}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDownload(dataset)}
                      className="btn-download"
                    >
                      📥 Descargar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="licencia-info">
            <h2>Licencia de Uso</h2>
            <p>
              Los datos publicados están disponibles bajo la licencia{' '}
              <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">
                Creative Commons Atribución 4.0 Internacional (CC BY 4.0)
              </a>.
              Esto significa que puedes usar, compartir y adaptar los datos libremente, siempre que proporciones
              la atribución correspondiente al Diócesis de Ipiales.
            </p>
          </div>

          <div className="contacto-datos">
            <h2>¿Necesitas ayuda con los datos?</h2>
            <p>
              Si tienes preguntas sobre los datos abiertos o necesitas asistencia técnica, puedes contactarnos
              a través del sistema de PQRSD o enviando un correo a{' '}
              <strong>contacto@diocesisdeipiales.org</strong>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DatosAbiertos;

