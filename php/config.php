<?php
// Конфигурация базы данных
define('DB_HOST', 'localhost');
define('DB_NAME', 'korochki_est');
define('DB_USER', 'root');
define('DB_PASS', '');

// Настройки приложения
define('APP_NAME', 'Корочки.есть');
define('APP_URL', 'http://localhost/korochki-est/');

// Включение отображения ошибок для разработки
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Запуск сессии
session_start();
?>