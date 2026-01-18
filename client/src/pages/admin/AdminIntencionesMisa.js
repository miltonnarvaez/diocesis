import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { FaCross, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import './AdminIntencionesMisa.css';

const AdminIntencionesMisa = () => {
  const [filtroEstado, setFiltroEstado] = useState('');
  const queryClient = useQueryClient();

  const { data: intenciones = [], isLoading } = useQuery({
    queryKey: ['intenciones-misa-admin', filtroEstado],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const params = {};
      const response = await api.get('/intenciones-misa', { 
        headers: { Authorization: `Bearer ${token}` },
        params 
      });
      return response.data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, estado, observaciones }) => {
      const token = localStorage.getItem('token');
      const response = await api.put(`/intenciones-misa/${id}`, 
        { estado, observaciones },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['intenciones-misa-admin']);
    }
  });

  const handleEstadoChange = (id, nuevoEstado, observaciones = '') => {
    updateMutation.mutate({ id, estado: nuevoEstado, observaciones });
  };

  const estados = [
    { value: '', label: 'Todos' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'confirmada', label: 'Confirmada' },
    { value: 'realizada', label: 'Realizada' },
    { value: 'cancelada', label: 'Cancelada' }
  ];

  const getEstadoIcon = (estado) => {
    switch(estado) {
      case 'confirmada':
      case 'realizada':
        return <FaCheckCircle className="estado-icon confirmada" />;
      case 'cancelada':
        return <FaTimesCircle className="estado-icon cancelada" />;
      default:
        return <FaClock className="estado-icon pendiente" />;
    }
  };

  const filteredIntenciones = filtroEstado 
    ? intenciones.filter(i => i.estado === filtroEstado)
    : intenciones;

  return (
    <div className="admin-intenciones-misa">
      <AdminNavbar />
      <div className="admin-content">
        <div className="admin-header">
          <h1><FaCross /> Gestión de Intenciones de Misa</h1>
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
          <div className="loading">Cargando intenciones...</div>
        ) : filteredIntenciones.length === 0 ? (
          <div className="no-results">No hay intenciones registradas.</div>
        ) : (
          <div className="intenciones-table-container">
            <table className="intenciones-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Solicitante</th>
                  <th>Fecha Misa</th>
                  <th>Tipo</th>
                  <th>Intención</th>
                  <th>Parroquia</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredIntenciones.map(intencion => (
                  <tr key={intencion.id}>
                    <td>{intencion.id}</td>
                    <td>
                      <div>
                        <strong>{intencion.nombre_solicitante}</strong>
                        {intencion.email && <div className="text-muted">{intencion.email}</div>}
                        {intencion.telefono && <div className="text-muted">{intencion.telefono}</div>}
                      </div>
                    </td>
                    <td>{new Date(intencion.fecha_misa).toLocaleDateString('es-CO')}</td>
                    <td>
                      <span className="badge badge-tipo">{intencion.tipo_intencion}</span>
                    </td>
                    <td>
                      <div className="intencion-text">
                        {intencion.intencion_especifica?.substring(0, 100)}...
                        {intencion.nombre_difunto && (
                          <div className="text-muted">Por: {intencion.nombre_difunto}</div>
                        )}
                      </div>
                    </td>
                    <td>{intencion.parroquia_nombre || '-'}</td>
                    <td>
                      <div className="estado-cell">
                        {getEstadoIcon(intencion.estado)}
                        <span className={`estado-badge ${intencion.estado}`}>
                          {intencion.estado}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="acciones">
                        <select
                          value={intencion.estado}
                          onChange={(e) => handleEstadoChange(intencion.id, e.target.value)}
                          className="estado-select"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="confirmada">Confirmada</option>
                          <option value="realizada">Realizada</option>
                          <option value="cancelada">Cancelada</option>
                        </select>
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
            <p>{intenciones.length}</p>
          </div>
          <div className="stat-card">
            <h3>Pendientes</h3>
            <p>{intenciones.filter(i => i.estado === 'pendiente').length}</p>
          </div>
          <div className="stat-card">
            <h3>Confirmadas</h3>
            <p>{intenciones.filter(i => i.estado === 'confirmada').length}</p>
          </div>
          <div className="stat-card">
            <h3>Realizadas</h3>
            <p>{intenciones.filter(i => i.estado === 'realizada').length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminIntencionesMisa;
