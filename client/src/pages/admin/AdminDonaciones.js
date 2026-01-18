import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { FaDollarSign, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import './AdminDonaciones.css';

const AdminDonaciones = () => {
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const queryClient = useQueryClient();

  const { data: donaciones = [], isLoading } = useQuery({
    queryKey: ['donaciones-admin', filtroEstado, filtroTipo],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await api.get('/donaciones', { 
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    }
  });

  const { data: estadisticas } = useQuery({
    queryKey: ['donaciones-estadisticas'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await api.get('/donaciones/estadisticas/resumen', { 
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, estado, recibo_generado }) => {
      const token = localStorage.getItem('token');
      const response = await api.put(`/donaciones/${id}`, 
        { estado, recibo_generado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['donaciones-admin']);
      queryClient.invalidateQueries(['donaciones-estadisticas']);
    }
  });

  const handleEstadoChange = (id, nuevoEstado, reciboGenerado = false) => {
    updateMutation.mutate({ id, estado: nuevoEstado, recibo_generado: reciboGenerado });
  };

  const estados = [
    { value: '', label: 'Todos' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'procesando', label: 'Procesando' },
    { value: 'completada', label: 'Completada' },
    { value: 'fallida', label: 'Fallida' },
    { value: 'cancelada', label: 'Cancelada' }
  ];

  const tipos = [
    { value: '', label: 'Todos' },
    { value: 'diezmo', label: 'Diezmo' },
    { value: 'donacion_unica', label: 'Donación Única' },
    { value: 'donacion_recurrente', label: 'Donación Recurrente' },
    { value: 'obra_social', label: 'Obra Social' },
    { value: 'seminario', label: 'Seminario' },
    { value: 'mantenimiento', label: 'Mantenimiento' }
  ];

  const filteredDonaciones = donaciones.filter(d => {
    const matchEstado = !filtroEstado || d.estado === filtroEstado;
    const matchTipo = !filtroTipo || d.tipo_donacion === filtroTipo;
    return matchEstado && matchTipo;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="admin-donaciones">
      <AdminNavbar />
      <div className="admin-content">
        <div className="admin-header">
          <h1><FaDollarSign /> Gestión de Donaciones</h1>
        </div>

        {estadisticas && (
          <div className="estadisticas-donaciones">
            <div className="stat-card destacado">
              <h3>Total Recaudado</h3>
              <p>{formatCurrency(estadisticas.total_recaudado || 0)}</p>
            </div>
            <div className="stat-card">
              <h3>Total Donaciones</h3>
              <p>{estadisticas.total_donaciones || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Diezmo</h3>
              <p>{formatCurrency(estadisticas.total_diezmo || 0)}</p>
            </div>
            <div className="stat-card">
              <h3>Promedio</h3>
              <p>{formatCurrency(estadisticas.promedio_donacion || 0)}</p>
            </div>
          </div>
        )}

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
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="filtro-select"
          >
            {tipos.map(tipo => (
              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="loading">Cargando donaciones...</div>
        ) : filteredDonaciones.length === 0 ? (
          <div className="no-results">No hay donaciones registradas.</div>
        ) : (
          <div className="donaciones-table-container">
            <table className="donaciones-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Donante</th>
                  <th>Monto</th>
                  <th>Tipo</th>
                  <th>Destino</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Recibo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonaciones.map(donacion => (
                  <tr key={donacion.id}>
                    <td>{donacion.id}</td>
                    <td>
                      <div>
                        <strong>{donacion.donante_nombre}</strong>
                        {donacion.donante_email && <div className="text-muted">{donacion.donante_email}</div>}
                        {donacion.donante_telefono && <div className="text-muted">{donacion.donante_telefono}</div>}
                      </div>
                    </td>
                    <td className="monto-cell">
                      <strong>{formatCurrency(donacion.monto)}</strong>
                    </td>
                    <td>
                      <span className="badge badge-tipo">{donacion.tipo_donacion}</span>
                    </td>
                    <td>{donacion.destino || '-'}</td>
                    <td>{new Date(donacion.fecha_donacion || donacion.created_at).toLocaleDateString('es-CO')}</td>
                    <td>
                      <span className={`estado-badge ${donacion.estado}`}>
                        {donacion.estado}
                      </span>
                    </td>
                    <td>
                      {donacion.recibo_generado ? (
                        <FaCheckCircle className="recibo-icon" />
                      ) : (
                        <span className="text-muted">No</span>
                      )}
                    </td>
                    <td>
                      <select
                        value={donacion.estado}
                        onChange={(e) => handleEstadoChange(donacion.id, e.target.value, donacion.recibo_generado)}
                        className="estado-select"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="procesando">Procesando</option>
                        <option value="completada">Completada</option>
                        <option value="fallida">Fallida</option>
                        <option value="cancelada">Cancelada</option>
                      </select>
                      {donacion.estado === 'completada' && !donacion.recibo_generado && (
                        <button
                          onClick={() => handleEstadoChange(donacion.id, 'completada', true)}
                          className="btn btn-sm btn-success"
                          style={{ marginTop: '0.5rem' }}
                        >
                          Generar Recibo
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDonaciones;
