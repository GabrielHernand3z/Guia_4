const router = require('express').Router();
const pool = require('../db');

// Listar
router.get('/', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, precio, stock, creado_en AS creado FROM productos ORDER BY id DESC'
    );
    res.json(rows);
  } catch (e) { next(e); }
});

// Crear
router.post('/', async (req, res, next) => {
  try {
    const { nombre, precio, stock } = req.body || {};
    if (!nombre) return res.status(400).json({ error: 'Falta nombre' });
    const p = Number(precio) || 0;
    const s = Number(stock) || 0;
    const [r] = await pool.query(
      'INSERT INTO productos (nombre, precio, stock) VALUES (?,?,?)', [nombre, p, s]
    );
    res.status(201).json({ id: r.insertId, nombre, precio: p, stock: s });
  } catch (e) { next(e); }
});

// Editar
router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { nombre, precio, stock } = req.body || {};
    if (!id) return res.status(400).json({ error: 'ID inválido' });
    const p = precio !== undefined ? Number(precio) : null;
    const s = stock  !== undefined ? Number(stock)  : null;
    await pool.query(
      'UPDATE productos SET nombre=?, precio=?, stock=? WHERE id=?',
      [nombre || null, p, s, id]
    );
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// Eliminar (bloquea si está en pedido_items)
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID inválido' });

    const [used] = await pool.query('SELECT 1 FROM pedido_items WHERE id_producto=? LIMIT 1', [id]);
    if (used.length) return res.status(409).json({ error: 'No se puede eliminar: el producto está en pedidos.' });

    await pool.query('DELETE FROM productos WHERE id=?', [id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
