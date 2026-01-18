import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaHeart, FaStar, FaPlus } from 'react-icons/fa';
import './Testimonios.css';

const Testimonios = () => {
  const [showForm, setShowForm] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [formData, setFormData] = useState({
    nombre_autor: '',
    email: '',
    telefono: '',
    titulo: '',
    testimonio: '',
    categoria: 'otra'
  });

  const { data: testimonios = [], isLoading } = useQuery({
    queryKey: ['testimonios', filtroCategoria],
    queryFn: async () => {
      const params = {};
      if (filtroCategoria) params.categoria = filtroCategoria;
      const response = await api.get('/testimonios', { params });
      return response.data;
    }
  });

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/testimonios', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['testimonios']);
      setShowForm(false);
      setFormData({
        nombre_autor: '',
        email: '',
        telefono: '',
        titulo: '',
        testimonio: '',
        categoria: 'otra'
      });
      alert('Tu testimonio ha sido enviado. Será revisado antes de publicarse.');
    }
  });

  const categorias = [
    { value: '', label: 'Todas' },
    { value: 'conversion', label: 'Conversión' },
    { value: 'milagro', label: 'Milagros' },
    { value: 'vocacion', label: 'Vocaciones' },
    { value: 'caridad', label: 'Caridad' },
    { value: 'sanacion', label: 'Sanación' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="testimonios-page">
      <div className="container">
        <div className="page-header">
          <h1><FaHeart /> Testimonios de Fe</h1>
          <p>Comparte tu testimonio y fortalece la fe de otros</p>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            <FaPlus /> Compartir mi Testimonio
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="testimonio-form">
            <h2>Comparte tu Testimonio</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Tu Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre_autor}
                  onChange={(e) => setFormData({...formData, nombre_autor: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Título del Testimonio *</label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Tu Testimonio *</label>
              <textarea
                value={formData.testimonio}
                onChange={(e) => setFormData({...formData, testimonio: e.target.value})}
                rows="8"
                required
                placeholder="Comparte tu experiencia de fe..."
              />
            </div>
            <div className="form-group">
              <label>Categoría</label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({...formData, categoria: e.target.value})}
              >
                {categorias.slice(1).map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
                {mutation.isPending ? 'Enviando...' : 'Enviar Testimonio'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div className="filtros">
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="filtro-select"
          >
            {categorias.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="loading">Cargando testimonios...</div>
        ) : testimonios.length === 0 ? (
          <div className="no-results">No hay testimonios disponibles.</div>
        ) : (
          <div className="testimonios-grid">
            {testimonios.map(testimonio => (
              <div key={testimonio.id} className="testimonio-card">
                {testimonio.destacado && <FaStar className="destacada-icon" />}
                <h3>{testimonio.titulo}</h3>
                <p className="testimonio-autor">Por: {testimonio.nombre_autor}</p>
                <span className="badge">{testimonio.categoria}</span>
                <p className="testimonio-preview">
                  {testimonio.testimonio.substring(0, 200)}...
                </p>
                <Link to={`/testimonios/${testimonio.id}`} className="btn btn-link">
                  Leer completo
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Testimonios;
