import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Solicitudes.css';

const Solicitudes = ({ idDueno }) => {
  const [solicitudes, setSolicitudes] = useState([]);

  useEffect(() => {
    axios
        .get(`http://localhost:4000/api/alquileres/solicitudes/${idDueno}`)
        .then((response) => {
            setSolicitudes(response.data);
        })
        .catch((error) => {
            console.error("Error al obtener solicitudes", error);
        });
  }, [idDueno]);

  const responderSolicitud = async (alquilerId, decision) => {
    try {
      await axios.post('http://localhost:4000/api/alquileres/responder-solicitud', {
        alquiler_id: alquilerId,
        decision: decision // "aceptado" o "rechazado"
      });
      // Actualiza la lista después de responder
      setSolicitudes(solicitudes.filter(s => s.alquiler_id !== alquilerId));
    } catch (err) {
      console.error('Error al responder solicitud', err);
    }
  };

  return (
    <div className="solicitudes-container">
      <h2>Solicitudes de arriendo recibidas</h2>
      {solicitudes.length === 0 ? (
        <div className="empty-state">
          No tienes solicitudes pendientes.
          <span>Las solicitudes aparecerán aquí cuando los inquilinos muestren interés.</span>
        </div>
      ) : (
        <div className="cards-grid">
          {solicitudes.map(s => (
            <div key={s.alquiler_id} className="card">
              <div className="casa-card-inner">
                <div className="casa-image-container">
                  {JSON.parse(s.imagen).length > 0 && (
                    <img
                      src={`http://localhost:4000/${JSON.parse(s.imagen)[0]}`}
                      className="casa-image"
                      alt={`Imagen de ${s.titulo}`}
                    />
                  )}
                </div>
              </div>
              <div className="card-content">
                <p><strong>Casa:</strong> {s.titulo}</p>
                <p><strong>Dirección:</strong> {s.ubicacion}</p>
                <p><strong>Inquilino:</strong> {s.nombre_inquilino}</p>
                <div className="buttons-container">
                  <button 
                    className="accept" 
                    onClick={() => responderSolicitud(s.alquiler_id, 'aceptado')}
                  >
                    Aceptar
                  </button>
                  <button 
                    className="reject" 
                    onClick={() => responderSolicitud(s.alquiler_id, 'rechazado')}
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Solicitudes;
