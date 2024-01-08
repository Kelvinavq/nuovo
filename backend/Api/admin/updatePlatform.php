<?php
// Configuración de CORS
include '../../cors.php';
include '../../Config/config.php';

$conexion = obtenerConexion();

// Verificar si la solicitud es de tipo PUT
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    $platformId = htmlspecialchars(strip_tags($data->platformId));

    // Verificar si la plataforma seleccionada es "Otra"
    if (isset($data->platformName) && isset($data->value)) {
        $platformName = htmlspecialchars(strip_tags($data->platformName));
        $value = htmlspecialchars(strip_tags($data->value));

        try {
            $updatePlatformQuery = "UPDATE platforms SET platformName = :platformName, value = :value WHERE id = :platformId";
            $updateStmt = $conexion->prepare($updatePlatformQuery);
            $updateStmt->bindValue(':platformId', $platformId);
            $updateStmt->bindValue(':platformName', $platformName);
            $updateStmt->bindValue(':value', $value);

            if ($updateStmt->execute()) {
                http_response_code(200);
                echo json_encode(array("message" => "Plataforma actualizada con éxito."));
            } else {
                http_response_code(500);
                echo json_encode(array("error" => "Error al actualizar la plataforma."));
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(array("error" => "Error en la base de datos.", "details" => $e->getMessage()));
        }
    } elseif (isset($data->newCustomField)) {
        $newCustomField = htmlspecialchars(strip_tags($data->newCustomField));

        try {
            $updatePlatformQuery = "UPDATE platforms SET value = :newCustomField WHERE id = :platformId";
            $updateStmt = $conexion->prepare($updatePlatformQuery);
            $updateStmt->bindValue(':platformId', $platformId);
            $updateStmt->bindValue(':newCustomField', $newCustomField);

            if ($updateStmt->execute()) {
                http_response_code(200);
                echo json_encode(array("message" => "Plataforma actualizada con éxito."));
            } else {
                http_response_code(500);
                echo json_encode(array("error" => "Error al actualizar la plataforma."));
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(array("error" => "Error en la base de datos.", "details" => $e->getMessage()));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("error" => "Parámetros de actualización incorrectos."));
    }
}

// Cierra la conexión a la base de datos
$conexion = null;
?>
