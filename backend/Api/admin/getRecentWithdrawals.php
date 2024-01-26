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
        // Consultar los últimos 3 retiros aprobados
        $recentWithdrawalsQuery = "SELECT * FROM transactions WHERE type = 'withdrawal' ORDER BY id DESC LIMIT 3";
        $recentWithdrawalsStmt = $conexion->query($recentWithdrawalsQuery);
        $recentWithdrawals = $recentWithdrawalsStmt->fetchAll(PDO::FETCH_ASSOC);

        // Devolver los resultados como JSON
        echo json_encode($recentWithdrawals);
    } catch (PDOException $e) {
        http_response_code(500); // Internal Server Error
        echo json_encode(array("error" => "Error al obtener los últimos retiros", "details" => $e->getMessage()));
    } finally {
        // Cerrar la conexión después de usarla
        $conexion = null;
    }
}
?>
