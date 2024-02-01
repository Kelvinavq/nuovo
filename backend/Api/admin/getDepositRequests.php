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

try {
    // Obtener las solicitudes de depósito desde la base de datos
    $query = "SELECT
    dr.*,
    u.name AS user_name
FROM
    deposit_requests dr
LEFT JOIN
    users u ON dr.user_id = u.id

ORDER BY
    dr.updated_at DESC";
    $stmt = $conexion->prepare($query);
    $stmt->execute();

    $depositRequests = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($depositRequests as &$request) {
        $request['request_date'] = date('d-m-Y', strtotime($request['request_date']));
    }

    // Enviar la respuesta
    http_response_code(200); // OK
    echo json_encode($depositRequests);
} catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(array("error" => "Error al obtener las solicitudes de depósito.", "details" => $e->getMessage()));
}

// Cerrar la conexión después de usarla
$conexion = null;
