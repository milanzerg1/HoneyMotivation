const TasksPage = {
    currentCategory: 'all',

    async load() {
        try {
            const tasks = await API.getTasks(this.currentCategory);
            this.render(tasks);
        } catch (error) {
            UI.showNotification(error.message, 'error');
        }
    },

    render(tasks) {
        const container = document.getElementById('tasks-list');

        if (tasks.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 40px;">Нет заданий в этой категории</p>';
            return;
        }

        container.innerHTML = tasks.map(task => `
            <div class="task-card">
                <span class="task-icon">${this.getCategoryIcon(task.category)}</span>
                <div class="task-info">
                    <div class="task-title">${task.title}</div>
                    <div class="task-meta">
                        <span class="task-reward">⭐ ${task.stars_reward}</span>
                        <span>•</span>
                        <span>✨ ${task.xp_reward} XP</span>
                    </div>
                </div>
                <button class="task-complete-btn" onclick="TasksPage.complete(${task.id})">
                    Выполнено
                </button>
            </div>
        `).join('');
    },

    getCategoryIcon(category) {
        const icons = {
            'daily': '📅',
            'weekly': '🗓️',
            'one_time': '🎯',
            'special': '✨'
        };
        return icons[category] || '✅';
    },

    async complete(taskId) {
        try {
            const result = await API.completeTask(taskId);
            UI.showNotification(`+${result.stars_earned.toFixed(1)} ⭐ и +${result.xp_earned.toFixed(1)} XP`, 'success');

            // Обновить профиль
            const profile = await API.getProfile();
            API.setUser(profile);
            UI.updateUserInfo(profile);

            // Перезагрузить задания
            await this.load();

            // Обновить прогресс уровня
            await DashboardPage.load();
        } catch (error) {
            UI.showNotification(error.message, 'error');
        }
    }
};

// Фильтры заданий
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#tasks .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#tasks .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            TasksPage.currentCategory = btn.dataset.category;
            TasksPage.load();
        });
    });
});