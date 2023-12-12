<?php

function obtenerConexion() {
    $host = 'localhost';
    $dbname = 'nuovo';
    $username = 'root';
    $password = '';

    try {
        $conexion = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conexion;
    } catch (PDOException $e) {
        echo "Error de conexión: " . $e->getMessage();
    }
}