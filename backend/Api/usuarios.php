<?php
include '../Config/config.php';
include '../cors.php';

// Obtener conexión a la base de datos
$conexion = obtenerConexion();

$selectedLanguage = isset($_COOKIE['selectedLanguage']) ? $_COOKIE['selectedLanguage'] : 'es';

// Manejar solicitud POST para el registro de usuarios
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    if (isset($_FILES['dni']) && isset($_FILES['dniBack']) && isset($_FILES['selfie'])) {

        // Validar y escapar los datos para prevenir SQL injection
        $name = htmlspecialchars(strip_tags($_POST['name']));
        $email = htmlspecialchars(strip_tags($_POST['email']));
        $password = password_hash(htmlspecialchars(strip_tags($_POST['password'])), PASSWORD_BCRYPT);  // Cifrar la contraseña
        $phoneNumber = htmlspecialchars(strip_tags($_POST['phoneNumber']));
        $address = htmlspecialchars(strip_tags($_POST['address']));
        $profile_picture = "default.png";


        // Verificar si el correo electrónico ya existe
        $verificarEmail = "SELECT id FROM users WHERE email = :email";
        $stmtVerificar = $conexion->prepare($verificarEmail);
        $stmtVerificar->bindParam(':email', $email);
        $stmtVerificar->execute();

        if ($stmtVerificar->rowCount() > 0) {
            // El correo electrónico ya existe, enviar mensaje de error
            http_response_code(400); // Bad Request
            echo json_encode(array("message" => "El correo electrónico ya está registrado."));
        } else {
            // Insertar usuario en la base de datos
            $insertarUsuario = "
                INSERT INTO users (name, email, password, phoneNumber, address, profile_picture, registrationTime, registrationDate)
                VALUES (:name, :email, :password, :phoneNumber, :address, :profile_picture, CURRENT_TIME(), CURRENT_DATE())
                ";

            $stmt = $conexion->prepare($insertarUsuario);
            $stmt->bindParam(':name', $name);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':password', $password);
            $stmt->bindParam(':phoneNumber', $phoneNumber);
            $stmt->bindParam(':address', $address);
            $stmt->bindParam(':profile_picture', $profile_picture);

            error_log("Intento de registro de usuario: " . $insertarUsuario);


            try {
                if ($stmt->execute()) {
                    // Éxito en el registro

                    // Obtener el ID del usuario recién registrado
                    $user_id = $conexion->lastInsertId();

                    // Insertar un registro en la tabla user_balances con balance 0
                    $insertarBalanceCero = "
                    INSERT INTO user_balances (user_id, balance)
                    VALUES (:user_id, 0)
                    ";

                    $stmtBalance = $conexion->prepare($insertarBalanceCero);
                    $stmtBalance->bindParam(':user_id', $user_id);
                    $stmtBalance->execute();

                    // Rutas para guardar las imágenes
                    $dniFrontPath = '../public/assets/user_selfie/';
                    $dniBackPath = '../public/assets/user_dni_back/';
                    $dniSelfiePath = '../public/assets/user_dni/';

                    // Nombres de archivo
                    $dniFrontFilename = 'dni_selfie_' . $user_id . '.' . pathinfo($_FILES['dni']['name'], PATHINFO_EXTENSION);
                    $dniBackFilename = 'dni_back_' . $user_id . '.' . pathinfo($_FILES['dniBack']['name'], PATHINFO_EXTENSION);
                    $dniSelfieFilename = 'dni_front_' . $user_id . '.' . pathinfo($_FILES['selfie']['name'], PATHINFO_EXTENSION);



                    if (
                        move_uploaded_file($_FILES['dni']['tmp_name'], $dniFrontPath . $dniFrontFilename) &&
                        move_uploaded_file($_FILES['selfie']['tmp_name'], $dniSelfiePath . $dniSelfieFilename) &&
                        move_uploaded_file($_FILES['dniBack']['tmp_name'], $dniBackPath . $dniBackFilename)
                    ) {

                        $insertImages = "INSERT INTO user_verification (user_id, dni_image, selfie_with_dni_image, dni_back) VALUES (:userId, :dniFront, :dniSelfie, :dniBack)";
                        $stmtInsert = $conexion->prepare($insertImages);
                        $stmtInsert->bindParam(':userId', $user_id);
                        $stmtInsert->bindParam(':dniFront', $dniSelfieFilename);
                        $stmtInsert->bindParam(':dniBack', $dniBackFilename);
                        $stmtInsert->bindParam(':dniSelfie', $dniFrontFilename);

                        if ($stmtInsert->execute()) {

                            // Agregar notificación
                            if ($selectedLanguage == "en") {
                                $notificationMessage = "Your verification request has been received. It's pending review.";
                            } elseif ($selectedLanguage == "pt") {
                                $notificationMessage = "O seu pedido de verificação foi recebido. Está pendente de revisão.";
                            } else {
                                $notificationMessage = "Tu solicitud de verificación ha sido recibida. Está pendiente de revisión.";
                            }

                            $notificationMessageAdmin = "El usuario " . $name . " se registró y ha enviado una nueva solicitud de verificación.";


                            // Insertar la notificación en la base de datos
                            $insertNotificationQuery = "INSERT INTO pusher_notifications (user_id, content, status, type, admin_message, status_admin) VALUES (:userId, :content, 'unread', 'verification_pending', :admin_message, 'unread')";
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

                            $userEmail = $email;

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


                            $headers = 'From: ' . $adminEmail . "\r\n" .
                                'Reply-To: ' . $adminEmail . "\r\n" .
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
                                   'Content-Type: text/plain; charset=UTF-8' . "\r\n" .
                                'X-Mailer: PHP/' . phpversion();

                            if (mail($toAdmin, $subjectAdmin, $messageAdmin, $headersAdmin)) {
                            } else {
                                http_response_code(500);
                                echo json_encode(array("error" => "Error al enviar correo electronico"));
                            }
                        }
                    }



                    http_response_code(201);
                    echo json_encode(array("message" => "Usuario registrado con éxito."));
                } else {
                    // Error en el registro
                    http_response_code(500);
                    echo json_encode(array("message" => "Error al registrar el usuario."));
                }
            } catch (Exception $e) {
                // Log de la excepción
                error_log("Excepción al registrar usuario: " . $e->getMessage());
                http_response_code(500);
                echo json_encode(array("message" => "Error al registrar el usuario."));
            }
        }
    } else {
        // Archivos no proporcionados, enviar mensaje de error
        http_response_code(400);
        echo json_encode(array("message" => "Archivos no proporcionados."));
    }
}


// Cerrar la conexión después de usarla
$conexion = null;
