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
    $paymentMethod = filter_var($data->payment_method, FILTER_SANITIZE_STRING);
    $amount = filter_var($data->amount);
    $referenceNumber = filter_var($data->reference_number, FILTER_SANITIZE_STRING); 
    
    

    // Iniciar transacción
    $conexion->beginTransaction();

    try {
        // Insertar la solicitud de depósito en la tabla deposit_requests
        $userId = $_SESSION['user_id'];
        $currentDateTime = date('Y-m-d H:i:s');
        $requestDate = date('Y-m-d');
        $requestTime = date('H:i:s');



        $insertDepositRequest = "INSERT INTO deposit_requests (user_id, payment_method, amount, status, request_date, request_time, reference_number, updated_at) 
        VALUES (:user_id, :payment_method, :amount, 'pending', :request_date, :request_time, :reference_number, :updated_at)";

        $stmtDeposit = $conexion->prepare($insertDepositRequest);
        $stmtDeposit->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmtDeposit->bindParam(':payment_method', $paymentMethod, PDO::PARAM_STR);
        $stmtDeposit->bindParam(':amount', $amount, PDO::PARAM_STR);
        $stmtDeposit->bindParam(':request_date', $requestDate, PDO::PARAM_STR);
        $stmtDeposit->bindParam(':request_time', $requestTime, PDO::PARAM_STR);
        $stmtDeposit->bindParam(':reference_number', $referenceNumber, PDO::PARAM_STR); 
        $stmtDeposit->bindParam(':updated_at', $currentDateTime, PDO::PARAM_STR);

        $stmtDeposit->execute();

        // Obtener el ID de la solicitud de depósito recién insertada
        $depositRequestId = $conexion->lastInsertId();

        // Insertar la transacción en la tabla transactions
        $transactionType = 'deposit';

        $insertTransaction = "INSERT INTO transactions (user_id, type, amount, status, transaction_date, transaction_time) 
        VALUES (:user_id, :type, :amount, 'pending', :transaction_date, :transaction_time)";

        $stmtTransaction = $conexion->prepare($insertTransaction);
        $stmtTransaction->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmtTransaction->bindParam(':type', $transactionType, PDO::PARAM_STR);
        $stmtTransaction->bindParam(':amount', $amount, PDO::PARAM_STR);
        $stmtTransaction->bindParam(':transaction_date', $requestDate, PDO::PARAM_STR);
        $stmtTransaction->bindParam(':transaction_time', $requestTime, PDO::PARAM_STR);

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
