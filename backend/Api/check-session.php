<?php
include '../Config/config.php';
include '../cors.php';

// Iniciar la sesión
session_start();

// Verificar si el usuario está autenticado
if (isset($_SESSION['user_id'])) {
    http_response_code(200);
    echo json_encode(array("message" => "Sesión válida."));
} 
?>
