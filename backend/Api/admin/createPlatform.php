<?php
// Configuración de CORS
include '../../cors.php';
include '../../Config/config.php';

$conexion = obtenerConexion();

// Verificar si la solicitud es de tipo POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    $platformType = htmlspecialchars(strip_tags($data->platformType));
    $customField = htmlspecialchars(strip_tags($data->customField));
    $value = htmlspecialchars(strip_tags($data->customField));
    $platformName = isset($data->platformName) ? htmlspecialchars(strip_tags($data->platformName)) : null;


    try {
        // Insertar la nueva plataforma en la tabla Platforms


        // Verificar si la plataforma seleccionada es "Otra"
        if ($platformType === "Otra") {

            $insertPlatformQuery = "INSERT INTO platforms (platformType, platformName, customField, value) VALUES (:platformType, :platformName, :customField, :value)";

            $insertStmt = $conexion->prepare($insertPlatformQuery);
            $insertStmt->bindValue(':platformType', $platformType);
            $insertStmt->bindValue(':platformName', $platformName);
            $insertStmt->bindValue(':customField', $platformName);
            $insertStmt->bindValue(':value', $value);

        } else {

            $insertPlatformQuery = "INSERT INTO platforms (platformType, platformName, value) VALUES (:platformType, :platformType, :customField)";
            $insertStmt = $conexion->prepare($insertPlatformQuery);
            $insertStmt->bindValue(':platformType', $platformType);
            $insertStmt->bindValue(':customField', $value);
        }

        if ($insertStmt->execute()) {
            http_response_code(201);
            echo json_encode(array("message" => "Nueva plataforma agregada con éxito." . $customField));
        } else {
            http_response_code(500);
            echo json_encode(array("error" => "Error al agregar la nueva plataforma."));
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("error" => "Error en la base de datos.", "details" => $e->getMessage()));
    }
}

// Cerrar la conexión a la base de datos
$conexion = null;
