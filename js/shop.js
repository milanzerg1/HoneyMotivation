const ShopPage = {
    currentCategory: 'all',

    async load() {
        try {
            const items = await API.getShopItems(this.currentCategory);
            this.render(items);
        } catch (error) {
            UI.showNotification(error.message, 'error');
        }
    },

    render(items) {
        const container = document.getElementById('shop-list');
        const user = API.getUser();

        if (items.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 40px;">Нет товаров в этой категории</p>';
            return;
        }

        container.innerHTML = items.map(item => {
            const canAfford = user.stars >= item.stars_cost;
            return `
                <div class="shop-card">
                    <span class="shop-icon">${item.emoji || '🎁'}</span>
                    <div class="shop-info">
                        <div class="shop-title">${item.title}</div>
                        <div class="shop-meta">
                            <span class="shop-cost">⭐ ${item.stars_cost}</span>
                            ${item.description ? `<span>• ${item.description}</span>` : ''}
                        </div>
                    </div>
                    <button class="shop-buy-btn"
                            onclick="ShopPage.buy(${item.id})"
                            ${!canAfford ? 'disabled' : ''}>
                        ${canAfford ? 'Купить' : 'Мало ⭐'}
                    </button>
                </div>
            `;
        }).join('');
    },

    async buy(itemId) {
        try {
            const result = await API.buyItem(itemId);
            UI.showNotification('Покупка совершена! 🎉', 'success');

            // Обновить профиль
            const profile = await API.getProfile();
            API.setUser(profile);
            UI.updateUserInfo(profile);

            // Перезагрузить магазин
            await this.load();
        } catch (error) {
            UI.showNotification(error.message, 'error');
        }
    }
};

// Фильтры магазина
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#shop .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#shop .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            ShopPage.currentCategory = btn.dataset.category;
            ShopPage.load();
        });
    });
});