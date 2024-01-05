<?php

include '../../Config/config.php';
include '../../cors.php';

// Obtener conexión a la base de datos
$conexion = obtenerConexion();

// Verificar si el usuario está autenticado como administrador
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(array("error" => "Administrador no autenticado."));
    exit();
}

$adminId = $_SESSION['user_id'];

// Verificar si se proporcionó el ID del usuario a través de GET
if (!isset($_GET['user_id'])) {
    http_response_code(400); // Bad Request
    echo json_encode(array("error" => "Se debe proporcionar el ID del usuario."));
    exit();
}

$userId = $_GET['user_id'];

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
