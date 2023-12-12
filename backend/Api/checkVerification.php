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

// Obtener el ID de usuario de la sesión
$user_id = $_SESSION['user_id'];

// Consultar si el usuario está verificado
$checkVerificationQuery = "SELECT status FROM user_verification WHERE user_id = :user_id";
$checkVerificationStmt = $conexion->prepare($checkVerificationQuery);
$checkVerificationStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
$checkVerificationStmt->execute();

// Obtener el resultado
$userVerification = $checkVerificationStmt->fetch(PDO::FETCH_ASSOC);

// Verificar si el usuario está verificado
$isVerified = $userVerification && $userVerification['status'] === 'approved';

// Devolver el resultado como JSON
// echo json_encode(array("approved" => $isVerified));
echo json_encode($userVerification);
// Cerrar la conexión después de usarla
$conexion = null;
?>
