<?php
// Configuración de CORS
include '../Config/config.php';
include '../cors.php';



$conexion = obtenerConexion();
try {
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $userId = isset($_GET['user_id']) ? $_GET['user_id'] : null;

        // Consulta para obtener las plataformas y sus campos personalizados
        $sql = "SELECT p.id, p.platformType, p.platformName, p.email, GROUP_CONCAT(cf.fieldName, ':', cf.fieldValue) AS customFields_user
                FROM platforms_user p
                LEFT JOIN customFields_user cf ON p.id = cf.platformId
                 WHERE p.user_id = :user_id
                 AND p.status = 'active'
                GROUP BY p.id";

        $stmt = $conexion->prepare($sql);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();

        $plataformas = array();

        while ($fila = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Separar los campos personalizados en un array asociativo
            $camposPersonalizados = array();
            if (!empty($fila['customFields'])) {
                $paresCampos = explode(',', $fila['customFields']);
                foreach ($paresCampos as $par) {
                    list($nombreCampo, $valorCampo) = explode(':', $par);
                    $camposPersonalizados[$nombreCampo] = $valorCampo;
                }
            }

            // Agregar la plataforma al array
            $plataforma = array(
                'id' => $fila['id'],
                'platformType' => $fila['platformType'],
                'platformName' => $fila['platformName'],
                'email' => $fila['email'],
                'customFields' => $camposPersonalizados
            );

            $plataformas[] = $plataforma;
        }

        // Devolver las plataformas en formato JSON
        echo json_encode(array('platforms' => $plataformas));
    }
} catch (PDOException $e) {
    // Manejar excepciones de PDO (puedes personalizar esto según tus necesidades)
    echo json_encode(array('error' => 'Error al obtener la lista de plataformas'));
}

// Cerrar la conexión
$conexion = null;
