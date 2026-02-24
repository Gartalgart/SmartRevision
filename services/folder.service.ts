import { apiClient } from './api.client'

export type Folder = {
    id: string;
    user_id: string;
    parent_id: string | null;
    name: string;
    created_at: string;
}

export const FolderService = {
    async getFolders(parentId: string | null = null) {
        const endpoint = parentId ? `/folders?parent_id=${parentId}` : '/folders';
        return apiClient.get(endpoint);
    },

    async createFolder(name: string, parentId: string | null = null) {
        return apiClient.post('/folders', { name, parent_id: parentId });
    },

    async deleteFolder(id: string) {
        return apiClient.delete(`/folders/${id}`);
    },

    async getFolderPath(folderId: string): Promise<Folder[]> {
        return apiClient.get(`/folders/path/${folderId}`);
    }
}
