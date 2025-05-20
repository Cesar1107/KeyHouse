import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import '../styles/PublicarPropiedad.css';

const containerStyle = {
  width: '100%',
  height: '300px',
};

const defaultCenter = {
  lat: 4.6482837,
  lng: -74.247894,
};

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
  const [posicion, setPosicion] = useState(null);
  const autocompleteRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPropiedad({ ...propiedad, [name]: value });
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);

      if (filesArray.length > 5) {
        setMensaje('Solo puedes subir un máximo de 5 imágenes.');
        return;
      }

      setImagenes(filesArray);
      const previewURLs = filesArray.map((file) => URL.createObjectURL(file));
      setPreview(previewURLs);
    }
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place.geometry) {
      const { location } = place.geometry;
      setPropiedad({ ...propiedad, ubicacion: place.formatted_address });
      setPosicion({
        lat: location.lat(),
        lng: location.lng(),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!posicion) {
      setMensaje('Debes seleccionar una ubicación válida desde el mapa.');
      return;
    }

    if (imagenes.length === 0) {
      setMensaje('Debes subir al menos una imagen.');
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
      formData.append('latitud', posicion.lat);
      formData.append('longitud', posicion.lng);

      imagenes.forEach((img) => {
        formData.append('imagen', img);
      });

      await axios.post('http://localhost:4000/api/casas/registrar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMensaje('¡Propiedad publicada con éxito!');
      setPropiedad({ titulo: '', descripcion: '', ubicacion: '', precio: '' });
      setImagenes([]);
      setPreview([]);
      setPosicion(null);

      setTimeout(() => navigate('/mis-propiedades'), 2000);
    } catch (error) {
      console.error('Error al publicar la propiedad:', error);
      setMensaje('Error al publicar la propiedad. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="publicar-propiedad-container">
      <div className="publicar-propiedad-header">
        <h1>Registrar Casa</h1>
        <p>Ingresa los datos de la casa que deseas alquilar</p>
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
          />
        </div>

        <div className="form-group">
          <label htmlFor="ubicacion">Ubicación</label>
          <LoadScript
            googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
            libraries={['places']}
            loadingElement={<div>Cargando mapa...</div>}
          >
            <Autocomplete
              onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
              onPlaceChanged={handlePlaceChanged}
            >
              <input
                type="text"
                placeholder="Buscar dirección"
                className="autocomplete-input"
              />
            </Autocomplete>

            <GoogleMap
              mapContainerStyle={containerStyle}
              center={posicion || defaultCenter}
              zoom={posicion ? 16 : 12}
            >
              {posicion && <Marker position={posicion} />}
            </GoogleMap>
          </LoadScript>
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
          <button
            type="button"
            className="btn-cancelar"
            onClick={() => navigate('/mis-propiedades')}
          >
            Cancelar
          </button>
          <button type="submit" className="btn-guardar" disabled={loading}>
            {loading ? 'Publicando...' : 'Registrar Casa'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PublicarPropiedad;
