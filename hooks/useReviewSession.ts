import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ProgressService } from '@/services/progress.service'
import { Difficulty } from '@/utils/sm2'

export const useReviewSession = (folderId: string | null = null) => {
    const queryClient = useQueryClient()

    const statsQuery = useQuery({
        queryKey: ['stats'],
        queryFn: ProgressService.getStats
    })

    const dueReviewsQuery = useQuery({
        queryKey: ['due-reviews', folderId],
        queryFn: () => ProgressService.getDueReviews(folderId),
    })

    const allWordsQuery = useQuery({
        queryKey: ['all-vocabulary'],
        queryFn: () => require('@/services/vocabulary.service').VocabularyService.getAllWords(),
    })

    const submitReviewMutation = useMutation({
        mutationFn: ({ itemId, difficulty }: { itemId: string, difficulty: Difficulty }) =>
            ProgressService.submitReview(itemId, difficulty),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stats'] })
            queryClient.invalidateQueries({ queryKey: ['due-reviews', folderId] })
        }
    })

    return {
        stats: statsQuery.data,
        isLoadingStats: statsQuery.isLoading,
        dueReviews: dueReviewsQuery.data,
        allWords: allWordsQuery.data,
        isLoadingReviews: dueReviewsQuery.isLoading || allWordsQuery.isLoading,
        refetchReviews: dueReviewsQuery.refetch,
        submitReview: submitReviewMutation.mutateAsync
    }
}
