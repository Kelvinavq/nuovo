<?php
include '../Config/config.php';
include '../cors.php';

// Verificar si hay una sesión activa
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(["error" => "No hay una sesión activa."]);
    exit();
}

// Obtener el saldo del usuario desde la base de datos
try {
    $user_id = $_SESSION['user_id'];
    $getUserBalanceQuery = "SELECT balance FROM user_balances WHERE user_id = :user_id";
    $stmt = obtenerConexion()->prepare($getUserBalanceQuery);
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->execute();

    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result !== false) {
        echo json_encode(["balance" => $result['balance']]);
    } else {
        http_response_code(404); // Not Found
        echo json_encode(["error" => "No se encontró el saldo del usuario."]);
    }
} catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(["error" => "Error al obtener el saldo del usuario."]);
}
?>
