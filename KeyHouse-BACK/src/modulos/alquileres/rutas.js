const express = require('express');
const router = express.Router();
const { 
  registrarAlquiler, 
  responderSolicitud, 
  obtenerSolicitudesDelDueno, 
  obtenerAlquilerAceptadoPorCasa 
} = require('./controlador');

const { query } = require('../../DB/db'); // importamos solo la función query

// Rutas usando controlador para la mayoría
router.post('/registrar', registrarAlquiler);
router.post('/responder-solicitud', responderSolicitud);
router.get('/solicitudes/:idDueno', obtenerSolicitudesDelDueno);
router.get('/estado/:casa_id', obtenerAlquilerAceptadoPorCasa);

// Ruta /aceptado/:id usando query para consultar
router.get('/aceptado/:id', async (req, res) => {
  const usuario_id = req.params.id;

  try {
    const result = await query(
      `SELECT * FROM alquileres WHERE usuario_id = $1 AND estado = 'aceptado'`,
      [usuario_id]
    );

    if (result.rows.length > 0) {
      return res.json({ aceptado: true, alquiler: result.rows[0] });
    } else {
      return res.json({ aceptado: false });
    }
  } catch (error) {
    console.error('Error en /aceptado/:id', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
