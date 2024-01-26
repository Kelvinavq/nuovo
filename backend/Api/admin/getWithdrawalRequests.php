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
    // Obtener las solicitudes de retiro desde la base de datos
    $query = "SELECT
    wr.*,
    u.name AS user_name
FROM
    withdrawal_requests wr
LEFT JOIN
    users u ON wr.user_id = u.id
ORDER BY
    wr.created_at DESC;";

    $stmt = $conexion->prepare($query);
    $stmt->execute();

    $withdrawalRequests = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($withdrawalRequests as &$request) {
        $request['request_date'] = date('d-m-Y', strtotime($request['request_date']));
    }

    // Enviar la respuesta
    http_response_code(200); // OK
    echo json_encode($withdrawalRequests);
} catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(array("error" => "Error al obtener las solicitudes de retiro.", "details" => $e->getMessage()));
}

// Cerrar la conexión después de usarla
$conexion = null;
?>
