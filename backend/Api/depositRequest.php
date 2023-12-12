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

    // Iniciar transacción
    $conexion->beginTransaction();

    try {
        // Insertar la solicitud de depósito en la tabla deposit_requests
        $userId = $_SESSION['user_id'];
        $currentDateTime = date('Y-m-d H:i:s');
        $requestDate = date('Y-m-d');
        $requestTime = date('H:i:s');

        $insertDepositRequest = "INSERT INTO deposit_requests (user_id, payment_method, amount, status, request_date, request_time, updated_at) 
        VALUES (:user_id, :payment_method, :amount, 'pending', :request_date, :request_time, :updated_at)";

        $stmtDeposit = $conexion->prepare($insertDepositRequest);
        $stmtDeposit->bindParam(':user_id', $userId);
        $stmtDeposit->bindParam(':payment_method', $paymentMethod);
        $stmtDeposit->bindParam(':amount', $amount);
        $stmtDeposit->bindParam(':request_date', $requestDate);
        $stmtDeposit->bindParam(':request_time', $requestTime);
        $stmtDeposit->bindParam(':updated_at', $currentDateTime);

        $stmtDeposit->execute();

        // Obtener el ID de la solicitud de depósito recién insertada
        $depositRequestId = $conexion->lastInsertId();

        // Insertar la transacción en la tabla transactions
        $transactionType = 'deposit';
        $transactionDate = $requestDate;
        $transactionTime = $requestTime;

        $insertTransaction = "INSERT INTO transactions (user_id, type, amount, status, transaction_date, transaction_time) 
        VALUES (:user_id, :type, :amount, 'pending', :transaction_date, :transaction_time)";

        $stmtTransaction = $conexion->prepare($insertTransaction);
        $stmtTransaction->bindParam(':user_id', $userId);
        $stmtTransaction->bindParam(':type', $transactionType);
        $stmtTransaction->bindParam(':amount', $amount);
        $stmtTransaction->bindParam(':transaction_date', $transactionDate);
        $stmtTransaction->bindParam(':transaction_time', $transactionTime);

        $stmtTransaction->execute();

        // Confirmar la transacción
        $conexion->commit();

        http_response_code(201); // Created
        echo json_encode(array("message" => "Solicitud de depósito enviada con éxito."));
    } catch (PDOException $e) {
        // Revertir la transacción en caso de error
        $conexion->rollBack();

        http_response_code(500); // Internal Server Error
        echo json_encode(array("error" => "Error al procesar la solicitud de depósito.", "details" => $e->getMessage()));
    }
}

// Cerrar la conexión después de usarla
$conexion = null;
?>
