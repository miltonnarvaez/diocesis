import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import AnimatedSection from '../components/AnimatedSection';
import SimpleCalendar from '../components/SimpleCalendar';
import Breadcrumbs from '../components/Breadcrumbs';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaUser, 
  FaPhone, 
  FaFilter,
  FaList,
  FaCalendarCheck
} from 'react-icons/fa';
import './Agenda.css';

const Agenda = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' o 'list'
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterCategoria, setFilterCategoria] = useState('todas');

  // Obtener actividades del mes actual
  const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59);

  const { data: actividades = [], isLoading } = useQuery({
    queryKey: ['actividades', startOfMonth.toISOString(), endOfMonth.toISOString()],
    queryFn: async () => {
      const response = await api.get('/actividades/calendario/rango', {
        params: {
          inicio: startOfMonth.toISOString(),
          fin: endOfMonth.toISOString()
        }
      });
      return response.data;
    }
  });

  // Filtrar actividades
  const actividadesFiltradas = actividades.filter(actividad => {
    if (filterTipo !== 'todos' && actividad.tipo !== filterTipo) return false;
    if (filterCategoria !== 'todas' && actividad.categoria !== filterCategoria) return false;
    return true;
  });

  // Obtener actividades del día seleccionado
  const actividadesDelDia = actividadesFiltradas.filter(actividad => {
    const fechaActividad = new Date(actividad.fecha_inicio);
    return fechaActividad.toDateString() === selectedDate.toDateString();
  });

  // Obtener fechas con actividades para marcar en el calendario
  const fechasConActividades = new Set(
    actividadesFiltradas.map(actividad => {
      const fecha = new Date(actividad.fecha_inicio);
      return fecha.toDateString();
    })
  );

  // Tipos de actividades
  const tipos = [
    { value: 'todos', label: 'Todos los tipos' },
    { value: 'misa', label: 'Misas' },
    { value: 'evento', label: 'Eventos' },
    { value: 'reunion', label: 'Reuniones' },
    { value: 'formacion', label: 'Formación' },
    { value: 'general', label: 'General' },
    { value: 'otro', label: 'Otro' }
  ];

  // Categorías
  const categorias = [
    { value: 'todas', label: 'Todas las categorías' },
    { value: 'liturgia', label: 'Liturgia' },
    { value: 'pastoral', label: 'Pastoral' },
    { value: 'formacion', label: 'Formación' },
    { value: 'caridad', label: 'Caridad' },
    { value: 'otro', label: 'Otro' }
  ];

  // Formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Formatear hora
  const formatearHora = (fecha) => {
    return new Date(fecha).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener color según tipo
  const getColorByTipo = (tipo) => {
    const colores = {
      misa: '#D4AF37',
      evento: '#4A90E2',
      reunion: '#2E5C8A',
      formacion: '#ffc107',
      general: '#6c757d',
      otro: '#dc3545'
    };
    return colores[tipo] || '#4A90E2';
  };

  return (
    <div className="agenda-page">
      <Breadcrumbs />
      <AnimatedSection className="section agenda-hero" animationType="fadeInUp">
        <div className="container">
          <h1 className="page-title">Agenda Diocesana</h1>
          <p className="page-subtitle">
            Consulta las actividades y eventos de nuestra diócesis
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection className="section agenda-filters" animationType="fadeInUp">
        <div className="container">
          <div className="agenda-controls">
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                onClick={() => setViewMode('calendar')}
              >
                <FaCalendarAlt /> Calendario
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <FaList /> Lista
              </button>
            </div>

            <div className="filters">
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="filter-select"
              >
                {tipos.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>

              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="filter-select"
              >
                {categorias.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {viewMode === 'calendar' ? (
        <AnimatedSection className="section agenda-calendar-section" animationType="fadeInUp">
          <div className="container">
            <div className="agenda-layout">
              <div className="calendar-container">
                <SimpleCalendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  locale="es"
                  tileClassName={({ date }) => {
                    return fechasConActividades.has(date.toDateString())
                      ? 'has-activities'
                      : null;
                  }}
                  tileContent={({ date }) => {
                    const actividadesDelDia = actividadesFiltradas.filter(actividad => {
                      const fechaActividad = new Date(actividad.fecha_inicio);
                      return fechaActividad.toDateString() === date.toDateString();
                    });
                    return actividadesDelDia.length > 0 ? (
                      <div className="calendar-day-indicator">
                        <span className="activity-count">{actividadesDelDia.length}</span>
                      </div>
                    ) : null;
                  }}
                />
              </div>

              <div className="activities-sidebar">
                <h2 className="sidebar-title">
                  <FaCalendarCheck /> Actividades del {selectedDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}
                </h2>
                {isLoading ? (
                  <div className="loading">Cargando actividades...</div>
                ) : actividadesDelDia.length === 0 ? (
                  <div className="no-activities">
                    <p>No hay actividades programadas para este día.</p>
                  </div>
                ) : (
                  <div className="activities-list">
                    {actividadesDelDia.map(actividad => (
                      <div
                        key={actividad.id}
                        className="activity-card"
                        style={{ borderLeftColor: actividad.color || getColorByTipo(actividad.tipo) }}
                      >
                        {actividad.destacada && (
                          <span className="activity-badge">Destacada</span>
                        )}
                        <h3 className="activity-title">{actividad.titulo}</h3>
                        {actividad.descripcion && (
                          <p className="activity-description">{actividad.descripcion}</p>
                        )}
                        <div className="activity-details">
                          <div className="activity-detail">
                            <FaClock /> {formatearHora(actividad.fecha_inicio)}
                            {actividad.fecha_fin && ` - ${formatearHora(actividad.fecha_fin)}`}
                          </div>
                          {actividad.lugar && (
                            <div className="activity-detail">
                              <FaMapMarkerAlt /> {actividad.lugar}
                            </div>
                          )}
                          {actividad.responsable && (
                            <div className="activity-detail">
                              <FaUser /> {actividad.responsable}
                            </div>
                          )}
                          {actividad.contacto && (
                            <div className="activity-detail">
                              <FaPhone /> {actividad.contacto}
                            </div>
                          )}
                        </div>
                        <div className="activity-meta">
                          <span className="activity-type" style={{ backgroundColor: actividad.color || getColorByTipo(actividad.tipo) }}>
                            {tipos.find(t => t.value === actividad.tipo)?.label || actividad.tipo}
                          </span>
                          {actividad.categoria && (
                            <span className="activity-category">{actividad.categoria}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </AnimatedSection>
      ) : (
        <AnimatedSection className="section agenda-list-section" animationType="fadeInUp">
          <div className="container">
            <div className="activities-grid">
              {isLoading ? (
                <div className="loading">Cargando actividades...</div>
              ) : actividadesFiltradas.length === 0 ? (
                <div className="no-activities">
                  <p>No hay actividades disponibles con los filtros seleccionados.</p>
                </div>
              ) : (
                actividadesFiltradas.map(actividad => (
                  <div
                    key={actividad.id}
                    className="activity-card-large"
                    style={{ borderTopColor: actividad.color || getColorByTipo(actividad.tipo) }}
                  >
                    {actividad.destacada && (
                      <span className="activity-badge">Destacada</span>
                    )}
                    {actividad.imagen_url && (
                      <div className="activity-image">
                        <img src={actividad.imagen_url} alt={actividad.titulo} />
                      </div>
                    )}
                    <div className="activity-content">
                      <h3 className="activity-title">{actividad.titulo}</h3>
                      {actividad.descripcion && (
                        <p className="activity-description">{actividad.descripcion}</p>
                      )}
                      <div className="activity-details">
                        <div className="activity-detail">
                          <FaCalendarAlt /> {formatearFecha(actividad.fecha_inicio)}
                        </div>
                        <div className="activity-detail">
                          <FaClock /> {formatearHora(actividad.fecha_inicio)}
                          {actividad.fecha_fin && ` - ${formatearHora(actividad.fecha_fin)}`}
                        </div>
                        {actividad.lugar && (
                          <div className="activity-detail">
                            <FaMapMarkerAlt /> {actividad.lugar}
                          </div>
                        )}
                        {actividad.responsable && (
                          <div className="activity-detail">
                            <FaUser /> {actividad.responsable}
                          </div>
                        )}
                        {actividad.contacto && (
                          <div className="activity-detail">
                            <FaPhone /> {actividad.contacto}
                          </div>
                        )}
                      </div>
                      <div className="activity-meta">
                        <span className="activity-type" style={{ backgroundColor: actividad.color || getColorByTipo(actividad.tipo) }}>
                          {tipos.find(t => t.value === actividad.tipo)?.label || actividad.tipo}
                        </span>
                        {actividad.categoria && (
                          <span className="activity-category">{actividad.categoria}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </AnimatedSection>
      )}
    </div>
  );
};

export default Agenda;

