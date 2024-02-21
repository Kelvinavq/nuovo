<?php
include '../Config/config.php';
include '../cors.php';

// Obtener conexión a la base de datos
$conexion = obtenerConexion();

// Verificar si la solicitud es de tipo POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener el ID de usuario de la sesión
    session_start();
    $userId = $_SESSION['user_id'];

    $deleteQuery = "UPDATE pusher_notifications SET visible = 'no' WHERE user_id = :userId";
    $stmtDelete = $conexion->prepare($deleteQuery);
    $stmtDelete->bindParam(':userId', $userId);

    if ($stmtDelete->execute()) {
        http_response_code(200);
        echo json_encode(array("message" => "Notificaciones eliminadas"));
    } else {
        http_response_code(500);
        echo json_encode(array("error" => "Error al eliminar las notificaciones como leídas"));
    }
}

// Cerrar la conexión después de usarla
$conexion = null;
?>
