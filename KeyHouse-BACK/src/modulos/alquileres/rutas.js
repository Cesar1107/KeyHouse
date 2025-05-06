const express = require('express');
const router = express.Router();
const { registrarAlquiler, responderSolicitud, obtenerSolicitudesDelDueno } = require('./controlador');
const db = require('../../DB/db'); // Asegúrate de que la ruta sea correcta
router.post('/registrar', registrarAlquiler);
router.post('/responder-solicitud', responderSolicitud);

// GET /alquileres/solicitudes/:idDueno
router.get('/solicitudes/:idDueno', obtenerSolicitudesDelDueno);

module.exports = router;
