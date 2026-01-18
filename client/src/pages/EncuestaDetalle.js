import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api';
import FormField from '../components/FormField';
import { useToast } from '../context/ToastContext';
import './EncuestaDetalle.css';

const EncuestaDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [respuestas, setRespuestas] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formProgress, setFormProgress] = useState(0);

  const { data: encuesta, isLoading } = useQuery({
    queryKey: ['encuesta', id],
    queryFn: async () => {
      const response = await api.get(`/encuestas/${id}`);
      return response.data;
    }
  });

  const { data: resultados } = useQuery({
    queryKey: ['encuesta-resultados', id],
    queryFn: async () => {
      const response = await api.get(`/encuestas/${id}/resultados`);
      return response.data;
    },
    enabled: !!encuesta && !encuesta.activa
  });

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      return await api.post(`/encuestas/${id}/respuestas`, data);
    },
    onSuccess: () => {
      showToast('¡Gracias por participar! Tus respuestas han sido registradas.', 'success');
      navigate('/encuestas');
    },
    onError: (error) => {
      console.error('Error enviando respuestas:', error);
      const errorMsg = error.response?.data?.error || 'Error al enviar las respuestas. Por favor, intenta nuevamente.';
      showToast(errorMsg, 'error');
    }
  });

  // Calcular progreso del formulario
  useEffect(() => {
    if (!encuesta || !encuesta.preguntas) return;
    const requiredQuestions = encuesta.preguntas.filter(p => p.requerida);
    const answeredRequired = requiredQuestions.filter(p => respuestas[p.id] && respuestas[p.id].toString().trim() !== '').length;
    setFormProgress(requiredQuestions.length > 0 ? Math.round((answeredRequired / requiredQuestions.length) * 100) : 0);
  }, [respuestas, encuesta]);

  const handleRespuestaChange = (preguntaId, valor) => {
    setRespuestas(prev => ({
      ...prev,
      [preguntaId]: valor
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const respuestasArray = Object.entries(respuestas).map(([preguntaId, respuesta]) => ({
        pregunta_id: parseInt(preguntaId),
        respuesta: respuesta
      }));

      // Obtener IP del cliente (simulado, en producción usar servicio real)
      const ip_address = '0.0.0.0'; // Se obtendrá del servidor

      await submitMutation.mutateAsync({
        respuestas: respuestasArray,
        ip_address
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="loading">Cargando encuesta...</div>;
  }

  if (!encuesta) {
    return (
      <div className="not-found">
        <h2>Encuesta no encontrada</h2>
        <Link to="/encuestas" className="btn">Volver a encuestas</Link>
      </div>
    );
  }

  const fechaActual = new Date();
  const fechaInicio = new Date(encuesta.fecha_inicio);
  const fechaFin = new Date(encuesta.fecha_fin);
  // La encuesta está activa si: está marcada como activa EN LA BD Y está dentro del rango de fechas
  const estaActiva = encuesta.activa && fechaActual >= fechaInicio && fechaActual <= fechaFin;

  // Si la encuesta está finalizada y hay resultados públicos, mostrarlos
  if (!estaActiva && resultados) {
    return (
      <div className="encuesta-detalle">
        <section className="section">
          <div className="container">
            <Link to="/encuestas" className="back-link">← Volver a encuestas</Link>
            
            <div className="encuesta-header-resultados">
              <h1>{encuesta.titulo}</h1>
              <span className="encuesta-estado finalizada">🔴 Finalizada</span>
            </div>

            {encuesta.descripcion && (
              <p className="encuesta-descripcion">{encuesta.descripcion}</p>
            )}

            <div className="resultados-section">
              <h2>Resultados de la Encuesta</h2>
              <p className="total-respuestas">
                Total de respuestas: <strong>{resultados.resultados[0]?.estadisticas?.total || 0}</strong>
              </p>

              {resultados.resultados.map((resultado, index) => (
                <div key={index} className="resultado-item">
                  <h3>{resultado.pregunta}</h3>
                  
                  {resultado.tipo === 'opcion_multiple' && (
                    <div className="resultado-opciones">
                      {resultado.estadisticas.opciones.map((op, idx) => (
                        <div key={idx} className="opcion-resultado">
                          <div className="opcion-header">
                            <span className="opcion-nombre">{op.opcion}</span>
                            <span className="opcion-porcentaje">{op.porcentaje}%</span>
                          </div>
                          <div className="opcion-bar">
                            <div 
                              className="opcion-bar-fill" 
                              style={{ width: `${op.porcentaje}%` }}
                            ></div>
                          </div>
                          <span className="opcion-cantidad">{op.cantidad} respuestas</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {resultado.tipo === 'escala' && (
                    <div className="resultado-escala">
                      <div className="escala-promedio">
                        <strong>Promedio:</strong> {resultado.estadisticas.promedio} / 10
                      </div>
                      <div className="escala-distribucion">
                        {Object.entries(resultado.estadisticas.distribucion).map(([valor, cantidad]) => (
                          <div key={valor} className="escala-item">
                            <span className="escala-valor">{valor}</span>
                            <div className="escala-bar">
                              <div 
                                className="escala-bar-fill" 
                                style={{ 
                                  width: `${(cantidad / resultado.estadisticas.total) * 100}%` 
                                }}
                              ></div>
                            </div>
                            <span className="escala-cantidad">{cantidad}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {resultado.tipo === 'texto' && (
                    <div className="resultado-texto">
                      <p><strong>Total de respuestas:</strong> {resultado.estadisticas.total}</p>
                      <div className="respuestas-texto">
                        {resultado.estadisticas.respuestas.map((resp, idx) => (
                          <div key={idx} className="respuesta-texto-item">
                            {resp}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Formulario de respuesta
  return (
    <div className="encuesta-detalle">
      <section className="section">
        <div className="container">
          <Link to="/encuestas" className="back-link">← Volver a encuestas</Link>
          
          <div className="encuesta-header-form">
            <h1>{encuesta.titulo}</h1>
            <span className="encuesta-estado activa">🟢 Activa</span>
          </div>

          {encuesta.descripcion && (
            <p className="encuesta-descripcion">{encuesta.descripcion}</p>
          )}

          <form onSubmit={handleSubmit} className="encuesta-form">
            {/* Progress Indicator */}
            {formProgress > 0 && (
              <div className="form-progress-container">
                <div className="form-progress-bar">
                  <div 
                    className="form-progress-fill" 
                    style={{ width: `${formProgress}%` }}
                  ></div>
                </div>
                <span className="form-progress-text">{formProgress}% completado</span>
              </div>
            )}
            {encuesta.preguntas && encuesta.preguntas.map((pregunta, index) => (
              <div key={pregunta.id} className="pregunta-item">
                <label className="pregunta-label">
                  {index + 1}. {pregunta.pregunta}
                  {pregunta.requerida && <span className="requerida"> *</span>}
                </label>

                {pregunta.tipo === 'texto' && (
                  <textarea
                    value={respuestas[pregunta.id] || ''}
                    onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
                    required={pregunta.requerida}
                    rows="4"
                    className="respuesta-input"
                    placeholder="Escribe tu respuesta aquí..."
                  />
                )}

                {pregunta.tipo === 'opcion_multiple' && (
                  <div className="opciones-list">
                    {JSON.parse(pregunta.opciones || '[]').map((opcion, idx) => (
                      <label key={idx} className="opcion-label">
                        <input
                          type="radio"
                          name={`pregunta-${pregunta.id}`}
                          value={opcion}
                          checked={respuestas[pregunta.id] === opcion}
                          onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
                          required={pregunta.requerida}
                        />
                        <span>{opcion}</span>
                      </label>
                    ))}
                  </div>
                )}

                {pregunta.tipo === 'escala' && (
                  <div className="escala-input">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={respuestas[pregunta.id] || 5}
                      onChange={(e) => handleRespuestaChange(pregunta.id, parseInt(e.target.value))}
                      required={pregunta.requerida}
                      className="escala-slider"
                    />
                    <div className="escala-labels">
                      <span>1</span>
                      <span className="escala-valor-actual">{respuestas[pregunta.id] || 5}</span>
                      <span>10</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Respuestas'}
              </button>
              <Link to="/encuestas" className="btn btn-secondary">
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default EncuestaDetalle;

