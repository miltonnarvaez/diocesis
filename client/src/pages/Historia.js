import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { getFileUrl } from '../utils/fileUtils';
import AnimatedSection from '../components/AnimatedSection';
import Breadcrumbs from '../components/Breadcrumbs';
import { FaCalendarAlt, FaFilter, FaChevronLeft, FaChevronRight, FaExpand } from 'react-icons/fa';
import './Historia.css';
import '../styles/force-center.css';
import '../styles/EMERGENCY-CENTER-FIX.css';

const Historia = () => {
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroAño, setFiltroAño] = useState('todos');
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [indiceActual, setIndiceActual] = useState(0);
  const [hoveredEvento, setHoveredEvento] = useState(null);
  const timelineRef = useRef(null);
  const [visibleItems, setVisibleItems] = useState(new Set());

  const { data: eventos = [], isLoading } = useQuery({
    queryKey: ['historia', filtroCategoria],
    queryFn: async () => {
      const response = await api.get('/historia');
      return response.data;
    }
  });

  const categorias = [
    { id: 'todas', nombre: 'Todas', icono: FaFilter },
    { id: 'fundacion', nombre: 'Fundación', icono: FaCalendarAlt },
    { id: 'hitos', nombre: 'Hitos Históricos', icono: FaCalendarAlt },
    { id: 'autoridades_historicas', nombre: 'Autoridades Históricas', icono: FaCalendarAlt },
    { id: 'reformas', nombre: 'Reformas', icono: FaCalendarAlt },
    { id: 'logros', nombre: 'Logros', icono: FaCalendarAlt },
    { id: 'otros', nombre: 'Otros', icono: FaCalendarAlt }
  ];

  // Obtener años únicos de los eventos
  const añosDisponibles = [...new Set(
    eventos
      .map(e => {
        const fecha = e.fecha_evento ? new Date(e.fecha_evento) : null;
        return fecha ? fecha.getFullYear() : null;
      })
      .filter(año => año !== null)
  )].sort((a, b) => b - a);

  const eventosFiltrados = eventos.filter(e => {
    const matchCategoria = filtroCategoria === 'todas' || e.categoria === filtroCategoria;
    let matchAño = filtroAño === 'todos';
    if (!matchAño) {
      const fecha = e.fecha_evento ? new Date(e.fecha_evento) : null;
      const año = fecha ? fecha.getFullYear() : null;
      matchAño = año && año.toString() === filtroAño;
    }
    return matchCategoria && matchAño;
  });

  // Ordenar eventos por fecha
  const eventosOrdenados = [...eventosFiltrados].sort((a, b) => {
    const fechaA = a.fecha_evento ? new Date(a.fecha_evento) : new Date(0);
    const fechaB = b.fecha_evento ? new Date(b.fecha_evento) : new Date(0);
    return fechaA - fechaB;
  });

  // Intersection Observer para animaciones
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleItems(prev => new Set([...prev, entry.target.dataset.index]));
          }
        });
      },
      { threshold: 0.1 }
    );

    const items = timelineRef.current?.querySelectorAll('.timeline-item-interactive');
    items?.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [eventosOrdenados]);

  const abrirModal = (evento, indice) => {
    setEventoSeleccionado(evento);
    setIndiceActual(indice);
  };

  const cerrarModal = () => {
    setEventoSeleccionado(null);
  };

  const navegarEvento = (direccion) => {
    const nuevoIndice = direccion === 'next' 
      ? (indiceActual + 1) % eventosOrdenados.length
      : (indiceActual - 1 + eventosOrdenados.length) % eventosOrdenados.length;
    setIndiceActual(nuevoIndice);
    setEventoSeleccionado(eventosOrdenados[nuevoIndice]);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!eventoSeleccionado) return;
      if (e.key === 'ArrowRight') navegarEvento('next');
      if (e.key === 'ArrowLeft') navegarEvento('prev');
      if (e.key === 'Escape') cerrarModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [eventoSeleccionado, indiceActual]);

  if (isLoading) {
    return <div className="loading">Cargando historia...</div>;
  }

  return (
    <div className="historia-page">
      <Breadcrumbs />
      <AnimatedSection className="section historia-hero" animationType="fadeIn">
        <div className="container">
          <h1 className="page-title">Nuestra historia de salvación</h1>
          <p className="page-subtitle">
            La Diócesis de Ipiales se establece en respuesta a la necesidad de fortalecer la presencia pastoral 
            en la región de Nariño, Colombia. El creciente fervor religioso, impulsado por la coronación de 
            Nuestra Señora de Las Lajas en 1952 y su proclamación como Basílica Menor en 1960, evidenció la 
            urgencia de una estructura eclesiástica más robusta para atender a la feligresía.
          </p>
        </div>
      </AnimatedSection>

      {/* Contenido Histórico Principal */}
      <AnimatedSection className="section historia-contenido" animationType="fadeInUp">
        <div className="container">
          <div className="historia-texto-principal">
            <div className="historia-seccion">
              <h2>Creación y desafíos</h2>
              <p>
                En 1960, el Nuncio Apostólico José Paupini sembró la semilla de la idea al proponer la creación 
                de la Diócesis de Ipiales. Sin embargo, la concreción de este proyecto tomaría una década. Durante 
                este tiempo, figuras como el ilustre canónigo Luis M. Rodríguez y el P. Carlos Alberto Vélez abogaron 
                incansablemente por la creación de la Diócesis, enfatizando que el crecimiento demográfico, la presencia 
                del comunismo y la migración ecuatoriana demandaban una atención pastoral más cercana.
              </p>
              <p>
                El papel del P. Vélez fue fundamental, y su propuesta encontró un fuerte eco en la comunidad durante 
                la visita del Nuncio en 1964. Monseñor Mejía, designado por el Nuncio para abordar los asuntos relacionados 
                con la nueva Diócesis, se dedicó a recopilar información detallada sobre la región, incluyendo datos financieros, 
                límites geográficos y la estructura religiosa.
              </p>
            </div>

            <div className="historia-seccion">
              <h2>Un informe detallado y la concreción del sueño</h2>
              <p>
                En 1964, Monseñor Mejía presentó un informe exhaustivo que incluía datos demográficos, recursos económicos 
                y la estructura religiosa de la región. El informe destacaba la presencia de diversas comunidades religiosas 
                y la imperiosa necesidad de un obispo para atender a la creciente población. Finalmente, el 24 de septiembre 
                de 1964, el Papa Pablo VI oficializó la creación de la Diócesis de Ipiales, marcando un hito en la historia 
                pastoral de Nariño. La nueva Diócesis se abría paso para brindar un acompañamiento espiritual más cercano y 
                efectivo a su feligresía.
              </p>
            </div>

            <div className="historia-seccion">
              <h2>Límites y Estructura de la Diócesis de Ipiales</h2>
              <p>La Diócesis de Ipiales quedó delimitada de la siguiente manera:</p>
              <ul className="historia-lista-limites">
                <li><strong>Al norte:</strong> Limita con la Diócesis de Pasto, utilizando la cordillera oriental, el río Angasmayo, el río Guáitara y el río Patía como linderos naturales.</li>
                <li><strong>Al sur:</strong> Su frontera se extiende hasta la República del Ecuador, desde la quebrada cercana a Mayasquer hasta el origen de dicha quebrada, siguiendo una serie de puntos geográficos hasta la desembocadura del río Chingal o Chusquer.</li>
                <li><strong>Al oriente:</strong> Limita con el Vicariato Apostólico del Caquetá, desde el cerro Pax hasta el origen del río Angasmayo.</li>
                <li><strong>Al occidente:</strong> Se encuentra el Vicariato Apostólico de Tumaco, con la línea que separa los Distritos de Ricaurte y Mallama como frontera.</li>
              </ul>
              <p>
                Para consolidar su estructura, el 6 de octubre de 1964 se constituyó una nueva junta pro-Diócesis de Ipiales, 
                integrada por representantes de las vicarías foráneas de Túquerres, Pupiales, Puerres y Cumbal. El Pbro. 
                Gonzalo Portilla, vicario foráneo de San Pedro Mártir de Ipiales, asumió la presidencia, mientras que el 
                Pbro. Humberto Ortega, capellán del Colegio Champagnat de Ipiales, fue nombrado secretario.
              </p>
            </div>

            <div className="historia-seccion">
              <h2>Un legado de fe y servicio</h2>
              <p>
                Desde su creación, la Diócesis de Ipiales ha desempeñado un papel fundamental en la vida espiritual y social 
                de la región. A través de sus obispos, sacerdotes, diáconos, religiosos y laicos comprometidos, la Diócesis 
                ha trabajado incansablemente para llevar el mensaje del Evangelio a todos los rincones de su territorio, 
                promoviendo valores como la solidaridad, la justicia y la paz.
              </p>
              <p>
                La Diócesis de Ipiales es un ejemplo de la pujanza de la fe católica en Colombia, una comunidad vibrante 
                que se renueva constantemente en su compromiso con el amor de Dios y el servicio al prójimo. Su historia, 
                marcada por el esfuerzo y la dedicación de tantos hombres y mujeres de fe, constituye un legado invaluable 
                para las presentes y futuras generaciones.
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Filtros */}
      <AnimatedSection className="section filtros-section" animationType="fadeInUp">
        <div className="container">
          <div className="historia-filtros">
            <h3 className="filtros-title">Filtrar por categoría:</h3>
            <div className="filtros-buttons">
              {categorias.map(cat => (
                <button
                  key={cat.id}
                  className={`filtro-btn ${filtroCategoria === cat.id ? 'active' : ''}`}
                  onClick={() => setFiltroCategoria(cat.id)}
                >
                  <span className="filtro-icon">{React.createElement(cat.icono)}</span>
                  {cat.nombre}
                </button>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Timeline Interactivo */}
      <AnimatedSection className="section timeline-section" animationType="fadeIn">
        <div className="container">
          {eventosOrdenados.length === 0 ? (
            <div className="no-eventos">
              <p>No hay eventos históricos registrados en esta categoría.</p>
            </div>
          ) : (
            <div className="timeline-interactive" ref={timelineRef}>
              <div className="timeline-line"></div>
              {eventosOrdenados.map((evento, index) => {
                const isVisible = visibleItems.has(index.toString());
                const fecha = evento.fecha_evento 
                  ? new Date(evento.fecha_evento)
                  : null;
                const año = fecha ? fecha.getFullYear() : 'Sin fecha';
                
                return (
                  <div
                    key={evento.id}
                    className={`timeline-item-interactive ${index % 2 === 0 ? 'left' : 'right'} ${isVisible ? 'visible' : ''}`}
                    data-index={index}
                  >
                    <div className="timeline-marker-interactive">
                      <div className="timeline-dot"></div>
                      <div className="timeline-year">{año}</div>
                    </div>
                    <div 
                      className="timeline-content-interactive"
                      onMouseEnter={() => setHoveredEvento(evento.id)}
                      onMouseLeave={() => setHoveredEvento(null)}
                    >
                      <div className="timeline-card">
                        {evento.imagen_url && (
                          <div 
                            className="timeline-image-wrapper"
                            onClick={() => abrirModal(evento, index)}
                          >
                            <img 
                              src={getFileUrl(evento.imagen_url)} 
                              alt={evento.titulo}
                              className="timeline-image"
                            />
                            <div className="timeline-image-overlay">
                              <FaExpand />
                              <span>Ver más</span>
                            </div>
                          </div>
                        )}
                        <div className="timeline-card-content">
                          <div className="timeline-header">
                            <span className="timeline-categoria-badge">
                              {categorias.find(c => c.id === evento.categoria)?.nombre || evento.categoria}
                            </span>
                            {fecha && (
                              <span className="timeline-fecha">
                                {fecha.toLocaleDateString('es-CO', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            )}
                          </div>
                          <h3 className="timeline-titulo">{evento.titulo}</h3>
                          <div 
                            className="timeline-contenido"
                            dangerouslySetInnerHTML={{ 
                              __html: evento.contenido?.substring(0, 300) + (evento.contenido?.length > 300 ? '...' : '')
                            }}
                          />
                          
                          {/* Tooltip de hover con más detalles */}
                          {hoveredEvento === evento.id && (
                            <div className="timeline-hover-tooltip">
                              <div className="tooltip-content">
                                <h4>{evento.titulo}</h4>
                                <p className="tooltip-categoria">
                                  {categorias.find(c => c.id === evento.categoria)?.nombre || evento.categoria}
                                </p>
                                {evento.descripcion && (
                                  <p className="tooltip-descripcion">
                                    {evento.descripcion.length > 200 
                                      ? evento.descripcion.substring(0, 200) + '...'
                                      : evento.descripcion}
                                  </p>
                                )}
                                {fecha && (
                                  <p className="tooltip-fecha">
                                    <FaCalendarAlt /> {fecha.toLocaleDateString('es-CO', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </p>
                                )}
                                <button 
                                  className="tooltip-btn-ver-mas"
                                  onClick={() => abrirModal(evento, index)}
                                >
                                  Ver detalles completos →
                                </button>
                              </div>
                            </div>
                          )}
                          
                          <button 
                            className="btn-timeline-ver-mas"
                            onClick={() => abrirModal(evento, index)}
                          >
                            Ver detalles completos
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </AnimatedSection>

      {/* Modal de Detalle */}
      {eventoSeleccionado && (
        <div className="historia-modal" onClick={cerrarModal}>
          <div className="historia-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="historia-modal-close" onClick={cerrarModal}>
              ×
            </button>
            {eventosOrdenados.length > 1 && (
              <>
                <button 
                  className="historia-modal-nav historia-modal-prev"
                  onClick={() => navegarEvento('prev')}
                  aria-label="Evento anterior"
                >
                  <FaChevronLeft />
                </button>
                <button 
                  className="historia-modal-nav historia-modal-next"
                  onClick={() => navegarEvento('next')}
                  aria-label="Siguiente evento"
                >
                  <FaChevronRight />
                </button>
              </>
            )}
            <div className="historia-modal-body">
              {eventoSeleccionado.imagen_url && (
                <div className="historia-modal-image">
                  <img 
                    src={getFileUrl(eventoSeleccionado.imagen_url)} 
                    alt={eventoSeleccionado.titulo}
                  />
                </div>
              )}
              <div className="historia-modal-info">
                <div className="historia-modal-header">
                  <span className="historia-modal-categoria">
                    {categorias.find(c => c.id === eventoSeleccionado.categoria)?.nombre || eventoSeleccionado.categoria}
                  </span>
                  {eventoSeleccionado.fecha_evento && (
                    <span className="historia-modal-fecha">
                      {new Date(eventoSeleccionado.fecha_evento).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  )}
                </div>
                <h2 className="historia-modal-titulo">{eventoSeleccionado.titulo}</h2>
                <div 
                  className="historia-modal-contenido"
                  dangerouslySetInnerHTML={{ __html: eventoSeleccionado.contenido }}
                />
              </div>
            </div>
            {eventosOrdenados.length > 1 && (
              <div className="historia-modal-counter">
                {indiceActual + 1} / {eventosOrdenados.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Historia;



