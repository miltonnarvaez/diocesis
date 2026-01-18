import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="container">
          <h1>Panel de Administración</h1>
          <div className="dashboard-user">
            <span>Bienvenido, {user?.nombre || user?.email}</span>
            <button onClick={logout} className="btn btn-secondary">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="container">
          <div className="dashboard-grid">
            <Link to="/admin/noticias" className="dashboard-card">
              <h2>📰 Noticias</h2>
              <p>Gestionar noticias y publicaciones</p>
            </Link>
            <Link to="/admin/convocatorias" className="dashboard-card">
              <h2>📢 Convocatorias</h2>
              <p>Gestionar convocatorias y anuncios</p>
            </Link>
            <Link to="/admin/actividades" className="dashboard-card">
              <h2>📅 Agenda</h2>
              <p>Gestionar actividades y eventos del calendario</p>
            </Link>
            <Link to="/admin/gaceta" className="dashboard-card">
              <h2>📄 Gaceta</h2>
              <p>Gestionar documentos de gaceta</p>
            </Link>
            <Link to="/admin/transparencia" className="dashboard-card">
              <h2>🔍 Transparencia</h2>
              <p>Gestionar documentos de transparencia</p>
            </Link>
            <Link to="/admin/sesiones" className="dashboard-card">
              <h2>📋 Sesiones</h2>
              <p>Gestionar sesiones del Diócesis</p>
            </Link>
            <Link to="/admin/autoridades" className="dashboard-card">
              <h2>👥 Autoridades</h2>
              <p>Gestionar autoridades del Diócesis</p>
            </Link>
            <Link to="/admin/configuracion" className="dashboard-card">
              <h2>⚙️ Configuración</h2>
              <p>Configuración del sitio</p>
            </Link>
            <Link to="/admin/usuarios" className="dashboard-card">
              <h2>👤 Usuarios</h2>
              <p>Gestionar usuarios y permisos</p>
            </Link>
            <Link to="/admin/pqrsd" className="dashboard-card">
              <h2>📝 PQRSD</h2>
              <p>Gestionar peticiones, quejas, reclamos, sugerencias y denuncias</p>
            </Link>
            <Link to="/admin/galeria" className="dashboard-card">
              <h2>📸 Galería</h2>
              <p>Gestionar fotografías y videos</p>
            </Link>
            <Link to="/admin/encuestas" className="dashboard-card">
              <h2>📊 Encuestas</h2>
              <p>Gestionar encuestas ciudadanas</p>
            </Link>
            <Link to="/admin/historia" className="dashboard-card">
              <h2>📜 Historia</h2>
              <p>Gestionar historia del Diócesis</p>
            </Link>
            <Link to="/admin/tramites" className="dashboard-card">
              <h2>📋 Trámites</h2>
              <p>Gestionar trámites del Diócesis</p>
            </Link>
            <Link to="/admin/opiniones" className="dashboard-card">
              <h2>💬 Opiniones</h2>
              <p>Gestionar opiniones sobre proyectos</p>
            </Link>
            <Link to="/admin/foros" className="dashboard-card">
              <h2>🗣️ Foros</h2>
              <p>Gestionar foros de discusión</p>
            </Link>
            <Link to="/admin/repositorio" className="dashboard-card">
              <h2>📁 Repositorio Temporal</h2>
              <p>Revisar y procesar archivos subidos por el Diócesis</p>
            </Link>
            <Link to="/admin/parroquias" className="dashboard-card">
              <h2>⛪ Parroquias</h2>
              <p>Gestionar parroquias y horarios de misa</p>
            </Link>
            <Link to="/admin/sacramentos" className="dashboard-card">
              <h2>✝️ Sacramentos</h2>
              <p>Gestionar sacramentos y solicitudes</p>
            </Link>
            <Link to="/admin/liturgia" className="dashboard-card">
              <h2>📿 Liturgia</h2>
              <p>Gestionar calendario litúrgico y lecturas</p>
            </Link>
            <Link to="/admin/pastoral" className="dashboard-card">
              <h2>👥 Pastoral</h2>
              <p>Gestionar comisiones, grupos y movimientos pastorales</p>
            </Link>
            <Link to="/admin/formacion" className="dashboard-card">
              <h2>🎓 Formación</h2>
              <p>Gestionar cursos, talleres y programas de formación</p>
            </Link>
            <Link to="/admin/caridad" className="dashboard-card">
              <h2>❤️ Caridad</h2>
              <p>Gestionar proyectos, campañas y voluntariado</p>
            </Link>
            <Link to="/misiones" className="dashboard-card">
              <h2>🌍 Misiones</h2>
              <p>Proyectos misioneros y misioneros</p>
            </Link>
            <Link to="/juventud" className="dashboard-card">
              <h2>👨‍👩‍👧‍👦 Juventud</h2>
              <p>Actividades y grupos juveniles</p>
            </Link>
            <Link to="/familias" className="dashboard-card">
              <h2>🏠 Familias</h2>
              <p>Programas y escuela de padres</p>
            </Link>
            <Link to="/admin/medios" className="dashboard-card">
              <h2>📻 Medios</h2>
              <p>Radio, TV, redes sociales y contenido multimedia</p>
            </Link>
            <Link to="/admin/intenciones-misa" className="dashboard-card">
              <h2>✝️ Intenciones de Misa</h2>
              <p>Gestionar solicitudes de intenciones de misa</p>
            </Link>
            <Link to="/admin/donaciones" className="dashboard-card">
              <h2>💰 Donaciones</h2>
              <p>Gestionar donaciones y diezmos</p>
            </Link>
            <Link to="/admin/oraciones" className="dashboard-card">
              <h2>🙏 Oraciones</h2>
              <p>Gestionar oraciones y devociones</p>
            </Link>
            <Link to="/admin/biblioteca-digital" className="dashboard-card">
              <h2>📚 Biblioteca Digital</h2>
              <p>Gestionar archivo histórico y documentos</p>
            </Link>
            <Link to="/admin/homilias" className="dashboard-card">
              <h2>🎤 Homilías</h2>
              <p>Gestionar archivo de homilías</p>
            </Link>
            <Link to="/admin/testimonios" className="dashboard-card">
              <h2>💝 Testimonios</h2>
              <p>Moderar testimonios de fe</p>
            </Link>
            <Link to="/admin/eventos-especiales" className="dashboard-card">
              <h2>🎉 Eventos Especiales</h2>
              <p>Gestionar retiros y peregrinaciones</p>
            </Link>
            <Link to="/admin/reservas" className="dashboard-card">
              <h2>📅 Reservas</h2>
              <p>Gestionar reservas de espacios</p>
            </Link>
            <Link to="/admin/catequesis" className="dashboard-card">
              <h2>📖 Catequesis</h2>
              <p>Gestionar materiales de formación</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


