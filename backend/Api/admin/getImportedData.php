<?php
include '../../Config/config.php';
include '../../cors.php';

// Obtener conexión a la base de datos
$conexion = obtenerConexion();

try {
    // Obtener el fileId de la solicitud
    $fileId = isset($_GET['fileId']) ? $_GET['fileId'] : null;

    if (!$fileId) {
        http_response_code(400); // Bad Request
        echo json_encode(array("error" => "ID de archivo no proporcionado."));
        exit();
    }

    // Obtener información de las columnas y sus datos para el archivo específico
    $stmt = $conexion->prepare("SELECT column_name, column_data FROM csv_columns WHERE file_id = :fileId");
    $stmt->bindParam(':fileId', $fileId, PDO::PARAM_INT);
    $stmt->execute();

    $columns = array();
    $rows = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $columns[] = $row['column_name'];
        $rows[] = json_decode($row['column_data']);
    }

    // Enviar la información como respuesta JSON
    header('Content-Type: application/json');
    echo json_encode(array('columns' => $columns, 'rows' => $rows));

} catch (PDOException $e) {
    // Enviar una respuesta en caso de error
    http_response_code(500); // Internal Server Error
    echo json_encode(array("error" => "Error al obtener los datos importados", "details" => $e->getMessage()));
} finally {
    // Cerrar la conexión después de usarla
    $conexion = null;
}
?>
