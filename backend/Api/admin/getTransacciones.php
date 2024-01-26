<?php
include '../../Config/config.php';
include '../../cors.php';

$conexion = obtenerConexion();

// Verificar si hay una sesión activa
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(array("error" => "No hay una sesión activa."));
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Obtener el tipo de transacción desde la URL
        $tipoTransaccion = isset($_GET['tipo']) ? $_GET['tipo'] : null;

        // Construir la consulta según el tipo de transacción
        $query = "SELECT * FROM transactions";

        if ($tipoTransaccion === 'depositos') {
            $query .= " WHERE type = 'deposit'";
        } elseif ($tipoTransaccion === 'retiros') {
            $query .= " WHERE type = 'withdrawal'";
        }

        $stmt = $conexion->query($query);
        $transacciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Devolver los resultados como JSON
        echo json_encode(array(
            'transactions' => $transacciones
        ));
    } catch (PDOException $e) {
        http_response_code(500); // Internal Server Error
        echo json_encode(array("error" => "Error al obtener las transacciones", "details" => $e->getMessage()));
    } finally {
        // Cerrar la conexión después de usarla
        $conexion = null;
    }
}
?>
