const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
  crearReporte,
  obtenerReportes,
  actualizarEstadoReporte
} = require('./controlador');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Crear reporte
router.post('/', upload.single('imagen'), crearReporte);

// Obtener todos los reportes (admin)
router.get('/', obtenerReportes);

// Actualizar estado del reporte (admin)
router.put('/:id', actualizarEstadoReporte);

module.exports = router;
