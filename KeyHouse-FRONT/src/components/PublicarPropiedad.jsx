import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/PublicarPropiedad.css';

const PublicarPropiedad = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [propiedad, setPropiedad] = useState({
    titulo: '',
    descripcion: '',
    ubicacion: '',
    precio: '',
  });
  const [imagenes, setImagenes] = useState([]);
  const [preview, setPreview] = useState([]);
  const [propiedades, setPropiedades] = useState([]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/');
    } else {
      // Cargar propiedades del usuario
      const userProperties = JSON.parse(localStorage.getItem('userProperties')) || [];
      setPropiedades(userProperties);
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPropiedad({
      ...propiedad,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImagenes(filesArray);
      
      // Crear URL para preview
      const previewURLs = filesArray.map(file => URL.createObjectURL(file));
      setPreview(previewURLs);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (imagenes.length === 0) {
      setMensaje('Debes subir al menos una imagen');
      return;
    }
    
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('titulo', propiedad.titulo);
      formData.append('descripcion', propiedad.descripcion);
      formData.append('ubicacion', propiedad.ubicacion);
      formData.append('precio', propiedad.precio);
      formData.append('usuario_id', localStorage.getItem('usuario_id'));
      
      // Agregar imágenes
      imagenes.forEach((img) => {
        formData.append('imagen', img);
      });
      
      await axios.post('http://localhost:4000/api/casas/registrar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setMensaje('¡Propiedad publicada con éxito!');
      // Limpiar formulario
      setPropiedad({
        titulo: '',
        descripcion: '',
        ubicacion: '',
        precio: '',
      });
      setImagenes([]);
      setPreview([]);
      
      setTimeout(() => {
        navigate('/mis-propiedades');
      }, 2000);
      
    } catch (error) {
      console.error('Error al publicar la propiedad:', error);
      setMensaje('Error al publicar la propiedad. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarPropiedad = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta propiedad?')) {
      try {
        const usuario_id = localStorage.getItem('usuario_id');
        await axios.delete(`http://localhost:4000/api/casas/${id}`, {
          data: { usuario_id }  // Enviar usuario_id en el cuerpo
        });
        
        // Actualizar estado después de confirmar la eliminación
        const propiedadesActualizadas = propiedades.filter(prop => prop.id !== id);
        setPropiedades(propiedadesActualizadas);
        localStorage.setItem('userProperties', JSON.stringify(propiedadesActualizadas));
        setMensaje('Propiedad eliminada exitosamente.');
      } catch (error) {
        console.error("Error al eliminar propiedad:", error);
        setMensaje('Error al eliminar la propiedad: ' + (error.response?.data?.error || 'Error desconocido'));
      }
    }
  };

  return (
    <div className="publicar-propiedad-container">
      <div className="publicar-propiedad-header">
        <h1>Publicar Propiedad</h1>
        <p>Comparte los detalles de tu propiedad para alquilar</p>
      </div>
      
      {mensaje && (
        <div className={`mensaje-alerta ${mensaje.includes('éxito') ? 'success' : ''}`}>
          {mensaje}
        </div>
      )}
      
      <form className="publicar-propiedad-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="titulo">Título</label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={propiedad.titulo}
            onChange={handleChange}
            required
            placeholder="Ej: Apartamento moderno en el centro"
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
            placeholder="Ej: Calle Principal #123, Ciudad"
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
            placeholder="Describe las características de tu propiedad..."
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
            placeholder="Ej: 1200000"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="imagenes">Imágenes (máximo 5)</label>
          <input
            type="file"
            id="imagenes"
            name="imagenes"
            onChange={handleImageChange}
            multiple
            accept="image/*"
            required
          />
          
          {preview.length > 0 && (
            <div className="imagenes-preview">
              <h4>Vista previa</h4>
              <div className="imagen-grid">
                {preview.map((url, index) => (
                  <div key={index} className="imagen-preview-container">
                    <img
                      src={url}
                      alt={`Vista previa ${index + 1}`}
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
          <button type="submit" className="btn-guardar" disabled={loading}>
            {loading ? 'Publicando...' : 'Publicar propiedad'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PublicarPropiedad;