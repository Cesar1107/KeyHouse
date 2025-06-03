import React, { useEffect, useState } from "react";

export default function ReportesAdmin() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch reportes al cargar
  useEffect(() => {
    fetchReportes();
  }, []);

  const fetchReportes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reportes");
      if (!res.ok) throw new Error("Error al obtener reportes");
      const data = await res.json();
      setReportes(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado del reporte
  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const res = await fetch(`/api/reportes/${id}`, {
        method: "PUT", // o PATCH según tu backend
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error("No se pudo actualizar el estado");
      // Refrescar lista
      fetchReportes();
    } catch (e) {
      alert("Error al cambiar estado: " + e.message);
    }
  };

  if (loading) return <p>Cargando reportes...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Reportes</h2>
      <table border="1" cellPadding="5" cellSpacing="0" style={{ width: "100%", borderCollapse: "collapse" }}>
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
            <th>Fecha reporte</th>
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
              <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>{r.descripcion}</td>
              <td>
                {r.imagen ? (
                  <a href={r.imagen} target="_blank" rel="noopener noreferrer">
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
                  <button onClick={() => cambiarEstado(r.id, "resuelto")} style={{ marginRight: 5 }}>
                    Marcar como resuelto
                  </button>
                )}
                {r.estado !== "rechazado" && (
                  <button onClick={() => cambiarEstado(r.id, "rechazado")} style={{ marginRight: 5 }}>
                    Rechazar
                  </button>
                )}
              </td>
            </tr>
          ))}
          {reportes.length === 0 && (
            <tr>
              <td colSpan="11" style={{ textAlign: "center" }}>
                No hay reportes
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
