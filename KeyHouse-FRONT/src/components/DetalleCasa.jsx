import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/DetalleCasa.css';

const DetalleCasa = () => {
  const { id } = useParams();
  const [casa, setCasa] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [esFavorito, setEsFavorito] = useState(false);
  const [loading, setLoading] = useState(true);

  const usuario_id = localStorage.getItem('usuario_id');

  const verificarFavorito = async () => {
    if (!usuario_id) return;

    try {
      const response = await axios.get(`http://localhost:4000/api/favoritos/${usuario_id}`);
      const favoritos = response.data;

      const esFav = favoritos.some(fav => parseInt(fav.id) === parseInt(id));
      setEsFavorito(esFav);

      console.log('Estructura de favorito:', favoritos[0]);
      console.log('¿Es favorito?', esFav, 'ID actual:', id);
    } catch (error) {
      console.error('Error al verificar favorito:', error);
    }
  };

  const fetchCasa = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/casas/${id}`);
      setCasa(response.data);
    } catch (error) {
      console.error('Error al cargar la casa:', error);
      setMensaje('Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchCasa();
      await verificarFavorito();
    };
    init();
  }, [id]);

  const handleAgregarFavorito = async () => {
    if (!usuario_id) return setMensaje('Debes iniciar sesión para agregar a favoritos.');

    try {
      await axios.post('http://localhost:4000/api/favoritos/agregar', {
        usuario_id,
        casa_id: id,
      });
      setMensaje('Casa agregada a favoritos');
      await verificarFavorito();
    } catch (error) {
      console.error('Error al agregar a favoritos:', error);
      setMensaje('No se pudo agregar a favoritos.');
    }
  };

  const handleEliminarFavorito = async () => {
    if (!usuario_id) return setMensaje('Debes iniciar sesión.');

    try {
      await axios.delete('http://localhost:4000/api/favoritos/eliminar', {
        data: { usuario_id, casa_id: id },
      });
      setMensaje('Casa eliminada de favoritos');
      await verificarFavorito();
    } catch (error) {
      console.error('Error al eliminar de favoritos:', error);
      setMensaje('No se pudo eliminar de favoritos.');
    }
  };

  const handleAlquilar = async () => {
    if (!usuario_id) return setMensaje('Debes iniciar sesión para alquilar.');

    try {
      const response = await axios.post('http://localhost:4000/api/alquileres/registrar', {
        usuario_id,
        casa_id: id,
      });
      setMensaje(response.data.mensaje);
    } catch (error) {
      console.error('Error al alquilar la casa:', error);
      setMensaje('No se pudo alquilar la casa.');
    }
  };

  if (loading) return <p className="detalle-cargando">Cargando...</p>;
  if (!casa) return <p className="detalle-cargando">No se encontró la casa.</p>;

  const imagenes = typeof casa.imagen === 'string' ? JSON.parse(casa.imagen) : casa.imagen;

  return (
    <div className="detalle-container">
      <div className="detalle-content">
        <h2>{casa.titulo}</h2>

        <div className="detalle-imagenes-container">
          {/* Contenedor de galería de imágenes con márgenes uniformes */}
          <div className="detalle-galeria">
            {imagenes?.length > 0 && (
              <>
                <div className="detalle-imagen-principal">
                  <img
                    src={`http://localhost:4000/${imagenes[0]}`}
                    alt={`Imagen principal de ${casa.titulo}`}
                    className="detalle-imagen"
                  />
                </div>

                {imagenes.length > 1 && (
                  <div className="detalle-imagenes-grid">
                    {imagenes.slice(1).map((img, index) => (
                      <div key={index} className="detalle-imagen-item">
                        <img
                          src={`http://localhost:4000/${img}`}
                          alt={`Vista ${index + 2} de ${casa.titulo}`}
                          className="detalle-imagen-secundaria"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="detalle-info-container">
          <div className="detalle-destacado">
            <div className="detalle-precio-container">
              <span className="detalle-precio-etiqueta">Precio</span>
              <p className="detalle-precio">${casa.precio.toLocaleString()}<span className="detalle-precio-periodo"></span></p>
            </div>
            
            <div className="detalle-ubicacion-container">
              <span className="detalle-ubicacion-etiqueta">Ubicación</span>
              <p className="detalle-ubicacion">
                <i className="fas fa-map-marker-alt"></i> 
                {casa.ubicacion}
              </p>
              <a href={`https://maps.google.com/?q=${casa.ubicacion}`} target="_blank" rel="noopener noreferrer" className="ver-mapa">
                <i className="fas fa-map"></i> Ver en mapa
              </a>
            </div>
          </div>

          {/* <div className="detalle-caracteristicas">
            <h3>Características principales</h3>
            <div className="caracteristicas-grid">
              {casa.habitaciones && (
                <div className="caracteristica-item">
                  <i className="fas fa-bed"></i>
                  <span>{casa.habitaciones} Habitaciones</span>
                </div>
              )}
              
              {casa.banos && (
                <div className="caracteristica-item">
                  <i className="fas fa-bath"></i>
                  <span>{casa.banos} Baños</span>
                </div>
              )}
              
              {casa.area && (
                <div className="caracteristica-item">
                  <i className="fas fa-ruler-combined"></i>
                  <span>{casa.area} m²</span>
                </div>
              )}
              
              {casa.estrato && (
                <div className="caracteristica-item">
                  <i className="fas fa-layer-group"></i>
                  <span>Estrato {casa.estrato}</span>
                </div>
              )}
              
              {casa.cocina && (
                <div className="caracteristica-item">
                  <i className="fas fa-utensils"></i>
                  <span>Cocina integrada</span>
                </div>
              )}
              
              {casa.garaje && (
                <div className="caracteristica-item">
                  <i className="fas fa-car"></i>
                  <span>Garaje/Parqueadero</span>
                </div>
              )}
              
              {casa.piscina && (
                <div className="caracteristica-item">
                  <i className="fas fa-swimming-pool"></i>
                  <span>Piscina</span>
                </div>
              )}
            </div>
          </div> */}

          <div className="detalle-descripcion">
            <h3>Descripción</h3>
            <p>{casa.descripcion}</p>
          </div>

          <div className="detalle-acciones">
            <button onClick={handleAlquilar} className="btn btn-alquilar">
              <i className="fas fa-key"></i> Alquilar
            </button>

            {esFavorito ? (
              <button onClick={handleEliminarFavorito} className="btn btn-eliminar">
                <i className="fas fa-heart-broken"></i> Eliminar de Favoritos
              </button>
            ) : (
              <button onClick={handleAgregarFavorito} className="btn btn-agregar">
                <i className="fas fa-heart"></i> Agregar a Favoritos
              </button>
            )}
          </div>

          {mensaje && <p className="detalle-mensaje">{mensaje}</p>}
        </div>
      </div>
    </div>
  );
};

export default DetalleCasa;
