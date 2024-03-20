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

try {
    // Consultar la base de datos para obtener la lista de plataformas
    $query = "SELECT * FROM platforms WHERE status = 'active'";
    $stmt = $conexion->prepare($query);
    $stmt->execute();

    $platforms = $stmt->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200); // OK
    echo json_encode($platforms);
    
} catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(array("error" => "Error al obtener la lista de plataformas.", "details" => $e->getMessage()));
}

// Cerrar la conexión después de usarla
$conexion = null;
?>
