const { Client } = require('pg');
const config = require('../config');

const client = new Client({
    user: config.pg.user,
    host: config.pg.host,
    database: config.pg.database,
    password: config.pg.password,
    port: config.pg.port,
});

client.connect()
  .then(() => console.log('✅ Conectado a PostgreSQL'))
  .catch((err) => {
    console.error('Error conectando a PostgreSQL:', err);
    // Opcional: reconectar o salir del proceso
  });

client.on('error', (err) => {
  console.error('Error inesperado en conexión PostgreSQL', err);
  // Aquí podrías intentar reconectar si quieres
});

async function query(text, params) {
  try {
    const res = await client.query(text, params);
    return res;
  } catch (error) {
    console.error('Error en query PostgreSQL:', error);
    throw error;
  }
}

module.exports = {
  query,
  client, // exportar el cliente en caso de que quieras usar transacciones o consultas directas
};
