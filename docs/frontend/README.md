# Documentación del Frontend - KeyHouse

## Descripción General

El frontend de KeyHouse es una aplicación web desarrollada con React que proporciona una interfaz de usuario intuitiva para un sistema de alquiler de propiedades inmobiliarias. Permite a los usuarios buscar propiedades, registrarse, publicar propiedades, gestionar favoritos, solicitudes de alquiler y perfiles de usuario.

## Estructura del Proyecto

```
KeyHouse-FRONT/
├── public/
│   ├── favicon.ico
│   ├── index.html
│   ├── manifest.json
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── App.js                # Configuración de rutas
│   ├── index.js              # Punto de entrada
│   ├── components/           # Componentes React
│   │   ├── CreateAccount.jsx # Registro de usuarios
│   │   ├── DetalleCasa.jsx   # Vista detallada de propiedades
│   │   ├── EditarPropiedad.jsx # Editor de propiedades
│   │   ├── Favorites.jsx     # Gestión de favoritos
│   │   ├── Footer.jsx        # Pie de página
│   │   ├── ForgotPassword.jsx # Recuperación de contraseña
│   │   ├── Header.jsx        # Cabecera con navegación
│   │   ├── Home.jsx          # Página principal
│   │   ├── Layout.jsx        # Estructura base de la interfaz
│   │   ├── Login.jsx         # Inicio de sesión
│   │   ├── MisPropiedades.jsx # Gestión de propiedades
│   │   ├── Profile.jsx       # Perfil de usuario
│   │   ├── PublicarPropiedad.jsx # Publicación de propiedades
│   │   ├── Sitemap.jsx       # Mapa del sitio
│   │   ├── SobreNosotros.jsx # Información institucional
│   │   └── Solicitudes.jsx   # Gestión de solicitudes de alquiler
│   ├── images/               # Recursos gráficos
│   ├── services/             # Servicios de API
│   │   └── api.js            # Configuración de conexión al backend
│   └── styles/               # Hojas de estilo CSS
```

## Tecnologías Utilizadas

- **React**: Biblioteca principal para desarrollo de interfaces
- **React Router**: Gestión de rutas y navegación
- **Axios**: Cliente HTTP para consumir la API
- **LocalStorage**: Almacenamiento local para persistencia de sesiones
- **CSS**: Estilos personalizados por componente
- **React Icons**: Biblioteca de iconos

## Sistema de Autenticación

El sistema utiliza localStorage para gestionar la autenticación y almacenar datos de sesión:

```javascript
// Login.jsx - Proceso de autenticación
const handleLogin = async (event) => {
  event.preventDefault();
  try {
    const response = await fetch("http://localhost:4000/api/usuarios/");
    const data = await response.json();
    const user = userArray.find(
      (user) => user.email === email && user.contraseña === password
    );
    
    if (user) {
      // Guardar datos del usuario en localStorage
      localStorage.setItem(
        "userData",
        JSON.stringify({
          nombre: user.nombre || "",
          apellido: user.apellido || "",
          email: user.email,
          telefono: user.telefono || "",
          edad: user.edad || "",
          bio: user.bio || "",
        })
      );
      // Guardar estado de login
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("usuario_id", user.id_usuario);
      localStorage.setItem("id_usuario", user.id_usuario);

      navigate("/home");
    }
  } catch (error) {
    // Manejo de errores
  }
};
```

## Componentes Principales

### 1. Header

Barra de navegación superior con:
- Logo
- Buscador de propiedades
- Enlaces a secciones principales
- Gestión de sesión
- Avatar de usuario

```javascript
// Verificación de autenticación en componentes
useEffect(() => {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (!isLoggedIn) {
    navigate('/'); // Redirigir al login
  }
}, [navigate]);
```

### 2. Home

Muestra el listado principal de propiedades con filtrado y búsqueda:

- Listado de propiedades disponibles
- Filtrado por términos de búsqueda
- Vista previa de propiedades
- Funciones de favoritos

### 3. DetalleCasa

Muestra información detallada de una propiedad:

- Galería de imágenes
- Información de precio y ubicación
- Descripción detallada
- Botones para alquilar y agregar a favoritos
- Características de la propiedad

### 4. PublicarPropiedad

Formulario para publicar nuevas propiedades:

- Título, descripción, ubicación y precio
- Carga de múltiples imágenes con vista previa
- Validaciones de formulario

