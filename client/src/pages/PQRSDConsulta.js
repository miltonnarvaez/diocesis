import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import './PQRSD.css';

const PQRSDConsulta = () => {
  const { numeroRadicado } = useParams();
  const [numeroInput, setNumeroInput] = useState(numeroRadicado || '');

  const { data: solicitud, isLoading, error, refetch } = useQuery({
    queryKey: ['pqrsd-consulta', numeroRadicado],
    queryFn: async () => {
      if (!numeroRadicado) return null;
      const response = await api.get(`/pqrsd/consulta/${numeroRadicado}`);
      return response.data;
    },
    enabled: !!numeroRadicado
  });

  const handleConsulta = (e) => {
    e.preventDefault();
    if (numeroInput.trim()) {
      window.location.href = `/pqrsd/consulta/${numeroInput.trim()}`;
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: '#856404',
      en_proceso: '#004085',
      resuelto: '#155724',
      cerrado: '#6c757d'
    };
    return colores[estado] || '#6c757d';
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      pendiente: 'Pendiente',
      en_proceso: 'En Proceso',
      resuelto: 'Resuelto',
      cerrado: 'Cerrado'
    };
    return labels[estado] || estado;
  };

  const getTipoLabel = (tipo) => {
    const labels = {
      peticion: 'Petición',
      queja: 'Queja',
      reclamo: 'Reclamo',
      sugerencia: 'Sugerencia',
      denuncia: 'Denuncia'
    };
    return labels[tipo] || tipo;
  };

  return (
    <div className="pqrsd-page">
      <section className="section">
        <div className="container">
          <h1 className="page-title">Consultar Estado de PQRSD</h1>

          {!numeroRadicado && (
            <div className="pqrsd-consulta-form" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <p>Ingrese el número de radicado para consultar el estado de su solicitud:</p>
              <form onSubmit={handleConsulta} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <input
                  type="text"
                  value={numeroInput}
                  onChange={(e) => setNumeroInput(e.target.value)}
                  placeholder="Ej: CMG-20241201-1234"
                  required
                  style={{ flex: 1, padding: '0.75rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                <button type="submit" className="btn btn-primary">
                  Consultar
                </button>
              </form>
            </div>
          )}

          {numeroRadicado && (
            <>
              {isLoading && (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p>Cargando información...</p>
                </div>
              )}

              {error && (
                <div className="pqrsd-error" style={{ 
                  background: '#fee', 
                  border: '1px solid #fcc', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  marginBottom: '1rem',
                  color: '#c33'
                }}>
                  <strong>Error:</strong> {error.response?.data?.error || 'No se pudo cargar la información'}
                </div>
              )}

              {solicitud && (
                <div className="pqrsd-detalle">
                  <div className="pqrsd-header" style={{ 
                    background: '#f8f9fa', 
                    padding: '1.5rem', 
                    borderRadius: '8px', 
                    marginBottom: '1.5rem' 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <h2 style={{ margin: '0 0 0.5rem 0' }}>Solicitud #{solicitud.numero_radicado}</h2>
                        <p style={{ margin: '0.25rem 0', color: '#666' }}>
                          <strong>Tipo:</strong> {getTipoLabel(solicitud.tipo)}
                        </p>
                        <p style={{ margin: '0.25rem 0', color: '#666' }}>
                          <strong>Fecha de creación:</strong> {new Date(solicitud.creado_en).toLocaleDateString('es-CO', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div style={{ 
                        padding: '0.5rem 1rem', 
                        borderRadius: '4px', 
                        background: getEstadoColor(solicitud.estado),
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        {getEstadoLabel(solicitud.estado)}
                      </div>
                    </div>
                  </div>

                  <div className="pqrsd-info" style={{ marginBottom: '1.5rem' }}>
                    <h3>Información de la Solicitud</h3>
                    <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                      <p><strong>Asunto:</strong> {solicitud.asunto}</p>
                      <p><strong>Descripción:</strong></p>
                      <p style={{ whiteSpace: 'pre-wrap', marginLeft: '1rem' }}>{solicitud.descripcion}</p>
                    </div>
                  </div>

                  {solicitud.respuesta && (
                    <div className="pqrsd-respuesta" style={{ marginBottom: '1.5rem' }}>
                      <h3>Respuesta</h3>
                      <div style={{ 
                        background: '#e7f3ff', 
                        padding: '1rem', 
                        borderRadius: '8px', 
                        border: '1px solid #b3d9ff' 
                      }}>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{solicitud.respuesta}</p>
                        {solicitud.fecha_respuesta && (
                          <p style={{ marginTop: '0.5rem', fontSize: '0.9em', color: '#666' }}>
                            <strong>Fecha de respuesta:</strong> {new Date(solicitud.fecha_respuesta).toLocaleDateString('es-CO', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {solicitud.historial && solicitud.historial.length > 0 && (
                    <div className="pqrsd-historial">
                      <h3>Historial de Seguimiento</h3>
                      <div style={{ marginTop: '1rem' }}>
                        {solicitud.historial.map((item, index) => (
                          <div key={index} style={{ 
                            padding: '1rem', 
                            marginBottom: '0.5rem', 
                            background: 'white', 
                            borderLeft: '4px solid #007bff',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                              <div>
                                <strong>{getEstadoLabel(item.estado_nuevo)}</strong>
                                {item.observaciones && (
                                  <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>{item.observaciones}</p>
                                )}
                              </div>
                              <span style={{ color: '#666', fontSize: '0.9em' }}>
                                {new Date(item.creado_en).toLocaleDateString('es-CO', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <button 
                      onClick={() => window.location.href = '/pqrsd'}
                      className="btn btn-secondary"
                    >
                      Nueva Consulta
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default PQRSDConsulta;















