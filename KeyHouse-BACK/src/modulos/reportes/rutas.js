const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
  crearReporte,
  obtenerReportes,
  actualizarEstadoReporte
} = require('./controlador');

// Configuración de multer para guardar en KeyHouse-BACK/uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // __dirname apunta a modulos/reportes/, entonces ../../uploads apunta a KeyHouse-BACK/uploads
    cb(null, path.resolve(__dirname, '../../../uploads'));
  },
  filename: (req, file, cb) => {
    // Evitar problemas con espacios y caracteres raros
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, Date.now() + '-' + safeName);
  }
});

const upload = multer({ storage });

// Crear reporte con imagen
router.post('/', upload.single('imagen'), crearReporte);

// Obtener todos los reportes (admin)
router.get('/', obtenerReportes);

// Actualizar estado del reporte (admin)
router.put('/:id', actualizarEstadoReporte);

module.exports = router;
