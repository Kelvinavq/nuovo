<?php

include '../Config/config.php';
include '../cors.php';

// Obtener conexión a la base de datos
$conexion = obtenerConexion();

// Verificar si el usuario está autenticado y obtener su ID
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(array("error" => "Usuario no autenticado."));
    exit();
}

$userId = $_SESSION['user_id'];

// Realizar la consulta para obtener el estado de verificación del usuario
$getVerificationStatus = "SELECT status FROM user_verification WHERE user_id = :userId";
$stmt = $conexion->prepare($getVerificationStatus);
$stmt->bindParam(':userId', $userId);
$stmt->execute();

if ($stmt->rowCount() > 0) {
    $data = $stmt->fetch(PDO::FETCH_ASSOC);
    $verificationStatus = $data['status'];

    http_response_code(200);
    echo json_encode(array("status" => $verificationStatus));
} else {
    http_response_code(500); // Internal Server Error
    echo json_encode(array("error" => "Error al obtener el estado de verificación del usuario."));
}

// Cerrar la conexión después de usarla
$conexion = null;
?>
