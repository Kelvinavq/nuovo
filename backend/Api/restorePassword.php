<?php
include '../Config/config.php';
include '../cors.php';

// Obtener conexión a la base de datos
$conexion = obtenerConexion();

// Verificar si la solicitud es de tipo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Método no permitido
    echo json_encode(array("error" => "Método no permitido."));
    exit();
}

// Obtener datos del formulario
$data = json_decode(file_get_contents("php://input"));
$token = htmlspecialchars(strip_tags($data->token));
// $newPassword = htmlspecialchars(strip_tags($data->newPassword));
$newPassword = htmlspecialchars(strip_tags($data->confirmPassword));

// Validar que el token sea válido
$validateTokenQuery = "SELECT user_id FROM password_reset_requests WHERE token = :token AND created_at > DATE_SUB(NOW(), INTERVAL 10 MINUTE)";
$stmt = $conexion->prepare($validateTokenQuery);
$stmt->bindParam(':token', $token);
$stmt->execute();

if ($stmt->rowCount() === 0) {
    // Token no válido o vencido
    http_response_code(403); // Forbidden
    echo json_encode(array("error" => "Token no válido o vencido."));
    exit();
}

// Obtener el ID de usuario asociado al token
$user_id = $stmt->fetch(PDO::FETCH_ASSOC)['user_id'];

// Actualizar la contraseña del usuario
$updatePasswordQuery = "UPDATE users SET password = :newPassword WHERE id = :user_id";
$updatePasswordStmt = $conexion->prepare($updatePasswordQuery);
$updatePasswordStmt->bindParam(':newPassword', password_hash($newPassword, PASSWORD_BCRYPT));
$updatePasswordStmt->bindParam(':user_id', $user_id);

if (!$updatePasswordStmt->execute()) {
    // Error al actualizar la contraseña
    http_response_code(500); // Internal Server Error
    echo json_encode(array("error" => "Error al actualizar la contraseña."));
    exit();
}

// Eliminar el token de la base de datos
$deleteTokenQuery = "DELETE FROM password_reset_requests WHERE token = :token";
$deleteTokenStmt = $conexion->prepare($deleteTokenQuery);
$deleteTokenStmt->bindParam(':token', $token);

$deleteTokenStmt->execute();

http_response_code(200);
echo json_encode(array("message" => "Contraseña restablecida con éxito."));

// Cerrar la conexión después de usarla
$conexion = null;
?>
