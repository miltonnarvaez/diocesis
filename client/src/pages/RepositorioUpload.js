import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { 
  FaUpload, 
  FaFolder, 
  FaFileAlt, 
  FaCheckCircle, 
  FaTimes, 
  FaSpinner,
  FaInfoCircle,
  FaCloudUploadAlt,
  FaFolderOpen,
  FaImage,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaTrash
} from 'react-icons/fa';
import './RepositorioUpload.css';

const RepositorioUpload = () => {
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [archivos, setArchivos] = useState([]);
  const [archivosSubidos, setArchivosSubidos] = useState([]);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [dragActive, setDragActive] = useState(false);
  const [vista, setVista] = useState('carpetas'); // 'carpetas' o 'subir'
  const [cargandoCategorias, setCargandoCategorias] = useState(true);
  const [notaArchivo, setNotaArchivo] = useState(''); // Nota opcional para el archivo
  const [mostrarNota, setMostrarNota] = useState(false); // Toggle para mostrar/ocultar campo de nota
  const timeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  // Cargar categorías disponibles
  useEffect(() => {
    isMountedRef.current = true;
    
    const loadCategorias = async () => {
      try {
        setCargandoCategorias(true);
        console.log('🔄 Cargando categorías desde:', '/repositorio/categorias');
        const response = await api.get('/repositorio/categorias');
        console.log('✅ Categorías recibidas:', response.data);
        
        if (!isMountedRef.current) return;
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          setCategorias(response.data);
        } else {
          console.warn('⚠️ Respuesta vacía o inválida, usando categorías por defecto');
          // Las categorías se cargan desde el servidor, este es solo un fallback
          setCategorias([]);
        }
        
        // Limpiar timeout si carga exitosamente
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      } catch (error) {
        console.error('❌ Error cargando categorías:', error);
        console.error('Detalles:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url
        });
        
        if (!isMountedRef.current) return;
        
        setMensaje({ 
          tipo: 'error', 
          texto: `Error cargando categorías: ${error.response?.data?.error || error.message || 'Error de conexión. Verifica que el servidor esté corriendo en http://localhost:5000'}` 
        });
        
        // Establecer categorías por defecto si falla la carga
        setCategorias([
          { id: 'acerca-de', nombre: 'Acerca del Diócesis', cantidadArchivos: 0 },
          { id: 'miembros', nombre: 'Miembros del Diócesis', cantidadArchivos: 0 },
          { id: 'historia', nombre: 'Historia', cantidadArchivos: 0 },
          { id: 'gaceta', nombre: 'Gaceta', cantidadArchivos: 0 },
          { id: 'sesiones', nombre: 'Sesiones', cantidadArchivos: 0 },
          { id: 'transparencia', nombre: 'Transparencia', cantidadArchivos: 0 },
          { id: 'documentos-oficiales', nombre: 'Documentos Oficiales', cantidadArchivos: 0 },
          { id: 'documentos-generales', nombre: 'Documentos Generales', cantidadArchivos: 0 }
        ]);
      } finally {
        if (isMountedRef.current) {
          setCargandoCategorias(false);
        }
      }
    };
    
    loadCategorias();
    
    // Timeout de seguridad - si después de 8 segundos no carga, mostrar error
    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        console.error('⏱️ Timeout cargando categorías después de 8 segundos');
        setCargandoCategorias(false);
        setMensaje({ 
          tipo: 'error', 
          texto: 'Tiempo de espera agotado. Verifica que el servidor esté corriendo en http://localhost:5000' 
        });
        // Establecer categorías por defecto
        setCategorias([
          { id: 'acerca-de', nombre: 'Acerca del Diócesis', cantidadArchivos: 0 },
          { id: 'miembros', nombre: 'Miembros del Diócesis', cantidadArchivos: 0 },
          { id: 'historia', nombre: 'Historia', cantidadArchivos: 0 },
          { id: 'gaceta', nombre: 'Gaceta', cantidadArchivos: 0 },
          { id: 'sesiones', nombre: 'Sesiones', cantidadArchivos: 0 },
          { id: 'transparencia', nombre: 'Transparencia', cantidadArchivos: 0 },
          { id: 'documentos-oficiales', nombre: 'Documentos Oficiales', cantidadArchivos: 0 },
          { id: 'documentos-generales', nombre: 'Documentos Generales', cantidadArchivos: 0 }
        ]);
      }
    }, 8000); // 8 segundos
    
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);


  // Cargar archivos de la categoría seleccionada (sin autenticación)
  const { data: datosArchivos, refetch: refetchArchivos } = useQuery({
    queryKey: ['repositorio-archivos-publico', categoriaSeleccionada],
    queryFn: async () => {
      if (!categoriaSeleccionada) return null;
      // Usar endpoint público
      try {
        const response = await api.get(`/repositorio/listar/${categoriaSeleccionada}`);
        return response.data;
      } catch (error) {
        console.error('Error cargando archivos:', error);
        return null;
      }
    },
    enabled: !!categoriaSeleccionada && vista === 'carpetas'
  });

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      setArchivos(filesArray);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setArchivos(filesArray);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (archivos.length === 0) {
      setMensaje({ tipo: 'error', texto: 'Por favor selecciona al menos un archivo' });
      return;
    }

    if (!categoriaSeleccionada) {
      setMensaje({ tipo: 'error', texto: 'Por favor selecciona una carpeta de destino' });
      return;
    }

    setSubiendo(true);
    setMensaje({ tipo: '', texto: '' });
    setArchivosSubidos([]);

    try {
      const formData = new FormData();
      formData.append('categoria', categoriaSeleccionada);
      
      // Agregar nota si existe
      if (notaArchivo.trim()) {
        formData.append('nota', notaArchivo.trim());
      }
      
      if (archivos.length === 1) {
        formData.append('archivo', archivos[0]);
      } else {
        archivos.forEach((archivo) => {
          formData.append('archivos', archivo);
        });
      }

      const endpoint = archivos.length === 1 
        ? '/repositorio/upload' 
        : '/repositorio/upload-multiple';

      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setArchivosSubidos(response.data.archivos || [response.data.archivo]);
      setMensaje({ 
        tipo: 'exito', 
        texto: response.data.mensaje || 'Archivo(s) subido(s) exitosamente al repositorio' 
      });
      setArchivos([]);
      setNotaArchivo(''); // Limpiar nota
      setMostrarNota(false); // Ocultar campo de nota
      
      // Limpiar el input
      const fileInput = document.getElementById('archivos');
      if (fileInput) fileInput.value = '';
      
      // Recargar categorías para actualizar contadores
      try {
        const categoriasResponse = await api.get('/repositorio/categorias');
        if (categoriasResponse.data && Array.isArray(categoriasResponse.data)) {
          setCategorias(categoriasResponse.data);
        }
      } catch (error) {
        console.error('Error recargando categorías:', error);
      }
      
      // Si hay una categoría seleccionada, recargar archivos
      if (categoriaSeleccionada) {
        refetchArchivos();
      }
      
      // Si estamos en la vista de "subir", cambiar a "carpetas" y mostrar la carpeta donde se subió
      if (vista === 'subir' && categoriaSeleccionada) {
        setVista('carpetas');
      }
    } catch (error) {
      console.error('Error subiendo archivos:', error);
      setMensaje({ 
        tipo: 'error', 
        texto: error.response?.data?.error || 'Error subiendo archivos. Por favor intenta de nuevo.' 
      });
    } finally {
      setSubiendo(false);
    }
  };

  const formatearTamaño = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const obtenerIconoArchivo = (extension) => {
    const ext = extension?.toLowerCase() || '';
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) return <FaImage className="file-type-icon" />;
    if (ext === '.pdf') return <FaFilePdf className="file-type-icon pdf" />;
    if (['.doc', '.docx'].includes(ext)) return <FaFileWord className="file-type-icon word" />;
    if (['.xls', '.xlsx', '.csv'].includes(ext)) return <FaFileExcel className="file-type-icon excel" />;
    if (['.ppt', '.pptx'].includes(ext)) return <FaFilePowerpoint className="file-type-icon powerpoint" />;
    return <FaFileAlt className="file-type-icon" />;
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Función para eliminar un archivo
  const handleEliminar = async (categoria, nombreArchivo) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${nombreArchivo}"?`)) {
      return;
    }

    try {
      await api.delete(`/repositorio/eliminar/${categoria}/${encodeURIComponent(nombreArchivo)}`);
      setMensaje({ 
        tipo: 'exito', 
        texto: 'Archivo eliminado exitosamente' 
      });
      
      // Recargar archivos
      if (categoriaSeleccionada && vista === 'carpetas') {
        refetchArchivos();
      }
      
      // Recargar categorías para actualizar contadores
      const response = await api.get('/repositorio/categorias');
      if (response.data && Array.isArray(response.data)) {
        setCategorias(response.data);
      }
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      setMensaje({ 
        tipo: 'error', 
        texto: error.response?.data?.error || 'Error eliminando archivo. Por favor intenta de nuevo.' 
      });
    }
  };

  return (
    <div className="drive-repositorio-page">
      <div className="drive-container">
        {/* Header tipo Drive */}
        <div className="drive-header">
          <div className="drive-header-top">
            <div className="drive-logo">
              <FaCloudUploadAlt className="logo-icon" />
              <h1>Repositorio de Archivos</h1>
            </div>
            <div className="drive-actions">
              <button 
                className={`drive-tab ${vista === 'carpetas' ? 'active' : ''}`}
                onClick={() => {
                  setVista('carpetas');
                  setCategoriaSeleccionada(null);
                }}
              >
                <FaFolderOpen /> Carpetas
              </button>
              <button 
                className={`drive-tab ${vista === 'subir' ? 'active' : ''}`}
                onClick={() => setVista('subir')}
              >
                <FaCloudUploadAlt /> Subir Archivos
              </button>
            </div>
          </div>
          <div className="drive-header-info">
            <FaInfoCircle />
            <p>
              Este es un <strong>repositorio temporal</strong>. Los archivos que subas aquí serán revisados 
              y organizados por el administrador antes de ser publicados en la página web.
            </p>
          </div>
        </div>

        {/* Vista de Carpetas */}
        {vista === 'carpetas' && (
          <div className="drive-content">
            {cargandoCategorias ? (
              <div className="drive-loading">
                <FaSpinner className="spinner" />
                <p>Cargando carpetas...</p>
              </div>
            ) : !categoriaSeleccionada ? (
              categorias.length > 0 ? (
                <div className="drive-folders-grid">
                  {categorias.map((cat) => (
                    <div 
                      key={cat.id} 
                      className="drive-folder-card"
                      onClick={() => setCategoriaSeleccionada(cat.id)}
                    >
                      <FaFolder className="folder-icon" />
                      <h3>{cat.nombre}</h3>
                      <p>{cat.cantidadArchivos || 0} archivo(s)</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="drive-empty">
                  <FaInfoCircle className="empty-icon" />
                  <p>No se pudieron cargar las carpetas. Por favor recarga la página.</p>
                </div>
              )
            ) : (
              <>
                <div className="drive-breadcrumb">
                  <button onClick={() => setCategoriaSeleccionada(null)}>
                    ← Volver a Carpetas
                  </button>
                  <span>/</span>
                  <span>{categorias.find(c => c.id === categoriaSeleccionada)?.nombre}</span>
                </div>
                <div className="drive-files-grid">
                  {datosArchivos?.archivos && datosArchivos.archivos.length > 0 ? (
                    datosArchivos.archivos.map((archivo, index) => (
                      <div key={index} className="drive-file-card">
                        <div className="file-icon">
                          {obtenerIconoArchivo(archivo.extension)}
                        </div>
                        <div className="file-info">
                          <h4 title={archivo.nombreOriginal || archivo.nombre}>
                            {archivo.nombreOriginal || archivo.nombre}
                          </h4>
                          <p>{formatearTamaño(archivo.tamaño)} • {formatearFecha(archivo.fechaSubida)}</p>
                          {archivo.nota && (
                            <p className="file-nota">
                              <FaInfoCircle className="nota-icon" />
                              {archivo.nota}
                            </p>
                          )}
                        </div>
                        <button
                          className="file-delete-btn"
                          onClick={() => handleEliminar(categoriaSeleccionada, archivo.nombre)}
                          title="Eliminar archivo"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="drive-empty">
                      <FaFolderOpen className="empty-icon" />
                      <p>Esta carpeta está vacía</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Vista de Subir Archivos */}
        {vista === 'subir' && (
          <div className="drive-content">
            <div className="drive-upload-section">
              <div className="upload-header">
                <h2>Subir Archivos al Repositorio</h2>
                <p>Selecciona la carpeta donde quieres guardar los archivos</p>
              </div>

              <form onSubmit={handleSubmit} className="drive-upload-form">
                <div className="form-group">
                  <label htmlFor="categoria">
                    <FaFolder /> Carpeta de destino
                  </label>
                  <select
                    id="categoria"
                    value={categoriaSeleccionada || ''}
                    onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                    required
                  >
                    <option value="">Selecciona una carpeta...</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre} {cat.cantidadArchivos > 0 && `(${cat.cantidadArchivos} archivos)`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Campo opcional de nota */}
                <div className="form-group nota-optional">
                  <div className="nota-toggle">
                    <button
                      type="button"
                      className="nota-toggle-btn"
                      onClick={() => setMostrarNota(!mostrarNota)}
                    >
                      <FaInfoCircle />
                      {mostrarNota ? 'Ocultar' : 'Agregar'} nota o descripción (opcional)
                    </button>
                  </div>
                  {mostrarNota && (
                    <div className="nota-field">
                      <label htmlFor="nota">
                        Nota o descripción del archivo:
                      </label>
                      <textarea
                        id="nota"
                        value={notaArchivo}
                        onChange={(e) => setNotaArchivo(e.target.value)}
                        placeholder="Ej: Este documento contiene información sobre la sesión del 15 de enero..."
                        rows="3"
                        maxLength="500"
                      />
                      <span className="nota-hint">
                        {notaArchivo.length}/500 caracteres (opcional)
                      </span>
                    </div>
                  )}
                </div>

                <div 
                  className={`drive-upload-zone ${dragActive ? 'drag-active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="archivos"
                    multiple
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  <label htmlFor="archivos" className="upload-label">
                    <FaCloudUploadAlt className="upload-icon" />
                    <span className="upload-text">
                      {archivos.length > 0 
                        ? `${archivos.length} archivo(s) seleccionado(s)` 
                        : 'Arrastra archivos aquí o haz clic para seleccionar'}
                    </span>
                    <span className="upload-hint">Máximo 50MB por archivo</span>
                  </label>
                </div>

                {archivos.length > 0 && (
                  <div className="drive-files-preview">
                    <h3>Archivos seleccionados:</h3>
                    <div className="files-list">
                      {archivos.map((archivo, index) => (
                        <div key={index} className="file-preview-item">
                          {obtenerIconoArchivo(archivo.name.substring(archivo.name.lastIndexOf('.')))}
                          <div className="file-preview-info">
                            <span className="file-name">{archivo.name}</span>
                            <span className="file-size">{formatearTamaño(archivo.size)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {mensaje.texto && (
                  <div className={`drive-mensaje mensaje-${mensaje.tipo}`}>
                    {mensaje.tipo === 'exito' ? <FaCheckCircle /> : <FaTimes />}
                    <span>{mensaje.texto}</span>
                  </div>
                )}

                {archivosSubidos.length > 0 && (
                  <div className="drive-success">
                    <h3>✓ Archivos subidos exitosamente:</h3>
                    <div className="files-list">
                      {archivosSubidos.map((archivo, index) => (
                        <div key={index} className="file-success-item">
                          <FaCheckCircle className="check-icon" />
                          <div className="file-preview-info">
                            <span className="file-name">{archivo.nombreOriginal || archivo.nombre}</span>
                            <span className="file-size">{archivo.tamañoMB} MB • {archivo.categoria}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="drive-btn-submit"
                  disabled={subiendo || archivos.length === 0 || !categoriaSeleccionada}
                >
                  {subiendo ? (
                    <>
                      <FaSpinner className="spinner" /> Subiendo al repositorio...
                    </>
                  ) : (
                    <>
                      <FaCloudUploadAlt /> Subir al Repositorio
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepositorioUpload;


