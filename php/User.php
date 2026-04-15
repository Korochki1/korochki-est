<?php
require_once 'Database.php';

class User {
    private $db;
    private $id;
    private $login;
    private $full_name;
    private $phone;
    private $email;
    private $role;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    public function register($login, $password, $full_name, $phone, $email) {
        // Валидация данных
        if (!$this->validateLogin($login)) {
            return ['success' => false, 'message' => 'Логин должен содержать не менее 6 символов (латиница и цифры)'];
        }
        
        if (!$this->validatePassword($password)) {
            return ['success' => false, 'message' => 'Пароль должен содержать не менее 8 символов'];
        }
        
        if (!$this->validateFullName($full_name)) {
            return ['success' => false, 'message' => 'ФИО должно содержать только кириллицу и пробелы'];
        }
        
        if (!$this->validatePhone($phone)) {
            return ['success' => false, 'message' => 'Телефон должен быть в формате 8(XXX)XXX-XX-XX'];
        }
        
        if (!$this->validateEmail($email)) {
            return ['success' => false, 'message' => 'Некорректный формат email'];
        }
        
        // Проверка уникальности логина и email
        $stmt = $this->db->prepare("SELECT id FROM users WHERE login = ? OR email = ?");
        $stmt->execute([$login, $email]);
        if ($stmt->fetch()) {
            return ['success' => false, 'message' => 'Пользователь с таким логином или email уже существует'];
        }
        
        // Хеширование пароля
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        // Добавление пользователя
        $stmt = $this->db->prepare(
            "INSERT INTO users (login, password, full_name, phone, email) VALUES (?, ?, ?, ?, ?)"
        );
        
        if ($stmt->execute([$login, $hashedPassword, $full_name, $phone, $email])) {
            return ['success' => true, 'message' => 'Регистрация успешна'];
        }
        
        return ['success' => false, 'message' => 'Ошибка регистрации'];
    }
    
    public function login($login, $password) {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE login = ? OR email = ?");
        $stmt->execute([$login, $login]);
        $user = $stmt->fetch();
        
        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_login'] = $user['login'];
            $_SESSION['user_name'] = $user['full_name'];
            $_SESSION['user_role'] = $user['role'];
            
            return [
                'success' => true,
                'message' => 'Вход выполнен',
                'user' => [
                    'id' => $user['id'],
                    'login' => $user['login'],
                    'full_name' => $user['full_name'],
                    'role' => $user['role']
                ]
            ];
        }
        
        return ['success' => false, 'message' => 'Неверный логин или пароль'];
    }
    
    public function logout() {
        session_destroy();
        return ['success' => true, 'message' => 'Выход выполнен'];
    }
    
    public function getCurrentUser() {
        if (isset($_SESSION['user_id'])) {
            $stmt = $this->db->prepare("SELECT id, login, full_name, phone, email, role FROM users WHERE id = ?");
            $stmt->execute([$_SESSION['user_id']]);
            return $stmt->fetch();
        }
        return null;
    }
    
    public function isAdmin() {
        $user = $this->getCurrentUser();
        return $user && $user['role'] === 'admin';
    }
    
    public function isAuthenticated() {
        return isset($_SESSION['user_id']);
    }
    
    // Валидаторы
    private function validateLogin($login) {
        return preg_match('/^[a-zA-Z0-9]{6,}$/', $login);
    }
    
    private function validatePassword($password) {
        return strlen($password) >= 8;
    }
    
    private function validateFullName($name) {
        return preg_match('/^[А-Яа-яЁё\s]+$/u', $name);
    }
    
    private function validatePhone($phone) {
        return preg_match('/^8\(\d{3}\)\d{3}-\d{2}-\d{2}$/', $phone);
    }
    
    private function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
}
?>