<?php

include '../../Config/config.php';
include '../../cors.php';

// Obtener conexión a la base de datos
$conexion = obtenerConexion();

// Verificar si el usuario está autenticado como administrador
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(array("error" => "Administrador no autenticado."));
    exit();
}

if (!isset($_GET['id'])) {
    http_response_code(400); // Bad Request
    echo json_encode(array("error" => "Se debe proporcionar el ID de la cuenta."));
    exit();
}

$id = $_GET['id'];

$getNumberAccount = "SELECT bank_account, user_id FROM user_verification WHERE id = :id";
$stmt = $conexion->prepare($getNumberAccount);
$stmt->bindParam(':id', $id);
$stmt->execute();

if ($stmt->rowCount() > 0) {
    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode(array("bank_account" => $data));
} else {
    http_response_code(500); // Internal Server Error
    echo json_encode(array("error" => "Error al obtener el el numero de cuenta del usuario."));
}

// Cerrar la conexión después de usarla
$conexion = null;
?>
