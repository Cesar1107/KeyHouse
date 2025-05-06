import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/MisPropiedades.css'; // Necesitarás crear este archivo

const MisPropiedades = () => {
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/');
    } else {
      cargarMisPropiedades();
    }
  }, [navigate]);

  const cargarMisPropiedades = async () => {
    setLoading(true);
    const usuario_id = localStorage.getItem('usuario_id');
    if (!usuario_id) {
      setLoading(false);
      setMensaje('Error: No se pudo identificar tu cuenta. Intenta iniciar sesión nuevamente.');
      return;
    }

    try {
      console.log(`Cargando propiedades para el usuario con ID: ${usuario_id}`);
      const { data } = await axios.get(`http://localhost:4000/api/casas/usuario/${usuario_id}`);
      
      // Verificar la estructura de los datos recibidos
      console.log(`Propiedades recibidas: ${data.length}`);
      if (data.length > 0) {
        console.log('Estructura de la primera propiedad:', 
          JSON.stringify({
            id: data[0].id,
            usuario_id: data[0].usuario_id,
            id_usuario: data[0].id_usuario
          }, null, 2)
        );
      }
      
      setPropiedades(data);
      localStorage.setItem('userProperties', JSON.stringify(data));
    } catch (error) {
      console.error("Error al cargar propiedades:", error);
      const errorMsg = error.response?.data?.error || error.message || 'Error desconocido';
      setMensaje(`Error al cargar propiedades: ${errorMsg}`);
      
      const cached = localStorage.getItem('userProperties');
      if (cached) {
        setPropiedades(JSON.parse(cached));
        console.log('Se cargaron propiedades desde caché local');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditarPropiedad = (id) => {
    navigate(`/editar-propiedad/${id}`);
  };

  const handleEliminarPropiedad = async (id) => {
    console.log(`Intentando eliminar propiedad con ID: ${id}`);
    if (window.confirm('¿Estás seguro de que deseas eliminar esta propiedad? Esta acción no se puede deshacer.')) {
      const usuario_id = localStorage.getItem('usuario_id');

      if (!usuario_id) {
        setMensaje('Error: No se pudo verificar tu identidad. Intenta iniciar sesión nuevamente.');
        console.error('Error: usuario_id no encontrado en localStorage.');
        return;
      }

      console.log(`Usuario ID recuperado: ${usuario_id}`);

      try {
        setMensaje('');
        console.log(`Eliminando referencias de favoritos para la propiedad con ID: ${id}`);

        // Intentar eliminar referencias en favoritos (si existen)
        await axios.delete('http://localhost:4000/api/favoritos/eliminar', {
          data: { usuario_id, casa_id: id },
        });
        console.log('Referencias en favoritos eliminadas correctamente.');
      } catch (error) {
        console.warn('No se encontraron referencias en favoritos o falló la eliminación:', error.message);
      }

      // Continuar con la eliminación de la propiedad
      try {
        const response = await axios.delete(`http://localhost:4000/api/casas/${id}`, {
          params: { usuario_id },
        });

        if (response.status === 200 && response.data?.mensaje === "Propiedad eliminada con éxito") {
          console.log('Propiedad eliminada con éxito.');
          // Actualizar estado y localStorage
          const propiedadesActualizadas = propiedades.filter(prop => prop.id !== id);
          setPropiedades(propiedadesActualizadas);
          localStorage.setItem('userProperties', JSON.stringify(propiedadesActualizadas));
          setMensaje('Propiedad eliminada con éxito');
        } else {
          setMensaje(response.data?.mensaje || 'Error inesperado al eliminar la propiedad.');
        }
      } catch (error) {
        console.error('Error completo al eliminar propiedad:', error);

        if (error.response) {
          const errorMsg = error.response.data?.error || error.response.data?.mensaje || `Error del servidor (${error.response.status})`;
          setMensaje(`Error al eliminar: ${errorMsg}`);
          console.error('Detalles del error del servidor:', error.response.data);
        } else if (error.request) {
          setMensaje('Error de red: No se pudo conectar con el servidor.');
          console.error('Error de red:', error.request);
        } else {
          setMensaje(`Error en la solicitud: ${error.message}`);
          console.error('Error en configuración de Axios:', error.message);
        }
      }
    } else {
      console.log('Eliminación cancelada por el usuario.');
    }
  };

  return (
    <div className="mis-propiedades-container">
      {/* Asegúrate que el mensaje se muestre correctamente */}
      {mensaje && <div className={`mensaje-alerta ${mensaje.includes('Error') ? 'error' : 'exito'}`}>{mensaje}</div>}
      <div className="mis-propiedades-header">
        <div className="header-content">
          <div className="header-icon">
            <i className="home-icon">🏠</i>
          </div>
          <div className="header-info">
            <h1>Mis Propiedades</h1>
            <p className="propiedades-subtitle">
              Administra las propiedades que has publicado
            </p>
          </div>
        </div>
        <div className="header-actions">
          <Link to="/publicar-propiedad" className="publish-button">
            + Publicar nueva propiedad
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando tus propiedades...</p>
        </div>
      ) : propiedades.length === 0 ? (
        <div className="no-properties-container">
          <div className="no-properties-icon">🏠</div>
          <h2>No has publicado propiedades</h2>
          <p>Las propiedades que publiques aparecerán aquí</p>
          <Link to="/publicar-propiedad" className="publish-button">
            Publicar una propiedad
          </Link>
        </div>
      ) : (
        <div className="propiedades-grid">
          {propiedades.map((casa) => {
            let imagenes = [];
            try {
              if (casa.imagen) {
                imagenes = JSON.parse(casa.imagen);
              }
            } catch (err) {
              console.error("Error al parsear imágenes:", err);
            }

            return (
              <div className="property-card" key={casa.id}>
                <div className="property-status">
                  <span className={casa.disponible ? "status available" : "status unavailable"}>
                    {casa.disponible ? "Disponible" : "No disponible"}
                  </span>
                </div>
                <div className="property-image-container">
                  {imagenes.length > 0 ? (
                    <img
                      src={`http://localhost:4000/${imagenes[0]}`}
                      alt={casa.titulo}
                      className="property-image"
                    />
                  ) : (
                    <div className="property-no-image">
                      <span>Sin imagen</span>
                    </div>
                  )}
                </div>
                <div className="property-info">
                  <h3 className="property-title">{casa.titulo}</h3>
                  <p className="property-location">{casa.ubicacion}</p>
                  <p className="property-description">{casa.descripcion}</p>
                  <p className="property-price">${casa.precio.toLocaleString()}</p>
                  <div className="property-actions">
                    <button
                      className="edit-property-btn"
                      onClick={() => handleEditarPropiedad(casa.id)}
                    >
                      Editar
                    </button>
                    <button
                      className="delete-property-btn" // Asegúrate que esta clase exista y tenga estilos
                      onClick={() => handleEliminarPropiedad(casa.id)}
                    >
                      Eliminar
                    </button>
                    <Link to={`/casa/${casa.id}`}>
                      <button className="view-property-btn">Ver detalles</button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="back-link">
        <Link to="/home">← Volver a inicio</Link>
      </div>
    </div>
  );
};

export default MisPropiedades;