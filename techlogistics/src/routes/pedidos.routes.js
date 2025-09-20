const router = require('express').Router();
const pool = require('../db');

router.post('/', async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { id_cliente, items } = req.body;
    if (!id_cliente || !Array.isArray(items) || !items.length)
      return res.status(400).json({ error: 'Datos inválidos' });

    await conn.beginTransaction();

    let total = 0;
    for (const it of items) {
      const [[p]] = await conn.query('SELECT precio, stock FROM productos WHERE id=? FOR UPDATE', [it.id_producto]);
      if (!p) throw new Error('Producto no existe');
      if (p.stock < it.cantidad) throw new Error('Stock insuficiente');
      total += Number(p.precio) * it.cantidad;
    }

    const [insP] = await conn.query('INSERT INTO pedidos (id_cliente,total) VALUES (?,?)', [id_cliente, total]);
    const idPedido = insP.insertId;

    for (const it of items) {
      const [[p]] = await conn.query('SELECT precio FROM productos WHERE id=?', [it.id_producto]);
      const precio = Number(p.precio);
      await conn.query(
        'INSERT INTO pedido_items (id_pedido,id_producto,cantidad,precio_unit,subtotal) VALUES (?,?,?,?,?)',
        [idPedido, it.id_producto, it.cantidad, precio, precio * it.cantidad]
      );
      await conn.query('UPDATE productos SET stock = stock - ? WHERE id=?', [it.cantidad, it.id_producto]);
    }

    const [[eCreado]] = await conn.query('SELECT id FROM estados_envio WHERE codigo=?', ['CREADO']);
    const [insE] = await conn.query('INSERT INTO envios (id_pedido, estado_actual) VALUES (?,?)', [idPedido, eCreado.id]);
    const idEnvio = insE.insertId;

    await conn.query(
      'INSERT INTO tracking_envio (id_envio,id_estado,observacion) VALUES (?,?,?)',
      [idEnvio, eCreado.id, 'Pedido creado']
    );

    await conn.commit();
    res.status(201).json({ id_pedido: idPedido, total, id_envio: idEnvio });
  } catch (e) {
    try { await conn.rollback(); } catch {}
    next(e);
  } finally { conn.release(); }
});

router.get('/', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.total, p.fecha, c.nombre AS cliente
       FROM pedidos p JOIN clientes c ON c.id=p.id_cliente
       ORDER BY p.id DESC`
    );
    res.json(rows);
  } catch (e) { next(e); }
});

module.exports = router;
