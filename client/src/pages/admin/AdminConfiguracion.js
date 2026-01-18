import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './AdminCommon.css';
import './AdminConfiguracion.css';

const AdminConfiguracion = () => {
  const queryClient = useQueryClient();
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');

  const { data: config = {}, isLoading } = useQuery({
    queryKey: ['configuracion'],
    queryFn: async () => {
      const response = await api.get('/configuracion');
      return response.data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ clave, valor }) => {
      const response = await api.put(`/configuracion/${clave}`, { valor });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['configuracion']);
      setEditingKey(null);
      setEditValue('');
      alert('Configuración actualizada exitosamente');
    },
    onError: (error) => {
      alert('Error al actualizar configuración: ' + (error.response?.data?.error || error.message));
    }
  });

  const handleEdit = (clave, valor) => {
    setEditingKey(clave);
    setEditValue(valor || '');
  };

  const handleSave = (clave) => {
    updateMutation.mutate({ clave, valor: editValue });
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValue('');
  };

  const [documentoFile, setDocumentoFile] = useState(null);
  const [documentoTitulo, setDocumentoTitulo] = useState('');
  const [documentoDescripcion, setDocumentoDescripcion] = useState('');

  const configuraciones = [
    {
      clave: 'nombre_diocesis',
      label: 'Nombre de la Diócesis',
      descripcion: 'Nombre oficial del Diócesis de Ipiales'
    },
    {
      clave: 'direccion',
      label: 'Dirección',
      descripcion: 'Dirección física de la diócesis'
    },
    {
      clave: 'telefono',
      label: 'Teléfono',
      descripcion: 'Teléfono de contacto principal'
    },
    {
      clave: 'email',
      label: 'Correo Electrónico',
      descripcion: 'Email de contacto oficial'
    },
    {
      clave: 'horario_atencion',
      label: 'Horario de Atención',
      descripcion: 'Horarios de atención al público'
    },
    {
      clave: 'facebook_url',
      label: 'URL de Facebook',
      descripcion: 'URL de la página de Facebook de la diócesis'
    }
  ];

  // Cargar valores del documento institucional cuando se carga la configuración
  React.useEffect(() => {
    if (config.documento_institucional_titulo) {
      setDocumentoTitulo(config.documento_institucional_titulo);
    }
    if (config.documento_institucional_descripcion) {
      setDocumentoDescripcion(config.documento_institucional_descripcion);
    }
  }, [config]);

  const handleDocumentoSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Subir documento si hay archivo
      if (documentoFile) {
        const formData = new FormData();
        formData.append('documentos', documentoFile);
        await api.put('/configuracion/documento_institucional_url', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // Actualizar título y descripción
      if (documentoTitulo !== config.documento_institucional_titulo) {
        await api.put('/configuracion/documento_institucional_titulo', { valor: documentoTitulo });
      }
      if (documentoDescripcion !== config.documento_institucional_descripcion) {
        await api.put('/configuracion/documento_institucional_descripcion', { valor: documentoDescripcion });
      }

      queryClient.invalidateQueries(['configuracion']);
      setDocumentoFile(null);
      // Limpiar el input de archivo
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      alert('Documento institucional actualizado exitosamente');
    } catch (error) {
      alert('Error al actualizar documento: ' + (error.response?.data?.error || error.message));
    }
  };

  if (isLoading) {
    return <div className="loading">Cargando configuración...</div>;
  }

  return (
    <div className="admin-configuracion">
      <AdminNavbar title="Configuración del Sitio" />
      <div className="admin-content-wrapper">
        <div className="container">
          {/* Sección de Documento Institucional */}
          <div className="config-section documento-institucional-admin">
            <h2>📄 Documento PDF Institucional</h2>
            <p className="section-description">
              Configure el documento PDF destacado que se mostrará en la página "Acerca de la Diócesis". 
              Este documento puede ser el Estatuto, Reglamento Interno, Manual de Funciones u otro documento institucional importante.
            </p>
            
            <form onSubmit={handleDocumentoSubmit} className="documento-form">
              <div className="form-group">
                <label>Título del Documento</label>
                <input
                  type="text"
                  value={documentoTitulo}
                  onChange={(e) => setDocumentoTitulo(e.target.value)}
                  placeholder="Ej: Estatuto del Diócesis de Ipiales"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={documentoDescripcion}
                  onChange={(e) => setDocumentoDescripcion(e.target.value)}
                  placeholder="Descripción breve del documento..."
                  rows="3"
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label>Archivo PDF</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setDocumentoFile(e.target.files[0])}
                  className="form-input"
                />
                {config.documento_institucional_url && (
                  <p className="file-info">
                    Documento actual: <a href={`http://localhost:5000${config.documento_institucional_url}`} target="_blank" rel="noopener noreferrer">
                      Ver documento actual
                    </a>
                  </p>
                )}
                <small>Seleccione un nuevo archivo solo si desea reemplazar el documento actual.</small>
              </div>

              <button type="submit" className="btn btn-primary">
                Guardar Documento Institucional
              </button>
            </form>
          </div>

          <div className="config-list">
            <h2>Configuraciones del Sitio</h2>
            
            <div className="config-items">
              {configuraciones.map((item) => (
                <div key={item.clave} className="config-item">
                  <div className="config-label">
                    <label>{item.label}</label>
                    <p className="config-desc">{item.descripcion}</p>
                  </div>
                  
                  <div className="config-value">
                    {editingKey === item.clave ? (
                      <div className="config-edit">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="config-input"
                          autoFocus
                        />
                        <div className="config-actions">
                          <button
                            onClick={() => handleSave(item.clave)}
                            className="btn btn-sm btn-primary"
                            disabled={updateMutation.isLoading}
                          >
                            Guardar
                          </button>
                          <button
                            onClick={handleCancel}
                            className="btn btn-sm btn-secondary"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="config-display">
                        <span className="config-text">
                          {config[item.clave] || 'No configurado'}
                        </span>
                        <button
                          onClick={() => handleEdit(item.clave, config[item.clave])}
                          className="btn btn-sm btn-edit"
                        >
                          Editar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConfiguracion;
