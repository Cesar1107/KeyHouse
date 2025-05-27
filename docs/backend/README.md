# Documentación del Backend - KeyHouse

## Descripción General

El backend de KeyHouse es una API REST desarrollada con Node.js y Express que gestiona un sistema de alquiler de propiedades inmobiliarias. Permite el registro de usuarios, la publicación de propiedades, favoritos, y la gestión de contratos de alquiler.

## Estructura del Proyecto

```
KeyHouse-BACK/
├── src/
│   ├── app.js            # Configuración principal de Express
│   ├── config.js         # Configuraciones de la aplicación
│   ├── index.js          # Punto de entrada
│   ├── DB/               # Conexión y operaciones con base de datos
│   ├── middleware/       # Middlewares personalizados
│   ├── modulos/          # Componentes del sistema por módulos
│   │   ├── usuarios/     # Gestión de usuarios
│   │   ├── casas/        # Gestión de propiedades
│   │   ├── alquileres/   # Gestión de alquileres
│   │   └── favoritos/    # Gestión de favoritos
│   ├── red/              # Manejo de respuestas HTTP y errores
│   └── utils/            # Utilidades (generación de PDF, etc.)
├── uploads/              # Almacenamiento de imágenes
└── contratos/            # Almacenamiento de contratos generados
```

## Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución
- **Express**: Framework web
- **PostgreSQL**: Base de datos relacional
- **Multer**: Manejo de subida de archivos
- **PDFKit**: Generación de contratos en PDF
- **CORS**: Control de acceso HTTP

## Configuración

El sistema utiliza variables de entorno para la configuración:

```javascript
// Configuración de la aplicación en config.js
module.exports = {
    app: {
        port: process.env.PORT || 4000
    },
    pg: {
        host: process.env.PG_HOST || 'localhost',
        user: process.env.PG_USER || 'postgres',
        password: process.env.PG_PASSWORD || 'password',
        database: process.env.PG_DATABASE || 'db_prueba',
        port: process.env.PG_PORT || 5432,
    }
}
```

## Base de Datos

El sistema utiliza PostgreSQL con las siguientes tablas principales:

- **usuarios**: Información de usuarios (propietarios e inquilinos)
- **casas**: Propiedades disponibles para alquilar
- **alquileres**: Solicitudes y contratos de alquiler
- **favoritos**: Propiedades marcadas como favoritas por los usuarios
- **contratos**: Documentos legales generados

## Módulos Principales

### 1. Usuarios

Gestiona el registro, autenticación y actualización de información de usuarios.

**Endpoints**:
- `GET /api/usuarios`: Obtiene todos los usuarios
- `GET /api/usuarios/:id`: Obtiene un usuario por ID
- `POST /api/usuarios`: Registra o actualiza un usuario
- `PUT /api/usuarios`: Elimina un usuario
- `PUT /api/usuarios/cambiarContrasena`: Actualiza la contraseña de un usuario

### 2. Casas (Propiedades)

Permite la gestión de propiedades inmobiliarias:

**Endpoints**:
- `GET /api/casas`: Obtiene todas las propiedades
- `GET /api/casas/:id`: Obtiene una propiedad específica por su ID
- `GET /api/casas/usuario/:usuario_id`: Obtiene propiedades de un usuario específico
- `POST /api/casas/registrar`: Registra una nueva propiedad (incluye carga de imágenes)
- `PUT /api/casas/:id`: Actualiza información de una propiedad
- `DELETE /api/casas/:id`: Elimina una propiedad

### 3. Alquileres

Gestiona el proceso de alquiler de propiedades:

**Endpoints**:
- `POST /api/alquileres/registrar`: Envía una solicitud de alquiler
- `POST /api/alquileres/responder-solicitud`: Acepta o rechaza una solicitud
- `GET /api/alquileres/solicitudes/:idDueno`: Obtiene todas las solicitudes para un propietario

### 4. Favoritos

Permite a los usuarios guardar propiedades como favoritas:

**Endpoints**:
- `GET /api/favoritos`: Obtiene los favoritos del usuario autenticado
- Endpoints adicionales para agregar y eliminar favoritos

## Características Especiales

### Generación de Contratos PDF

El sistema genera automáticamente contratos de arrendamiento en formato PDF cuando se acepta una solicitud de alquiler:

```javascript
// Se genera un contrato cuando se acepta una solicitud
if (decision === 'aceptado') {
  // Obtener datos necesarios
  const datos = result.rows[0];
  const nombrePDF = await generarContratoPDF(datos, fechaInicio);
  
  // Guardar referencia en la base de datos
  await db.query(`
    INSERT INTO contratos (alquiler_id, propietario_id, inquilino_id, casa_id, fecha_inicio, contenido)
    VALUES ($1, $2, $3, $4, NOW(), $5)
  `, [datos.alquiler_id, datos.propietario_id, datos.inquilino_id, datos.casa_id, nombrePDF]);
}
```

### Manejo de Imágenes

El sistema permite la carga y almacenamiento de múltiples imágenes para cada propiedad usando Multer:

```javascript
// Configuración para subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });
```

## Manejo de Errores

El sistema implementa un manejo centralizado de errores:

```javascript
function errors(err, req, res, next){
    console.error('[error]', err);
    const mensaje = err.message || 'Error interno';
    const status = err.statusCode || 500;
    respuestas.error(req, res, mensaje, status);
}
```

## Seguridad

- Implementación de CORS para limitar el acceso al API
- Verificación de propiedad para operaciones de actualización y eliminación

## Instrucciones de Instalación

1. Clonar el repositorio
2. Ejecutar `npm install` para instalar dependencias
3. Configurar variables de entorno en un archivo `.env`
4. Iniciar el servidor con `npm run dev`
