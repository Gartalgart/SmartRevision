import { supabase } from './supabase'

export type Folder = {
    id: string;
    user_id: string;
    parent_id: string | null;
    name: string;
    created_at: string;
}

export const FolderService = {
    async getFolders(parentId: string | null = null) {
        const { data: { user } } = await supabase.auth.getUser()
        const userId = user?.id || '00000000-0000-0000-0000-000000000000'

        let query = supabase
            .from('folders' as any)
            .select('*')
            .eq('user_id', userId)

        if (parentId === null) {
            query = query.is('parent_id', null)
        } else {
            query = query.eq('parent_id', parentId)
        }

        const { data, error } = await query.order('name', { ascending: true })
        if (error) throw error
        return data as Folder[]
    },

    async createFolder(name: string, parentId: string | null = null) {
        const { data: { user } } = await supabase.auth.getUser()
        const userId = user?.id || '00000000-0000-0000-0000-000000000000'

        const { data, error } = await supabase
            .from('folders' as any)
            .insert({
                name,
                parent_id: parentId,
                user_id: userId
            })
            .select()
            .single()

        if (error) throw error
        return data as Folder
    },

    async deleteFolder(id: string) {
        const { error } = await supabase
            .from('folders' as any)
            .delete()
            .eq('id', id)

        if (error) throw error
    },

    async getFolderPath(folderId: string): Promise<Folder[]> {
        const path: Folder[] = [];
        let currentId: string | null = folderId;

        while (currentId) {
            const { data, error }: any = await supabase
                .from('folders' as any)
                .select('*')
                .eq('id', currentId)
                .single();

            if (error || !data) break;
            path.unshift(data as Folder);
            currentId = data.parent_id;

            if (path.length > 10) break;
        }

        return path;
    }
}
