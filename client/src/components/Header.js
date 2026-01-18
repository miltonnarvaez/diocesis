import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';
import Escudo from './Escudo';
import TexturePattern from './TexturePattern';
import api from '../services/api';
import { 
  FaHome, FaBuilding, FaNewspaper, FaFileAlt, FaSearch, FaUsers, FaCog,
  FaBullseye, FaEye, FaUserFriends, FaHistory, FaPhone, FaMonument,
  FaList, FaGavel, FaFileContract, FaBook, FaBalanceScale, FaClipboardList,
  FaDollarSign, FaHandshake, FaChartLine, FaFileInvoiceDollar, FaShieldAlt,
  FaFileSignature, FaSitemap, FaProjectDiagram, FaGavel as FaLaw, FaUserCog,
  FaClipboardCheck, FaLandmark, FaUser, FaImages, FaCalendarAlt, FaComments, FaEnvelope,
  FaCheckCircle, FaTimes, FaBars, FaClock, FaUserTie, FaMapMarkerAlt, FaChevronDown, FaChevronUp,
  FaCross, FaPrayingHands, FaMicrophone, FaHeart, FaCalendarCheck
} from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileActiveSubmenu, setMobileActiveSubmenu] = useState(null);
  const menuRef = useRef(null);
  const timeoutRef = useRef(null);
  const menuItemRefs = useRef([]);
  const megaMenuRefs = useRef([]);
  const lastScrollYRef = useRef(0); // Usar ref en lugar de state para evitar re-renders

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
    refetchOnMount: false,
    staleTime: Infinity,
  });

  // Estado para fecha y hora de Colombia
  const [fechaHora, setFechaHora] = useState({
    fecha: '',
    hora: ''
  });

  useEffect(() => {
    const actualizarFechaHora = () => {
      const ahora = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Bogota"}));
      const nuevaFecha = ahora.toLocaleDateString('es-CO', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      const nuevaHora = ahora.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      setFechaHora(prev => {
        if (prev.fecha !== nuevaFecha || prev.hora !== nuevaHora) {
          return { fecha: nuevaFecha, hora: nuevaHora };
        }
        return prev;
      });
    };
    actualizarFechaHora();
    const interval = setInterval(actualizarFechaHora, 1000); // Actualizar cada segundo
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    {
      label: t('menu.inicio'),
      path: '/',
      hasSubmenu: false,
      icon: FaHome
    },
    {
      label: 'Institucional',
      path: '/acerca',
      hasSubmenu: true,
      icon: FaBuilding,
      description: 'Información institucional',
      submenu: [
        { label: 'Nuestra historia de salvación', path: '/historia', icon: FaHistory },
        { label: 'Obispos', path: '/acerca#autoridades', icon: FaUserTie },
        { label: 'Curia Episcopal', path: '/acerca#estructura', icon: FaSitemap },
        { label: 'Vicarias foráneas', path: '/acerca#vicarias', icon: FaMapMarkerAlt },
        { label: 'Medios de Comunicación', path: '/acerca#medios', icon: FaNewspaper },
        { label: 'Misión', path: '/acerca#mision', icon: FaBullseye },
        { label: 'Visión', path: '/acerca#vision', icon: FaEye },
        { label: 'Contacto', path: '/contacto', icon: FaPhone }
      ]
    },
    {
      label: t('menu.noticias'),
      path: '/noticias',
      hasSubmenu: true,
      icon: FaNewspaper,
      description: 'Información y actualidad',
      submenu: [
        { label: 'Todas las Noticias', path: '/noticias', icon: FaNewspaper },
        { label: 'Noticias Generales', path: '/noticias?categoria=Noticias', icon: FaFileAlt },
        { label: 'Comunicados Oficiales', path: '/noticias?categoria=Comunicados', icon: FaFileContract },
        { label: 'Eventos y Actividades', path: '/noticias?categoria=Eventos', icon: FaCalendarAlt },
        { label: 'Institucional', path: '/noticias?categoria=Institucional', icon: FaBuilding }
      ]
    },
    {
      label: 'Documentos',
      path: '/gaceta',
      hasSubmenu: true,
      icon: FaFileAlt,
      description: 'Documentos oficiales y publicaciones',
      submenu: [
        { label: 'Boletín Diocesano', path: '/gaceta', icon: FaFileAlt },
        { label: 'Cartas Pastorales', path: '/gaceta?tipo=carta', icon: FaFileContract },
        { label: 'Documentos Oficiales', path: '/gaceta?tipo=documento', icon: FaFileAlt },
        { label: 'Manuales y Guías', path: '/gaceta?tipo=manual', icon: FaBook }
      ]
    },
    {
      label: 'Agenda',
      path: '/agenda',
      hasSubmenu: false,
      icon: FaCalendarAlt
    },
    {
      label: 'Participación',
      path: '/encuestas',
      hasSubmenu: true,
      icon: FaUsers,
      description: 'Participa y opina',
      submenu: [
        { label: 'Encuestas', path: '/encuestas', icon: FaChartLine },
        { label: 'Foros', path: '/foros', icon: FaComments },
        { label: 'Convocatorias', path: '/convocatorias', icon: FaCalendarAlt }
      ]
    },
    {
      label: 'Servicios',
      path: '/tramites',
      hasSubmenu: true,
      icon: FaCog,
      description: 'Trámites y servicios',
      submenu: [
        { label: 'Trámites', path: '/tramites', icon: FaFileAlt },
        { label: 'Galería', path: '/galeria', icon: FaImages },
        { label: 'Búsqueda de Perfiles', path: '/search-profile', icon: FaSearch },
        { label: 'Intenciones de Misa', path: '/intenciones-misa', icon: FaCross },
        { label: 'Donaciones', path: '/donaciones', icon: FaDollarSign },
        { label: 'Oraciones', path: '/oraciones', icon: FaPrayingHands },
        { label: 'Biblioteca Digital', path: '/biblioteca-digital', icon: FaBook },
        { label: 'Homilías', path: '/homilias', icon: FaMicrophone },
        { label: 'Testimonios', path: '/testimonios', icon: FaHeart },
        { label: 'Eventos Especiales', path: '/eventos-especiales', icon: FaCalendarAlt },
        { label: 'Reservas', path: '/reservas', icon: FaCalendarCheck },
        { label: 'Catequesis', path: '/catequesis', icon: FaBook },
        { label: 'Contacto', path: '/contacto', icon: FaEnvelope }
      ]
    }
  ];

  const handleMouseEnter = (index) => {
    // Limpiar cualquier timeout existente inmediatamente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // Solo abrir si no hay otro menú activo o si es el mismo
    if (activeMenu === null || activeMenu === index) {
      setActiveMenu(index);
    } else {
      // Si hay otro menú activo, cerrarlo primero con un pequeño delay
      setActiveMenu(null);
      setTimeout(() => {
        setActiveMenu(index);
      }, 100);
    }
  };

  // El dropdown se posiciona automáticamente con CSS (position: absolute)

  const handleMouseLeave = (index) => {
    // Limpiar cualquier timeout existente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // Cerrar inmediatamente si el menú activo es el que se está dejando
    if (activeMenu === index) {
      timeoutRef.current = setTimeout(() => {
        // Verificar nuevamente antes de cerrar
        if (activeMenu === index) {
          setActiveMenu(null);
        }
        timeoutRef.current = null;
      }, 100);
    }
  };

  const handleSubmenuClick = () => {
    setActiveMenu(null);
    setFocusedIndex(null);
    setMobileMenuOpen(false);
    setMobileActiveSubmenu(null);
  };

  const handleNavClick = () => {
    setActiveMenu(null);
    setFocusedIndex(null);
    setMobileMenuOpen(false);
    setMobileActiveSubmenu(null);
  };

  const handleMobileSubmenuToggle = (index, e) => {
    e.preventDefault();
    e.stopPropagation();
    setMobileActiveSubmenu(mobileActiveSubmenu === index ? null : index);
  };

  // Navegación por teclado
  const handleKeyDown = (e, index, hasSubmenu) => {
    const menuItems = menuItemRefs.current;
    
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        if (index < menuItems.length - 1) {
          menuItems[index + 1]?.focus();
          setFocusedIndex(index + 1);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (index > 0) {
          menuItems[index - 1]?.focus();
          setFocusedIndex(index - 1);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (hasSubmenu) {
          setActiveMenu(index);
          const firstSubmenuItem = menuItemRefs.current[index]?.nextElementSibling?.querySelector('.nav-sublink');
          firstSubmenuItem?.focus();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (hasSubmenu && activeMenu === index) {
          setActiveMenu(null);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setActiveMenu(null);
        setFocusedIndex(null);
        menuItems[index]?.blur();
        break;
      case 'Enter':
      case ' ':
        if (hasSubmenu) {
          e.preventDefault();
          setActiveMenu(activeMenu === index ? null : index);
        }
        break;
      default:
        break;
    }
  };

  const handleSubmenuKeyDown = (e, parentIndex, subIndex, submenuLength) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (subIndex < submenuLength - 1) {
          const nextItem = e.target.parentElement.nextElementSibling?.querySelector('.nav-sublink');
          nextItem?.focus();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (subIndex > 0) {
          const prevItem = e.target.parentElement.previousElementSibling?.querySelector('.nav-sublink');
          prevItem?.focus();
        } else {
          menuItemRefs.current[parentIndex]?.focus();
          setActiveMenu(null);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setActiveMenu(null);
        menuItemRefs.current[parentIndex]?.focus();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Cerrar menú móvil cuando cambia la ruta
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileActiveSubmenu(null);
  }, [location.pathname]);

  // Prevenir scroll del body cuando el menú móvil está abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('menu-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('menu-open');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('menu-open');
    };
  }, [mobileMenuOpen]);

  // Detectar scroll para ocultar/mostrar menú en móvil
  useEffect(() => {
    let rafId = null;
    
    const handleScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      
      rafId = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const lastScrollY = lastScrollYRef.current;
        
        // Solo aplicar en móvil (ancho <= 768px)
        if (window.innerWidth <= 768) {
          if (currentScrollY > lastScrollY && currentScrollY > 100) {
            // Scrolling down - ocultar menú
            setIsScrolled(true);
          } else if (currentScrollY < lastScrollY) {
            // Scrolling up - mostrar menú
            setIsScrolled(false);
          }
        } else {
          // En desktop, siempre mostrar
          setIsScrolled(false);
        }
        
        lastScrollYRef.current = currentScrollY;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []); // Sin dependencias para evitar re-renders

  return (
    <>
      {/* Overlay de fondo oscuro */}
      {mobileMenuOpen && (
        <div 
          className="mobile-menu-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      {/* Menú móvil - Overlay superpuesto */}
      <ul className={`mobile-nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
        {menuItems.map((item, index) => (
          <li key={index} className={`mobile-nav-item ${mobileActiveSubmenu === index ? 'active-submenu' : ''}`}>
            {item.hasSubmenu ? (
              <>
                <button
                  className={`mobile-nav-link ${mobileActiveSubmenu === index ? 'active' : ''}`}
                  onClick={(e) => handleMobileSubmenuToggle(index, e)}
                >
                  {item.icon && <item.icon className="mobile-nav-icon" />}
                  <span>{item.label}</span>
                  <span className="mobile-nav-arrow">{mobileActiveSubmenu === index ? <FaChevronUp /> : <FaChevronDown />}</span>
                </button>
                <ul className="mobile-nav-submenu">
                  {item.submenu.map((subItem, subIndex) => (
                    <li key={subIndex}>
                      <Link 
                        to={subItem.path} 
                        onClick={handleSubmenuClick}
                        className="mobile-nav-sublink"
                      >
                        {subItem.icon && <subItem.icon className="mobile-nav-sublink-icon" />}
                        <span>{subItem.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <Link 
                to={item.path} 
                className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                {item.icon && <item.icon className="mobile-nav-icon" />}
                <span>{item.label}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    <header className={`header ${isScrolled ? 'header-hidden' : ''}`} ref={menuRef}>
      <div className="header-top">
        <div className="header-container">
          <Link to="/" className="header-logo">
            <Escudo />
            <div className="header-logo-text">
              <span className="header-logo-title">DIÓCESIS DE IPIALES</span>
              <span className="header-logo-subtitle">En comunión, participación y misión</span>
            </div>
          </Link>
          <nav className="header-nav">
        <div className="nav-container">
          {/* Botón hamburguesa solo para móvil */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
          
          {/* Menú desktop - funciona con hover */}
          <ul className="nav-menu">
            {menuItems.map((item, index) => (
              <li
                key={index}
                className={`nav-item ${item.hasSubmenu ? 'has-submenu' : ''} ${location.pathname === item.path ? 'active' : ''}`}
              >
                <Link 
                  to={item.path} 
                  className="nav-link"
                  ref={el => menuItemRefs.current[index] = el}
                  onKeyDown={(e) => handleKeyDown(e, index, item.hasSubmenu)}
                  onClick={handleNavClick}
                  onFocus={() => setFocusedIndex(index)}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={() => handleMouseLeave(index)}
                >
                  {item.icon && <item.icon className="nav-link-icon" />}
                  <span className="nav-link-text">{item.label}</span>
                  {item.hasSubmenu && <FaChevronDown className="nav-link-arrow" />}
                </Link>
                {item.hasSubmenu && (
                  <ul 
                    className={`dropdown-menu ${activeMenu === index ? 'active' : ''}`}
                    onMouseEnter={() => {
                      if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                        timeoutRef.current = null;
                      }
                      setActiveMenu(index);
                    }}
                    onMouseLeave={() => handleMouseLeave(index)}
                  >
                    {item.submenu.map((subItem, subIndex) => (
                      <li key={subIndex}>
                        <Link 
                          to={subItem.path} 
                          onClick={handleSubmenuClick}
                          className="dropdown-item"
                          {...(subItem.path === '/search-profile' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        >
                          {subItem.icon && <subItem.icon className="dropdown-item-icon" />}
                          <span>{subItem.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

        </div>
          </nav>
          <div className="header-contact">
            <Link to="/busqueda" className="header-search-btn" aria-label="Búsqueda avanzada">
              🔍
            </Link>
            <LanguageSelector />
          </div>
        </div>
      </div>
    </header>
    </>
  );
};

export default Header;


