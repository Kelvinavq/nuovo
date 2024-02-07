<?php
include '../../Config/config.php';
include '../../cors.php';

// Obtener conexión a la base de datos
$conexion = obtenerConexion();

try {
    // Obtener la lista de archivos desde la base de datos
    $stmt = $conexion->query("SELECT id, filename, uploaded_at FROM csv_files");
    $fileList = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Formatear la fecha en m-d-Y
    foreach ($fileList as &$file) {
        $file['uploaded_at'] = date('m-d-Y', strtotime($file['uploaded_at']));
    }

    // Enviar la lista como respuesta JSON
    header('Content-Type: application/json');
    echo json_encode(array('files' => $fileList));

    
} catch (PDOException $e) {
    // Enviar una respuesta en caso de error
    http_response_code(500); // Internal Server Error
    echo json_encode(array("error" => "Error al obtener la lista de archivos", "details" => $e->getMessage()));
} finally {
    // Cerrar la conexión después de usarla
    $conexion = null;
}
?>
