class APIService {
    static BASE_URL = 'http://localhost:3001';

    static async login(email, password) {
        return this._post('/api/login', { email, password });
    }

    static async register(data) {
        return this._post('/api/register', data);
    }

    static async getAllRooms() {
        return this._get('/api/rooms');
    }

    static async getRoomsByFilter(status = '', tipo = '') {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (tipo) params.append('tipo', tipo);
        const query = params.toString() ? `?${params.toString()}` : '';
        return this._get(`/api/rooms${query}`);
    }

    static async createRoom(data) {
        return this._post('/api/rooms', data);
    }

    static async updateRoomStatus(numero, status) {
        return this._put(`/api/rooms/${numero}`, { status });
    }

    static async createClient(data) {
        return this._post('/api/clients', data);
    }

    static async getAllClients() {
        return this._get('/api/clients');
    }

    static async createPrice(data) {
        return this._post('/api/prices', data);
    }

    static async createReservation(data) {
        return this._post('/api/reservations', data);
    }

    static async getAllReservations() {
        return this._get('/api/reservations');
    }

    static async _get(endpoint) {
        return this._request(endpoint, { method: 'GET' });
    }

    static async _post(endpoint, data) {
        return this._request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async _put(endpoint, data) {
        return this._request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async _request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                ...options
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    ok: false,
                    error: data.message || 'Erro na requisição',
                    data: data
                };
            }

            if (data.ok !== undefined && data.data !== undefined) {
                return data;}

            return {
                ok: true,
                data: data,
                error: null
            };

        } catch (error) {
            return {
                ok: false,
                error: error.message || 'Erro de conexão com o servidor',
                data: null
            };
        }
    }
}
