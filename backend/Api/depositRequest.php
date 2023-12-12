<?php
include '../Config/config.php';
include '../cors.php';

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



if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener datos del cuerpo de la solicitud
    $data = json_decode(file_get_contents("php://input"));

    // Validar y escapar los datos para prevenir SQL injection
    $paymentMethod = htmlspecialchars(strip_tags($data->payment_method));
    $amount = floatval($data->amount);

    // Validar que el monto sea mayor a cero
    if ($amount <= 0) {
        http_response_code(400); // Bad Request
        echo json_encode(array("error" => "El monto debe ser mayor a cero."));
        exit();
    }

    // Insertar la solicitud de depósito en la base de datos
    $userId = $_SESSION['user_id'];
    $currentDateTime = date('Y-m-d H:i:s');
    $requestDate = date('Y-m-d');
    $requestTime = date('H:i:s');

    $insertDepositRequest = "INSERT INTO deposit_requests (user_id, payment_method, amount, status, request_date, request_time, updated_at) 
    VALUES (:user_id, :payment_method, :amount, 'pending', :request_date, :request_time, :updated_at)";

    $stmt = $conexion->prepare($insertDepositRequest);
    $stmt->bindParam(':user_id', $userId);
    $stmt->bindParam(':payment_method', $paymentMethod);
    $stmt->bindParam(':amount', $amount);
    $stmt->bindParam(':request_date', $requestDate);
    $stmt->bindParam(':request_time', $requestTime);
    $stmt->bindParam(':updated_at', $currentDateTime);

    try {
        $stmt->execute();
        http_response_code(201); // Created
        echo json_encode(array("message" => "Solicitud de depósito enviada con éxito."));
    } catch (PDOException $e) {
        http_response_code(500); // Internal Server Error
        echo json_encode(array("error" => "Error al procesar la solicitud de depósito.", "details" => $e->getMessage()));
    }
}

// Cerrar la conexión después de usarla
$conexion = null;
