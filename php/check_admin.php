<?php
$pdo = new PDO("mysql:host=localhost;dbname=korochki_est;charset=utf8", "root", "");

$stmt = $pdo->query("SELECT login, role FROM users WHERE login = 'Admin'");
$admin = $stmt->fetch();

if ($admin) {
    echo "✅ Администратор найден!<br>";
    echo "Логин: " . $admin['login'] . "<br>";
    echo "Роль: " . $admin['role'] . "<br>";
} else {
    echo "❌ Администратор не найден в базе данных!<br>";
    echo "Добавьте администратора через phpMyAdmin или выполните SQL:<br>";
    echo "<pre>INSERT INTO users (login, password, full_name, phone, email, role) VALUES 
('Admin', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Администратор', '8(999)999-99-99', 'admin@korochki.est', 'admin');</pre>";
}
?>