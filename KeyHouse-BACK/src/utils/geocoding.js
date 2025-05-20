const axios = require('axios');

async function obtenerCoordenadas(direccion) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: direccion,
        key: apiKey
      }
    });

    const resultados = response.data.results;

    if (resultados.length > 0) {
      const ubicacion = resultados[0].geometry.location;
      return {
        lat: ubicacion.lat,
        lng: ubicacion.lng
      };
    } else {
      throw new Error('No se encontraron resultados para la dirección proporcionada.');
    }
  } catch (error) {
    console.error('Error al obtener coordenadas:', error.message);
    throw error;
  }
}

module.exports = { obtenerCoordenadas };
