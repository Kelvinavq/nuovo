<?php
include("../../cors.php"); 

// Ruta al directorio donde se almacenan los archivos CSV
$csvDirectory = '../../../src/assets/csv/';

// Obtener el nombre del archivo de la solicitud
$fileName = isset($_GET['fileName']) ? $_GET['fileName'] : null;

if ($fileName) {
    // Construir la ruta completa del archivo CSV
    $filePath = $csvDirectory . $fileName;

    // Verificar si el archivo existe
    if (file_exists($filePath)) {
        // Configurar las cabeceras para la descarga
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . basename($filePath) . '"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($filePath));

        // Leer el archivo y enviarlo al cliente
        readfile($filePath);
        exit;
    } else {
        http_response_code(404); // Not Found
        echo json_encode(array("error" => "Archivo no encontrado."));
        exit();
    }
} else {
    http_response_code(400); // Bad Request
    echo json_encode(array("error" => "Nombre de archivo no proporcionado."));
    exit();
}
?>
