<?php
include '../../cors.php';
include '../../Config/config.php';

$conexion = obtenerConexion();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    $platformType = htmlspecialchars(strip_tags($data->platformType));
    $customFields = isset($data->customFields) ? $data->customFields : [];
    if ($platformType != "otra") {
        # code...
        $value = htmlspecialchars(strip_tags($data->value));
    }
    $commission = isset($data->comision) ? floatval($data->comision) : 0.0;
    $platformName = isset($data->platformName) ? htmlspecialchars(strip_tags($data->platformName)) : null;
    $customPlatformName = isset($data->customPlatformName) ? htmlspecialchars(strip_tags($data->customPlatformName)) : null;

    try {
        $conexion->beginTransaction();

        // Insertar la nueva plataforma en la tabla Platforms
        $insertPlatformQuery = "INSERT INTO platforms (platformType, platformName, email, comision) VALUES (:platformType, :platformName, :value, :comision)";
        $insertStmt = $conexion->prepare($insertPlatformQuery);
        $insertStmt->bindValue(':platformType', $platformType);
        $insertStmt->bindValue(':platformName', $platformType === "otra" ? $customPlatformName : $platformName);
        $insertStmt->bindValue(':value', $platformType === "otra" ? null : $value);
        $insertStmt->bindValue(':comision', $commission);


        if (!$insertStmt->execute()) {
            throw new PDOException("Error al insertar en la tabla 'platforms'");
        }

        // Obtener el ID de la nueva plataforma insertada
        $platformId = $conexion->lastInsertId();

        // Insertar campos personalizados en la tabla customFields si es "Otra"
        if ($platformType === "otra") {
            foreach ($customFields as $field) {
                $fieldName = htmlspecialchars(strip_tags($field->name));
                $fieldValue = htmlspecialchars(strip_tags($field->value));
                $insertCustomFieldQuery = "INSERT INTO customFields (platformId, fieldName, fieldValue) VALUES (:platformId, :fieldName, :fieldValue)";
                $insertCustomFieldStmt = $conexion->prepare($insertCustomFieldQuery);
                $insertCustomFieldStmt->bindValue(':platformId', $platformId);
                $insertCustomFieldStmt->bindValue(':fieldName', $fieldName);
                $insertCustomFieldStmt->bindValue(':fieldValue', $fieldValue);

                if (!$insertCustomFieldStmt->execute()) {
                    throw new PDOException("Error al insertar en la tabla 'customFields'");
                }
            }
        }

        $conexion->commit();

        http_response_code(201);
        echo json_encode(array("message" => "Nueva plataforma agregada con éxito."));
    } catch (PDOException $e) {
        $conexion->rollBack();
        http_response_code(500);
        echo json_encode(array("error" => "Error en la base de datos.", "details" => $e->getMessage()));
    }
}

$conexion = null;
