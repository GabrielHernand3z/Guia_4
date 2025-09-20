-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 19-09-2025 a las 08:29:43
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `techlogistic`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(120) DEFAULT NULL,
  `telefono` varchar(40) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`id`, `nombre`, `email`, `telefono`, `direccion`) VALUES
(1, 'Acme S.A.', 'contacto@acme.com', '3001112222', 'Cra 10 # 20-30, Bogotá'),
(2, 'InnovaTech Ltda.', 'ventas@innovatech.co', '3012223333', 'Av. 7 # 100-20, Bogotá'),
(3, 'Distribuciones XY', 'xy@dist.com', '3023334444', 'Cll 45 # 12-15, Medellín'),
(4, 'LogiMart S.A.S.', 'compras@logimart.com', '3034445555', 'Av. Chile 45-10, Bogotá'),
(5, 'Casa del PC', 'tienda@casapc.co', '3045556666', 'Clle 9 # 8-50, Cali');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `envios`
--

CREATE TABLE `envios` (
  `id` int(11) NOT NULL,
  `id_pedido` int(11) NOT NULL,
  `id_estado` int(11) NOT NULL,
  `id_transportista` int(11) DEFAULT NULL,
  `id_ruta` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `envios`
--

INSERT INTO `envios` (`id`, `id_pedido`, `id_estado`, `id_transportista`, `id_ruta`) VALUES
(1, 1, 2, 1, 1),
(2, 2, 1, 2, 2),
(3, 3, 2, 3, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados_envio`
--

CREATE TABLE `estados_envio` (
  `id` int(11) NOT NULL,
  `codigo` varchar(30) NOT NULL,
  `descripcion` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estados_envio`
--

INSERT INTO `estados_envio` (`id`, `codigo`, `descripcion`) VALUES
(1, 'CREADO', 'Envío creado, pendiente de despacho'),
(2, 'EN_TRANSITO', 'En tránsito hacia el destino'),
(3, 'ENTREGADO', 'Entregado al cliente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedidos`
--

INSERT INTO `pedidos` (`id`, `id_cliente`, `total`, `fecha`) VALUES
(1, 1, 435000.00, '2025-09-16 06:27:33'),
(2, 2, 1130000.00, '2025-09-17 06:27:33'),
(3, 3, 4040000.00, '2025-09-18 06:27:33');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido_items`
--

CREATE TABLE `pedido_items` (
  `id` int(11) NOT NULL,
  `id_pedido` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unit` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedido_items`
--

INSERT INTO `pedido_items` (`id`, `id_pedido`, `id_producto`, `cantidad`, `precio_unit`) VALUES
(1, 1, 1, 2, 180000.00),
(2, 1, 2, 1, 75000.00),
(3, 2, 3, 1, 980000.00),
(4, 2, 2, 2, 75000.00),
(5, 3, 5, 1, 3200000.00),
(6, 3, 4, 2, 420000.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `precio` decimal(12,2) NOT NULL DEFAULT 0.00,
  `stock` int(11) NOT NULL DEFAULT 0,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `precio`, `stock`, `creado_en`) VALUES
(1, 'Teclado Mecánico', 180000.00, 38, '2025-09-19 06:27:33'),
(2, 'Mouse Óptico', 75000.00, 57, '2025-09-19 06:27:33'),
(3, 'Monitor 27\" IPS', 980000.00, 14, '2025-09-19 06:27:33'),
(4, 'Disco SSD 1TB', 420000.00, 23, '2025-09-19 06:27:33'),
(5, 'Laptop 14\" i5 16GB/512GB', 3200000.00, 9, '2025-09-19 06:27:33');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rutas`
--

CREATE TABLE `rutas` (
  `id` int(11) NOT NULL,
  `codigo` varchar(30) NOT NULL,
  `origen` varchar(120) NOT NULL,
  `destino` varchar(120) NOT NULL,
  `distancia_km` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rutas`
--

INSERT INTO `rutas` (`id`, `codigo`, `origen`, `destino`, `distancia_km`) VALUES
(1, 'BOG-MED', 'Bogotá', 'Medellín', 415.00),
(2, 'BOG-CAL', 'Bogotá', 'Cali', 460.00),
(3, 'MED-CAL', 'Medellín', 'Cali', 416.00),
(4, 'BOG-BUC', 'Bogotá', 'Bucaramanga', 400.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tracking_envio`
--

CREATE TABLE `tracking_envio` (
  `id` int(11) NOT NULL,
  `id_envio` int(11) NOT NULL,
  `id_estado` int(11) NOT NULL,
  `ts` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tracking_envio`
--

INSERT INTO `tracking_envio` (`id`, `id_envio`, `id_estado`, `ts`) VALUES
(1, 1, 1, '2025-09-16 07:27:33'),
(2, 1, 2, '2025-09-17 11:27:33'),
(3, 2, 1, '2025-09-17 08:27:33'),
(4, 3, 1, '2025-09-18 08:27:33'),
(5, 3, 2, '2025-09-18 12:27:33'),
(6, 3, 3, '2025-09-18 16:27:33'),
(7, 3, 2, '2025-09-19 06:28:06');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `transportistas`
--

CREATE TABLE `transportistas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `contacto` varchar(120) DEFAULT NULL,
  `telefono` varchar(40) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `transportistas`
--

INSERT INTO `transportistas` (`id`, `nombre`, `contacto`, `telefono`) VALUES
(1, 'RápidoExpress', 'Laura Méndez', '3107001111'),
(2, 'ColTrans Logística', 'Carlos Ruiz', '3118002222'),
(3, 'Andes Cargo', 'Sofía Pérez', '3129003333');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `envios`
--
ALTER TABLE `envios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_envio_pedido` (`id_pedido`),
  ADD KEY `fk_envio_estado` (`id_estado`),
  ADD KEY `fk_envio_transportista` (`id_transportista`),
  ADD KEY `fk_envio_ruta` (`id_ruta`);

--
-- Indices de la tabla `estados_envio`
--
ALTER TABLE `estados_envio`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_pedidos_cliente` (`id_cliente`);

--
-- Indices de la tabla `pedido_items`
--
ALTER TABLE `pedido_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_items_pedido` (`id_pedido`),
  ADD KEY `fk_items_producto` (`id_producto`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `rutas`
--
ALTER TABLE `rutas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `tracking_envio`
--
ALTER TABLE `tracking_envio`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_track_envio` (`id_envio`),
  ADD KEY `fk_track_estado` (`id_estado`);

--
-- Indices de la tabla `transportistas`
--
ALTER TABLE `transportistas`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `envios`
--
ALTER TABLE `envios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `estados_envio`
--
ALTER TABLE `estados_envio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `pedido_items`
--
ALTER TABLE `pedido_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `rutas`
--
ALTER TABLE `rutas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `tracking_envio`
--
ALTER TABLE `tracking_envio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `transportistas`
--
ALTER TABLE `transportistas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `envios`
--
ALTER TABLE `envios`
  ADD CONSTRAINT `fk_envio_estado` FOREIGN KEY (`id_estado`) REFERENCES `estados_envio` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_envio_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_envio_ruta` FOREIGN KEY (`id_ruta`) REFERENCES `rutas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_envio_transportista` FOREIGN KEY (`id_transportista`) REFERENCES `transportistas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `fk_pedidos_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `pedido_items`
--
ALTER TABLE `pedido_items`
  ADD CONSTRAINT `fk_items_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_items_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `tracking_envio`
--
ALTER TABLE `tracking_envio`
  ADD CONSTRAINT `fk_track_envio` FOREIGN KEY (`id_envio`) REFERENCES `envios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_track_estado` FOREIGN KEY (`id_estado`) REFERENCES `estados_envio` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
