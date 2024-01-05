<?php
// Configuración de CORS
include '../../cors.php';
include '../../Config/config.php';

$conexion = obtenerConexion();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $selectPlatformsQuery = "SELECT * FROM platforms";
        $selectPlatformsStmt = $conexion->prepare($selectPlatformsQuery);
        $selectPlatformsStmt->execute();

        $platforms = $selectPlatformsStmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($platforms);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("error" => "Error en la base de datos.", "details" => $e->getMessage()));
    }
}
