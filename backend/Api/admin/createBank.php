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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    $accountName = htmlspecialchars(strip_tags($data->accountName));
    $routingNumberACH = htmlspecialchars(strip_tags($data->routingNumberACH));
    $routingNumberWire = htmlspecialchars(strip_tags($data->routingNumberWire));
    $bankAddress = htmlspecialchars(strip_tags($data->bankAddress));
    $bankAddressNuovo = htmlspecialchars(strip_tags($data->bankAddressNuovo));

    try {
        // Insertar nueva cuenta de banco en la tabla banks
        $insertBankQuery = "INSERT INTO banks (account_name, routing_number_ach, routing_number_wire, bank_address, bank_address_nuovo) 
                            VALUES (:accountName, :routingNumberACH, :routingNumberWire, :bankAddress, :bankAddressNuovo)";
        $insertBankStmt = $conexion->prepare($insertBankQuery);

        $insertBankStmt->bindParam(':accountName', $accountName);
        $insertBankStmt->bindParam(':routingNumberACH', $routingNumberACH);
        $insertBankStmt->bindParam(':routingNumberWire', $routingNumberWire);
        $insertBankStmt->bindParam(':bankAddress', $bankAddress);
        $insertBankStmt->bindParam(':bankAddressNuovo', $bankAddressNuovo);

        $insertBankStmt->execute();

        http_response_code(201);
        echo json_encode(array("message" => "Cuenta de banco creada con éxito."));
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("error" => "Error al crear la cuenta de banco.", "details" => $e->getMessage()));
    }
}

$conexion = null;
?>
