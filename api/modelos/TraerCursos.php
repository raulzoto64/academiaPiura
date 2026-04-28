<?php
include_once 'Conexion.php';

class TraerCursos {
    private $pdo;

    public function __construct() {
        $db = new Conexion();
        $this->pdo = $db->pdo;
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function getCursos() {
        try {
            $sql = "
                SELECT 
                    c.id,
                    c.titulo,
                    c.subtitulo,
                    c.descripcion_corta,
                    c.descripcion_larga,
                    c.url_banner,
                    c.url_video_introductorio,
                    c.precio,
                    c.moneda,
                    c.categoria_id,
                    c.nivel,
                    c.duracion_estimada,
                    c.horas_por_semana,
                    c.fecha_inicio_clases,
                    c.fecha_limite_inscripcion,
                    c.ritmo_aprendizaje,
                    c.tipo_clase,
                    c.titulo_credencial,
                    c.descripcion_credencial,
                    c.estado,
                    c.profesor_id,
                    c.fecha_publicacion,
                    c.fecha_actualizacion,
                    c.temario,
                    c.portada_targeta,
                    c.destacado,
                    m.id AS marca_id,
                    m.logoText AS marca_logotext,
                    m.description AS marca_description,
                    m.id_curso AS marca_id_curso
                FROM cursos c
                LEFT JOIN marca_plataforma m ON c.id = m.id_curso
                WHERE c.estado = 'Publicado'
                ORDER BY c.id
            ";

            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $cursos = [];

            foreach ($resultados as $fila) {
                $id = $fila['id'];

                // Decodificar temario si está presente y es válido
                $temario = [];
                if (!empty($fila['temario'])) {
                    $temarioDecoded = json_decode($fila['temario'], true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $temario = $temarioDecoded;
                    }
                }

                if (!isset($cursos[$id])) {
                    $cursos[$id] = [
                        'id' => $fila['id'],
                        'titulo' => $fila['titulo'],
                        'subtitulo' => $fila['subtitulo'],
                        'descripcion_corta' => $fila['descripcion_corta'],
                        'descripcion_larga' => $fila['descripcion_larga'],
                        'url_banner' => $fila['url_banner'],
                        'url_video_introductorio' => $fila['url_video_introductorio'],
                        'precio' => $fila['precio'],
                        'moneda' => $fila['moneda'],
                        'categoria_id' => $fila['categoria_id'],
                        'nivel' => $fila['nivel'],
                        'duracion_estimada' => $fila['duracion_estimada'],
                        'horas_por_semana' => $fila['horas_por_semana'],
                        'fecha_inicio_clases' => $fila['fecha_inicio_clases'],
                        'fecha_limite_inscripcion' => $fila['fecha_limite_inscripcion'],
                        'ritmo_aprendizaje' => $fila['ritmo_aprendizaje'],
                        'tipo_clase' => $fila['tipo_clase'],
                        'titulo_credencial' => $fila['titulo_credencial'],
                        'descripcion_credencial' => $fila['descripcion_credencial'],
                        'estado' => $fila['estado'],
                        'profesor_id' => $fila['profesor_id'],
                        'fecha_publicacion' => $fila['fecha_publicacion'],
                        'fecha_actualizacion' => $fila['fecha_actualizacion'],
                        'temario' => $temario,
                        'portada_targeta' => $fila['portada_targeta'],
                        'destacado' => $fila['destacado'],
                        'marcaAsociada' => []
                    ];
                }

                // Agregar marca si existe
                if (!empty($fila['marca_id'])) {
                    $cursos[$id]['marcaAsociada'][] = [
                        'id' => $fila['marca_id'],
                        'logoText' => $fila['marca_logotext'] ?? 'SIN LOGO',
                        'description' => $fila['marca_description'] ?? 'SIN DESCRIPCIÓN'
                    ];
                }
            }

            return array_values($cursos);

        } catch (PDOException $e) {
            error_log("Error al obtener los cursos: " . $e->getMessage());
            return [];
        }
    }
}
