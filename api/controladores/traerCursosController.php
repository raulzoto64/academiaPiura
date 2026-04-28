<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Leer datos JSON
$data = json_decode(file_get_contents('php://input'), true);

// Incluir modelo
include_once '../modelos/TraerCursos.php';
$dataCursos = new TraerCursos();

if (isset($data['accion']) && $data['accion'] === "getCursos") {
    $resultado = $dataCursos->getCursos();

    if (!empty($resultado)) {
        echo json_encode([
            'status' => 'success',
            'cursos' => $resultado
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'No se encontraron cursos publicados.'
        ]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Acción no válida']);
}
