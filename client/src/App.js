import React, { useState, useRef, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import './styles/dark-mode.css';
import './styles/force-center.css';
import './styles/EMERGENCY-CENTER-FIX.css';
import './styles/ULTIMATE-CENTER-FIX.css';
import './styles/FIX-ACCESO-RAPIDO.css';
import './styles/FIX-CONTACTO.css';
import './styles/FIX-NOTICIAS-HOME.css';
import './styles/FIX-GRUPOS-INTERES.css';
import './styles/FIX-GRUPOS-GRID-LEFT.css';
import './styles/FIX-UBICACION.css';
import './styles/FIX-ESTADISTICAS-SECTION.css';
import './styles/FIX-GACETA.css';
import './styles/FIX-ENLACES-INTERES.css';
import './styles/FIX-ENLACES-GRID-SCROLL.css';
import './styles/FIX-WHITE-OVERLAY.css';
import './styles/FIX-SECTION-TITLES-VISIBILITY.css';
import './styles/FIX-ALL-TITLES-VISIBLE.css';
import './styles/FIX-AGENDA-TITLE-VISIBLE.css';
import './styles/FIX-ALL-PAGES-TITLES-VISIBLE.css';
import './styles/FIX-ALL-PAGES-FIRST-SECTION.css';
import './styles/HeroBanner.css';
import Header from './components/Header';
import Footer from './components/Footer';
import AccessibilityBar from './components/AccessibilityBar';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopOnNavigate from './components/ScrollToTopOnNavigate';
import ScrollToTopButton from './components/ScrollToTopButton';
import ProgressBar from './components/ProgressBar';
import FloatingActionButton from './components/FloatingActionButton';
import SplashScreen from './components/SplashScreen';

// Páginas públicas
import Home from './pages/Home';
import Agenda from './pages/Agenda';
import Acerca from './pages/Acerca';
import Noticias from './pages/Noticias';
import NoticiaDetalle from './pages/NoticiaDetalle';
import Convocatorias from './pages/Convocatorias';
import ConvocatoriaDetalle from './pages/ConvocatoriaDetalle';
import Gaceta from './pages/Gaceta';
import GacetaDetalle from './pages/GacetaDetalle';
import Transparencia from './pages/Transparencia';
import Galeria from './pages/Galeria';
import Encuestas from './pages/Encuestas';
import EncuestaDetalle from './pages/EncuestaDetalle';
import Sesiones from './pages/Sesiones';
import SesionDetalle from './pages/SesionDetalle';
import PQRSD from './pages/PQRSD';
import PQRSDConsulta from './pages/PQRSDConsulta';
import DatosAbiertos from './pages/DatosAbiertos';
import PoliticaPrivacidad from './pages/PoliticaPrivacidad';
import TratamientoDatos from './pages/TratamientoDatos';
import MapaSitio from './pages/MapaSitio';
import Busqueda from './pages/Busqueda';
import SearchProfile from './pages/SearchProfile';
import ProfileDetail from './pages/ProfileDetail';
import Historia from './pages/Historia';
import PlanAccion from './pages/PlanAccion';
import Parroquias from './pages/Parroquias';
import Sacramentos from './pages/Sacramentos';
import Liturgia from './pages/Liturgia';
import Pastoral from './pages/Pastoral';
import Formacion from './pages/Formacion';
import Caridad from './pages/Caridad';
import Misiones from './pages/Misiones';
import Juventud from './pages/Juventud';
import Familias from './pages/Familias';
import Medios from './pages/Medios';

// Páginas de administración
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminNoticias from './pages/admin/AdminNoticias';
import AdminConvocatorias from './pages/admin/AdminConvocatorias';
import AdminGaceta from './pages/admin/AdminGaceta';
import AdminConfiguracion from './pages/admin/AdminConfiguracion';
import AdminTransparencia from './pages/admin/AdminTransparencia';
import AdminSesiones from './pages/admin/AdminSesiones';
import AdminAutoridades from './pages/admin/AdminAutoridades';
import AdminUsuarios from './pages/admin/AdminUsuarios';
import AdminPQRSD from './pages/admin/AdminPQRSD';
import AdminGaleria from './pages/admin/AdminGaleria';
import AdminEncuestas from './pages/admin/AdminEncuestas';
import AdminHistoria from './pages/admin/AdminHistoria';
import AdminTramites from './pages/admin/AdminTramites';
import AdminOpiniones from './pages/admin/AdminOpiniones';
import AdminForos from './pages/admin/AdminForos';
import AdminRepositorio from './pages/admin/AdminRepositorio';
import AdminActividades from './pages/admin/AdminActividades';
import AdminParroquias from './pages/admin/AdminParroquias';
import AdminSacramentos from './pages/admin/AdminSacramentos';
import AdminLiturgia from './pages/admin/AdminLiturgia';
import AdminPastoral from './pages/admin/AdminPastoral';
import AdminFormacion from './pages/admin/AdminFormacion';
import AdminCaridad from './pages/admin/AdminCaridad';
import AdminMisiones from './pages/admin/AdminMisiones';
import AdminJuventud from './pages/admin/AdminJuventud';
import AdminFamilias from './pages/admin/AdminFamilias';
import AdminMedios from './pages/admin/AdminMedios';
import AdminSearchProfile from './pages/admin/AdminSearchProfile';
import AdminIntencionesMisa from './pages/admin/AdminIntencionesMisa';
import AdminDonaciones from './pages/admin/AdminDonaciones';
import AdminOraciones from './pages/admin/AdminOraciones';
import AdminBibliotecaDigital from './pages/admin/AdminBibliotecaDigital';
import AdminHomilias from './pages/admin/AdminHomilias';
import AdminTestimonios from './pages/admin/AdminTestimonios';
import AdminEventosEspeciales from './pages/admin/AdminEventosEspeciales';
import AdminReservas from './pages/admin/AdminReservas';
import AdminCatequesis from './pages/admin/AdminCatequesis';
import RepositorioUpload from './pages/RepositorioUpload';
import Tramites from './pages/Tramites';
import Foros from './pages/Foros';
import ForoDetalle from './pages/ForoDetalle';
import Contacto from './pages/Contacto';
import IntencionesMisa from './pages/IntencionesMisa';
import Donaciones from './pages/Donaciones';
import Oraciones from './pages/Oraciones';
import BibliotecaDigital from './pages/BibliotecaDigital';
import Homilias from './pages/Homilias';
import HomiliaDetalle from './pages/HomiliaDetalle';
import Testimonios from './pages/Testimonios';
import EventosEspeciales from './pages/EventosEspeciales';
import EventoEspecialDetalle from './pages/EventoEspecialDetalle';
import Reservas from './pages/Reservas';
import Catequesis from './pages/Catequesis';

function App() {
  const splashShownRef = useRef(false);
  const [showSplash, setShowSplash] = useState(() => {
    // Solo mostrar splash si nunca se ha mostrado antes (usando localStorage para persistir)
    try {
      if (typeof window !== 'undefined') {
        const splashShown = localStorage.getItem('splashShown');
        return !splashShown; // Solo mostrar si nunca se ha mostrado
      }
    } catch (e) {
      console.error('Error accediendo a localStorage:', e);
    }
    return true; // Mostrar por defecto si no hay localStorage
  });

  const handleSplashFinish = useCallback(() => {
    if (splashShownRef.current) return;
    
    splashShownRef.current = true;
    try {
      if (typeof window !== 'undefined') {
        // Guardar en localStorage para que persista entre sesiones
        localStorage.setItem('splashShown', 'true');
      }
    } catch (e) {
      console.error('Error guardando en localStorage:', e);
    }
    setShowSplash(false);
  }, []);

  return (
    <div className="App">
      {showSplash && <SplashScreen key="splash" onFinish={handleSplashFinish} />}
      <ProgressBar />
      <ScrollToTopOnNavigate />
      <AccessibilityBar />
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/acerca" element={<Acerca />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/noticias/:id" element={<NoticiaDetalle />} />
          <Route path="/convocatorias" element={<Convocatorias />} />
          <Route path="/convocatorias/:id" element={<ConvocatoriaDetalle />} />
          <Route path="/gaceta" element={<Gaceta />} />
          <Route path="/gaceta/:id" element={<GacetaDetalle />} />
          <Route path="/transparencia" element={<Transparencia />} />
          <Route path="/galeria" element={<Galeria />} />
          <Route path="/encuestas" element={<Encuestas />} />
          <Route path="/encuestas/:id" element={<EncuestaDetalle />} />
          <Route path="/encuestas/:id/resultados" element={<EncuestaDetalle />} />
          <Route path="/sesiones" element={<Sesiones />} />
          <Route path="/sesiones/:id" element={<SesionDetalle />} />
          <Route path="/foros" element={<Foros />} />
          <Route path="/foros/:id" element={<ForoDetalle />} />
          <Route path="/pqrsd" element={<PQRSD />} />
          <Route path="/pqrsd/consulta/:numeroRadicado?" element={<PQRSDConsulta />} />
          <Route path="/datos-abiertos" element={<DatosAbiertos />} />
          <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
          <Route path="/tratamiento-datos" element={<TratamientoDatos />} />
          <Route path="/mapa-sitio" element={<MapaSitio />} />
          <Route path="/busqueda" element={<Busqueda />} />
          <Route path="/search-profile" element={<SearchProfile />} />
          <Route path="/qr/:id" element={<ProfileDetail />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/historia" element={<Historia />} />
          <Route path="/plan-accion" element={<PlanAccion />} />
          <Route path="/parroquias" element={<Parroquias />} />
          <Route path="/sacramentos" element={<Sacramentos />} />
          <Route path="/liturgia" element={<Liturgia />} />
          <Route path="/pastoral" element={<Pastoral />} />
          <Route path="/formacion" element={<Formacion />} />
          <Route path="/caridad" element={<Caridad />} />
          <Route path="/misiones" element={<Misiones />} />
          <Route path="/juventud" element={<Juventud />} />
          <Route path="/familias" element={<Familias />} />
          <Route path="/medios" element={<Medios />} />
          <Route path="/repositorio-upload" element={<RepositorioUpload />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/intenciones-misa" element={<IntencionesMisa />} />
          <Route path="/donaciones" element={<Donaciones />} />
          <Route path="/oraciones" element={<Oraciones />} />
          <Route path="/biblioteca-digital" element={<BibliotecaDigital />} />
          <Route path="/homilias" element={<Homilias />} />
          <Route path="/homilias/:id" element={<HomiliaDetalle />} />
          <Route path="/testimonios" element={<Testimonios />} />
          <Route path="/eventos-especiales" element={<EventosEspeciales />} />
          <Route path="/eventos-especiales/:id" element={<EventoEspecialDetalle />} />
          <Route path="/reservas" element={<Reservas />} />
          <Route path="/catequesis" element={<Catequesis />} />
          <Route path="/catequesis/:id" element={<Catequesis />} />
          
          {/* Rutas de administración */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/noticias"
            element={
              <ProtectedRoute>
                <AdminNoticias />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/convocatorias"
            element={
              <ProtectedRoute>
                <AdminConvocatorias />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/gaceta"
            element={
              <ProtectedRoute>
                <AdminGaceta />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/transparencia"
            element={
              <ProtectedRoute>
                <AdminTransparencia />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/sesiones"
            element={
              <ProtectedRoute>
                <AdminSesiones />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/autoridades"
            element={
              <ProtectedRoute>
                <AdminAutoridades />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/configuracion"
            element={
              <ProtectedRoute>
                <AdminConfiguracion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/usuarios"
            element={
              <ProtectedRoute>
                <AdminUsuarios />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pqrsd"
            element={
              <ProtectedRoute>
                <AdminPQRSD />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/galeria"
            element={
              <ProtectedRoute>
                <AdminGaleria />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/encuestas"
            element={
              <ProtectedRoute>
                <AdminEncuestas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/historia"
            element={
              <ProtectedRoute>
                <AdminHistoria />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tramites"
            element={
              <ProtectedRoute>
                <AdminTramites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/opiniones"
            element={
              <ProtectedRoute>
                <AdminOpiniones />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/foros"
            element={
              <ProtectedRoute>
                <AdminForos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/repositorio"
            element={<AdminRepositorio />}
          />
          <Route
            path="/admin/actividades"
            element={
              <ProtectedRoute>
                <AdminActividades />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/parroquias"
            element={
              <ProtectedRoute>
                <AdminParroquias />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/sacramentos"
            element={
              <ProtectedRoute>
                <AdminSacramentos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/liturgia"
            element={
              <ProtectedRoute>
                <AdminLiturgia />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pastoral"
            element={
              <ProtectedRoute>
                <AdminPastoral />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/formacion"
            element={
              <ProtectedRoute>
                <AdminFormacion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/caridad"
            element={
              <ProtectedRoute>
                <AdminCaridad />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/misiones"
            element={
              <ProtectedRoute>
                <AdminMisiones />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/juventud"
            element={
              <ProtectedRoute>
                <AdminJuventud />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/familias"
            element={
              <ProtectedRoute>
                <AdminFamilias />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/medios"
            element={
              <ProtectedRoute>
                <AdminMedios />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/search-profile"
            element={
              <ProtectedRoute>
                <AdminSearchProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/intenciones-misa"
            element={
              <ProtectedRoute>
                <AdminIntencionesMisa />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/donaciones"
            element={
              <ProtectedRoute>
                <AdminDonaciones />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/oraciones"
            element={
              <ProtectedRoute>
                <AdminOraciones />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/biblioteca-digital"
            element={
              <ProtectedRoute>
                <AdminBibliotecaDigital />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/homilias"
            element={
              <ProtectedRoute>
                <AdminHomilias />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/testimonios"
            element={
              <ProtectedRoute>
                <AdminTestimonios />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/eventos-especiales"
            element={
              <ProtectedRoute>
                <AdminEventosEspeciales />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reservas"
            element={
              <ProtectedRoute>
                <AdminReservas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/catequesis"
            element={
              <ProtectedRoute>
                <AdminCatequesis />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
      <ScrollToTop />
      <ScrollToTopButton />
      <FloatingActionButton />
    </div>
  );
}

export default App;


