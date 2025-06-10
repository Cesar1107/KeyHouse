const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../../DB/db");
const { 
  obtenerCasas, 
  obtenerCasasPorUsuario, 
  registrarCasa, 
  eliminarCasa,
  actualizarCasa 
} = require("./controlador");
const { getCoordinatesFromAddress } = require('../../utils/geocoding');

const router = express.Router();

// Configurar almacenamiento de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Carpeta donde se guardan las imágenes
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nombre único para cada archivo
  },
});

const upload = multer({ storage });

router.post('/geocoding', async (req, res) => {
  const { direccion } = req.body;

  try {
    const coords = await getCoordinatesFromAddress(direccion);
    res.json(coords);
  } catch (error) {
    console.error('Error en geocoding:', error.message);
    res.status(500).json({ error: 'Error al obtener coordenadas' });
  }
});

// Middleware para servir archivos estáticos desde la carpeta "uploads"
router.use("/uploads", express.static(path.join(__dirname, "../../../uploads")));

// Obtener todas las casas
router.get("/", async (req, res) => {
    try {
      const query = "SELECT * FROM casas ORDER BY id DESC";
      const result = await db.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error("Error al obtener casas:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Obtener casas por usuario
router.get("/usuario/:usuario_id", async (req, res) => {
    const { usuario_id } = req.params;
    
    try {
        console.log(`Buscando propiedades para usuario_id: ${usuario_id}`);
        
        // Primero verificar estructura de la tabla
        const checkQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'casas' 
            AND column_name LIKE '%usuario%'
        `;
        const columnsResult = await db.query(checkQuery);
        console.log('Columnas relacionadas con usuario:', columnsResult.rows);
        
        const userIdNum = parseInt(usuario_id, 10);
        
        // Usamos la columna correcta basada en la verificación
        let userColumn = 'usuario_id'; // Valor predeterminado
        if (columnsResult.rows.length > 0) {
            userColumn = columnsResult.rows[0].column_name;
        }
        
        const query = `SELECT * FROM casas WHERE ${userColumn} = $1 ORDER BY id DESC`;
        console.log(`Ejecutando query: ${query} con usuario_id=${userIdNum}`);
        
        const result = await db.query(query, [userIdNum]);
        console.log(`Encontradas ${result.rows.length} propiedades`);
        
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener casas del usuario:", error);
        res.status(500).json({ error: "Error al obtener las propiedades del usuario", detalles: error.message });
    }
});
  
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // Obtener la casa
        const queryCasa = "SELECT * FROM casas WHERE id = $1";
        const resultCasa = await db.query(queryCasa, [id]);

        if (resultCasa.rows.length === 0) {
            return res.status(404).json({ error: "Casa no encontrada" });
        }

        const casa = resultCasa.rows[0];

        // Obtener reportes hechos al dueño de esta casa
        const queryReportes = `
            SELECT DISTINCT motivo
            FROM reportes
            WHERE denunciado_id = $1
        `;
        const resultReportes = await db.query(queryReportes, [casa.usuario_id]);

        // Extraer solo los motivos
        const motivos = resultReportes.rows.map(r => r.motivo);

        // Incluir los reportes en la respuesta
        casa.reportes_dueno = motivos;

        res.json(casa);
    } catch (error) {
        console.error("Error al obtener la casa:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


// Ruta para registrar una casa
router.post("/registrar", upload.array("imagen", 5), async (req, res) => {
  try {
    console.log("Datos recibidos en req.body:", req.body);
    console.log("Archivos recibidos en req.files:", req.files);

    const { titulo, descripcion, ubicacion, precio, usuario_id, latitud, longitud } = req.body;

    if (!titulo || !descripcion || !ubicacion || !precio || !usuario_id || !latitud || !longitud) {
      return res.status(400).json({ error: "Todos los campos son obligatorios, incluyendo latitud y longitud" });
    }

    const imagenes = req.files.map(file => file.path.replace(/\\/g, "/"));
    const imagenesJSON = JSON.stringify(imagenes);

    const query = `
      INSERT INTO casas (titulo, descripcion, ubicacion, precio, imagen, usuario_id, latitud, longitud) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
    `;
    const values = [titulo, descripcion, ubicacion, precio, imagenesJSON, usuario_id, latitud, longitud];

    const result = await db.query(query, values);

    console.log("Casa guardada en la base de datos:", result.rows[0]);

    res.json({ message: "Casa registrada exitosamente", casa: result.rows[0] });

  } catch (error) {
    console.error("Error al registrar casa:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});



// Ruta para actualizar una casa
router.put("/:id", upload.array("imagen", 5), async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descripcion, ubicacion, precio, disponible, usuario_id } = req.body;
        
        console.log('Datos recibidos:', req.body);
        console.log('Archivos recibidos:', req.files);
        
        // Convertir usuario_id a número para asegurar comparación correcta
        const userIdNum = parseInt(usuario_id, 10);
        
        // Verificar que la casa pertenece al usuario
        const verificarQuery = "SELECT * FROM casas WHERE id = $1 AND usuario_id = $2";
        const verificacion = await db.query(verificarQuery, [id, userIdNum]);
        
        if (verificacion.rows.length === 0) {
            return res.status(403).json({ error: "No tienes permiso para modificar esta propiedad" });
        }
        
        // Convertir disponible a booleano
        const isDisponible = disponible === 'true' || disponible === true;
        
        // Construir la actualización dinámicamente
        let updateFields = [];
        let values = [];
        let paramCount = 1;
        
        if (titulo) {
            updateFields.push(`titulo = $${paramCount}`);
            values.push(titulo);
            paramCount++;
        }
        
        if (descripcion) {
            updateFields.push(`descripcion = $${paramCount}`);
            values.push(descripcion);
            paramCount++;
        }
        
        if (ubicacion) {
            updateFields.push(`ubicacion = $${paramCount}`);
            values.push(ubicacion);
            paramCount++;
        }
        
        if (precio) {
            updateFields.push(`precio = $${paramCount}`);
            values.push(precio);
            paramCount++;
        }
        
        // Siempre incluir disponible para evitar confusiones
        updateFields.push(`disponible = $${paramCount}`);
        values.push(isDisponible);
        paramCount++;
        
        // Si hay nuevas imágenes, actualizarlas
        if (req.files && req.files.length > 0) {
            const imagenes = req.files.map(file => file.path.replace(/\\/g, "/"));
            const imagenesJSON = JSON.stringify(imagenes);
            
            updateFields.push(`imagen = $${paramCount}`);
            values.push(imagenesJSON);
            paramCount++;
        }
        
        // Agregar el ID al final del array de valores
        values.push(id);
        
        const updateQuery = `
            UPDATE casas 
            SET ${updateFields.join(', ')} 
            WHERE id = $${paramCount} 
            RETURNING *
        `;
        
        console.log('Query:', updateQuery);
        console.log('Values:', values);
        
        const result = await db.query(updateQuery, values);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Propiedad no encontrada" });
        }
        
        res.json({ 
            mensaje: "Propiedad actualizada con éxito", 
            casa: result.rows[0] 
        });
        
    } catch (error) {
        console.error("Error al actualizar casa:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Ruta para eliminar una casa
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id } = req.query;

    if (!usuario_id) {
      return res.status(400).json({ error: "Se requiere ID de usuario para eliminar la propiedad" });
    }

    // Verificar que la propiedad pertenece al usuario
    const verificarQuery = "SELECT * FROM casas WHERE id = $1 AND usuario_id = $2";
    const verificacion = await db.query(verificarQuery, [id, usuario_id]);

    if (verificacion.rows.length === 0) {
      return res.status(403).json({ error: "No tienes permiso para eliminar esta propiedad" });
    }

    // Intentar eliminar referencias en favoritos (si existen)
    try {
      await db.query("DELETE FROM favoritos WHERE casa_id = $1", [id]);
      console.log(`Referencias en favoritos eliminadas para la propiedad con ID: ${id}`);
    } catch (error) {
      console.warn(`No se encontraron referencias en favoritos para la propiedad con ID: ${id}`);
    }

    // Continuar con la eliminación de la propiedad
    const deleteQuery = "DELETE FROM casas WHERE id = $1 RETURNING *";
    const result = await db.query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Propiedad no encontrada" });
    }

    res.json({ mensaje: "Propiedad eliminada con éxito" });
  } catch (error) {
    console.error("Error al eliminar casa:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Endpoint temporal para diagnóstico - Quitar después
router.get("/diagnostico/esquema", async (req, res) => {
    try {
        // Obtener estructura de la tabla casas
        const tableQuery = `
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'casas'
            ORDER BY ordinal_position
        `;
        const tableResult = await db.query(tableQuery);
        
        // Obtener muestra de datos (primera casa)
        const sampleQuery = "SELECT * FROM casas LIMIT 1";
        const sampleResult = await db.query(sampleQuery);
        
        res.json({
            estructura: tableResult.rows,
            ejemplo: sampleResult.rows[0] || null
        });
    } catch (error) {
        console.error("Error en diagnóstico:", error);
        res.status(500).json({ error: error.message });
    }
});

// Eliminar propiedad (método adicional sugerido)
const handleEliminarPropiedad = async (id) => {
  console.log(`Intentando eliminar propiedad con ID: ${id}`);
  if (window.confirm('¿Estás seguro de que deseas eliminar esta propiedad? Esta acción no se puede deshacer.')) {
    const usuario_id = localStorage.getItem('usuario_id');

    if (!usuario_id) {
      setMensaje('Error: No se pudo verificar tu identidad. Intenta iniciar sesión nuevamente.');
      console.error('Error: usuario_id no encontrado en localStorage.');
      return;
    }

    console.log(`Usuario ID recuperado: ${usuario_id}`);

    try {
      setMensaje('');

      // Eliminar la propiedad
      console.log(`Enviando solicitud DELETE a /api/casas/${id} con usuario_id: ${usuario_id}`);
      const response = await axios.delete(`http://localhost:4000/api/casas/${id}`, {
        params: { usuario_id },
      });

      console.log('Respuesta del servidor recibida:', response);

      if (response.status === 200 && response.data?.mensaje === "Propiedad eliminada con éxito") {
        console.log('Eliminación exitosa en el backend.');

        // Actualiza el estado para reflejar la eliminación
        const propiedadesActualizadas = propiedades.filter(prop => prop.id !== id);
        setPropiedades(propiedadesActualizadas);

        // Actualiza el localStorage
        localStorage.setItem('userProperties', JSON.stringify(propiedadesActualizadas));

        // Muestra mensaje de éxito
        setMensaje('Propiedad eliminada con éxito');
        console.log('Estado y localStorage actualizados.');
      } else {
        console.warn('Respuesta inesperada del servidor:', response.data);
        setMensaje(response.data?.mensaje || response.data?.error || 'Error inesperado al eliminar la propiedad.');
      }
    } catch (error) {
      console.error('Error completo al eliminar propiedad:', error);

      if (error.response) {
        const errorMsg = error.response.data?.error || error.response.data?.mensaje || `Error del servidor (${error.response.status})`;
        setMensaje(`Error al eliminar: ${errorMsg}`);
        console.error('Detalles del error del servidor:', error.response.data);
      } else if (error.request) {
        setMensaje('Error de red: No se pudo conectar con el servidor.');
        console.error('Error de red:', error.request);
      } else {
        setMensaje(`Error en la solicitud: ${error.message}`);
        console.error('Error en configuración de Axios:', error.message);
      }
    }
  } else {
    console.log('Eliminación cancelada por el usuario.');
  }
};

module.exports = router;