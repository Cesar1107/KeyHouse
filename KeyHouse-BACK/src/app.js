const express = require('express');
const config = require('./config');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares personalizados
const csp = require('./middleware/csp');
const error_red = require('./red/errors');

// Importación de rutas
const usuariosRuta = require('./modulos/usuarios/rutas');
const casasRuta = require('./modulos/casas/rutas');
const alquileresRuta = require('./modulos/alquileres/rutas');
const favoritosRuta = require('./modulos/favoritos/rutas');

// Conexión a la base de datos
const { query } = require('./DB/db'); // importamos solo la función query

// Middleware general
app.use(csp); // Política de seguridad de contenido
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de puerto (importante para index.js)
app.set('port', config.app.port);

// Rutas API
app.use('/api/usuarios', usuariosRuta);
app.use('/api/casas', casasRuta);
app.use('/api/alquileres', alquileresRuta);
app.use('/api/favoritos', favoritosRuta);

// Ruta adicional para obtener favoritos de un usuario
app.get('/api/favoritos', async (req, res) => {
  const usuario_id = req.query.usuario_id;
  if (!usuario_id) {
    return res.status(400).json({ error: 'Falta el parámetro usuario_id' });
  }

  try {
    const queryStr = `
      SELECT * FROM casas 
      WHERE id IN (
        SELECT casa_id FROM favoritos WHERE usuario_id = $1
      )
    `;
    const result = await query(queryStr, [usuario_id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener los favoritos:', err);
    res.status(500).json({ error: 'Error al obtener los favoritos' });
  }
});

// Servir imágenes estáticamente desde la carpeta /uploads
app.use("/uploads", express.static("uploads"));

// Middleware de manejo de errores (debe ir al final)
app.use(error_red);

module.exports = app;
