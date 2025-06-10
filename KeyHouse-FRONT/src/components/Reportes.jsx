import React, { useState } from 'react';
import axios from 'axios';
import "../styles/Reportes.css";

const FormularioReporte = () => {
  // Extraemos los datos del localStorage
  const remitente_id = localStorage.getItem('id_usuario');
  const denunciado_id = localStorage.getItem('denunciado_id');
  const casa_id = localStorage.getItem('casa_id');
  const alquiler_id = localStorage.getItem('alquiler_id');

  const [motivo, setMotivo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState(null);
  const [mensaje, setMensaje] = useState('');

  const motivos = [
    'Incumplimiento de contrato',
    'Daños a la propiedad',
    'Comportamiento inapropiado',
    'Pago atrasado',
    'Casa en mal estado',
    'alquiler no autorizado',
    'Desatención para el mantenimiento',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mostrar en consola los valores para depuración
    console.log('Datos a enviar: ', {
      remitente_id,
      denunciado_id,
      casa_id,
      alquiler_id,
      motivo,
      descripcion,
      imagen
    });

    if (!remitente_id || !denunciado_id) {
      setMensaje('Faltan datos de usuario o denunciado.');
      return;
    }

    if (!motivo) {
      setMensaje('Por favor selecciona un motivo.');
      return;
    }

    const formData = new FormData();
    formData.append('remitente_id', remitente_id);
    formData.append('denunciado_id', denunciado_id);
    if (casa_id) formData.append('casa_id', casa_id);
    if (alquiler_id) formData.append('alquiler_id', alquiler_id);
    formData.append('motivo', motivo);
    formData.append('descripcion', descripcion);
    if (imagen) formData.append('imagen', imagen);

    try {
      const res = await axios.post('http://localhost:4000/api/reportes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMensaje(res.data.mensaje || 'Reporte enviado con éxito.');
      setMotivo('');
      setDescripcion('');
      setImagen(null);
    } catch (error) {
      console.error('Error al enviar reporte:', error);
      setMensaje('Error al enviar el reporte.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: 'auto' }}>
      <h2>Reportar</h2>

      <label>
        Motivo:
        <select value={motivo} onChange={(e) => setMotivo(e.target.value)} required>
          <option value="">-- Selecciona un motivo --</option>
          {motivos.map((m, i) => (
            <option key={i} value={m}>{m}</option>
          ))}
        </select>
      </label>

      <br />

      <label>
        Descripción:
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Explica el motivo del reporte"
          rows={4}
        />
      </label>

      <br />

      <label>
        Imagen (opcional):
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImagen(e.target.files[0])}
        />
      </label>

      <br />

      <button type="submit">Enviar reporte</button>

      {mensaje && <p>{mensaje}</p>}
    </form>
  );
};

export default FormularioReporte;
