// Загрузка информации о пользователе
async function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('profileFullName').textContent = user.full_name || 'Не указано';
        document.getElementById('profilePhone').textContent = user.phone || 'Не указан';
        document.getElementById('profileEmail').textContent = user.email || 'Не указан';
    }
}

// Загрузка заявок пользователя
async function loadUserApplications() {
    try {
        const response = await fetch('php/api.php?action=get_applications');
        const data = await response.json();
        
        const container = document.getElementById('applicationsList');
        if (!container) return;
        
        if (data.success && data.applications && data.applications.length > 0) {
            container.innerHTML = data.applications.map(app => `
                <div class="application-card">
                    <div class="application-header">
                        <span class="application-course">📖 ${escapeHtml(app.course_name)}</span>
                        <span class="status-badge status-${app.status}">${getStatusText(app.status)}</span>
                    </div>
                    <div class="application-details">
                        <p>📅 Дата начала: ${app.start_date}</p>
                        <p>💳 Способ оплаты: ${getPaymentMethodText(app.payment_method)}</p>
                        <p>📅 Создана: ${new Date(app.created_at).toLocaleString()}</p>
                        ${app.admin_comment ? `<p>💬 Комментарий администратора: ${escapeHtml(app.admin_comment)}</p>` : ''}
                    </div>
                    <div class="application-actions">
                        ${app.status === 'completed' ? 
                            `<button class="btn btn-sm btn-primary" onclick="openReviewModal(${app.id}, '${escapeHtml(app.course_name)}')">⭐ Оставить отзыв</button>` : 
                            ''}
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p>У вас пока нет заявок. <a href="request.html">Подать заявку</a></p>';
        }
    } catch (error) {
        console.error('Ошибка загрузки заявок:', error);
    }
}

// Загрузка отзывов пользователя
async function loadUserReviews() {
    try {
        const response = await fetch('php/api.php?action=get_reviews');
        const data = await response.json();
        
        const container = document.getElementById('reviewsList');
        if (!container) return;
        
        if (data.success && data.reviews && data.reviews.length > 0) {
            container.innerHTML = data.reviews.map(review => `
                <div class="review-card">
                    <div class="application-header">
                        <span>Курс: ${escapeHtml(review.course_name || 'Не указан')}</span>
                        <span>⭐ ${review.rating}/5</span>
                    </div>
                    <p>${escapeHtml(review.comment)}</p>
                    <small>📅 ${new Date(review.created_at).toLocaleString()}</small>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p>Вы еще не оставляли отзывов</p>';
        }
    } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
    }
}

// Открыть модальное окно отзыва
function openReviewModal(applicationId, courseName) {
    const modal = document.getElementById('reviewModal');
    document.getElementById('reviewAppId').value = applicationId;
    document.getElementById('reviewComment').value = '';
    document.getElementById('reviewRating').value = '5';
    modal.style.display = 'block';
    
    // Закрытие по крестику
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => modal.style.display = 'none';
    
    window.onclick = (event) => {
        if (event.target === modal) modal.style.display = 'none';
    };
}

// Отправка отзыва
document.addEventListener('DOMContentLoaded', () => {
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const applicationId = document.getElementById('reviewAppId').value;
            const rating = document.getElementById('reviewRating').value;
            const comment = document.getElementById('reviewComment').value;
            
            if (!comment.trim()) {
                alert('Пожалуйста, введите текст отзыва');
                return;
            }
            
            try {
                const response = await fetch('php/api.php?action=create_review', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ application_id: applicationId, rating, comment })
                });
                
                const result = await response.json();
                if (result.success) {
                    alert('Спасибо за отзыв!');
                    document.getElementById('reviewModal').style.display = 'none';
                    loadUserReviews();
                } else {
                    alert(result.message);
                }
            } catch (error) {
                alert('Ошибка отправки отзыва');
            }
        });
    }
    
    loadUserInfo();
    loadUserApplications();
    loadUserReviews();
});

// Вспомогательные функции
function getStatusText(status) {
    const statuses = {
        'new': 'Новая',
        'in_progress': 'Идет обучение',
        'completed': 'Обучение завершено',
        'rejected': 'Отклонена'
    };
    return statuses[status] || status;
}

function getPaymentMethodText(method) {
    return method === 'cash' ? 'Наличными' : 'Переводом по номеру телефона';
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}