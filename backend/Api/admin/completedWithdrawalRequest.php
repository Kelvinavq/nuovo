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
if (!isset($_GET['id']) || empty($data)) {
    http_response_code(400); // Bad Request
    echo json_encode(array("error" => "Parámetros incompletos."));
    exit();
}

$withdrawalRequestId = $_GET['id'];
$method = getWithdrawalMethod($conexion, $withdrawalRequestId);

try {
    switch ($method) {
        case 'efectivo':
            // Actualizar la columna 'message' con el mensaje proporcionado desde el frontend
            updateWithdrawalRequest($conexion, $withdrawalRequestId, array('message' => $data['withdrawalAddress']));
            break;

        case 'transferencia_nacional':
        case 'transferencia_externa':
            // Verificar la existencia y validez del número de referencia
            if (!isset($data['transactionReference']) || empty($data['transactionReference'])) {
                http_response_code(400); // Bad Request
                echo json_encode(array("error" => "Número de referencia inválido."));
                exit();
            }

            // Actualizar la columna 'reference_number' y cambiar el estado a 'approved'
            updateWithdrawalRequest($conexion, $withdrawalRequestId, array('reference_number' => $data['transactionReference'], 'status' => 'approved'));

            // También actualizamos la tabla 'transactions'
            updateTransactionStatus($conexion, $withdrawalRequestId, 'approved');
            break;

        default:
            http_response_code(400); // Bad Request
            echo json_encode(array("error" => "Método de retiro no válido."));
            exit();
    }

    // Éxito
    http_response_code(200); // OK
    echo json_encode(array("message" => "La solicitud ha sido completada con éxito."));
} catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(array("error" => "Error al completar la solicitud de retiro.", "details" => $e->getMessage()));
}

// Cerrar la conexión después de usarla
$conexion = null;

function getWithdrawalMethod($conexion, $withdrawalRequestId)
{
    $query = "SELECT method FROM withdrawal_requests WHERE id = :id";
    $stmt = $conexion->prepare($query);
    $stmt->bindParam(':id', $withdrawalRequestId, PDO::PARAM_INT);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    return $result ? $result['method'] : null;
}

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

    foreach ($data as $column => &$value) {
        // Utiliza marcadores de posición nombrados
        $stmt->bindParam(":$column", $value, is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR);
    }

    $stmt->execute();
}

// Función para actualizar el estado en la tabla 'transactions'
function updateTransactionStatus($conexion, $withdrawalRequestId, $status)
{
    $query = "UPDATE transactions SET status = :status WHERE withdrawal_request_id = :withdrawal_request_id";
    $stmt = $conexion->prepare($query);
    $stmt->bindParam(':status', $status, PDO::PARAM_STR);
    $stmt->bindParam(':withdrawal_request_id', $withdrawalRequestId, PDO::PARAM_INT);
    $stmt->execute();
}

?>
