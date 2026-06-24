// Главная страница (дашборд)
const DashboardPage = {
    async load() {
        try {
            // Загрузить профиль
            const profile = await API.getProfile();
            API.setUser(profile);
            UI.updateUserInfo(profile);

            // Загрузить прогресс уровня
            await LevelsPage.load();

            // Загрузить стрик
            const streak = await API.getStreak();
            document.getElementById('current-streak').textContent = streak.current_streak;
            document.getElementById('longest-streak').textContent = streak.longest_streak;

            // Показать бонус стрика, если есть
            if (streak.current_streak >= 3) {
                document.getElementById('streak-bonus').classList.remove('hidden');
                const multipliers = {
                    3: 1.1, 7: 1.2, 14: 1.3, 30: 1.5, 60: 1.7, 100: 2.0
                };
                let multiplier = 1.0;
                for (const [days, mult] of Object.entries(multipliers)) {
                    if (streak.current_streak >= parseInt(days)) {
                        multiplier = mult;
                    }
                }
                document.getElementById('streak-multiplier').textContent = multiplier.toFixed(1);
            }
        } catch (error) {
            UI.showNotification(error.message, 'error');
        }
    }
};

// Страница истории
const HistoryPage = {
    async load() {
        try {
            const completions = await API.getCompletions(30);
            const purchases = await API.getPurchases();
            const profile = API.getUser();

            // Статистика
            document.getElementById('total-stars-earned').textContent = Math.floor(profile.xp);
            document.getElementById('total-tasks-completed').textContent = completions.length;
            document.getElementById('total-purchases').textContent = purchases.length;

            // История
            const history = [
                ...completions.map(c => ({
                    type: 'task',
                    title: `Задание выполнено`,
                    value: `+${c.stars_earned.toFixed(1)} ⭐`,
                    date: c.completed_at
                })),
                ...purchases.map(p => ({
                    type: 'purchase',
                    title: `Покупка`,
                    value: `-${p.stars_spent.toFixed(1)} ⭐`,
                    date: p.purchased_at
                }))
            ].sort((a, b) => new Date(b.date) - new Date(a.date));

            this.render(history);
        } catch (error) {
            UI.showNotification(error.message, 'error');
        }
    },

    render(history) {
        const container = document.getElementById('history-list');

        if (history.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 40px;">История пуста</p>';
            return;
        }

        container.innerHTML = history.slice(0, 50).map(item => `
            <div class="history-item">
                <div class="history-item-info">
                    <div class="history-item-title">${item.title}</div>
                    <div class="history-item-date">${UI.formatDate(item.date)}</div>
                </div>
                <div class="history-item-value">${item.value}</div>
            </div>
        `).join('');
    }
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', async () => {
    // Проверить авторизацию
    const token = API.getToken();
    if (!token) {
        UI.showLoginScreen();
        return;
    }

    try {
        // Загрузить профиль
        const profile = await API.getProfile();
        API.setUser(profile);
        UI.showMainScreen();
        UI.updateUserInfo(profile);

        // Загрузить дашборд
        await DashboardPage.load();
    } catch (error) {
        UI.showLoginScreen();
    }

    // Форма входа
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            await API.login(username, password);
            const profile = await API.getProfile();
            API.setUser(profile);
            UI.showMainScreen();
            UI.updateUserInfo(profile);
            await DashboardPage.load();
            UI.showNotification('Добро пожаловать! 🍯', 'success');
        } catch (error) {
            UI.showNotification(error.message, 'error');
        }
    });

    // Форма регистрации
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-password-confirm').value;

        if (password !== confirmPassword) {
            UI.showNotification('Пароли не совпадают', 'error');
            return;
        }

        try {
            await API.register(username, password);
            const profile = await API.getProfile();
            API.setUser(profile);
            UI.showMainScreen();
            UI.updateUserInfo(profile);
            await DashboardPage.load();
            UI.showNotification('Регистрация успешна! 🎉', 'success');
        } catch (error) {
            UI.showNotification(error.message, 'error');
        }
    });

    // Переключение форм
    document.getElementById('show-register').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
    });

    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
    });

    // Выход
    document.getElementById('logout-btn').addEventListener('click', () => {
        if (confirm('Выйти из аккаунта?')) {
            API.clearAuth();
            UI.showLoginScreen();
        }
    });
});