<?php
include '../../Config/config.php';
include '../../cors.php';

// Obtener conexión a la base de datos
$conexion = obtenerConexion();

// Verificar si hay una sesión activa
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(array("error" => "No hay una sesión activa."));
    exit();
}
$adminId = $_SESSION['user_id'];

// Verificar si la solicitud es de tipo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(array("error" => "Método no permitido."));
    exit();
}

// Obtener datos del cuerpo de la solicitud
$data = json_decode(file_get_contents("php://input"), true);

// Verificar la presencia del ID de la solicitud y al menos un dato
if (!isset($_GET['id']) || empty($data['denialReasons'])) {
    http_response_code(400); // Bad Request
    echo json_encode(array("error" => "Parámetros incompletos."));
    exit();
}

$withdrawalRequestId = $_GET['id'];
$denialReasons = $data['denialReasons'];

try {
    // Obtener información de la solicitud de retiro
    $withdrawalInfo = getWithdrawalInfo($conexion, $withdrawalRequestId);

    // Iniciar transacción
    $conexion->beginTransaction();

    // Actualizar la solicitud de retiro con los motivos de denegación y cambiar el estado a 'denied'
    updateWithdrawalRequest($conexion, $withdrawalRequestId, array('status' => 'denied', 'denial_reasons' => $denialReasons));

    // Devolver el saldo al usuario
    updateUserBalance($conexion, $withdrawalInfo['user_id'], $withdrawalInfo['amount']);
    $userId = $withdrawalInfo['user_id'];
    // Actualizar la transacción con el estado 'denied'
    updateTransactionStatus($conexion, $withdrawalRequestId, 'denied');


    // Confirmar la transacción
    $conexion->commit();

    // obtener nombre del usuario
    $getUserNameQuery = "SELECT name, email FROM users WHERE id = :idUser";
    $getUserName = $conexion->prepare($getUserNameQuery);
    $getUserName->bindParam(':idUser', $userId, PDO::PARAM_INT);
    $getUserName->execute();
    $result = $getUserName->fetch(PDO::FETCH_LAZY);
    $userName = $result['name'];
    $userEmail = $result['email'];


    // notificaciones

    $contentUser = "Su solicitud de retiro por $" . $withdrawalInfo['amount'] . " ha sido denegada. Se ha enviado un correo electronico con los motivos.";
    $contentAdmin = "Un administrador denegó la solicitud de retiro del usuario " . $userName . " correo electrónico: " . $userEmail . " por un monto de $" . $withdrawalInfo['amount'];


    // Insertar la notificación en la base de datos
    $insertNotificationQuery = "INSERT INTO pusher_notifications (user_id, type, content, admin_message, status, status_admin, admin_id) VALUES (:user_id, 'deny_withdrawal', :content_user, :content_admin, 'unread', 'unread', :admin_id)";
    $stmtInsertNotification = $conexion->prepare($insertNotificationQuery);
    $stmtInsertNotification->bindParam(':user_id', $userId);
    $stmtInsertNotification->bindParam(':content_user', $contentUser);
    $stmtInsertNotification->bindParam(':content_admin', $contentAdmin);
    $stmtInsertNotification->bindParam(':admin_id', $adminId);
    $stmtInsertNotification->execute();

    // Enviar notificación a Pusher
    include("../../pusher.php");
    include("../../emailConfig.php");


    $notificationData = array('message' => 'Un administrador denegó la solicitud de retiro del usuario ' . $userName);

    $data = [
        'message' => "Un administrador denegó la solicitud de retiro del usuario " . $userName,
        'status' => 'unread',
        'type' => 'deny_withdrawal',
        'user_id' => $adminId
    ];

    $pusher->trigger('notifications-channel', 'evento', $data);


    // Enviar notificación por correo electrónico 
    $to = $userEmail;
    $subject = 'Nuovo - Solicitud de retiro denegada';
    $message = 'Su solicitud de retiro por el monto de $ ' . $withdrawalInfo['amount'] . ' ha sido denegada por los siguientes motivos: ' . $denialReasons;

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
    $messageAdmin = 'Se ha denegado la solicitud de retiro por el monto de $ ' . $withdrawalInfo['amount'] . ' de la cuenta del usuario ' . $userName . ' correo electrónico: ' . $userEmail . ' por los motivos: ' . $denialReasons;

    $headersAdmin = 'From: ' . $adminEmail . "\r\n" .
        'Reply-To: ' . $adminEmail . "\r\n" .
        'X-Mailer: PHP/' . phpversion();

    if (mail($toAdmin, $subjectAdmin, $messageAdmin, $headersAdmin)) {
    } else {
        http_response_code(500);
        echo json_encode(array("error" => "Error al enviar correo electronico"));
    }

    // Éxito
    http_response_code(200); // OK
    echo json_encode(array("message" => "La solicitud ha sido marcada como denegada con éxito y el saldo ha sido devuelto al usuario."));
} catch (PDOException $e) {
    // Revertir la transacción en caso de error
    $conexion->rollBack();

    http_response_code(500); // Internal Server Error
    echo json_encode(array("error" => "Error al denegar la solicitud de retiro.", "details" => $e->getMessage()));
}

// Cerrar la conexión después de usarla
$conexion = null;

function updateWithdrawalRequest($conexion, $withdrawalRequestId, $data)
{
    $updateColumns = '';
    foreach ($data as $column => $value) {
        $updateColumns .= "$column = :$column, ";
    }
    $updateColumns = rtrim($updateColumns, ', ');

    $query = "UPDATE withdrawal_requests SET $updateColumns WHERE id = :id";
    $stmt = $conexion->prepare($query);
    $stmt->bindParam(':id', $withdrawalRequestId, PDO::PARAM_INT);

    foreach ($data as $column => $value) {
        // Utiliza marcadores de posición nombrados
        $stmt->bindValue(":$column", $value, is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR);
    }

    $stmt->execute();
}

function getWithdrawalInfo($conexion, $withdrawalRequestId)
{
    $query = "SELECT user_id, amount FROM withdrawal_requests WHERE id = :id";
    $stmt = $conexion->prepare($query);
    $stmt->bindParam(':id', $withdrawalRequestId, PDO::PARAM_INT);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    return $result ? $result : null;
}

function updateUserBalance($conexion, $userId, $amount)
{
    $query = "UPDATE user_balances SET balance = balance + :amount WHERE user_id = :user_id";
    $stmt = $conexion->prepare($query);
    $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
    $stmt->bindParam(':amount', $amount, PDO::PARAM_STR);
    $stmt->execute();
}

function updateTransactionStatus($conexion, $withdrawalRequestId, $status)
{
    $query = "UPDATE transactions SET status = :status WHERE withdrawal_request_id = :withdrawal_request_id";
    $stmt = $conexion->prepare($query);
    $stmt->bindParam(':withdrawal_request_id', $withdrawalRequestId, PDO::PARAM_INT);
    $stmt->bindParam(':status', $status, PDO::PARAM_STR);
    $stmt->execute();
}
