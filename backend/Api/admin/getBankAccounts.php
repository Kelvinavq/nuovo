<?php
include '../../Config/config.php';
include '../../cors.php';

$conexion = obtenerConexion();

// Verificar si hay una sesión activa
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(array("error" => "No hay una sesión activa."));
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Obtener la lista de cuentas de banco
        $getBankAccountsQuery = "SELECT id, account_name FROM banks";
        $getBankAccountsStmt = $conexion->prepare($getBankAccountsQuery);
        $getBankAccountsStmt->execute();
        $bankAccounts = $getBankAccountsStmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode($bankAccounts);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("error" => "Error al obtener la lista de cuentas de banco.", "details" => $e->getMessage()));
    }
}

$conexion = null;
?>
