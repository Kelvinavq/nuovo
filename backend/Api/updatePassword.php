<?php
include '../Config/config.php';
include '../cors.php';

session_start();

// Obtener conexión a la base de datos
$conexion = obtenerConexion();

// Verificar si la solicitud es de tipo POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener datos del cuerpo de la solicitud
    $data = json_decode(file_get_contents("php://input"));

    // Validar y escapar los datos para prevenir SQL injection
    $userId = $_SESSION['user_id'];
    $currentPassword = htmlspecialchars(strip_tags($data->currentPassword));
    $newPassword = htmlspecialchars(strip_tags($data->newPassword));

    // Verificar la contraseña actual antes de proceder
    $checkPasswordQuery = "SELECT password FROM users WHERE id = :userId";
    $stmtCheckPassword = $conexion->prepare($checkPasswordQuery);
    $stmtCheckPassword->bindParam(':userId', $userId);
    $stmtCheckPassword->execute();

    if ($stmtCheckPassword->rowCount() > 0) {
        $user = $stmtCheckPassword->fetch(PDO::FETCH_ASSOC);
        $hashedPassword = $user['password'];

        if (password_verify($currentPassword, $hashedPassword)) {
            // La contraseña actual es correcta, proceder con la actualización
            $hashedNewPassword = password_hash($newPassword, PASSWORD_DEFAULT);

            $updatePasswordQuery = "UPDATE users SET password = :newPassword WHERE id = :userId";
            $stmtUpdatePassword = $conexion->prepare($updatePasswordQuery);
            $stmtUpdatePassword->bindParam(':newPassword', $hashedNewPassword);
            $stmtUpdatePassword->bindParam(':userId', $userId);

            if ($stmtUpdatePassword->execute()) {
                http_response_code(200);
                echo json_encode(array("message" => "Contraseña actualizada con éxito"));
            } else {
                http_response_code(500);
                echo json_encode(array("error" => "Error al actualizar la contraseña"));
            }
        } else {
            // La contraseña actual no es correcta
            http_response_code(401); // Unauthorized
            echo json_encode(array("error" => "Contraseña actual incorrecta"));
        }
    } else {
        // Usuario no encontrado
        http_response_code(404); // Not Found
        echo json_encode(array("error" => "Usuario no encontrado"));
    }
}

// Cerrar la conexión después de usarla
$conexion = null;
?>
