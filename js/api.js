const tg = window.Telegram ? window.Telegram.WebApp : null;

const API = {
    _initData() {
        return tg ? tg.initData : '';
    },

    async request(method, path, body = null) {
        const base = CONFIG.API_BASE_URL.replace(/\/$/, '');
        if (!base) throw new Error('API_BASE_URL not configured');

        const opts = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-Telegram-Init-Data': this._initData(),
            },
        };
        if (body !== null) opts.body = JSON.stringify(body);

        const res = await fetch(base + path, opts);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            throw new Error(data.error || data.detail || `HTTP ${res.status}`);
        }
        return data;
    },

    // User
    getUser() {
        return this.request('GET', '/api/user');
    },

    // Routes
    getRoutes() {
        return this.request('GET', '/api/routes');
    },
    createRoute(data) {
        return this.request('POST', '/api/routes', data);
    },
    updateRoute(id, data) {
        return this.request('PATCH', `/api/routes/${id}`, data);
    },
    deleteRoute(id) {
        return this.request('DELETE', `/api/routes/${id}`);
    },

    // Check
    checkRoute(id) {
        return this.request('POST', `/api/routes/${id}/check`);
    },
    checkAll() {
        return this.request('POST', '/api/check-all');
    },

    // Settings
    updateSettings(data) {
        return this.request('PATCH', '/api/settings', data);
    },

    // Stations
    searchStations(query, lang) {
        const q = encodeURIComponent(query);
        return this.request('GET', `/api/stations?q=${q}&lang=${lang}`);
    },
};
