<?php
include '../Config/config.php';
include '../cors.php';

// Obtener conexión a la base de datos
$conexion = obtenerConexion();

// Verificar si hay una sesión activa
session_start();
$input = json_decode(file_get_contents("php://input"), true);

if (isset($_SESSION['user_id']) && $_SERVER['REQUEST_METHOD'] === 'POST' && $_SESSION['user_role'] == "user") {

    try {

        $newLanguage = isset($input['language']) ? $input['language'] : "es";

        $updateLanguageQuery = "UPDATE users SET language = :language WHERE id = :user_id";
        $stmtUpdateLanguage = $conexion->prepare($updateLanguageQuery);
        $stmtUpdateLanguage->bindValue(':language', $newLanguage);
        $stmtUpdateLanguage->bindValue(':user_id', $_SESSION['user_id']);
        $stmtUpdateLanguage->execute();

        http_response_code(200);
        echo json_encode(array("message" => "Idioma actualizado en el backend."));
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(array("error" => "Error interno del servidor al actualizar el idioma."));
    }
}
