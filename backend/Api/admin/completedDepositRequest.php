<?php
include '../../Config/config.php';
include '../../cors.php';

// Obtener conexión a la base de datos
$conexion = obtenerConexion();

// Verificar si la solicitud es de tipo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(array("error" => "Método no permitido."));
    exit();
}

// Verificar si hay una sesión activa
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(array("error" => "No hay una sesión activa."));
    exit();
}
$adminId = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener el ID de la solicitud de depósito desde la solicitud
    $depositRequestId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);

    if ($depositRequestId === null || $depositRequestId === false) {
        http_response_code(400); // Bad Request
        echo json_encode(array("error" => "ID de solicitud de depósito inválido."));
        exit();
    }

    // Iniciar transacción
    $conexion->beginTransaction();

    try {
        // Actualizar el estado en la tabla deposit_requests
        $updateDepositRequest = "UPDATE deposit_requests SET status = 'approved' WHERE id = :id";
        $stmtDeposit = $conexion->prepare($updateDepositRequest);
        $stmtDeposit->bindParam(':id', $depositRequestId, PDO::PARAM_INT);
        $stmtDeposit->execute();

        // Obtener información de la solicitud de depósito
        $selectDepositRequest = "SELECT user_id, amount FROM deposit_requests WHERE id = :id";
        $stmtSelectDeposit = $conexion->prepare($selectDepositRequest);
        $stmtSelectDeposit->bindParam(':id', $depositRequestId, PDO::PARAM_INT);
        $stmtSelectDeposit->execute();
        $depositInfo = $stmtSelectDeposit->fetch(PDO::FETCH_ASSOC);

        // Actualizar el estado en la tabla transactions
        $updateTransaction = "UPDATE transactions SET status = 'approved' WHERE deposit_request_id = :deposit_request_id";
        $stmtTransaction = $conexion->prepare($updateTransaction);
        $stmtTransaction->bindParam(':deposit_request_id', $depositRequestId, PDO::PARAM_INT);
        $stmtTransaction->execute();

        // Actualizar el balance en la tabla user_balance
        $selectBalance = "SELECT balance FROM user_balances WHERE user_id = :user_id";
        $stmtSelectBalance = $conexion->prepare($selectBalance);
        $stmtSelectBalance->bindParam(':user_id', $depositInfo['user_id'], PDO::PARAM_INT);
        $stmtSelectBalance->execute();
        $currentBalance = $stmtSelectBalance->fetchColumn();

        // Calcular el nuevo balance sumando el monto de la transacción
        $newBalance = floatval($currentBalance) + floatval($depositInfo['amount']);

        // Actualizar el balance en la tabla user_balance
        $updateBalance = "UPDATE user_balances SET balance = :balance WHERE user_id = :user_id";
        $stmtUpdateBalance = $conexion->prepare($updateBalance);
        $stmtUpdateBalance->bindParam(':balance', $newBalance, PDO::PARAM_STR);
        $stmtUpdateBalance->bindParam(':user_id', $depositInfo['user_id'], PDO::PARAM_INT);
        $stmtUpdateBalance->execute();


        // obtener nombre del usuario
        $getUserNameQuery = "SELECT name, email, language FROM users WHERE id = :idUser";
        $getUserName = $conexion->prepare($getUserNameQuery);
        $getUserName->bindParam(':idUser', $depositInfo['user_id'], PDO::PARAM_INT);
        $getUserName->execute();
        $result = $getUserName->fetch(PDO::FETCH_LAZY);
        $userName = $result['name'];
        $userEmail = $result['email'];
        $language = $result['language'];

        // notificaciones

        if ($language === "en") {
            $contentUser = "Your deposit request for $" . $depositInfo['amount'] . " has been approved.";
        } else if ($language === "pt") {
            $contentUser = "Seu pedido de depósito por $" . $depositInfo['amount'] . " foi aprovado.";
        } else {
            $contentUser = "Su solicitud de depósito por $" . $depositInfo['amount'] . " ha sido aprobada.";
        }

   

        $contentAdmin = "Un administrador aprobó la solicitud de depósito del usuario " . $userName . " correo electrónico: " . $userEmail . " por un monto de $" . $depositInfo['amount'];

        // Insertar la notificación en la base de datos
        $insertNotificationQuery = "INSERT INTO pusher_notifications (user_id, type, content, admin_message, status, status_admin, admin_id) VALUES (:user_id, 'approval_deposit', :content_user, :content_admin, 'unread', 'unread', :admin_id)";
        $stmtInsertNotification = $conexion->prepare($insertNotificationQuery);
        $stmtInsertNotification->bindParam(':user_id', $depositInfo['user_id']);
        $stmtInsertNotification->bindParam(':content_user', $contentUser);
        $stmtInsertNotification->bindParam(':content_admin', $contentAdmin);
        $stmtInsertNotification->bindParam(':admin_id', $adminId);
        $stmtInsertNotification->execute();

        // Enviar notificación a Pusher
        include("../../pusher.php");
        include("../../emailConfig.php");

        $notificationData = array('message' => 'Un administrador aprobó la solicitud de depósito del usuario ' . $userName);

        $data = [
            'message' => "Un administrador aprobó la solicitud de depósito del usuario " . $userName,
            'status' => 'unread',
            'type' => 'approval_deposit',
            'user_id' => $adminId
        ];

        $pusher->trigger('notifications-channel', 'evento', $data);

        // Enviar notificación por correo electrónico 

        if ($language === "en") {
            $subjectMessage = 'Nuovo - Deposit request approved';
            $emailMessage = 'Your deposit request for the amount of $ ' . $depositInfo['amount'] . ' has been approved.';
        } else if ($language === "pt") {
            $subjectMessage = 'Nuovo - Solicitação de depósito aprovada';
            $emailMessage = 'A sua solicitação de depósito pelo montante de $ ' . $depositInfo['amount'] . ' foi aprovada.';
        } else {
            $subjectMessage = 'Nuovo - Solicitud de depósito aprobada';
            $emailMessage = 'Su solicitud de depósito por el monto de $ ' . $depositInfo['amount'] . ' ha sido aprobada.';
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
        $subjectAdmin = 'Nuovo - Solicitud de depósito aprobada';
        $messageAdmin = 'Se ha aprobado la solicitud de depósito por el monto de $ ' . $depositInfo['amount'] . ' de la cuenta del usuario ' . $userName . ' correo electrónico: ' . $userEmail;

        $headersAdmin = 'From: ' . $adminEmail . "\r\n" .
            'Reply-To: ' . $adminEmail . "\r\n" .
            'X-Mailer: PHP/' . phpversion();

        if (mail($toAdmin, $subjectAdmin, $messageAdmin, $headersAdmin)) {
        } else {
            http_response_code(500);
            echo json_encode(array("error" => "Error al enviar correo electronico"));
        }


        // Confirmar la transacción
        $conexion->commit();

        http_response_code(200); // OK
        echo json_encode(array("message" => "Solicitud de depósito marcada como completada."));
    } catch (PDOException $e) {
        // Revertir la transacción en caso de error
        $conexion->rollBack();

        http_response_code(500); // Internal Server Error
        echo json_encode(array("error" => "Error al marcar la solicitud como completada." . $e, "details" => $e->getMessage()));
    }
}

// Cerrar la conexión después de usarla
$conexion = null;
