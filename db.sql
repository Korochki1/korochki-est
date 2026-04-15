-- ======================================================
-- База данных "Корочки.есть" - Онлайн курсы ДПО
-- ======================================================

-- Создание базы данных
DROP DATABASE IF EXISTS korochki_est;
CREATE DATABASE korochki_est;
USE korochki_est;

-- ======================================================
-- Таблица: users (Пользователи)
-- ======================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_login (login),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================
-- Таблица: courses (Курсы)
-- ======================================================
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    duration VARCHAR(50),
    price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================
-- Таблица: applications (Заявки)
-- ======================================================
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_name VARCHAR(200) NOT NULL,
    start_date DATE NOT NULL,
    payment_method ENUM('cash', 'transfer') NOT NULL,
    status ENUM('new', 'in_progress', 'completed', 'rejected') DEFAULT 'new',
    admin_comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_start_date (start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================
-- Таблица: reviews (Отзывы)
-- ======================================================
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    application_id INT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================
-- Добавление администратора по умолчанию
-- Пароль: KorokNET
-- ======================================================
INSERT INTO users (login, password, full_name, phone, email, role) VALUES
('Admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Администратор Системы', '8(999)999-99-99', 'admin@korochki.est', 'admin');

-- ======================================================
-- Добавление тестовых курсов
-- ======================================================
INSERT INTO courses (name, description, duration, price) VALUES
('Python для начинающих', 'Изучение основ программирования на Python', '3 месяца', 15000.00),
('Веб-разработка Full Stack', 'HTML, CSS, JavaScript, React, Node.js', '6 месяцев', 35000.00),
('Data Science и анализ данных', 'Pandas, NumPy, Matplotlib, Machine Learning', '4 месяца', 25000.00),
('Java разработка', 'Java Core, Spring Boot, Hibernate', '5 месяцев', 30000.00);

-- ======================================================
-- ER-диаграмма (представление связей)
-- ======================================================
/*
    ┌─────────────────┐         ┌─────────────────────┐
    │      users      │         │    applications      │
    ├─────────────────┤         ├─────────────────────┤
    │ id (PK)         │◄────────│ user_id (FK)        │
    │ login           │         │ course_name         │
    │ password        │         │ start_date          │
    │ full_name       │         │ payment_method      │
    │ phone           │         │ status              │
    │ email           │         │ admin_comment       │
    │ role            │         │ created_at          │
    │ created_at      │         │ updated_at          │
    └─────────────────┘         └─────────────────────┘
            │                              │
            │                              │
            ▼                              ▼
    ┌─────────────────┐         ┌─────────────────────┐
    │     reviews      │         │      courses        │
    ├─────────────────┤         ├─────────────────────┤
    │ id (PK)         │         │ id (PK)             │
    │ user_id (FK)    │         │ name                │
    │ application_id  │         │ description         │
    │ rating          │         │ duration            │
    │ comment         │         │ price               │
    │ created_at      │         │ is_active           │
    └─────────────────┘         └─────────────────────┘

    Связи:
    - users 1 : N applications (один пользователь может иметь много заявок)
    - users 1 : N reviews (один пользователь может оставить много отзывов)
    - applications 0..1 : N reviews (одна заявка может иметь отзыв)
*/