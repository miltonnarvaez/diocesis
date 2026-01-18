import React from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import './TratamientoDatos.css';

const TratamientoDatos = () => {
  return (
    <div className="tratamiento-page">
      <Breadcrumbs />
      <section className="section">
        <div className="container">
          <h1 className="page-title">Política de Tratamiento de Datos Personales</h1>
          
          <div className="tratamiento-content">
            <p className="fecha-actualizacion">
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-CO')}
            </p>

            <section>
              <h2>1. Responsable del Tratamiento</h2>
              <p>
                <strong>Diócesis de Ipiales, Nariño</strong><br />
                NIT: [NIT del Diócesis]<br />
                Dirección: Calle Principal, Ipiales, Nariño<br />
                Teléfono: +57 (2) XXX-XXXX<br />
                Correo: contacto@diocesisdeipiales.org
              </p>
            </section>

            <section>
              <h2>2. Finalidad del Tratamiento</h2>
              <p>Los datos personales serán tratados para las siguientes finalidades:</p>
              <ul>
                <li>Gestionar y responder solicitudes de información pública</li>
                <li>Procesar PQRSD (Peticiones, Quejas, Reclamos, Sugerencias y Denuncias)</li>
                <li>Enviar comunicaciones relacionadas con servicios institucionales</li>
                <li>Cumplir con obligaciones legales y normativas</li>
                <li>Generar estadísticas y reportes institucionales</li>
              </ul>
            </section>

            <section>
              <h2>3. Datos Personales Tratados</h2>
              <p>Tratamos los siguientes datos personales:</p>
              <ul>
                <li><strong>Datos de identificación:</strong> Nombre completo, número de documento de identidad</li>
                <li><strong>Datos de contacto:</strong> Correo electrónico, teléfono, dirección</li>
                <li><strong>Datos de navegación:</strong> Dirección IP, tipo de navegador, páginas visitadas</li>
                <li><strong>Datos de solicitudes:</strong> Información contenida en formularios PQRSD</li>
              </ul>
            </section>

            <section>
              <h2>4. Autorización</h2>
              <p>
                Al utilizar este portal y proporcionar sus datos personales, usted autoriza al Diócesis de Ipiales 
                de Ipiales para el tratamiento de sus datos personales de acuerdo con esta política.
              </p>
            </section>

            <section>
              <h2>5. Derechos del Titular</h2>
              <p>De acuerdo con la Ley 1581 de 2012, usted tiene derecho a:</p>
              <ul>
                <li><strong>Conocer:</strong> Acceder a sus datos personales</li>
                <li><strong>Actualizar:</strong> Rectificar datos inexactos o incompletos</li>
                <li><strong>Suprimir:</strong> Solicitar la eliminación de sus datos cuando no sean necesarios</li>
                <li><strong>Revocar:</strong> Retirar la autorización para el tratamiento</li>
                <li><strong>Solicitar prueba:</strong> Obtener copia de la autorización otorgada</li>
                <li><strong>Presentar quejas:</strong> Ante la Superintendencia de Industria y Comercio</li>
              </ul>
            </section>

            <section>
              <h2>6. Procedimiento para Ejercer Derechos</h2>
              <p>
                Para ejercer sus derechos, puede enviar una solicitud escrita al correo electrónico 
                <strong> contacto@diocesisdeipiales.org</strong> o presentarla físicamente en nuestras oficinas.
              </p>
            </section>

            <section>
              <h2>7. Medidas de Seguridad</h2>
              <p>
                Implementamos medidas técnicas y organizativas para proteger sus datos personales, incluyendo:
              </p>
              <ul>
                <li>Encriptación de datos sensibles</li>
                <li>Control de acceso a la información</li>
                <li>Copias de seguridad regulares</li>
                <li>Capacitación del personal</li>
              </ul>
            </section>

            <section>
              <h2>8. Vigencia</h2>
              <p>
                Esta política estará vigente mientras el Diócesis de Ipiales mantenga activo su portal web 
                y realizará actualizaciones cuando sea necesario, notificando los cambios a través del portal.
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TratamientoDatos;

















