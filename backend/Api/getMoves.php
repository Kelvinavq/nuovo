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

try {
    // Obtener ID de usuario desde la sesión
    $user_id = $_SESSION['user_id'];

    // Consulta para obtener las transacciones del usuario
    $getTransactionsQuery = "
      SELECT 
            t.*,
            d.amount AS deposit_amount,
            d.request_date AS deposit_request_date,
            d.request_time AS deposit_request_time,
            d.status AS deposit_status,
            d.reference_number AS deposit_reference_number,
            w.amount AS withdrawal_amount,
            w.request_date AS withdrawal_request_date,
            w.request_time AS withdrawal_request_time,
            w.status AS withdrawal_status,
            w.method AS withdrawal_method,
            w.reference_number AS withdrawal_reference_number,
            w.region AS withdrawal_region,
            w.recipient_user_id AS withdrawal_recipient_user_id
        FROM transactions t
        LEFT JOIN deposit_requests d ON t.deposit_request_id = d.id
        LEFT JOIN withdrawal_requests w ON t.withdrawal_request_id = w.id
        WHERE t.user_id = :user_id OR w.recipient_user_id = :user_id
        ORDER BY t.transaction_date DESC, t.transaction_time DESC
    ";
    $getTransactionsStmt = $conexion->prepare($getTransactionsQuery);
    $getTransactionsStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $getTransactionsStmt->execute();

    // Obtener resultados
    $transactions = $getTransactionsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Formatear la respuesta
    $formattedTransactions = array_map(function ($transaction) {
        $formattedDate = date('d-m-Y', strtotime($transaction['transaction_date']));
        $formattedTime = date('H:i:s', strtotime($transaction['transaction_time']));
        $user_id = $_SESSION['user_id'];

        $selectedLanguage = isset($_COOKIE['selectedLanguage']) ? $_COOKIE['selectedLanguage'] : 'es';


        if ($selectedLanguage === "en") {
            $transactionType = ($transaction['recipient_user_id'] == $user_id) ? 'Received Transfer' : $transaction['type'];
            $platformType = ($transaction['recipient_user_id'] == $user_id) ? 'Received Transfer' : $transaction['platform_type'];
        } else if ($selectedLanguage === "pt") {
            $transactionType = ($transaction['recipient_user_id'] == $user_id) ? 'Transferência recebida' : $transaction['type'];
            $platformType = ($transaction['recipient_user_id'] == $user_id) ? 'Transferência recebida' : $transaction['platform_type'];
        } else {
            $transactionType = ($transaction['recipient_user_id'] == $user_id) ? 'Transferencia recibida' : $transaction['type'];
            $platformType = ($transaction['recipient_user_id'] == $user_id) ? 'Transferencia recibida' : $transaction['platform_type'];
        }



        return array(
            'id' => $transaction['id'],
            'type' => $transactionType,
            'amount' => $transaction['amount'],
            'status' => $transaction['status'],
            'transaction_date' => $formattedDate,
            'transaction_time' => $formattedTime,
            'deposit' => array(
                'amount' => $transaction['deposit_amount'],
                'request_date' => $transaction['deposit_request_date'],
                'request_time' => $transaction['deposit_request_time'],
                'status' => $transaction['deposit_status'],
                'reference_number' => $transaction['deposit_reference_number'],
                'platform_type' => $platformType,
            ),
            'withdrawal' => array(
                'amount' => $transaction['withdrawal_amount'],
                'request_date' => $transaction['withdrawal_request_date'],
                'request_time' => $transaction['withdrawal_request_time'],
                'status' => $transaction['withdrawal_status'],
                'method' => $transaction['withdrawal_method'],
                'reference_number' => $transaction['withdrawal_reference_number'],
                'region' => $transaction['withdrawal_region'],
            )
        );
    }, $transactions);

    // Devolver las transacciones como JSON
    echo json_encode(array("transactions" => $formattedTransactions));
} catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(array("error" => "Error al obtener las transacciones", "details" => $e->getMessage()));
} finally {
    // Cerrar la conexión después de usarla
    $conexion = null;
}
