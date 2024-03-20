<?php
// Configuración de CORS
include '../cors.php';
include '../Config/config.php';

$conexion = obtenerConexion();

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Recibir datos JSON del cuerpo de la solicitud
        $data = json_decode(file_get_contents("php://input"));

        // Verificar que se han recibido los datos necesarios
        if (isset($data->platformId)) {
            $platformId = $data->platformId;

            // Verificar si la plataforma es de tipo "otra"
            if (property_exists($data, 'customFields')) {
                // La plataforma es de tipo "otra", actualiza customFields
                $customFields = json_decode(json_encode($data->customFields), true);

                try {
                    // Iniciar transacción
                    $conexion->beginTransaction();

                    // Eliminar customFields existentes para la plataforma
                    $sqlDelete = "DELETE FROM customfields_user WHERE platformId = :platformId";
                    $stmtDelete = $conexion->prepare($sqlDelete);
                    $stmtDelete->bindParam(':platformId', $platformId, PDO::PARAM_INT);
                    $stmtDelete->execute();

                    // Insertar los nuevos customFields
                    $sqlInsert = "INSERT INTO customfields_user (platformId, fieldName, fieldValue) VALUES (:platformId, :fieldName, :fieldValue)";
                    $stmtInsert = $conexion->prepare($sqlInsert);

                    foreach ($customFields as $customField) {
                        $fieldName = $customField['fieldName'];
                        $fieldValue = $customField['fieldValue'];

                        $stmtInsert->bindParam(':platformId', $platformId, PDO::PARAM_INT);
                        $stmtInsert->bindParam(':fieldName', $fieldName, PDO::PARAM_STR);
                        $stmtInsert->bindParam(':fieldValue', $fieldValue, PDO::PARAM_STR);
                        $stmtInsert->execute();
                    }

                    // Confirmar la transacción
                    $conexion->commit();
                } catch (PDOException $e) {
                    // Revertir la transacción en caso de error
                    $conexion->rollBack();
                    echo json_encode(array('error' => 'Error al actualizar customFields: ' . $e->getMessage()));
                    // Salir del script en caso de error
                    exit;
                }
            }

            // También actualiza platformName y email cuando no es de tipo "otra"
            if (isset($data->platformEmail)) {
                $email = $data->platformEmail;

                $sql = "UPDATE platforms_user SET  email = :email WHERE id = :platformId";
                $stmt = $conexion->prepare($sql);
                $stmt->bindParam(':email', $email, PDO::PARAM_STR);
                $stmt->bindParam(':platformId', $platformId, PDO::PARAM_INT);
                $stmt->execute();
            } 

            // Devolver una respuesta exitosa
            echo json_encode(array('message' => 'Plataforma actualizada con éxito'));
        } else {
            // Datos incompletos, devolver un error
            echo json_encode(array('error' => 'Datos incompletos'));
        }
    }
} catch (PDOException $e) {
    // Manejar excepciones de PDO (puedes personalizar esto según tus necesidades)
    echo json_encode(array('error' => 'Error en la conexión a la base de datos: ' . $e->getMessage()));
} finally {
    // Cerrar la conexión
    $conexion = null;
}
