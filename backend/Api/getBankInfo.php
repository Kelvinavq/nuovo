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

// Obtener el ID del usuario de la sesión
$userId = $_SESSION['user_id'];

// Verificar si se proporciona el ID del usuario en la consulta
if (!isset($_GET['userId'])) {
    http_response_code(400); // Bad Request
    echo json_encode(array("error" => "Se requiere el ID del usuario."));
    exit();
}

// Obtener el ID del usuario desde la consulta
$requestedUserId = $_GET['userId'];

// Verificar si el usuario actual tiene permisos para obtener la información del banco
if ($userId != $requestedUserId) {
    http_response_code(403); // Forbidden
    echo json_encode(array("error" => "No tienes permisos para acceder a esta información."));
    exit();
}

// Consultar la base de datos para obtener la información del banco
$obtenerInformacionBanco = "SELECT ba.account_number, ba.ref, b.account_name, b.routing_number_ach, b.routing_number_wire, b.bank_address
FROM bank_account ba
LEFT JOIN banks b ON ba.bank_id = b.id
WHERE ba.user_id = :userId
";

$stmt = $conexion->prepare($obtenerInformacionBanco);
$stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
$stmt->execute();

// Manejar el caso en que no haya información del banco
if ($stmt->rowCount() === 0) {
    http_response_code(404); // Not Found
    echo json_encode(array("error" => "No se encontró información del banco para el usuario."));
    exit();
}

// Obtener la información del banco
$bankInfo = $stmt->fetch(PDO::FETCH_ASSOC);

// Devolver la información del banco en formato JSON
http_response_code(200);
echo json_encode($bankInfo);

// Cerrar la conexión después de usarla
$conexion = null;
?>
