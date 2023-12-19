-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 19-12-2023 a las 09:54:32
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `nuovo`
--
CREATE DATABASE IF NOT EXISTS `nuovo` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `nuovo`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `deposit_requests`
--

CREATE TABLE `deposit_requests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `payment_method` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL CHECK (`amount` >= 1),
  `request_date` date DEFAULT NULL,
  `request_time` time DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `deposit_requests`
--

INSERT INTO `deposit_requests` (`id`, `user_id`, `payment_method`, `amount`, `request_date`, `request_time`, `status`, `updated_at`) VALUES
(5, 5, 'transferencia', 500.00, '2023-12-12', '09:37:49', 'pending', '2023-12-12 13:37:49'),
(6, 5, 'transferencia', 1.00, '2023-12-13', '01:08:09', 'pending', '2023-12-13 05:08:09');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_read` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `content`, `created_at`, `is_read`) VALUES
(2, 5, 'Tu solicitud de verificación ha sido recibida. Está pendiente de revisión.', '2023-12-17 21:21:38', 0),
(3, 5, 'El estado de tu solicitud de verificación ha sido actualizado a approved.', '2023-12-17 21:51:04', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` enum('deposit','withdrawal') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` varchar(50) NOT NULL,
  `transaction_date` date NOT NULL,
  `transaction_time` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `transactions`
--

INSERT INTO `transactions` (`id`, `user_id`, `type`, `amount`, `status`, `transaction_date`, `transaction_time`) VALUES
(1, 5, 'deposit', 500.00, 'pending', '2023-12-12', '09:37:49'),
(2, 5, 'withdrawal', 400.00, 'pending', '2023-12-12', '09:39:59'),
(3, 5, 'withdrawal', 10.00, 'pending', '2023-12-12', '09:46:39'),
(4, 5, 'deposit', 1.00, 'pending', '2023-12-13', '01:08:09'),
(5, 5, 'withdrawal', 1.00, 'pending', '2023-12-13', '01:10:12'),
(6, 5, 'withdrawal', 1.00, 'pending', '2023-12-13', '01:10:40'),
(7, 5, 'withdrawal', 1.00, 'pending', '2023-12-13', '01:11:26'),
(8, 5, 'withdrawal', 1.00, 'pending', '2023-12-15', '19:10:36'),
(9, 5, 'withdrawal', 1.00, 'pending', '2023-12-15', '19:25:22'),
(10, 5, 'withdrawal', 1.00, 'pending', '2023-12-15', '19:25:30'),
(11, 5, 'withdrawal', 1.00, 'pending', '2023-12-15', '19:25:36'),
(12, 5, 'withdrawal', 1.00, 'pending', '2023-12-15', '19:25:36'),
(13, 5, 'withdrawal', 1.00, 'pending', '2023-12-15', '19:25:36'),
(14, 5, 'withdrawal', 1.00, 'pending', '2023-12-15', '19:25:36'),
(15, 5, 'withdrawal', 1.00, 'pending', '2023-12-15', '19:25:36'),
(16, 5, 'withdrawal', 1.00, 'pending', '2023-12-15', '19:25:36'),
(17, 5, 'withdrawal', 1.00, 'pending', '2023-12-15', '19:25:36'),
(18, 5, 'withdrawal', 1.00, 'pending', '2023-12-15', '19:26:07'),
(19, 5, 'withdrawal', 1.00, 'pending', '2023-12-15', '19:34:16');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phoneNumber` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT 'default.png',
  `registrationTime` time DEFAULT NULL,
  `registrationDate` date DEFAULT NULL,
  `role` enum('user','admin') DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `phoneNumber`, `address`, `profile_picture`, `registrationTime`, `registrationDate`, `role`) VALUES
(5, 'Kelvin Valera', 'kvalera200244@gmail.com', '$2y$10$7CAFdj7tqQp84H9k2NILmuB7O132U.M26.F5NEzIOzdxzotMM6/Da', '581594733', 'Carabobo, Venezuela', '13690-minimalista.jpg', '23:24:49', '2023-12-10', 'user'),
(6, 'Administrador', 'valeraquintero@outlook.es', '$2y$10$3QVUGeScfBX/Y1SfaqJ9oOVdEvE8i6fKV/VY6TTAt8EeIMuMPxM4G', '581594733', 'venezuela, carabobo', 'n.png', '03:38:15', '2023-12-12', 'admin');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_balances`
--

CREATE TABLE `user_balances` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `balance` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `user_balances`
--

INSERT INTO `user_balances` (`id`, `user_id`, `balance`, `created_at`, `updated_at`) VALUES
(1, 5, 1998.00, '2023-12-12 05:11:43', '2023-12-15 18:34:16'),
(2, 6, 0.00, '2023-12-12 07:38:15', '2023-12-12 07:38:15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_verification`
--

CREATE TABLE `user_verification` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `dni_image` varchar(255) DEFAULT NULL,
  `selfie_with_dni_image` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `user_verification`
--

INSERT INTO `user_verification` (`id`, `user_id`, `dni_image`, `selfie_with_dni_image`, `status`, `created_at`, `updated_at`) VALUES
(11, 5, 'dni_front_5.png', 'dni_selfie_5.png', 'approved', '2023-12-17 21:21:38', '2023-12-17 21:51:04');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `withdrawal_requests`
--

CREATE TABLE `withdrawal_requests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `request_date` date NOT NULL,
  `request_time` time NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `payment_method` varchar(255) DEFAULT NULL,
  `cbu` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `withdrawal_requests`
--

INSERT INTO `withdrawal_requests` (`id`, `user_id`, `amount`, `status`, `request_date`, `request_time`, `updated_at`, `payment_method`, `cbu`) VALUES
(5, 5, 400.00, 'pending', '2023-12-12', '04:39:59', '2023-12-12 08:39:59', 'efectivo', '1000'),
(6, 5, 10.00, 'pending', '2023-12-12', '04:46:39', '2023-12-12 08:46:39', 'transferencia', '1000'),
(7, 5, 1.00, 'pending', '2023-12-12', '20:10:12', '2023-12-13 00:10:12', 'transferencia', '111111111111'),
(8, 5, 1.00, 'pending', '2023-12-12', '20:10:40', '2023-12-13 00:10:40', 'transferencia', '111111111111'),
(9, 5, 1.00, 'pending', '2023-12-12', '20:11:26', '2023-12-13 00:11:26', 'transferencia', '111111111111'),
(10, 5, 1.00, 'pending', '2023-12-15', '14:10:36', '2023-12-15 18:10:36', 'transferencia', '111111111111'),
(11, 5, 1.00, 'pending', '2023-12-15', '14:25:22', '2023-12-15 18:25:22', 'transferencia', '1000'),
(12, 5, 1.00, 'pending', '2023-12-15', '14:25:30', '2023-12-15 18:25:30', 'transferencia', '1000'),
(13, 5, 1.00, 'pending', '2023-12-15', '14:25:36', '2023-12-15 18:25:36', 'transferencia', '1000'),
(14, 5, 1.00, 'pending', '2023-12-15', '14:25:36', '2023-12-15 18:25:36', 'transferencia', '1000'),
(15, 5, 1.00, 'pending', '2023-12-15', '14:25:36', '2023-12-15 18:25:36', 'transferencia', '1000'),
(16, 5, 1.00, 'pending', '2023-12-15', '14:25:36', '2023-12-15 18:25:36', 'transferencia', '1000'),
(17, 5, 1.00, 'pending', '2023-12-15', '14:25:36', '2023-12-15 18:25:36', 'transferencia', '1000'),
(18, 5, 1.00, 'pending', '2023-12-15', '14:25:36', '2023-12-15 18:25:36', 'transferencia', '1000'),
(19, 5, 1.00, 'pending', '2023-12-15', '14:25:36', '2023-12-15 18:25:36', 'transferencia', '1000'),
(20, 5, 1.00, 'pending', '2023-12-15', '14:26:07', '2023-12-15 18:26:07', 'transferencia', '1000'),
(21, 5, 1.00, 'pending', '2023-12-15', '14:34:16', '2023-12-15 18:34:16', 'transferencia', '111111111111');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `deposit_requests`
--
ALTER TABLE `deposit_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `user_balances`
--
ALTER TABLE `user_balances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `user_verification`
--
ALTER TABLE `user_verification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `withdrawal_requests`
--
ALTER TABLE `withdrawal_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `deposit_requests`
--
ALTER TABLE `deposit_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `user_balances`
--
ALTER TABLE `user_balances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `user_verification`
--
ALTER TABLE `user_verification`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `withdrawal_requests`
--
ALTER TABLE `withdrawal_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `deposit_requests`
--
ALTER TABLE `deposit_requests`
  ADD CONSTRAINT `deposit_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `user_balances`
--
ALTER TABLE `user_balances`
  ADD CONSTRAINT `user_balances_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `user_verification`
--
ALTER TABLE `user_verification`
  ADD CONSTRAINT `user_verification_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `withdrawal_requests`
--
ALTER TABLE `withdrawal_requests`
  ADD CONSTRAINT `withdrawal_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
