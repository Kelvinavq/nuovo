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
$selectedLanguage = isset($_COOKIE['selectedLanguage']) ? $_COOKIE['selectedLanguage'] : 'es';


// Obtener el ID del usuario
$userId = $_SESSION['user_id'];
$userName = $_SESSION['user_name'];

// Verificar si se han enviado todas las imágenes
if (!isset($_FILES['dniFront']) || !isset($_FILES['dniSelfie']) || !isset($_FILES['dniBack'])) {
    http_response_code(400); // Bad Request
    echo json_encode(array("error" => "Debe seleccionar las tres imágenes."));
    exit();
}

// Rutas para guardar las imágenes
$dniFrontPath = '../public/assets/user_selfie/';
$dniBackPath = '../public/assets/user_dni_back/';
$dniSelfiePath = '../public/assets/user_dni/';

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

            if ($selectedLanguage == "en") {
                $notificationMessage = "Your verification request has been received. It's pending review.";
            } elseif ($selectedLanguage == "pt") {
                $notificationMessage = "O seu pedido de verificação foi recebido. Está pendente de revisão.";
            } else {
                $notificationMessage = "Tu solicitud de verificación ha sido recibida. Está pendiente de revisión.";
            }


            $notificationMessageAdmin = "El usuario " . $userName . " ha enviado una nueva solicitud de verificación.";

            // Insertar la notificación en la base de datos
            $insertNotificationQuery = "INSERT INTO pusher_notifications (user_id, content, status, type, admin_message, status_admin) VALUES (:userId, :content, 'unread', 'withdrawal_request', :admin_message, 'unread')";
            $stmtInsertNotification = $conexion->prepare($insertNotificationQuery);
            $stmtInsertNotification->bindParam(':userId', $userId);
            $stmtInsertNotification->bindParam(':content', $notificationMessage);
            $stmtInsertNotification->bindParam(':admin_message', $notificationMessageAdmin);
            $stmtInsertNotification->execute();


            // Enviar notificación a Pusher
            include("../pusher.php");
            include("../emailConfig.php");

            $data = [
                'message' => $notificationMessage,
                'status' => 'unread',
                'type' => 'verification_pending',
                'user_id' => $userId
            ];
            $pusher->trigger('notifications-channel', 'evento', $data);

            $userEmail = $_SESSION['user_email'];

            // Enviar notificación por correo electrónico
            if ($selectedLanguage == "en") {
                $subjectMessage = "Nuovo - Verification";
                $emailMessage = "Your verification request has been received. It's pending review. You will be notified by this means when your account is verified";
            } elseif ($selectedLanguage == "pt") {
                $subjectMessage = "Nuovo - Verificación";
                $emailMessage = "O seu pedido de verificação foi recebido. Está pendente de revisão. Você será notificado quando sua conta for verificada.";
            } else {
                $subjectMessage = "Nuovo - Verificación";
                $emailMessage = "Su solicitud de verificación ha sido recibida. Está pendiente de revisión. Será notificado por este medio cuando su cuenta se encuentre verificada";
            }

            $to = $userEmail;
            $subject = $subjectMessage;
            $message = $emailMessage;

            $headers = 'From: nuovo@gmail.com' . "\r\n" .
                'Reply-To: nuovo@gmail.com' . "\r\n" .
                'X-Mailer: PHP/' . phpversion();

            if (mail($to, $subject, $message, $headers)) {
            } else {
                http_response_code(500);
                echo json_encode(array("error" => "Error al enviar correo electronico"));
            }


            // admin
            $toAdmin = $adminEmail;
            $subjectAdmin = 'Nuovo - Verificación';
            $messageAdmin = $notificationMessageAdmin;

            $headersAdmin = 'From: ' . $adminEmail . "\r\n" .
                'Reply-To: ' . $adminEmail . "\r\n" .
                'X-Mailer: PHP/' . phpversion();

            if (mail($toAdmin, $subjectAdmin, $messageAdmin, $headersAdmin)) {
            } else {
                http_response_code(500);
                echo json_encode(array("error" => "Error al enviar correo electronico"));
            }
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
            if ($selectedLanguage == "en") {
                $notificationMessage = "Your verification request has been received. It's pending review.";
            } elseif ($selectedLanguage == "pt") {
                $notificationMessage = "O seu pedido de verificação foi recebido. Está pendente de revisão.";
            } else {
                $notificationMessage = "Tu solicitud de verificación ha sido recibida. Está pendiente de revisión.";
            }

            $notificationMessageAdmin = "El usuario " . $userName . " ha enviado una nueva solicitud de verificación.";

            // Insertar la notificación en la base de datos
            $insertNotificationQuery = "INSERT INTO pusher_notifications (user_id, content, status, type, admin_message, status_admin) VALUES (:userId, :content, 'unread', 'withdrawal_request', :admin_message, 'unread')";
            $stmtInsertNotification = $conexion->prepare($insertNotificationQuery);
            $stmtInsertNotification->bindParam(':userId', $userId);
            $stmtInsertNotification->bindParam(':content', $notificationMessage);
            $stmtInsertNotification->bindParam(':admin_message', $notificationMessageAdmin);
            $stmtInsertNotification->execute();


            // Enviar notificación a Pusher
            include("../pusher.php");
            include("../emailConfig.php");

            $data = [
                'message' => $notificationMessage,
                'status' => 'unread',
                'type' => 'verification_pending',
                'user_id' => $userId
            ];
            $pusher->trigger('notifications-channel', 'evento', $data);

            $userEmail = $_SESSION['user_email'];

            // Enviar notificación por correo electrónico
            if ($selectedLanguage == "en") {
                $subjectMessage = "Nuovo - Verification";
                $emailMessage = "Your verification request has been received. It's pending review. You will be notified by this means when your account is verified";
            } elseif ($selectedLanguage == "pt") {
                $subjectMessage = "Nuovo - Verificación";
                $emailMessage = "O seu pedido de verificação foi recebido. Está pendente de revisão. Você será notificado quando sua conta for verificada.";
            } else {
                $subjectMessage = "Nuovo - Verificación";
                $emailMessage = "Su solicitud de verificación ha sido recibida. Está pendiente de revisión. Será notificado por este medio cuando su cuenta se encuentre verificada";
            }

            $to = $userEmail;
            $subject = $subjectMessage;
            $message = $emailMessage;

            $headers = 'From: nuovo@gmail.com' . "\r\n" .
                'Reply-To: nuovo@gmail.com' . "\r\n" .
                'X-Mailer: PHP/' . phpversion();

            if (mail($to, $subject, $message, $headers)) {
            } else {
                http_response_code(500);
                echo json_encode(array("error" => "Error al enviar correo electronico"));
            }


            // admin
            $toAdmin = $adminEmail;
            $subjectAdmin = 'Nuovo - Verificación';
            $messageAdmin = $notificationMessageAdmin;

            $headersAdmin = 'From: ' . $adminEmail . "\r\n" .
                'Reply-To: ' . $adminEmail . "\r\n" .
                'X-Mailer: PHP/' . phpversion();

            if (mail($toAdmin, $subjectAdmin, $messageAdmin, $headersAdmin)) {
            } else {
                http_response_code(500);
                echo json_encode(array("error" => "Error al enviar correo electronico"));
            }

         
            if ($selectedLanguage == "en") {
                http_response_code(200);
                echo json_encode(array("message" => "Images uploaded and recorded correctly."));
    
            } elseif ($selectedLanguage == "pt") {
                http_response_code(200);
                echo json_encode(array("message" => "Imagens carregadas e registradas corretamente."));
    
            } else {
                http_response_code(200);
                echo json_encode(array("message" => "Imágenes subidas y registradas correctamente."));
    
            }

        } else {
            // Error al insertar en la base de datos
            http_response_code(500); // Internal Server Error
            echo json_encode(array("error" => "Error al insertar en la base de datos."));
        }
    }

    // Cerrar la conexión después de usarla
    $conexion = null;
}
