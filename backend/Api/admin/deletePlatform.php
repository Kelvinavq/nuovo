<?php
// Configuración de CORS
include '../../cors.php';
include '../../Config/config.php';

$conexion = obtenerConexion();

// Verificar si la solicitud es de tipo POST
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Obtener el ID de la plataforma a eliminar desde los parámetros de la URL
    $platformId = isset($_GET['id']) ? $_GET['id'] : null;

    if (!$platformId) {
        http_response_code(400);
        echo json_encode(array("error" => "ID de plataforma no proporcionado."));
        exit;
    }

    try {
        // Consulta para eliminar la plataforma por su ID
        $deletePlatformQuery = "DELETE FROM platforms WHERE id = :id";
        $deleteStmt = $conexion->prepare($deletePlatformQuery);
        $deleteStmt->bindParam(':id', $platformId);

        if ($deleteStmt->execute()) {
            http_response_code(200);
            echo json_encode(array("message" => "Plataforma eliminada con éxito."));
        } else {
            http_response_code(500);
            echo json_encode(array("error" => "Error al eliminar la plataforma."));
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("error" => "Error en la base de datos.", "details" => $e->getMessage()));
    }
}

// Cerrar la conexión a la base de datos
$conexion = null;
?>
