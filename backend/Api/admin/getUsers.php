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

// Añadir condiciones para los filtros
$estatusFilter = $_GET['estatus'] ?? 'all';
$bankFilter = $_GET['bank'] ?? 'all';
$searchTerm = $_GET['search'] ?? '';

// Consulta SQL para obtener usuarios con filtros
$obtenerUsuarios = "SELECT DISTINCT u.name, u.email, u.phoneNumber, u.address, DATE_FORMAT(u.registrationDate, '%m-%d-%Y') AS formatted_registrationDate, uv.status, uv.bank_account, b.routing_number_ach, b.routing_number_wire, b.bank_address, b.account_name
                   FROM users u
                   LEFT JOIN user_verification uv ON u.id = uv.user_id
                   LEFT JOIN bank_account ba ON u.id = ba.user_id
                   LEFT JOIN banks b ON ba.bank_id = b.id
                   LEFT JOIN platforms_user pu ON u.id = pu.user_id
                   WHERE u.role = 'user'";

if ($estatusFilter !== 'all') {
    $obtenerUsuarios .= " AND uv.status = :estatusFilter";
}

if ($bankFilter !== 'all') {
    $obtenerUsuarios .= " AND b.id = :bankFilter";
}

if ($searchTerm !== '') {
    $obtenerUsuarios .= " AND (u.name LIKE :searchTerm OR u.email LIKE :searchTerm OR uv.bank_account LIKE :searchTerm OR b.routing_number_ach LIKE :searchTerm OR pu.email LIKE :searchTerm)";
}

$obtenerUsuarios .= " ORDER BY formatted_registrationDate";

// Preparar la consulta SQL
$stmt = $conexion->prepare($obtenerUsuarios);

// Bindear parámetros para filtros
if ($estatusFilter !== 'all') {
    $stmt->bindParam(':estatusFilter', $estatusFilter);
}

if ($bankFilter !== 'all') {
    $stmt->bindParam(':bankFilter', $bankFilter);
}

if ($searchTerm !== '') {
    $searchTerm = "%{$searchTerm}%"; // Añadir comodines para la búsqueda
    $stmt->bindParam(':searchTerm', $searchTerm);
}

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
?>
