const router = require('express').Router();
const pool = require('../db');

/**
 * Utilidades simples para SSE (EventSource)
 */
const sseClients = new Map(); // id_envio -> Set<res>

function sseSend(res, data) {
  // Importante: encabezados ya enviados con text/event-stream
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}
function sseAddClient(idEnvio, res) {
  if (!sseClients.has(idEnvio)) sseClients.set(idEnvio, new Set());
  sseClients.get(idEnvio).add(res);
}
function sseRemoveClient(idEnvio, res) {
  if (sseClients.has(idEnvio)) {
    sseClients.get(idEnvio).delete(res);
    if (sseClients.get(idEnvio).size === 0) sseClients.delete(idEnvio);
  }
}
async function notifyTracking(idEnvio) {
  // Envía el último tracking a los clientes suscritos a ese envío
  if (!sseClients.has(idEnvio)) return;
  const [rows] = await pool.query(
    `SELECT te.id, te.id_envio, te.id_estado, ee.codigo, ee.descripcion, te.ts
     FROM tracking_envio te
     JOIN estados_envio ee ON ee.id = te.id_estado
     WHERE te.id_envio=? ORDER BY te.ts DESC LIMIT 1`,
    [idEnvio]
  );
  const payload = rows[0] ? rows[0] : { id_envio: idEnvio, info: 'sin tracking' };
  for (const res of sseClients.get(idEnvio)) sseSend(res, payload);
}

/**
 * GET /api/envios
 * Lista de envíos con info de cliente, pedido y estado (codigo)
 */
router.get('/', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.id, e.id_pedido, c.nombre AS cliente, ee.codigo, e.id_transportista, e.id_ruta
       FROM envios e
       JOIN pedidos p       ON p.id = e.id_pedido
       JOIN clientes c      ON c.id = p.id_cliente
       JOIN estados_envio ee ON ee.id = e.id_estado
       ORDER BY e.id DESC`
    );
    res.json(rows);
  } catch (e) { next(e); }
});

/**
 * GET /api/envios/:id/tracking
 * Historial (tracking_envio) con descripcion del estado
 */
router.get('/:id/tracking', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID inválido' });

    const [rows] = await pool.query(
      `SELECT te.id, te.id_envio, te.id_estado, ee.codigo, ee.descripcion, te.ts
       FROM tracking_envio te
       JOIN estados_envio ee ON ee.id = te.id_estado
       WHERE te.id_envio=? ORDER BY te.ts ASC`,
      [id]
    );
    res.json(rows);
  } catch (e) { next(e); }
});

/**
 * PUT /api/envios/:id/asignar
 * Asignar (opcionalmente) transportista y/o ruta al envío
 * body: { id_transportista: number|null, id_ruta: number|null }
 */
router.put('/:id/asignar', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { id_transportista, id_ruta } = req.body || {};
    if (!id) return res.status(400).json({ error: 'ID inválido' });

    // Armado dinámico del UPDATE
    const set = [];
    const vals = [];
    if (id_transportista !== undefined) { set.push('id_transportista=?'); vals.push(id_transportista || null); }
    if (id_ruta          !== undefined) { set.push('id_ruta=?');          vals.push(id_ruta || null); }
    if (!set.length) return res.status(400).json({ error: 'Nada para actualizar' });

    vals.push(id);
    await pool.query(`UPDATE envios SET ${set.join(', ')} WHERE id=?`, vals);
    res.json({ ok: true });

    // notifica a SSE
    notifyTracking(id).catch(() => {});
  } catch (e) { next(e); }
});

/**
 * PUT /api/envios/:id/estado
 * Cambiar estado por codigo (CREADO | EN_TRANSITO | ENTREGADO) o por id_estado
 * body: { codigo?: string, id_estado?: number }
 * Registra también la fila en tracking_envio
 */
router.put('/:id/estado', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { codigo, id_estado } = req.body || {};
    if (!id) return res.status(400).json({ error: 'ID inválido' });

    let estadoId = id_estado;
    if (!estadoId && codigo) {
      const [st] = await pool.query('SELECT id FROM estados_envio WHERE codigo=?', [codigo]);
      if (!st.length) return res.status(400).json({ error: 'Código de estado no válido' });
      estadoId = st[0].id;
    }
    if (!estadoId) return res.status(400).json({ error: 'Falta id_estado o codigo' });

    await pool.query('UPDATE envios SET id_estado=? WHERE id=?', [estadoId, id]);
    await pool.query('INSERT INTO tracking_envio (id_envio, id_estado, ts) VALUES (?,?, NOW())', [id, estadoId]);

    res.json({ ok: true });

    // Notifica cambios a SSE
    notifyTracking(id).catch(() => {});
  } catch (e) { next(e); }
});

/**
 * DELETE /api/envios/:id
 * Elimina un envío (evita borrar si está ENTREGADO)
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID inválido' });

    const [eRows] = await pool.query('SELECT id_estado FROM envios WHERE id=?', [id]);
    if (!eRows.length) return res.status(404).json({ error: 'No existe' });

    const [deliv] = await pool.query('SELECT id FROM estados_envio WHERE codigo="ENTREGADO"');
    if (deliv.length && eRows[0].id_estado === deliv[0].id) {
      return res.status(409).json({ error: 'No se puede eliminar un envío entregado' });
    }

    await pool.query('DELETE FROM tracking_envio WHERE id_envio=?', [id]);
    await pool.query('DELETE FROM envios WHERE id=?', [id]);
    res.json({ ok: true });

    notifyTracking(id).catch(() => {});
  } catch (e) { next(e); }
});

/**
 * GET /api/envios/:id/stream
 * SSE: Clientes se suscriben a un envío para ver actualizaciones
 */
router.get('/:id/stream', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID inválido' });

    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.flushHeaders?.();

    sseAddClient(id, res);

    // Enviar último tracking al conectarse
    await notifyTracking(id);

    // Keep-alive cada 25s
    const iv = setInterval(() => res.write(': keep-alive\n\n'), 25000);

    req.on('close', () => {
      clearInterval(iv);
      sseRemoveClient(id, res);
      res.end();
    });
  } catch (e) { next(e); }
});

module.exports = router;
