import { apiClient } from './api.client'
import { Difficulty } from '@/utils/sm2'

export const ProgressService = {
    async getDueReviews(folderId: string | null = null) {
        const endpoint = folderId ? `/progress/due?folder_id=${folderId}` : '/progress/due';
        return apiClient.get(endpoint);
    },

    async getStats() {
        try {
            return await apiClient.get('/progress/stats');
        } catch (error) {
            console.error('Error fetching stats:', error);
            return { dueCount: 0, learnedCount: 0, totalCount: 0, breakdown: { new: 0, learning: 0, review: 0, mastered: 0 } };
        }
    },

    async submitReview(itemId: string, difficulty: Difficulty) {
        // La logique SM2 est maintenant gérée côté serveur pour plus de robustesse
        return apiClient.post('/progress/review', {
            item_id: itemId,
            difficulty: difficulty
        });
    }
}
