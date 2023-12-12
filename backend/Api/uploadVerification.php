<?php
include '../Config/config.php';
include '../cors.php';
$conexion = obtenerConexion();


// Verificar si la solicitud es de tipo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(array("error" => "Método no permitido."));
    exit();
}

// Verificar si el usuario ha iniciado sesión
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(array("error" => "Usuario no autenticado."));
    exit();
}

// Obtener el ID del usuario
$userId = $_SESSION['user_id'];

// Verificar si se han enviado ambas imágenes
if (!isset($_FILES['dniFront']) || !isset($_FILES['dniSelfie'])) {
    http_response_code(400); // Bad Request
    echo json_encode(array("error" => "Debe seleccionar ambas imágenes."));
    exit();
}

// Rutas para guardar las imágenes
$dniFrontPath = '../../src/assets/user_selfie/';
$dniSelfiePath = '../../src/assets/user_dni/';

// Nombres de archivo
$dniFrontFilename = 'dni_selfie_' . $userId . '.' . pathinfo($_FILES['dniFront']['name'], PATHINFO_EXTENSION);
$dniSelfieFilename = 'dni_front_' . $userId . '.' . pathinfo($_FILES['dniSelfie']['name'], PATHINFO_EXTENSION);


// Mover y guardar las imágenes
if (
    move_uploaded_file($_FILES['dniFront']['tmp_name'], $dniFrontPath . $dniFrontFilename) &&
    move_uploaded_file($_FILES['dniSelfie']['tmp_name'], $dniSelfiePath . $dniSelfieFilename)
) {
    // Las imágenes se han guardado correctamente

    // Insertar nombres de archivo en la base de datos
    $conexion = obtenerConexion();

    $insertImages = "INSERT INTO user_verification (user_id, dni_image, selfie_with_dni_image) VALUES (:userId, :dniFront, :dniSelfie)";
    $stmtInsert = $conexion->prepare($insertImages);
    $stmtInsert->bindParam(':userId', $userId);
    $stmtInsert->bindParam(':dniFront', $dniFrontFilename);
    $stmtInsert->bindParam(':dniSelfie', $dniSelfieFilename);

    if ($stmtInsert->execute()) {
        // Inserción en la base de datos exitosa
        http_response_code(200);
        echo json_encode(array("message" => "Imágenes subidas y registradas correctamente."));
    } else {
        // Error al insertar en la base de datos
        http_response_code(500); // Internal Server Error
        echo json_encode(array("error" => "Error al insertar en la base de datos."));
    }

    // Cerrar la conexión después de usarla
    $conexion = null;
} else {
    // Error al mover las imágenes
    http_response_code(500); // Internal Server Error
    echo json_encode(array("error" => "Error al subir las imágenes."));
}
