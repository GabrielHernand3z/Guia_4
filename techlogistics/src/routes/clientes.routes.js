const router = require('express').Router();
const pool = require('../db');

// Listar
router.get('/', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, email, telefono, direccion FROM clientes ORDER BY id DESC'
    );
    res.json(rows);
  } catch (e) { next(e); }
});

// Crear
router.post('/', async (req, res, next) => {
  try {
    const { nombre, email, telefono, direccion } = req.body || {};
    if (!nombre) return res.status(400).json({ error: 'Falta nombre' });
    const [r] = await pool.query(
      'INSERT INTO clientes (nombre, email, telefono, direccion) VALUES (?,?,?,?)',
      [nombre, email || null, telefono || null, direccion || null]
    );
    res.status(201).json({ id: r.insertId, nombre, email, telefono, direccion });
  } catch (e) { next(e); }
});

// Editar
router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { nombre, email, telefono, direccion } = req.body || {};
    if (!id) return res.status(400).json({ error: 'ID inválido' });
    await pool.query(
      'UPDATE clientes SET nombre=?, email=?, telefono=?, direccion=? WHERE id=?',
      [nombre || null, email || null, telefono || null, direccion || null, id]
    );
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// Eliminar (bloquea si hay pedidos)
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID inválido' });

    // Verifica usos en pedidos
    const [used] = await pool.query('SELECT 1 FROM pedidos WHERE id_cliente=? LIMIT 1', [id]);
    if (used.length) return res.status(409).json({ error: 'No se puede eliminar: el cliente tiene pedidos asociados.' });

    await pool.query('DELETE FROM clientes WHERE id=?', [id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
