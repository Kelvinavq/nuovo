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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener datos del cuerpo de la solicitud
    $data = json_decode(file_get_contents("php://input"));

    // Validar y escapar los datos para prevenir SQL injection
    $email = htmlspecialchars(strip_tags($data->email));
    $password = htmlspecialchars(strip_tags($data->password));

    // Buscar usuario por correo electrónico
    $buscarUsuario = "SELECT id, name, password, role, email FROM users WHERE email = :email";
    $stmtBuscar = $conexion->prepare($buscarUsuario);
    $stmtBuscar->bindParam(':email', $email);
    $stmtBuscar->execute();

    if ($stmtBuscar->rowCount() > 0) {
        // Usuario encontrado, verificar la contraseña
        $usuario = $stmtBuscar->fetch(PDO::FETCH_ASSOC);

        if (password_verify($password, $usuario['password'])) {
            // Contraseña válida, iniciar sesión de forma segura
            session_start();
            session_regenerate_id(); // Regenerar el ID de la sesión para prevenir ataques de fijación de sesión
            $_SESSION['user_id'] = $usuario['id'];
            $_SESSION['user_name'] = $usuario['name'];
            $_SESSION['user_role'] = $usuario['role'];
            $_SESSION['user_email'] = $usuario['email'];

            // Devolver información del usuario en la respuesta
            http_response_code(200);
            echo json_encode(array(
                "message" => "Inicio de sesión exitoso.",
                "user_id" => $usuario['id'],
                "user_name" => $usuario['name'],
                "user_role" => $usuario['role'],
                "user_email" => $usuario['email'],
                
            ));
        } else {
            // Contraseña incorrecta
            http_response_code(401); // Unauthorized
            echo json_encode(array("error" => "Contraseña incorrecta."));
        }
    } else {
        // Usuario no encontrado
        session_start(); // Iniciar sesión para realizar operaciones
        session_regenerate_id(); // Regenerar el ID de la sesión para prevenir ataques de fijación de sesión
        session_unset(); // Limpiar todas las variables de sesión
        session_destroy(); // Destruir la sesión

        http_response_code(404); // Not Found
        echo json_encode(array("error" => "Usuario no encontrado."));
    }
}

// Cerrar la conexión después de usarla
$conexion = null;
