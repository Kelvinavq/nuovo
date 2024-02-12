<?php
include '../cors.php';
include '../Config/config.php';


$conexion = obtenerConexion();



if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    $platformType = htmlspecialchars(strip_tags($data->platformType));
    $customFields = isset($data->customFields) ? $data->customFields : [];
    if ($platformType != "otra") {
        $value = htmlspecialchars(strip_tags($data->value));
    }
    
    $platformName = isset($data->platformName) ? htmlspecialchars(strip_tags($data->platformName)) : null;
    $customPlatformName = isset($data->customPlatformName) ? htmlspecialchars(strip_tags($data->customPlatformName)) : null;
    $userId = htmlspecialchars(strip_tags($data->userid));

    try {
        $conexion->beginTransaction();

        // Insertar la nueva plataforma en la tabla platforms_user
        $insertPlatformQuery = "INSERT INTO platforms_user (user_id, platformType, platformName, email, type) VALUES (:user_id, :platformType, :platformName, :value, :is_personalizable)";
        $insertStmt = $conexion->prepare($insertPlatformQuery);
        $insertStmt->bindValue(':user_id', $userId);
        $insertStmt->bindValue(':platformType', $platformType);
        $insertStmt->bindValue(':platformName', $platformType === "otra" ? $customPlatformName : $platformName);
        $insertStmt->bindValue(':is_personalizable', $platformType === "otra" ? "yes" : "no");

        $insertStmt->bindValue(':value', $platformType === "otra" ? null : $value);

        if (!$insertStmt->execute()) {
            throw new PDOException("Error al insertar en la tabla 'platforms_user'");
        }

        // Obtener el ID de la nueva plataforma insertada
        $platformId = $conexion->lastInsertId();

        // Insertar campos personalizados en la tabla customFields_user si es "Otra"
        if ($platformType === "otra") {
            foreach ($customFields as $field) {
                $fieldName = htmlspecialchars(strip_tags($field->name));
                $fieldValue = htmlspecialchars(strip_tags($field->value));
                $insertCustomFieldQuery = "INSERT INTO customfields_user (platformId, fieldName, fieldValue) VALUES (:platformId, :fieldName, :fieldValue)";
                $insertCustomFieldStmt = $conexion->prepare($insertCustomFieldQuery);
                $insertCustomFieldStmt->bindValue(':platformId', $platformId);
                $insertCustomFieldStmt->bindValue(':fieldName', $fieldName);
                $insertCustomFieldStmt->bindValue(':fieldValue', $fieldValue);

                if (!$insertCustomFieldStmt->execute()) {
                    throw new PDOException("Error al insertar en la tabla 'customFields_user'");
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