```javascript
// Manejo de carga de imágenes
const handleImageChange = (e) => {
  if (e.target.files) {
    const filesArray = Array.from(e.target.files);
    setImagenes(filesArray);
    
    // Crear URL para preview
    const previewURLs = filesArray.map(file => URL.createObjectURL(file));
    setPreview(previewURLs);
  }
};
```

### 5. Profile

Gestión del perfil de usuario:

- Visualización y edición de datos personales
- Cambio de avatar/imagen de perfil
- Almacenamiento local de datos

## Gestión de Favoritos

El sistema permite a los usuarios marcar propiedades como favoritas:

```javascript
// Añadir a favoritos
const handleAgregarFavorito = async (casa_id) => {
  const usuario_id = localStorage.getItem("usuario_id");
  if (!usuario_id) {
    setMensaje("Debes iniciar sesión para agregar a favoritos.");
    return;
  }

  try {
    await axios.post("http://localhost:4000/api/favoritos/agregar", {
      usuario_id,
      casa_id,
    });
    await verificarFavoritos(); // Actualizar estado
  } catch (error) {
    console.error("Error al agregar a favoritos:", error);
  }
};
```

## Gestión de Propiedades

Los propietarios pueden:
1. Publicar nuevas propiedades con imágenes
2. Editar propiedades existentes
3. Eliminar propiedades
4. Ver solicitudes de alquiler

```javascript
// Eliminar propiedad
const handleEliminarPropiedad = async (id) => {
  if (window.confirm('¿Estás seguro de que deseas eliminar esta propiedad?')) {
    const usuario_id = localStorage.getItem('usuario_id');
    try {
      // Intentar eliminar referencias en favoritos
      await axios.delete('http://localhost:4000/api/favoritos/eliminar', {
        data: { usuario_id, casa_id: id },
      });
      
      // Eliminar la propiedad
      const response = await axios.delete(`http://localhost:4000/api/casas/${id}`, {
        params: { usuario_id },
      });

      if (response.status === 200) {
        // Actualizar estado
        const propiedadesActualizadas = propiedades.filter(prop => prop.id !== id);
        setPropiedades(propiedadesActualizadas);
        localStorage.setItem('userProperties', JSON.stringify(propiedadesActualizadas));
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  }
};
```

## Sistema de Alquileres

Permite a los usuarios:
1. Enviar solicitudes de alquiler
2. Ver solicitudes recibidas (propietarios)
3. Aceptar o rechazar solicitudes

```javascript
const responderSolicitud = async (alquilerId, decision) => {
  try {
    await axios.post('http://localhost:4000/api/alquileres/responder-solicitud', {
      alquiler_id: alquilerId,
      decision: decision // "aceptado" o "rechazado"
    });
    // Actualización de la interfaz
  } catch (error) {
    console.error("Error al responder solicitud", error);
  }
};
```

## Estilos y Diseño

El proyecto utiliza CSS modular por componente:

- Diseño responsive
- Paleta de colores consistente
- Sistema de grillas para listados
- Formularios estilizados
- Animaciones y transiciones sutiles

Ejemplo de una tarjeta de propiedad:
```css
.property-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}
  
.property-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}
```

## Consideraciones de Seguridad

- Validación de autenticación en cada componente protegido
- Verificación de propiedad para edición y eliminación de propiedades
- Sanitización de datos de entrada
- Política de seguridad de contenido (CSP) configurada en index.html

## Integración con Backend

La comunicación con el backend se realiza mediante Axios:

```javascript
// Ejemplo de petición GET
const fetchCasas = async () => {
  try {
    const response = await axios.get("http://localhost:4000/api/casas");
    setCasas(response.data);
  } catch (error) {
    console.error("Error al cargar casas:", error);
  }
};

// Ejemplo de petición POST con FormData (subida de archivos)
const formData = new FormData();
formData.append('titulo', propiedad.titulo);
formData.append('descripcion', propiedad.descripcion);
formData.append('ubicacion', propiedad.ubicacion);
formData.append('precio', propiedad.precio);
formData.append('usuario_id', localStorage.getItem('usuario_id'));
      
// Agregar imágenes
imagenes.forEach((img) => {
  formData.append('imagen', img);
});
      
await axios.post('http://localhost:4000/api/casas/registrar', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
```

## Instrucciones de Desarrollo

1. Clonar el repositorio
2. Ejecutar `npm install` para instalar dependencias
3. Configurar la URL del backend en `services/api.js` si es necesario
4. Iniciar el servidor de desarrollo con `npm start`
5. Compilar para producción con `npm run build`