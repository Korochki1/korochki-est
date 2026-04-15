// Проверка авторизации
async function checkAuth() {
    try {
        const response = await fetch('php/api.php?action=check_auth');
        const data = await response.json();
        
        const loginLink = document.getElementById('loginLink');
        const logoutBtn = document.getElementById('logoutBtn');
        const userNameSpan = document.getElementById('userName');
        
        if (data.authenticated && data.user) {
            if (loginLink) loginLink.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'inline';
            if (userNameSpan) userNameSpan.textContent = `👤 ${data.user.full_name}`;
            
            // Сохраняем пользователя в localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
        } else {
            if (loginLink) loginLink.style.display = 'inline';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (userNameSpan) userNameSpan.textContent = '';
            localStorage.removeItem('user');
        }
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
    }
}

// Выход из системы
async function logout() {
    try {
        await fetch('php/api.php?action=logout');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Ошибка выхода:', error);
    }
}

// Регистрация
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const login = document.getElementById('login').value;
            const password = document.getElementById('password').value;
            const fullName = document.getElementById('fullName').value;
            const phone = document.getElementById('phone').value;
            const email = document.getElementById('email').value;
            
            // Валидация
            let isValid = true;
            
            if (!/^[a-zA-Z0-9]{6,}$/.test(login)) {
                document.getElementById('loginError').textContent = 'Логин должен содержать не менее 6 символов (латиница и цифры)';
                isValid = false;
            } else {
                document.getElementById('loginError').textContent = '';
            }
            
            if (password.length < 8) {
                document.getElementById('passwordError').textContent = 'Пароль должен содержать не менее 8 символов';
                isValid = false;
            } else {
                document.getElementById('passwordError').textContent = '';
            }
            
            if (!/^[А-Яа-яЁё\s]+$/.test(fullName)) {
                document.getElementById('fullNameError').textContent = 'ФИО должно содержать только кириллицу и пробелы';
                isValid = false;
            } else {
                document.getElementById('fullNameError').textContent = '';
            }
            
            if (!/^8\(\d{3}\)\d{3}-\d{2}-\d{2}$/.test(phone)) {
                document.getElementById('phoneError').textContent = 'Телефон должен быть в формате 8(XXX)XXX-XX-XX';
                isValid = false;
            } else {
                document.getElementById('phoneError').textContent = '';
            }
            
            if (!/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/.test(email)) {
                document.getElementById('emailError').textContent = 'Некорректный формат email';
                isValid = false;
            } else {
                document.getElementById('emailError').textContent = '';
            }
            
            if (!isValid) return;
            
            try {
                const response = await fetch('php/api.php?action=register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ login, password, full_name: fullName, phone, email })
                });
                
                const result = await response.json();
                if (result.success) {
                    alert('Регистрация успешна! Теперь войдите в систему.');
                    window.location.href = 'login.html';
                } else {
                    alert(result.message);
                }
            } catch (error) {
                alert('Ошибка регистрации: ' + error.message);
            }
        });
    }
    
    // Вход
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const login = document.getElementById('login').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('php/api.php?action=login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ login, password })
                });
                
                const result = await response.json();
                if (result.success) {
                    alert('Добро пожаловать в систему!');
                    window.location.href = 'index.html';
                } else {
                    alert(result.message);
                }
            } catch (error) {
                alert('Ошибка входа: ' + error.message);
            }
        });
    }
    
    // Кнопка выхода
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
    
    // Проверяем авторизацию на всех страницах
    checkAuth();
});