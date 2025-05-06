import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/EditarPropiedad.css';

const EditarPropiedad = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState(''); // 'success' o '' para error
  const [propiedad, setPropiedad] = useState({
    titulo: '',
    descripcion: '',
    habitaciones: '',
    banos: '',
    area: '',
    cocina: false,
    estrato: '',
    garaje: false,
    piscina: false,
    ubicacion: '',
    precio: '',
    disponible: true,
  });
  const [imagenes, setImagenes] = useState([]);
  const [nuevasImagenes, setNuevasImagenes] = useState([]);
  const [preview, setPreview] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('informacion'); // Pestaña activa

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/');
      return;
    }
    
    cargarPropiedad();
  }, [id, navigate]);

  const cargarPropiedad = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`http://localhost:4000/api/casas/${id}`);
      
      // Verificar si el usuario es el propietario
      const usuario_id = localStorage.getItem('usuario_id');
      if (data.usuario_id !== parseInt(usuario_id)) {
        setMensaje('No tienes permiso para editar esta propiedad');
        navigate('/mis-propiedades');
        return;
      }
      
      setPropiedad({
        titulo: data.titulo,
        descripcion: data.descripcion,
        habitaciones: data.habitaciones || '',
        banos: data.banos || '',
        area: data.area || '',
        cocina: data.cocina || false,
        estrato: data.estrato || '',
        garaje: data.garaje || false,
        piscina: data.piscina || false,
        ubicacion: data.ubicacion,
        precio: data.precio,
        disponible: data.disponible !== false, // si es undefined, se considera true
      });
      
      // Manejar imágenes
      let imagenesArray = [];
      try {
        if (data.imagen) {
          imagenesArray = JSON.parse(data.imagen);
        }
      } catch (err) {
        console.error("Error al parsear imágenes:", err);
      }
      
      setImagenes(imagenesArray);
    } catch (error) {
      console.error('Error al cargar la propiedad:', error);
      setMensaje('Error al cargar la propiedad');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPropiedad({
      ...propiedad,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNuevasImagenes(filesArray);
      
      // Crear URL para preview
      const previewURLs = filesArray.map(file => URL.createObjectURL(file));
      setPreview(previewURLs);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMensaje('');
    console.log('--- [EditarPropiedad] Iniciando handleSubmit ---');

    // 1. Obtener y validar usuario_id
    const usuario_id = localStorage.getItem('usuario_id');
    if (!usuario_id) {
      setMensaje('Error: No se pudo verificar tu identidad. Intenta iniciar sesión.');
      console.error('[EditarPropiedad] Error: usuario_id no encontrado en localStorage.');
      setActionLoading(false);
      return;
    }
    console.log(`[EditarPropiedad] Usuario ID recuperado: ${usuario_id}`);

    // 2. Validaciones de campos obligatorios y formato
    if (!propiedad.titulo || !propiedad.descripcion || !propiedad.ubicacion || !propiedad.precio) {
      setMensaje('Error: Todos los campos (Título, Descripción, Ubicación, Precio) son obligatorios.');
      console.error('[EditarPropiedad] Error de validación: Campos obligatorios faltantes.');
      setActionLoading(false);
      return;
    }
    const precioNum = parseFloat(propiedad.precio);
    if (isNaN(precioNum) || precioNum <= 0) {
      setMensaje('Error: El precio debe ser un número válido mayor que cero.');
      console.error('[EditarPropiedad] Error de validación: Precio inválido.');
      setActionLoading(false);
      return;
    }
    console.log('[EditarPropiedad] Validaciones básicas pasadas.');

    try {
      const formData = new FormData();
      formData.append('titulo', propiedad.titulo);
      formData.append('descripcion', propiedad.descripcion);
      formData.append('ubicacion', propiedad.ubicacion);
      formData.append('precio', precioNum.toString());
      formData.append('disponible', propiedad.disponible.toString());
      formData.append('usuario_id', usuario_id);

      if (nuevasImagenes.length > 0) {
        nuevasImagenes.forEach((imgFile) => {
          formData.append('imagen', imgFile, imgFile.name);
        });
      }

      const response = await axios.put(`http://localhost:4000/api/casas/${id}`, formData);

      if (response.status === 200 && response.data?.mensaje === "Propiedad actualizada con éxito") {
        setMensaje('Propiedad actualizada con éxito');
        setTipoMensaje('success');
        setTimeout(() => {
          navigate('/mis-propiedades');
        }, 2000);
      } else {
        setMensaje(response.data?.mensaje || response.data?.error || 'Respuesta inesperada al actualizar.');
      }
    } catch (error) {
      if (error.response) {
        const errorMsg = error.response.data?.error || error.response.data?.mensaje || `Error del servidor (${error.response.status})`;
        setMensaje(`Error al actualizar: ${errorMsg}`);
      } else if (error.request) {
        setMensaje('Error de red: No se pudo conectar con el servidor.');
      } else {
        setMensaje(`Error en la solicitud (PUT): ${error.message}`);
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Función para cambiar de pestaña
  const cambiarPestaña = (tabId) => {
    setActiveTab(tabId);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando datos de la propiedad...</p>
      </div>
    );
  }

  return (
    <div className="editar-propiedad-container">
      <div className="editar-propiedad-header">
        <h1>Editar Propiedad</h1>
        <p>Actualiza la información de tu propiedad</p>
      </div>
      
      {mensaje && (
        <div className={`mensaje-alerta ${tipoMensaje === 'success' ? 'success' : ''}`}>
          {tipoMensaje === 'success' && <i className="fas fa-check-circle"></i>}
          {tipoMensaje !== 'success' && <i className="fas fa-exclamation-circle"></i>}
          {mensaje}
        </div>
      )}
      
      <div className="tabs-container">
        {/* Navegación de pestañas */}
        <div className="tabs-nav">
          <button 
            className={`tab-button ${activeTab === 'informacion' ? 'active' : ''}`}
            onClick={() => cambiarPestaña('informacion')}
          >
            Información básica
          </button>
          <button 
            className={`tab-button ${activeTab === 'ubicacion' ? 'active' : ''}`}
            onClick={() => cambiarPestaña('ubicacion')}
          >
            Ubicación
          </button>
          {/* 
          <button 
            className={`tab-button ${activeTab === 'caracteristicas' ? 'active' : ''}`}
            onClick={() => cambiarPestaña('caracteristicas')}
          >
            Características
          </button>
          */}
          <button 
            className={`tab-button ${activeTab === 'imagenes' ? 'active' : ''}`}
            onClick={() => cambiarPestaña('imagenes')}
          >
            Imágenes
          </button>
          <button 
            className={`tab-button ${activeTab === 'disponibilidad' ? 'active' : ''}`}
            onClick={() => cambiarPestaña('disponibilidad')}
          >
            Disponibilidad
          </button>
        </div>
        
        <form className="editar-propiedad-form" onSubmit={handleSubmit}>
          {/* Contenido de pestaña: Información básica */}
          <div className={`tab-content ${activeTab === 'informacion' ? 'active' : ''}`} id="informacion">
            <h3 className="form-section-title">Información básica</h3>
            
            <div className="form-group">
              <label htmlFor="titulo">Título</label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                value={propiedad.titulo}
                onChange={handleChange}
                required
                placeholder="Escribe un título atractivo"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={propiedad.descripcion}
                onChange={handleChange}
                required
                placeholder="Describe los detalles de tu propiedad"
              />
            </div>
            
            {/* <h4 className="form-subsection-title">Características principales</h4>
            
            <div className="form-row">
              <div className="form-group half-width">
                <label htmlFor="habitaciones">Habitaciones</label>
                <input
                  type="number"
                  id="habitaciones"
                  name="habitaciones"
                  value={propiedad.habitaciones}
                  onChange={handleChange}
                  min="0"
                  placeholder="Número de habitaciones"
                />
              </div>
              
              <div className="form-group half-width">
                <label htmlFor="banos">Baños</label>
                <input
                  type="number"
                  id="banos"
                  name="banos"
                  value={propiedad.banos}
                  onChange={handleChange}
                  min="0"
                  placeholder="Número de baños"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group half-width">
                <label htmlFor="area">Área (m²)</label>
                <input
                  type="number"
                  id="area"
                  name="area"
                  value={propiedad.area}
                  onChange={handleChange}
                  min="0"
                  placeholder="Área en metros cuadrados"
                />
              </div>
              
              <div className="form-group half-width">
                <label htmlFor="estrato">Estrato</label>
                <select
                  id="estrato"
                  name="estrato"
                  value={propiedad.estrato}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar estrato</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                </select>
              </div>
            </div>
            
            <div className="form-row checkboxes-container">
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="cocina"
                    checked={propiedad.cocina}
                    onChange={handleChange}
                  />
                  Cocina integrada
                </label>
              </div>
              
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="garaje"
                    checked={propiedad.garaje}
                    onChange={handleChange}
                  />
                  Garaje/Parqueadero
                </label>
              </div>
              
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="piscina"
                    checked={propiedad.piscina}
                    onChange={handleChange}
                  />
                  Piscina
                </label>
              </div>
            </div> */}
          </div>
          
          {/* Contenido de pestaña: Ubicación */}
          <div className={`tab-content ${activeTab === 'ubicacion' ? 'active' : ''}`} id="ubicacion">
            <h3 className="form-section-title">Ubicación</h3>
            
            <div className="form-group">
              <label htmlFor="ubicacion">Dirección completa</label>
              <input
                type="text"
                id="ubicacion"
                name="ubicacion"
                value={propiedad.ubicacion}
                onChange={handleChange}
                required
                placeholder="Ingresa la dirección exacta"
              />
            </div>
          </div>
          
          {/* Contenido de pestaña: Imágenes */}
          <div className={`tab-content ${activeTab === 'imagenes' ? 'active' : ''}`} id="imagenes">
            <h3 className="form-section-title">Imágenes de la propiedad</h3>
            
            <div className="form-group">
              <label>Imágenes actuales</label>
              <div className="imagenes-actuales">
                {imagenes.length > 0 ? (
                  <div className="imagen-grid">
                    {imagenes.map((img, index) => (
                      <div key={index} className="imagen-preview-container">
                        <img
                          src={`http://localhost:4000/${img}`}
                          alt={`Propiedad ${index + 1}`}
                          className="imagen-preview"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No hay imágenes disponibles</p>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="nuevas-imagenes">Actualizar imágenes (opcional)</label>
              <input
                type="file"
                id="nuevas-imagenes"
                name="nuevas-imagenes"
                onChange={handleImageChange}
                multiple
                accept="image/*"
              />
              
              {preview.length > 0 && (
                <div className="nuevas-imagenes-preview">
                  <h4>Vista previa</h4>
                  <div className="imagen-grid">
                    {preview.map((url, index) => (
                      <div key={index} className="imagen-preview-container">
                        <img
                          src={url}
                          alt={`Nueva imagen ${index + 1}`}
                          className="imagen-preview"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Contenido de pestaña: Disponibilidad */}
          <div className={`tab-content ${activeTab === 'disponibilidad' ? 'active' : ''}`} id="disponibilidad">
            <h3 className="form-section-title">Precio y disponibilidad</h3>
            
            <div className="form-group">
              <label htmlFor="precio">Precio</label>
              <input
                type="number"
                id="precio"
                name="precio"
                value={propiedad.precio}
                onChange={handleChange}
                required
                placeholder="Precio por noche/mes"
              />
            </div>
            
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="disponible"
                  checked={propiedad.disponible}
                  onChange={handleChange}
                />
                Disponible para alquiler
              </label>
            </div>
          </div>
          
          {/* Botones de acción (siempre visibles) */}
          <div className="form-actions">
            <button type="button" className="btn-cancelar" onClick={() => navigate('/mis-propiedades')}>
              Cancelar
            </button>
            <button type="submit" className="btn-guardar" disabled={loading || actionLoading}>
              {actionLoading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarPropiedad;