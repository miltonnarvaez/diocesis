import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import AdminNavbar from '../../components/admin/AdminNavbar';
import AdminFilters from '../../components/admin/AdminFilters';
import './AdminCommon.css';
import './AdminSearchProfile.css';
import { FaUserTie, FaChurch, FaHandsHelping, FaSearch, FaExternalLinkAlt } from 'react-icons/fa';

const AdminSearchProfile = () => {
  const [tipoPerfil, setTipoPerfil] = useState('autoridad'); // autoridad, misionero, parroco, voluntario
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const queryClient = useQueryClient();

  // Form data según el tipo de perfil
  const [formData, setFormData] = useState({
    // Autoridad
    nombre: '',
    cargo: '',
    orden: 0,
    email: '',
    telefono: '',
    foto_url: '',
    biografia: '',
    activo: true,
    // Misionero
    nombre_completo: '',
    tipo: '',
    experiencia: '',
    contacto: '',
    imagen_url: '',
    mision_actual_id: null,
    // Párroco (desde parroquia)
    nombre_parroquia: '',
    parroco: '',
    vicario: '',
    direccion: '',
    zona_pastoral: '',
    // Voluntario
    documento: '',
    area_interes: '',
    habilidades: '',
    disponibilidad: '',
    proyecto_id: null,
    estado: 'pendiente'
  });

  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);

  // Obtener perfiles según el tipo
  const { data: perfiles = [], isLoading } = useQuery({
    queryKey: ['perfiles', tipoPerfil],
    queryFn: async () => {
      let endpoint = '';
      switch (tipoPerfil) {
        case 'autoridad':
          endpoint = '/autoridades/admin/all';
          break;
        case 'misionero':
          endpoint = '/misiones/misioneros';
          break;
        case 'parroco':
          endpoint = '/parroquias';
          break;
        case 'voluntario':
          endpoint = '/caridad/voluntarios';
          break;
        default:
          return [];
      }
      const response = await api.get(endpoint);
      return response.data;
    }
  });

  // Crear perfil
  const createMutation = useMutation({
    mutationFn: async (data) => {
      let endpoint = '';
      switch (tipoPerfil) {
        case 'autoridad':
          endpoint = '/autoridades';
          break;
        case 'misionero':
          endpoint = '/misiones/misioneros';
          break;
        case 'parroco':
          // Los párrocos se gestionan desde parroquias
          endpoint = '/parroquias';
          break;
        case 'voluntario':
          endpoint = '/caridad/voluntarios';
          break;
      }
      const formDataToSend = new FormData();
      for (const key in data) {
        if (data[key] !== null && data[key] !== undefined) {
          formDataToSend.append(key, data[key]);
        }
      }
      if (fotoFile) {
        formDataToSend.append('foto', fotoFile);
        if (tipoPerfil === 'misionero') {
          formDataToSend.append('imagen', fotoFile);
        }
      }
      const response = await api.post(endpoint, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['perfiles', tipoPerfil]);
      resetForm();
      alert(`${getTipoLabel()} creado exitosamente`);
    },
    onError: (error) => {
      alert(`Error al crear ${getTipoLabel()}: ${error.response?.data?.error || error.message}`);
    }
  });

  // Actualizar perfil
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      let endpoint = '';
      switch (tipoPerfil) {
        case 'autoridad':
          endpoint = `/autoridades/${id}`;
          break;
        case 'misionero':
          endpoint = `/misiones/misioneros/${id}`;
          break;
        case 'parroco':
          endpoint = `/parroquias/${id}`;
          break;
        case 'voluntario':
          endpoint = `/caridad/voluntarios/${id}`;
          break;
      }
      const formDataToSend = new FormData();
      for (const key in data) {
        if (data[key] !== null && data[key] !== undefined) {
          formDataToSend.append(key, data[key]);
        }
      }
      if (fotoFile) {
        formDataToSend.append('foto', fotoFile);
        if (tipoPerfil === 'misionero') {
          formDataToSend.append('imagen', fotoFile);
        }
      }
      const response = await api.put(endpoint, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['perfiles', tipoPerfil]);
      resetForm();
      alert(`${getTipoLabel()} actualizado exitosamente`);
    },
    onError: (error) => {
      alert(`Error al actualizar ${getTipoLabel()}: ${error.response?.data?.error || error.message}`);
    }
  });

  // Eliminar perfil
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      let endpoint = '';
      switch (tipoPerfil) {
        case 'autoridad':
          endpoint = `/autoridades/${id}`;
          break;
        case 'misionero':
          endpoint = `/misiones/misioneros/${id}`;
          break;
        case 'parroco':
          endpoint = `/parroquias/${id}`;
          break;
        case 'voluntario':
          endpoint = `/caridad/voluntarios/${id}`;
          break;
      }
      await api.delete(endpoint);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['perfiles', tipoPerfil]);
      alert(`${getTipoLabel()} eliminado exitosamente`);
    },
    onError: (error) => {
      alert(`Error al eliminar ${getTipoLabel()}: ${error.response?.data?.error || error.message}`);
    }
  });

  const getTipoLabel = () => {
    const labels = {
      autoridad: 'Autoridad',
      misionero: 'Misionero',
      parroco: 'Párroco',
      voluntario: 'Voluntario'
    };
    return labels[tipoPerfil] || 'Perfil';
  };

  const getTipoIcon = () => {
    const icons = {
      autoridad: FaUserTie,
      misionero: FaChurch,
      parroco: FaChurch,
      voluntario: FaHandsHelping
    };
    return icons[tipoPerfil] || FaUserTie;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value)
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
    
    // Validar campos requeridos según el tipo
    if (tipoPerfil === 'autoridad' && (!formData.nombre || !formData.cargo)) {
      alert('Por favor complete los campos requeridos: Nombre y Cargo');
      return;
    }
    if (tipoPerfil === 'misionero' && !formData.nombre_completo) {
      alert('Por favor complete el campo requerido: Nombre Completo');
      return;
    }
    if (tipoPerfil === 'parroco' && (!formData.nombre_parroquia || !formData.parroco)) {
      alert('Por favor complete los campos requeridos: Nombre de la Parroquia y Párroco');
      return;
    }
    if (tipoPerfil === 'voluntario' && (!formData.nombre_completo || !formData.documento || !formData.email)) {
      alert('Por favor complete los campos requeridos: Nombre Completo, Documento y Email');
      return;
    }
    
    const data = { ...formData };
    
    // Limpiar campos vacíos
    Object.keys(data).forEach(key => {
      if (data[key] === '' || data[key] === null) {
        delete data[key];
      }
    });
    
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      setFotoFile(null);
      setFotoPreview(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (perfil) => {
    setEditingId(perfil.id);
    const data = { ...formData };
    
    // Mapear campos según el tipo
    if (tipoPerfil === 'autoridad') {
      data.nombre = perfil.nombre || '';
      data.cargo = perfil.cargo || '';
      data.orden = perfil.orden || 0;
      data.email = perfil.email || '';
      data.telefono = perfil.telefono || '';
      data.foto_url = perfil.foto_url || '';
      data.biografia = perfil.biografia || '';
      data.activo = perfil.activo !== undefined ? perfil.activo : true;
      setFotoPreview(perfil.foto_url || null);
    } else if (tipoPerfil === 'misionero') {
      data.nombre_completo = perfil.nombre_completo || '';
      data.tipo = perfil.tipo || '';
      data.biografia = perfil.biografia || '';
      data.experiencia = perfil.experiencia || '';
      data.email = perfil.email || '';
      data.telefono = perfil.telefono || '';
      data.contacto = perfil.contacto || '';
      data.imagen_url = perfil.imagen_url || '';
      data.mision_actual_id = perfil.mision_actual_id || null;
      setFotoPreview(perfil.imagen_url || null);
    } else if (tipoPerfil === 'parroco') {
      data.nombre_parroquia = perfil.nombre || '';
      data.parroco = perfil.parroco || '';
      data.vicario = perfil.vicario || '';
      data.direccion = perfil.direccion || '';
      data.telefono = perfil.telefono || '';
      data.email = perfil.email || '';
      data.zona_pastoral = perfil.zona_pastoral || '';
    } else if (tipoPerfil === 'voluntario') {
      data.nombre_completo = perfil.nombre_completo || '';
      data.documento = perfil.documento || '';
      data.email = perfil.email || '';
      data.telefono = perfil.telefono || '';
      data.direccion = perfil.direccion || '';
      data.habilidades = perfil.habilidades || '';
      data.area_interes = perfil.area_interes || '';
      data.disponibilidad = perfil.disponibilidad || '';
      data.proyecto_id = perfil.proyecto_id || null;
      data.estado = perfil.estado || 'pendiente';
    }
    
    setFormData(data);
    setFotoFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm(`¿Está seguro de eliminar este ${getTipoLabel().toLowerCase()}?`)) {
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
      activo: true,
      nombre_completo: '',
      tipo: '',
      experiencia: '',
      contacto: '',
      imagen_url: '',
      mision_actual_id: null,
      nombre_parroquia: '',
      parroco: '',
      vicario: '',
      direccion: '',
      zona_pastoral: '',
      documento: '',
      area_interes: '',
      habilidades: '',
      disponibilidad: '',
      proyecto_id: null,
      estado: 'pendiente'
    });
    setEditingId(null);
    setFotoFile(null);
    setFotoPreview(null);
    setShowForm(false);
  };

  // Filtrar perfiles
  const perfilesFiltrados = perfiles.filter(perfil => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    if (tipoPerfil === 'autoridad') {
      return perfil.nombre?.toLowerCase().includes(query) ||
             perfil.cargo?.toLowerCase().includes(query) ||
             perfil.email?.toLowerCase().includes(query);
    } else if (tipoPerfil === 'misionero') {
      return perfil.nombre_completo?.toLowerCase().includes(query) ||
             perfil.tipo?.toLowerCase().includes(query) ||
             perfil.email?.toLowerCase().includes(query);
    } else if (tipoPerfil === 'parroco') {
      return perfil.nombre?.toLowerCase().includes(query) ||
             perfil.parroco?.toLowerCase().includes(query) ||
             perfil.vicario?.toLowerCase().includes(query);
    } else if (tipoPerfil === 'voluntario') {
      return perfil.nombre_completo?.toLowerCase().includes(query) ||
             perfil.documento?.toLowerCase().includes(query) ||
             perfil.email?.toLowerCase().includes(query);
    }
    return true;
  });

  const Icon = getTipoIcon();

  return (
    <div className="admin-search-profile">
      <AdminNavbar title="Gestión de Perfiles" />
      <div className="admin-content-wrapper">
        <div className="profile-type-selector">
          <button
            className={`type-btn ${tipoPerfil === 'autoridad' ? 'active' : ''}`}
            onClick={() => { setTipoPerfil('autoridad'); resetForm(); }}
          >
            <FaUserTie /> Autoridades
          </button>
          <button
            className={`type-btn ${tipoPerfil === 'misionero' ? 'active' : ''}`}
            onClick={() => { setTipoPerfil('misionero'); resetForm(); }}
          >
            <FaChurch /> Misioneros
          </button>
          <button
            className={`type-btn ${tipoPerfil === 'parroco' ? 'active' : ''}`}
            onClick={() => { setTipoPerfil('parroco'); resetForm(); }}
          >
            <FaChurch /> Párrocos
          </button>
          <button
            className={`type-btn ${tipoPerfil === 'voluntario' ? 'active' : ''}`}
            onClick={() => { setTipoPerfil('voluntario'); resetForm(); }}
          >
            <FaHandsHelping /> Voluntarios
          </button>
        </div>

        <div className="admin-actions">
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? '✕ Cancelar' : `+ Nuevo ${getTipoLabel()}`}
          </button>
          <Link to="/search-profile" target="_blank" className="btn btn-secondary">
            <FaSearch /> Ver Búsqueda Pública <FaExternalLinkAlt />
          </Link>
        </div>

        <AdminFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchPlaceholder={`Buscar ${getTipoLabel().toLowerCase()}...`}
          totalItems={perfiles.length}
          filteredItems={perfilesFiltrados.length}
        />

        {showForm && (
          <form className="profile-form" onSubmit={handleSubmit}>
            <h2>{editingId ? `Editar ${getTipoLabel()}` : `Nuevo ${getTipoLabel()}`}</h2>
            
            {tipoPerfil === 'autoridad' && (
              <>
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
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="telefono">Teléfono</label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="biografia">Biografía</label>
                  <textarea
                    id="biografia"
                    name="biografia"
                    value={formData.biografia}
                    onChange={handleChange}
                    rows="4"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="foto">Foto</label>
                  <input
                    type="file"
                    id="foto"
                    accept="image/*"
                    onChange={handleFotoChange}
                  />
                  {fotoPreview && (
                    <div className="image-preview">
                      <img src={fotoPreview} alt="Vista previa" />
                    </div>
                  )}
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="activo"
                      checked={formData.activo}
                      onChange={handleChange}
                    />
                    Activo
                  </label>
                </div>
              </>
            )}

            {tipoPerfil === 'misionero' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="nombre_completo">Nombre Completo *</label>
                    <input
                      type="text"
                      id="nombre_completo"
                      name="nombre_completo"
                      value={formData.nombre_completo}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="tipo">Tipo</label>
                    <input
                      type="text"
                      id="tipo"
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleChange}
                      placeholder="sacerdote, religioso, laico..."
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="telefono">Teléfono</label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="biografia">Biografía</label>
                  <textarea
                    id="biografia"
                    name="biografia"
                    value={formData.biografia}
                    onChange={handleChange}
                    rows="4"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="experiencia">Experiencia</label>
                  <textarea
                    id="experiencia"
                    name="experiencia"
                    value={formData.experiencia}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="foto">Foto</label>
                  <input
                    type="file"
                    id="foto"
                    accept="image/*"
                    onChange={handleFotoChange}
                  />
                  {fotoPreview && (
                    <div className="image-preview">
                      <img src={fotoPreview} alt="Vista previa" />
                    </div>
                  )}
                </div>
              </>
            )}

            {tipoPerfil === 'parroco' && (
              <>
                <div className="form-group">
                  <label htmlFor="nombre_parroquia">Nombre de la Parroquia *</label>
                  <input
                    type="text"
                    id="nombre_parroquia"
                    name="nombre_parroquia"
                    value={formData.nombre_parroquia}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="parroco">Párroco *</label>
                    <input
                      type="text"
                      id="parroco"
                      name="parroco"
                      value={formData.parroco}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="vicario">Vicario</label>
                    <input
                      type="text"
                      id="vicario"
                      name="vicario"
                      value={formData.vicario}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="direccion">Dirección</label>
                  <input
                    type="text"
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="telefono">Teléfono</label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </>
            )}

            {tipoPerfil === 'voluntario' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="nombre_completo">Nombre Completo *</label>
                    <input
                      type="text"
                      id="nombre_completo"
                      name="nombre_completo"
                      value={formData.nombre_completo}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="documento">Documento *</label>
                    <input
                      type="text"
                      id="documento"
                      name="documento"
                      value={formData.documento}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
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
                  <div className="form-group">
                    <label htmlFor="telefono">Teléfono</label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="area_interes">Área de Interés</label>
                  <input
                    type="text"
                    id="area_interes"
                    name="area_interes"
                    value={formData.area_interes}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="habilidades">Habilidades</label>
                  <textarea
                    id="habilidades"
                    name="habilidades"
                    value={formData.habilidades}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="estado">Estado</label>
                  <select
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={createMutation.isLoading || updateMutation.isLoading}>
                {editingId ? 'Actualizar' : 'Crear'} {getTipoLabel()}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div className="profiles-list">
          <h2>
            <Icon /> {getTipoLabel()}s ({perfilesFiltrados.length})
          </h2>
          
          {isLoading ? (
            <div className="loading">Cargando {getTipoLabel().toLowerCase()}s...</div>
          ) : perfilesFiltrados.length === 0 ? (
            <div className="no-results">
              <p>No hay {getTipoLabel().toLowerCase()}s registrados.</p>
            </div>
          ) : (
            <div className="profiles-grid">
              {perfilesFiltrados.map((perfil) => {
                const nombre = tipoPerfil === 'autoridad' ? perfil.nombre :
                              tipoPerfil === 'misionero' ? perfil.nombre_completo :
                              tipoPerfil === 'parroco' ? perfil.parroco || perfil.nombre :
                              perfil.nombre_completo;
                const profileId = `${tipoPerfil}-${perfil.id}`;
                
                return (
                  <div key={perfil.id} className="profile-card">
                    {(perfil.foto_url || perfil.imagen_url) && (
                      <div className="profile-photo">
                        <img src={perfil.foto_url || perfil.imagen_url} alt={nombre} />
                      </div>
                    )}
                    <div className="profile-info">
                      <h3>{nombre}</h3>
                      {tipoPerfil === 'autoridad' && <p className="profile-role">{perfil.cargo}</p>}
                      {tipoPerfil === 'misionero' && <p className="profile-role">{perfil.tipo}</p>}
                      {tipoPerfil === 'parroco' && <p className="profile-role">Parroquia: {perfil.nombre}</p>}
                      {perfil.email && <p className="profile-contact">✉️ {perfil.email}</p>}
                      {perfil.telefono && <p className="profile-contact">📞 {perfil.telefono}</p>}
                    </div>
                    <div className="profile-actions">
                      <Link
                        to={`/qr/${profileId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-view"
                      >
                        <FaSearch /> Ver
                      </Link>
                      <button
                        onClick={() => handleEdit(perfil)}
                        className="btn btn-sm btn-edit"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(perfil.id)}
                        className="btn btn-sm btn-delete"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSearchProfile;





