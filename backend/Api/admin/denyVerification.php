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
    $reasons = $data->reasons;
    $otraText = isset($data->otraText) ? $data->otraText : null;

    try {
        // Unir las razones en una cadena para almacenar en la base de datos
        $formattedReasons = implode(", ", $reasons);

        // Agregar el motivo personalizado, si está presente
        if (!empty($otraText)) {
            $formattedReasons .= ", " . $otraText;
        }

        // Actualizar el estado de la solicitud de verificación a 'denied'
        $updateVerificationStatusQuery = "UPDATE user_verification SET status = 'denied', content = :reasons WHERE id = :id";
        $updateStmt = $conexion->prepare($updateVerificationStatusQuery);
        $updateStmt->bindParam(':reasons', $formattedReasons);
        $updateStmt->bindParam(':id', $verificationId, PDO::PARAM_INT);

        $updateStmt->execute();

        // Obtener información del usuario asociado a la solicitud
        $getUserQuery = "SELECT user_id FROM user_verification WHERE id = :id";
        $getUserStmt = $conexion->prepare($getUserQuery);
        $getUserStmt->bindParam(':id', $verificationId, PDO::PARAM_INT);
        $getUserStmt->execute();
        $userId = $getUserStmt->fetchColumn();

        // Agregar notificación al usuario
        $notificationMessage = "El estado de tu solicitud de verificación ha sido actualizado a denegado. Motivo: $formattedReasons";
        $addNotification = "INSERT INTO notifications (user_id, content, is_read) VALUES (:userId, :message, 0)";
        $stmtNotification = $conexion->prepare($addNotification);
        $stmtNotification->bindParam(':userId', $userId);
        $stmtNotification->bindParam(':message', $notificationMessage);
        $stmtNotification->execute();

        http_response_code(200);
        echo json_encode(array("message" => "Solicitud de verificación denegada con éxito."));
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("error" => "Error al denegar la solicitud.", "details" => $e->getMessage()));
    }
}

$conexion = null;
?>
