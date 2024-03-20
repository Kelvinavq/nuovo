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
    $getTransactionsQuery = "SELECT transactions.*, 
    deposit_requests.note_amount_modified AS deposit_note_amount_modified,
    deposit_requests.note_transaction_modified AS deposit_note_transaction_modified,
    withdrawal_requests.note_amount_modified AS withdrawal_note_amount_modified
FROM transactions
LEFT JOIN deposit_requests ON transactions.deposit_request_id = deposit_requests.id
LEFT JOIN withdrawal_requests ON transactions.withdrawal_request_id = withdrawal_requests.id
WHERE transactions.user_id = :user_id OR transactions.recipient_user_id = :user_id
ORDER BY transactions.transaction_date DESC, transactions.transaction_time DESC
LIMIT 6";
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

        if ($selectedLanguage == "en") {
            $received = ($transaction['recipient_user_id'] == $user_id) ? 'Transfer received' : "Withdraw Funds";
            $notaTransaccion = "Modified transaction";

        } elseif ($selectedLanguage == "pt") {
            $received = ($transaction['recipient_user_id'] == $user_id) ? 'Transferência recebida' : "Retirar fundos";
            $notaTransaccion = "Transação modificada";

        } else {
            $received = ($transaction['recipient_user_id'] == $user_id) ? 'Transferencia recibida' : "Retirar Fondos";
            $notaTransaccion = $transaction['deposit_note_transaction_modified'];
        }


        return array(
            'type' => $transaction['type'],
            'amount' => $transaction['amount'],
            'status' => $transaction['status'],
            'platform_type' => $transaction['platform_type'],
            'payment_method' => $transaction['payment_method'],
            'received' => $received,
            'transaction_date' => $formattedDate,
            'transaction_time' => $formattedTime,
            'final_amount' => $transaction['final_amount'],
            'deposit_note_amount_modified' => $transaction['deposit_note_amount_modified'],
            'withdrawal_note_amount_modified' => $transaction['withdrawal_note_amount_modified'],
            'deposit_note_transaction_modified' => $notaTransaccion,

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
