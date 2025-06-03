import React, { useEffect, useState } from "react";
import "../styles/ReportesAdmin.css";

export default function ReportesAdmin() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReportes();
  }, []);

  const fetchReportes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:4000/api/reportes");
      if (!res.ok) throw new Error("Error al obtener reportes");
      const data = await res.json();
      setReportes(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const res = await fetch(`http://localhost:4000/api/reportes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error("No se pudo actualizar el estado");
      fetchReportes();
    } catch (e) {
      alert("Error al cambiar estado: " + e.message);
    }
  };

  if (loading) return <p className="loading">Cargando reportes...</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className="reportes-container">
      <h2 className="titulo">Reportes de Usuarios</h2>
      <table className="tabla-reportes">
        <thead>
          <tr>
            <th>ID</th>
            <th>Remitente</th>
            <th>Denunciado</th>
            <th>Casa</th>
            <th>Alquiler</th>
            <th>Motivo</th>
            <th>Descripción</th>
            <th>Imagen</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reportes.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.remitente_nombre || r.remitente_id}</td>
              <td>{r.denunciado_nombre || r.denunciado_id}</td>
              <td>{r.casa_direccion || r.casa_id || "-"}</td>
              <td>{r.alquiler_id || "-"}</td>
              <td>{r.motivo}</td>
              <td className="descripcion">{r.descripcion}</td>
              <td>
                {r.imagen ? (
                  <a href={`http://localhost:4000/uploads/${r.imagen}`} target="_blank" rel="noopener noreferrer">
  Ver imagen
</a>


                ) : (
                  "-"
                )}
              </td>
              <td>{new Date(r.fecha_reporte).toLocaleString()}</td>
              <td>{r.estado}</td>
              <td>
                {r.estado !== "resuelto" && (
                  <button
                    className="btn-resuelto"
                    onClick={() => cambiarEstado(r.id, "resuelto")}
                  >
                    Marcar como resuelto
                  </button>
                )}
                {r.estado !== "rechazado" && (
                  <button
                    className="btn-rechazado"
                    onClick={() => cambiarEstado(r.id, "rechazado")}
                  >
                    Rechazar
                  </button>
                )}
              </td>
            </tr>
          ))}
          {reportes.length === 0 && (
            <tr>
              <td colSpan="11" className="sin-reportes">
                No hay reportes disponibles.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
