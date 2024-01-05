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

// Verificar si se han enviado todas las imágenes
if (!isset($_FILES['dniFront']) || !isset($_FILES['dniSelfie']) || !isset($_FILES['dniBack'])) {
    http_response_code(400); // Bad Request
    echo json_encode(array("error" => "Debe seleccionar las tres imágenes."));
    exit();
}

// Rutas para guardar las imágenes
$dniFrontPath = '../../src/assets/user_selfie/';
$dniBackPath = '../../src/assets/user_dni_back/';
$dniSelfiePath = '../../src/assets/user_dni/';

// Nombres de archivo
$dniFrontFilename = 'dni_selfie_' . $userId . '.' . pathinfo($_FILES['dniFront']['name'], PATHINFO_EXTENSION);
$dniBackFilename = 'dni_back_' . $userId . '.' . pathinfo($_FILES['dniBack']['name'], PATHINFO_EXTENSION);
$dniSelfieFilename = 'dni_front_' . $userId . '.' . pathinfo($_FILES['dniSelfie']['name'], PATHINFO_EXTENSION);


// Verificar si ya existe una solicitud de verificación para el usuario *
$checkExistingVerification = "SELECT id, dni_image, selfie_with_dni_image, dni_back FROM user_verification WHERE user_id = :userId";
$stmtCheck = $conexion->prepare($checkExistingVerification);
$stmtCheck->bindParam(':userId', $userId);
$stmtCheck->execute();


if ($stmtCheck->rowCount() > 0) {
    // Ya existe una solicitud, entonces actualizamos la existente
    $data = $stmtCheck->fetch(PDO::FETCH_ASSOC);

    // Eliminar las fotos antiguas (asegúrate de manejar la eliminación de archivos correctamente)
    unlink($dniFrontPath . $data['selfie_with_dni_image']);
    unlink($dniBackPath . $data['dni_back']);
    unlink($dniSelfiePath . $data['dni_image']);

    // Mover y guardar las nuevas imágenes
    if (
        move_uploaded_file($_FILES['dniFront']['tmp_name'], $dniFrontPath . $dniFrontFilename) &&
        move_uploaded_file($_FILES['dniSelfie']['tmp_name'], $dniSelfiePath . $dniSelfieFilename) &&
        move_uploaded_file($_FILES['dniBack']['tmp_name'], $dniBackPath . $dniBackFilename)
    ) {
        // Actualizar la solicitud existente con las nuevas imágenes
        $updateVerification = "UPDATE user_verification SET status = 'pending', dni_image = :dniFront, selfie_with_dni_image = :dniSelfie, dni_back = :dniBack WHERE user_id = :userId";
        $stmtUpdate = $conexion->prepare($updateVerification);
        $stmtUpdate->bindParam(':userId', $userId);
        $stmtUpdate->bindParam(':dniFront', $dniSelfieFilename);
        $stmtUpdate->bindParam(':dniBack', $dniBackFilename);
        $stmtUpdate->bindParam(':dniSelfie', $dniFrontFilename);

        if ($stmtUpdate->execute()) {
            // Agregar notificación
            $notificationMessage = "Tu solicitud de verificación ha sido recibida. Está pendiente de revisión.";
            $addNotification = "INSERT INTO notifications (user_id, content, is_read) VALUES (:userId, :message, 0)";
            $stmtNotification = $conexion->prepare($addNotification);
            $stmtNotification->bindParam(':userId', $userId);
            $stmtNotification->bindParam(':message', $notificationMessage);
            $stmtNotification->execute();

            http_response_code(200);
            echo json_encode(array("message" => "Solicitud existente actualizada correctamente."));
        } else {
            http_response_code(500); // Internal Server Error
            echo json_encode(array("error" => "Error al actualizar la solicitud existente."));
        }
    } else {
        // Error al mover las nuevas imágenes
        http_response_code(500); // Internal Server Error
        echo json_encode(array("error" => "Error al subir las nuevas imágenes."));
    }
} else {
    // No existe una solicitud, insertamos una nueva 

    if (
        move_uploaded_file($_FILES['dniFront']['tmp_name'], $dniFrontPath . $dniFrontFilename) &&
        move_uploaded_file($_FILES['dniSelfie']['tmp_name'], $dniSelfiePath . $dniSelfieFilename) &&
        move_uploaded_file($_FILES['dniBack']['tmp_name'], $dniBackPath . $dniBackFilename)
    ) {
        $insertImages = "INSERT INTO user_verification (user_id, dni_image, selfie_with_dni_image, dni_back) VALUES (:userId, :dniFront, :dniSelfie, :dniBack)";
        $stmtInsert = $conexion->prepare($insertImages);
        $stmtInsert->bindParam(':userId', $userId);
        $stmtInsert->bindParam(':dniFront', $dniSelfieFilename);
        $stmtInsert->bindParam(':dniBack', $dniBackFilename);
        $stmtInsert->bindParam(':dniSelfie', $dniFrontFilename);

        if ($stmtInsert->execute()) {
            // Inserción en la base de datos exitosa

            // Agregar notificación
            $notificationMessage = "Tu solicitud de verificación ha sido recibida. Está pendiente de revisión.";
            $addNotification = "INSERT INTO notifications (user_id, content, is_read) VALUES (:userId, :message, 0)";
            $stmtNotification = $conexion->prepare($addNotification);
            $stmtNotification->bindParam(':userId', $userId);
            $stmtNotification->bindParam(':message', $notificationMessage);
            $stmtNotification->execute();

            http_response_code(200);
            echo json_encode(array("message" => "Imágenes subidas y registradas correctamente."));
        } else {
            // Error al insertar en la base de datos
            http_response_code(500); // Internal Server Error
            echo json_encode(array("error" => "Error al insertar en la base de datos."));
        }
    }

    // Cerrar la conexión después de usarla
    $conexion = null;
}
