<?php

// denyRequest.php
include '../../Config/config.php';
include '../../cors.php';

// Obtener conexión a la base de datos
$conexion = obtenerConexion();

// Verificar si la solicitud es de tipo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(array("error" => "Método no permitido."));
    exit();
}

// Verificar si hay una sesión activa
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(array("error" => "No hay una sesión activa."));
    exit();
}

// Obtener el ID de la solicitud de depósito y los motivos de denegación desde los parámetros de la solicitud
$depositRequestId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
$denialReasons = json_decode(file_get_contents("php://input"), true)['denialReasons'];

if ($depositRequestId === false || $depositRequestId === null) {
    http_response_code(400); // Bad Request
    echo json_encode(array("error" => "ID de solicitud de depósito inválido."));
    exit();
}

// Actualizar el estado de la solicitud de depósito como "denegada" y guardar los motivos de denegación
$updateStatusQuery = "UPDATE deposit_requests SET status = 'denied', admin_message = :admin_message WHERE id = :deposit_request_id";
$stmtUpdateStatus = $conexion->prepare($updateStatusQuery);
$stmtUpdateStatus->bindParam(':deposit_request_id', $depositRequestId, PDO::PARAM_INT);
$stmtUpdateStatus->bindParam(':admin_message', $denialReasons, PDO::PARAM_STR);
$stmtUpdateStatus->execute();

$updateStatusQueryTransactions = "UPDATE transactions SET status = 'denied' WHERE deposit_request_id = :deposit_request_id";
$stmtUpdateStatusTransactions = $conexion->prepare($updateStatusQueryTransactions);
$stmtUpdateStatusTransactions->bindParam(':deposit_request_id', $depositRequestId, PDO::PARAM_INT);
$stmtUpdateStatusTransactions->execute();

// Puedes realizar acciones adicionales aquí, como enviar notificaciones, etc.

http_response_code(200); // OK
echo json_encode(array("message" => "Solicitud de depósito marcada como denegada con éxito."));

// Cerrar la conexión después de usarla
$conexion = null;
