<?php
require_once 'Database.php';

class Application {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    public function create($userId, $courseName, $startDate, $paymentMethod) {
        // Валидация даты
        $date = DateTime::createFromFormat('Y-m-d', $startDate);
        if (!$date || $date < new DateTime()) {
            return ['success' => false, 'message' => 'Некорректная дата начала обучения'];
        }
        
        // Валидация способа оплаты
        if (!in_array($paymentMethod, ['cash', 'transfer'])) {
            return ['success' => false, 'message' => 'Некорректный способ оплаты'];
        }
        
        $stmt = $this->db->prepare(
            "INSERT INTO applications (user_id, course_name, start_date, payment_method) VALUES (?, ?, ?, ?)"
        );
        
        if ($stmt->execute([$userId, $courseName, $startDate, $paymentMethod])) {
            return ['success' => true, 'message' => 'Заявка успешно создана', 'id' => $this->db->lastInsertId()];
        }
        
        return ['success' => false, 'message' => 'Ошибка создания заявки'];
    }
    
    public function getUserApplications($userId) {
        $stmt = $this->db->prepare(
            "SELECT * FROM applications WHERE user_id = ? ORDER BY created_at DESC"
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }
    
    public function getAllApplications() {
        $stmt = $this->db->prepare(
            "SELECT a.*, u.full_name, u.login, u.phone, u.email 
             FROM applications a 
             JOIN users u ON a.user_id = u.id 
             ORDER BY a.created_at DESC"
        );
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    public function updateStatus($applicationId, $status, $comment = null) {
        if (!in_array($status, ['new', 'in_progress', 'completed', 'rejected'])) {
            return ['success' => false, 'message' => 'Некорректный статус'];
        }
        
        $stmt = $this->db->prepare(
            "UPDATE applications SET status = ?, admin_comment = ? WHERE id = ?"
        );
        
        if ($stmt->execute([$status, $comment, $applicationId])) {
            return ['success' => true, 'message' => 'Статус заявки обновлен'];
        }
        
        return ['success' => false, 'message' => 'Ошибка обновления статуса'];
    }
    
    public function getStatusText($status) {
        $statuses = [
            'new' => 'Новая',
            'in_progress' => 'Идет обучение',
            'completed' => 'Обучение завершено',
            'rejected' => 'Отклонена'
        ];
        return $statuses[$status] ?? $status;
    }
    
    public function getPaymentMethodText($method) {
        return $method === 'cash' ? 'Наличными' : 'Переводом по номеру телефона';
    }
}
?>