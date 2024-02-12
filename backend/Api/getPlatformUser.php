<?php
// Configuración de CORS
include '../cors.php';
include '../Config/config.php';

$conexion = obtenerConexion();

try {

        $userId = isset($_GET['userId']) ? $_GET['userId'] : null;

        $query = "SELECT * FROM platforms_user WHERE user_id = :user_id AND status = 'active'";
        $stmt = $conexion->prepare($query);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();

        $platformsUser = $stmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200); 
        echo json_encode($platformsUser);

} catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(array("error" => "Error al obtener la lista de plataformas del usuario.", "details" => $e->getMessage()));
}

// Cerrar la conexión
$conexion = null;
