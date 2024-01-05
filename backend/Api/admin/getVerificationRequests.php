<?php
include '../../Config/config.php';
include '../../cors.php';

// Obtener conexión a la base de datos
$conexion = obtenerConexion();

// Verificar si hay una sesión activa
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(array("error" => "No hay una sesión activa."));
    exit();
}

// Verificar si la solicitud es de tipo GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(array("error" => "Método no permitido."));
    exit();
}

// Obtener la lista de solicitudes de verificación
$obtenerVerificacionesQuery = "SELECT uv.id, u.registrationTime, u.name, u.phoneNumber, u.email, u.address, DATE_FORMAT(uv.created_at, '%d-%m-%Y %H:%i:%s') AS fecha_solicitud, DATE_FORMAT(uv.updated_at, '%d-%m-%Y') AS fecha_registro, uv.status, uv.user_id, uv.dni_image, uv.selfie_with_dni_image, uv.dni_back FROM user_verification uv JOIN users u ON uv.user_id = u.id ORDER BY uv.created_at DESC";



$stmt = $conexion->prepare($obtenerVerificacionesQuery);
$stmt->execute();

// Manejar el caso en que no haya solicitudes de verificación
if ($stmt->rowCount() === 0) {
    http_response_code(404); // Not Found
    echo json_encode(array("error" => "No hay solicitudes de verificación."));
    exit();
}

// Obtener todas las solicitudes de verificación
$solicitudes = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Devolver la lista de solicitudes de verificación en formato JSON
http_response_code(200);
echo json_encode($solicitudes);

// Cerrar la conexión después de usarla
$conexion = null;
?>
