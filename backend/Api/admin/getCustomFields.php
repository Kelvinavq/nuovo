<?php
// Configuración de CORS
include '../../cors.php';
include '../../Config/config.php';

$conexion = obtenerConexion();
try {

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Obtener el platformId desde los parámetros de la URL
        $platformId = $_GET['platformId'];

        // Consulta para obtener los campos personalizados de una plataforma específica
        $sql = "SELECT fieldName, fieldValue FROM customfields WHERE platformId = :platformId";
        $stmt = $conexion->prepare($sql);
        $stmt->bindParam(':platformId', $platformId, PDO::PARAM_INT);
        $stmt->execute();
        
        $customFields = array();

        while ($fila = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $customField = array(
                'fieldName' => $fila['fieldName'],
                'fieldValue' => $fila['fieldValue']
            );

            $customFields[] = $customField;
        }

        // Devolver los campos personalizados en formato JSON
        echo json_encode(array('customFields' => $customFields));
    }
} catch (PDOException $e) {
    // Manejar excepciones de PDO (puedes personalizar esto según tus necesidades)
    echo json_encode(array('error' => 'Error en la conexión a la base de datos'));
}

// Cerrar la conexión
$conexion = null;
?>
