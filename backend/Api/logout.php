<?php
include '../Config/config.php';
include '../cors.php';

// Iniciar la sesión
session_start();

// Destruir todas las variables de sesión
session_destroy();

// Devolver la respuesta como JSON
$response = [
    'success' => true,
];

header('Content-Type: application/json');
echo json_encode($response);
?>
