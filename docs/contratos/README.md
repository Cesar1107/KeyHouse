# Documentación del Sistema de Contratos - KeyHouse

## Descripción General

El sistema de contratos de KeyHouse permite la generación automática de documentos legales de arrendamiento cuando un propietario acepta una solicitud de alquiler. Estos contratos se generan como archivos PDF, se almacenan en el servidor y se vinculan tanto a la propiedad como a los usuarios involucrados.

## Estructura de Almacenamiento

```
contratos/
├── contrato_25.pdf  # Contratos generados con ID de alquiler
├── contrato_8.pdf
└── contrato_9.pdf
```

Los archivos de contratos se nombran siguiendo el patrón `contrato_[ID_ALQUILER].pdf`, donde `[ID_ALQUILER]` corresponde al identificador único de la transacción de alquiler en la base de datos.

## Flujo de Generación de Contratos

1. **Solicitud de Alquiler**: Un usuario (inquilino) envía una solicitud de alquiler para una propiedad.
2. **Notificación al Propietario**: El sistema notifica al propietario sobre la solicitud pendiente.
3. **Decisión del Propietario**: El propietario revisa y decide aceptar o rechazar la solicitud.
4. **Generación Automática**: Al aceptar, el sistema genera automáticamente el contrato PDF.

## Componentes del Backend

### Generación de PDF (generarContrato.js)

Este módulo utiliza PDFKit para crear documentos PDF con la siguiente estructura:

```javascript
function generarContratoPDF(datos, fechaInicio) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const nombreArchivo = `contrato_${datos.alquiler_id}.pdf`;
    const ruta = path.join(__dirname, '../../../contratos', nombreArchivo);
    
    // Creación del documento PDF...
    // ...
    
    // Estructura del contrato:
    // 1. Encabezado y título
    // 2. Identificación de las partes (propietario e inquilino)
    // 3. Detalles del inmueble
    // 4. Duración del contrato
    // 5. Obligaciones del arrendatario
    // 6. Cláusulas adicionales
    // 7. Espacios para firmas
  });
}
```

### Controlador de Alquileres (controlador.js)

Este controlador maneja la lógica de respuesta a solicitudes y la generación de contratos:

```javascript
async function responderSolicitud(req, res) {
  const { alquiler_id, decision } = req.body;
  
  try {
    await db.query('UPDATE alquileres SET estado = $1 WHERE id = $2', [decision, alquiler_id]);

    if (decision === 'aceptado') {
      // Obtener datos necesarios para el contrato
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
      
      // Generar contrato PDF
      const nombrePDF = await generarContratoPDF(result.rows[0], fechaInicio);
      
      // Registrar contrato en base de datos
      await db.query(`
        INSERT INTO contratos (alquiler_id, propietario_id, inquilino_id, casa_id, fecha_inicio, contenido)
        VALUES ($1, $2, $3, $4, NOW(), $5)
      `, [
        result.rows[0].alquiler_id,
        result.rows[0].propietario_id,
        result.rows[0].inquilino_id,
        result.rows[0].casa_id,
        nombrePDF
      ]);
      
      // Actualizar disponibilidad de la propiedad
      await db.query(`UPDATE casas SET disponible = false WHERE id = $1`, 
        [result.rows[0].casa_id]);
    }
    
    res.send('Solicitud procesada correctamente');
  } catch (error) {
    // Manejo de errores...
  }
}
```

### Rutas de Alquileres (rutas.js)

```javascript
const router = express.Router();
router.post('/registrar', registrarAlquiler);
router.post('/responder-solicitud', responderSolicitud);
router.get('/solicitudes/:idDueno', obtenerSolicitudesDelDueno);
```

## Estructura del Contrato PDF

El contrato PDF generado incluye las siguientes secciones:

1. **Título**: "Contrato de Arrendamiento de Inmueble"
2. **Identificación de las partes**:
   - Datos del propietario (nombre, cédula)
   - Datos del inquilino (nombre, cédula)
3. **Inmueble**: Dirección y características de la propiedad
4. **Duración**: Fecha de inicio y términos de finalización
5. **Obligaciones del arrendatario**: Incluye el canon de arrendamiento (precio)
6. **Cláusulas adicionales**: Acuerdos específicos entre las partes
7. **Firmas**: Espacios designados para la firma del arrendador y arrendatario

## Integración con el Frontend

### Componente de Solicitudes (Solicitudes.jsx)

Este componente permite a los propietarios gestionar las solicitudes de alquiler:

```javascript
const responderSolicitud = async (alquilerId, decision) => {
  try {
    await axios.post('http://localhost:4000/api/alquileres/responder-solicitud', {
      alquiler_id: alquilerId,
      decision: decision // "aceptado" o "rechazado"
    });
    
    // Actualizar la interfaz tras la respuesta
    setSolicitudes(solicitudes.filter(s => s.alquiler_id !== alquilerId));
  } catch (err) {
    console.error('Error al responder solicitud', err);
  }
};
```

### Proceso de Solicitud de Alquiler (DetalleCasa.jsx)

En la vista de detalle de una propiedad, los inquilinos pueden enviar solicitudes:

```javascript
const handleAlquilar = async () => {
  if (!usuario_id) return setMensaje('Debes iniciar sesión para alquilar.');

  try {
    const response = await axios.post('http://localhost:4000/api/alquileres/registrar', {
      usuario_id,
      casa_id: id,
    });
    setMensaje(response.data.mensaje);
  } catch (error) {
    console.error('Error al alquilar la casa:', error);
    setMensaje('No se pudo alquilar la casa.');
  }
};
```

## Base de Datos

El sistema utiliza las siguientes tablas para gestionar los contratos:

1. **alquileres**: Registro de solicitudes de alquiler
   - `id`: Identificador único
   - `usuario_id`: ID del inquilino
   - `casa_id`: ID de la propiedad
   - `fecha_alquiler`: Timestamp de la solicitud
   - `estado`: Estado de la solicitud ('pendiente', 'aceptado', 'rechazado')

2. **contratos**: Registro de contratos generados
   - `alquiler_id`: Referencia al alquiler
   - `propietario_id`: ID del propietario
   - `inquilino_id`: ID del inquilino
   - `casa_id`: ID de la propiedad
   - `fecha_inicio`: Fecha de inicio del contrato
   - `contenido`: Ruta al archivo PDF generado

## Proceso Completo de Alquiler y Generación de Contratos

1. El inquilino visita la página de detalle de una propiedad y hace clic en "Alquilar"
2. El sistema registra una solicitud de alquiler en estado "pendiente"
3. El propietario recibe la solicitud en su panel de "Solicitudes"
4. Al aceptar una solicitud:
   - Se actualiza el estado de la solicitud a "aceptado"
   - Se obtienen los datos de las partes involucradas
   - Se genera automáticamente un contrato PDF
   - Se guarda el archivo en la carpeta contratos
   - Se registra el contrato en la base de datos
   - La propiedad se marca como no disponible

5. Si se rechaza:
   - Se actualiza el estado de la solicitud a "rechazado"
   - No se genera contrato
   - La propiedad sigue disponible

## Consideraciones de Seguridad

- Los contratos solo pueden ser generados por el propietario al aceptar solicitudes
- El sistema verifica los permisos antes de permitir acciones sobre solicitudes
- Los archivos PDF se almacenan en el servidor, no accesibles directamente desde el frontend