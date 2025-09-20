# TechLogistics – Gestión de pedidos y envíos

## 1. Objetivo
Sistema para administrar clientes, productos, pedidos y el rastreo de envíos en tiempo real.

## 2. Modelo de datos (MER)
Entidades: Clientes, Productos, Pedidos, Pedido_Items, Envíos, Estados_Envio, Transportistas, Rutas.  
- Integridad: FKs de pedidos→clientes, pedido_items→(pedidos, productos), envíos→(pedidos, estados, transportistas, rutas).  
- Normalización: 3FN aplicada.  
> (Adjuntar imagen MER exportada de phpMyAdmin/Draw.io)

## 3. Stack
- MySQL (MariaDB)
- Node.js + Express + mysql2
- Frontend: HTML + Bootstrap + JS (fetch + SSE)

## 4. API principal
- `GET/POST /api/clientes`
- `GET/POST /api/productos`
- `GET/POST /api/pedidos`
- `GET /api/envios`, `PUT /api/envios/:id/asignar`
- `GET /api/envios/:id/tracking`, `GET /api/envios/:id/stream` (SSE)

## 5. Realtime
Se usa **Server-Sent Events (SSE)** para notificar cambios de estado de un envío.

## 6. Setup
```bash
cp .env.example .env   # o rellena .env
npm install
npm run dev
