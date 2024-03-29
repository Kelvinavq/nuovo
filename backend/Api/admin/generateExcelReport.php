<?php
include '../../Config/config.php';
include '../../cors.php';
require  '../../vendor/autoload.php'; // Ruta a Composer autoloader

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\IOFactory;

// Verificar si hay una sesión activa
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(array("error" => "No hay una sesión activa."));
    exit();
}

// Obtener una conexión a la base de datos
$conexion = obtenerConexion();

try {

    // Obtener las fechas desde la URL
    $startDate = $_GET['startDate'];
    $endDate = $_GET['endDate'];


    // Consultar los datos necesarios para el informe
    $sqlTransactions = "SELECT
DATE_FORMAT(t.transaction_date, '%m-%d-%Y') AS formatted_transaction_date,
    t.transaction_time,
    t.amount,
    t.status,
    t.type AS transaction_type,
    t.payment_method,
    u.name AS client_name,
    ub.balance AS initial_balance,
    t.withdrawal_request_id,
    t.deposit_request_id
FROM
    transactions t
JOIN users u ON t.user_id = u.id
JOIN user_balances ub ON t.user_id = ub.user_id
WHERE
    t.status IN ('pending', 'approved', 'denied') 
    AND t.transaction_date BETWEEN :start_date AND :end_date
ORDER BY
    t.transaction_date DESC";

    // Consultar totales de depósitos dentro del rango de fechas
    $sqlDepositTotalApproved = "SELECT SUM(amount) AS total_approved FROM transactions WHERE type = 'deposit' AND status = 'approved' AND transaction_date BETWEEN :start_date AND :end_date";
    $sqlDepositTotalPending = "SELECT SUM(amount) AS total_pending FROM transactions WHERE type = 'deposit' AND status = 'pending' AND transaction_date BETWEEN :start_date AND :end_date";
    $sqlDepositTotalDenied = "SELECT SUM(amount) AS total_denied FROM transactions WHERE type = 'deposit' AND status = 'denied' AND transaction_date BETWEEN :start_date AND :end_date";

    // Consultar totales de retiros dentro del rango de fechas
    $sqlWithdrawalTotalApproved = "SELECT SUM(amount) AS total_approved FROM transactions WHERE type = 'withdrawal' AND status = 'approved' AND transaction_date BETWEEN :start_date AND :end_date";
    $sqlWithdrawalTotalPending = "SELECT SUM(amount) AS total_pending FROM transactions WHERE type = 'withdrawal' AND status = 'pending' AND transaction_date BETWEEN :start_date AND :end_date";
    $sqlWithdrawalTotalDenied = "SELECT SUM(amount) AS total_denied FROM transactions WHERE type = 'withdrawal' AND status = 'denied' AND transaction_date BETWEEN :start_date AND :end_date";


    $stmtTransactions = $conexion->prepare($sqlTransactions);
    $stmtTransactions->bindParam(':start_date', $startDate, PDO::PARAM_STR);
    $stmtTransactions->bindParam(':end_date', $endDate, PDO::PARAM_STR);
    $stmtTransactions->execute();
    $dataFromDatabase = $stmtTransactions->fetchAll(PDO::FETCH_ASSOC);


    // Obtener totales de depósitos
    $stmtDepositTotalApproved = $conexion->prepare($sqlDepositTotalApproved);
    $stmtDepositTotalApproved->bindParam(':start_date', $startDate, PDO::PARAM_STR);
    $stmtDepositTotalApproved->bindParam(':end_date', $endDate, PDO::PARAM_STR);
    $stmtDepositTotalApproved->execute();
    $totalDepositApproved = $stmtDepositTotalApproved->fetch(PDO::FETCH_ASSOC)['total_approved'];

    $stmtDepositTotalPending = $conexion->prepare($sqlDepositTotalPending);
    $stmtDepositTotalPending->bindParam(':start_date', $startDate, PDO::PARAM_STR);
    $stmtDepositTotalPending->bindParam(':end_date', $endDate, PDO::PARAM_STR);
    $stmtDepositTotalPending->execute();
    $totalDepositPending = $stmtDepositTotalPending->fetch(PDO::FETCH_ASSOC)['total_pending'];

    $stmtDepositTotalDenied = $conexion->prepare($sqlDepositTotalDenied);
    $stmtDepositTotalDenied->bindParam(':start_date', $startDate, PDO::PARAM_STR);
    $stmtDepositTotalDenied->bindParam(':end_date', $endDate, PDO::PARAM_STR);
    $stmtDepositTotalDenied->execute();
    $totalDepositDenied = $stmtDepositTotalDenied->fetch(PDO::FETCH_ASSOC)['total_denied'];

    // Obtener totales de retiros
    $stmtWithdrawalTotalApproved = $conexion->prepare($sqlWithdrawalTotalApproved);
    $stmtWithdrawalTotalApproved->bindParam(':start_date', $startDate, PDO::PARAM_STR);
    $stmtWithdrawalTotalApproved->bindParam(':end_date', $endDate, PDO::PARAM_STR);
    $stmtWithdrawalTotalApproved->execute();
    $totalWithdrawalApproved = $stmtWithdrawalTotalApproved->fetch(PDO::FETCH_ASSOC)['total_approved'];

    $stmtWithdrawalTotalPending = $conexion->prepare($sqlWithdrawalTotalPending);
    $stmtWithdrawalTotalPending->bindParam(':start_date', $startDate, PDO::PARAM_STR);
    $stmtWithdrawalTotalPending->bindParam(':end_date', $endDate, PDO::PARAM_STR);
    $stmtWithdrawalTotalPending->execute();
    $totalWithdrawalPending = $stmtWithdrawalTotalPending->fetch(PDO::FETCH_ASSOC)['total_pending'];

    $stmtWithdrawalTotalDenied = $conexion->prepare($sqlWithdrawalTotalDenied);
    $stmtWithdrawalTotalDenied->bindParam(':start_date', $startDate, PDO::PARAM_STR);
    $stmtWithdrawalTotalDenied->bindParam(':end_date', $endDate, PDO::PARAM_STR);
    $stmtWithdrawalTotalDenied->execute();
    $totalWithdrawalDenied = $stmtWithdrawalTotalDenied->fetch(PDO::FETCH_ASSOC)['total_denied'];

    // Ruta de la plantilla Excel
    $templatePath =  '../../public/assets/reports/plantilla.xlsx';

    // Cargar la plantilla
    $spreadsheet = IOFactory::load($templatePath);

    // Seleccionar la hoja de trabajo activa
    $sheet = $spreadsheet->getActiveSheet();

    // Empezar desde la fila 18 para insertar datos
    $row = 18;

    // Insertar datos de transacciones desde la base de datos
    foreach ($dataFromDatabase as $rowData) {
        $sheet->setCellValue('E' . $row, $rowData['formatted_transaction_date']);
        $sheet->setCellValue('F' . $row, $rowData['transaction_time']);
        $sheet->setCellValue('G' . $row, $rowData['client_name']);

        $transactionType = $rowData['transaction_type'];

        if ($transactionType === "deposit") {
            $transactionType = "Depósito";
        } elseif ($transactionType === "withdrawal") {
            $transactionType = "Retiro";
        }

        $sheet->setCellValue('H' . $row, $transactionType);

        $sheet->setCellValue('I' . $row, $rowData['amount']);



        $status = $rowData['status'];

        if ($status === "approved") {
            $status = "Aprobado";
        } elseif ($status === "pending") {
            $status = "Pendiente";
        } elseif ($status === "denied") {
            $status = "Denegado";
        }

        $sheet->setCellValue('J' . $row, $status);


        $sheet->setCellValue('K' . $row, $rowData['initial_balance']);

        $paymentMethod = $rowData['payment_method'];

        if ($transactionType === 'withdrawal' && $paymentMethod === 'transferencia_entre_usuarios') {
            $paymentMethod = 'Transferencia';
        } elseif ($paymentMethod === 'transferencia_entre_usuarios') {
            $paymentMethod = 'Transferencia';
        } elseif ($paymentMethod === 'transferencia_nacional') {
            $paymentMethod = 'Nacional';
        } elseif ($paymentMethod === 'efectivo') {
            $paymentMethod = 'Efectivo';
        } elseif ($paymentMethod === 'transferencia_externa') {
            // Consultar la tabla withdrawal_requests para obtener la región
            $withdrawalRequestId = $rowData['withdrawal_request_id'];
            $sqlRegion = "SELECT region FROM withdrawal_requests WHERE id = :withdrawal_request_id";
            $stmtRegion = $conexion->prepare($sqlRegion);
            $stmtRegion->bindParam(':withdrawal_request_id', $withdrawalRequestId, PDO::PARAM_INT);
            $stmtRegion->execute();
            $region = $stmtRegion->fetch(PDO::FETCH_ASSOC)['region'];

            $paymentMethod = 'Transferencia Externa (' . $region . ')';
        } elseif ($paymentMethod === 'bank') {
            $paymentMethod = 'Banco';
        } elseif ($paymentMethod === 'cash') {
            $paymentMethod = 'Efectivo';
        } elseif ($paymentMethod === 'platform') {
            // Consultar la tabla deposit_requests para obtener el tipo de plataforma
            $depositRequestId = $rowData['deposit_request_id'];
            $sqlPlatformType = "SELECT platform_type FROM deposit_requests WHERE id = :deposit_request_id";
            $stmtPlatformType = $conexion->prepare($sqlPlatformType);
            $stmtPlatformType->bindParam(':deposit_request_id', $depositRequestId, PDO::PARAM_INT);
            $stmtPlatformType->execute();
            $platformType = $stmtPlatformType->fetch(PDO::FETCH_ASSOC)['platform_type'];

            $paymentMethod = 'Plataforma - ' . $platformType;
        }



        $sheet->setCellValue('L' . $row, $paymentMethod);
        // Incrementar la fila para el siguiente conjunto de datos
        $row++;
    }

    $fechaReporte = date("m-d-Y");

    // Agregar totales de depósitos y retiros
    $sheet->setCellValue('C7', $fechaReporte);
    $sheet->setCellValue('G11', $totalDepositApproved);
    $sheet->setCellValue('G12', $totalDepositPending);
    $sheet->setCellValue('G13', $totalDepositDenied);

    $sheet->setCellValue('K11', $totalWithdrawalApproved);
    $sheet->setCellValue('K12', $totalWithdrawalPending);
    $sheet->setCellValue('K13', $totalWithdrawalDenied);

    // Crear un objeto de escritura para Xlsx
    $writer = new Xlsx($spreadsheet);

    $date = time();

    // Definir la ruta del archivo de destino
    $filePath =  '../../public/assets/reports/Reporte(' . $date . ').xlsx';
    // $filePathRelative = '../../public/assets/reports/Reporte(' . $date . ').xlsx';

    // Guardar el archivo Excel
    $writer->save($filePath);


    // Devolver una respuesta JSON
    echo json_encode(array("success" => true, "file_url" => 'Reporte(' . $date . ').xlsx'));
} catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(array("error" => "Error al obtener los datos para el informe", "details" => $e->getMessage()));
} finally {
    // Cerrar la conexión después de usarla
    $conexion = null;
}
