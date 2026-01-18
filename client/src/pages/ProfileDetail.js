import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import Escudo from '../components/Escudo';
import { 
  FaUser,
  FaUserTie,
  FaChurch,
  FaHandsHelping,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaArrowLeft,
  FaQrcode,
  FaCalendarAlt,
  FaInfoCircle,
  FaCheckCircle
} from 'react-icons/fa';
import './ProfileDetail.css';

const ProfileDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [qrUrl, setQrUrl] = useState('');

  // Decodificar el ID para obtener tipo e id
  const decodeProfileId = (encodedId) => {
    try {
      // El formato es: tipo_perfil-id
      const parts = encodedId.split('-');
      if (parts.length >= 2) {
        const tipo = parts[0];
        const profileId = parts.slice(1).join('-');
        return { tipo, id: profileId };
      }
      return null;
    } catch (error) {
      console.error('Error decodificando ID:', error);
      return null;
    }
  };

  const profileInfo = decodeProfileId(id);

  // Obtener perfil
  const { data: perfil, isLoading, error } = useQuery({
    queryKey: ['profile-detail', id],
    queryFn: async () => {
      if (!profileInfo) {
        throw new Error('ID de perfil inválido');
      }
      const response = await api.get(`/search-profile/${profileInfo.tipo}/${profileInfo.id}`);
      return response.data;
    },
    enabled: !!profileInfo
  });

  // Generar URL del QR
  useEffect(() => {
    if (id) {
      const currentUrl = window.location.href;
      setQrUrl(currentUrl);
    }
  }, [id]);

  const getTipoIcon = (tipo) => {
    const icons = {
      autoridad: FaUserTie,
      misionero: FaChurch,
      parroco: FaChurch,
      voluntario: FaHandsHelping,
      usuario: FaUser
    };
    return icons[tipo] || FaUser;
  };

  const getTipoLabel = (tipo) => {
    const labels = {
      autoridad: 'Autoridad',
      misionero: 'Misionero',
      parroco: 'Párroco',
      voluntario: 'Voluntario',
      usuario: 'Usuario'
    };
    return labels[tipo] || tipo;
  };

  if (isLoading) {
    return (
      <div className="profile-detail-page">
        <div className="profile-detail-loading">
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !perfil) {
    return (
      <div className="profile-detail-page">
        <div className="profile-detail-error">
          <h2>Perfil no encontrado</h2>
          <p>El perfil que buscas no existe o ha sido eliminado.</p>
          <Link to="/search-profile" className="btn-back">
            <FaArrowLeft /> Volver a búsqueda
          </Link>
        </div>
      </div>
    );
  }

  const Icon = getTipoIcon(perfil.tipo_perfil);

  // Determinar el título según el tipo de perfil
  const getProfileTitle = () => {
    if (perfil.cargo) return perfil.cargo;
    if (perfil.tipo && perfil.tipo_perfil === 'misionero') return perfil.tipo;
    if (perfil.tipo_perfil === 'parroco') return 'Párroco';
    if (perfil.tipo_perfil === 'voluntario') return 'Voluntario';
    return getTipoLabel(perfil.tipo_perfil);
  };

  // Determinar si está activo
  const isActivo = perfil.activo !== false && perfil.estado !== 'inactivo';

  return (
    <div className="profile-detail-page">
      <section className="section">
      <div className="container">
        {/* Header similar a la referencia */}
        <div className="profile-detail-header-section">
          <div className="profile-detail-header-logo">
            <Escudo />
            <div className="profile-detail-header-text">
              <h2 className="profile-detail-header-title">DIÓCESIS DE IPIALES</h2>
              <p className="profile-detail-header-subtitle">En Proceso de Comunión, Participación y Misión</p>
            </div>
          </div>
          <div className="profile-detail-header-divider"></div>
          <div className="profile-detail-header-app">
            <h1 className="profile-detail-app-title">SISTEMA INTEGRADO DE INFORMACIÓN DIOCESANA</h1>
            <h2 className="profile-detail-app-acronym">SIID</h2>
            <p className="profile-detail-app-subtitle">Diócesis de Ipiales</p>
          </div>
          <div className="profile-detail-header-divider"></div>
        </div>

        {/* Perfil similar a la referencia */}
        <div className="profile-detail-content">
          <div className="profile-detail-card">
            {/* Foto circular con checkmark */}
            <div className="profile-photo-section">
              {perfil.foto_url || perfil.imagen_url ? (
                <div className="profile-photo-circular">
                  <img 
                    src={(perfil.foto_url || perfil.imagen_url).startsWith('http') 
                      ? (perfil.foto_url || perfil.imagen_url) 
                      : `${process.env.PUBLIC_URL || ''}${perfil.foto_url || perfil.imagen_url}`} 
                    alt={perfil.nombre || perfil.nombre_completo || perfil.parroco}
                    onError={(e) => {
                      e.target.src = `${process.env.PUBLIC_URL || ''}/images/default-avatar.png`;
                    }}
                  />
                  {isActivo && (
                    <div className="profile-photo-checkmark">
                      <FaCheckCircle />
                    </div>
                  )}
                </div>
              ) : (
                <div className="profile-photo-circular default">
                  <Icon />
                  {isActivo && (
                    <div className="profile-photo-checkmark">
                      <FaCheckCircle />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Nombre y título */}
            <div className="profile-name-section">
              <h1 className="profile-name-large">
                {perfil.nombre || perfil.nombre_completo || perfil.parroco || 'Sin nombre'}
              </h1>
              <p className="profile-title-text">{getProfileTitle()}</p>
              
              {/* Estado activo */}
              {isActivo && (
                <div className="profile-status-active">
                  ACTIVO
                </div>
              )}
            </div>

            {/* Detalles personales en dos columnas */}
            <div className="profile-details-grid">
              <div className="profile-detail-item">
                <span className="profile-detail-label">Tipo de Documento</span>
                <span className="profile-detail-value">
                  {perfil.tipo_documento || 'Cédula de Ciudadanía'}
                </span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-detail-label">Documento</span>
                <span className="profile-detail-value">
                  {perfil.documento ? `*****${perfil.documento.slice(-3)}` : 'No disponible'}
                </span>
              </div>
              {perfil.fecha_ordenacion && (
                <div className="profile-detail-item">
                  <span className="profile-detail-label">Fecha de Ordenación</span>
                  <span className="profile-detail-value">
                    {new Date(perfil.fecha_ordenacion).toLocaleDateString('es-CO', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}
              {perfil.fecha_registro && (
                <div className="profile-detail-item">
                  <span className="profile-detail-label">Fecha de Registro</span>
                  <span className="profile-detail-value">
                    {new Date(perfil.fecha_registro).toLocaleDateString('es-CO', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Asignación Pastoral */}
            {(perfil.nombre_parroquia || perfil.mision_actual || perfil.asignacion_pastoral) && (
              <div className="profile-pastoral-assignment">
                <h3 className="profile-pastoral-title">Asignación Pastoral Actual</h3>
                <p className="profile-pastoral-value">
                  {perfil.nombre_parroquia || perfil.mision_actual || perfil.asignacion_pastoral || 'Adscrito'}
                </p>
              </div>
            )}

            {/* Información adicional */}
            {(perfil.biografia || perfil.descripcion || perfil.experiencia || perfil.habilidades) && (
              <div className="profile-additional-info">
                {perfil.biografia || perfil.descripcion ? (
                  <div className="profile-info-item">
                    <h4 className="profile-info-title">Biografía</h4>
                    <p className="profile-info-text">{perfil.biografia || perfil.descripcion}</p>
                  </div>
                ) : null}
                
                {perfil.experiencia && (
                  <div className="profile-info-item">
                    <h4 className="profile-info-title">Experiencia</h4>
                    <p className="profile-info-text">{perfil.experiencia}</p>
                  </div>
                )}

                {perfil.habilidades && (
                  <div className="profile-info-item">
                    <h4 className="profile-info-title">Habilidades</h4>
                    <p className="profile-info-text">{perfil.habilidades}</p>
                  </div>
                )}
              </div>
            )}

            {/* Información de contacto */}
            {(perfil.email || perfil.telefono || perfil.direccion || perfil.contacto) && (
              <div className="profile-contact-section">
                <h3 className="profile-contact-title">Información de Contacto</h3>
                <div className="profile-contact-grid">
                  {perfil.email && (
                    <div className="profile-contact-item">
                      <FaEnvelope className="profile-contact-icon" />
                      <div className="profile-contact-content">
                        <span className="profile-contact-label">Email</span>
                        <a href={`mailto:${perfil.email}`} className="profile-contact-value">
                          {perfil.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {perfil.telefono && (
                    <div className="profile-contact-item">
                      <FaPhone className="profile-contact-icon" />
                      <div className="profile-contact-content">
                        <span className="profile-contact-label">Teléfono</span>
                        <a href={`tel:${perfil.telefono}`} className="profile-contact-value">
                          {perfil.telefono}
                        </a>
                      </div>
                    </div>
                  )}

                  {perfil.direccion && (
                    <div className="profile-contact-item">
                      <FaMapMarkerAlt className="profile-contact-icon" />
                      <div className="profile-contact-content">
                        <span className="profile-contact-label">Dirección</span>
                        <span className="profile-contact-value">{perfil.direccion}</span>
                      </div>
                    </div>
                  )}

                  {perfil.contacto && (
                    <div className="profile-contact-item">
                      <FaPhone className="profile-contact-icon" />
                      <div className="profile-contact-content">
                        <span className="profile-contact-label">Contacto</span>
                        <span className="profile-contact-value">{perfil.contacto}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Botón de volver */}
            <div className="profile-actions-section">
              <button 
                onClick={() => navigate(-1)} 
                className="btn-back-profile"
              >
                <FaArrowLeft /> Volver
              </button>
            </div>
          </div>
        </div>
      </div>
      </section>
    </div>
  );
};

export default ProfileDetail;





