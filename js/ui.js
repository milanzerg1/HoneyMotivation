// UI утилиты
const UI = {
    // Показать уведомление
    showNotification(message, type = 'info') {
        const container = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span>${message}</span>
        `;
        container.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    // Показать модальное окно
    showModal(content) {
        const overlay = document.getElementById('modal-overlay');
        const modalContent = document.getElementById('modal-content');
        modalContent.innerHTML = content;
        overlay.classList.remove('hidden');
    },

    // Скрыть модальное окно
    hideModal() {
        const overlay = document.getElementById('modal-overlay');
        overlay.classList.add('hidden');
    },

    // Переключить страницу
    switchPage(pageId) {
        // Убрать active у всех страниц
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Убрать active у всех кнопок навигации
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Активировать нужную страницу
        const page = document.getElementById(pageId);
        if (page) {
            page.classList.add('active');
        }

        // Активировать кнопку навигации
        const navBtn = document.querySelector(`.nav-btn[data-page="${pageId}"]`);
        if (navBtn) {
            navBtn.classList.add('active');
        }

        // Загрузить данные для страницы
        if (pageId === 'tasks') {
            TasksPage.load();
        } else if (pageId === 'shop') {
            ShopPage.load();
        } else if (pageId === 'history') {
            HistoryPage.load();
        }
    },

    // Показать экран входа
    showLoginScreen() {
        document.getElementById('login-screen').classList.add('active');
        document.getElementById('main-screen').classList.remove('active');
    },

    // Показать главный экран
    showMainScreen() {
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('main-screen').classList.add('active');
    },

    // Обновить информацию о пользователе в шапке
    updateUserInfo(user) {
        document.getElementById('user-stars').textContent = `⭐ ${Math.floor(user.stars)}`;
        document.getElementById('user-level').textContent = `Ур. ${user.level}`;
        document.getElementById('user-name').textContent = user.display_name || user.username;
    },

    // Форматировать дату
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'только что';
        if (minutes < 60) return `${minutes} мин. назад`;
        if (hours < 24) return `${hours} ч. назад`;
        if (days < 7) return `${days} дн. назад`;

        return date.toLocaleDateString('ru-RU');
    }
};

// Инициализация UI
document.addEventListener('DOMContentLoaded', () => {
    // Закрытие модального окна
    document.querySelector('.modal-close')?.addEventListener('click', () => {
        UI.hideModal();
    });

    document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
        if (e.target.id === 'modal-overlay') {
            UI.hideModal();
        }
    });

    // Навигация
    document.querySelectorAll('.nav-btn, .action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            if (page) {
                UI.switchPage(page);
            }
        });
    });
});