<?php
include '../../Config/config.php';
include '../../cors.php';

$conexion = obtenerConexion();

// Verificar si la solicitud es de tipo GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(array("error" => "Método no permitido."));
    exit();
}

// Obtener el ID del usuario desde la consulta GET
$userId = isset($_GET['userId']) ? intval($_GET['userId']) : 0;

if ($userId === 0) {
    http_response_code(400); // Bad Request
    echo json_encode(array("error" => "ID de usuario inválido."));
    exit();
}

try {
    // Consulta SQL para obtener plataformas y campos personalizados del usuario
    $getPlatformsQuery = "
    SELECT
        p.platformName,
        p.email,
        GROUP_CONCAT(cf.fieldName) as fieldName,
        GROUP_CONCAT(cf.fieldValue) as fieldValue
    FROM platforms_user p
    LEFT JOIN customfields_user cf ON p.id = cf.platformId
    WHERE p.user_id = :userId
    GROUP BY p.id
";

$getPlatformsStmt = $conexion->prepare($getPlatformsQuery);
$getPlatformsStmt->bindParam(':userId', $userId, PDO::PARAM_INT);
$getPlatformsStmt->execute();

$platforms = $getPlatformsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Devolver las plataformas como JSON
    http_response_code(200);
    echo json_encode(array("platforms" => $platforms));
} catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(array("error" => "Error al obtener las plataformas del usuario", "details" => $e->getMessage()));
} finally {
    // Cerrar la conexión después de usarla
    $conexion = null;
}
?>
