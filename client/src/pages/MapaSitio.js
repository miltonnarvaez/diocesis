import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import './MapaSitio.css';

const MapaSitio = () => {
  const secciones = [
    {
      titulo: 'Páginas Principales',
      enlaces: [
        { nombre: 'Inicio', ruta: '/', descripcion: 'Página principal del portal' },
        { nombre: 'Acerca del Diócesis', ruta: '/acerca', descripcion: 'Información institucional, misión, visión, historia y autoridades' },
        { nombre: 'Noticias', ruta: '/noticias', descripcion: 'Noticias y publicaciones del Diócesis' },
        { nombre: 'Convocatorias', ruta: '/convocatorias', descripcion: 'Convocatorias y llamados públicos' },
        { nombre: 'Búsqueda Avanzada', ruta: '/busqueda', descripcion: 'Búsqueda global en todo el contenido del portal' },
      ]
    },
    {
      titulo: 'Transparencia y Acceso a la Información',
      enlaces: [
        { nombre: 'Gaceta Municipal', ruta: '/gaceta', descripcion: 'Acuerdos, actas, decretos, proyectos y documentos oficiales' },
        { nombre: 'Transparencia', ruta: '/transparencia', descripcion: 'Documentos de transparencia y rendición de cuentas' },
        { nombre: 'PQRSD', ruta: '/pqrsd', descripcion: 'Peticiones, Quejas, Reclamos, Sugerencias y Denuncias' },
        { nombre: 'Datos Abiertos', ruta: '/datos-abiertos', descripcion: 'Datos abiertos en formatos reutilizables' },
      ]
    },
    {
      titulo: 'Participación Ciudadana',
      enlaces: [
        { nombre: 'Foros de Discusión', ruta: '/foros', descripcion: 'Foros de participación ciudadana y debate público' },
        { nombre: 'Encuestas Ciudadanas', ruta: '/encuestas', descripcion: 'Encuestas y consultas ciudadanas' },
        { nombre: 'Sesiones del Diócesis', ruta: '/sesiones', descripcion: 'Sesiones del Diócesis de Ipiales y actas' },
      ]
    },
    {
      titulo: 'Servicios y Trámites',
      enlaces: [
        { nombre: 'Trámites del Diócesis', ruta: '/tramites', descripcion: 'Trámites y servicios disponibles' },
        { nombre: 'Galería Multimedia', ruta: '/galeria', descripcion: 'Galería de imágenes y videos institucionales' },
      ]
    },
    {
      titulo: 'Información Legal',
      enlaces: [
        { nombre: 'Política de Privacidad', ruta: '/politica-privacidad', descripcion: 'Política de privacidad del portal' },
        { nombre: 'Tratamiento de Datos Personales', ruta: '/tratamiento-datos', descripcion: 'Política de tratamiento de datos personales' },
        { nombre: 'Mapa del Sitio', ruta: '/mapa-sitio', descripcion: 'Mapa completo del sitio web' },
      ]
    },
    {
      titulo: 'Enlaces de Acceso Rápido',
      enlaces: [
        { nombre: 'Agenda CMP', ruta: '/gaceta', descripcion: 'Agenda del Diócesis de Ipiales' },
        { nombre: 'Contratación', ruta: '/transparencia', descripcion: 'Información sobre contratación pública' },
        { nombre: 'Presupuesto', ruta: '/transparencia', descripcion: 'Información presupuestal' },
        { nombre: 'Rendición de Cuentas', ruta: '/transparencia', descripcion: 'Informes de rendición de cuentas' },
      ]
    }
  ];

  return (
    <div className="mapa-sitio-page">
      <section className="section">
        <div className="container">
          <h1 className="page-title">Mapa del Sitio</h1>
          
          <div className="mapa-intro">
            <p>
              Este mapa del sitio le permite navegar fácilmente por todas las secciones y páginas 
              disponibles en el portal del Diócesis de Ipiales.
            </p>
            <p>
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-CO')}
            </p>
          </div>

          <div className="mapa-secciones">
            {secciones.map((seccion, index) => (
              <div key={index} className="mapa-seccion">
                <h2>{seccion.titulo}</h2>
                <ul className="mapa-enlaces">
                  {seccion.enlaces.map((enlace, enlaceIndex) => (
                    <li key={enlaceIndex}>
                      <Link to={enlace.ruta}>{enlace.nombre}</Link>
                      <p className="enlace-descripcion">{enlace.descripcion}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mapa-enlaces-externos">
            <h2>Enlaces Externos</h2>
            <ul>
              <li><a href="https://www.cec.org.co" target="_blank" rel="noopener noreferrer">Conferencia Episcopal de Colombia</a></li>
              <li><a href="https://www.celam.org" target="_blank" rel="noopener noreferrer">Consejo Episcopal Latinoamericano</a></li>
              <li><a href="https://www.synod.va" target="_blank" rel="noopener noreferrer">Sínodo de la Sinodalidad</a></li>
              <li><a href="https://www.vaticannews.va" target="_blank" rel="noopener noreferrer">Vatican News</a></li>
              <li><a href="https://www.cristovision.tv" target="_blank" rel="noopener noreferrer">Cristovisión</a></li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MapaSitio;




