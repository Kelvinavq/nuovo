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
    $selectedBankId = filter_var(intval($data->selectedBankId), FILTER_VALIDATE_INT);
    

    try {
        // Actualizar el número de cuenta bancaria en la tabla user_verification
        $updateBankAccountQuery = "UPDATE user_verification SET bank_account = :bankAccount, status = 'approved'  WHERE id = :id";
        $updateStmt = $conexion->prepare($updateBankAccountQuery);

        $updateStmt->bindParam(':bankAccount', $bankAccount);
        $updateStmt->bindParam(':id', $verificationId, PDO::PARAM_INT);

        $updateStmt->execute();

        // Obtener el nombre del usuario desde la tabla users
        $getUserNameQuery = "SELECT * FROM users WHERE id = :userId";
        $getUserNameStmt = $conexion->prepare($getUserNameQuery);
        $getUserNameStmt->bindParam(':userId', $user_id, PDO::PARAM_INT);
        $getUserNameStmt->execute();

        // Obtener el nombre de usuario usando FETCH_ASSOC
        $userData = $getUserNameStmt->fetch(PDO::FETCH_LAZY);

        // Verificar si se encontró el usuario y obtener el nombre
        if ($userData && isset($userData['name'])) {
            $userName = $userData['name'];
        }


        // Insertar en la tabla bank_account
        $insertAccountQuery = "INSERT INTO bank_account (user_id, bank_id, account_number, ref) VALUES (:user_id, :bank_id, :account_number, :ref)";
        $insertStmt = $conexion->prepare($insertAccountQuery);
        $insertStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $insertStmt->bindParam(':bank_id', $selectedBankId, PDO::PARAM_INT);
        $insertStmt->bindParam(':account_number', $bankAccount);
        $insertStmt->bindParam(':ref', $userName);

        $insertStmt->execute();



        http_response_code(200);
        echo json_encode(array("message" => "Número de cuenta actualizado con éxito."));
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("error" =>"Error al actualizar el número de cuenta." , "details" => $e->getMessage()));
    }
}

$conexion = null;
