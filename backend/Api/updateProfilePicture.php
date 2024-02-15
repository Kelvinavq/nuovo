<?php
include '../Config/config.php';
include '../cors.php';

// Iniciar la sesión
session_start();

$conexion = obtenerConexion();

// Verificar si el usuario está autenticado
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(array("error" => "Usuario no autenticado."));
    exit();
}
$selectedLanguage = isset($_COOKIE['selectedLanguage']) ? $_COOKIE['selectedLanguage'] : 'es';

$userId = $_SESSION['user_id'];

// Obtener información del usuario desde la base de datos
$getUserInfo = "SELECT name, profile_picture FROM users WHERE id = :userId";
$stmtUserInfo = $conexion->prepare($getUserInfo);
$stmtUserInfo->bindParam(':userId', $userId);
$stmtUserInfo->execute();

if ($stmtUserInfo->rowCount() > 0) {
    $userInfo = $stmtUserInfo->fetch(PDO::FETCH_ASSOC);

    // Ruta donde se guardarán las imágenes de perfil en el servidor
    $uploadDirectory = '../public/assets/users/';

    // Obtener la información del archivo subido
    $file = $_FILES['profile_picture'];
    $fileName = basename($file['name']);
    $uploadFilePath = $uploadDirectory . $fileName;

    // Verificar si la imagen anterior no es la predeterminada
    if ($userInfo['profile_picture'] !== 'default.jpg') {
        // Ruta de la imagen anterior
        $previousFilePath = $uploadDirectory . $userInfo['profile_picture'];

        // Borrar la imagen anterior
        if (file_exists($previousFilePath)) {
            unlink($previousFilePath);
        }
    }

    // Mover el archivo al directorio de destino
    if (move_uploaded_file($file['tmp_name'], $uploadFilePath)) {
        // Actualizar el nombre de la foto de perfil en la base de datos
        $updateProfilePicture = "UPDATE users SET profile_picture = :fileName WHERE id = :userId";
        $stmtUpdatePicture = $conexion->prepare($updateProfilePicture);
        $stmtUpdatePicture->bindParam(':fileName', $fileName);
        $stmtUpdatePicture->bindParam(':userId', $userId);

        if ($stmtUpdatePicture->execute()) {

            // Agregar notificación
           

            if ($selectedLanguage == "en") {
                $notificationMessage = "Correctly updated profile photo";
            } elseif ($selectedLanguage == "pt") {
                $notificationMessage = "Foto de perfil atualizada corretamente";
            } else {
                $notificationMessage = "Foto de perfil actualizada correctamente";
            }


            // Insertar la notificación en la base de datos
            $insertNotificationQuery = "INSERT INTO pusher_notifications (user_id, content, status, type) VALUES (:userId, :content, 'unread', 'profile_update')";
            $stmtInsertNotification = $conexion->prepare($insertNotificationQuery);
            $stmtInsertNotification->bindParam(':userId', $userId);
            $stmtInsertNotification->bindParam(':content', $notificationMessage);
            $stmtInsertNotification->execute();

            // Enviar notificación a Pusher
            include("../pusher.php");

            $data = [
                'message' => $notificationMessage,
                'status' => 'unread',
                'type' => 'profile_update',
                'user_id' => $userId
            ];
            $pusher->trigger('notifications-channel', 'evento', $data);

            $userEmail = $_SESSION['user_email'];

            // Enviar notificación por correo electrónico
            if ($selectedLanguage == "en") {
                $subjectMessage = "Profile Photo";
            } elseif ($selectedLanguage == "pt") {
                $subjectMessage = "Nuovo - Foto de Perfil";
            } else {
                $subjectMessage = "Nuovo - Foto de Perfil";
            }

            $to = $userEmail;
            $subject = $subjectMessage;
            $message = $notificationMessage;

            $headers = 'From: nuovo@gmail.com' . "\r\n" .
                'Reply-To: nuovo@gmail.com' . "\r\n" .
                'X-Mailer: PHP/' . phpversion();

            if (mail($to, $subject, $message, $headers)) {
            } else {
                http_response_code(500);
                echo json_encode(array("error" => "Error al enviar correo electronico"));
            }


            http_response_code(200);
            echo json_encode(array("message" =>$notificationMessage));

            
        } else {


            if ($selectedLanguage == "en") {
                http_response_code(500); 
                echo json_encode(array("error" => "Error while updating the profile photo in the database."));
            } elseif ($selectedLanguage == "pt") {
                http_response_code(500); 
                echo json_encode(array("error" => "Erro ao atualizar a foto de perfil no banco de dados."));
            } else {
                http_response_code(500); 
                echo json_encode(array("error" => "Error al actualizar la foto de perfil en la base de datos."));
            }

            
        }
    } else {
        http_response_code(500); // Internal Server Error
        echo json_encode(array("error" => "Error al mover el archivo al servidor."));
    }
} else {
    http_response_code(404); // Not Found
    echo json_encode(array("error" => "Usuario no encontrado."));
}
// Cerrar la conexión después de usarla
$conexion = null;
