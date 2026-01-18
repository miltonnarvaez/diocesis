import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { FaDollarSign, FaHandHoldingHeart, FaCheckCircle } from 'react-icons/fa';
import './Donaciones.css';

const Donaciones = () => {
  const [formData, setFormData] = useState({
    donante_nombre: '',
    donante_email: '',
    donante_telefono: '',
    donante_documento: '',
    monto: '',
    tipo_donacion: 'donacion_unica',
    destino: '',
    metodo_pago: 'transferencia',
    observaciones: ''
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const montosSugeridos = [25000, 50000, 100000, 200000, 500000];

  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/donaciones', data);
      return response.data;
    },
    onSuccess: () => {
      setShowSuccess(true);
      setFormData({
        donante_nombre: '',
        donante_email: '',
        donante_telefono: '',
        donante_documento: '',
        monto: '',
        tipo_donacion: 'donacion_unica',
        destino: '',
        metodo_pago: 'transferencia',
        observaciones: ''
      });
      setTimeout(() => setShowSuccess(false), 5000);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      monto: parseFloat(formData.monto)
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMontoClick = (monto) => {
    setFormData({ ...formData, monto: monto.toString() });
  };

  return (
    <div className="donaciones-page">
      <div className="container">
        <div className="page-header">
          <h1><FaHandHoldingHeart /> Donaciones y Diezmo</h1>
          <p>Tu generosidad ayuda a sostener la labor evangelizadora de nuestra Diócesis</p>
        </div>

        {showSuccess && (
          <div className="alert alert-success">
            <FaCheckCircle /> Tu donación ha sido registrada exitosamente. Te enviaremos un recibo por email.
          </div>
        )}

        <div className="donaciones-content">
          <div className="donaciones-info">
            <h2>¿Por qué donar?</h2>
            <ul>
              <li>Apoyas la labor evangelizadora de la Diócesis</li>
              <li>Contribuyes al sostenimiento del Seminario</li>
              <li>Ayudas a las obras sociales y de caridad</li>
              <li>Participas en el mantenimiento de templos y parroquias</li>
            </ul>

            <h3>Destinos de tu donación:</h3>
            <ul>
              <li><strong>Diezmo:</strong> Sostenimiento general de la Diócesis</li>
              <li><strong>Obras Sociales:</strong> Programas de caridad y ayuda</li>
              <li><strong>Seminario:</strong> Formación de futuros sacerdotes</li>
              <li><strong>Mantenimiento:</strong> Conservación de templos y parroquias</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="donacion-form">
            <h2>Formulario de Donación</h2>

            <div className="form-group">
              <label>Nombre Completo *</label>
              <input
                type="text"
                name="donante_nombre"
                value={formData.donante_nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="donante_email"
                  value={formData.donante_email}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  name="donante_telefono"
                  value={formData.donante_telefono}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Tipo de Donación *</label>
              <select
                name="tipo_donacion"
                value={formData.tipo_donacion}
                onChange={handleChange}
                required
              >
                <option value="donacion_unica">Donación Única</option>
                <option value="diezmo">Diezmo</option>
                <option value="donacion_recurrente">Donación Recurrente</option>
                <option value="obra_social">Obra Social</option>
                <option value="seminario">Seminario</option>
                <option value="mantenimiento">Mantenimiento</option>
              </select>
            </div>

            <div className="form-group">
              <label>Destino</label>
              <input
                type="text"
                name="destino"
                value={formData.destino}
                onChange={handleChange}
                placeholder="Especifica el destino de tu donación (opcional)"
              />
            </div>

            <div className="form-group">
              <label>Monto *</label>
              <input
                type="number"
                name="monto"
                value={formData.monto}
                onChange={handleChange}
                min="0"
                step="1000"
                required
                placeholder="Ingresa el monto"
              />
              <div className="montos-sugeridos">
                <span>Montos sugeridos:</span>
                {montosSugeridos.map(monto => (
                  <button
                    key={monto}
                    type="button"
                    className="btn-monto"
                    onClick={() => handleMontoClick(monto)}
                  >
                    ${monto.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Método de Pago *</label>
              <select
                name="metodo_pago"
                value={formData.metodo_pago}
                onChange={handleChange}
                required
              >
                <option value="transferencia">Transferencia Bancaria</option>
                <option value="efectivo">Efectivo</option>
                <option value="cheque">Cheque</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div className="form-group">
              <label>Observaciones</label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                rows="3"
                placeholder="Información adicional sobre tu donación"
              />
            </div>

            <div className="info-pago">
              <h4>Información para Transferencia:</h4>
              <p><strong>Banco:</strong> Banco de Occidente</p>
              <p><strong>Cuenta:</strong> 1234567890</p>
              <p><strong>Tipo:</strong> Ahorros</p>
              <p><strong>Titular:</strong> Diócesis de Ipiales</p>
            </div>

            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Procesando...' : 'Registrar Donación'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Donaciones;
