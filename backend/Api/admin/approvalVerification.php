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

        // Obtener información del usuario asociado a la solicitud
        $getUserQuery = "SELECT user_id FROM user_verification WHERE id = :id";
        $getUserStmt = $conexion->prepare($getUserQuery);
        $getUserStmt->bindParam(':id', $verificationId, PDO::PARAM_INT);
        $getUserStmt->execute();
        $userId = $getUserStmt->fetchColumn();

        // Agregar notificación al usuario
        $notificationMessage = "El estado de tu solicitud de verificación ha sido actualizado a $status.";
        $addNotification = "INSERT INTO notifications (user_id, content, is_read) VALUES (:userId, :message, 0)";
        $stmtNotification = $conexion->prepare($addNotification);
        $stmtNotification->bindParam(':userId', $userId);
        $stmtNotification->bindParam(':message', $notificationMessage);
        $stmtNotification->execute();

        // Verificar si la acción es 'approve' para manejar la actualización del número de cuenta
        if ($action === 'approve') {
            // Lógica para actualizar el número de cuenta bancaria
            // Enviar el número de cuenta al frontend para que el usuario lo ingrese

            // A continuación, puedes agregar el código para enviar el número de cuenta al frontend
            // y procesar la entrada del usuario en JavaScript, como se hizo anteriormente.
        }

        http_response_code(200);
        echo json_encode(array("message" => "Solicitud de verificación actualizada con éxito."));
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("error" => "Error al actualizar el estado de la solicitud.", "details" => $e->getMessage()));
    }
}

$conexion = null;
?>
