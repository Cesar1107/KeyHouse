const db = require('../../DB/db'); // Asegúrate de que la ruta sea correcta
const generarContratoPDF = require('../../utils/generarContrato');

async function obtenerSolicitudesDelDueno(req, res) {
  const { idDueno } = req.params;

  try {
    const resultado = await db.query(`
      SELECT 
        a.id AS alquiler_id,
        a.estado,
        u.nombre AS nombre_inquilino,
        c.ubicacion,
        c.titulo,
        c.imagen
      FROM alquileres a
      JOIN casas c ON a.casa_id = c.id
      JOIN usuarios u ON a.usuario_id = u.id_usuario
      WHERE c.usuario_id = $1 AND a.estado = 'pendiente'
    `, [idDueno]);


    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).send('Error al obtener solicitudes');
  }
}

async function registrarAlquiler(req, res) {
  const { usuario_id, casa_id } = req.body;

  try {
    if (!db || typeof db.query !== 'function') {
      console.error('El cliente de la base de datos no está correctamente inicializado');
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    await db.query(
      'INSERT INTO alquileres (usuario_id, casa_id, fecha_alquiler, estado) VALUES ($1, $2, NOW(), $3)',
      [usuario_id, casa_id, 'pendiente']
    );

    res.json({ mensaje: 'Alquiler registrado con éxito.' });
  } catch (error) {
    console.error('Error al registrar alquiler:', error);
    res.status(500).json({ error: 'Error al registrar el alquiler.' });
  }
}

async function responderSolicitud(req, res) {
  const { alquiler_id, decision } = req.body;
  const fechaInicio = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD
  
  try {
    await db.query('UPDATE alquileres SET estado = $1 WHERE id = $2', [decision, alquiler_id]);

    if (decision === 'aceptado') {
      const result = await db.query(`
        SELECT 
          a.id AS alquiler_id,
          a.usuario_id AS inquilino_id,
          c.id AS casa_id,
          c.usuario_id AS propietario_id,
          u1.nombre AS nombre_inquilino,
          u2.nombre AS nombre_dueno,
          c.ubicacion AS direccion,
          u1.cedula AS cedula_inquilino,
          u2.cedula AS cedula_dueno,
          c.precio AS precio,
          c.titulo
        FROM alquileres a
        JOIN casas c ON a.casa_id = c.id
        JOIN usuarios u1 ON a.usuario_id = u1.id_usuario
        JOIN usuarios u2 ON c.usuario_id = u2.id_usuario
        WHERE a.id = $1
      `, [alquiler_id]);

      if (result.rows.length === 0) {
        return res.status(404).send('No se encontró el alquiler');
      }

      const datos = result.rows[0];

      console.log('Datos del contrato:', datos); // 🔍 Para depuración

      const nombrePDF = await generarContratoPDF(datos, fechaInicio);

      await db.query(`
        INSERT INTO contratos (alquiler_id, propietario_id, inquilino_id, casa_id, fecha_inicio, contenido)
        VALUES ($1, $2, $3, $4, NOW(), $5)
      `, [
        datos.alquiler_id,
        datos.propietario_id,
        datos.inquilino_id,
        datos.casa_id,
        nombrePDF
      ]);

      await db.query(`
        UPDATE casas SET disponible = false WHERE id = $1
      `, [datos.casa_id]);
    }

    res.send('Solicitud procesada correctamente');
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).send('Error en el procesamiento de la solicitud');
  }
}

module.exports = {
  registrarAlquiler,
  responderSolicitud,
  obtenerSolicitudesDelDueno
};
