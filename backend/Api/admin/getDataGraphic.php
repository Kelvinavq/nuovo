<?php
include '../../Config/config.php';
include '../../cors.php';

$conexion = obtenerConexion();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Consultar datos para el gráfico
        $chartDataQuery = "SELECT type, transaction_date, amount FROM transactions WHERE status = 'approved'";
        $chartDataStmt = $conexion->query($chartDataQuery);
        $chartData = $chartDataStmt->fetchAll(PDO::FETCH_ASSOC);

        // Organizar datos por tipo (retiro/deposito)
        $organizedData = [];
        foreach ($chartData as $entry) {
            $organizedData[$entry['type']][] = [
                'date' => $entry['transaction_date'],
                'amount' => $entry['amount'],
            ];
        }

        // Devolver los resultados como JSON
        echo json_encode($organizedData);
    } catch (PDOException $e) {
        http_response_code(500); // Internal Server Error
        echo json_encode(array("error" => "Error al obtener datos del gráfico", "details" => $e->getMessage()));
    } finally {
        // Cerrar la conexión después de usarla
        $conexion = null;
    }
}
?>
