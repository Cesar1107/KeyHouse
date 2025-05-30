import React, { useState, useEffect } from 'react';
import '../styles/Sidebar.css'; // puedes personalizar estilos aquí

const Sidebar = () => {
  const [isHighContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
  document.documentElement.style.fontSize = `${fontSize}px`; // <html> = raíz
  }, [fontSize]);


  const toggleContrast = () => {
    setHighContrast(!isHighContrast);
    document.body.classList.toggle('high-contrast');
  };

  const increaseFont = () => {
    setFontSize(prev => Math.min(prev + 2, 24)); // límite superior
  };

  const decreaseFont = () => {
    setFontSize(prev => Math.max(prev - 2, 12)); // límite inferior
  };

  return (
    <div className="sidebar">
      <button onClick={toggleContrast}>Alto Contraste</button>
      <button onClick={increaseFont}>Aumentar Letra</button>
      <button onClick={decreaseFont}>Disminuir Letra</button>
    </div>
  );
};

export default Sidebar;
