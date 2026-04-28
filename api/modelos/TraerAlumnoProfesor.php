<?php
include_once 'Conexion.php';

class TraerAlumnoProfesor {
    private $pdo;
    private $db_holdinghitpoly;

    public function __construct() {
        try {
            $db = new Conexion();
            $this->pdo = $db->pdo;
            $this->db_holdinghitpoly = $db->db_holdinghitpoly;
            
            // Aseguramos que se use UTF-8
            $this->pdo->exec("SET NAMES utf8mb4");
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            error_log("Error de conexión en TraerAlumnoProfesor: " . $e->getMessage());
            $this->pdo = null;
        }
    }

    public function getAlumnoProfesor($id) {
        if (!$this->pdo) {
            return ["status" => "error", "message" => "Error de conexión a la base de datos"];
        }

        try {
            /** 
             * ✅ CONSULTA ADAPTADA:
             * - Se usa la tabla 'users' (u) de la DB holdinghitpoly (campo 'name' en lugar de 'nombre').
             * - Se une con 'profiles_general' (p) para obtener la biografía.
             */
            $sql = "SELECT 
                        u.name as nombre, 
                        u.apellido, 
                        u.avatar, 
                        p.bio AS biografia 
                    FROM {$this->db_holdinghitpoly}.users u
                    LEFT JOIN {$this->db_holdinghitpoly}.profiles_general p ON u.id = p.user_id
                    WHERE u.id = :id
                    LIMIT 1";

            $stmt = $this->pdo->prepare($sql);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($usuario) {
                return [
                    "status" => "success",
                    "usuario" => [
                        "nombre" => $usuario['nombre'],
                        "apellido" => $usuario['apellido'],
                        "avatar" => $usuario['avatar'],
                        "biografia" => (!empty($usuario['biografia'])) 
                                        ? $usuario['biografia'] 
                                        : "Instructor experto en habilidades digitales."
                    ]
                ];
            } else {
                return [
                    "status" => "error", 
                    "message" => "No se encontró el usuario con ID: $id"
                ];
            }
        } catch (PDOException $e) {
            return ["status" => "error", "message" => "Error SQL: " . $e->getMessage()];
        }
    }
}
