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

     // Actualizar la transacción con el estado 'denied'
     updateTransactionStatus($conexion, $withdrawalRequestId, 'denied');


    // Confirmar la transacción
    $conexion->commit();

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

?>
