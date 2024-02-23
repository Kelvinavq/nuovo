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

// Verificar si la solicitud es de tipo GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(array("error" => "Método no permitido."));
    exit();
}



// Consulta SQL para obtener usuarios con filtros
$obtenerUsuarios = "SELECT DISTINCT u.id, u.name, u.email, u.phoneNumber, u.address, DATE_FORMAT(u.registrationDate, '%m-%d-%Y') AS formatted_registrationDate, uv.status, b.balance
                   FROM users u
                   LEFT JOIN user_verification uv ON u.id = uv.user_id
                   LEFT JOIN user_balances b ON u.id = b.user_id
                   WHERE u.role = 'user'";
                   
// Preparar la consulta SQL
$stmt = $conexion->prepare($obtenerUsuarios);
// Ejecutar la consulta SQL
$stmt->execute();

// Manejar el caso en que no haya usuarios
if ($stmt->rowCount() === 0) {
    http_response_code(404); // Not Found
    echo json_encode(array("error" => "No hay usuarios registrados."));
    exit();
}

// Obtener todos los usuarios
$usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Devolver la lista de usuarios en formato JSON
http_response_code(200);
echo json_encode($usuarios);

// Cerrar la conexión después de usarla
$conexion = null;
