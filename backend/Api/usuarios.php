<?php
include '../Config/config.php';
include '../cors.php';

// Obtener conexión a la base de datos
$conexion = obtenerConexion();


// Manejar solicitud POST para el registro de usuarios
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener datos del cuerpo de la solicitud
    $data = json_decode(file_get_contents("php://input"));

    // Validar y escapar los datos para prevenir SQL injection
    $name = htmlspecialchars(strip_tags($data->name));
    $email = htmlspecialchars(strip_tags($data->email));
    $password = password_hash(htmlspecialchars(strip_tags($data->password)), PASSWORD_BCRYPT);  // Cifrar la contraseña
    $phoneNumber = htmlspecialchars(strip_tags($data->phoneNumber));
    $address = htmlspecialchars(strip_tags($data->address));
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
}


// Cerrar la conexión después de usarla
$conexion = null;
