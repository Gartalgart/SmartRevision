import { Alert } from 'react-native';

// URL de production hardcodée
const API_URL = 'https://api.smartrevision.app/api';

const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'SmartRevisionMobile/1.0',
};

export const apiClient = {
    async get(endpoint: string) {
        const url = `${API_URL}${endpoint}`;
        try {
            const response = await fetch(url, { headers });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Status: ${response.status} - ${errorText || response.statusText}`);
            }
            return response.json();
        } catch (e: any) {
            console.error(`Fetch GET error for ${url}:`, e);
            throw e;
        }
    },

    async post(endpoint: string, data: any) {
        const url = `${API_URL}${endpoint}`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Status: ${response.status} - ${errorText || response.statusText}`);
            }
            return response.json();
        } catch (e: any) {
            console.error(`Fetch POST error for ${url}:`, e);
            throw e;
        }
    },

    async delete(endpoint: string) {
        const url = `${API_URL}${endpoint}`;
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers,
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Status: ${response.status} - ${errorText || response.statusText}`);
            }
            return response.status === 204 ? null : response.json();
        } catch (e: any) {
            console.error(`Fetch DELETE error for ${url}:`, e);
            throw e;
        }
    },
};
