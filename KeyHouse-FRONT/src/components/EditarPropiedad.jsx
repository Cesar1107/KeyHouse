import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/EditarPropiedad.css';

const EditarPropiedad = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [propiedad, setPropiedad] = useState({
    titulo: '',
    descripcion: '',
    ubicacion: '',
    precio: '',
    disponible: true,
  });
  const [imagenes, setImagenes] = useState([]);
  const [nuevasImagenes, setNuevasImagenes] = useState([]);
  const [preview, setPreview] = useState([]);
  const [actionLoading, setActionLoading] = useState(false); // Nuevo estado para loading de acción

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
    setActionLoading(true); // Indicar que una acción está en progreso
    setMensaje(''); // Limpiar mensajes previos
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
    const precioNum = parseFloat(propiedad.precio); // Convertir a número para validar
    if (isNaN(precioNum) || precioNum <= 0) {
        setMensaje('Error: El precio debe ser un número válido mayor que cero.');
        console.error('[EditarPropiedad] Error de validación: Precio inválido.');
        setActionLoading(false);
        return;
    }
    console.log('[EditarPropiedad] Validaciones básicas pasadas.');

    // 3. Crear FormData
    try {
      const formData = new FormData();

      // Añadir campos de texto (asegurándose de enviar strings como espera el backend con FormData)
      formData.append('titulo', propiedad.titulo);
      formData.append('descripcion', propiedad.descripcion);
      formData.append('ubicacion', propiedad.ubicacion);
      formData.append('precio', precioNum.toString()); // Enviar precio validado como string
      formData.append('disponible', propiedad.disponible.toString()); // Enviar booleano como 'true' o 'false'
      formData.append('usuario_id', usuario_id); // Esencial para la verificación en el backend

      console.log('[EditarPropiedad] Datos de texto añadidos a FormData:', {
        titulo: propiedad.titulo,
        descripcion: propiedad.descripcion,
        ubicacion: propiedad.ubicacion,
        precio: precioNum.toString(),
        disponible: propiedad.disponible.toString(),
        usuario_id: usuario_id
      });

      // 4. Añadir NUEVAS imágenes (si las hay)
      // El backend (ruta PUT) está configurado para SOLO actualizar imágenes si recibe archivos nuevos.
      if (nuevasImagenes.length > 0) {
        console.log(`[EditarPropiedad] Añadiendo ${nuevasImagenes.length} nuevas imágenes a FormData...`);
        nuevasImagenes.forEach((imgFile, index) => {
          // El nombre de campo 'imagen' debe coincidir con el esperado por multer en el backend
          formData.append('imagen', imgFile, imgFile.name);
          console.log(` - Nueva Imagen ${index + 1}: ${imgFile.name}`);
        });
      } else {
        console.log('[EditarPropiedad] No se seleccionaron nuevas imágenes. Las imágenes existentes se conservarán.');
        // No añadir nada al FormData si no hay imágenes nuevas.
      }

      // 5. Realizar la solicitud PUT
      console.log(`[EditarPropiedad] Enviando solicitud PUT a /api/casas/${id}`);

      // Opcional: Loggear FormData (puede no funcionar en todos los navegadores)
      // for (let [key, value] of formData.entries()) { console.log(`FormData -> ${key}:`, value); }

      const response = await axios.put(`http://localhost:4000/api/casas/${id}`, formData, {
        // Axios detecta FormData y establece 'multipart/form-data' automáticamente.
        // No es necesario ponerlo explícitamente a menos que haya problemas.
        // headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('[EditarPropiedad] Respuesta del servidor (PUT):', response);

      // 6. Manejar la respuesta
      if (response.status === 200 && response.data?.mensaje === "Propiedad actualizada con éxito") {
        setMensaje('Propiedad actualizada con éxito');
        console.log('[EditarPropiedad] Actualización exitosa en backend y frontend.');
        // Opcional: Recargar datos o limpiar estado si es necesario antes de navegar
        setTimeout(() => {
          navigate('/mis-propiedades'); // Redirigir a la lista
        }, 2000);
      } else {
        // Caso: El servidor respondió 200 OK pero con un mensaje inesperado
        console.warn('[EditarPropiedad] Respuesta inesperada del servidor (PUT):', response.data);
        setMensaje(response.data?.mensaje || response.data?.error || 'Respuesta inesperada al actualizar.');
      }

    } catch (error) {
      // 7. Manejar errores de la solicitud
      console.error('[EditarPropiedad] Error completo durante handleSubmit (PUT):', error);
      if (error.response) {
        // El servidor respondió con un código de estado de error (4xx, 5xx)
        const errorMsg = error.response.data?.error || error.response.data?.mensaje || `Error del servidor (${error.response.status})`;
        setMensaje(`Error al actualizar: ${errorMsg}`);
        console.error('[EditarPropiedad] Detalles del error del servidor (PUT):', error.response.data);
      } else if (error.request) {
        // La solicitud se hizo pero no se recibió respuesta
        setMensaje('Error de red: No se pudo conectar con el servidor.');
        console.error('[EditarPropiedad] Error de red (PUT):', error.request);
      } else {
        // Error al configurar la solicitud
        setMensaje(`Error en la solicitud (PUT): ${error.message}`);
        console.error('[EditarPropiedad] Error en configuración de Axios (PUT):', error.message);
      }
    } finally {
      // 8. Finalizar estado de carga
      setActionLoading(false);
      console.log('--- [EditarPropiedad] Finalizando handleSubmit ---');
    }
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
      
      {mensaje && <div className="mensaje-alerta">{mensaje}</div>}
      
      <form className="editar-propiedad-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="titulo">Título</label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={propiedad.titulo}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="ubicacion">Ubicación</label>
          <input
            type="text"
            id="ubicacion"
            name="ubicacion"
            value={propiedad.ubicacion}
            onChange={handleChange}
            required
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
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="precio">Precio</label>
          <input
            type="number"
            id="precio"
            name="precio"
            value={propiedad.precio}
            onChange={handleChange}
            required
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
        
        <div className="form-group">
          <label htmlFor="imagenes">Imágenes actuales</label>
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
  );
};

export default EditarPropiedad;