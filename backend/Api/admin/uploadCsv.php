<?php
include '../../Config/config.php';
include '../../cors.php';

// Obtener conexión a la base de datos
$conexion = obtenerConexion();

// Verificar si hay una sesión activa
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(array("error" => "No hay una sesión activa."));
    exit();
}
$userId = $_SESSION['user_id'];
$userEmail = $_SESSION['user_email'];

// Verificar si la solicitud es de tipo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(array("error" => "Método no permitido."));
    exit();
}


// Verificar si se recibieron las columnas y el nombre del archivo
if (isset($_FILES['file']) && isset($_POST['columns']) && isset($_POST['fileName'])) {


    try {

        $columns = $_POST['columns'];
        $selectedColumns = json_decode($columns, true);


        $csvFile = isset($_FILES['file']) ? $_FILES['file'] : null;
        $csvName = $csvFile ? uniqid('file') . '_' . $csvFile['name'] : null;
        $csvPath = $csvFile ? "../../public/assets/csv/" . $csvName : null;

        $fileName = $_POST['fileName'];

        move_uploaded_file($csvFile['tmp_name'], $csvPath);


        // Obtener una conexión a la base de datos
        $conexion = obtenerConexion();

        // Insertar en la tabla 'csv_files'
        $stmtFile = $conexion->prepare("INSERT INTO csv_files (filename) VALUES (:fileName)");
        $stmtFile->bindParam(':fileName', $csvName, PDO::PARAM_STR);
        $stmtFile->execute();

        // Obtener el ID del archivo recién insertado
        $fileId = $conexion->lastInsertId();

        // Insertar en la tabla 'csv_columns'
        $stmtColumn = $conexion->prepare("INSERT INTO csv_columns (file_id, column_name, column_data) VALUES (:fileId, :columnName, :columnData)");

        foreach ($selectedColumns as $column) {
            $columnName = $column['name'];
            $columnData = json_encode($column['data']);

            $stmtColumn->bindParam(':fileId', $fileId, PDO::PARAM_INT);
            $stmtColumn->bindParam(':columnName', $columnName, PDO::PARAM_STR);
            $stmtColumn->bindParam(':columnData', $columnData, PDO::PARAM_STR);
            $stmtColumn->execute();
        }

        $content = "¡Archivo CSV importado con éxito!";

        // Insertar la notificación en la base de datos
        $insertNotificationQuery = "INSERT INTO pusher_notifications (admin_id, admin_message, status_admin, type) VALUES (:admin_id, :admin_message, 'unread', 'upload_csv')";
        $stmtInsertNotification = $conexion->prepare($insertNotificationQuery);
        $stmtInsertNotification->bindParam(':admin_id', $userId);
        $stmtInsertNotification->bindParam(':admin_message', $content);
        $stmtInsertNotification->execute();


        // Enviar notificación a Pusher
        include("../../pusher.php");
        include("../../emailConfig.php");

        $notificationData = array('message' => $content);

        $data = [
            'message' => $content,
            'status' => 'unread',
            'type' => 'upload_csv',
            'user_id' => $userId
        ];

        $pusher->trigger('notifications-channel', 'evento', $data);

           // Enviar notificación por correo electrónico
           $to = $userEmail;
           $subject = 'Nuovo - CSV importado';
           $message = $content;

           $headers = 'From: ' . $adminEmail . "\r\n" .
               'Reply-To: ' . $adminEmail . "\r\n" .
               'X-Mailer: PHP/' . phpversion();

           if (mail($to, $subject, $message, $headers)) {
           } else {
               http_response_code(500);
               echo json_encode(array("error" => "Error al enviar correo electronico"));
           }

        // Enviar una respuesta de éxito
        http_response_code(200); // OK
        echo json_encode(array("success" => true));
    } catch (PDOException $e) {
        // Enviar una respuesta en caso de error
        http_response_code(500); // Internal Server Error
        echo json_encode(array("error" => "Error al guardar en la base de datos", "details" => $e->getMessage()));
    } finally {
        // Cerrar la conexión después de usarla
        $conexion = null;
    }
} else {
    // Enviar una respuesta en caso de datos incorrectos
    http_response_code(400); // Bad Request
    echo json_encode(array("error" => "Datos incorrectos en la solicitud"));
}
