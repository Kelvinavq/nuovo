<?php
include '../../Config/config.php';
include '../../cors.php';

// Obtener conexión a la base de datos
$conexion = obtenerConexion();

// Verificar si la solicitud es de tipo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(array("error" => "Método no permitido."));
    exit();
}


// Verificar si se recibieron las columnas y el nombre del archivo
if (isset($_FILES['file']) && isset($_POST['columns']) && isset($_POST['fileName'])) {


    try {

        $columns = $_POST['columns'];
        $selectedColumns = json_decode($columns, true);

      
        $csvFile = isset($_FILES['file']) ? $_FILES['file'] : null;
        $csvName = $csvFile ? uniqid('file') . '_' . $csvFile['name'] : null;
        $csvPath = $csvFile ? "../../../src/assets/csv/" . $csvName : null;

        $fileName = $_POST['fileName'];

        move_uploaded_file($csvFile['tmp_name'], $csvPath);


        // Obtener una conexión a la base de datos
        $conexion = obtenerConexion();

        // Insertar en la tabla 'csv_files'
        $stmtFile = $conexion->prepare("INSERT INTO csv_files (filename) VALUES (:fileName)");
        $stmtFile->bindParam(':fileName', $csvName, PDO::PARAM_STR);
        $stmtFile->execute();

        // Obtener el ID del archivo recién insertado
        $fileId = $conexion->lastInsertId();

        // Insertar en la tabla 'csv_columns'
        $stmtColumn = $conexion->prepare("INSERT INTO csv_columns (file_id, column_name, column_data) VALUES (:fileId, :columnName, :columnData)");

        foreach ($selectedColumns as $column) {
            $columnName = $column['name'];
            $columnData = json_encode($column['data']);

            $stmtColumn->bindParam(':fileId', $fileId, PDO::PARAM_INT);
            $stmtColumn->bindParam(':columnName', $columnName, PDO::PARAM_STR);
            $stmtColumn->bindParam(':columnData', $columnData, PDO::PARAM_STR);
            $stmtColumn->execute();
        }

        // Enviar una respuesta de éxito
        http_response_code(200); // OK
        echo json_encode(array("success" => true));
    } catch (PDOException $e) {
        // Enviar una respuesta en caso de error
        http_response_code(500); // Internal Server Error
        echo json_encode(array("error" => "Error al guardar en la base de datos", "details" => $e->getMessage()));
    } finally {
        // Cerrar la conexión después de usarla
        $conexion = null;
    }
} else {
    // Enviar una respuesta en caso de datos incorrectos
    http_response_code(400); // Bad Request
    echo json_encode(array("error" => "Datos incorrectos en la solicitud"));
}
