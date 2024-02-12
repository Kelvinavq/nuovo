<?php
include '../Config/config.php';
include '../cors.php';

// Obtener conexión a la base de datos
$conexion = obtenerConexion();

// Verificar si la solicitud es de tipo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Método no permitido
    echo json_encode(array("error" => "Método no permitido."));
    exit();
}

// Obtener datos del cuerpo de la solicitud
$data = json_decode(file_get_contents("php://input"));

if (!$data || !isset($data->token)) {
    http_response_code(400); // Bad Request
    echo json_encode(array("error" => "Token no proporcionado."));
    exit();
}

// Consulta SQL para verificar la existencia y validez del token
$validateTokenQuery = "SELECT id FROM password_reset_requests WHERE token = :token AND created_at > DATE_SUB(NOW(), INTERVAL 10 MINUTE)";

// Preparar la consulta SQL
$stmt = $conexion->prepare($validateTokenQuery);
$stmt->bindParam(':token', $data->token);

// Ejecutar la consulta SQL
$stmt->execute();

// Verificar si el token es válido
if ($stmt->rowCount() > 0) {
    // Token válido
    http_response_code(200);
    echo json_encode(array("valid" => true));
} else {
    // Token no válido o vencido
    http_response_code(403); // Forbidden
    echo json_encode(array("error" => "Token no válido o vencido."));
}

// Cerrar la conexión después de usarla
$conexion = null;
?>
