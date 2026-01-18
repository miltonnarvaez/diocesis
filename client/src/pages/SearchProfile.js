import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { FaSearch, FaUserTie, FaChurch, FaHandsHelping, FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import './SearchProfile.css';

const SearchProfile = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [tipoFiltro, setTipoFiltro] = useState(searchParams.get('tipo') || 'todos');
  const [voiceControl, setVoiceControl] = useState(false);
  const [listeningText, setListeningText] = useState('');

  // Búsqueda de perfiles
  const { data: resultados = {}, isLoading } = useQuery({
    queryKey: ['search-profile', searchQuery, tipoFiltro],
    queryFn: async () => {
      if (!searchQuery || searchQuery.trim().length < 3) {
        return {
          autoridades: [],
          misioneros: [],
          parrocos: [],
          voluntarios: [],
          total: 0
        };
      }
      const response = await api.get('/search-profile', {
        params: { q: searchQuery, tipo: tipoFiltro !== 'todos' ? tipoFiltro : undefined }
      });
      return response.data;
    },
    enabled: Boolean(searchQuery && searchQuery.trim().length >= 3)
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    if (tipoFiltro !== 'todos') {
      params.set('tipo', tipoFiltro);
    }
    setSearchParams(params);
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Tu navegador no soporta reconocimiento de voz. Prueba con Chrome o Edge.');
      return;
    }

    setVoiceControl(!voiceControl);
    if (!voiceControl) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setListeningText('');
        setVoiceControl(false);
        recognition.stop();
      };

      recognition.onerror = (event) => {
        console.error('Error en reconocimiento de voz:', event.error);
        setListeningText('Error en reconocimiento de voz');
        setVoiceControl(false);
        recognition.stop();
      };

      recognition.onend = () => {
        setVoiceControl(false);
        setListeningText('');
      };

      recognition.start();
      setListeningText('Escuchando...');
    }
  };

  const totalResultados = resultados.total || 0;
  const tipos = [
    { value: 'todos', label: 'Todos', icon: FaSearch },
    { value: 'autoridad', label: 'Autoridades', icon: FaUserTie },
    { value: 'misionero', label: 'Misioneros', icon: FaHandsHelping },
    { value: 'parroco', label: 'Párrocos', icon: FaChurch },
    { value: 'voluntario', label: 'Voluntarios', icon: FaHandsHelping }
  ];

  const getProfileId = (tipo, id) => {
    return `${tipo}-${id}`;
  };

  return (
    <div className="search-profile-page page-container">
      <section className="section">
        <div className="container search-profile-container">
          {/* Header similar a la referencia - Todo en una línea */}
          <div className="search-profile-header-section">
            <div className="search-profile-header-app">
              <h1 className="search-profile-app-title">SISTEMA INTEGRADO DE INFORMACIÓN DIOCESANA</h1>
              <h2 className="search-profile-app-acronym">SIID</h2>
              <p className="search-profile-app-subtitle">Diócesis de Ipiales</p>
            </div>
            <div className="search-profile-header">
              <h1 className="search-profile-main-title">Búsqueda de Perfiles</h1>
              <p className="search-profile-instruction">
                Busca autoridades, misioneros, párrocos y voluntarios de la Diócesis
              </p>
            </div>
          </div>

          <form className="search-profile-form" onSubmit={handleSearch}>
            <div className="search-profile-input-group">
              <input
                type="text"
                className="search-profile-input"
                placeholder="Buscar por nombre, cargo, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                minLength={3}
              />
              <button
                type="button"
                className={`search-profile-voice-btn ${voiceControl ? 'listening' : ''}`}
                onClick={handleVoiceSearch}
                title="Búsqueda por voz"
              >
                {voiceControl ? <FaMicrophoneSlash /> : <FaMicrophone />}
              </button>
              <button type="submit" className="search-profile-btn">
                <FaSearch /> Buscar
              </button>
            </div>
            {listeningText && (
              <div className="voice-listening-text">
                {listeningText}
              </div>
            )}

            <div className="search-profile-filters">
              {tipos.map((tipo) => {
                const Icon = tipo.icon;
                return (
                  <button
                    key={tipo.value}
                    type="button"
                    className={`search-profile-filter-btn ${tipoFiltro === tipo.value ? 'active' : ''}`}
                    onClick={() => setTipoFiltro(tipo.value)}
                  >
                    <Icon /> {tipo.label}
                  </button>
                );
              })}
            </div>
          </form>

          {isLoading && searchQuery.trim().length >= 3 ? (
            <div className="search-profile-loading">
              <p>Buscando perfiles...</p>
            </div>
          ) : searchQuery.trim().length >= 3 ? (
            <div className="search-profile-results">
              <div className="search-profile-results-header">
                <h2>Resultados de búsqueda</h2>
                <p>{totalResultados} perfil{totalResultados !== 1 ? 'es' : ''} encontrado{totalResultados !== 1 ? 's' : ''}</p>
              </div>

              {totalResultados === 0 ? (
                <div className="search-profile-no-results">
                  <p>No se encontraron perfiles con "{searchQuery}"</p>
                  <p>Intenta con otros términos de búsqueda</p>
                </div>
              ) : (
                <div className="search-profile-results-grid">
                  {/* Autoridades */}
                  {resultados.autoridades && resultados.autoridades.length > 0 && (
                    <div className="search-profile-section">
                      <h3><FaUserTie /> Autoridades ({resultados.autoridades.length})</h3>
                      <div className="search-profile-cards">
                        {resultados.autoridades.map((autoridad) => (
                          <Link
                            key={autoridad.id}
                            to={`/qr/${getProfileId('autoridad', autoridad.id)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="search-profile-card"
                          >
                            {autoridad.foto_url && (
                              <div className="search-profile-card-photo">
                                <img src={autoridad.foto_url} alt={autoridad.nombre} />
                              </div>
                            )}
                            <div className="search-profile-card-info">
                              <h4>{autoridad.nombre}</h4>
                              <p className="search-profile-card-role">{autoridad.cargo}</p>
                              {autoridad.email && <p>✉️ {autoridad.email}</p>}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Misioneros */}
                  {resultados.misioneros && resultados.misioneros.length > 0 && (
                    <div className="search-profile-section">
                      <h3><FaHandsHelping /> Misioneros ({resultados.misioneros.length})</h3>
                      <div className="search-profile-cards">
                        {resultados.misioneros.map((misionero) => (
                          <Link
                            key={misionero.id}
                            to={`/qr/${getProfileId('misionero', misionero.id)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="search-profile-card"
                          >
                            {misionero.imagen_url && (
                              <div className="search-profile-card-photo">
                                <img src={misionero.imagen_url} alt={misionero.nombre_completo} />
                              </div>
                            )}
                            <div className="search-profile-card-info">
                              <h4>{misionero.nombre_completo}</h4>
                              <p className="search-profile-card-role">{misionero.tipo}</p>
                              {misionero.contacto && <p>📞 {misionero.contacto}</p>}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Párrocos */}
                  {resultados.parrocos && resultados.parrocos.length > 0 && (
                    <div className="search-profile-section">
                      <h3><FaChurch /> Párrocos ({resultados.parrocos.length})</h3>
                      <div className="search-profile-cards">
                        {resultados.parrocos.map((parroco) => (
                          <Link
                            key={parroco.id}
                            to={`/qr/${getProfileId('parroco', parroco.id)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="search-profile-card"
                          >
                            <div className="search-profile-card-info">
                              <h4>{parroco.nombre || parroco.nombre_parroquia}</h4>
                              <p className="search-profile-card-role">Párroco: {parroco.parroco}</p>
                              {parroco.vicario && <p>Vicario: {parroco.vicario}</p>}
                              {parroco.direccion && <p>📍 {parroco.direccion}</p>}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Voluntarios */}
                  {resultados.voluntarios && resultados.voluntarios.length > 0 && (
                    <div className="search-profile-section">
                      <h3><FaHandsHelping /> Voluntarios ({resultados.voluntarios.length})</h3>
                      <div className="search-profile-cards">
                        {resultados.voluntarios.map((voluntario) => (
                          <Link
                            key={voluntario.id}
                            to={`/qr/${getProfileId('voluntario', voluntario.id)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="search-profile-card"
                          >
                            <div className="search-profile-card-info">
                              <h4>{voluntario.nombre_completo}</h4>
                              {voluntario.area_interes && (
                                <p className="search-profile-card-role">{voluntario.area_interes}</p>
                              )}
                              {voluntario.documento && <p>📄 {voluntario.documento}</p>}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : searchQuery.trim().length > 0 && searchQuery.trim().length < 3 ? (
            <div className="search-profile-min-length">
              <p>Ingresa al menos 3 caracteres para buscar</p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default SearchProfile;
