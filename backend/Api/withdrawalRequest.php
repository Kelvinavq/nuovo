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

// Función para limpiar y validar datos de entrada
function limpiarEntrada($dato) {
    $dato = trim($dato);
    $dato = stripslashes($dato);
    $dato = htmlspecialchars($dato);
    return $dato;
}

try {
    // Obtener datos de la solicitud
    $requestData = json_decode(file_get_contents("php://input"));
    $user_id = $_SESSION['user_id'];

    // Limpiar y validar datos de entrada
    $payment_method = limpiarEntrada($requestData->payment_method);
    $amount = floatval(limpiarEntrada($requestData->amount));
    $cbu = limpiarEntrada($requestData->cbu);

    // Validar que el monto sea mayor a cero
    if ($amount <= 0) {
        echo json_encode(["error" => "El monto de retiro debe ser mayor a cero"]);
        http_response_code(400);
        exit();
    }

    // Obtener el saldo del usuario desde la base de datos
    $getUserBalanceQuery = "SELECT balance FROM user_balances WHERE user_id = :user_id";
    $balanceStmt = $conexion->prepare($getUserBalanceQuery);
    $balanceStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $balanceStmt->execute();

    // Manejar el caso en el que la consulta no devuelve resultados
    $userBalance = $balanceStmt->fetch(PDO::FETCH_LAZY);

    // Validar que el usuario tenga suficiente saldo
    if ($amount > floatval($userBalance['balance'])) {
        echo json_encode(["error" => "Saldo insuficiente para realizar el retiros"]);
        http_response_code(400);
        exit();
    }

    // Iniciar transacción
    $conexion->beginTransaction();

    // Realizar el retiro y actualizar el saldo
    $updateBalanceQuery = "UPDATE user_balances SET balance = balance - :amount WHERE user_id = :user_id";
    $updateBalanceStmt = $conexion->prepare($updateBalanceQuery);
    $updateBalanceStmt->bindParam(':amount', $amount, PDO::PARAM_STR);
    $updateBalanceStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $updateBalanceStmt->execute();

    // Insertar la solicitud de retiro en la tabla withdrawal_requests
    $insertWithdrawalQuery = "INSERT INTO withdrawal_requests (user_id, payment_method, amount, cbu, status, request_date, request_time) 
                              VALUES (:user_id, :payment_method, :amount, :cbu, 'pending', CURRENT_DATE(), CURRENT_TIME())";
    $insertWithdrawalStmt = $conexion->prepare($insertWithdrawalQuery);
    $insertWithdrawalStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $insertWithdrawalStmt->bindParam(':payment_method', $payment_method, PDO::PARAM_STR);
    $insertWithdrawalStmt->bindParam(':amount', $amount, PDO::PARAM_STR);
    $insertWithdrawalStmt->bindParam(':cbu', $cbu, PDO::PARAM_STR);
    $insertWithdrawalStmt->execute();

    // Obtener el ID de la solicitud de retiro recién insertada
    $withdrawalRequestId = $conexion->lastInsertId();

    // Insertar la transacción en la tabla transactions
    $transactionType = 'withdrawal';
    $transactionDate = date('Y-m-d');
    $transactionTime = date('H:i:s');

    $insertTransactionQuery = "INSERT INTO transactions (user_id, type, amount, status, transaction_date, transaction_time) 
                               VALUES (:user_id, :type, :amount, 'pending', :transaction_date, :transaction_time)";
    $insertTransactionStmt = $conexion->prepare($insertTransactionQuery);
    $insertTransactionStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $insertTransactionStmt->bindParam(':type', $transactionType, PDO::PARAM_STR);
    $insertTransactionStmt->bindParam(':amount', $amount, PDO::PARAM_STR);
    $insertTransactionStmt->bindParam(':transaction_date', $transactionDate, PDO::PARAM_STR);
    $insertTransactionStmt->bindParam(':transaction_time', $transactionTime, PDO::PARAM_STR);
    $insertTransactionStmt->execute();

    // Confirmar la transacción
    $conexion->commit();

    echo json_encode(["message" => "Solicitud de retiro enviada con éxito"]);
    http_response_code(200);
} catch (PDOException $e) {
    // Revertir la transacción en caso de error
    $conexion->rollBack();

    echo json_encode(["error" => "Hubo un error al procesar la solicitud de retiro"]);
    http_response_code(500);
    exit();
} finally {
    // Cerrar la conexión al finalizar
    $conexion = null;
}
?>
