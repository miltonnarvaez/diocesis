import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import './ForoDetalle.css';

const ForoDetalle = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    usuario_nombre: '',
    email: '',
    comentario: ''
  });
  const [comentarioPadreId, setComentarioPadreId] = useState(null);

  const { data: foro, isLoading } = useQuery({
    queryKey: ['foro', id],
    queryFn: async () => {
      const response = await api.get(`/foros/${id}`);
      return response.data;
    }
  });

  const comentarioMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post(`/foros/${id}/comentarios`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['foro', id]);
      setFormData({ usuario_nombre: '', email: '', comentario: '' });
      setShowForm(false);
      setComentarioPadreId(null);
    }
  });

  const votoMutation = useMutation({
    mutationFn: async ({ comentarioId, tipo }) => {
      const response = await api.post(`/foros/comentarios/${comentarioId}/voto`, { tipo });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['foro', id]);
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    comentarioMutation.mutate({
      ...formData,
      comentario_padre_id: comentarioPadreId
    });
  };

  const handleResponder = (comentarioId) => {
    setComentarioPadreId(comentarioId);
    setShowForm(true);
  };

  const handleVotar = (comentarioId, tipo) => {
    votoMutation.mutate({ comentarioId, tipo });
  };

  if (isLoading) {
    return <div className="loading">Cargando foro...</div>;
  }

  if (!foro) {
    return (
      <div className="not-found">
        <h2>Foro no encontrado</h2>
        <Link to="/foros" className="btn">Volver a Foros</Link>
      </div>
    );
  }

  return (
    <div className="foro-detalle">
      <section className="section">
        <div className="container">
          <Link to="/foros" className="back-link">← Volver a Foros</Link>

          <div className="foro-header">
            <div className="foro-header-top">
              <span className="foro-categoria-badge">{foro.categoria}</span>
              {foro.destacado && <span className="foro-badge">⭐ Destacado</span>}
            </div>
            <h1>{foro.titulo}</h1>
            <p className="foro-fecha">
              {new Date(foro.fecha_inicio).toLocaleDateString('es-CO')}
              {foro.fecha_fin && ` - ${new Date(foro.fecha_fin).toLocaleDateString('es-CO')}`}
            </p>
          </div>

          <div className="foro-descripcion">
            <p>{foro.descripcion}</p>
          </div>

          {foro.permite_comentarios && (
            <>
              <div className="comentarios-section">
                <div className="comentarios-header">
                  <h2>Comentarios ({foro.comentarios?.length || 0})</h2>
                  <button
                    onClick={() => {
                      setShowForm(!showForm);
                      setComentarioPadreId(null);
                    }}
                    className="btn btn-comentar"
                  >
                    {showForm ? 'Cancelar' : 'Agregar Comentario'}
                  </button>
                </div>

                {showForm && (
                  <form className="comentario-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="usuario_nombre">Nombre *</label>
                        <input
                          type="text"
                          id="usuario_nombre"
                          name="usuario_nombre"
                          value={formData.usuario_nombre}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="comentario">Comentario *</label>
                      <textarea
                        id="comentario"
                        name="comentario"
                        value={formData.comentario}
                        onChange={handleChange}
                        rows="5"
                        required
                        placeholder={comentarioPadreId ? "Escribe tu respuesta..." : "Escribe tu comentario..."}
                      />
                    </div>
                    <button type="submit" className="btn" disabled={comentarioMutation.isLoading}>
                      {comentarioMutation.isLoading ? 'Enviando...' : 'Enviar Comentario'}
                    </button>
                  </form>
                )}

                {foro.comentarios && foro.comentarios.length > 0 ? (
                  <div className="comentarios-list">
                    {foro.comentarios.map((comentario) => (
                      <ComentarioItem
                        key={comentario.id}
                        comentario={comentario}
                        onResponder={handleResponder}
                        onVotar={handleVotar}
                        nivel={0}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="no-comentarios">
                    <p>Aún no hay comentarios. ¡Sé el primero en comentar!</p>
                  </div>
                )}
              </div>
            </>
          )}

          {!foro.permite_comentarios && (
            <div className="comentarios-deshabilitados">
              <p>Los comentarios están deshabilitados para este foro.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const ComentarioItem = ({ comentario, onResponder, onVotar, nivel }) => {
  const [mostrarRespuestas, setMostrarRespuestas] = useState(true);

  return (
    <div className={`comentario-item nivel-${nivel}`}>
      <div className="comentario-header">
        <strong>{comentario.usuario_nombre}</strong>
        <span className="comentario-fecha">
          {new Date(comentario.creado_en).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
      <div className="comentario-content">
        <p>{comentario.comentario}</p>
      </div>
      <div className="comentario-actions">
        <button
          onClick={() => onVotar(comentario.id, 'like')}
          className="btn-voto"
          title="Me gusta"
        >
          👍 {comentario.total_likes || 0}
        </button>
        <button
          onClick={() => onVotar(comentario.id, 'dislike')}
          className="btn-voto"
          title="No me gusta"
        >
          👎 {comentario.total_dislikes || 0}
        </button>
        <button
          onClick={() => onResponder(comentario.id)}
          className="btn-responder"
        >
          Responder
        </button>
        {comentario.respuestas && comentario.respuestas.length > 0 && (
          <button
            onClick={() => setMostrarRespuestas(!mostrarRespuestas)}
            className="btn-toggle-respuestas"
          >
            {mostrarRespuestas ? 'Ocultar' : 'Mostrar'} {comentario.respuestas.length} respuesta(s)
          </button>
        )}
      </div>
      {comentario.respuestas && comentario.respuestas.length > 0 && mostrarRespuestas && (
        <div className="respuestas">
          {comentario.respuestas.map((respuesta) => (
            <ComentarioItem
              key={respuesta.id}
              comentario={respuesta}
              onResponder={onResponder}
              onVotar={onVotar}
              nivel={nivel + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ForoDetalle;














