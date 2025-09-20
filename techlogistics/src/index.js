require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const pool = require('./db'); // conexión MySQL

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas API
app.use('/api/clientes', require('./routes/clientes.routes'));
app.use('/api/productos', require('./routes/productos.routes'));
app.use('/api/pedidos', require('./routes/pedidos.routes'));
app.use('/api/envios', require('./routes/envios.routes'));

// Healthcheck (backend, ya no se muestra en el frontend)
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, db: process.env.DB_NAME, ts: Date.now() });
});

// Middleware de errores
app.use((err, _req, res, _next) => {
  console.error('❌ Error en servidor:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Servir frontend (index.html en public)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Arrancar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
