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

    $verificationId = filter_var(intval($data->verificationId), FILTER_VALIDATE_INT);
    $user_id = filter_var(intval($data->user_id), FILTER_VALIDATE_INT);
    $bankAccount = htmlspecialchars($data->bankAccount);
    $selectedBankId = filter_var(intval($data->selectedBankId), FILTER_VALIDATE_INT);

    try {
        // Verificar si el número de cuenta ya existe en la tabla user_verification
        $checkExistingAccountQuery = "SELECT id FROM user_verification WHERE bank_account = :bankAccount AND status != 'denied'";
        $checkExistingAccountStmt = $conexion->prepare($checkExistingAccountQuery);
        $checkExistingAccountStmt->bindParam(':bankAccount', $bankAccount);
        $checkExistingAccountStmt->execute();

        if ($checkExistingAccountStmt->rowCount() > 0) {
            // El número de cuenta ya existe, mostrar alerta y solicitar el número de nuevo
            http_response_code(400); // Bad Request
            echo json_encode(array("error" => "El número de cuenta ya existe. Por favor, ingrese un número de cuenta diferente."));
            exit();
        }

        // Continuar con la actualización y la inserción
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
        $language = $userData['language'];

        // Verificar si se encontró el usuario y obtener el nombre
        if ($userData && isset($userData['name'])) {
            $userName = $userData['name'];
        }

        $userEmail = $userData['email'];

        // Insertar en la tabla bank_account
        $insertAccountQuery = "INSERT INTO bank_account (user_id, bank_id, account_number, ref) VALUES (:user_id, :bank_id, :account_number, :ref)";
        $insertStmt = $conexion->prepare($insertAccountQuery);
        $insertStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $insertStmt->bindParam(':bank_id', $selectedBankId, PDO::PARAM_INT);
        $insertStmt->bindParam(':account_number', $bankAccount);
        $insertStmt->bindParam(':ref', $userName);

        $insertStmt->execute();

        if ($language === "en") {
            $contentUser = "Your request for verification has been approved. An e-mail with the details has been sent.";
        } else if ($language === "pt") {
            $contentUser = "O seu pedido de verificação foi aprovado. Um e-mail foi enviado com os detalhes.";
        } else {
            $contentUser = "Su solicitud de verificacion ha sido aprobada. Se ha enviado un correo electronico con los detalles.";
        }

        // Insertar la notificación en la base de datos
      
        $contentAdmin = "Un administrador aprobó la solicitud de verificación del usuario " . $userName;

        $insertNotificationQuery = "INSERT INTO pusher_notifications (user_id, type, content, admin_message, status, status_admin, admin_id) VALUES (:user_id, 'approval_verification', :content_user, :content_admin, 'unread', 'unread', :admin_id)";
        $stmtInsertNotification = $conexion->prepare($insertNotificationQuery);
        $stmtInsertNotification->bindParam(':user_id', $user_id);
        $stmtInsertNotification->bindParam(':content_user', $contentUser);
        $stmtInsertNotification->bindParam(':content_admin', $contentAdmin);
        $stmtInsertNotification->bindParam(':admin_id', $adminId);
        $stmtInsertNotification->execute();

        // Enviar notificación a Pusher
        include("../../pusher.php");
        include("../../emailConfig.php");

        $notificationData = array('message' => 'Un administrador aprobó la solicitud de verificación del usuario ' . $userName);

        $data = [
            'message' => "Un administrador aprobó la solicitud de verificación del usuario " . $userName,
            'status' => 'unread',
            'type' => 'approval_verification',
            'user_id' => $adminId
        ];

        $pusher->trigger('notifications-channel', 'evento', $data);


        // Enviar notificación por correo electrónico 
        if ($language === "en") {
            $subjectMessage = 'Nuovo - Account Verification';
            $emailMessage = 'Your verification request has been approved, your account number within NUOVO is: ' . $bankAccount;
        } else if ($language === "pt") {
            $subjectMessage = 'Nuovo - Verificação de conta';
            $emailMessage = 'Seu pedido de verificação foi aprovado, seu número de conta dentro de NUOVO é: ' . $bankAccount;
        } else {
            $subjectMessage = 'Nuovo - Verificación de Cuenta';
            $emailMessage = 'Su solicitud de verificacion ha sido aprobada, su número de cuenta dentro de NUOVO es: ' . $bankAccount;
        }
        $to = $userEmail;
        $subject = $subjectMessage;
        $message = $emailMessage;

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
        $messageAdmin = 'Se ha aprobado la verificacion de la cuenta del usuario ' . $userName . ' correo electrónico: ' . $userEmail . ' y se le asignó el número de cuenta: ' .$bankAccount;

        $headersAdmin = 'From: ' . $adminEmail . "\r\n" .
            'Reply-To: ' . $adminEmail . "\r\n" .
            'X-Mailer: PHP/' . phpversion();

        if (mail($toAdmin, $subjectAdmin, $messageAdmin, $headersAdmin)) {
        } else {
            http_response_code(500);
            echo json_encode(array("error" => "Error al enviar correo electronico"));
        }

        http_response_code(200);
        echo json_encode(array("message" => "Número de cuenta actualizado con éxito."));
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("error" => "Error al actualizar el número de cuenta.", "details" => $e->getMessage()));
    }
}

$conexion = null;
