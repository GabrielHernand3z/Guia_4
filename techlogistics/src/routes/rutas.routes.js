// ✅ Express Router correcto (NO usar el paquete "router")
const router = require('express').Router();
const pool = require('../db');

// GET /api/rutas
router.get('/', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, codigo, origen, destino, distancia_km FROM rutas ORDER BY id DESC'
    );
    res.json(rows);
  } catch (e) { next(e); }
});

// POST /api/rutas
router.post('/', async (req, res, next) => {
  try {
    const { codigo, origen, destino, distancia_km } = req.body || {};
    if (!codigo || !origen || !destino) {
      return res.status(400).json({ error: 'Falta código, origen o destino' });
    }

    const distancia = Number(distancia_km) || 0;
    const [r] = await pool.query(
      'INSERT INTO rutas (codigo, origen, destino, distancia_km) VALUES (?,?,?,?)',
      [codigo, origen, destino, distancia]
    );
    res.status(201).json({ id: r.insertId, codigo, origen, destino, distancia_km: distancia });
  } catch (e) { next(e); }
});

// ✅ Exportar SIEMPRE la función router
module.exports = router;
