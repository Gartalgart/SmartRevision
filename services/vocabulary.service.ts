import { apiClient } from './api.client'

export type VocabularyItem = {
    id: string;
    user_id: string;
    english_word: string;
    french_translation: string;
    example_sentence: string | null;
    folder_id: string | null;
    created_at: string;
}

export type NewVocabularyItem = Omit<VocabularyItem, 'id' | 'user_id' | 'created_at'>;

export const VocabularyService = {
    async getAll(folderId: string | null = null) {
        const endpoint = folderId ? `/vocabulary?folder_id=${folderId}` : '/vocabulary';
        return apiClient.get(endpoint);
    },

    async getAllWords() {
        return apiClient.get('/vocabulary');
    },

    async add(item: NewVocabularyItem, folderId: string | null = null) {
        return apiClient.post('/vocabulary', { ...item, folder_id: folderId });
    },

    async delete(id: string) {
        return apiClient.delete(`/vocabulary/${id}`);
    },

    async importMany(items: NewVocabularyItem[], folderId: string | null = null) {
        return apiClient.post('/vocabulary/bulk', { items, folder_id: folderId });
    }
}
