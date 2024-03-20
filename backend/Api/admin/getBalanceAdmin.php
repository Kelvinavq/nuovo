<?php
include '../../Config/config.php';
include '../../cors.php';

$conexion = obtenerConexion();

// Verificar si hay una sesión activa
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(array("error" => "No hay una sesión activa."));
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Consultar el total depositado
        $totalDepositQuery = "SELECT SUM(amount) AS total_deposit FROM transactions WHERE (type = 'deposit' OR type = 'sumar') AND status = 'approved'";
        $totalDepositStmt = $conexion->query($totalDepositQuery);

        $totalDeposit = $totalDepositStmt->fetch(PDO::FETCH_ASSOC)['total_deposit'];

        // Consultar el total retirado
        $totalWithdrawalQuery = "SELECT SUM(amount) AS total_withdrawal FROM transactions WHERE (type = 'withdrawal' OR type = 'restar') AND status = 'approved'";
        $totalWithdrawalStmt = $conexion->query($totalWithdrawalQuery);
        $totalWithdrawal = $totalWithdrawalStmt->fetch(PDO::FETCH_ASSOC)['total_withdrawal'];

        // Consultar la cantidad de usuarios registrados con el role 'user'
        $totalUsersQuery = "SELECT COUNT(*) AS total_users FROM users WHERE role = 'user'";
        $totalUsersStmt = $conexion->query($totalUsersQuery);
        $totalUsers = $totalUsersStmt->fetch(PDO::FETCH_ASSOC)['total_users'];

        // Devolver los resultados como JSON
        echo json_encode(array(
            'total_deposit' => $totalDeposit,
            'total_withdrawal' => $totalWithdrawal,
            'total_users' => $totalUsers
        ));
    } catch (PDOException $e) {
        http_response_code(500); // Internal Server Error
        echo json_encode(array("error" => "Error al obtener la información", "details" => $e->getMessage()));
    } finally {
        // Cerrar la conexión después de usarla
        $conexion = null;
    }
}
