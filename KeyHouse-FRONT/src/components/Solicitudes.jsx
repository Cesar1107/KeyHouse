import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
    <div>
      <h2>Solicitudes de arriendo recibidas</h2>
      {solicitudes.length === 0 ? (
        <p>No tienes solicitudes pendientes.</p>
      ) : (
        solicitudes.map(s => (
          <div key={s.alquiler_id} className="card">
            <p><strong>Casa:</strong> {s.direccion}</p>
            <p><strong>Inquilino:</strong> {s.nombre_inquilino}</p>
            <button onClick={() => responderSolicitud(s.alquiler_id, 'aceptado')}>Aceptar</button>
            <button onClick={() => responderSolicitud(s.alquiler_id, 'rechazado')}>Rechazar</button>
          </div>
        ))
      )}
    </div>
  );
};

export default Solicitudes;
