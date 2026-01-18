import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Escudo from '../components/Escudo';
import Bandera from '../components/Bandera';
import Timeline from '../components/Timeline';
import Breadcrumbs from '../components/Breadcrumbs';
import api from '../services/api';
import { getFileUrl } from '../utils/fileUtils';
import { OrganizationSchema } from '../components/SchemaMarkup';
import {
  FaBullseye, FaEye, FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope,
  FaClock, FaFileAlt, FaDownload, FaSitemap, FaGavel, FaUserTie,
  FaUserSecret, FaUsers, FaClipboardList, FaTasks, FaUserCog, FaNewspaper
} from 'react-icons/fa';
import './Acerca.css';

const Acerca = () => {
  const { t } = useLanguage();
  const location = useLocation();

  // Scroll a la sección cuando hay un hash en la URL
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location.hash]);

  const { data: autoridades = [] } = useQuery({
    queryKey: ['autoridades'],
    queryFn: async () => {
      const response = await api.get('/autoridades');
      return response.data;
    }
  });

  const { data: configuracion = {} } = useQuery({
    queryKey: ['configuracion'],
    queryFn: async () => {
      const response = await api.get('/configuracion');
      return response.data;
    }
  });

  const { data: historia = [] } = useQuery({
    queryKey: ['historia'],
    queryFn: async () => {
      const response = await api.get('/historia');
      return response.data;
    }
  });

  return (
    <div className="acerca">
      <Breadcrumbs />
      <OrganizationSchema 
        name="Diócesis"
        url={window.location.origin}
        email={configuracion.email}
        telephone={configuracion.telefono}
        address={{
          addressLocality: "Ipiales",
          addressRegion: "Nariño",
          addressCountry: "CO",
          streetAddress: configuracion.direccion || "Cra. 6 No. 7-01, Ipiales, Nariño"
        }}
      />
      <OrganizationSchema 
        name="Diócesis de Ipiales"
        url={window.location.origin}
        email={configuracion.email || "diocesisdeipiales@gmail.com"}
        telephone={configuracion.telefono || "+57 315 466 9018"}
        address={{
          addressLocality: "Ipiales",
          addressRegion: "Nariño",
          addressCountry: "CO",
          streetAddress: configuracion.direccion || "Cra. 6 No. 7-01, Ipiales, Nariño"
        }}
      />
      <section className="section">
        <div className="container">
          <div className="acerca-header">
            <Escudo />
            <div>
              <h1>Diócesis de Ipiales</h1>
              <p>En comunión, participación y misión</p>
            </div>
          </div>

          <div className="acerca-content">
            <div id="mision" className="acerca-section mision-section">
              <div className="section-icon">
                <FaBullseye />
              </div>
              <h2>Misión</h2>
              <div className="section-content-with-image">
                <div className="section-text">
                  <p>
                    La Diócesis de Ipiales es una Iglesia particular en comunión con la Iglesia Universal, 
                    encargada de promover la evangelización, la comunión, la participación y la misión en el territorio 
                    que le ha sido encomendado. Somos una comunidad de fe que busca dar razón de nuestra fe, 
                    siendo protagonistas de la paz desde nuestras propias familias y trabajando por el bien común 
                    de todos los fieles y habitantes de nuestra región.
                  </p>
                </div>
                <div className="section-image-placeholder">
                  <div className="image-placeholder">
                    <span className="placeholder-icon"><FaBuilding /></span>
                    <p>Gobierno Local</p>
                  </div>
                </div>
              </div>
            </div>

            <div id="vision" className="acerca-section vision-section">
              <div className="section-icon">
                <FaEye />
              </div>
              <h2>Visión</h2>
              <div className="section-content-with-image">
                <div className="section-image-placeholder">
                  <div className="image-placeholder">
                    <span className="placeholder-icon"><FaEye /></span>
                    <p>Futuro Promisorio</p>
                  </div>
                </div>
                <div className="section-text">
                  <p>
                    La Diócesis de Ipiales se proyecta como una Iglesia particular que, en comunión con el Obispo, 
                    busca ser casa de comunión, participación y misión. Aspiramos a ser una comunidad que vive la fe 
                    con alegría, que acompaña a las familias en su caminar, que promueve la nueva evangelización 
                    siguiendo el ejemplo de María, estrella de la Nueva Evangelización, y que trabaja incansablemente 
                    por ser territorio de paz, siendo protagonistas de la paz desde nuestras propias familias.
                  </p>
                </div>
              </div>
            </div>

            <div id="estructura" className="acerca-section estructura-section">
              <h2><FaSitemap /> Curia Episcopal</h2>
              <p className="section-description">
                Organización y estructura de la Curia Episcopal de la Diócesis de Ipiales
              </p>
              <div className="estructura-organigrama">
                {/* Nivel 1: Obispo */}
                <div className="estructura-nivel nivel-1">
                  <div className="estructura-card presidencia">
                    <FaUserTie className="estructura-icon" />
                    <h3>OBISPO</h3>
                    <p>Monseñor Saúl Grisales</p>
                    <span className="estructura-cargo">Máxima Autoridad Pastoral</span>
                  </div>
                </div>

                {/* Nivel 2: Vicarios y Secretarios */}
                <div className="estructura-nivel nivel-2">
                  <div className="estructura-card vicepresidencia">
                    <FaUserTie className="estructura-icon" />
                    <h4>VICARIOS EPISCOPALES</h4>
                    <p>Vicarios designados por el Obispo</p>
                  </div>
                  <div className="estructura-card secretaria">
                    <FaUserSecret className="estructura-icon" />
                    <h4>SECRETARÍA GENERAL</h4>
                    <p>Gestión administrativa y documental</p>
                  </div>
                </div>

                {/* Nivel 3: Vicarías Foráneas */}
                <div className="estructura-nivel nivel-3">
                  <div className="estructura-card concejales">
                    <FaMapMarkerAlt className="estructura-icon" />
                    <h4>VICARÍAS FORÁNEAS</h4>
                    <p>Vicarías foráneas de Túquerres, Pupiales, Puerres y Cumbal</p>
                    <div className="estructura-funciones">
                      <p><strong>Funciones principales:</strong></p>
                      <ul>
                        <li>Coordinación pastoral territorial</li>
                        <li>Acompañamiento a las parroquias</li>
                        <li>Promoción de la comunión y participación</li>
                        <li>Ejecución de la misión diocesana</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Nivel 4: Servicios y Comisiones */}
                <div className="estructura-nivel nivel-4">
                  <div className="estructura-card comisiones">
                    <FaClipboardList className="estructura-icon" />
                    <h4>SERVICIOS DIOCESANOS</h4>
                    <p>Servicios de la Curia Episcopal</p>
                    <div className="estructura-funciones">
                      <ul>
                        <li>Cancillería</li>
                        <li>Tribunal Eclesiástico</li>
                        <li>Almacén La Mestiza</li>
                        <li>TV Ipiales</li>
                        <li>Imprenta</li>
                      </ul>
                    </div>
                  </div>
                  <div className="estructura-card comisiones">
                    <FaTasks className="estructura-icon" />
                    <h4>MEDIOS DE COMUNICACIÓN</h4>
                    <p>Comunicación y difusión</p>
                  </div>
                  <div className="estructura-card apoyo">
                    <FaUserCog className="estructura-icon" />
                    <h4>PERSONAL ADMINISTRATIVO</h4>
                    <p>Personal de apoyo administrativo y técnico</p>
                  </div>
                </div>
              </div>
            </div>

            <div id="autoridades" className="acerca-section">
              <h2>Autoridades</h2>
              {autoridades.length === 0 ? (
                <p>Cargando información de autoridades...</p>
              ) : (
                <div className="autoridades-grid">
                  {autoridades.map((autoridad) => (
                    <div key={autoridad.id} className="autoridad-card">
                      {autoridad.foto_url && (
                        <img 
                          src={autoridad.foto_url} 
                          alt={autoridad.nombre}
                          className="autoridad-foto"
                        />
                      )}
                      <h3>{autoridad.cargo}</h3>
                      <p className="autoridad-nombre">{autoridad.nombre}</p>
                      {autoridad.email && (
                        <p className="autoridad-contacto"><FaEnvelope /> {autoridad.email}</p>
                      )}
                      {autoridad.telefono && (
                        <p className="autoridad-contacto"><FaPhone /> {autoridad.telefono}</p>
                      )}
                      {autoridad.biografia && (
                        <p className="autoridad-biografia">{autoridad.biografia}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div id="contacto" className="acerca-section">
              <h2>Información de Contacto</h2>
              <div className="contacto-info">
                <p><FaMapMarkerAlt /> Cra. 6 No. 7-01, Ipiales, Nariño</p>
                <p><FaPhone /> +57 315 466 9018</p>
                <p><FaEnvelope /> diocesisdeipiales@gmail.com</p>
                <p><FaClock /> Lunes a Viernes: 8:00 AM - 12:00 PM y 2:00 PM - 6:00 PM</p>
              </div>
            </div>

            {/* Documento PDF Institucional Destacado */}
            {(configuracion.documento_institucional_url || configuracion.documento_institucional_titulo) && (
              <div className="acerca-section documento-institucional-section">
                <h2><FaFileAlt /> Documento Institucional</h2>
                <div className="documento-institucional-card">
                  <div className="documento-institucional-icon">
                    <FaFileAlt />
                  </div>
                  <div className="documento-institucional-content">
                    <h3>
                      {configuracion.documento_institucional_titulo || 
                       'Estatuto del Diócesis'}
                    </h3>
                    {configuracion.documento_institucional_descripcion && (
                      <p>{configuracion.documento_institucional_descripcion}</p>
                    )}
                    {configuracion.documento_institucional_url && (
                      <a
                        href={getFileUrl(configuracion.documento_institucional_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-documento-institucional"
                      >
                        <FaDownload /> Descargar PDF
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {historia.length > 0 && (
              <div id="historia" className="acerca-section historia-section">
                <h2>Historia del Diócesis</h2>
                <Timeline eventos={historia} />
              </div>
            )}

            <div id="vicarias" className="acerca-section">
              <h2>Vicarias Foráneas</h2>
              <p className="section-description">
                Las vicarías foráneas son divisiones territoriales de la Diócesis que agrupan varias parroquias 
                para facilitar la coordinación pastoral y el acompañamiento cercano a las comunidades.
              </p>
              <div className="vicarias-grid">
                <div className="vicaria-card">
                  <FaMapMarkerAlt className="vicaria-icon" />
                  <h3>Vicaría Foránea de Túquerres</h3>
                  <p>Coordinación pastoral de la zona de Túquerres</p>
                </div>
                <div className="vicaria-card">
                  <FaMapMarkerAlt className="vicaria-icon" />
                  <h3>Vicaría Foránea de Pupiales</h3>
                  <p>Coordinación pastoral de la zona de Pupiales</p>
                </div>
                <div className="vicaria-card">
                  <FaMapMarkerAlt className="vicaria-icon" />
                  <h3>Vicaría Foránea de Puerres</h3>
                  <p>Coordinación pastoral de la zona de Puerres</p>
                </div>
                <div className="vicaria-card">
                  <FaMapMarkerAlt className="vicaria-icon" />
                  <h3>Vicaría Foránea de Cumbal</h3>
                  <p>Coordinación pastoral de la zona de Cumbal</p>
                </div>
              </div>
            </div>

            <div id="medios" className="acerca-section">
              <h2>Medios de Comunicación</h2>
              <p className="section-description">
                La Diócesis de Ipiales cuenta con diversos medios de comunicación para difundir el mensaje 
                del Evangelio y mantener informada a la comunidad.
              </p>
              <div className="medios-grid">
                <div className="medio-card">
                  <FaNewspaper className="medio-icon" />
                  <h3>Página Web</h3>
                  <p>Portal oficial de la Diócesis de Ipiales</p>
                </div>
                <div className="medio-card">
                  <FaNewspaper className="medio-icon" />
                  <h3>Redes Sociales</h3>
                  <p>Facebook, Instagram y otras plataformas</p>
                </div>
                <div className="medio-card">
                  <FaNewspaper className="medio-icon" />
                  <h3>TV Ipiales</h3>
                  <p>Canal de televisión diocesano</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Acerca;


