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

// Verificar si la solicitud es de tipo GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(array("error" => "Método no permitido."));
    exit();
}

// Obtener el ID de la plataforma desde los parámetros de la URL
$platformId = isset($_GET['platformId']) ? $_GET['platformId'] : null;

if (!$platformId) {
    http_response_code(400); // Bad Request
    echo json_encode(array("error" => "Falta el parámetro 'platformId'."));
    exit();
}

try {
    // Consultar la base de datos para obtener la información detallada de la plataforma
    $query = "SELECT * FROM platforms WHERE id = :platformId";
    $stmt = $conexion->prepare($query);
    $stmt->bindParam(':platformId', $platformId, PDO::PARAM_INT);
    $stmt->execute();

    $platformInfo = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($platformInfo) {
        http_response_code(200); // OK
        echo json_encode($platformInfo);
    } else {
        http_response_code(404); // Not Found
        echo json_encode(array("error" => "Plataforma no encontrada."));
    }
} catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(array("error" => "Error al obtener la información de la plataforma.", "details" => $e->getMessage()));
}

// Cerrar la conexión después de usarla
$conexion = null;
?>
