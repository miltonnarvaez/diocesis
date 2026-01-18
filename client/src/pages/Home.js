import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import NoticiaImage from '../components/NoticiaImage';
import { getImageByIndex } from '../utils/exampleImages';
import TexturePattern from '../components/TexturePattern';
import { OrganizationSchema, WebSiteSchema } from '../components/SchemaMarkup';
import AnimatedSection from '../components/AnimatedSection';
import HeroSlider from '../components/HeroSlider';
import Escudo from '../components/Escudo';
import {
  FaCalendarAlt, FaHandshake, FaFileSignature, FaDollarSign, FaChartLine,
  FaShieldAlt, FaFileAlt, FaBook, FaClipboardCheck, FaBalanceScale, FaSitemap,
  FaGavel, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaFileContract,
  FaClipboardList, FaProjectDiagram, FaFemale, FaUserClock, FaGraduationCap,
  FaWheelchair, FaGlobeAmericas, FaBriefcase, FaChevronDown, FaUsers, FaNewspaper,
  FaComments, FaFileAlt as FaDocument, FaBuilding, FaCity, FaShoppingCart,
  FaBox, FaArchive, FaLaptopCode, FaDigitalTachograph, FaFlag, FaLandmark,
  FaChurch, FaPray, FaCross, FaHeart, FaHandHoldingHeart, FaBible, FaDove,
  FaChild, FaHome, FaPeopleCarry, FaUserFriends, FaScroll, FaUserTie,
  FaMicrophone, FaWhatsapp, FaArrowRight
} from 'react-icons/fa';
import CountUp from '../components/CountUp';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import './Home.css';
import '../styles/force-center.css';
import '../styles/EMERGENCY-CENTER-FIX.css';
import '../styles/ULTIMATE-CENTER-FIX.css';
import '../styles/FIX-ACCESO-RAPIDO.css';
import '../styles/FIX-CONTACTO.css';
import '../styles/FIX-NOTICIAS-HOME.css';
import '../styles/FIX-GRUPOS-INTERES.css';
import '../styles/FIX-GRUPOS-GRID-LEFT.css';
import '../styles/FIX-UBICACION.css';
import '../styles/FIX-ESTADISTICAS-SECTION.css';
import '../styles/FIX-GACETA.css';
import '../styles/FIX-ENLACES-INTERES.css';
import '../styles/FIX-ENLACES-GRID-SCROLL.css';
import '../styles/FIX-SLIDER-HERO.css';
import '../styles/SLIDER-CACHE-BUSTER.css';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Home = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: noticias = [] } = useQuery({
    queryKey: ['noticias'],
    queryFn: async () => {
      try {
        const response = await api.get('/noticias');
        return response.data;
      } catch (error) {
        console.error('Error obteniendo noticias:', error);
        return [];
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const { data: convocatorias = [] } = useQuery({
    queryKey: ['convocatorias'],
    queryFn: async () => {
      try {
        const response = await api.get('/convocatorias');
        return response.data;
      } catch (error) {
        console.error('Error obteniendo convocatorias:', error);
        return [];
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const destacadas = convocatorias.filter(c => c.destacada).slice(0, 3);
  const ultimasNoticias = noticias.slice(0, 3);

  const scrollToNext = () => {
    const nextSection = document.querySelector('.anuncios, .acceso-rapido');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const { data: config = {} } = useQuery({
    queryKey: ['configuracion'],
    queryFn: async () => {
      try {
        const response = await api.get('/configuracion');
        return response.data;
      } catch (error) {
        console.error('Error obteniendo configuración:', error);
        return {};
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000,
  });

  const { data: sesiones = [] } = useQuery({
    queryKey: ['sesiones'],
    queryFn: async () => {
      try {
        const response = await api.get('/sesiones');
        return response.data;
      } catch (error) {
        console.error('Error obteniendo sesiones:', error);
        return [];
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const { data: pqrsdStats = null } = useQuery({
    queryKey: ['pqrsd-estadisticas'],
    queryFn: async () => {
      try {
        const response = await api.get('/pqrsd/estadisticas');
        return response.data;
      } catch (error) {
        console.error('Error obteniendo estadísticas PQRSD:', error);
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const { data: documentos = [] } = useQuery({
    queryKey: ['gaceta'],
    queryFn: async () => {
      try {
        const response = await api.get('/gaceta');
        return response.data;
      } catch (error) {
        console.error('Error obteniendo documentos:', error);
        return [];
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // Calcular estadísticas
  const stats = {
    sesiones: sesiones.length,
    pqrsdResueltas: pqrsdStats?.estadisticas?.resuelto || 0,
    documentos: documentos.length,
    noticias: noticias.length
  };

  // Función para obtener datos por mes (últimos 6 meses)
  const obtenerDatosPorMes = (items, fechaField = 'creado_en') => {
    const meses = [];
    const ahora = new Date();
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const mesNombre = fecha.toLocaleDateString('es-CO', { month: 'short' });
      const año = fecha.getFullYear();
      const mesNum = fecha.getMonth();
      
      const count = items.filter(item => {
        const itemFecha = new Date(item[fechaField] || item.creado_en || item.fecha_publicacion);
        return itemFecha.getFullYear() === año && itemFecha.getMonth() === mesNum;
      }).length;
      
      meses.push({ mes: mesNombre, año, count });
    }
    return meses;
  };

  // Datos mensuales
  const datosMensuales = {
    noticias: obtenerDatosPorMes(noticias, 'fecha_publicacion'),
    sesiones: obtenerDatosPorMes(sesiones, 'fecha_sesion'),
    documentos: obtenerDatosPorMes(documentos, 'fecha_publicacion'),
    pqrsd: (() => {
      if (!pqrsdStats?.datosMensuales) return [];
      const ahora = new Date();
      const meses = [];
      for (let i = 5; i >= 0; i--) {
        const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
        const mesNombre = fecha.toLocaleDateString('es-CO', { month: 'short' });
        const año = fecha.getFullYear();
        const mesNum = String(fecha.getMonth() + 1).padStart(2, '0');
        const mesKey = `${año}-${mesNum}`;
        const item = pqrsdStats.datosMensuales.find(d => d.mes === mesKey);
        meses.push({ mes: mesNombre, año, count: item ? item.count : 0 });
      }
      return meses;
    })()
  };

  // Gráfico de línea - Comparativa mensual
  const chartDataMensual = {
    labels: datosMensuales.noticias.map(d => d.mes),
    datasets: [
      {
        label: 'Noticias',
        data: datosMensuales.noticias.map(d => d.count),
        borderColor: 'rgba(40, 167, 69, 1)',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Sesiones',
        data: datosMensuales.sesiones.map(d => d.count),
        borderColor: 'rgba(0, 123, 255, 1)',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Documentos',
        data: datosMensuales.documentos.map(d => d.count),
        borderColor: 'rgba(255, 193, 7, 1)',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'PQRSD',
        data: datosMensuales.pqrsd.map(d => d.count),
        borderColor: 'rgba(220, 53, 69, 1)',
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Datos para gráficos
  const pqrsdPorEstado = {
    resuelto: pqrsdStats?.estadisticas?.resuelto || 0,
    enProceso: pqrsdStats?.estadisticas?.en_proceso || 0,
    pendiente: pqrsdStats?.estadisticas?.pendiente || 0,
    cerrado: pqrsdStats?.estadisticas?.cerrado || 0
  };

  // Gráfico de barras - PQRSD por estado
  const chartDataPQRSD = {
    labels: ['Resueltas', 'En Proceso', 'Pendientes', 'Cerradas'],
    datasets: [{
      label: 'PQRSD por Estado',
      data: [
        pqrsdPorEstado.resuelto,
        pqrsdPorEstado.enProceso,
        pqrsdPorEstado.pendiente,
        pqrsdPorEstado.cerrado
      ],
      backgroundColor: [
        'rgba(40, 167, 69, 0.8)',
        'rgba(255, 193, 7, 0.8)',
        'rgba(220, 53, 69, 0.8)',
        'rgba(108, 117, 125, 0.8)'
      ],
      borderColor: [
        'rgba(40, 167, 69, 1)',
        'rgba(255, 193, 7, 1)',
        'rgba(220, 53, 69, 1)',
        'rgba(108, 117, 125, 1)'
      ],
      borderWidth: 2
    }]
  };

  // Gráfico de dona - Distribución general
  const chartDataDona = {
    labels: ['Sesiones', 'PQRSD Resueltas', 'Documentos', 'Noticias'],
    datasets: [{
      data: [stats.sesiones, stats.pqrsdResueltas, stats.documentos, stats.noticias],
      backgroundColor: [
        'rgba(40, 167, 69, 0.8)',
        'rgba(0, 123, 255, 0.8)',
        'rgba(255, 193, 7, 0.8)',
        'rgba(220, 53, 69, 0.8)'
      ],
      borderColor: [
        'rgba(40, 167, 69, 1)',
        'rgba(0, 123, 255, 1)',
        'rgba(255, 193, 7, 1)',
        'rgba(220, 53, 69, 1)'
      ],
      borderWidth: 2
    }]
  };

  // Opciones de gráficos
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 12
        }
      }
    }
  };

  // Opciones para gráfico de línea
  const chartOptionsLine = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="home">
      <OrganizationSchema 
        name="Diócesis de Ipiales"
        url={window.location.origin}
        email="diocesisdeipiales@gmail.com"
        telephone="+57 315 466 9018"
      />
      <WebSiteSchema 
        name="Diócesis de Ipiales"
        url={window.location.origin}
        searchUrl={`${window.location.origin}/busqueda?q={search_term_string}`}
      />
      {/* Hero Slider */}
      <HeroSlider />

      {/* Búsqueda y Acceso Rápido */}
      <AnimatedSection className="section acceso-rapido" animationType="slideUpFade">
        <div className="container">
          <h2 className="section-title">{t('home.buscar')}</h2>
          <div className="acceso-grid">
            <Link to="/sacramentos" className="acceso-item">
              <span className="acceso-icon"><FaCross /></span>
              <h3>Sacramentos</h3>
            </Link>
            <Link to="/parroquias" className="acceso-item">
              <span className="acceso-icon"><FaChurch /></span>
              <h3>Parroquias</h3>
            </Link>
            <Link to="/agenda" className="acceso-item">
              <span className="acceso-icon"><FaCalendarAlt /></span>
              <h3>Horarios de Misas</h3>
            </Link>
            <Link to="/formacion" className="acceso-item">
              <span className="acceso-icon"><FaBook /></span>
              <h3>Formación</h3>
            </Link>
            <Link to="/pastoral" className="acceso-item">
              <span className="acceso-icon"><FaUsers /></span>
              <h3>Pastoral</h3>
            </Link>
            <Link to="/caridad" className="acceso-item">
              <span className="acceso-icon"><FaHandHoldingHeart /></span>
              <h3>Caridad</h3>
            </Link>
            <Link to="/noticias" className="acceso-item">
              <span className="acceso-icon"><FaNewspaper /></span>
              <h3>Noticias</h3>
            </Link>
            <Link to="/pqrsd" className="acceso-item">
              <span className="acceso-icon"><FaFileAlt /></span>
              <h3>PQRSD</h3>
            </Link>
            <Link to="/acerca" className="acceso-item">
              <span className="acceso-icon"><FaLandmark /></span>
              <h3>Nuestra Diócesis</h3>
            </Link>
            <Link to="/transparencia" className="acceso-item">
              <span className="acceso-icon"><FaClipboardCheck /></span>
              <h3>Transparencia</h3>
            </Link>
            <Link to="/contacto" className="acceso-item">
              <span className="acceso-icon"><FaEnvelope /></span>
              <h3>Contacto</h3>
            </Link>
            <Link to="/galeria" className="acceso-item">
              <span className="acceso-icon"><FaArchive /></span>
              <h3>Galería</h3>
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* Diezmo Diocesano */}
      <AnimatedSection className="section diezmo-section" animationType="fadeInUp">
        <div className="container">
          <div className="diezmo-card">
            <div className="diezmo-content">
              <h2 className="diezmo-title">DIEZMO DIOCESANO 2024</h2>
              <p className="diezmo-subtitle">Una bendición que se comparte</p>
              <Link to="/contacto" className="btn btn-diezmo">
                Haz tu aporte AQUÍ <FaArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* La Iglesia un lugar seguro */}
      <AnimatedSection className="section proteccion-section" animationType="fadeInUp">
        <div className="container">
          <div className="proteccion-card">
            <div className="proteccion-icon">
              <FaShieldAlt />
            </div>
            <div className="proteccion-content">
              <h2 className="proteccion-title">La IGLESIA un lugar seguro</h2>
              <p className="proteccion-text">Todos somos protectores de los menores y personas vulnerables</p>
              <Link to="/contacto" className="btn btn-proteccion">
                Más Información <FaArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Calendario de Eventos */}
      <AnimatedSection className="section calendario-section" animationType="fadeInUp">
        <div className="container">
          <h2 className="section-title">CALENDARIO DE EVENTOS</h2>
          <p className="section-subtitle">Conoce los eventos que día a día desde nuestra Diócesis realizamos</p>
          <div className="calendario-link">
            <Link to="/agenda" className="btn btn-calendario">
              <FaCalendarAlt /> Ver todos los eventos
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* Tres Minutos, Tres Palabras - Meditación Dominical */}
      <AnimatedSection className="section meditacion-section" animationType="fadeInUp">
        <div className="container">
          <h2 className="section-title">TRES MINUTOS, TRES PALABRAS</h2>
          <p className="meditacion-subtitle">Meditación Dominical de Monseñor - Obispo de Ipiales, Colombia</p>
          <div className="meditacion-cards">
            <div className="meditacion-card">
              <h3 className="meditacion-titulo">Feliz quien es de Dios</h3>
              <p className="meditacion-fecha">6.° DOMINGO DE TIEMPO ORDINARIO</p>
            </div>
            <div className="meditacion-card">
              <h3 className="meditacion-titulo">Confía en Dios</h3>
              <p className="meditacion-fecha">5.° DOMINGO DE TIEMPO ORDINARIO</p>
            </div>
            <div className="meditacion-card">
              <h3 className="meditacion-titulo">Que nuestra vida sea luz</h3>
              <p className="meditacion-fecha">FIESTA DE LA PRESENTACIÓN DEL SEÑOR</p>
            </div>
          </div>
          <Link to="/noticias" className="btn btn-secondary">
            Más meditaciones <FaArrowRight />
          </Link>
        </div>
      </AnimatedSection>

      {/* Apoya la Labor Evangelizadora */}
      <AnimatedSection className="section apoyo-section" animationType="fadeInUp">
        <div className="container">
          <div className="apoyo-card">
            <div className="apoyo-content">
              <h2 className="apoyo-title">APOYA LA LABOR EVANGELIZADORA DE NUESTRA IGLESIA PARTICULAR</h2>
              <p className="apoyo-text">Buscamos aportar desde nuestro quehacer pastoral a toda la comunidad</p>
              <p className="apoyo-cita">«Hay mayor alegría en dar que en recibir» Hch. 20, 35</p>
              <div className="apoyo-buttons">
                <Link to="/contacto" className="btn btn-apoyo">
                  Conoce nuestras obras <FaArrowRight />
                </Link>
                <Link to="/contacto" className="btn btn-apoyo-secondary">
                  Apoyar <FaHeart />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ¿Quieres ser Sacerdote? */}
      <AnimatedSection className="section vocacion-section" animationType="fadeInUp">
        <div className="container">
          <div className="vocacion-card">
            <div className="vocacion-content">
              <h2 className="vocacion-title">¿QUIERES SER SACERDOTE?</h2>
              <p className="vocacion-subtitle">"Maestro, ¿Dónde vives? VEN Y VERÁS"</p>
              <p className="vocacion-text">Si buscas orientación vocacional, puedes contactarnos haciendo clic en el siguiente enlace</p>
              <div className="vocacion-buttons">
                <Link to="/contacto" className="btn btn-vocacion">
                  Contactar <FaArrowRight />
                </Link>
                <p className="vocacion-cita">«Que ninguna vocación se pierda por falta de recursos»</p>
                <Link to="/contacto" className="btn btn-vocacion-secondary">
                  Ayudar <FaHandHoldingHeart />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* DABAR - Su palabra resuena */}
      <AnimatedSection className="section dabar-section" animationType="fadeInUp">
        <div className="container">
          <div className="dabar-card">
            <div className="dabar-content">
              <h2 className="dabar-title">DABAR</h2>
              <p className="dabar-subtitle">"Su palabra resuena" - Encuentro diario con el Evangelio</p>
              <p className="dabar-text">
                <strong>Dabar</strong> es una palabra Hebrea que significa <em>«Su palabra resuena»</em> y se utiliza en las sagradas escrituras solo cuando se refiere a la voz de Dios.
              </p>
              <Link to="/contacto" className="btn btn-dabar">
                <FaWhatsapp /> Únete a nuestro grupo de whatsapp para recibir la reflexión diaria
              </Link>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Anuncios Importantes */}
      {destacadas.length > 0 && (
        <AnimatedSection className="section anuncios" animationType="fadeInUp">
          <div className="container">
            <h2 className="section-title">{t('home.anuncios')}</h2>
            <div className="anuncios-grid">
              {destacadas.map((convocatoria, index) => (
                <div key={convocatoria.id} className="anuncio-card">
                  <NoticiaImage 
                    src={convocatoria.imagen_url || getImageByIndex(index, 'gobierno')} 
                    alt={convocatoria.titulo}
                    className="anuncio-card-image"
                  />
                  <div className="anuncio-content">
                    <h3>{convocatoria.titulo}</h3>
                    <p>{convocatoria.descripcion.substring(0, 150)}...</p>
                    <Link to={`/convocatorias/${convocatoria.id}`} className="btn">
                      Más Información →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* Contacto y Ubicación - Fusionados */}
      <AnimatedSection 
        id="contacto" 
        className="section contacto-ubicacion" 
        animationType="fadeInUp"
      >
        <div className="container">
          <h2 className="section-title">Contacto y Ubicación</h2>
          
          <div className="contacto-ubicacion-grid">
            {/* Columna izquierda: Info de contacto */}
            <div className="contacto-ubicacion-info">
              <div className="contacto-info-card">
                <div className="contacto-icon-wrapper">
                  <FaMapMarkerAlt className="contacto-icon" />
                </div>
                <div className="contacto-info-text">
                  <h3>Dirección</h3>
                  <p>Cra. 6 No. 7-01, Ipiales, Nariño</p>
                </div>
              </div>
              <div className="contacto-info-card">
                <div className="contacto-icon-wrapper">
                  <FaPhone className="contacto-icon" />
                </div>
                <div className="contacto-info-text">
                  <h3>Teléfono</h3>
                  <p>+57 315 466 9018</p>
                </div>
              </div>
              <div className="contacto-info-card">
                <div className="contacto-icon-wrapper">
                  <FaEnvelope className="contacto-icon" />
                </div>
                <div className="contacto-info-text">
                  <h3>Email</h3>
                  <p>diocesisdeipiales@gmail.com</p>
                </div>
              </div>
              <div className="contacto-info-card">
                <div className="contacto-icon-wrapper">
                  <FaClock className="contacto-icon" />
                </div>
                <div className="contacto-info-text">
                  <h3>Horarios</h3>
                  <p>Lun - Vie: 8:00 AM - 12:00 PM y 2:00 PM - 6:00 PM</p>
                </div>
              </div>
              
              {/* Botones de acción */}
              <div className="contacto-botones">
                <Link to="/pqrsd" className="btn btn-pqrs">
                  <FaFileAlt /> Enviar PQRS
                </Link>
                <Link to="/contacto" className="btn btn-contacto">
                  <FaEnvelope /> Enviar Mensaje
                </Link>
              </div>
              
              {/* Formulario PQRSD */}
              <div className="pqrsd-form-section">
                <h3 className="pqrsd-form-title">Tus peticiones, quejas, reclamos y sugerencias son muy importantes para nosotros.</h3>
                <p className="pqrsd-form-note">Los campos marcados con (*) son obligatorios</p>
                <Link to="/pqrsd" className="btn btn-pqrs-form">
                  Enviar PQRSD <FaArrowRight />
                </Link>
              </div>
            </div>
            
            {/* Columna derecha: Mapa */}
            <div className="contacto-ubicacion-mapa">
              <div className="mapa-container">
                <iframe
                  src="https://www.google.com/maps?q=Carrera+6+No.+7-01,+Ipiales,+Nariño,+Colombia&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación Diócesis de Ipiales"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Documentos Diocesanos */}
      <AnimatedSection className="section gaceta" animationType="scaleIn">
        <TexturePattern />
        <div className="container">
          <h2 className="section-title">Documentos Diocesanos</h2>
          <div className="gaceta-grid">
            <Link to="/repositorio?tipo=carta_pastoral" className="gaceta-item">
              <span className="gaceta-icon"><FaScroll /></span>
              <span className="gaceta-text">CARTAS PASTORALES</span>
            </Link>
            <Link to="/repositorio?tipo=comunicado" className="gaceta-item">
              <span className="gaceta-icon"><FaNewspaper /></span>
              <span className="gaceta-text">COMUNICADOS</span>
            </Link>
            <Link to="/repositorio?tipo=decreto" className="gaceta-item">
              <span className="gaceta-icon"><FaFileContract /></span>
              <span className="gaceta-text">DECRETOS</span>
            </Link>
            <Link to="/repositorio?tipo=circular" className="gaceta-item">
              <span className="gaceta-icon"><FaClipboardList /></span>
              <span className="gaceta-text">CIRCULARES</span>
            </Link>
            <Link to="/repositorio?tipo=directorio" className="gaceta-item">
              <span className="gaceta-icon"><FaBook /></span>
              <span className="gaceta-text">DIRECTORIO</span>
            </Link>
            <Link to="/repositorio?tipo=boletin" className="gaceta-item">
              <span className="gaceta-icon"><FaFileAlt /></span>
              <span className="gaceta-text">BOLETINES</span>
            </Link>
            <Link to="/repositorio" className="gaceta-item">
              <span className="gaceta-icon"><FaArchive /></span>
              <span className="gaceta-text">VER TODOS</span>
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* Noticias */}
      {ultimasNoticias.length > 0 && (
        <AnimatedSection className="section noticias-home" animationType="fadeInLeft">
          <div className="container">
            <h2 className="section-title">{t('home.noticias')}</h2>
            <div className="noticias-grid">
              {ultimasNoticias.map((noticia, index) => (
                <div key={noticia.id} className="noticia-card">
                  <NoticiaImage 
                    src={noticia.imagen_url || getImageByIndex(index, 'gobierno')} 
                    alt={noticia.titulo}
                    className="noticia-card-image"
                  />
                  <div className="noticia-content">
                    <span className="noticia-fecha">
                      {new Date(noticia.fecha_publicacion).toLocaleDateString('es-CO')}
                    </span>
                    <h3>{noticia.titulo}</h3>
                    <p>{noticia.resumen || noticia.contenido.substring(0, 150)}...</p>
                    <Link to={`/noticias/${noticia.id}`} className="btn">
                      Leer más →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center" style={{ marginTop: '2rem' }}>
              <Link to="/noticias" className="btn btn-secondary">
                Ver todas las noticias
              </Link>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* Convocatorias Destacadas */}
      {convocatorias.length > 0 && (
        <AnimatedSection className="section convocatorias-home" animationType="fadeInRight">
          <div className="container">
            <h2 className="section-title">Convocatorias</h2>
            <div className="convocatorias-grid">
              {convocatorias.slice(0, 6).map((convocatoria, index) => (
                <div key={convocatoria.id} className="convocatoria-card">
                  <NoticiaImage 
                    src={convocatoria.imagen_url || getImageByIndex(index, 'eventos')} 
                    alt={convocatoria.titulo}
                    className="convocatoria-card-image"
                  />
                  <div className="convocatoria-content">
                    <span className="convocatoria-fecha">
                      {new Date(convocatoria.fecha_inicio).toLocaleDateString('es-CO')} - {new Date(convocatoria.fecha_fin).toLocaleDateString('es-CO')}
                    </span>
                    <h3>{convocatoria.titulo}</h3>
                    <p>{convocatoria.descripcion.substring(0, 120)}...</p>
                    <Link to={`/convocatorias/${convocatoria.id}`} className="btn">
                      Ver más →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center" style={{ marginTop: '2rem' }}>
              <Link to="/convocatorias" className="btn btn-secondary">
                Ver todas las convocatorias
              </Link>
            </div>
          </div>
        </AnimatedSection>
      )}




      {/* Sección de Estadísticas Diocesanas - Estilo Pasto */}
      <AnimatedSection className="section estadisticas-diocesanas" animationType="fadeInUp">
        <div className="container">
          <h2 className="section-title">Nuestra Diócesis</h2>
          <div className="estadisticas-diocesanas-grid">
            <div className="estadistica-diocesana-card">
              <div className="estadistica-diocesana-numero">
                <CountUp end={4} duration={2000} />
              </div>
              <div className="estadistica-diocesana-separador"></div>
              <p className="estadistica-diocesana-label">Vicarías Foráneas</p>
            </div>
            <div className="estadistica-diocesana-card">
              <div className="estadistica-diocesana-numero">
                <CountUp end={stats.documentos || 0} duration={2000} />
              </div>
              <div className="estadistica-diocesana-separador"></div>
              <p className="estadistica-diocesana-label">Parroquias</p>
            </div>
            <div className="estadistica-diocesana-card">
              <div className="estadistica-diocesana-numero">
                <CountUp end={stats.noticias || 0} duration={2000} />
              </div>
              <div className="estadistica-diocesana-separador"></div>
              <p className="estadistica-diocesana-label">Centros de Evangelización</p>
            </div>
            <div className="estadistica-diocesana-card">
              <div className="estadistica-diocesana-numero">
                <CountUp end={stats.sesiones || 0} duration={2000} />
              </div>
              <div className="estadistica-diocesana-separador"></div>
              <p className="estadistica-diocesana-label">Comisiones de Pastoral</p>
            </div>
            <div className="estadistica-diocesana-card">
              <div className="estadistica-diocesana-numero">
                <CountUp end={stats.pqrsdResueltas || 0} duration={2000} />
              </div>
              <div className="estadistica-diocesana-separador"></div>
              <p className="estadistica-diocesana-label">Sacerdotes</p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Sección de Estadísticas - Antes del Footer */}
      <AnimatedSection className="section estadisticas-section" animationType="fadeInUp">
        <div className="container">
          <h2 className="section-title">Estadísticas de Gestión</h2>
          <p className="section-subtitle">Datos y métricas de nuestra gestión pastoral</p>
          
          {/* Tarjetas de estadísticas */}
          <div className="estadisticas-grid">
            <div className="estadistica-card">
              <div className="estadistica-icon">
                <FaCalendarAlt />
              </div>
              <div className="estadistica-content">
                <h3 className="estadistica-numero">
                  <CountUp end={stats.sesiones} duration={2000} />
                </h3>
                <p className="estadistica-label">Sesiones Realizadas</p>
              </div>
            </div>
            <div className="estadistica-card">
              <div className="estadistica-icon">
                <FaClipboardCheck />
              </div>
              <div className="estadistica-content">
                <h3 className="estadistica-numero estadistica-valor">
                  <CountUp end={stats.pqrsdResueltas} duration={2000} />
                </h3>
                <p className="estadistica-label">PQRSD Resueltas</p>
              </div>
            </div>
            <div className="estadistica-card">
              <div className="estadistica-icon">
                <FaDocument />
              </div>
              <div className="estadistica-content">
                <h3 className="estadistica-numero">
                  <CountUp end={stats.documentos} duration={2000} />
                </h3>
                <p className="estadistica-label">Documentos Publicados</p>
              </div>
            </div>
            <div className="estadistica-card">
              <div className="estadistica-icon">
                <FaNewspaper />
              </div>
              <div className="estadistica-content">
                <h3 className="estadistica-numero estadistica-valor">
                  <CountUp end={stats.noticias} duration={2000} />
                </h3>
                <p className="estadistica-label">Noticias Publicadas</p>
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="estadisticas-graficos">
            <div className="grafico-container grafico-full-width">
              <h3 className="grafico-titulo">Comparativa Mensual (Últimos 6 Meses)</h3>
              <div className="grafico-wrapper">
                <Line data={chartDataMensual} options={chartOptionsLine} />
              </div>
            </div>
            <div className="grafico-container">
              <h3 className="grafico-titulo">PQRSD por Estado</h3>
              <div className="grafico-wrapper">
                <Bar data={chartDataPQRSD} options={chartOptions} />
              </div>
            </div>
            <div className="grafico-container">
              <h3 className="grafico-titulo">Distribución General</h3>
              <div className="grafico-wrapper">
                <Doughnut data={chartDataDona} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default Home;


