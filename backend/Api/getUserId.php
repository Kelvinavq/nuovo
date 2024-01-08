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

// Devolver el ID del usuario en formato JSON
http_response_code(200);
echo json_encode(array("userId" => $userId));

// Cerrar la conexión después de usarla
$conexion = null;
?>
