const LevelsPage = {
    async load() {
        try {
            const progress = await API.getLevelProgress();
            this.render(progress);
        } catch (error) {
            console.error('Error loading levels:', error);
        }
    },

    render(progress) {
        const { current_level, next_level, xp_to_next, xp_in_current_level, progress_percent, is_max_level } = progress;

        document.getElementById('current-level-emoji').textContent = current_level.emoji;
        document.getElementById('current-level-name').textContent = current_level.name;
        document.getElementById('level-description').textContent = current_level.description;

        if (is_max_level) {
            document.getElementById('level-progress-text').textContent = 'Максимальный уровень!';
            document.getElementById('level-progress-bar').style.width = '100%';
        } else {
            document.getElementById('level-progress-text').textContent =
                `${Math.floor(xp_in_current_level)} / ${xp_to_next} XP`;
            document.getElementById('level-progress-bar').style.width = `${progress_percent}%`;
        }
    }
};