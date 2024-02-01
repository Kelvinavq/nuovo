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

// Obtener el ID del depósito desde los parámetros de la URL
$depositRequestId = isset($_GET['id']) ? intval($_GET['id']) : null;

if ($depositRequestId === null) {
    http_response_code(400); // Bad Request
    echo json_encode(array("error" => "ID de depósito no válido."));
    exit();
}

try {
    // Obtener detalles específicos del depósito según su ID
    $query = "SELECT
                dr.*,
                u.name AS user_name,
                ba.account_number,
                ba.bank_id,
                b.account_name,
                b.routing_number_ach,
                b.routing_number_wire
            FROM
                deposit_requests dr
            LEFT JOIN
                users u ON dr.user_id = u.id
            LEFT JOIN
                bank_account ba ON dr.user_id = ba.user_id
            LEFT JOIN
                banks b ON ba.bank_id = b.id
            WHERE
                dr.id = :depositRequestId";

    $stmt = $conexion->prepare($query);
    $stmt->bindParam(':depositRequestId', $depositRequestId, PDO::PARAM_INT);
    $stmt->execute();

    $depositDetails = $stmt->fetch(PDO::FETCH_ASSOC);

    // Enviar la respuesta
    http_response_code(200); // OK
    echo json_encode($depositDetails);
} catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(array("error" => "Error al obtener los detalles del depósito.", "details" => $e->getMessage()));
}

// Cerrar la conexión después de usarla
$conexion = null;
?>
