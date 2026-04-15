document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('applicationForm');
    
    // Установка минимальной даты (сегодня)
    const dateInput = document.getElementById('startDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const courseName = document.getElementById('courseName').value.trim();
            const startDate = document.getElementById('startDate').value;
            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
            
            if (!courseName) {
                alert('Пожалуйста, введите наименование курса');
                return;
            }
            
            if (!startDate) {
                alert('Пожалуйста, выберите дату начала обучения');
                return;
            }
            
            try {
                const response = await fetch('php/api.php?action=create_application', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ course_name: courseName, start_date: startDate, payment_method: paymentMethod })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Заявка успешно отправлена! Администратор рассмотрит её в ближайшее время.');
                    form.reset();
                    // Сброс даты
                    if (dateInput) {
                        dateInput.value = '';
                    }
                } else {
                    alert(result.message);
                }
            } catch (error) {
                alert('Ошибка отправки заявки: ' + error.message);
            }
        });
    }
});