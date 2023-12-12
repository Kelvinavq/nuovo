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
    $getTransactionsQuery = "SELECT * FROM transactions WHERE user_id = :user_id ORDER BY transaction_date DESC, transaction_time DESC LIMIT 10";
    $getTransactionsStmt = $conexion->prepare($getTransactionsQuery);
    $getTransactionsStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $getTransactionsStmt->execute();

    // Obtener resultados
    $transactions = $getTransactionsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Formatear la respuesta
    $formattedTransactions = array_map(function ($transaction) {
        $formattedDate = date('d-m-Y', strtotime($transaction['transaction_date']));
        $formattedTime = date('H:i:s', strtotime($transaction['transaction_time']));
        return array(
            'type' => $transaction['type'],
            'amount' => $transaction['amount'],
            'status' => $transaction['status'],
            'transaction_date' => $formattedDate,
            'transaction_time' => $formattedTime
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
?>
