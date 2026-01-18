import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { FaCalendarCheck, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import './AdminReservas.css';

const AdminReservas = () => {
  const [filtroEstado, setFiltroEstado] = useState('');
  const queryClient = useQueryClient();

  const { data: reservas = [], isLoading } = useQuery({
    queryKey: ['reservas-admin', filtroEstado],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await api.get('/reservas', { 
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    }
  });

  const { data: espacios = [] } = useQuery({
    queryKey: ['espacios-admin'],
    queryFn: async () => {
      const response = await api.get('/reservas/espacios');
      return response.data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, estado, observaciones_admin }) => {
      const token = localStorage.getItem('token');
      const response = await api.put(`/reservas/${id}`, 
        { estado, observaciones_admin },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['reservas-admin']);
    }
  });

  const handleEstadoChange = (id, nuevoEstado, observaciones = '') => {
    updateMutation.mutate({ id, estado: nuevoEstado, observaciones_admin: observaciones });
  };

  const estados = [
    { value: '', label: 'Todos' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'aprobada', label: 'Aprobada' },
    { value: 'rechazada', label: 'Rechazada' },
    { value: 'cancelada', label: 'Cancelada' },
    { value: 'completada', label: 'Completada' }
  ];

  const filteredReservas = filtroEstado 
    ? reservas.filter(r => r.estado === filtroEstado)
    : reservas;

  return (
    <div className="admin-reservas">
      <AdminNavbar />
      <div className="admin-content">
        <div className="admin-header">
          <h1><FaCalendarCheck /> Gestión de Reservas</h1>
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
          <div className="loading">Cargando reservas...</div>
        ) : filteredReservas.length === 0 ? (
          <div className="no-results">No hay reservas registradas.</div>
        ) : (
          <div className="reservas-table-container">
            <table className="reservas-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Solicitante</th>
                  <th>Espacio</th>
                  <th>Fecha</th>
                  <th>Horario</th>
                  <th>Motivo</th>
                  <th>Personas</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservas.map(reserva => (
                  <tr key={reserva.id}>
                    <td>{reserva.id}</td>
                    <td>
                      <div>
                        <strong>{reserva.nombre_solicitante}</strong>
                        {reserva.email && <div className="text-muted">{reserva.email}</div>}
                        {reserva.telefono && <div className="text-muted">{reserva.telefono}</div>}
                      </div>
                    </td>
                    <td>{reserva.espacio_nombre || '-'}</td>
                    <td>{new Date(reserva.fecha_reserva).toLocaleDateString('es-CO')}</td>
                    <td>
                      {reserva.hora_inicio} - {reserva.hora_fin}
                    </td>
                    <td>{reserva.motivo || '-'}</td>
                    <td>{reserva.numero_personas || '-'}</td>
                    <td>
                      <span className={`estado-badge ${reserva.estado}`}>
                        {reserva.estado}
                      </span>
                    </td>
                    <td>
                      <select
                        value={reserva.estado}
                        onChange={(e) => handleEstadoChange(reserva.id, e.target.value)}
                        className="estado-select"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="aprobada">Aprobada</option>
                        <option value="rechazada">Rechazada</option>
                        <option value="cancelada">Cancelada</option>
                        <option value="completada">Completada</option>
                      </select>
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
            <p>{reservas.length}</p>
          </div>
          <div className="stat-card">
            <h3>Pendientes</h3>
            <p>{reservas.filter(r => r.estado === 'pendiente').length}</p>
          </div>
          <div className="stat-card">
            <h3>Aprobadas</h3>
            <p>{reservas.filter(r => r.estado === 'aprobada').length}</p>
          </div>
          <div className="stat-card">
            <h3>Completadas</h3>
            <p>{reservas.filter(r => r.estado === 'completada').length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReservas;
