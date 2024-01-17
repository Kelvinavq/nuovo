<?php
include '../cors.php';

// Iniciar la sesión
session_start();

// Verificar si el usuario está autenticado
if (isset($_SESSION['user_id'])) {
    http_response_code(200);
    echo json_encode(array("message" => "Sesión válida."));
} else {
    http_response_code(401); // Unauthorized
    echo json_encode(array("error" => "Sesión no válida."));
}
?>
