import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';
import { FaHome, FaUsers } from 'react-icons/fa';
import './Familias.css';

const Familias = () => {
  const [showInscripcion, setShowInscripcion] = useState(false);
  const [programaSeleccionado, setProgramaSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    nombre_familia: '',
    nombre_contacto: '',
    documento: '',
    email: '',
    telefono: '',
    numero_miembros: 1,
    observaciones: ''
  });

  const { data: programas = [] } = useQuery({
    queryKey: ['familias-programas'],
    queryFn: async () => {
      const response = await api.get('/familias/programas', { params: { inscripcion_abierta: 'true' } });
      return response.data;
    }
  });

  const inscripcionMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/familias/inscripciones', {
        ...data,
        programa_id: programaSeleccionado.id
      });
      return response.data;
    },
    onSuccess: () => {
      alert('Inscripción realizada exitosamente');
      setShowInscripcion(false);
    }
  });

  const handleInscripcion = (programa) => {
    setProgramaSeleccionado(programa);
    setShowInscripcion(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    inscripcionMutation.mutate(formData);
  };

  return (
    <div className="familias-page">
      <Breadcrumbs />
      <div className="container">
        <div className="page-header">
          <h1><FaHome /> Familias</h1>
          <p>Programas y escuela de padres</p>
        </div>

        <div className="programas-grid">
          {programas.map(programa => (
            <div key={programa.id} className="programa-card">
              {programa.imagen_url && (
                <img src={programa.imagen_url} alt={programa.titulo} />
              )}
              <div className="programa-content">
                <h3>{programa.titulo}</h3>
                {programa.descripcion && <p>{programa.descripcion}</p>}
                {programa.fecha_inicio && (
                  <div><strong>Inicio:</strong> {new Date(programa.fecha_inicio).toLocaleDateString()}</div>
                )}
                {programa.inscripcion_abierta && programa.cupos_disponibles > 0 && (
                  <button onClick={() => handleInscripcion(programa)} className="btn btn-primary">
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
              <h2>Inscripción: {programaSeleccionado?.titulo}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nombre de la Familia *</label>
                  <input
                    type="text"
                    value={formData.nombre_familia}
                    onChange={(e) => setFormData({...formData, nombre_familia: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nombre del Contacto *</label>
                  <input
                    type="text"
                    value={formData.nombre_contacto}
                    onChange={(e) => setFormData({...formData, nombre_contacto: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Documento *</label>
                  <input
                    type="text"
                    value={formData.documento}
                    onChange={(e) => setFormData({...formData, documento: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Número de Miembros</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.numero_miembros}
                    onChange={(e) => setFormData({...formData, numero_miembros: parseInt(e.target.value)})}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Enviar</button>
                  <button type="button" onClick={() => setShowInscripcion(false)} className="btn btn-secondary">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Familias;












