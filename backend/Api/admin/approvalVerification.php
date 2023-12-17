<?php
include '../../Config/config.php';
include '../../cors.php';

$conexion = obtenerConexion();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    $verificationId = intval($data->verificationId);
    $action = $data->action; // 'approve' o 'deny'

    try {
        // Actualizar el estado de la solicitud de verificación
        $updateVerificationStatusQuery = "UPDATE user_verification SET status = :status WHERE id = :id";
        $updateStmt = $conexion->prepare($updateVerificationStatusQuery);

        $status = ($action === 'approve') ? 'approved' : 'denied';
        $updateStmt->bindParam(':status', $status);
        $updateStmt->bindParam(':id', $verificationId, PDO::PARAM_INT);

        $updateStmt->execute();

        // Puedes realizar otras acciones aquí, como notificar al usuario, etc.

        http_response_code(200);
        echo json_encode(array("message" => "Solicitud de verificación actualizada con éxito."));
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("error" => "Error al actualizar el estado de la solicitud.", "details" => $e->getMessage()));
    }
}

$conexion = null;
?>
