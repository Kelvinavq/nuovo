<?php
include '../Config/config.php';
include '../cors.php';

// Obtener conexión a la base de datos
$conexion = obtenerConexion();

// Verificar si la solicitud es de tipo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(array("error" => "Método no permitido."));
    exit();
}

// Verificar si hay una sesión activa
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(array("error" => "No hay una sesión activa."));
    exit();
}

$selectedLanguage = isset($_COOKIE['selectedLanguage']) ? $_COOKIE['selectedLanguage'] : 'es';

$userName = $_SESSION['user_name'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Validar y escapar los datos para prevenir SQL injection
    $paymentMethod = filter_input(INPUT_POST, 'payment_method', FILTER_SANITIZE_STRING);
    $amount = filter_input(INPUT_POST, 'amount');
    $referenceNumber = filter_input(INPUT_POST, 'reference_number', FILTER_SANITIZE_STRING);

        // Limpiar y formatear el monto para convertirlo a valor numérico
        $amount = str_replace(',', '', $amount); // Eliminar comas
        $amount = floatval($amount); // Convertir a valor numérico

    // Obtener el tipo de plataforma seleccionada si existe
    $platformType = isset($_POST['selected_platform']) ? filter_input(INPUT_POST, 'selected_platform', FILTER_SANITIZE_STRING) :  $paymentMethod;

    $id_platform_user = isset($_POST['id_platform_user']) ? filter_input(INPUT_POST, 'id_platform_user', FILTER_SANITIZE_STRING) :  null;

    $platformAdminId = isset($_POST['platformAdminId']) ? filter_input(INPUT_POST, 'platformAdminId', FILTER_SANITIZE_STRING) :  null;

    $comision = null;
    $subtractedAmount = null;
    $finalAmount = null;


    // si existe la plataforma
    if ($id_platform_user != null) {
        $query = "SELECT * FROM platforms_user WHERE id = :id_platform_user";
        $stmt = $conexion->prepare($query);
        $stmt->bindParam(':id_platform_user', $id_platform_user, PDO::PARAM_INT);
        $stmt->execute();
        $plataformaUser = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($plataformaUser['type'] === "yes") {
            $is_perzonalizable = "yes";
        }else{
            $is_perzonalizable = "no";
        }
    }

    if ($platformAdminId != null) {
        $queryComision = "SELECT comision FROM platforms WHERE id = :platformId";
        $stmtComision = $conexion->prepare($queryComision);
        $stmtComision->bindParam(':platformId', $platformAdminId, PDO::PARAM_INT);
        $stmtComision->execute();
        $comisionData = $stmtComision->fetch(PDO::FETCH_ASSOC);

        if ($comisionData) {
            $comision = $comisionData['comision'];

            // Calcular la cantidad restada y el monto final
            $subtractedAmount = $amount * ($comision / 100);
            $finalAmount = $amount - $subtractedAmount;
        }
    }

  



    // Obtener el archivo de comprobante de pago (si se proporciona)
    $voucherImg = isset($_FILES['payment_proof']) ? $_FILES['payment_proof'] : null;
    $fecha = new DateTime();

    // Iniciar transacción
    $conexion->beginTransaction();

    try {


        // Generar un nombre único para la imagen
        $voucherImgName = $voucherImg ? uniqid('payment_proof_') . '_' . $voucherImg['name'] : null;
        $voucherImgPath = $voucherImg ? "../public/assets/vouchers/" . $voucherImgName : null;

        // Insertar la solicitud de depósito en la tabla deposit_requests
        $userId = $_SESSION['user_id'];
        $currentDateTime = date('Y-m-d H:i:s');
        $requestDate = date('Y-m-d');
        $requestTime = date('H:i:s');

        $insertDepositRequest = "INSERT INTO deposit_requests (user_id, payment_method, amount, status, request_date, request_time, reference_number, platform_type, updated_at, voucher_img,id_platform_user, platformName_user, platformEmail_user, is_personalizable, comision, subtracted_amount, final_amount) 
        VALUES (:user_id, :payment_method, :amount, 'pending', :request_date, :request_time, :reference_number, :platform_type, :updated_at, :voucher_img, :id_platform_user, :platformName_user, :platformEmail_user, :is_personalizable, :comision, :subtracted_amount, :final_amount)";

        $stmtDeposit = $conexion->prepare($insertDepositRequest);
        $stmtDeposit->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmtDeposit->bindParam(':payment_method', $paymentMethod, PDO::PARAM_STR);
        $stmtDeposit->bindParam(':amount', $amount, PDO::PARAM_STR);
        $stmtDeposit->bindParam(':request_date', $requestDate, PDO::PARAM_STR);
        $stmtDeposit->bindParam(':request_time', $requestTime, PDO::PARAM_STR);
        $stmtDeposit->bindParam(':reference_number', $referenceNumber, PDO::PARAM_STR);
        $stmtDeposit->bindParam(':platform_type', $platformType, PDO::PARAM_STR);
        $stmtDeposit->bindParam(':updated_at', $currentDateTime, PDO::PARAM_STR);
        $stmtDeposit->bindParam(':voucher_img', $voucherImgName, PDO::PARAM_STR);
        $stmtDeposit->bindParam(':id_platform_user', $id_platform_user, PDO::PARAM_STR);
        $stmtDeposit->bindParam(':platformName_user', $plataformaUser['platformName'], PDO::PARAM_STR);
        $stmtDeposit->bindParam(':platformEmail_user', $plataformaUser['email'], PDO::PARAM_STR);
        $stmtDeposit->bindParam(':is_personalizable', $is_perzonalizable, PDO::PARAM_STR);
        $stmtDeposit->bindParam(':comision', $comision, PDO::PARAM_STR);
        $stmtDeposit->bindParam(':subtracted_amount', $subtractedAmount, PDO::PARAM_STR);
        $stmtDeposit->bindParam(':final_amount', $finalAmount, PDO::PARAM_STR);
        

        // Mover el archivo si se proporciona
        if ($voucherImg) {
            move_uploaded_file($voucherImg['tmp_name'], $voucherImgPath);
        }

        $stmtDeposit->execute();

        // Obtener el ID de la solicitud de depósito recién insertada
        $depositRequestId = $conexion->lastInsertId();

        // Insertar la transacción en la tabla transactions
        $transactionType = 'deposit';

        $insertTransaction = "INSERT INTO transactions (user_id, type, amount, status, transaction_date, transaction_time, payment_method, platform_type, deposit_request_id, comision, subtracted_amount, final_amount) 
        VALUES (:user_id, :type, :amount, 'pending', :transaction_date, :transaction_time, :payment_method, :platform_type, :deposit_request_id, :comision, :subtracted_amount, :final_amount)";

        $stmtTransaction = $conexion->prepare($insertTransaction);
        $stmtTransaction->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmtTransaction->bindParam(':type', $transactionType, PDO::PARAM_STR);
        $stmtTransaction->bindParam(':amount', $amount, PDO::PARAM_STR);
        $stmtTransaction->bindParam(':transaction_date', $requestDate, PDO::PARAM_STR);
        $stmtTransaction->bindParam(':transaction_time', $requestTime, PDO::PARAM_STR);
        $stmtTransaction->bindParam(':payment_method', $paymentMethod, PDO::PARAM_STR);
        $stmtTransaction->bindParam(':platform_type', $platformType, PDO::PARAM_STR);
        $stmtTransaction->bindParam(':deposit_request_id', $depositRequestId, PDO::PARAM_INT);
        $stmtTransaction->bindParam(':comision', $comision, PDO::PARAM_STR);
        $stmtTransaction->bindParam(':subtracted_amount', $subtractedAmount, PDO::PARAM_STR);
        $stmtTransaction->bindParam(':final_amount', $finalAmount, PDO::PARAM_STR);

        if ($stmtTransaction->execute()) {
            // Agregar notificación
            $notificationMessageAdmin = "El usuario " . $userName . " ha realizado una solicitud de depósito.";

            if ($selectedLanguage == "en") {
                $notificationMessage = "Correctly submitted deposit request";
            } elseif ($selectedLanguage == "pt") {
                $notificationMessage = "Solicitação de depósito enviada corretamente";
            } else {
                $notificationMessage = "Solictud de depósito enviada correctamente";
            }

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
                'type' => 'deposit_request',
                'user_id' => $userId
            ];
            $pusher->trigger('notifications-channel', 'evento', $data);

            $userEmail = $_SESSION['user_email'];

            // Enviar notificación por correo electrónico
            $to = $userEmail;
            $subject = 'Nuovo - deposit';
            $message = $notificationMessage;

            $headers = 'From: nuovo@gmail.com' . "\r\n" .
                'Reply-To: nuovo@gmail.com' . "\r\n" .
                'X-Mailer: PHP/' . phpversion();

            if (mail($to, $subject, $message, $headers)) {
            } else {
                if ($selectedLanguage == "en") {
                    http_response_code(500);
                    echo json_encode(array("error" => "Error sending email"));
                } elseif ($selectedLanguage == "pt") {
                    http_response_code(500);
                    echo json_encode(array("error" => "Erro ao enviar e-mail"));
                } else {
                    http_response_code(500);
                    echo json_encode(array("error" => "Error al enviar correo electronico"));
                }
            }

            // admin
            $toAdmin = $adminEmail;
            $subjectAdmin = 'Nuovo - Solicitud de Depósito';
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
            // Revertir la transacción en caso de error
            $conexion->rollBack();

            http_response_code(500); // Internal Server Error
            echo json_encode(array("error" => "Error al procesar la solicitud de depósito."));
        }

        // Confirmar la transacción
        $conexion->commit();

        if ($selectedLanguage == "en") {
            http_response_code(201);
            echo json_encode(array("message" => "deposit request successfully submitted."));
        } elseif ($selectedLanguage == "pt") {
            http_response_code(201);
            echo json_encode(array("message" => "Pedido de depósito enviado com sucesso."));
        } else {
            http_response_code(201);
            echo json_encode(array("message" => "Solicitud de depósito enviada con éxito."));
        }
    } catch (PDOException $e) {
        // Revertir la transacción en caso de error
        $conexion->rollBack();

        if ($selectedLanguage == "en") {
            http_response_code(500);
            echo json_encode(array("error" => "Error processing deposit request.", "details" => $e->getMessage()));
        } elseif ($selectedLanguage == "pt") {
            http_response_code(500);
            echo json_encode(array("error" => "Erro ao processar o pedido de depósito.", "details" => $e->getMessage()));
        } else {
            http_response_code(500);
            echo json_encode(array("error" => "Error al procesar la solicitud de depósito.", "details" => $e->getMessage()));
        }
    }
}

// Cerrar la conexión después de usarla
$conexion = null;
