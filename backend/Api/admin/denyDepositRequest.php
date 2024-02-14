<?php

// denyRequest.php
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

// Obtener el ID de la solicitud de depósito y los motivos de denegación desde los parámetros de la solicitud
$depositRequestId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
$denialReasons = json_decode(file_get_contents("php://input"), true)['denialReasons'];

if ($depositRequestId === false || $depositRequestId === null) {
    http_response_code(400); // Bad Request
    echo json_encode(array("error" => "ID de solicitud de depósito inválido."));
    exit();
}

// Actualizar el estado de la solicitud de depósito como "denegada" y guardar los motivos de denegación
$updateStatusQuery = "UPDATE deposit_requests SET status = 'denied', admin_message = :admin_message WHERE id = :deposit_request_id";
$stmtUpdateStatus = $conexion->prepare($updateStatusQuery);
$stmtUpdateStatus->bindParam(':deposit_request_id', $depositRequestId, PDO::PARAM_INT);
$stmtUpdateStatus->bindParam(':admin_message', $denialReasons, PDO::PARAM_STR);
$stmtUpdateStatus->execute();

$updateStatusQueryTransactions = "UPDATE transactions SET status = 'denied' WHERE deposit_request_id = :deposit_request_id";
$stmtUpdateStatusTransactions = $conexion->prepare($updateStatusQueryTransactions);
$stmtUpdateStatusTransactions->bindParam(':deposit_request_id', $depositRequestId, PDO::PARAM_INT);
$stmtUpdateStatusTransactions->execute();

// obtener id del usuario
$getUserIdQuery = "SELECT * FROM deposit_requests WHERE id = :deposit_request_id";
$getUserId = $conexion->prepare($getUserIdQuery);
$getUserId->bindParam(':deposit_request_id', $depositRequestId, PDO::PARAM_INT);
$getUserId->execute();
$resultDeposit = $getUserId->fetch(PDO::FETCH_LAZY);
$userId = $resultDeposit['user_id'];

// obtener nombre del usuario
$getUserNameQuery = "SELECT name, email, language FROM users WHERE id = :idUser";
$getUserName = $conexion->prepare($getUserNameQuery);
$getUserName->bindParam(':idUser', $userId, PDO::PARAM_INT);
$getUserName->execute();
$result = $getUserName->fetch(PDO::FETCH_LAZY);
$userName = $result['name'];
$userEmail = $result['email'];
$language = $result['language'];


// notificaciones

if ($language === "en") {
    $contentUser = "Your withdrawal deposit for $" . $resultDeposit['amount'] . " has been denied. An e-mail with the reasons has been sent.";
} else if ($language === "pt") {
    $contentUser = "Seu pedido de depósito por $" . $resultDeposit['amount'] . " foi recusado. Foi enviado um e-mail com os motivos.";
} else {
    $contentUser = "Su solicitud de depósito por $" . $resultDeposit['amount'] . " ha sido denegada. Se ha enviado un correo electronico con los motivos.";
}


$contentAdmin = "Un administrador denegó la solicitud de depósito del usuario " . $userName . " correo electrónico: " . $userEmail . " por un monto de $" . $resultDeposit['amount'];

// Insertar la notificación en la base de datos
$insertNotificationQuery = "INSERT INTO pusher_notifications (user_id, type, content, admin_message, status, status_admin, admin_id) VALUES (:user_id, 'deny_deposit', :content_user, :content_admin, 'unread', 'unread', :admin_id)";
$stmtInsertNotification = $conexion->prepare($insertNotificationQuery);
$stmtInsertNotification->bindParam(':user_id', $userId);
$stmtInsertNotification->bindParam(':content_user', $contentUser);
$stmtInsertNotification->bindParam(':content_admin', $contentAdmin);
$stmtInsertNotification->bindParam(':admin_id', $adminId);
$stmtInsertNotification->execute();


// Enviar notificación a Pusher
include("../../pusher.php");
include("../../emailConfig.php");

$notificationData = array('message' => 'Un administrador denegó la solicitud de depósito del usuario ' . $userName);

$data = [
    'message' => "Un administrador denegó la solicitud de depósito del usuario " . $userName,
    'status' => 'unread',
    'type' => 'deny_deposit',
    'user_id' => $adminId
];

$pusher->trigger('notifications-channel', 'evento', $data);

// Enviar notificación por correo electrónico 
if ($language === "en") {
    $subjectMessage = 'Nuovo - Request for deposit denied';
    $emailMessage = 'Your deposit request for the amount of $ ' . $resultDeposit['amount'] . ' has been denied on the following grounds: ' . $denialReasons;
} else if ($language === "pt") {
    $subjectMessage = 'Nuovo - Pedido de depósito recusado';
    $emailMessage = 'Pedido de depósito do montante de $ ' . $resultDeposit['amount'] . ' foi recusado pelos seguintes motivos:: ' . $denialReasons;
} else {
    $subjectMessage = 'Nuovo - Solicitud de depósito denegada';
    $emailMessage = 'Su solicitud de depósito por el monto de $ ' . $resultDeposit['amount'] . ' ha sido denegada por los siguientes motivos: ' . $denialReasons;
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
$subjectAdmin = 'Nuovo - Solicitud de retiro denegada';
$messageAdmin = 'Se ha denegado la solicitud de depósito por el monto de $ ' . $resultDeposit['amount'] . ' de la cuenta del usuario ' . $userName . ' correo electrónico: ' . $userEmail . ' por los motivos: ' . $denialReasons;

$headersAdmin = 'From: ' . $adminEmail . "\r\n" .
    'Reply-To: ' . $adminEmail . "\r\n" .
    'X-Mailer: PHP/' . phpversion();

if (mail($toAdmin, $subjectAdmin, $messageAdmin, $headersAdmin)) {
} else {
    http_response_code(500);
    echo json_encode(array("error" => "Error al enviar correo electronico"));
}


http_response_code(200); // OK
echo json_encode(array("message" => "Solicitud de depósito marcada como denegada con éxito."));

// Cerrar la conexión después de usarla
$conexion = null;
