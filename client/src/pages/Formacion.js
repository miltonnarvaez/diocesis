import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';
import { FaGraduationCap, FaCalendarAlt, FaUsers, FaCheckCircle } from 'react-icons/fa';
import './Formacion.css';

const Formacion = () => {
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [showInscripcion, setShowInscripcion] = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    nombre_completo: '',
    documento: '',
    email: '',
    telefono: '',
    parroquia: '',
    observaciones: ''
  });
  const queryClient = useQueryClient();

  const { data: cursos = [] } = useQuery({
    queryKey: ['formacion-cursos', filtroTipo],
    queryFn: async () => {
      const params = {};
      if (filtroTipo !== 'todos') {
        params.tipo = filtroTipo;
      }
      params.inscripcion_abierta = 'true';
      const response = await api.get('/formacion/cursos', { params });
      return response.data;
    }
  });

  const inscripcionMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/formacion/inscripciones', {
        ...data,
        curso_id: cursoSeleccionado.id
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['formacion-cursos']);
      alert('Inscripción realizada exitosamente');
      setShowInscripcion(false);
      setFormData({
        nombre_completo: '',
        documento: '',
        email: '',
        telefono: '',
        parroquia: '',
        observaciones: ''
      });
    },
    onError: (error) => {
      alert('Error al inscribirse: ' + (error.response?.data?.error || error.message));
    }
  });

  const handleInscripcion = (curso) => {
    setCursoSeleccionado(curso);
    setShowInscripcion(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    inscripcionMutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="formacion-page">
      <Breadcrumbs />
      <div className="container">
        <div className="page-header">
          <h1><FaGraduationCap /> Formación</h1>
          <p>Cursos, talleres y programas de formación</p>
        </div>

        <div className="filtros-section">
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
            <option value="todos">Todos los cursos</option>
            <option value="curso">Cursos</option>
            <option value="taller">Talleres</option>
            <option value="seminario">Seminarios</option>
            <option value="diplomado">Diplomados</option>
          </select>
        </div>

        <div className="cursos-grid">
          {cursos.map(curso => (
            <div key={curso.id} className="curso-card">
              {curso.imagen_url && (
                <img src={curso.imagen_url} alt={curso.titulo} className="curso-image" />
              )}
              <div className="curso-content">
                <h3>{curso.titulo}</h3>
                {curso.descripcion && <p>{curso.descripcion}</p>}
                <div className="curso-info">
                  {curso.fecha_inicio && (
                    <div><FaCalendarAlt /> {new Date(curso.fecha_inicio).toLocaleDateString()}</div>
                  )}
                  {curso.modalidad && <div><strong>Modalidad:</strong> {curso.modalidad}</div>}
                  {curso.duracion && <div><strong>Duración:</strong> {curso.duracion}</div>}
                  {curso.cupos_disponibles !== null && (
                    <div><FaUsers /> Cupos: {curso.cupos_disponibles}</div>
                  )}
                  {curso.costo > 0 && <div><strong>Costo:</strong> ${curso.costo}</div>}
                </div>
                {curso.inscripcion_abierta && curso.cupos_disponibles > 0 && (
                  <button
                    onClick={() => handleInscripcion(curso)}
                    className="btn btn-primary"
                  >
                    Inscribirse
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {showInscripcion && (
          <div className="modal-overlay" onClick={() => setShowInscripcion(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Inscripción: {cursoSeleccionado?.titulo}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nombre Completo *</label>
                  <input
                    type="text"
                    name="nombre_completo"
                    value={formData.nombre_completo}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Documento *</label>
                  <input
                    type="text"
                    name="documento"
                    value={formData.documento}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Parroquia</label>
                  <input
                    type="text"
                    name="parroquia"
                    value={formData.parroquia}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Observaciones</label>
                  <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Enviar Inscripción
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInscripcion(false)}
                    className="btn btn-secondary"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Formacion;












