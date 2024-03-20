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

    $verificationId = filter_var(intval($data->verificationId), FILTER_VALIDATE_INT);
    $user_id = filter_var(intval($data->user_id), FILTER_VALIDATE_INT);
    $bankAccount = htmlspecialchars($data->bankAccount);

    try {
        // Verificar si el número de cuenta ya existe en la tabla user_verification
        $checkExistingAccountQuery = "SELECT id FROM user_verification WHERE bank_account = :bankAccount AND status != 'denied'";
        $checkExistingAccountStmt = $conexion->prepare($checkExistingAccountQuery);
        $checkExistingAccountStmt->bindParam(':bankAccount', $bankAccount);
        $checkExistingAccountStmt->execute();

        if ($checkExistingAccountStmt->rowCount() > 0) {
            // El número de cuenta ya existe, mostrar alerta y solicitar el número de nuevo
            http_response_code(400); 
            echo json_encode(array("error" => "El número de cuenta ya existe. Por favor, ingrese un número de cuenta diferente."));
            exit();
        }


        // Si el número de cuenta no está registrado, se considera válido
        // Ahora actualizamos el número de cuenta en la tabla user_verification
        $updateBankAccountQuery = "UPDATE user_verification SET bank_account = :bankAccount WHERE id = :id";
        $updateStmt = $conexion->prepare($updateBankAccountQuery);
        $updateStmt->bindParam(':bankAccount', $bankAccount);
        $updateStmt->bindParam(':id', $verificationId, PDO::PARAM_INT);
        $updateStmt->execute();

        // Enviamos una respuesta de éxito al cliente
        http_response_code(200);
        echo json_encode(array("message" => "Número de cuenta actualizado con éxito."));
    } catch (PDOException $e) {
        // Manejar errores de la base de datos
        http_response_code(500); // Internal Server Error
        echo json_encode(array("error" => "Error al actualizar el número de cuenta.", "details" => $e->getMessage()));
    }
}

$conexion = null;
?>
