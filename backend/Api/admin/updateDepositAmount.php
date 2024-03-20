<?php
include '../../Config/config.php';
include '../../cors.php';

// Obtener conexión a la base de datos
$conexion = obtenerConexion();

// Verificar si la solicitud es de tipo POST
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
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

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Obtener el ID de la solicitud de depósito y el nuevo monto desde la solicitud
    $depositRequestId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    $newAmount = filter_input(INPUT_GET, 'newAmount', FILTER_VALIDATE_FLOAT);
    $note = "Transacción modificada";

    if ($depositRequestId === null || $depositRequestId === false) {
        http_response_code(400); // Bad Request
        echo json_encode(array("error" => "ID de solicitud de depósito o monto nuevo inválido."));
        exit();
    }

    // Iniciar transacción
    $conexion->beginTransaction();

    try {

        $selectDepositRequest = "SELECT user_id, amount, comision, payment_method, final_amount FROM deposit_requests WHERE id = :id";
        $stmtSelectDeposit = $conexion->prepare($selectDepositRequest);
        $stmtSelectDeposit->bindParam(':id', $depositRequestId, PDO::PARAM_INT);
        $stmtSelectDeposit->execute();
        $depositInfo = $stmtSelectDeposit->fetch(PDO::FETCH_ASSOC);

        $f_amount = floatval(str_replace(',', '', $depositInfo['final_amount']));


        $newAmountFloat = floatval(str_replace(',', '', $newAmount));

        $originalAmount = floatval(str_replace(',', '', $depositInfo['amount']));
        $comision = floatval(str_replace(',', '', $depositInfo['comision']));

        $subtractedAmount = $newAmountFloat * ($comision / 100);
        $finalAmount = $newAmountFloat - $subtractedAmount;



        // Actualizar el monto en la tabla deposit_requests
        $updateDepositRequest = "UPDATE deposit_requests SET amount = :amount, comision = :comision, subtracted_amount = :subtracted_amount, final_amount = :final_amount, note_transaction_modified = :note_transaction_modified WHERE id = :id";
        $stmtDeposit = $conexion->prepare($updateDepositRequest);
        $stmtDeposit->bindParam(':id', $depositRequestId, PDO::PARAM_INT);
        $stmtDeposit->bindParam(':amount', $newAmount, PDO::PARAM_STR);
        $stmtDeposit->bindParam(':comision', $comision, PDO::PARAM_STR);
        $stmtDeposit->bindParam(':subtracted_amount', $subtractedAmount, PDO::PARAM_STR);
        $stmtDeposit->bindParam(':final_amount', $finalAmount, PDO::PARAM_STR);
        $stmtDeposit->bindParam(':note_transaction_modified', $note, PDO::PARAM_STR);
        $stmtDeposit->execute();

        // Actualizar el monto en la tabla transactions
        $updateTransaction = "UPDATE transactions SET amount = :amount, comision = :comision, subtracted_amount = :subtracted_amount, final_amount = :final_amount WHERE deposit_request_id = :deposit_request_id";
        $stmtTransaction = $conexion->prepare($updateTransaction);
        $stmtTransaction->bindParam(':deposit_request_id', $depositRequestId, PDO::PARAM_INT);
        $stmtTransaction->bindParam(':amount', $finalAmount, PDO::PARAM_STR);
        $stmtTransaction->bindParam(':comision', $comision, PDO::PARAM_STR);
        $stmtTransaction->bindParam(':subtracted_amount', $subtractedAmount, PDO::PARAM_STR);
        $stmtTransaction->bindParam(':final_amount', $finalAmount, PDO::PARAM_STR);
        $stmtTransaction->execute();

        // Actualizar el balance en la tabla user_balance
        $selectBalance = "SELECT balance FROM user_balances WHERE user_id = :user_id";
        $stmtSelectBalance = $conexion->prepare($selectBalance);
        $stmtSelectBalance->bindParam(':user_id', $depositInfo['user_id'], PDO::PARAM_INT);
        $stmtSelectBalance->execute();
        $currentBalance = $stmtSelectBalance->fetchColumn();


        $currentBalanceFloat = floatval(str_replace(',', '', $currentBalance));

        // Calcular el nuevo balance restando el monto original y sumando el nuevo monto

        if ($depositInfo['payment_method'] === "platform") {
            $newBalance = $currentBalanceFloat - $f_amount + $finalAmount;
        }else{
            $newBalance = $currentBalanceFloat - $originalAmount + $newAmountFloat;
        }

        // Actualizar el balance en la tabla user_balance
        $updateBalance = "UPDATE user_balances SET balance = :balance WHERE user_id = :user_id";
        $stmtUpdateBalance = $conexion->prepare($updateBalance);
        $stmtUpdateBalance->bindParam(':balance', $newBalance, PDO::PARAM_STR);
        $stmtUpdateBalance->bindParam(':user_id', $depositInfo['user_id'], PDO::PARAM_INT);
        $stmtUpdateBalance->execute();





        // notificaciones

        // obtener nombre del usuario
        $getUserNameQuery = "SELECT name, email, language FROM users WHERE id = :idUser";
        $getUserName = $conexion->prepare($getUserNameQuery);
        $getUserName->bindParam(':idUser', $depositInfo['user_id'], PDO::PARAM_INT);
        $getUserName->execute();
        $result = $getUserName->fetch(PDO::FETCH_LAZY);
        $userName = $result['name'];
        $userEmail = $result['email'];
        $language = $result['language'];



        if ($language === "en") {
            $contentUser = 'Your deposit request in the amount of $' . $originalAmount . ' has been modified by the new amount of $' . $newAmountFloat . ' If you do not know the reason, contact our team.';
            $subjectMessage = 'Nuovo - Modified deposit request';
        } else if ($language === "pt") {
            $contentUser = 'Sua solicitação de depósito no valor de $' . $originalAmount . ' foi modificado pelo novo valor de $' . $newAmountFloat . ' Caso não saiba o motivo, entre em contato com nossa equipe.';
            $subjectMessage = 'Nuovo - Solicitação de depósito modificada';
        } else {
            $contentUser = 'Su solicitud de depósito por el monto de $' . $originalAmount . ' ha sido modificado por el monto nuevo de $' . $newAmountFloat . ' si desconoce el motivo contáctese con nuestro equipo.';
            $subjectMessage = 'Nuovo - Solicitud de depósito modificada';
        }



        $contentAdmin = 'Un administrador modificó la solicitud de depósito por el monto original de $' . $originalAmount . " por el nuevo monto de $" . $newAmountFloat . " al usuario " . $userName;




        // Insertar la notificación en la base de datos
        $insertNotificationQuery = "INSERT INTO pusher_notifications (user_id, type, content, admin_message, status, status_admin, admin_id) VALUES (:user_id, 'deposit_modified', :content_user, :content_admin, 'unread', 'unread', :admin_id)";
        $stmtInsertNotification = $conexion->prepare($insertNotificationQuery);
        $stmtInsertNotification->bindParam(':user_id', $depositInfo['user_id']);
        $stmtInsertNotification->bindParam(':content_user', $contentUser);
        $stmtInsertNotification->bindParam(':content_admin', $contentAdmin);
        $stmtInsertNotification->bindParam(':admin_id', $adminId);
        $stmtInsertNotification->execute();

        // Enviar notificación a Pusher
        include("../../pusher.php");
        include("../../emailConfig.php");

        $notificationData = array('message' => $contentAdmin);

        $data = [
            'message' => $contentAdmin,
            'status' => 'unread',
            'type' => 'deposit_modified',
            'user_id' => $adminId
        ];

        $pusher->trigger('notifications-channel', 'evento', $data);

        // Enviar notificación por correo electrónico 

        $to = $userEmail;
        $subject = $subjectMessage;
        $message = $contentUser;

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
        $subjectAdmin = 'Nuovo - Solicitud de depósito modificada';
        $messageAdmin = $contentAdmin;

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
        echo json_encode(array("message" => "Monto de la solicitud de depósito actualizado exitosamente."));
    } catch (PDOException $e) {
        // Revertir la transacción en caso de error
        $conexion->rollBack();

        http_response_code(500); // Internal Server Error
        echo json_encode(array("error" => "Error al actualizar el monto de la solicitud." . $e, "details" => $e->getMessage()));
    }
}

// Cerrar la conexión después de usarla
$conexion = null;
