<?php

include '../Config/config.php';
include '../cors.php';

// Obtener conexión a la base de datos
$conexion = obtenerConexion();

// Verificar si la solicitud es de tipo GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Método no permitido
    echo json_encode(array("error" => "Método no permitido."));
    exit();
}

// Verificar si hay una sesión activa
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(array("error" => "No hay una sesión activa."));
    exit();
}

// Obtener el ID del usuario que realiza la búsqueda 
$userId = $_SESSION['user_id'];


// Consultar la lista de correos electrónicos de usuarios con el rol "user" 
$query = "SELECT u.id, u.email FROM users u
          JOIN user_verification uv ON u.id = uv.user_id
          WHERE u.role = 'user' AND u.id <> :userId AND uv.status = 'approved'";

$stmt = $conexion->prepare($query);
$stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
$stmt->execute();

if ($stmt->rowCount() > 0) {
    $emails = $stmt->fetchAll(PDO::FETCH_ASSOC);
    http_response_code(200);
    echo json_encode(array("emails" => $emails));
} else {
    http_response_code(404); // No encontrado
    echo json_encode(array("error" => "No se encontraron correos electrónicos."));
}

// Cerrar la conexión después de usarla
$conexion = null;

?>
