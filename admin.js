// Проверка прав администратора
async function checkAdminAccess() {
    try {
        const response = await fetch('php/api.php?action=is_admin');
        const data = await response.json();
        
        if (!data.is_admin) {
            alert('Доступ запрещен. Требуются права администратора.');
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Ошибка проверки прав:', error);
        window.location.href = 'index.html';
    }
}

// Загрузка всех заявок
async function loadAllApplications() {
    try {
        const response = await fetch('php/api.php?action=get_applications');
        const data = await response.json();
        
        const container = document.getElementById('allApplicationsList');
        if (!container) return;
        
        if (data.success && data.applications) {
            window.allApplications = data.applications;
            renderApplications(data.applications);
            updateStats(data.applications);
        }
    } catch (error) {
        console.error('Ошибка загрузки заявок:', error);
    }
}

function renderApplications(applications) {
    const container = document.getElementById('allApplicationsList');
    
    if (applications.length === 0) {
        container.innerHTML = '<p>Нет заявок для отображения</p>';
        return;
    }
    
    container.innerHTML = applications.map(app => `
        <div class="application-card" data-status="${app.status}">
            <div class="application-header">
                <span class="application-course">📖 ${escapeHtml(app.course_name)}</span>
                <span class="status-badge status-${app.status}">${getStatusText(app.status)}</span>
            </div>
            <div class="application-details">
                <p><strong>Пользователь:</strong> ${escapeHtml(app.full_name)} (${escapeHtml(app.login)})</p>
                <p><strong>Телефон:</strong> ${escapeHtml(app.phone)}</p>
                <p><strong>Email:</strong> ${escapeHtml(app.email)}</p>
                <p><strong>📅 Дата начала:</strong> ${app.start_date}</p>
                <p><strong>💳 Способ оплаты:</strong> ${getPaymentMethodText(app.payment_method)}</p>
                <p><strong>📅 Создана:</strong> ${new Date(app.created_at).toLocaleString()}</p>
                ${app.admin_comment ? `<p><strong>💬 Комментарий администратора:</strong> ${escapeHtml(app.admin_comment)}</p>` : ''}
            </div>
            <div class="application-actions">
                <button class="btn btn-sm btn-primary" onclick="openStatusModal(${app.id}, '${app.status}')">✏️ Изменить статус</button>
            </div>
        </div>
    `).join('');
}

function updateStats(applications) {
    const stats = {
        total: applications.length,
        new: applications.filter(a => a.status === 'new').length,
        in_progress: applications.filter(a => a.status === 'in_progress').length,
        completed: applications.filter(a => a.status === 'completed').length
    };
    
    const statsContainer = document.getElementById('adminStats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-number">${stats.total}</div>
                <div>Всего заявок</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.new}</div>
                <div>Новых</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.in_progress}</div>
                <div>В процессе</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.completed}</div>
                <div>Завершено</div>
            </div>
        `;
    }
}

// Открыть модальное окно изменения статуса
function openStatusModal(applicationId, currentStatus) {
    const modal = document.getElementById('statusModal');
    document.getElementById('statusAppId').value = applicationId;
    document.getElementById('newStatus').value = currentStatus;
    document.getElementById('adminComment').value = '';
    modal.style.display = 'block';
    
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => modal.style.display = 'none';
    
    window.onclick = (event) => {
        if (event.target === modal) modal.style.display = 'none';
    };
}

// Обновление статуса
document.addEventListener('DOMContentLoaded', () => {
    const statusForm = document.getElementById('statusForm');
    if (statusForm) {
        statusForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const id = document.getElementById('statusAppId').value;
            const status = document.getElementById('newStatus').value;
            const comment = document.getElementById('adminComment').value;
            
            try {
                const response = await fetch('php/api.php?action=update_application_status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, status, comment })
                });
                
                const result = await response.json();
                if (result.success) {
                    alert('Статус заявки обновлен');
                    document.getElementById('statusModal').style.display = 'none';
                    loadAllApplications();
                } else {
                    alert(result.message);
                }
            } catch (error) {
                alert('Ошибка обновления статуса');
            }
        });
    }
    
    // Фильтрация заявок
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            if (filter === 'all') {
                renderApplications(window.allApplications || []);
            } else {
                const filtered = (window.allApplications || []).filter(app => app.status === filter);
                renderApplications(filtered);
            }
        });
    });
    
    // Загрузка отзывов для админа
    async function loadAllReviews() {
        try {
            const response = await fetch('php/api.php?action=get_reviews');
            const data = await response.json();
            
            const container = document.getElementById('allReviewsList');
            if (container && data.success && data.reviews) {
                if (data.reviews.length > 0) {
                    container.innerHTML = data.reviews.map(review => `
                        <div class="review-card">
                            <div class="application-header">
                                <span><strong>${escapeHtml(review.full_name)}</strong> (${escapeHtml(review.login)})</span>
                                <span>⭐ ${review.rating}/5</span>
                            </div>
                            <p><strong>Курс:</strong> ${escapeHtml(review.course_name || 'Не указан')}</p>
                            <p>${escapeHtml(review.comment)}</p>
                            <small>📅 ${new Date(review.created_at).toLocaleString()}</small>
                        </div>
                    `).join('');
                } else {
                    container.innerHTML = '<p>Отзывов пока нет</p>';
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки отзывов:', error);
        }
    }
    
    checkAdminAccess();
    loadAllApplications();
    loadAllReviews();
});

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