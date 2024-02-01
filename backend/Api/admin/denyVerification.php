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
$adminId = $_SESSION['user_id'];


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

        // obtener nombre del usuario
        $getUserNameQuery = "SELECT name, email FROM users WHERE id = :idUser";
        $getUserName = $conexion->prepare($getUserNameQuery);
        $getUserName->bindParam(':idUser', $userId, PDO::PARAM_INT);
        $getUserName->execute();
        $result = $getUserName->fetch(PDO::FETCH_LAZY);
        $userName = $result['name'];
        $userEmail = $result['email'];


        $contentUser = "Su solicitud de verificacion ha sido denegada. Se ha enviado un correo electronico con los motivos.";
        $contentAdmin = "Un administrador denegó la solicitud de verificación del usuario " . $userName;

        // Insertar la notificación en la base de datos
        $insertNotificationQuery = "INSERT INTO pusher_notifications (user_id, type, content, admin_message, status, status_admin, admin_id) VALUES (:user_id, 'deny_verification', :content_user, :content_admin, 'unread', 'unread', :admin_id)";
        $stmtInsertNotification = $conexion->prepare($insertNotificationQuery);
        $stmtInsertNotification->bindParam(':user_id', $userId);
        $stmtInsertNotification->bindParam(':content_user', $contentUser);
        $stmtInsertNotification->bindParam(':content_admin', $contentAdmin);
        $stmtInsertNotification->bindParam(':admin_id', $adminId);
        $stmtInsertNotification->execute();

        // Enviar notificación a Pusher
        include("../../pusher.php");
        include("../../emailConfig.php");

        $notificationData = array('message' => 'Un administrador denegó la solicitud de verificación del usuario ' . $userName);

        $data = [
            'message' => "Un administrador denegó la solicitud de verificación del usuario " . $userName,
            'status' => 'unread',
            'type' => 'deny_verification',
            'user_id' => $adminId
        ];

        $pusher->trigger('notifications-channel', 'evento', $data);

        // Enviar notificación por correo electrónico 
        $to = $userEmail;
        $subject = 'Nuovo - Verificación de Cuenta';
        $message = 'Su solicitud de verificacion ha sido denegada por los siguientes motivos: ' . $formattedReasons;

        $headers = 'From: ' . $adminEmail . "\r\n" .
            'Reply-To: ' . $adminEmail . "\r\n" .
            'X-Mailer: PHP/' . phpversion();

        if (mail($to, $subject, $message, $headers)) {
        } else {
            http_response_code(500);
            echo json_encode(array("error" => "Error al enviar correo electronico"));
        }

        // admin
        $toAdmin = $adminEmail;
        $subjectAdmin = 'Nuovo - Verificación de Cuenta';
        $messageAdmin = 'Se ha denegado la verificacion de la cuenta del usuario ' . $userName . ' correo electrónico: ' . $userEmail . ' por los motivos: ' .$formattedReasons;

        $headersAdmin = 'From: ' . $adminEmail . "\r\n" .
            'Reply-To: ' . $adminEmail . "\r\n" .
            'X-Mailer: PHP/' . phpversion();

        if (mail($toAdmin, $subjectAdmin, $messageAdmin, $headersAdmin)) {
        } else {
            http_response_code(500);
            echo json_encode(array("error" => "Error al enviar correo electronico"));
        }


        http_response_code(200);
        echo json_encode(array("message" => "Solicitud de verificación denegada con éxito."));
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("error" => "Error al denegar la solicitud.", "details" => $e->getMessage()));
    }
}

$conexion = null;
