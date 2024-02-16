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
    // Obtener datos del cuerpo de la solicitud
    $data = json_decode(file_get_contents("php://input"));

    // Validar y escapar los datos para prevenir SQL injection
    $selectedMethod = filter_var($data->selectedMethod, FILTER_SANITIZE_STRING);
    $amount = filter_var($data->amount, FILTER_SANITIZE_STRING);
    // Agregar notificación


    if ($selectedLanguage == "en") {
        $subjectMessage = "Nuovo - withdrawal request";
        $notificationMessage = "Correctly submitted withdrawal request";
    } elseif ($selectedLanguage == "pt") {
        $subjectMessage = "Nuovo - Pedido de retirada";
        $notificationMessage = "Solicitação de retirada enviada corretamente";
    } else {
        $subjectMessage = "Nuovo - solicitud de retiro";
        $notificationMessage = "Solicitud de retiro enviada correctamente";
    }

    $notificationMessageAdmin = "El usuario " . $userName . " Ha realizado una solicitud de retiro";



    // Limpiar y formatear el monto para convertirlo a valor numérico
    $amount = str_replace(',', '', $amount); // Eliminar comas
    $amount = floatval($amount); // Convertir a valor numérico

    // Obtener el ID de usuario al que se realizará la transferencia (en el caso de transferencia entre usuarios)
    $recipientUserId = null;
    $status = "pending"; // Valor predeterminado
    $type = "withdrawal"; // Valor predeterminado



    // Lógica para Transferencia entre Usuarios
    if ($selectedMethod === 'transferencia_entre_usuarios') {
        $recipientEmail = filter_var($data->email, FILTER_SANITIZE_EMAIL);
        $sender_email = $_SESSION['user_email'];

        // Buscar el ID del usuario destinatario por su correo electrónico
        $findRecipientIdQuery = "SELECT u.id, uv.status FROM users u 
                                 JOIN user_verification uv ON u.id = uv.user_id
                                 WHERE u.email = :email";
        $stmtRecipientId = $conexion->prepare($findRecipientIdQuery);
        $stmtRecipientId->bindParam(':email', $recipientEmail, PDO::PARAM_STR);
        $stmtRecipientId->execute();

        if ($stmtRecipientId->rowCount() > 0) {
            $recipientData = $stmtRecipientId->fetch(PDO::FETCH_ASSOC);
            $recipientUserId = $recipientData['id'];

            // Verificar si el usuario destinatario está verificado
            if ($recipientData['status'] !== 'approved') {


                if ($selectedLanguage == "en") {
                    http_response_code(400); // Bad Request
                    echo json_encode(array("error" => "The target user is not verified."));
                    exit();
                } elseif ($selectedLanguage == "pt") {
                    http_response_code(400); // Bad Request
                    echo json_encode(array("error" => "O usuário destinatário não foi verificado."));
                    exit();
                } else {
                    http_response_code(400); // Bad Request
                    echo json_encode(array("error" => "El usuario destinatario no está verificado."));
                    exit();
                }
            }

            // Validar si se está enviando al email del usuario actual
            if ($recipientEmail === $_SESSION['user_email']) {
                http_response_code(400); // Bad Request

                if ($selectedLanguage == "en") {
                    echo json_encode(array("error" => "You can't transfer yourself."));
                    exit();
                } elseif ($selectedLanguage == "pt") {
                    echo json_encode(array("error" => "Você não pode se transferir para si mesmo."));
                    exit();
                } else {
                    echo json_encode(array("error" => "No puedes transferirte a ti mismo. "));
                    exit();
                }
            }

            $status = "approved";
            $notificationMessageAdmin = "El usuario " . $userName . " Ha realizado una transferencia a " . $recipientEmail;
        } else {


            if ($selectedLanguage == "en") {
                http_response_code(400); // Bad Request
                echo json_encode(array("error" => "The target user is not registered or not verified."));
                exit();
            } elseif ($selectedLanguage == "pt") {
                http_response_code(400); // Bad Request
                echo json_encode(array("error" => "O usuário destinatário não está registrado ou não está verificado."));
                exit();
            } else {
                http_response_code(400); // Bad Request
                echo json_encode(array("error" => "El usuario destinatario no está registrado o no se encuentra verificado."));
                exit();
            }
        }
    }

    // Lógica para verificar saldo suficiente
    $userId = $_SESSION['user_id'];


    // Obtener el saldo actual del usuario remitente
    $getSenderBalanceQuery = "SELECT balance FROM user_balances WHERE user_id = :sender_user_id";
    $stmtSenderBalance = $conexion->prepare($getSenderBalanceQuery);
    $stmtSenderBalance->bindParam(':sender_user_id', $userId, PDO::PARAM_INT);
    $stmtSenderBalance->execute();

    if ($stmtSenderBalance->rowCount() > 0) {
        $senderBalance = floatval($stmtSenderBalance->fetch(PDO::FETCH_ASSOC)['balance']);

        // Verificar si el usuario tiene fondos suficientes
        if ($senderBalance < $amount) {
            // Fondos insuficientes, devolver un mensaje de error

            if ($selectedLanguage == "en") {
                http_response_code(400);
                echo json_encode(array("error" => "Insufficient funds to carry out the transaction."));
                exit();
            } elseif ($selectedLanguage == "pt") {
                http_response_code(400);
                echo json_encode(array("error" => "Fundos insuficientes para realizar a transação."));
                exit();
            } else {
                http_response_code(400);
                echo json_encode(array("error" => "Fondos insuficientes para realizar la transacción."));
                exit();
            }
        }
    } else {
        // Manejar el caso en que no se encuentre el saldo del usuario remitente
        // Devolver un mensaje de error


        if ($selectedLanguage == "en") {
            http_response_code(500);
            echo json_encode(array("error" => "Error processing withdrawal request. The sending user's balance was not found."));
            exit();
        } elseif ($selectedLanguage == "pt") {
            http_response_code(500);
            echo json_encode(array("error" => "Erro ao processar o pedido de retirada. Não foi encontrado o saldo do usuário remetente."));
            exit();
        } else {
            http_response_code(500);
            echo json_encode(array("error" => "Error al procesar la solicitud de retiro. No se encontró el saldo del usuario remitente."));
            exit();
        }
    }

    // Restar el monto del retiro al saldo del usuario remitente
    $newSenderBalance = $senderBalance - $amount;

    // Actualizar el saldo del usuario remitente
    $updateSenderBalanceQuery = "UPDATE user_balances SET balance = :new_balance WHERE user_id = :sender_user_id";
    $stmtUpdateSenderBalance = $conexion->prepare($updateSenderBalanceQuery);
    $stmtUpdateSenderBalance->bindParam(':new_balance', $newSenderBalance, PDO::PARAM_STR);
    $stmtUpdateSenderBalance->bindParam(':sender_user_id', $userId, PDO::PARAM_INT);
    $stmtUpdateSenderBalance->execute();

    // Iniciar transacción
    $conexion->beginTransaction();

    try {
        // Insertar la solicitud de retiro en la tabla withdrawal_requests
        $userId = $_SESSION['user_id'];
        $currentDateTime = date('Y-m-d H:i:s');
        $requestDate = date('Y-m-d');
        $requestTime = date('H:i:s');


        // insert si es transferencia entre usuarios
        if ($selectedMethod === 'transferencia_entre_usuarios') {

            $insertWithdrawalRequest = "INSERT INTO withdrawal_requests (user_id, amount, status, request_date, request_time, updated_at, recipient_email, sender_email, completed_at, method, recipient_user_id) VALUES(:user_id, :amount, :status, :request_date, :request_time, :updated_at, :recipient_email, :sender_email, :completed_at, :method, :recipient_user_id)";

            $stmtWithdrawal = $conexion->prepare($insertWithdrawalRequest);

            $stmtWithdrawal->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmtWithdrawal->bindParam(':status', $status, PDO::PARAM_STR);
            $stmtWithdrawal->bindParam(':amount', $amount, PDO::PARAM_STR);
            $stmtWithdrawal->bindParam(':request_date', $requestDate, PDO::PARAM_STR);
            $stmtWithdrawal->bindParam(':request_time', $requestTime, PDO::PARAM_STR);
            $stmtWithdrawal->bindParam(':updated_at', $currentDateTime, PDO::PARAM_STR);
            $stmtWithdrawal->bindParam(':recipient_email', $recipientEmail, PDO::PARAM_STR);
            $stmtWithdrawal->bindParam(':sender_email', $sender_email, PDO::PARAM_STR);
            $stmtWithdrawal->bindParam(':completed_at', $currentDateTime, PDO::PARAM_STR);
            $stmtWithdrawal->bindParam(':method', $selectedMethod, PDO::PARAM_STR);
            $stmtWithdrawal->bindParam(':recipient_user_id', $recipientUserId, PDO::PARAM_STR);

            // Agregar notificación


            if ($selectedLanguage == "en") {
                $notificationMessage = "The transfer has been performed correctly";
            } elseif ($selectedLanguage == "pt") {
                $notificationMessage = "A transferência foi realizada corretamente";
            } else {
                $notificationMessage = "La transferencia se ha realizado correctamente";
            }
            
        } else if ($selectedMethod === 'transferencia_nacional' && isset($data->methodArg)) {


            $methodArg = filter_var($data->methodArg, FILTER_SANITIZE_STRING);

            if ($methodArg === 'virtual') {

                $aliasCbu = filter_var($data->aliasCbu, FILTER_SANITIZE_STRING);
                $cuitcuil = filter_var($data->cuitcuil, FILTER_SANITIZE_STRING);
                $nombreCuenta = filter_var($data->nombreCuenta, FILTER_SANITIZE_STRING);

                $insertWithdrawalRequest = "INSERT INTO withdrawal_requests (user_id, status, amount, request_date, request_time, updated_at, cbu, alias_cbu, completed_at, method, method_arg, cuit_cuil, name_account_arg) VALUES(:user_id, :status, :amount, :request_date, :request_time, :updated_at, :cbu, :alias_cbu, :completed_at, :method, :method_arg, :cuit_cuil, :name_account_arg)";

                $stmtWithdrawal = $conexion->prepare($insertWithdrawalRequest);

                $stmtWithdrawal->bindParam(':user_id', $userId, PDO::PARAM_INT);
                $stmtWithdrawal->bindParam(':status', $status, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':amount', $amount, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':request_date', $requestDate, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':request_time', $requestTime, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':updated_at', $currentDateTime, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':cbu', $aliasCbu, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':alias_cbu', $aliasCbu, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':completed_at', $currentDateTime, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':method', $selectedMethod, PDO::PARAM_STR);

                $stmtWithdrawal->bindParam(':method_arg', $methodArg, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':cuit_cuil', $cuitcuil, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':name_account_arg', $nombreCuenta, PDO::PARAM_STR);
            } else if ($methodArg === 'fisico') {

                $aliasCbu = filter_var($data->aliasCbu, FILTER_SANITIZE_STRING);
                $cuitcuil = filter_var($data->cuitcuil, FILTER_SANITIZE_STRING);
                $nombreCuenta = filter_var($data->nombreCuenta, FILTER_SANITIZE_STRING);
                $numeroCuenta = filter_var($data->numeroCuenta, FILTER_SANITIZE_STRING);

                $insertWithdrawalRequest = "INSERT INTO withdrawal_requests (user_id, status, amount, request_date, request_time, updated_at, cbu, alias_cbu, completed_at, method, method_arg, num_cuenta_arg, cuit_cuil, name_account_arg) VALUES(:user_id, :status, :amount, :request_date, :request_time, :updated_at, :cbu, :alias_cbu, :completed_at, :method, :method_arg, :num_cuenta_arg, :cuit_cuil, :name_account_arg)";

                $stmtWithdrawal = $conexion->prepare($insertWithdrawalRequest);

                $stmtWithdrawal->bindParam(':user_id', $userId, PDO::PARAM_INT);
                $stmtWithdrawal->bindParam(':status', $status, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':amount', $amount, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':request_date', $requestDate, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':request_time', $requestTime, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':updated_at', $currentDateTime, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':cbu', $aliasCbu, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':alias_cbu', $aliasCbu, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':completed_at', $currentDateTime, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':method', $selectedMethod, PDO::PARAM_STR);

                $stmtWithdrawal->bindParam(':method_arg', $methodArg, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':num_cuenta_arg', $numeroCuenta, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':cuit_cuil', $cuitcuil, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':name_account_arg', $nombreCuenta, PDO::PARAM_STR);
            }
        } else if ($selectedMethod === 'efectivo') {

            $insertWithdrawalRequest = "INSERT INTO withdrawal_requests (user_id, status, amount, request_date, request_time, updated_at, completed_at, method) VALUES(:user_id, :status, :amount, :request_date, :request_time, :updated_at, :completed_at, :method)";

            $stmtWithdrawal = $conexion->prepare($insertWithdrawalRequest);

            $stmtWithdrawal->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmtWithdrawal->bindParam(':status', $status, PDO::PARAM_STR);
            $stmtWithdrawal->bindParam(':amount', $amount, PDO::PARAM_STR);
            $stmtWithdrawal->bindParam(':request_date', $requestDate, PDO::PARAM_STR);
            $stmtWithdrawal->bindParam(':request_time', $requestTime, PDO::PARAM_STR);
            $stmtWithdrawal->bindParam(':updated_at', $currentDateTime, PDO::PARAM_STR);
            $stmtWithdrawal->bindParam(':completed_at', $currentDateTime, PDO::PARAM_STR);
            $stmtWithdrawal->bindParam(':method', $selectedMethod, PDO::PARAM_STR);
        } else if ($selectedMethod === 'transferencia_externa' && isset($data->selectedRegion)) {

            $selectedRegion = filter_var($data->selectedRegion, FILTER_SANITIZE_STRING);

            if ($selectedRegion === 'europa') {

                $iban = filter_var($data->iban, FILTER_SANITIZE_STRING);
                $bankNameEu = filter_var($data->bankNameEu, FILTER_SANITIZE_STRING);
                $swiftBic = filter_var($data->swiftBic, FILTER_SANITIZE_STRING);
                $addressBankEu = filter_var($data->iban, FILTER_SANITIZE_STRING);
                $accountNumberEu = filter_var($data->accountNumberEu, FILTER_SANITIZE_STRING);
                $sortCodeEu = filter_var($data->sortCodeEu, FILTER_SANITIZE_STRING);


                $insertWithdrawalRequest = "INSERT INTO withdrawal_requests (user_id, status, amount, request_date, request_time, updated_at, completed_at, iban, method, region, bank_name_eu, swift_bic_eu, address_bank_eu, account_number_eu, sort_code_eu) VALUES(:user_id, :status, :amount, :request_date, :request_time, :updated_at, :completed_at, :iban, :method, :region,:bank_name_eu, :swift_bic_eu, :address_bank_eu, :account_number_eu, :sort_code_eu)";

                $stmtWithdrawal = $conexion->prepare($insertWithdrawalRequest);

                $stmtWithdrawal->bindParam(':user_id', $userId, PDO::PARAM_INT);
                $stmtWithdrawal->bindParam(':status', $status, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':amount', $amount, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':request_date', $requestDate, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':request_time', $requestTime, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':updated_at', $currentDateTime, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':completed_at', $currentDateTime, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':iban', $iban, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':method', $selectedMethod, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':region', $selectedRegion, PDO::PARAM_STR);

                $stmtWithdrawal->bindParam(':bank_name_eu', $bankNameEu, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':swift_bic_eu', $swiftBic, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':address_bank_eu', $addressBankEu, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':account_number_eu', $accountNumberEu, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':sort_code_eu', $sortCodeEu, PDO::PARAM_STR);
            } else if ($selectedRegion === 'usa') {

                $nameBank = filter_var($data->nameBank, FILTER_SANITIZE_STRING);
                $routingNumberAch = filter_var($data->routingNumberAch, FILTER_SANITIZE_STRING);
                $routingNumberWire = filter_var($data->routingNumberWire, FILTER_SANITIZE_STRING);
                $addressBank = filter_var($data->addressBank, FILTER_SANITIZE_STRING);
                $accountNumber = filter_var($data->accountNumber, FILTER_SANITIZE_STRING);
                $beneficiary = filter_var($data->beneficiary, FILTER_SANITIZE_STRING);

                $insertWithdrawalRequest = "INSERT INTO withdrawal_requests (user_id, status, amount, request_date, request_time, updated_at, bank_name, routing_number_ach, routing_number_wire, bank_address, account_number, completed_at, method, region, beneficiary) VALUES(:user_id, :status, :amount, :request_date, :request_time, :updated_at, :name_bank, :routing_number_ach, :routing_number_wire, :bank_address, :account_number, :completed_at, :method, :region, :beneficiary)";

                $stmtWithdrawal = $conexion->prepare($insertWithdrawalRequest);

                $stmtWithdrawal->bindParam(':user_id', $userId, PDO::PARAM_INT);
                $stmtWithdrawal->bindParam(':status', $status, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':amount', $amount, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':request_date', $requestDate, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':request_time', $requestTime, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':updated_at', $currentDateTime, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':name_bank', $nameBank, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':routing_number_ach', $routingNumberAch, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':routing_number_wire', $routingNumberWire, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':bank_address', $addressBank, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':account_number', $accountNumber, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':completed_at', $currentDateTime, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':method', $selectedMethod, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':region', $selectedRegion, PDO::PARAM_STR);
                $stmtWithdrawal->bindParam(':beneficiary', $beneficiary, PDO::PARAM_STR);
            }
        }

        // Ejecutar la consulta
        $stmtWithdrawal->execute();




        // Verificar si se insertaron filas
        if ($stmtWithdrawal->rowCount() > 0) {
            // La inserción en withdrawal_requests fue exitosa, proceder con la obtención del ID
            $lastWithdrawalRequestId = $conexion->lastInsertId();
        }

        $insertTransactionQuery = "INSERT INTO transactions (user_id, type, amount, status, transaction_date, transaction_time, payment_method, withdrawal_request_id, recipient_user_id) VALUES(:user_id, :typeTransaction, :amount, :status, :transaction_date, :transaction_time, :payment_method, :withdrawal_request_id, :recipient_user_id)";

        $stmtTransaction = $conexion->prepare($insertTransactionQuery);

        $stmtTransaction->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmtTransaction->bindParam(':typeTransaction', $type, PDO::PARAM_STR);
        $stmtTransaction->bindParam(':amount', $amount, PDO::PARAM_STR);
        $stmtTransaction->bindParam(':status', $status, PDO::PARAM_STR);
        $stmtTransaction->bindParam(':transaction_date', $requestDate, PDO::PARAM_STR);
        $stmtTransaction->bindParam(':transaction_time', $requestTime, PDO::PARAM_STR);
        $stmtTransaction->bindParam(':payment_method', $selectedMethod, PDO::PARAM_STR);
        $stmtTransaction->bindParam(':withdrawal_request_id', $lastWithdrawalRequestId, PDO::PARAM_INT);
        $stmtTransaction->bindParam(':recipient_user_id', $recipientUserId, PDO::PARAM_INT);

        // Ejecutar la consulta de transacción


        if ($stmtTransaction->execute()) {
            // Insertar la notificación en la base de datos
            $insertNotificationQuery = "INSERT INTO pusher_notifications (user_id, content, status, type, admin_message, status_admin) VALUES (:userId, :content, 'unread', 'withdrawal_request', :admin_message, 'unread')";
            $stmtInsertNotification = $conexion->prepare($insertNotificationQuery);
            $stmtInsertNotification->bindParam(':userId', $userId);
            $stmtInsertNotification->bindParam(':content', $notificationMessage);
            $stmtInsertNotification->bindParam(':admin_message', $notificationMessageAdmin);
            $stmtInsertNotification->execute();

            // Enviar notificación a Pusher
            include("../pusher.php");

            $data = [
                'message' => $notificationMessage,
                'status' => 'unread',
                'type' => 'withdrawal_request',
                'user_id' => $userId
            ];
            $pusher->trigger('notifications-channel', 'evento', $data);

            $userEmail = $_SESSION['user_email'];

            // Enviar notificación por correo electrónico
            include("../emailConfig.php");
            $toUser = $userEmail;
            $subjectUser = $subjectMessage;
            $messageUser = $notificationMessage;

            $headersUser = 'From: ' . $adminEmail . "\r\n" .
                'Reply-To: ' . $adminEmail . "\r\n" .
                'X-Mailer: PHP/' . phpversion();

            if (mail($toUser, $subjectUser, $messageUser, $headersUser)) {
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
            $subjectAdmin = 'Nuovo - Retiro';
            $messageAdmin = $notificationMessageAdmin;

            $headersAdmin = 'From: ' . $adminEmail . "\r\n" .
                'Reply-To: ' . $adminEmail . "\r\n" .
                'X-Mailer: PHP/' . phpversion();

            if (mail($toAdmin, $subjectAdmin, $messageAdmin, $headersAdmin)) {
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

            // Confirmar la transacción
            $conexion->commit();



            if ($selectedLanguage == "en") {
                http_response_code(201);
                echo json_encode(array("message" => "Withdrawal request successfully submitted."));
            } elseif ($selectedLanguage == "pt") {
                http_response_code(201);
                echo json_encode(array("message" => "Pedido de retirada enviado com êxito."));
            } else {
                http_response_code(201);
                echo json_encode(array("message" => "Solicitud de retiro enviada con éxito."));
            }
        } else {
            // Revertir la transacción en caso de error
            $conexion->rollBack();
            error_log($e->getMessage());



            if ($selectedLanguage == "en") {
                http_response_code(500);
                echo json_encode(array("error" => "Error processing withdrawal request.", "details" => $e->getMessage()));
            } elseif ($selectedLanguage == "pt") {
                http_response_code(500);
                echo json_encode(array("error" => "Erro ao processar o pedido de retirada.", "details" => $e->getMessage()));
            } else {
                http_response_code(500);
                echo json_encode(array("error" => "Error al procesar la solicitud de retiro.", "details" => $e->getMessage()));
            }
        }


        if ($selectedMethod === 'transferencia_entre_usuarios') {
            // Obtener el saldo actual del usuario destinatario
            $getRecipientBalanceQuery = "SELECT balance FROM user_balances WHERE user_id = :recipient_user_id";
            $stmtRecipientBalance = $conexion->prepare($getRecipientBalanceQuery);
            $stmtRecipientBalance->bindParam(':recipient_user_id', $recipientUserId, PDO::PARAM_INT);
            $stmtRecipientBalance->execute();

            if ($stmtRecipientBalance->rowCount() > 0) {
                $recipientBalance = floatval($stmtRecipientBalance->fetch(PDO::FETCH_ASSOC)['balance']);


                // Sumar el monto de la transferencia al saldo actual
                $newRecipientBalance = $recipientBalance + $amount;

                // Actualizar el saldo del usuario destinatario
                $updateRecipientBalanceQuery = "UPDATE user_balances SET balance = :new_balance WHERE user_id = :recipient_user_id";
                $stmtUpdateRecipientBalance = $conexion->prepare($updateRecipientBalanceQuery);
                $stmtUpdateRecipientBalance->bindParam(':new_balance', $newRecipientBalance, PDO::PARAM_STR);
                $stmtUpdateRecipientBalance->bindParam(':recipient_user_id', $recipientUserId, PDO::PARAM_INT);
                $stmtUpdateRecipientBalance->execute();
            }
        }
    } catch (PDOException $e) {
        // Revertir la transacción en caso de error
        $conexion->rollBack();
        error_log($e->getMessage());


        if ($selectedLanguage == "en") {
            http_response_code(500);
            echo json_encode(array("error" => "Error processing withdrawal request.", "details" => $e->getMessage()));
        } elseif ($selectedLanguage == "pt") {
            http_response_code(500);
            echo json_encode(array("error" => "Erro ao processar o pedido de retirada.", "details" => $e->getMessage()));
        } else {
            http_response_code(500);
            echo json_encode(array("error" => "Error al procesar la solicitud de retiro.", "details" => $e->getMessage()));
        }
    }
}

// Cerrar la conexión después de usarla
$conexion = null;
