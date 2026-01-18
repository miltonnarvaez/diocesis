import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './AdminCommon.css';
import './AdminEncuestas.css';

const AdminEncuestas = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingEncuesta, setEditingEncuesta] = useState(null);
  const [viewingResults, setViewingResults] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    activa: true,
    publicada: true,
    tipo: 'multiple_choice',
    resultados_publicos: true,
    preguntas: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: encuestas = [], isLoading } = useQuery({
    queryKey: ['encuestas-admin'],
    queryFn: async () => {
      const response = await api.get('/encuestas/admin/all');
      return response.data;
    }
  });

  const { data: resultados } = useQuery({
    queryKey: ['encuesta-resultados-admin', viewingResults],
    queryFn: async () => {
      const response = await api.get(`/encuestas/admin/${viewingResults}/resultados`);
      return response.data;
    },
    enabled: !!viewingResults
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePreguntaChange = (index, field, value) => {
    const nuevasPreguntas = [...formData.preguntas];
    nuevasPreguntas[index] = {
      ...nuevasPreguntas[index],
      [field]: value
    };
    setFormData(prev => ({ ...prev, preguntas: nuevasPreguntas }));
  };

  const handleOpcionesChange = (index, value) => {
    const nuevasPreguntas = [...formData.preguntas];
    // Guardar el texto tal cual para permitir escribir comas libremente
    nuevasPreguntas[index] = {
      ...nuevasPreguntas[index],
      opcionesTexto: value, // Guardar el texto sin procesar
      opciones: value.split(',').map(o => o.trim()).filter(o => o) // Procesar para validación
    };
    setFormData(prev => ({ ...prev, preguntas: nuevasPreguntas }));
  };

  const addPregunta = () => {
    setFormData(prev => ({
      ...prev,
      preguntas: [
        ...prev.preguntas,
        {
          pregunta: '',
          tipo: 'opcion_multiple',
          opciones: [],
          opcionesTexto: '', // Inicializar el texto de opciones
          orden: prev.preguntas.length,
          requerida: true
        }
      ]
    }));
  };

  const removePregunta = (index) => {
    const nuevasPreguntas = formData.preguntas.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, preguntas: nuevasPreguntas }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingEncuesta) {
        await api.put(`/encuestas/admin/${editingEncuesta.id}`, formData);
      } else {
        await api.post('/encuestas/admin', formData);
      }

      queryClient.invalidateQueries(['encuestas-admin']);
      resetForm();
      alert(editingEncuesta ? 'Encuesta actualizada exitosamente' : 'Encuesta creada exitosamente');
    } catch (error) {
      console.error('Error guardando encuesta:', error);
      alert('Error al guardar la encuesta. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: '',
      activa: true,
      publicada: true,
      tipo: 'multiple_choice',
      resultados_publicos: true,
      preguntas: []
    });
    setEditingEncuesta(null);
    setShowForm(false);
  };

  const handleEdit = (encuesta) => {
    setEditingEncuesta(encuesta);
    setFormData({
      titulo: encuesta.titulo,
      descripcion: encuesta.descripcion || '',
      fecha_inicio: encuesta.fecha_inicio.split('T')[0],
      fecha_fin: encuesta.fecha_fin.split('T')[0],
      activa: encuesta.activa,
      publicada: encuesta.publicada,
      tipo: encuesta.tipo,
      resultados_publicos: encuesta.resultados_publicos,
      preguntas: encuesta.preguntas.map(p => {
        const opciones = p.opciones ? (typeof p.opciones === 'string' ? JSON.parse(p.opciones) : p.opciones) : [];
        return {
          ...p,
          opciones: opciones,
          opcionesTexto: opciones.join(', ') // Inicializar el texto de opciones al editar
        };
      })
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta encuesta? Esto eliminará todas las respuestas asociadas.')) {
      return;
    }

    try {
      await api.delete(`/encuestas/admin/${id}`);
      queryClient.invalidateQueries(['encuestas-admin']);
      alert('Encuesta eliminada exitosamente');
    } catch (error) {
      console.error('Error eliminando encuesta:', error);
      alert('Error al eliminar la encuesta');
    }
  };

  if (isLoading) {
    return <div className="loading">Cargando encuestas...</div>;
  }

  return (
    <div className="admin-encuestas">
      <AdminNavbar title="Gestión de Encuestas Ciudadanas" />
      <div className="admin-content-wrapper">
        <div className="admin-header">
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? 'Cancelar' : '+ Nueva Encuesta'}
          </button>
        </div>

      {showForm && (
        <div className="encuesta-form-container">
          <h2>{editingEncuesta ? 'Editar Encuesta' : 'Nueva Encuesta'}</h2>
          <form onSubmit={handleSubmit} className="encuesta-form-admin">
            <div className="form-row">
              <div className="form-group">
                <label>Título *</label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Tipo</label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                >
                  <option value="simple">Simple</option>
                  <option value="multiple_choice">Opción Múltiple</option>
                  <option value="rating">Calificación</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Fecha de Inicio *</label>
                <input
                  type="date"
                  name="fecha_inicio"
                  value={formData.fecha_inicio}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Fecha de Fin *</label>
                <input
                  type="date"
                  name="fecha_fin"
                  value={formData.fecha_fin}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-checkboxes">
              <label>
                <input
                  type="checkbox"
                  name="activa"
                  checked={formData.activa}
                  onChange={handleChange}
                />
                Activa
              </label>
              <label>
                <input
                  type="checkbox"
                  name="publicada"
                  checked={formData.publicada}
                  onChange={handleChange}
                />
                Publicada
              </label>
              <label>
                <input
                  type="checkbox"
                  name="resultados_publicos"
                  checked={formData.resultados_publicos}
                  onChange={handleChange}
                />
                Resultados Públicos
              </label>
            </div>

            <div className="preguntas-section">
              <div className="preguntas-header">
                <h3>Preguntas</h3>
                <button type="button" onClick={addPregunta} className="btn btn-sm btn-secondary">
                  + Agregar Pregunta
                </button>
              </div>

              {formData.preguntas.map((pregunta, index) => (
                <div key={index} className="pregunta-form-item">
                  <div className="pregunta-form-header">
                    <span className="pregunta-numero">Pregunta {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removePregunta(index)}
                      className="btn btn-sm btn-delete"
                    >
                      Eliminar
                    </button>
                  </div>

                  <div className="form-group">
                    <label>Pregunta *</label>
                    <input
                      type="text"
                      value={pregunta.pregunta}
                      onChange={(e) => handlePreguntaChange(index, 'pregunta', e.target.value)}
                      required
                      placeholder="Escribe la pregunta aquí..."
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Tipo *</label>
                      <select
                        value={pregunta.tipo}
                        onChange={(e) => handlePreguntaChange(index, 'tipo', e.target.value)}
                        required
                      >
                        <option value="texto">Texto Libre</option>
                        <option value="opcion_multiple">Opción Múltiple</option>
                        <option value="escala">Escala (1-10)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Orden</label>
                      <input
                        type="number"
                        value={pregunta.orden || index}
                        onChange={(e) => handlePreguntaChange(index, 'orden', parseInt(e.target.value))}
                        min="0"
                      />
                    </div>
                  </div>

                  {pregunta.tipo === 'opcion_multiple' && (
                    <div className="form-group">
                      <label>Opciones (separadas por comas) *</label>
                      <input
                        type="text"
                        value={pregunta.opcionesTexto !== undefined ? pregunta.opcionesTexto : (pregunta.opciones ? pregunta.opciones.join(', ') : '')}
                        onChange={(e) => handleOpcionesChange(index, e.target.value)}
                        onBlur={(e) => {
                          // Al perder el foco, asegurar que las opciones estén procesadas
                          const nuevasPreguntas = [...formData.preguntas];
                          nuevasPreguntas[index] = {
                            ...nuevasPreguntas[index],
                            opciones: e.target.value.split(',').map(o => o.trim()).filter(o => o)
                          };
                          setFormData(prev => ({ ...prev, preguntas: nuevasPreguntas }));
                        }}
                        required
                        placeholder="Opción 1, Opción 2, Opción 3..."
                      />
                      {pregunta.opciones && pregunta.opciones.length > 0 && (
                        <small style={{ color: '#666', marginTop: '0.25rem', display: 'block' }}>
                          {pregunta.opciones.length} opción(es) detectada(s)
                        </small>
                      )}
                    </div>
                  )}

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={pregunta.requerida !== false}
                      onChange={(e) => handlePreguntaChange(index, 'requerida', e.target.checked)}
                    />
                    Pregunta requerida
                  </label>
                </div>
              ))}

              {formData.preguntas.length === 0 && (
                <p className="no-preguntas">No hay preguntas. Haz clic en "Agregar Pregunta" para comenzar.</p>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : editingEncuesta ? 'Actualizar' : 'Crear'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {viewingResults && resultados && (
        <div className="resultados-modal">
          <div className="resultados-content">
            <div className="resultados-header">
              <h2>Resultados: {resultados.encuesta.titulo}</h2>
              <button onClick={() => setViewingResults(null)} className="btn-close">×</button>
            </div>
            <div className="resultados-body">
              <p className="total-respuestas-admin">
                <strong>Total de respuestas:</strong> {resultados.total_respuestas}
              </p>
              {resultados.resultados.map((resultado, index) => (
                <div key={index} className="resultado-item-admin">
                  <h3>{resultado.pregunta}</h3>
                  
                  {resultado.tipo === 'opcion_multiple' && (
                    <div className="resultado-opciones-admin">
                      {resultado.estadisticas.opciones.map((op, idx) => (
                        <div key={idx} className="opcion-resultado-admin">
                          <div className="opcion-header-admin">
                            <span>{op.opcion}</span>
                            <span>{op.porcentaje}% ({op.cantidad})</span>
                          </div>
                          <div className="opcion-bar-admin">
                            <div 
                              className="opcion-bar-fill-admin" 
                              style={{ width: `${op.porcentaje}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {resultado.tipo === 'escala' && (
                    <div className="resultado-escala-admin">
                      <p><strong>Promedio:</strong> {resultado.estadisticas.promedio} / 10</p>
                      <div className="escala-distribucion-admin">
                        {Object.entries(resultado.estadisticas.distribucion).map(([valor, cantidad]) => (
                          <div key={valor} className="escala-item-admin">
                            <span>{valor}</span>
                            <div className="escala-bar-admin">
                              <div 
                                className="escala-bar-fill-admin" 
                                style={{ 
                                  width: `${(cantidad / resultado.estadisticas.total) * 100}%` 
                                }}
                              ></div>
                            </div>
                            <span>{cantidad}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {resultado.tipo === 'texto' && (
                    <div className="resultado-texto-admin">
                      <p><strong>Total:</strong> {resultado.estadisticas.total}</p>
                      <div className="respuestas-texto-admin">
                        {resultado.estadisticas.respuestas.map((resp, idx) => (
                          <div key={idx} className="respuesta-texto-item-admin">
                            <p>{resp.respuesta}</p>
                            <small>{new Date(resp.fecha).toLocaleDateString('es-CO')} - IP: {resp.ip}</small>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="encuestas-list">
        <h2>Encuestas ({encuestas.length})</h2>
        <div className="encuestas-table">
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Estado</th>
                <th>Respuestas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {encuestas.map((encuesta) => {
                const fechaActual = new Date();
                const fechaInicio = new Date(encuesta.fecha_inicio);
                const fechaFin = new Date(encuesta.fecha_fin);
                // La encuesta está activa si: está marcada como activa EN LA BD Y está dentro del rango de fechas
                const estaActiva = encuesta.activa && fechaActual >= fechaInicio && fechaActual <= fechaFin;

                return (
                  <tr key={encuesta.id}>
                    <td>
                      <strong>{encuesta.titulo}</strong>
                      {!encuesta.publicada && <span className="badge-no-publicada">No publicada</span>}
                    </td>
                    <td>{fechaInicio.toLocaleDateString('es-CO')}</td>
                    <td>{fechaFin.toLocaleDateString('es-CO')}</td>
                    <td>
                      <span className={`estado-badge ${estaActiva ? 'activa' : 'finalizada'}`}>
                        {estaActiva ? 'Activa' : 'Finalizada'}
                      </span>
                    </td>
                    <td>{encuesta.total_respuestas || 0}</td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => handleEdit(encuesta)} className="btn btn-sm btn-edit">
                          Editar
                        </button>
                        <button 
                          onClick={() => setViewingResults(encuesta.id)} 
                          className="btn btn-sm btn-results"
                        >
                          Resultados
                        </button>
                        <button onClick={() => handleDelete(encuesta.id)} className="btn btn-sm btn-delete">
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {encuestas.length === 0 && (
            <div className="no-items">
              <p>No hay encuestas. Crea la primera usando el botón "Nueva Encuesta".</p>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default AdminEncuestas;

