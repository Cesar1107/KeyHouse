const pool = require("../../DB/db");
const multer = require("multer");
const path = require("path");

// Configurar multer para subir imágenes a "uploads/"
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Carpeta donde se guardan las imágenes
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const registrarCasa = async (req, res) => {
  try {
    const { titulo, descripcion, precio, ubicacion, usuario_id } = req.body;
    const imagen = req.file ? req.file.filename : null;

    if (!titulo || !descripcion || !precio || !ubicacion || !usuario_id || !imagen) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const query = `
      INSERT INTO casas (titulo, descripcion, precio, ubicacion, imagen, usuario_id)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
    `;
    const values = [titulo, descripcion, precio, ubicacion, imagen, usuario_id];

    const { rows } = await pool.query(query, values);
    res.json({ mensaje: "Casa registrada con éxito", casa: rows[0] });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar la casa" });
  }
};

// Nueva función para obtener casas por usuario -->> Ver si necesarios 
const obtenerCasasPorUsuario = async (req, res) => {
  try {
    const { usuario_id } = req.params;
    
    if (!usuario_id) {
      return res.status(400).json({ error: "ID de usuario es requerido" });
    }
    
    const query = `
      SELECT * FROM casas 
      WHERE usuario_id = $1 
      ORDER BY id DESC
    `;
    
    const { rows } = await pool.query(query, [usuario_id]);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener casas del usuario:", error);
    res.status(500).json({ error: "Error al obtener las propiedades" });
  }
};

// Nueva función para eliminar una casa
const eliminarCasa = async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id } = req.body; // Para verificar que el usuario sea el propietario
    
    // Verificar que la casa pertenece al usuario
    const verificarQuery = "SELECT * FROM casas WHERE id = $1 AND usuario_id = $2";
    const verificacion = await pool.query(verificarQuery, [id, usuario_id]);
    
    if (verificacion.rows.length === 0) {
      return res.status(403).json({ error: "No tienes permiso para eliminar esta propiedad" });
    }
    
    // Eliminar la casa
    const deleteQuery = "DELETE FROM casas WHERE id = $1 RETURNING *";
    const result = await pool.query(deleteQuery, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Propiedad no encontrada" });
    }
    
    res.json({ mensaje: "Propiedad eliminada con éxito" });
  } catch (error) {
    console.error("Error al eliminar casa:", error);
    res.status(500).json({ error: "Error al eliminar la propiedad" });
  }
};

// Función para actualizar una casa
const actualizarCasa = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, ubicacion, precio, disponible, usuario_id } = req.body;
    
    // Verificar que la casa pertenece al usuario
    const verificarQuery = "SELECT * FROM casas WHERE id = $1 AND usuario_id = $2";
    const verificacion = await pool.query(verificarQuery, [id, usuario_id]);
    
    if (verificacion.rows.length === 0) {
      return res.status(403).json({ error: "No tienes permiso para modificar esta propiedad" });
    }
    
    // Construir la consulta dinámicamente
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
    
    if (disponible !== undefined) {
      updateFields.push(`disponible = $${paramCount}`);
      values.push(disponible);
      paramCount++;
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No se proporcionaron campos para actualizar" });
    }
    
    // Agregar el ID al final del array de valores
    values.push(id);
    
    const updateQuery = `
      UPDATE casas 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramCount} 
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Propiedad no encontrada" });
    }
    
    res.json({ 
      mensaje: "Propiedad actualizada con éxito", 
      casa: result.rows[0] 
    });
    
  } catch (error) {
    console.error("Error al actualizar casa:", error);
    res.status(500).json({ error: "Error al actualizar la propiedad" });
  }
};

module.exports = { 
  registrarCasa, 
  upload, 
  obtenerCasasPorUsuario, 
  eliminarCasa,
  actualizarCasa 
};
