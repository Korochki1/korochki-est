<?php
// Включение отображения ошибок для отладки
error_reporting(E_ALL);
ini_set('display_errors', 0); // Отключаем вывод ошибок в браузер
ini_set('log_errors', 1); // Логируем ошибки

// Заголовки для JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Перехват ошибок
function handleError($errno, $errstr, $errfile, $errline) {
    echo json_encode(['success' => false, 'message' => "Ошибка: $errstr"]);
    exit;
}
set_error_handler('handleError');

require_once 'Database.php';
require_once 'User.php';
require_once 'Application.php';
require_once 'Review.php';

// Проверка на сессии
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$user = new User();
$application = new Application();
$review = new Review();

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// Логирование для отладки
error_log("API Action: $action, Method: $method");

try {
    switch ($action) {
        case 'register':
            if ($method === 'POST') {
                $input = file_get_contents('php://input');
                error_log("Register input: $input");
                $data = json_decode($input, true);
                if (!$data) {
                    echo json_encode(['success' => false, 'message' => 'Неверный формат данных']);
                    break;
                }
                $result = $user->register(
                    $data['login'] ?? '',
                    $data['password'] ?? '',
                    $data['full_name'] ?? '',
                    $data['phone'] ?? '',
                    $data['email'] ?? ''
                );
                echo json_encode($result);
            }
            break;
            
        case 'login':
            if ($method === 'POST') {
                $input = file_get_contents('php://input');
                error_log("Login input: $input");
                $data = json_decode($input, true);
                if (!$data) {
                    echo json_encode(['success' => false, 'message' => 'Неверный формат данных']);
                    break;
                }
                $result = $user->login(
                    $data['login'] ?? '',
                    $data['password'] ?? ''
                );
                echo json_encode($result);
            }
            break;
            
        case 'logout':
            echo json_encode($user->logout());
            break;
            
        case 'check_auth':
            if ($user->isAuthenticated()) {
                echo json_encode([
                    'authenticated' => true,
                    'user' => $user->getCurrentUser()
                ]);
            } else {
                echo json_encode(['authenticated' => false]);
            }
            break;
            
        case 'is_admin':
            echo json_encode(['is_admin' => $user->isAdmin()]);
            break;
            
        case 'create_application':
            if ($user->isAuthenticated()) {
                $currentUser = $user->getCurrentUser();
                $input = file_get_contents('php://input');
                $data = json_decode($input, true);
                $result = $application->create(
                    $currentUser['id'],
                    $data['course_name'] ?? '',
                    $data['start_date'] ?? '',
                    $data['payment_method'] ?? ''
                );
                echo json_encode($result);
            } else {
                echo json_encode(['success' => false, 'message' => 'Необходима авторизация']);
            }
            break;
            
        case 'get_applications':
            if ($user->isAuthenticated()) {
                if ($user->isAdmin()) {
                    echo json_encode(['success' => true, 'applications' => $application->getAllApplications()]);
                } else {
                    $currentUser = $user->getCurrentUser();
                    echo json_encode(['success' => true, 'applications' => $application->getUserApplications($currentUser['id'])]);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Необходима авторизация']);
            }
            break;
            
        case 'update_application_status':
            if ($user->isAdmin()) {
                $input = file_get_contents('php://input');
                $data = json_decode($input, true);
                $result = $application->updateStatus(
                    $data['id'] ?? 0,
                    $data['status'] ?? '',
                    $data['comment'] ?? null
                );
                echo json_encode($result);
            } else {
                echo json_encode(['success' => false, 'message' => 'Доступ запрещен']);
            }
            break;
            
        case 'create_review':
            if ($user->isAuthenticated()) {
                $currentUser = $user->getCurrentUser();
                $input = file_get_contents('php://input');
                $data = json_decode($input, true);
                $result = $review->create(
                    $currentUser['id'],
                    $data['application_id'] ?? null,
                    $data['rating'] ?? 5,
                    $data['comment'] ?? ''
                );
                echo json_encode($result);
            } else {
                echo json_encode(['success' => false, 'message' => 'Необходима авторизация']);
            }
            break;
            
        case 'get_reviews':
            if ($user->isAuthenticated()) {
                if ($user->isAdmin()) {
                    echo json_encode(['success' => true, 'reviews' => $review->getAllReviews()]);
                } else {
                    $currentUser = $user->getCurrentUser();
                    echo json_encode(['success' => true, 'reviews' => $review->getUserReviews($currentUser['id'])]);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Необходима авторизация']);
            }
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Неизвестное действие: ' . $action]);
    }
} catch (Exception $e) {
    error_log("API Exception: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Внутренняя ошибка сервера: ' . $e->getMessage()]);
}
?>