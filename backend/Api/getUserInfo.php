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

// Obtener detalles del usuario
$userId = $_SESSION['user_id'];

$getUserInfo = "SELECT * FROM users WHERE id = :userId";
$stmt = $conexion->prepare($getUserInfo);
$stmt->bindParam(':userId', $userId);
$stmt->execute();

if ($stmt->rowCount() > 0) {
    $userInfo = $stmt->fetch(PDO::FETCH_ASSOC);
    http_response_code(200);
    echo json_encode($userInfo);
} else {
    http_response_code(404); // Not Found
    echo json_encode(array("error" => "Usuario no encontrado."));
}
?>
