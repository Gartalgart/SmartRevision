// URL de production hardcodée pour éviter les problèmes de variables d'environnement lors du build natif
const API_URL = 'https://api.smartrevision.app/api';

export const apiClient = {
    async get(endpoint: string) {
        const response = await fetch(`${API_URL}${endpoint}`);
        if (!response.ok) throw new Error(`API GET Error: ${response.statusText}`);
        return response.json();
    },

    async post(endpoint: string, data: any) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`API POST Error: ${response.statusText}`);
        return response.json();
    },

    async delete(endpoint: string) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error(`API DELETE Error: ${response.statusText}`);
        return response.status === 204 ? null : response.json();
    },
};
