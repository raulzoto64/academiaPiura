<?php
include_once 'Conexion.php';

class TraerComentarios {
    private $pdo;
    private $db_academy;
    private $db_holdinghitpoly;

    public function __construct() {
        $db = new Conexion();
        $this->pdo = $db->pdo;
        $this->db_academy = $db->db_academy;
        $this->db_holdinghitpoly = $db->db_holdinghitpoly;
    }

    /**
     * ✅ OBTENER COMENTARIOS (FETCH)
     */
    public function getComentarios($clase_id, $limit = 20, $offset = 0) {
        try {
            // CORRECCIÓN: Se cambió u.nombre por u.name y $this->db_web por $this->db_holdinghitpoly
            // También se cambió la tabla 'user' por 'users' para coincidir con tu SQL
            $sql = "SELECT 
                        c.id, c.clase_id, c.usuario_id, c.contenido, 
                        c.respuesta_a_comentario_id, c.es_respuesta_profesor, 
                        c.editado, c.fecha_comentario, c.destacado,
                        u.name, u.apellido, u.avatar
                    FROM {$this->db_academy}.comentarios c
                    LEFT JOIN {$this->db_holdinghitpoly}.users u ON c.usuario_id = u.id
                    WHERE c.clase_id = :clase_id
                    ORDER BY c.fecha_comentario DESC
                    LIMIT :limit OFFSET :offset";
                    
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindValue(':clase_id', intval($clase_id), PDO::PARAM_INT);
            $stmt->bindValue(':limit', intval($limit), PDO::PARAM_INT);
            $stmt->bindValue(':offset', intval($offset), PDO::PARAM_INT);
            $stmt->execute();
            
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $comments_formatted = [];
            foreach ($results as $row) {
                if (!empty($row['fecha_comentario'])) {
                    try {
                        $dt = new DateTime($row['fecha_comentario'], new DateTimeZone('UTC'));
                        $row['fecha_comentario'] = $dt->format('Y-m-d\TH:i:s.000\Z'); 
                    } catch (Exception $e) { $row['fecha_comentario'] = date('Y-m-d\TH:i:s.000\Z'); }
                }
                $comments_formatted[] = $row;
            }
            return $comments_formatted;
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * ✏️ EDITAR COMENTARIO (SOLO DUEÑO)
     */
    public function updateComentario($id, $usuario_id, $contenido) {
        try {
            $sql = "UPDATE {$this->db_academy}.comentarios 
                    SET contenido = :contenido, editado = 1 
                    WHERE id = :id AND usuario_id = :usuario_id";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindValue(':contenido', $contenido, PDO::PARAM_STR);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->bindValue(':usuario_id', $usuario_id, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            return false;
        }
    }

    /**
     * 🗑️ ELIMINAR COMENTARIO (SOLO DUEÑO)
     */
    public function deleteComentario($id, $usuario_id) {
        try {
            $sql = "DELETE FROM {$this->db_academy}.comentarios 
                    WHERE id = :id AND usuario_id = :usuario_id";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->bindValue(':usuario_id', $usuario_id, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            return false;
        }
    }
}
