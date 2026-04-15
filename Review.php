<?php
require_once 'Database.php';

class Review {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    public function create($userId, $applicationId, $rating, $comment) {
        if ($rating < 1 || $rating > 5) {
            return ['success' => false, 'message' => 'Оценка должна быть от 1 до 5'];
        }
        
        if (empty(trim($comment))) {
            return ['success' => false, 'message' => 'Текст отзыва не может быть пустым'];
        }
        
        // Проверка, не оставлял ли пользователь уже отзыв на эту заявку
        $stmt = $this->db->prepare("SELECT id FROM reviews WHERE user_id = ? AND application_id = ?");
        $stmt->execute([$userId, $applicationId]);
        if ($stmt->fetch()) {
            return ['success' => false, 'message' => 'Вы уже оставляли отзыв на эту заявку'];
        }
        
        $stmt = $this->db->prepare(
            "INSERT INTO reviews (user_id, application_id, rating, comment) VALUES (?, ?, ?, ?)"
        );
        
        if ($stmt->execute([$userId, $applicationId, $rating, $comment])) {
            return ['success' => true, 'message' => 'Отзыв успешно добавлен'];
        }
        
        return ['success' => false, 'message' => 'Ошибка добавления отзыва'];
    }
    
    public function getUserReviews($userId) {
        $stmt = $this->db->prepare(
            "SELECT r.*, a.course_name 
             FROM reviews r 
             LEFT JOIN applications a ON r.application_id = a.id 
             WHERE r.user_id = ? 
             ORDER BY r.created_at DESC"
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }
    
    public function getAllReviews() {
        $stmt = $this->db->prepare(
            "SELECT r.*, u.full_name, u.login, a.course_name 
             FROM reviews r 
             JOIN users u ON r.user_id = u.id 
             LEFT JOIN applications a ON r.application_id = a.id 
             ORDER BY r.created_at DESC"
        );
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
?>