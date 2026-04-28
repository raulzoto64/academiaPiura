<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Ajuste de ruta para el modelo corregido
include_once '../modelos/traerComentarios.php';
$model = new TraerComentarios();

if (!isset($data['accion'])) {
    echo json_encode(['status' => 'error', 'message' => 'Acción no especificada']);
    exit;
}

switch ($data['accion']) {
    
    case "getComentarios":
        $clase_id = isset($data['clase_id']) ? intval($data['clase_id']) : 0;
        $limit    = isset($data['limit']) ? intval($data['limit']) : 20;
        $offset   = isset($data['offset']) ? intval($data['offset']) : 0;

        if ($clase_id > 0) {
            $resultado = $model->getComentarios($clase_id, $limit, $offset);
            // Si el resultado tiene la llave 'error', es un fallo de SQL
            if (isset($resultado['error'])) {
                echo json_encode(['status' => 'error', 'message' => 'Error en base de datos', 'details' => $resultado['error']]);
            } else {
                echo json_encode(['status' => 'success', 'comentarios' => $resultado], JSON_UNESCAPED_UNICODE);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'ID de clase no válido']);
        }
        break;

    case "update":
        $id         = isset($data['id']) ? intval($data['id']) : 0;
        $usuario_id = isset($data['usuario_id']) ? intval($data['usuario_id']) : 0;
        $contenido  = isset($data['contenido']) ? trim($data['contenido']) : "";

        if ($id > 0 && $usuario_id > 0 && !empty($contenido)) {
            if ($model->updateComentario($id, $usuario_id, $contenido)) {
                echo json_encode(['status' => 'success', 'message' => 'Comentario actualizado']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'No tienes permiso o el comentario no existe']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Datos insuficientes para editar']);
        }
        break;

    case "delete":
        $id         = isset($data['id']) ? intval($data['id']) : 0;
        $usuario_id = isset($data['usuario_id']) ? intval($data['usuario_id']) : 0;

        if ($id > 0 && $usuario_id > 0) {
            if ($model->deleteComentario($id, $usuario_id)) {
                echo json_encode(['status' => 'success', 'message' => 'Comentario eliminado']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'No tienes permiso o el comentario no existe']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Datos insuficientes para eliminar']);
        }
        break;

    default:
        echo json_encode(['status' => 'error', 'message' => 'Acción desconocida']);
        break;
}
exit;
