import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { FaHeart, FaCheckCircle, FaTimesCircle, FaStar } from 'react-icons/fa';
import './AdminTestimonios.css';

const AdminTestimonios = () => {
  const [filtroEstado, setFiltroEstado] = useState('');
  const queryClient = useQueryClient();

  const { data: testimonios = [], isLoading } = useQuery({
    queryKey: ['testimonios-admin', filtroEstado],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await api.get('/testimonios/admin/todos', { 
        headers: { Authorization: `Bearer ${token}` },
        params: filtroEstado ? { estado: filtroEstado } : {}
      });
      return response.data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, aprobado, destacado, fecha_publicacion }) => {
      const token = localStorage.getItem('token');
      const response = await api.put(`/testimonios/${id}/aprobar`, 
        { aprobado, destacado, fecha_publicacion },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['testimonios-admin']);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem('token');
      const response = await api.delete(`/testimonios/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['testimonios-admin']);
      alert('Testimonio eliminado exitosamente');
    }
  });

  const handleAprobar = (id, aprobado, destacado = false) => {
    updateMutation.mutate({ 
      id, 
      aprobado, 
      destacado,
      fecha_publicacion: aprobado ? new Date().toISOString().split('T')[0] : null
    });
  };

  const estados = [
    { value: '', label: 'Todos' },
    { value: 'pendiente', label: 'Pendientes' },
    { value: 'aprobado', label: 'Aprobados' }
  ];

  const filteredTestimonios = filtroEstado 
    ? testimonios.filter(t => filtroEstado === 'pendiente' ? !t.aprobado : t.aprobado)
    : testimonios;

  return (
    <div className="admin-testimonios">
      <AdminNavbar />
      <div className="admin-content">
        <div className="admin-header">
          <h1><FaHeart /> Gestión de Testimonios</h1>
        </div>

        <div className="filtros">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="filtro-select"
          >
            {estados.map(estado => (
              <option key={estado.value} value={estado.value}>{estado.label}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="loading">Cargando testimonios...</div>
        ) : filteredTestimonios.length === 0 ? (
          <div className="no-results">No hay testimonios registrados.</div>
        ) : (
          <div className="testimonios-table-container">
            <table className="testimonios-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Autor</th>
                  <th>Título</th>
                  <th>Categoría</th>
                  <th>Testimonio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTestimonios.map(testimonio => (
                  <tr key={testimonio.id}>
                    <td>{testimonio.id}</td>
                    <td>
                      <div>
                        <strong>{testimonio.nombre_autor}</strong>
                        {testimonio.email && <div className="text-muted">{testimonio.email}</div>}
                      </div>
                    </td>
                    <td>{testimonio.titulo}</td>
                    <td>
                      <span className="badge">{testimonio.categoria}</span>
                    </td>
                    <td>
                      <div className="testimonio-text">
                        {testimonio.testimonio.substring(0, 150)}...
                      </div>
                    </td>
                    <td>
                      {testimonio.aprobado ? (
                        <span className="estado-badge aprobado">
                          <FaCheckCircle /> Aprobado
                        </span>
                      ) : (
                        <span className="estado-badge pendiente">
                          <FaTimesCircle /> Pendiente
                        </span>
                      )}
                      {testimonio.destacado && <FaStar className="destacada-icon" />}
                    </td>
                    <td>
                      <div className="acciones">
                        {!testimonio.aprobado && (
                          <button
                            onClick={() => handleAprobar(testimonio.id, true, false)}
                            className="btn btn-sm btn-success"
                          >
                            Aprobar
                          </button>
                        )}
                        {testimonio.aprobado && !testimonio.destacado && (
                          <button
                            onClick={() => handleAprobar(testimonio.id, true, true)}
                            className="btn btn-sm btn-warning"
                          >
                            Destacar
                          </button>
                        )}
                        <button
                          onClick={() => deleteMutation.mutate(testimonio.id)}
                          className="btn btn-sm btn-delete"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="stats">
          <div className="stat-card">
            <h3>Total</h3>
            <p>{testimonios.length}</p>
          </div>
          <div className="stat-card">
            <h3>Pendientes</h3>
            <p>{testimonios.filter(t => !t.aprobado).length}</p>
          </div>
          <div className="stat-card">
            <h3>Aprobados</h3>
            <p>{testimonios.filter(t => t.aprobado).length}</p>
          </div>
          <div className="stat-card">
            <h3>Destacados</h3>
            <p>{testimonios.filter(t => t.destacado).length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTestimonios;
