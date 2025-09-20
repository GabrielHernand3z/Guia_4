// ✅ Express Router correcto (NO usar el paquete "router")
const router = require('express').Router();
const pool = require('../db');

// GET /api/transportistas
router.get('/', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, contacto, telefono FROM transportistas ORDER BY id DESC'
    );
    res.json(rows);
  } catch (e) { next(e); }
});

// POST /api/transportistas
router.post('/', async (req, res, next) => {
  try {
    const { nombre, contacto, telefono } = req.body || {};
    if (!nombre) return res.status(400).json({ error: 'Falta nombre' });

    const [r] = await pool.query(
      'INSERT INTO transportistas (nombre, contacto, telefono) VALUES (?,?,?)',
      [nombre, contacto || null, telefono || null]
    );
    res.status(201).json({ id: r.insertId, nombre, contacto: contacto || null, telefono: telefono || null });
  } catch (e) { next(e); }
});

// ✅ Exportar SIEMPRE la función router
module.exports = router;
