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
$email = htmlspecialchars(strip_tags($data->email));

// Verificar si el correo electrónico existe en la base de datos
$query = "SELECT * FROM users WHERE email = :email";
$stmt = $conexion->prepare($query);
$stmt->bindParam(':email', $email);
$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    http_response_code(404); // No encontrado
    echo json_encode(array("error" => "El correo electrónico no está registrado."));
    exit();
}

// Generar token único
$token = bin2hex(random_bytes(32));

// Crear una solicitud de restablecimiento de contraseña
$insertQuery = "INSERT INTO password_reset_requests (user_id, token) VALUES (:user_id, :token)";
$insertStmt = $conexion->prepare($insertQuery);
$insertStmt->bindParam(':user_id', $user['id']);
$insertStmt->bindParam(':token', $token);

if (!$insertStmt->execute()) {
    http_response_code(500);
    echo json_encode(array("error" => "Error al crear la solicitud de restablecimiento de contraseña."));
    exit();
}

include("../emailConfig.php");

// Enviar notificación por correo electrónico
$to = $user['email'];
$subject = 'Restablecimiento de Contraseña - NUOVO';
$message = 'Para restablecer su contraseña, haga clic en el siguiente enlace: ' . 
           'http://localhost:5173/reset-password-page?token=' . $token;

$headers = 'From: ' . $adminEmail . "\r\n" .
           'Reply-To: ' . $adminEmail . "\r\n" .
           'X-Mailer: PHP/' . phpversion();

if (mail($to, $subject, $message, $headers)) {
    http_response_code(200);
    echo json_encode(array("message" => "Se ha enviado un enlace de restablecimiento de contraseña a su correo electrónico."));
} else {
    http_response_code(500);
    echo json_encode(array("error" => "Error al enviar correo electrónico"));
}

// Cerrar la conexión después de usarla
$conexion = null;
?>
