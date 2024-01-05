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
    $account_id = $_GET['id'];

    try {
        $query = "SELECT * FROM banks WHERE id = :id";
        $stmt = $conexion->prepare($query);
        $stmt->bindParam(':id', $account_id, PDO::PARAM_STR);
        $stmt->execute();

        $bankAccountDetails = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($bankAccountDetails) {
            // Obtener el número de registros asociados a esta cuenta en la tabla bank_account
            $countQuery = "SELECT COUNT(*) AS registros FROM bank_account WHERE bank_id = :id";
            $countStmt = $conexion->prepare($countQuery);
            $countStmt->bindParam(':id', $account_id, PDO::PARAM_STR);
            $countStmt->execute();
            $registros = $countStmt->fetchColumn();

            $bankAccountDetails['registros'] = $registros;

            http_response_code(200);
            echo json_encode($bankAccountDetails);
        } else {
            http_response_code(404);
            echo json_encode(array("error" => "No se encontraron detalles para la cuenta de banco proporcionada."));
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("error" => "Error al obtener detalles de la cuenta de banco.", "details" => $e->getMessage()));
    }
}

$conexion = null;
?>
