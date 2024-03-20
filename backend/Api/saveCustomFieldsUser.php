<?php
include '../Config/config.php';
include '../cors.php';

// Obtener conexión a la base de datos
$conexion = obtenerConexion();

// Verificar si hay una sesión activa
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(array("error" => "No hay una sesión activa."));
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    $userId = $_SESSION['user_id'];
    $platformId = htmlspecialchars(strip_tags($data->platformId));
    $customFields = $data->customFields;
    $platformType = $data->platformType;
    $platformName = $data->platformName;

    try {
        $conexion->beginTransaction();

        // Insertar la nueva plataforma del usuario en la tabla platforms_user
        $insertPlatformUserQuery = "INSERT INTO platforms_user (user_id, platformType, platformName, status, type) VALUES (:userId, :platformType, :platformName, 'active', 'no')";
        $insertStmt = $conexion->prepare($insertPlatformUserQuery);
        $insertStmt->bindValue(':userId', $userId);
        $insertStmt->bindValue(':platformType', $platformType);
        $insertStmt->bindValue(':platformName', $platformName);

        if (!$insertStmt->execute()) {
            throw new PDOException("Error al insertar en la tabla 'platforms_user'");
        }

        // Obtener el ID de la nueva plataforma del usuario insertada
        $userPlatformId = $conexion->lastInsertId();

        // Insertar cada campo personalizado en la tabla customfields_user
        foreach ($customFields as $fieldName => $fieldValue) {
            $fieldName = htmlspecialchars(strip_tags($fieldName));
            $fieldValue = htmlspecialchars(strip_tags($fieldValue));

            $insertCustomFieldQuery = "INSERT INTO customfields_user (platformId, fieldName, fieldValue) VALUES (:platformId, :fieldName, :fieldValue)";
            $insertStmt = $conexion->prepare($insertCustomFieldQuery);
            $insertStmt->bindValue(':platformId', $userPlatformId);
            $insertStmt->bindValue(':fieldName', $fieldName);
            $insertStmt->bindValue(':fieldValue', $fieldValue);

            if (!$insertStmt->execute()) {
                throw new PDOException("Error al insertar en la tabla 'customfields_user'");
            }
        }

        $conexion->commit();

        http_response_code(201);
        echo json_encode(array("message" => "Campos personalizados guardados con éxito."));
    } catch (PDOException $e) {
        $conexion->rollBack();
        http_response_code(500);
        echo json_encode(array("error" => "Error en la base de datos.", "details" => $e->getMessage()));
    }
}

$conexion = null;
?>
