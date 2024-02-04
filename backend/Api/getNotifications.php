<?php
include '../Config/config.php';
include '../cors.php';

// Obtener conexión a la base de datos
$conexion = obtenerConexion();


// Verificar si hay una sesión activa
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(array("error" => "No hay una sesión activa."));
    exit();
}

$userId = $_SESSION['user_id'];

// Verificar si la solicitud es de tipo GET
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Obtener el ID de usuario de la sesión
    $userId = $_SESSION['user_id'];

    // Consulta para obtener las notificaciones del usuario
    $getNotificationsQuery = "SELECT * FROM pusher_notifications WHERE user_id = :userId ORDER BY created_at DESC";
    $stmtGetNotifications = $conexion->prepare($getNotificationsQuery);
    $stmtGetNotifications->bindParam(':userId', $userId);
    $stmtGetNotifications->execute();

    // Obtener todas las notificaciones
    $notifications = ($stmtGetNotifications->rowCount() > 0)
        ? $stmtGetNotifications->fetchAll(PDO::FETCH_ASSOC)
        : array();

         // Formatear la fecha y hora en cada notificación
    foreach ($notifications as &$notification) {
        $notification['created_at'] = date('m-d-Y H:i:s', strtotime($notification['created_at']));
    }

    // Devolver las notificaciones como respuesta JSON
    header('Content-Type: application/json');
    echo json_encode($notifications);
}

// Cerrar la conexión después de usarla
$conexion = null;