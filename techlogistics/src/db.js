const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONN_LIMIT || 10),
  queueLimit: 0
});

// Probar conexión al arrancar
(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    console.log('✅ Conectado a MySQL:', process.env.DB_NAME);
    conn.release();
  } catch (err) {
    console.error('❌ Error conectando a MySQL:', err.message);
    process.exit(1);
  }
})();

module.exports = pool;
