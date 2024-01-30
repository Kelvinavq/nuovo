<?php
include '../../Config/config.php';
include '../../cors.php';

// Obtener conexión a la base de datos
$conexion = obtenerConexion();

// Verificar si la solicitud es de tipo POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener el ID de usuario de la sesión
    session_start();
    $userId = $_SESSION['user_id'];

    // Actualizar el estado de las notificaciones a "read"
    $markAsReadQuery = "UPDATE pusher_notifications SET status_admin = 'read' WHERE status_admin = 'unread'";
    $stmtMarkAsRead = $conexion->prepare($markAsReadQuery);

    if ($stmtMarkAsRead->execute()) {
        http_response_code(200);
        echo json_encode(array("message" => "Notificaciones marcadas como leídas"));
    } else {
        http_response_code(500);
        echo json_encode(array("error" => "Error al marcar las notificaciones como leídas"));
    }
}

// Cerrar la conexión después de usarla
$conexion = null;
?>
