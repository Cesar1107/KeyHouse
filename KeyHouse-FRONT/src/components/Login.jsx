import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login.css";
// Importa tus imágenes
import edificio1 from "../images/edificio1.png";
import casa1 from "../images/casa1.jpg";
import apartamento from "../images/apartamento.jpg";
import logo from "../images/Logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Array de imágenes para el carrusel
  const images = [edificio1, casa1, apartamento];

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:4000/api/usuarios/");
      if (!response.ok) {
        throw new Error("Error en la respuesta de la API");
      }
      const data = await response.json();
      console.log(data);
      const userArray = data.body || [];
      const user = userArray.find(
        (user) => user.email === email && user.contraseña === password
      );
      if (user) {
        // Guardar los datos del usuario en localStorage
        localStorage.setItem(
          "userData",
          JSON.stringify({
            id_usuario: user.id_usuario,
            nombre: user.nombre || "",
            apellido: user.apellido || "",
            email: user.email,
            telefono: user.telefono || "",
            edad: user.edad || "",
            bio: user.bio || "",
            admin: user.admin || false,
          })
        );
        // Guardar estado de login
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("usuario_id", user.id_usuario);
        localStorage.setItem("id_usuario", user.id_usuario);

        navigate("/home");
      } else {
        setError("Usuario no creado o contraseña incorrecta.");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setError("Error al intentar iniciar sesión.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="login-page">
      <div className="product-showcase">
        <div className="carousel-container">
          <button
            className="carousel-arrow carousel-arrow-left"
            onClick={prevSlide}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div className="carousel-slides">
            {images.map((img, index) => (
              <div
                key={index}
                className={`carousel-slide ${
                  index === currentSlide ? "active" : ""
                }`}
              >
                <img src={img} alt={`Property ${index + 1}`} />
              </div>
            ))}
          </div>

          <button
            className="carousel-arrow carousel-arrow-right"
            onClick={nextSlide}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        <div className="promo-text">
          <h3>Encuentra tu especio, vive tu hogar</h3>
        </div>

        <div className="pagination">
          {images.map((_, index) => (
            <div
              key={index}
              className={`page-dot ${index === currentSlide ? "active" : ""}`}
              onClick={() => setCurrentSlide(index)}
            ></div>
          ))}
        </div>
      </div>

      <div className="login-container">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <div className="login-header">
          <h1>Bienvenido de vuelta</h1>
        </div>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="input-field"
              placeholder="Ingresa tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <div className="password-container">
              <label htmlFor="password">Contraseña</label>
                <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="input-field"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </div>
              <Link to="/forgot-password" className="forgot-password">
                ¿Has olvidado tu contraseña?
              </Link>
            </div>
          </div>

          <button type="submit" className="login-button">
            Iniciar sesión
          </button>
        </form>

        <div className="signup-text">
          ¿Todavía no tienes una cuenta?{" "}
          <Link to="/create-account" className="signup-link">
            Crea una ahora
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;