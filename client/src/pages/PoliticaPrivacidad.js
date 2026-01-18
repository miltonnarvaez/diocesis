import React from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import './PoliticaPrivacidad.css';

const PoliticaPrivacidad = () => {
  return (
    <div className="politica-page">
      <Breadcrumbs />
      <section className="section">
        <div className="container">
          <h1 className="page-title">Política de Privacidad</h1>
          
          <div className="politica-content">
            <p className="fecha-actualizacion">
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-CO')}
            </p>

            <section>
              <h2>1. Información General</h2>
              <p>
                El Diócesis de Ipiales, Nariño, en cumplimiento de la <strong>Ley 1712 de 2014</strong> 
                (Ley de Transparencia y del Derecho de Acceso a la Información Pública Nacional) y la 
                <strong> Ley 1581 de 2012</strong> (Ley de Protección de Datos Personales), se compromete a proteger 
                la privacidad de los usuarios de su portal web.
              </p>
            </section>

            <section>
              <h2>2. Datos que Recopilamos</h2>
              <p>Recopilamos la siguiente información:</p>
              <ul>
                <li>Datos de identificación (nombre, documento de identidad)</li>
                <li>Datos de contacto (correo electrónico, teléfono)</li>
                <li>Información de navegación (dirección IP, tipo de navegador)</li>
                <li>Información proporcionada en formularios PQRSD</li>
              </ul>
            </section>

            <section>
              <h2>3. Uso de la Información</h2>
              <p>La información recopilada se utiliza para:</p>
              <ul>
                <li>Responder a solicitudes de información pública</li>
                <li>Gestionar PQRSD (Peticiones, Quejas, Reclamos, Sugerencias y Denuncias)</li>
                <li>Mejorar los servicios del portal</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>
            </section>

            <section>
              <h2>4. Protección de Datos</h2>
              <p>
                Implementamos medidas técnicas y organizativas para proteger sus datos personales contra 
                acceso no autorizado, pérdida o destrucción.
              </p>
            </section>

            <section>
              <h2>5. Derechos del Usuario</h2>
              <p>Usted tiene derecho a:</p>
              <ul>
                <li>Conocer, actualizar y rectificar sus datos personales</li>
                <li>Solicitar prueba de la autorización otorgada</li>
                <li>Revocar la autorización y/o solicitar la supresión del dato</li>
                <li>Acceder de forma gratuita a sus datos personales</li>
              </ul>
            </section>

            <section>
              <h2>6. Contacto</h2>
              <p>
                Para ejercer sus derechos o realizar consultas sobre el tratamiento de datos personales, 
                puede contactarnos en:
              </p>
              <p>
                <strong>Correo:</strong> contacto@diocesisdeipiales.org<br />
                <strong>Teléfono:</strong> +57 (2) XXX-XXXX<br />
                <strong>Dirección:</strong> Calle Principal, Ipiales, Nariño
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PoliticaPrivacidad;

















