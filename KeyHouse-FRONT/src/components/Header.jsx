import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/Header.css";
import logo from "../images/keyhouse_remove_background.png";
import lupaIcon from "../images/loupe.png";

const Header = () => {
  const [search, setSearch] = useState("");
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [miHogarCasaId, setMiHogarCasaId] = useState(null); // Aquí guardaremos el id de la casa
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedSearch = localStorage.getItem('searchTerm');
    if (savedSearch) {
      setSearch(savedSearch);
    }
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setUserName(parsedData.nombre);
        setIsLoggedIn(true);
        fetchAlquilerAceptado(parsedData.id_usuario); // Aquí pasamos el id usuario
      } catch (error) {
        console.error("Error al procesar datos del usuario:", error);
      }
    } else {
      setIsLoggedIn(false);
    }

    const storedAvatar = localStorage.getItem('userAvatar');
    if (storedAvatar && storedAvatar.startsWith('data:image/')) {
      setUserAvatar(storedAvatar);
    }
  }, []);

  // Ahora sí actualizamos el estado miHogarCasaId si hay alquiler aceptado
  const fetchAlquilerAceptado = async (usuario_id) => {
    try {
      const response = await fetch(`http://localhost:4000/api/alquileres/aceptado/${usuario_id}`);
      if (!response.ok) {
        console.error('Error en la respuesta:', response.status);
        return;
      }
      const data = await response.json();
      if (data.aceptado) {
        // Guardamos el id de la casa para luego usar en el botón "Mi Hogar"
        setMiHogarCasaId(data.alquiler.casa_id);
      } else {
        setMiHogarCasaId(null);
      }
    } catch (error) {
      console.error('Error al verificar alquiler aceptado:', error);
      setMiHogarCasaId(null);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    localStorage.setItem('searchTerm', value);
    if (location.pathname !== '/home') {
      navigate('/home');
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      localStorage.setItem('searchTerm', search);
      if (location.pathname !== '/home') {
        navigate('/home');
      }
    }
  };

  const clearSearch = () => {
    setSearch('');
    localStorage.removeItem('searchTerm');
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem('userData');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userAvatar');
    localStorage.removeItem('searchTerm');
    setUserAvatar('');
    setUserName('');
    setSearch('');
    setIsLoggedIn(false);
    setMiHogarCasaId(null);
    navigate('/');
  }, [navigate]);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <header className="navbar">
      <div className="logo-container">
        <img src={logo} alt="KeyHouse Logo" className="navbar-logo" />
        <span className="logo-text">Keyhouse</span>
      </div>

      <div className="search-container">
        <input
          type="text"
          className="search-bar"
          placeholder="Buscar por título o ubicación..."
          value={search}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
        />
        {search && (
          <button className="clear-search" onClick={clearSearch}>
            <span className="clear-icon">×</span>
          </button>
        )}
        <button className="search-button" onClick={() => navigate('/home')}>
          <img 
            src={lupaIcon}
            alt="Icono de búsqueda" 
            className="search-icon"
            width="22"
            height="22"
          />
        </button>
      </div>

      <nav className="navbar-items">
        {isLoggedIn && (
          <>
            <Link to="/home" className="nav-item">Inicio</Link>
            {miHogarCasaId && (
              <Link to={`/casa/${miHogarCasaId}`} className="nav-item">Mi Hogar</Link>
            )}
            <Link to="/favoritos" className="nav-item">Favoritos</Link>
            <Link to="/mis-propiedades" className="nav-item">Mis Propiedades</Link>
            <Link to="/solicitudes" className="nav-item">Solicitudes</Link>
            
          </>
        )}
        <Link to="/perfil" className="nav-item user-profile">
          {userAvatar && userAvatar.startsWith('data:image/') ? (
            <div className="user-avatar">
              <img src={userAvatar} alt="Avatar" />
            </div>
          ) : (
            <div className="user-avatar user-avatar-default">
              <span>{userName ? userName.charAt(0).toUpperCase() : "P"}</span>
            </div>
          )}
          <span className="user-name">{userName || "Perfil"}</span>
        </Link>
        <button onClick={handleLogout} className="nav-item logout-btn">
          Cerrar Sesión
        </button>
      </nav>
    </header>
  );
};

export default Header;
