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
    $email = htmlspecialchars(strip_tags($data->email));
    $platformType = htmlspecialchars(strip_tags($data->platformType));
    $platformName = htmlspecialchars(strip_tags($data->platformName));

    try {
        $conexion->beginTransaction();

        // Insertar la nueva plataforma del usuario en la tabla platforms_user
        $insertPlatformUserQuery = "INSERT INTO platforms_user (user_id, platformType, platformName, email, status, type) VALUES (:userId, :platformType, :platformName, :email, 'active', 'no')";
        $insertStmt = $conexion->prepare($insertPlatformUserQuery);
        $insertStmt->bindValue(':userId', $userId);
        $insertStmt->bindValue(':platformType', $platformType);
        $insertStmt->bindValue(':platformName', $platformName);
        $insertStmt->bindValue(':email', $email);

        if (!$insertStmt->execute()) {
            throw new PDOException("Error al insertar en la tabla 'platforms_user'");
        }

        $conexion->commit();

        http_response_code(201);
        echo json_encode(array("message" => "Nueva plataforma de usuario agregada con éxito."));
    } catch (PDOException $e) {
        $conexion->rollBack();
        http_response_code(500);
        echo json_encode(array("error" => "Error en la base de datos.", "details" => $e->getMessage()));
    }
}

$conexion = null;
?>
