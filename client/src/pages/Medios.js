import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';
import { FaBroadcastTower, FaTv, FaFacebook, FaYoutube, FaInstagram } from 'react-icons/fa';
import './Medios.css';

const Medios = () => {
  const [filtroTipo, setFiltroTipo] = useState('todos');

  const { data: contenido = [] } = useQuery({
    queryKey: ['medios-contenido', filtroTipo],
    queryFn: async () => {
      const params = {};
      if (filtroTipo !== 'todos') {
        params.tipo = filtroTipo;
      }
      const response = await api.get('/medios/contenido', { params });
      return response.data;
    }
  });

  const { data: canales = [] } = useQuery({
    queryKey: ['medios-canales'],
    queryFn: async () => {
      const response = await api.get('/medios/canales', { params: { activo: 'true' } });
      return response.data;
    }
  });

  const getIcon = (tipo) => {
    const icons = {
      'radio': FaBroadcastTower,
      'tv': FaTv,
      'facebook': FaFacebook,
      'youtube': FaYoutube,
      'instagram': FaInstagram
    };
    return icons[tipo] || FaFacebook;
  };

  return (
    <div className="medios-page">
      <Breadcrumbs />
      <div className="container">
        <div className="page-header">
          <h1><FaBroadcastTower /> Medios de Comunicación</h1>
          <p>Radio, TV, redes sociales y contenido multimedia</p>
        </div>

        <div className="filtros-section">
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
            <option value="todos">Todo el contenido</option>
            <option value="video">Videos</option>
            <option value="audio">Audios</option>
            <option value="imagen">Imágenes</option>
            <option value="documento">Documentos</option>
          </select>
        </div>

        <div className="medios-content">
          <section className="tv-en-vivo-section">
            <h2><FaTv /> TV Ipiales en Vivo</h2>
            <p className="tv-description">Transmisión en vivo de TV Ipiales</p>
            <div className="tv-embed-container">
              <iframe
                src="https://diocesisdeipiales.org/tv-ipiales-en-vivo/"
                title="TV Ipiales en Vivo"
                className="tv-iframe"
                allowFullScreen
                frameBorder="0"
                scrolling="no"
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                loading="lazy"
              />
            </div>
            <div className="tv-link-container">
              <a 
                href="https://diocesisdeipiales.org/tv-ipiales-en-vivo/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary tv-link-btn"
              >
                <FaTv /> Abrir TV Ipiales en Vivo en nueva ventana
              </a>
            </div>
          </section>

          <section className="canales-section">
            <h2>Canales de Comunicación</h2>
            <div className="canales-grid">
              {canales.map(canal => {
                const Icon = getIcon(canal.tipo);
                return (
                  <div key={canal.id} className="canal-card">
                    <Icon size={40} />
                    <h3>{canal.nombre}</h3>
                    {canal.descripcion && <p>{canal.descripcion}</p>}
                    {canal.url && (
                      <a href={canal.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                        Visitar
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="contenido-section">
            <h2>Contenido Multimedia</h2>
            <div className="contenido-grid">
              {contenido.map(item => (
                <div key={item.id} className="contenido-card">
                  {item.imagen_miniatura && (
                    <img src={item.imagen_miniatura} alt={item.titulo} />
                  )}
                  <div className="contenido-content">
                    <h3>{item.titulo}</h3>
                    {item.descripcion && <p>{item.descripcion}</p>}
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                        Ver Contenido
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Medios;

