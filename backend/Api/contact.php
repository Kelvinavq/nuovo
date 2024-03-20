<?php

include("../cors.php");
include("../emailConfig.php");

try {
    // Decodificar el cuerpo de la solicitud JSON
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $userName = $data['name'];
    $userEmail = $data['email'];
    $subjectMessage = $data['subject'];
    $userMessage = $data['message'];

    $messageContact = "
    Datos del usuario: \n
    Nombre y Apellido: " . $userName . "\n" .
    "Correo electrónico: " . $userEmail .  "\n" .
    "Asunto: " . $subjectMessage . "\n" . 
    "Mensaje: " . $userMessage . "";

    $to = $adminEmail;
    $subject = $subjectMessage;
    $message = $messageContact;

    $headers = 'From: ' . $adminEmail . "\r\n" .
        'Reply-To: ' . $adminEmail . "\r\n" .
        'X-Mailer: PHP/' . phpversion();

    if (mail($to, $subject, $message, $headers)) {
        // Si el correo se envía correctamente, no necesitas hacer nada más aquí
    } else {
        http_response_code(500);
        echo json_encode(array("error" => "Error al enviar correo electrónico"));
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array("error" => "Error al enviar correo electrónico: " . $e->getMessage()));
}
