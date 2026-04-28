<?php
// 1. Configuración de errores
error_reporting(E_ALL);
ini_set('display_errors', 0); 

// 2. Cabeceras CORS y Content-Type
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// 3. Manejo de Preflight (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 4. Captura de datos POST (JSON de React)
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// 5. Carga del Modelo
include_once '../modelos/TraerAlumnoProfesor.php';
$model = new TraerAlumnoProfesor();

// Variable para la respuesta final
$response = [];

// 6. Validación de la acción
if (isset($data['accion']) && $data['accion'] === "getAlumnoProfesor") {
    
    $id = isset($data["id"]) ? intval($data["id"]) : 0;

    if ($id > 0) {
        // Llamada al método del modelo
        $resultado = $model->getAlumnoProfesor($id);

        if ($resultado && $resultado['status'] === 'success') {
            // Construimos la respuesta de éxito
            $nombreCompleto = $resultado['usuario']['nombre'] . " " . $resultado['usuario']['apellido'];
            
            $response = [
                'status'  => 'success',
                'message' => "Profesor encontrado: " . $nombreCompleto,
                'usuario' => $resultado['usuario']
            ];
        } else {
            // El modelo no encontró al usuario o hubo error de BD
            $response = [
                'status'  => 'error',
                'message' => $resultado['message'] ?? 'No se encontró el profesor con ID ' . $id
            ];
        }
    } else {
        $response = [
            'status'  => 'error',
            'message' => 'ID inválido o no proporcionado'
        ];
    }
} else {
    $response = [
        'status'  => 'error', 
        'message' => 'Acción no válida o datos faltantes'
    ];
}

// 7. ÚNICA SALIDA DE DATOS
echo json_encode($response, JSON_UNESCAPED_UNICODE);
exit;
