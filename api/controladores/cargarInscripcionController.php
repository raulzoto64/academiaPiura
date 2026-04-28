<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$data = json_decode(file_get_contents('php://input'), true);
include_once '../modelos/inscripciones.php';
$dataInscripciones = new Inscripciones();

if (isset($data['accion']) && $data['accion'] === "inscripciones") {
    $usuario_id = intval($data["usuario_id"] ?? 0);
    $curso_id = intval($data["curso_id"] ?? 0);
    $fecha_inscripcion = $data["fecha_inscripcion"] ?? date("Y-m-d H:i:s");
    $progreso = intval($data["progreso"] ?? 0);
    $completado = intval($data["completado"] ?? 0);
    $fecha_completado = $data["fecha_completado"] ?? null;

    if (!$usuario_id || !$curso_id) {
        echo json_encode(['status' => 'error', 'message' => 'Faltan datos de usuario o curso']);
        exit;
    }

    $resultado = $dataInscripciones->registerInscripcion($usuario_id, $curso_id, $fecha_inscripcion, $progreso, $completado, $fecha_completado);

    if ($resultado === 'usuario_no_existe') {
        echo json_encode(['status' => 'error', 'message' => 'El usuario no existe en la base de datos principal.']);
    } elseif ($resultado === 'curso_no_existe') {
        echo json_encode(['status' => 'error', 'message' => 'ID de curso no válido.']);
    } elseif ($resultado === 'existe') {
        echo json_encode(['status' => 'warning', 'message' => 'Ya estás inscrito en este curso.']);
    } elseif ($resultado) {
        echo json_encode(['status' => 'success', 'message' => 'Inscripción exitosa', 'id' => $resultado]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error interno al procesar registro.']);
    }
}
