<?php

class Conexion {
    private $servidor = "localhost";
    private $puerto = 3306;
    private $charset = "utf8mb4"; // Recomendado utf8mb4 para emojis y acentos
    private $usuario = "duveroli_denis";
    private $contrasena = "PJ8lwbD+6zk8";
    
    // 💡 DEFINICIÓN DE BASES DE DATOS
    public $db_academy = "duveroli_academy";
    public $db_web     = "duveroli_holdinghitpoly";
    public $db_holdinghitpoly = "duveroli_holdinghitpoly"; 

    public $pdo = null;

    private $atributos = [
        PDO::ATTR_CASE => PDO::CASE_LOWER,
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_ORACLE_NULLS => PDO::NULL_EMPTY_STRING,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC // Cambiado a ASSOC para consistencia con los modelos
    ];

    function __construct() {
        try {
            // Nos conectamos inicialmente a la de la academia
            $dsn = "mysql:host={$this->servidor};port={$this->puerto};dbname={$this->db_academy};charset={$this->charset}";
            $this->pdo = new PDO($dsn, $this->usuario, $this->contrasena, $this->atributos);
        } catch (PDOException $e) {
            die("Error de conexión: " . $e->getMessage());
        }
    }
}
