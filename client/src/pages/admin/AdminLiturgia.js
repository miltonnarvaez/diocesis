import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './AdminCommon.css';
import './AdminLiturgia.css';

const AdminLiturgia = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingCalendario, setEditingCalendario] = useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    fecha: '',
    tiempo_liturgico: '',
    color_liturgico: '',
    solemnidad: '',
    fiesta: '',
    memoria: '',
    lectura_primera: '',
    salmo: '',
    lectura_segunda: '',
    evangelio: '',
    reflexion: ''
  });

  const { data: calendarioHoy } = useQuery({
    queryKey: ['liturgia-calendario', fechaSeleccionada],
    queryFn: async () => {
      const response = await api.get('/liturgia/calendario', {
        params: { fecha: fechaSeleccionada }
      });
      return response.data;
    }
  });

  useEffect(() => {
    if (calendarioHoy) {
      setFormData({
        fecha: calendarioHoy.fecha || fechaSeleccionada,
        tiempo_liturgico: calendarioHoy.tiempo_liturgico || '',
        color_liturgico: calendarioHoy.color_liturgico || '',
        solemnidad: calendarioHoy.solemnidad || '',
        fiesta: calendarioHoy.fiesta || '',
        memoria: calendarioHoy.memoria || '',
        lectura_primera: calendarioHoy.lectura_primera || '',
        salmo: calendarioHoy.salmo || '',
        lectura_segunda: calendarioHoy.lectura_segunda || '',
        evangelio: calendarioHoy.evangelio || '',
        reflexion: calendarioHoy.reflexion || ''
      });
      setEditingCalendario(calendarioHoy);
    } else {
      setFormData({
        fecha: fechaSeleccionada,
        tiempo_liturgico: '',
        color_liturgico: '',
        solemnidad: '',
        fiesta: '',
        memoria: '',
        lectura_primera: '',
        salmo: '',
        lectura_segunda: '',
        evangelio: '',
        reflexion: ''
      });
      setEditingCalendario(null);
    }
  }, [calendarioHoy, fechaSeleccionada]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/liturgia/calendario', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['liturgia-calendario']);
      alert('Calendario guardado exitosamente');
    },
    onError: (error) => {
      alert('Error al guardar: ' + (error.response?.data?.error || error.message));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const coloresLiturgicos = ['blanco', 'verde', 'morado', 'rojo', 'rosa', 'dorado'];
  const tiemposLiturgicos = ['Adviento', 'Navidad', 'Tiempo Ordinario', 'Cuaresma', 'Pascua', 'Tiempo Pascual'];

  return (
    <div className="admin-liturgia">
      <AdminNavbar />
      <div className="admin-content-wrapper">
        <div className="admin-header">
          <h1>Gestión de Calendario Litúrgico</h1>
        </div>

        <div className="fecha-selector-section">
          <label>Seleccionar Fecha:</label>
          <input
            type="date"
            value={fechaSeleccionada}
            onChange={(e) => setFechaSeleccionada(e.target.value)}
            className="date-input"
          />
        </div>

        <div className="admin-form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Fecha *</label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Tiempo Litúrgico</label>
                <select
                  name="tiempo_liturgico"
                  value={formData.tiempo_liturgico}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar</option>
                  {tiemposLiturgicos.map(tiempo => (
                    <option key={tiempo} value={tiempo}>{tiempo}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Color Litúrgico</label>
                <select
                  name="color_liturgico"
                  value={formData.color_liturgico}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar</option>
                  {coloresLiturgicos.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Solemnidad</label>
                <input
                  type="text"
                  name="solemnidad"
                  value={formData.solemnidad}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Fiesta</label>
                <input
                  type="text"
                  name="fiesta"
                  value={formData.fiesta}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Memoria</label>
                <input
                  type="text"
                  name="memoria"
                  value={formData.memoria}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group full-width">
                <label>Primera Lectura</label>
                <textarea
                  name="lectura_primera"
                  value={formData.lectura_primera}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
              <div className="form-group full-width">
                <label>Salmo</label>
                <textarea
                  name="salmo"
                  value={formData.salmo}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
              <div className="form-group full-width">
                <label>Segunda Lectura</label>
                <textarea
                  name="lectura_segunda"
                  value={formData.lectura_segunda}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
              <div className="form-group full-width">
                <label>Evangelio</label>
                <textarea
                  name="evangelio"
                  value={formData.evangelio}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
              <div className="form-group full-width">
                <label>Reflexión</label>
                <textarea
                  name="reflexion"
                  value={formData.reflexion}
                  onChange={handleChange}
                  rows="5"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Guardar Calendario
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLiturgia;
















