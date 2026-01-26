import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { VocabularyService, NewVocabularyItem } from '@/services/vocabulary.service'

export const useVocabulary = (folderId: string | null = null) => {
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: ['vocabulary', folderId],
        queryFn: () => VocabularyService.getAll(folderId)
    })

    const addMutation = useMutation({
        mutationFn: ({ item, folderId: targetFolderId }: { item: Omit<NewVocabularyItem, 'user_id'>, folderId: string | null }) =>
            VocabularyService.add(item, targetFolderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vocabulary', folderId] })
            queryClient.invalidateQueries({ queryKey: ['stats'] })
        }
    })

    const deleteMutation = useMutation({
        mutationFn: VocabularyService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vocabulary', folderId] })
            queryClient.invalidateQueries({ queryKey: ['stats'] })
        }
    })

    return {
        vocabulary: query.data,
        isLoading: query.isLoading,
        error: query.error,
        addWord: (item: Omit<NewVocabularyItem, 'user_id'>) => addMutation.mutateAsync({ item, folderId }),
        deleteWord: deleteMutation.mutateAsync,
        isAdding: addMutation.isPending
    }
}
