// Конфигурация API
const API_CONFIG = {
    BASE_URL: 'http://138.16.177.245:8000',
    TOKEN_KEY: 'honey_token',
    USER_KEY: 'honey_user'
};

// Класс для работы с API
class API {
    static getToken() {
        return localStorage.getItem(API_CONFIG.TOKEN_KEY);
    }

    static setToken(token) {
        localStorage.setItem(API_CONFIG.TOKEN_KEY, token);
    }

    static getUser() {
        const user = localStorage.getItem(API_CONFIG.USER_KEY);
        return user ? JSON.parse(user) : null;
    }

    static setUser(user) {
        localStorage.setItem(API_CONFIG.USER_KEY, JSON.stringify(user));
    }

    static clearAuth() {
        localStorage.removeItem(API_CONFIG.TOKEN_KEY);
        localStorage.removeItem(API_CONFIG.USER_KEY);
    }

    static async request(endpoint, options = {}) {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
                ...options,
                headers
            });

            if (response.status === 401) {
                this.clearAuth();
                window.location.reload();
                throw new Error('Сессия истекла');
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Ошибка запроса');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth
    static async login(username, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        this.setToken(data.access_token);
        return data;
    }

    static async register(username, password, role = 'user') {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password, role })
        });
        this.setToken(data.access_token);
        return data;
    }

    // User
    static async getProfile() {
        return await this.request('/user/profile');
    }

    static async updateProfile(userData) {
        return await this.request('/user/profile', {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    static async getLevelInfo() {
        return await this.request('/user/level');
    }

    static async getLevelProgress() {
        return await this.request('/user/level/progress');
    }

    static async getStreak() {
        return await this.request('/user/streak');
    }

    static async getDailyStats(days = 7) {
        return await this.request(`/user/stats/daily?days=${days}`);
    }

    // Tasks
    static async getTasks(category = null) {
        const url = category && category !== 'all'
            ? `/tasks/?category=${category}`
            : '/tasks/';
        return await this.request(url);
    }

    static async completeTask(taskId) {
        return await this.request(`/tasks/${taskId}/complete`, {
            method: 'POST'
        });
    }

    static async getCompletions(days = 7) {
        return await this.request(`/tasks/completions?days=${days}`);
    }

    // Shop
    static async getShopItems(category = null) {
        const url = category && category !== 'all'
            ? `/shop/?category=${category}`
            : '/shop/';
        return await this.request(url);
    }

    static async buyItem(shopItemId) {
        return await this.request('/shop/buy', {
            method: 'POST',
            body: JSON.stringify({ shop_item_id: shopItemId })
        });
    }

    static async getPurchases() {
        return await this.request('/shop/purchases');
    }
}