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
        // Consultar los últimos 3 depósitos aprobados
        $recentDepositsQuery = "SELECT * FROM transactions WHERE type = 'deposit' OR type = 'sumar' ORDER BY id DESC LIMIT 3";
        $recentDepositsStmt = $conexion->query($recentDepositsQuery);
        $recentDeposits = $recentDepositsStmt->fetchAll(PDO::FETCH_ASSOC);
        

        // Devolver los resultados como JSON
        echo json_encode($recentDeposits);
    } catch (PDOException $e) {
        http_response_code(500); // Internal Server Error
        echo json_encode(array("error" => "Error al obtener los últimos depósitos", "details" => $e->getMessage()));
    } finally {
        // Cerrar la conexión después de usarla
        $conexion = null;
    }
}
?>
