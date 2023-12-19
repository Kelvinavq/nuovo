<?php
include '../Config/config.php';
include '../cors.php';

// Obtener conexión a la base de datos
$conexion = obtenerConexion();


// Verificar si hay una sesión activa
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(array("error" => "No hay una sesión activa."));
    exit();
}

$userId = $_SESSION['user_id'];


try {
    $query = "SELECT * FROM notifications WHERE user_id = :userId ORDER BY created_at DESC";
    $stmt = $conexion->prepare($query);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    $stmt->execute();

    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode($notifications);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("error" => "Error al obtener notificaciones", "details" => $e->getMessage()));
}