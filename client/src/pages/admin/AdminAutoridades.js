import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import AdminFilters from '../../components/admin/AdminFilters';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './AdminCommon.css';
import './AdminAutoridades.css';

const AdminAutoridades = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCargo, setFilterCargo] = useState('todos');
  const [filterEstado, setFilterEstado] = useState('todas');
  const [formData, setFormData] = useState({
    nombre: '',
    cargo: '',
    orden: 0,
    email: '',
    telefono: '',
    foto_url: '',
    biografia: '',
    activo: true
  });
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const queryClient = useQueryClient();

  // Cargos comunes del Diócesis
  const cargosComunes = [
    'Presidente del Diócesis',
    'Vicepresidente del Diócesis',
    'Secretario del Diócesis',
    'Concejal',
    'Concejal Suplente'
  ];

  // Obtener todas las autoridades (admin)
  const { data: autoridades = [], isLoading } = useQuery({
    queryKey: ['autoridades', 'admin'],
    queryFn: async () => {
      const response = await api.get('/autoridades/admin/all');
      return response.data;
    }
  });

  // Crear autoridad
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/autoridades', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['autoridades']);
      resetForm();
      alert('Autoridad creada exitosamente');
    },
    onError: (error) => {
      alert('Error al crear autoridad: ' + (error.response?.data?.error || error.message));
    }
  });

  // Actualizar autoridad
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/autoridades/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['autoridades']);
      resetForm();
      alert('Autoridad actualizada exitosamente');
    },
    onError: (error) => {
      alert('Error al actualizar autoridad: ' + (error.response?.data?.error || error.message));
    }
  });

  // Eliminar autoridad
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/autoridades/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['autoridades']);
      alert('Autoridad eliminada exitosamente');
    },
    onError: (error) => {
      alert('Error al eliminar autoridad: ' + (error.response?.data?.error || error.message));
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
    }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    if (fotoFile) {
      data.append('foto', fotoFile);
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      setFotoFile(null);
      setFotoPreview(null);
    } catch (error) {
      alert('Error al guardar autoridad: ' + (error.response?.data?.error || error.message));
    }
  };

  const toggleActivar = async (id, activo) => {
    try {
      await api.patch(`/autoridades/${id}/activar`, { activo: !activo });
      queryClient.invalidateQueries(['autoridades']);
      alert(`Autoridad ${!activo ? 'activada' : 'desactivada'} exitosamente`);
    } catch (error) {
      alert('Error al cambiar estado: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (autoridad) => {
    setFormData({
      nombre: autoridad.nombre || '',
      cargo: autoridad.cargo || '',
      orden: autoridad.orden || 0,
      email: autoridad.email || '',
      telefono: autoridad.telefono || '',
      foto_url: autoridad.foto_url || '',
      biografia: autoridad.biografia || '',
      activo: autoridad.activo !== undefined ? autoridad.activo : true
    });
    setEditingId(autoridad.id);
    setFotoFile(null);
    setFotoPreview(autoridad.foto_url || null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro de eliminar esta autoridad?')) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      cargo: '',
      orden: 0,
      email: '',
      telefono: '',
      foto_url: '',
      biografia: '',
      activo: true
    });
    setEditingId(null);
    setFotoFile(null);
    setFotoPreview(null);
    setShowForm(false);
  };

  // Filtrar autoridades
  const autoridadesFiltradas = autoridades.filter(autoridad => {
    const matchSearch = searchQuery === '' || 
      autoridad.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      autoridad.cargo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      autoridad.biografia?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchCargo = filterCargo === 'todos' || autoridad.cargo === filterCargo;
    
    const matchEstado = filterEstado === 'todas' || 
      (filterEstado === 'activas' && autoridad.activo) ||
      (filterEstado === 'inactivas' && !autoridad.activo);
    
    return matchSearch && matchCargo && matchEstado;
  });

  // Obtener cargos únicos para el filtro
  const cargosUnicos = [...new Set(autoridades.map(a => a.cargo).filter(Boolean))];

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterCargo('todos');
    setFilterEstado('todas');
  };

  if (isLoading) {
    return <div className="loading">Cargando autoridades...</div>;
  }

  return (
    <div className="admin-autoridades">
      <AdminNavbar title="Gestión de Autoridades" />
      <div className="admin-content-wrapper">
        <div className="admin-actions">
            <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
              {showForm ? '✕ Cancelar' : '+ Nueva Autoridad'}
            </button>
          </div>

          <AdminFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchPlaceholder="Buscar por nombre, cargo o biografía..."
            filters={[
              {
                name: 'cargo',
                label: 'Cargo',
                value: filterCargo,
                defaultValue: 'todos',
                onChange: setFilterCargo,
                options: [
                  { value: 'todos', label: 'Todos los cargos' },
                  ...cargosUnicos.map(cargo => ({ value: cargo, label: cargo }))
                ]
              },
              {
                name: 'estado',
                label: 'Estado',
                value: filterEstado,
                defaultValue: 'todas',
                onChange: setFilterEstado,
                options: [
                  { value: 'todas', label: 'Todas' },
                  { value: 'activas', label: 'Activas' },
                  { value: 'inactivas', label: 'Inactivas' }
                ]
              }
            ]}
            onClearFilters={handleClearFilters}
            totalItems={autoridades.length}
            filteredItems={autoridadesFiltradas.length}
          />

          {showForm && (
            <form className="autoridades-form" onSubmit={handleSubmit}>
              <h2>{editingId ? 'Editar Autoridad' : 'Nueva Autoridad'}</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre Completo *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Juan Pérez"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cargo">Cargo *</label>
                  <input
                    type="text"
                    id="cargo"
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleChange}
                    required
                    list="cargos-list"
                    placeholder="Ej: Presidente del Diócesis"
                  />
                  <datalist id="cargos-list">
                    {cargosComunes.map((cargo, index) => (
                      <option key={index} value={cargo} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="orden">Orden de Visualización</label>
                  <input
                    type="number"
                    id="orden"
                    name="orden"
                    value={formData.orden}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                  />
                  <small className="form-help">
                    Número menor = aparece primero en la lista
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Correo Electrónico</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ejemplo@Diócesis.Ipiales.gov.co"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="telefono">Teléfono</label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="+57 (2) XXX-XXXX"
                />
              </div>

              <div className="form-group">
                <label htmlFor="foto">Foto</label>
                <input
                  type="file"
                  id="foto"
                  name="foto"
                  accept="image/*"
                  onChange={handleFotoChange}
                />
                <small>Sube una foto o usa una URL (opcional)</small>
                {fotoPreview && (
                  <div className="image-preview">
                    <img src={fotoPreview} alt="Vista previa" />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="foto_url">URL de la Foto (Alternativa)</label>
                <input
                  type="url"
                  id="foto_url"
                  name="foto_url"
                  value={formData.foto_url}
                  onChange={handleChange}
                  placeholder="https://ejemplo.com/foto.jpg"
                />
                <small className="form-help">
                  Si no subes un archivo, puedes usar una URL
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="biografia">Biografía</label>
                <textarea
                  id="biografia"
                  name="biografia"
                  value={formData.biografia}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Breve biografía o información adicional sobre la autoridad..."
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo}
                    onChange={handleChange}
                  />
                  Activa (visible en la página pública)
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={createMutation.isLoading || updateMutation.isLoading}>
                  {editingId ? 'Actualizar' : 'Crear'} Autoridad
                </button>
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="autoridades-list">
            <h2>Autoridades del Diócesis</h2>
            
            {autoridadesFiltradas.length === 0 ? (
              <div className="no-results">
                <p>
                  {autoridades.length === 0 
                    ? 'No hay autoridades registradas.' 
                    : 'No se encontraron autoridades con los filtros aplicados.'}
                </p>
                {(searchQuery || filterCargo !== 'todos' || filterEstado !== 'todas') && (
                  <button onClick={handleClearFilters} className="btn btn-secondary">
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="autoridades-grid">
                {autoridadesFiltradas.map((autoridad) => (
                  <div key={autoridad.id} className={`autoridad-card ${!autoridad.activo ? 'inactive' : ''}`}>
                    {autoridad.foto_url && (
                      <div className="autoridad-foto">
                        <img src={autoridad.foto_url} alt={autoridad.nombre} />
                      </div>
                    )}
                    <div className="autoridad-info">
                      <h3>{autoridad.cargo}</h3>
                      <p className="autoridad-nombre">{autoridad.nombre}</p>
                      {autoridad.email && (
                        <p className="autoridad-contacto">✉️ {autoridad.email}</p>
                      )}
                      {autoridad.telefono && (
                        <p className="autoridad-contacto">📞 {autoridad.telefono}</p>
                      )}
                      {autoridad.biografia && (
                        <p className="autoridad-biografia">{autoridad.biografia}</p>
                      )}
                      <div className="autoridad-meta">
                        <span className="orden-badge">Orden: {autoridad.orden}</span>
                        <span className={`status-badge ${autoridad.activo ? 'active' : 'inactive'}`}>
                          {autoridad.activo ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                    </div>
                    <div className="autoridad-actions">
                      <button 
                        onClick={() => handleEdit(autoridad)}
                        className="btn btn-sm btn-edit"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => toggleActivar(autoridad.id, autoridad.activo)}
                        className={`btn btn-sm ${autoridad.activo ? 'btn-warning' : 'btn-success'}`}
                      >
                        {autoridad.activo ? 'Desactivar' : 'Activar'}
                      </button>
                      <button 
                        onClick={() => handleDelete(autoridad.id)}
                        className="btn btn-sm btn-delete"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default AdminAutoridades;

