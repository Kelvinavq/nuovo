<?php
include '../../Config/config.php';
include '../../cors.php';

// Obtener conexión a la base de datos
$conexion = obtenerConexion();

// Verificar si la solicitud es de tipo GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(array("error" => "Método no permitido."));
    exit();
}

// Consulta SQL para obtener la lista de bancos
$obtenerBancos = "SELECT id, account_name FROM banks";
$stmt = $conexion->prepare($obtenerBancos);
$stmt->execute();

// Manejar el caso en que no haya bancos
if ($stmt->rowCount() === 0) {
    http_response_code(404); // Not Found
    echo json_encode(array("error" => "No hay bancos registrados."));
    exit();
}

// Obtener todos los bancos
$bancos = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Devolver la lista de bancos en formato JSON
http_response_code(200);
echo json_encode($bancos);

// Cerrar la conexión después de usarla
$conexion = null;
?>
