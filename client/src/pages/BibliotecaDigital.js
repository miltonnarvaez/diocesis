import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaBook, FaFilePdf, FaDownload, FaStar } from 'react-icons/fa';
import './BibliotecaDigital.css';

const BibliotecaDigital = () => {
  const [filtroTipo, setFiltroTipo] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const { data: documentos = [], isLoading } = useQuery({
    queryKey: ['biblioteca-digital', filtroTipo, busqueda],
    queryFn: async () => {
      const params = {};
      if (filtroTipo) params.tipo_documento = filtroTipo;
      if (busqueda) params.busqueda = busqueda;
      const response = await api.get('/biblioteca-digital', { params });
      return response.data;
    }
  });

  const tipos = [
    { value: '', label: 'Todos' },
    { value: 'enciclica', label: 'Encíclicas' },
    { value: 'documento_vaticano', label: 'Documentos Vaticanos' },
    { value: 'historia_diocesana', label: 'Historia Diocesana' },
    { value: 'carta_pastoral_antigua', label: 'Cartas Pastorales Antiguas' },
    { value: 'libro', label: 'Libros' }
  ];

  return (
    <div className="biblioteca-digital-page">
      <div className="container">
        <div className="page-header">
          <h1><FaBook /> Biblioteca Digital</h1>
          <p>Archivo histórico y documentos importantes de la Diócesis</p>
        </div>

        <div className="filtros-busqueda">
          <input
            type="text"
            placeholder="Buscar documentos..."
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
          <div className="loading">Cargando documentos...</div>
        ) : documentos.length === 0 ? (
          <div className="no-results">No se encontraron documentos.</div>
        ) : (
          <div className="documentos-grid">
            {documentos.map(doc => (
              <div key={doc.id} className="documento-card">
                {doc.destacado && <FaStar className="destacada-icon" />}
                <div className="documento-icon">
                  <FaFilePdf />
                </div>
                <h3>{doc.titulo}</h3>
                {doc.autor && <p className="documento-autor">Por: {doc.autor}</p>}
                {doc.descripcion && (
                  <p className="documento-descripcion">{doc.descripcion.substring(0, 150)}...</p>
                )}
                <div className="documento-meta">
                  {doc.fecha_documento && (
                    <span>{new Date(doc.fecha_documento).toLocaleDateString('es-CO')}</span>
                  )}
                  {doc.paginas && <span>{doc.paginas} páginas</span>}
                </div>
                {doc.archivo_url && (
                  <a
                    href={doc.archivo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    <FaDownload /> Descargar
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BibliotecaDigital;
