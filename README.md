# KeyHouse - Plataforma de Alquiler de Propiedades

![KeyHouse Logo](KeyHouse-FRONT/src/images/keyhouse_remove_background.png)

> Tu llave hacia un nuevo comienzo.

## 📋 Descripción

KeyHouse es una plataforma digital que conecta de manera sencilla, segura y eficiente a propietarios e inquilinos. 
Diseñada para revolucionar la forma en que las personas encuentran su próximo hogar, ofreciendo soluciones 
de alojamiento más humanas, accesibles y transparentes.

## 🏗️ Estructura del Proyecto

El proyecto está dividido en tres componentes principales:

```
KeyHouse/
│
├── KeyHouse-FRONT/ - Frontend React
│   ├── public/
│   └── src/
│      ├── components/
│      └── styles/
│
├── KeyHouse-BACK/ - Backend Node.js
│   ├── src/
│   │   ├── DB/       - Conexión y operaciones de base de datos
│   │   ├── middleware/
│   │   ├── modulos/  - Módulos de la aplicación (casas, usuarios, alquileres...)
│   │   ├── red/      - Utilidades de red y manejo de errores
│   │   └── utils/
│   └── uploads/      - Almacenamiento de imágenes
│
├── contratos/ - Documentos PDF generados
└── docs/ - Documentación
```

## 🛠️ Tecnologías Utilizadas

### Frontend
- React.js
- React Router Dom
- Axios
- CSS3

### Backend
- Node.js
- Express.js
- PostgreSQL
- Multer (manejo de archivos)
- PDFKit (generación de contratos)

## 🚀 Instalación y Configuración

### Requisitos Previos
- Node.js v14 o superior
- PostgreSQL 12 o superior
- npm o yarn

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/KeyHouse.git
   cd KeyHouse
   ```

2. **Instalar dependencias del backend**
   ```bash
   cd KeyHouse-BACK
   npm install
   ```

3. **Instalar dependencias del frontend**
   ```bash
   cd ../KeyHouse-FRONT
   npm install
   ```

4. **Configurar la base de datos**
   
   Crea una base de datos en PostgreSQL y configura las credenciales en config.js

5. **Iniciar el backend**
   ```bash
   cd ../KeyHouse-BACK
   npm start
   ```

6. **Iniciar el frontend**
   ```bash
   cd ../KeyHouse-FRONT
   npm start
   ```

## ✨ Características Principales

- **Gestión de Propiedades**: Publicación, edición y eliminación de propiedades
- **Búsqueda de Propiedades**: Búsquedas por ubicación, precio y características
- **Sistema de Favoritos**: Guardado de propiedades de interés
- **Gestión de Alquileres**: Solicitud, aprobación y seguimiento de alquileres
- **Generación de Contratos**: Creación automática de contratos en PDF
- **Perfiles de Usuario**: Perfiles para propietarios e inquilinos
- **Interfaz Responsiva**: Diseño adaptable a dispositivos móviles y de escritorio

## 🔒 Seguridad

El sistema incorpora las siguientes medidas de seguridad:

- **Control de Acceso**: Verificación de propiedad para operaciones de modificación y eliminación
- **Consultas Parametrizadas**: Prevención de inyecciones SQL
- **Manejo Seguro de Archivos**: Validación de tamaño e imágenes subidas
- **Manejo de Errores**: Sistema centralizado para manejar errores de forma segura

**Pendientes de implementar**:
- Encriptación de contraseñas mediante hash+salt
- Autenticación basada en tokens con expiración
- Validaciones robustas de entrada
- Cabeceras HTTP de seguridad
- Protecciones contra XSS y CSRF

## 📱 Capturas de Pantalla

### Página de Inicio
![Home Page](https://via.placeholder.com/800x400?text=Página+de+Inicio)

### Detalle de Propiedad
![Property Detail](https://via.placeholder.com/800x400?text=Detalle+de+Propiedad)

### Panel de Usuario
![User Dashboard](https://via.placeholder.com/800x400?text=Panel+de+Usuario)

## 📖 Guía de Uso

### Para Propietarios
1. Regístrate en la plataforma
2. Completa tu perfil
3. Publica tus propiedades con información detallada y fotos
4. Revisa y responde solicitudes de alquiler
5. Acepta solicitudes para generar contratos automáticamente

### Para Inquilinos
1. Regístrate en la plataforma
2. Busca propiedades usando filtros
3. Guarda favoritos para comparar después
4. Envía solicitudes de alquiler
5. Firma el contrato digital tras la aprobación

## 🤝 Contribución

Si deseas contribuir al proyecto, sigue estos pasos:

1. Fork el repositorio
2. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Realiza tus cambios y haz commit (`git commit -m 'Añade nueva funcionalidad'`)
4. Sube los cambios (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 🛣️ Roadmap

- **Versión 1.1**: 
  - Implementación de autenticación segura
  - Encriptación de datos sensibles
  
- **Versión 1.2**:
  - Sistema de notificaciones
  - Chat interno entre propietarios e inquilinos

- **Versión 2.0**:
  - Integración con servicios de pago
  - Verificación de identidad KYC

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 👥 Equipo

- Samuel Hincapié - Frontend Developer
- Laura Rodríguez - Backend Developer
- Daniel Torres - UX/UI Designer
- Carolina Gómez - Project Manager

## 📞 Contacto

Para preguntas o soporte, contacta a: info@keyhouse.com

---

&copy; 2025 KeyHouse. Todos los derechos reservados.