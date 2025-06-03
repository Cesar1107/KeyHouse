const db = require('../../DB/db');
const path = require('path');

// Crear nuevo reporte
const crearReporte = async (req, res) => {
  try {
    const {
      remitente_id,
      denunciado_id,
      casa_id,
      alquiler_id,
      motivo,
      descripcion
    } = req.body;

    if (!remitente_id || !denunciado_id || !motivo || !descripcion) {
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    const remitenteIdInt = parseInt(remitente_id);
    const denunciadoIdInt = parseInt(denunciado_id);
    const casaIdInt = casa_id ? parseInt(casa_id) : null;
    const alquilerIdInt = alquiler_id ? parseInt(alquiler_id) : null;

    if (isNaN(remitenteIdInt) || isNaN(denunciadoIdInt)) {
      return res.status(400).json({ error: 'IDs inválidos.' });
    }

    // Guardar solo el nombre del archivo, no la ruta completa
    const imagen = req.file ? req.file.filename : null;

    const result = await db.query(
      `INSERT INTO reportes 
        (remitente_id, denunciado_id, casa_id, alquiler_id, motivo, descripcion, imagen, estado) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente') 
       RETURNING *`,
      [remitenteIdInt, denunciadoIdInt, casaIdInt, alquilerIdInt, motivo, descripcion, imagen]
    );

    res.status(201).json({ mensaje: 'Reporte enviado correctamente.', reporte: result.rows[0] });
  } catch (error) {
    console.error('Error al registrar el reporte:', error);
    res.status(500).json({ error: 'Error al registrar el reporte.' });
  }
};

// Obtener todos los reportes (admin) con joins para mostrar datos amigables
const obtenerReportes = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        r.*,
        u1.nombre AS remitente_nombre,
        u1.email AS remitente_email,
        u2.nombre AS denunciado_nombre,
        u2.email AS denunciado_email,
        c.ubicacion AS casa_direccion
      FROM reportes r
      LEFT JOIN usuarios u1 ON r.remitente_id = u1.id_usuario
      LEFT JOIN usuarios u2 ON r.denunciado_id = u2.id_usuario
      LEFT JOIN casas c ON r.casa_id = c.id
      ORDER BY r.id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    res.status(500).json({ error: 'Error al obtener los reportes.' });
  }
};

// Actualizar estado de un reporte (admin)
const actualizarEstadoReporte = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!['pendiente', 'resuelto', 'rechazado'].includes(estado)) {
    return res.status(400).json({ error: 'Estado no válido.' });
  }

  try {
    await db.query('UPDATE reportes SET estado = $1 WHERE id = $2', [estado, id]);
    res.json({ mensaje: 'Estado del reporte actualizado correctamente.' });
  } catch (error) {
    console.error('Error al actualizar el estado del reporte:', error);
    res.status(500).json({ error: 'Error al actualizar el estado del reporte.' });
  }
};

module.exports = {
  crearReporte,
  obtenerReportes,
  actualizarEstadoReporte
};
