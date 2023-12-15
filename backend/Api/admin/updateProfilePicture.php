
<?php
include '../../Config/config.php';
include '../../cors.php';

// Iniciar la sesión
session_start();

$conexion = obtenerConexion();

// Verificar si el usuario está autenticado
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(array("error" => "Usuario no autenticado."));
    exit();
}

$userId = $_SESSION['user_id'];

// Obtener información del usuario desde la base de datos
$getUserInfo = "SELECT name, profile_picture FROM users WHERE id = :userId";
$stmtUserInfo = $conexion->prepare($getUserInfo);
$stmtUserInfo->bindParam(':userId', $userId);
$stmtUserInfo->execute();

if ($stmtUserInfo->rowCount() > 0) {
    $userInfo = $stmtUserInfo->fetch(PDO::FETCH_ASSOC);

    // Ruta donde se guardarán las imágenes de perfil en el servidor
    $uploadDirectory = '../../../src/assets/users/';

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
            http_response_code(200);
            echo json_encode(array("message" => "Foto de perfil actualizada correctamente."));
        } else {
            http_response_code(500); // Internal Server Error
            echo json_encode(array("error" => "Error al actualizar la foto de perfil en la base de datos."));
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
?>
