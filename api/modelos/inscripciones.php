<?php
include_once 'Conexion.php';

class Inscripciones {
    private $pdo;
    private $db_academy;
    private $db_web;

    public function __construct() {
        $db = new Conexion();
        $this->pdo = $db->pdo;
        $this->db_academy = $db->db_academy;
        $this->db_web = $db->db_web;
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function registerInscripcion($usuario_id, $curso_id, $fecha_inscripcion, $progreso, $completado, $fecha_completado) {
        try {
            // Validar si el usuario existe en db_web.users
            $checkUser = $this->pdo->prepare("SELECT id FROM {$this->db_web}.users WHERE id = :id");
            $checkUser->execute([':id' => $usuario_id]);
            if (!$checkUser->fetch()) {
                return 'usuario_no_existe';
            }

            // Validar si el curso existe en db_academy.cursos
            $checkCurso = $this->pdo->prepare("SELECT id FROM {$this->db_academy}.cursos WHERE id = :id");
            $checkCurso->execute([':id' => $curso_id]);
            if (!$checkCurso->fetch()) {
                return 'curso_no_existe';
            }

            // Verificar si ya está inscripto
            $sql_check = "SELECT id FROM {$this->db_academy}.cursos_inscritos WHERE usuario_id = :usuario_id AND curso_id = :curso_id";
            $stmt = $this->pdo->prepare($sql_check);
            $stmt->execute([
                ':usuario_id' => $usuario_id,
                ':curso_id' => $curso_id
            ]);

            if ($stmt->fetch()) {
                return 'existe';
            }

            // Insertar inscripción
            $sql = "INSERT INTO {$this->db_academy}.cursos_inscritos (
                usuario_id, curso_id, fecha_inscripcion, progreso, completado, fecha_completado
            ) VALUES (
                :usuario_id, :curso_id, :fecha_inscripcion, :progreso, :completado, :fecha_completado
            )";

            $query = $this->pdo->prepare($sql);
            $query->execute([
                ':usuario_id' => $usuario_id,
                ':curso_id' => $curso_id,
                ':fecha_inscripcion' => $fecha_inscripcion,
                ':progreso' => $progreso,
                ':completado' => $completado,
                ':fecha_completado' => !empty($fecha_completado) ? $fecha_completado : null
            ]);

            return $this->pdo->lastInsertId();

        } catch (PDOException $e) {
            error_log("Error en registerInscripcion: " . $e->getMessage());
            return false;
        }
    }

    public function getProgresoPorCurso($usuario_id, $curso_id) {
        try {
            $sql = "SELECT p.* FROM {$this->db_academy}.progreso_clase p
                    INNER JOIN {$this->db_academy}.clases c ON p.clase_id = c.id
                    INNER JOIN {$this->db_academy}.modulos m ON c.modulo_id = m.id
                    WHERE p.usuario_id = :usuario_id AND m.curso_id = :curso_id";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':usuario_id' => $usuario_id,
                ':curso_id' => $curso_id
            ]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return [];
        }
    }
}
