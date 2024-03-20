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
    $user_id = filter_var(intval($_POST['id']), FILTER_VALIDATE_INT);
    $balance = htmlspecialchars($_POST['balance']);
    $note = htmlspecialchars($_POST['note']);
    $operation = htmlspecialchars($_POST['operation']);

    $amount = str_replace(',', '', $balance); // Eliminar comas
    $amount = floatval($balance); // Convertir a valor numérico

    $currentDateTime = date('Y-m-d H:i:s');
    $requestDate = date('Y-m-d');
    $requestTime = date('H:i:s');

    try {

        if ($operation === "sumar") {

            $insertDepositRequest = "INSERT INTO deposit_requests (user_id, payment_method, amount, status, request_date, request_time, updated_at, note_amount_modified) 
            VALUES (:user_id, :payment_method, :amount, 'approved', :request_date, :request_time, :updated_at, :note_amount_modified)";
            $stmtDeposit = $conexion->prepare($insertDepositRequest);
            $stmtDeposit->bindParam(':user_id', $user_id, PDO::PARAM_INT);
            $stmtDeposit->bindParam(':payment_method', $operation, PDO::PARAM_STR);
            $stmtDeposit->bindParam(':amount', $amount, PDO::PARAM_STR);
            $stmtDeposit->bindParam(':request_date', $requestDate, PDO::PARAM_STR);
            $stmtDeposit->bindParam(':request_time', $requestTime, PDO::PARAM_STR);
            $stmtDeposit->bindParam(':updated_at', $currentDateTime, PDO::PARAM_STR);
            $stmtDeposit->bindParam(':note_amount_modified', $note, PDO::PARAM_STR);
            $stmtDeposit->execute();
            $depositRequestId = $conexion->lastInsertId();

            $insertTransaction = "INSERT INTO transactions (user_id, type, amount, status, transaction_date, transaction_time, deposit_request_id) 
            VALUES (:user_id, :type, :amount, 'approved', :transaction_date, :transaction_time, :deposit_request_id)";

            $stmtTransaction = $conexion->prepare($insertTransaction);
            $stmtTransaction->bindParam(':user_id', $user_id, PDO::PARAM_INT);
            $stmtTransaction->bindParam(':type', $operation, PDO::PARAM_STR);
            $stmtTransaction->bindParam(':amount', $amount, PDO::PARAM_STR);
            $stmtTransaction->bindParam(':transaction_date', $requestDate, PDO::PARAM_STR);
            $stmtTransaction->bindParam(':transaction_time', $requestTime, PDO::PARAM_STR);
            $stmtTransaction->bindParam(':deposit_request_id', $depositRequestId, PDO::PARAM_INT);

            $stmtTransaction->execute();
        } else if ($operation === "restar") {

            $insertWithdrawalRequest = "INSERT INTO withdrawal_requests (user_id, status, amount, request_date, request_time, updated_at, completed_at, method, note_amount_modified) VALUES(:user_id, 'approved', :amount, :request_date, :request_time, :updated_at, :completed_at, :method, :note_amount_modified)";

            $stmtWithdrawal = $conexion->prepare($insertWithdrawalRequest);

            $stmtWithdrawal->bindParam(':user_id', $user_id, PDO::PARAM_INT);
            $stmtWithdrawal->bindParam(':amount', $amount, PDO::PARAM_STR);
            $stmtWithdrawal->bindParam(':request_date', $requestDate, PDO::PARAM_STR);
            $stmtWithdrawal->bindParam(':request_time', $requestTime, PDO::PARAM_STR);
            $stmtWithdrawal->bindParam(':updated_at', $currentDateTime, PDO::PARAM_STR);
            $stmtWithdrawal->bindParam(':completed_at', $currentDateTime, PDO::PARAM_STR);
            $stmtWithdrawal->bindParam(':method', $operation, PDO::PARAM_STR);
            $stmtWithdrawal->bindParam(':note_amount_modified', $note, PDO::PARAM_STR);

            $stmtWithdrawal->execute();
            $withdrwaRequestId = $conexion->lastInsertId();


            $insertTransaction = "INSERT INTO transactions (user_id, type, amount, status, transaction_date, transaction_time, withdrawal_request_id ) 
        VALUES (:user_id, :type, :amount, 'approved', :transaction_date, :transaction_time, :withdrawal_request_id )";

            $stmtTransaction = $conexion->prepare($insertTransaction);
            $stmtTransaction->bindParam(':user_id', $user_id, PDO::PARAM_INT);
            $stmtTransaction->bindParam(':type', $operation, PDO::PARAM_STR);
            $stmtTransaction->bindParam(':amount', $amount, PDO::PARAM_STR);
            $stmtTransaction->bindParam(':transaction_date', $requestDate, PDO::PARAM_STR);
            $stmtTransaction->bindParam(':transaction_time', $requestTime, PDO::PARAM_STR);
            $stmtTransaction->bindParam(':withdrawal_request_id', $withdrwaRequestId, PDO::PARAM_INT);

            $stmtTransaction->execute();
        }


        // Obtener el balance actual del usuario
        $selectBalanceQuery = "SELECT balance FROM user_balances WHERE user_id = :user_id";
        $selectStmt = $conexion->prepare($selectBalanceQuery);
        $selectStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $selectStmt->execute();
        $currentBalance = $selectStmt->fetchColumn();

        $currentBalanceFloat = floatval(str_replace(',', '', $currentBalance));
        $balanceFormatted = floatval(str_replace(',', '', $balance));

        // Calcular el nuevo balance
        $newBalance = $operation === 'sumar' ? $currentBalanceFloat + $balanceFormatted : $currentBalanceFloat - $balanceFormatted;

        // Actualizar el balance del usuario
        $updateBalanceQuery = "UPDATE user_balances SET balance = :balance WHERE user_id = :user_id";
        $updateStmt = $conexion->prepare($updateBalanceQuery);
        $updateStmt->bindParam(':balance', $newBalance);
        $updateStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $updateStmt->execute();


        // notificaciones

        // obtener nombre del usuario
        $getUserNameQuery = "SELECT name, email, language FROM users WHERE id = :idUser";
        $getUserName = $conexion->prepare($getUserNameQuery);
        $getUserName->bindParam(':idUser', $user_id, PDO::PARAM_INT);
        $getUserName->execute();
        $result = $getUserName->fetch(PDO::FETCH_LAZY);
        $userName = $result['name'];
        $userEmail = $result['email'];
        $language = $result['language'];

        if ($language === "en") {
            $operacion = $operation  === "sumar" ? "added" : "subtracted";
            $contentUser = "Its balance has been modified, it has " . $operacion . " the amount of $ " . $balanceFormatted;
            $subjectMessage = 'Nuovo - Balance modified';
        } else if ($language === "pt") {
            $operacion = $operation  === "sumar" ? "adicionado" : "subtraído";
            $contentUser = "Seu equilíbrio foi modificado, foi " . $operacion . " a quantia de $ " . $balanceFormatted;
            $subjectMessage = 'Nuovo - Saldo modificado';
        } else {
            $operacion = $operation  === "sumar" ? "sumado" : "restado";
            $contentUser = "Su balance ha sido modificado, se ha " . $operacion . " la cantidad de $ " . $balanceFormatted;
            $subjectMessage = 'Nuovo - Balance modificado';
        }

        $contentAdmin = 'Un administrador realizó la operación de "' . $operation . '" por la cantidad de "$' . $balanceFormatted . '" al usuario "' . $userName . '", email "' . $userEmail . '" ';


        // Insertar la notificación en la base de datos
        $insertNotificationQuery = "INSERT INTO pusher_notifications (user_id, type, content, admin_message, status, status_admin, admin_id) VALUES (:user_id, 'balance_modified', :content_user, :content_admin, 'unread', 'unread', :admin_id)";
        $stmtInsertNotification = $conexion->prepare($insertNotificationQuery);
        $stmtInsertNotification->bindParam(':user_id', $user_id);
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
            'type' => 'balance_modified',
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
        $subjectAdmin = 'Nuovo - Balance modificado';
        $messageAdmin = $contentAdmin;

        $headersAdmin = 'From: ' . $adminEmail . "\r\n" .
            'Reply-To: ' . $adminEmail . "\r\n" .
            'X-Mailer: PHP/' . phpversion();

        if (mail($toAdmin, $subjectAdmin, $messageAdmin, $headersAdmin)) {
        } else {
            http_response_code(500);
            echo json_encode(array("error" => "Error al enviar correo electronico"));
        }

        http_response_code(200);
        echo json_encode(array("message" => "Balance actualizado con éxito."));
    } catch (PDOException $e) {
        // Manejar errores específicos de PDO
        if ($e->errorInfo[1] === 1062) {
            http_response_code(500);
            echo json_encode(array("error" => "Error de duplicado al realizar la inserción.", "details" => $e->getMessage()));
        } else {
            http_response_code(500);
            echo json_encode(array("error" => "Error durante la inserción.", "details" => $e->getMessage()));
        }
    }
}

$conexion = null;
