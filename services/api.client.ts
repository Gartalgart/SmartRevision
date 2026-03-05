import { Alert } from 'react-native';

// URL de secours via IP directe car le certificat SSL de api.smartrevision.app est invalide (chaîne de certifs incomplète)
// Une fois le SSL corrigé (utiliser fullchain.pem sur le serveur), repassez en HTTPS.
const API_URL = 'http://161.35.171.157:3000/api';

const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
};

export const apiClient = {
    async get(endpoint: string) {
        // Garantir qu'il n'y a pas de double slash
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const url = `${API_URL}${cleanEndpoint}`;
        try {
            console.log(`[API] GET attempting: ${url}`);
            const response = await fetch(url, { headers });

            if (!response.ok) {
                const errorText = await response.text();
                const msg = `Erreur GET ${response.status}: ${errorText || response.statusText}`;
                console.warn(`[API] ${msg}`);
                // On n'affiche l'alerte que si ce n'est pas un 404 (pour éviter de polluer si c'est juste un dossier vide)
                if (response.status !== 404) {
                    Alert.alert("Erreur Serveur", msg);
                }
                throw new Error(msg);
            }
            const data = await response.json();
            console.log(`[API] GET Success: ${cleanEndpoint}`, Array.isArray(data) ? `${data.length} items` : 'Object received');
            return data;
        } catch (e: any) {
            console.error(`[API] Network Error (GET) for ${url}:`, e);
            Alert.alert("Erreur Réseau", `Impossible de joindre le serveur: ${e.message}\nURL: ${url}`);
            throw e;
        }
    },

    async post(endpoint: string, data: any) {
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const url = `${API_URL}${cleanEndpoint}`;
        try {
            console.log(`[API] POST attempting: ${url}`, data);
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorText = await response.text();
                const msg = `Erreur POST ${response.status}: ${errorText || response.statusText}`;
                console.warn(`[API] ${msg}`);
                Alert.alert("Erreur Serveur", msg);
                throw new Error(msg);
            }
            const result = await response.json();
            console.log(`[API] POST Success: ${cleanEndpoint}`);
            return result;
        } catch (e: any) {
            console.error(`[API] Network Error (POST) for ${url}:`, e);
            Alert.alert("Erreur Réseau", `Échec de l'envoi: ${e.message}`);
            throw e;
        }
    },

    async delete(endpoint: string) {
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const url = `${API_URL}${cleanEndpoint}`;
        try {
            console.log(`[API] DELETE attempting: ${url}`);
            const response = await fetch(url, {
                method: 'DELETE',
                headers,
            });

            if (!response.ok) {
                const errorText = await response.text();
                const msg = `Erreur DELETE ${response.status}: ${errorText || response.statusText}`;
                console.warn(`[API] ${msg}`);
                Alert.alert("Erreur Serveur", msg);
                throw new Error(msg);
            }
            console.log(`[API] DELETE Success: ${cleanEndpoint}`);
            return response.status === 204 ? null : response.json();
        } catch (e: any) {
            console.error(`[API] Network Error (DELETE) for ${url}:`, e);
            Alert.alert("Erreur Réseau", `Échec de la suppression: ${e.message}`);
            throw e;
        }
    },
};
