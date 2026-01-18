import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { getFileUrl } from '../utils/fileUtils';
import FormularioOpinionProyecto from '../components/FormularioOpinionProyecto';
import { FaFileAlt } from 'react-icons/fa';
import './GacetaDetalle.css';

const GacetaDetalle = () => {
  const { id } = useParams();
  const [showOpinionForm, setShowOpinionForm] = useState(false);

  const { data: documento, isLoading } = useQuery({
    queryKey: ['gaceta', id],
    queryFn: async () => {
      const response = await api.get(`/gaceta/${id}`);
      return response.data;
    }
  });

  const { data: opiniones = [] } = useQuery({
    queryKey: ['opiniones-proyecto', id],
    queryFn: async () => {
      if (documento?.tipo !== 'proyecto') return [];
      const response = await api.get(`/opiniones/proyecto/${id}`);
      return response.data;
    },
    enabled: documento?.tipo === 'proyecto'
  });

  if (isLoading) {
    return <div className="loading">Cargando documento...</div>;
  }

  if (!documento) {
    return (
      <div className="not-found">
        <h2>Documento no encontrado</h2>
        <Link to="/gaceta" className="btn">Volver a Gaceta</Link>
      </div>
    );
  }

  const esProyecto = documento.tipo === 'proyecto';

  return (
    <div className="gaceta-detalle">
      <section className="section">
        <div className="container">
          <Link to="/gaceta" className="back-link">← Volver a Gaceta</Link>

          <div className="documento-header">
            <span className="documento-tipo-badge">{documento.tipo.toUpperCase()}</span>
            {documento.numero && (
              <span className="documento-numero-badge">N° {documento.numero}</span>
            )}
            <h1>{documento.titulo}</h1>
            {documento.fecha && (
              <p className="documento-fecha">
                Fecha: {new Date(documento.fecha).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
          </div>

          {documento.descripcion && (
            <div className="documento-descripcion">
              <p>{documento.descripcion}</p>
            </div>
          )}

          {documento.archivo_url && (
            <div className="documento-archivo">
              <a
                href={getFileUrl(documento.archivo_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-download"
              >
                <FaFileAlt /> Ver/Descargar Documento
              </a>
            </div>
          )}

          {/* Sección de opiniones para proyectos */}
          {esProyecto && (
            <div className="proyecto-opiniones">
              <div className="opiniones-header">
                <h2>Opiniones sobre este Proyecto</h2>
                <p>Las opiniones ciudadanas son importantes para la toma de decisiones</p>
                <button 
                  onClick={() => setShowOpinionForm(!showOpinionForm)}
                  className="btn btn-opinion"
                >
                  {showOpinionForm ? 'Ocultar Formulario' : 'Dar mi Opinión'}
                </button>
              </div>

              {showOpinionForm && (
                <FormularioOpinionProyecto
                  proyectoId={documento.id}
                  proyectoTitulo={documento.titulo}
                  onSuccess={() => {
                    setShowOpinionForm(false);
                    // Refrescar opiniones
                    window.location.reload();
                  }}
                />
              )}

              {opiniones.length > 0 ? (
                <div className="opiniones-list">
                  <h3>Opiniones Publicadas ({opiniones.length})</h3>
                  {opiniones.map((opinion) => (
                    <div key={opinion.id} className="opinion-card">
                      <div className="opinion-header">
                        <strong>{opinion.nombre}</strong>
                        {opinion.organizacion && (
                          <span className="opinion-org">{opinion.organizacion}</span>
                        )}
                        <span className="opinion-tipo">{opinion.tipo_organizacion}</span>
                        <span className="opinion-fecha">
                          {new Date(opinion.creado_en).toLocaleDateString('es-CO')}
                        </span>
                      </div>
                      <div className="opinion-content">
                        <p><strong>Opinión:</strong> {opinion.opinion}</p>
                        {opinion.argumentos && (
                          <p><strong>Argumentos:</strong> {opinion.argumentos}</p>
                        )}
                        {opinion.sugerencias && (
                          <p><strong>Sugerencias:</strong> {opinion.sugerencias}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-opiniones">
                  <p>Aún no hay opiniones publicadas sobre este proyecto.</p>
                  <p>¡Sé el primero en dar tu opinión!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default GacetaDetalle;














