import { supabase } from './supabase'
import { Database } from '@/types/database.types'

export type VocabularyItem = Database['public']['Tables']['vocabulary_items']['Row']
export type NewVocabularyItem = Database['public']['Tables']['vocabulary_items']['Insert']

export const VocabularyService = {
    async getAll(folderId: string | null = null) {
        const { data: { user } } = await supabase.auth.getUser()
        const userId = user?.id || '00000000-0000-0000-0000-000000000000'

        let query = supabase
            .from('vocabulary_items')
            .select('*')
            .eq('user_id', userId)

        if (folderId === null) {
            query = query.is('folder_id', null)
        } else {
            query = query.eq('folder_id', folderId)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    async getAllWords() {
        const { data: { user } } = await supabase.auth.getUser()
        const userId = user?.id || '00000000-0000-0000-0000-000000000000'

        const { data, error } = await supabase
            .from('vocabulary_items')
            .select('*')
            .eq('user_id', userId)

        if (error) throw error
        return data as VocabularyItem[]
    },

    async add(item: Omit<NewVocabularyItem, 'user_id'>, folderId: string | null = null) {
        const { data: { user } } = await supabase.auth.getUser()
        const userId = user?.id || '00000000-0000-0000-0000-000000000000'

        // 1. Insert Vocabulary Item
        const { data, error } = await supabase
            .from('vocabulary_items')
            .insert({ ...item, user_id: userId, folder_id: folderId } as NewVocabularyItem)
            .select()
            .single()

        if (error) throw error

        // 2. Initialize Learning Progress
        const { error: progressError } = await supabase
            .from('learning_progress')
            .insert({
                user_id: userId,
                item_id: data.id,
                status: 'new',
                easiness_factor: 2.5,
                interval_days: 0,
                repetitions: 0
            })

        if (progressError) {
            console.error('Error creating progress for item:', data.id, progressError)
            // Potentially rollback vocab item?
        }

        return data
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('vocabulary_items')
            .delete()
            .eq('id', id)

        if (error) throw error
    },

    async importMany(items: Omit<NewVocabularyItem, 'user_id'>[], folderId: string | null = null) {
        const { data: { user } } = await supabase.auth.getUser()
        const userId = user?.id || '00000000-0000-0000-0000-000000000000'

        // 1. Bulk Insert Vocabulary Items
        const { data: insertedItems, error: itemsError } = await supabase
            .from('vocabulary_items')
            .insert(items.map(item => ({ ...item, user_id: userId, folder_id: folderId })))
            .select()

        if (itemsError) throw itemsError
        if (!insertedItems) return []

        // 2. Initialize Learning Progress for all items
        const progressRecords = insertedItems.map(item => ({
            user_id: userId,
            item_id: item.id,
            status: 'new' as const,
            easiness_factor: 2.5,
            interval_days: 0,
            repetitions: 0
        }))

        const { error: progressError } = await supabase
            .from('learning_progress')
            .insert(progressRecords)

        if (progressError) {
            console.error('Error creating progress for imported items:', progressError)
        }

        return insertedItems
    }
}
