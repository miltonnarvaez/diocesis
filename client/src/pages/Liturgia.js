import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';
import { FaCalendarAlt, FaBook, FaClock, FaPrayingHands } from 'react-icons/fa';
import './Liturgia.css';

const Liturgia = () => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().toISOString().substring(0, 7));

  const { data: calendarioHoy, isLoading: loadingHoy } = useQuery({
    queryKey: ['liturgia-calendario', fechaSeleccionada],
    queryFn: async () => {
      const response = await api.get('/liturgia/calendario', {
        params: { fecha: fechaSeleccionada }
      });
      return response.data;
    }
  });

  const inicioMes = new Date(mesSeleccionado + '-01').toISOString().split('T')[0];
  const finMes = new Date(new Date(mesSeleccionado + '-01').getFullYear(), new Date(mesSeleccionado + '-01').getMonth() + 1, 0).toISOString().split('T')[0];

  const { data: calendarioMes = [], isLoading: loadingMes } = useQuery({
    queryKey: ['liturgia-calendario-rango', inicioMes, finMes],
    queryFn: async () => {
      const response = await api.get('/liturgia/calendario/rango', {
        params: { inicio: inicioMes, fin: finMes }
      });
      return response.data;
    }
  });

  const { data: horarios = [], isLoading: loadingHorarios } = useQuery({
    queryKey: ['liturgia-horarios'],
    queryFn: async () => {
      const response = await api.get('/liturgia/horarios');
      return response.data;
    }
  });

  const getColorClass = (color) => {
    const colores = {
      'blanco': 'color-blanco',
      'verde': 'color-verde',
      'morado': 'color-morado',
      'rojo': 'color-rojo',
      'rosa': 'color-rosa',
      'dorado': 'color-dorado'
    };
    return colores[color?.toLowerCase()] || 'color-default';
  };

  return (
    <div className="liturgia-page">
      <Breadcrumbs />
      <div className="container">
        <div className="page-header">
          <h1><FaPrayingHands /> Calendario Litúrgico</h1>
          <p>Encuentra las lecturas, reflexiones y horarios litúrgicos</p>
        </div>

        <div className="liturgia-content">
          <div className="liturgia-main">
            <div className="calendario-section">
              <h2><FaCalendarAlt /> Calendario del Día</h2>
              <div className="fecha-selector">
                <input
                  type="date"
                  value={fechaSeleccionada}
                  onChange={(e) => setFechaSeleccionada(e.target.value)}
                  className="date-input"
                />
              </div>

              {loadingHoy ? (
                <div className="loading">Cargando calendario...</div>
              ) : calendarioHoy ? (
                <div className={`calendario-card ${getColorClass(calendarioHoy.color_liturgico)}`}>
                  <div className="calendario-header">
                    <h3>{new Date(fechaSeleccionada).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                    {calendarioHoy.tiempo_liturgico && (
                      <span className="tiempo-liturgico">{calendarioHoy.tiempo_liturgico}</span>
                    )}
                    {calendarioHoy.color_liturgico && (
                      <span className={`color-badge ${getColorClass(calendarioHoy.color_liturgico)}`}>
                        {calendarioHoy.color_liturgico}
                      </span>
                    )}
                  </div>

                  {(calendarioHoy.solemnidad || calendarioHoy.fiesta || calendarioHoy.memoria) && (
                    <div className="celebracion">
                      {calendarioHoy.solemnidad && <div className="solemnidad">Solemnidad: {calendarioHoy.solemnidad}</div>}
                      {calendarioHoy.fiesta && <div className="fiesta">Fiesta: {calendarioHoy.fiesta}</div>}
                      {calendarioHoy.memoria && <div className="memoria">Memoria: {calendarioHoy.memoria}</div>}
                    </div>
                  )}

                  <div className="lecturas">
                    <h4><FaBook /> Lecturas del Día</h4>
                    {calendarioHoy.lectura_primera && (
                      <div className="lectura">
                        <strong>Primera Lectura:</strong>
                        <p>{calendarioHoy.lectura_primera}</p>
                      </div>
                    )}
                    {calendarioHoy.salmo && (
                      <div className="lectura">
                        <strong>Salmo:</strong>
                        <p>{calendarioHoy.salmo}</p>
                      </div>
                    )}
                    {calendarioHoy.lectura_segunda && (
                      <div className="lectura">
                        <strong>Segunda Lectura:</strong>
                        <p>{calendarioHoy.lectura_segunda}</p>
                      </div>
                    )}
                    {calendarioHoy.evangelio && (
                      <div className="lectura">
                        <strong>Evangelio:</strong>
                        <p>{calendarioHoy.evangelio}</p>
                      </div>
                    )}
                  </div>

                  {calendarioHoy.reflexion && (
                    <div className="reflexion">
                      <h4>Reflexión</h4>
                      <p>{calendarioHoy.reflexion}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-data">No hay información litúrgica para esta fecha</div>
              )}
            </div>

            <div className="calendario-mes-section">
              <h2>Calendario del Mes</h2>
              <div className="mes-selector">
                <input
                  type="month"
                  value={mesSeleccionado}
                  onChange={(e) => setMesSeleccionado(e.target.value)}
                  className="month-input"
                />
              </div>

              {loadingMes ? (
                <div className="loading">Cargando calendario del mes...</div>
              ) : calendarioMes.length > 0 ? (
                <div className="calendario-mes-grid">
                  {calendarioMes.map((dia) => (
                    <div key={dia.fecha} className={`calendario-dia-card ${getColorClass(dia.color_liturgico)}`}>
                      <div className="dia-fecha">
                        {new Date(dia.fecha).getDate()}
                      </div>
                      <div className="dia-info">
                        {dia.solemnidad && <div className="dia-solemnidad">{dia.solemnidad}</div>}
                        {dia.fiesta && !dia.solemnidad && <div className="dia-fiesta">{dia.fiesta}</div>}
                        {dia.memoria && !dia.fiesta && !dia.solemnidad && <div className="dia-memoria">{dia.memoria}</div>}
                        {dia.tiempo_liturgico && <div className="dia-tiempo">{dia.tiempo_liturgico}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">No hay información litúrgica para este mes</div>
              )}
            </div>
          </div>

          <div className="liturgia-sidebar">
            <div className="horarios-section">
              <h2><FaClock /> Horarios Litúrgicos</h2>
              {loadingHorarios ? (
                <div className="loading">Cargando horarios...</div>
              ) : horarios.length > 0 ? (
                <div className="horarios-list">
                  {horarios.map((horario, index) => (
                    <div key={index} className="horario-item">
                      <div className="horario-dia">{horario.dia_semana}</div>
                      <div className="horario-hora">{horario.hora}</div>
                      {horario.tipo_misa && <div className="horario-tipo">{horario.tipo_misa}</div>}
                      {horario.lugar && <div className="horario-lugar">{horario.lugar}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">No hay horarios disponibles</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Liturgia;












