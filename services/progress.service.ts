import { supabase } from './supabase'
import { calculateNextReview, Difficulty } from '@/utils/sm2'

export const ProgressService = {
    async getDueReviews(folderId: string | null = null) {
        const { data: { user } } = await supabase.auth.getUser()
        const userId = user?.id || '00000000-0000-0000-0000-000000000000'

        let query = supabase
            .from('vocabulary_items')
            .select(`
                *,
                learning_progress!inner(*)
            `)
            .eq('learning_progress.user_id', userId)
            .lte('learning_progress.next_review_date', new Date().toISOString())

        if (folderId) {
            // Pour faire du récursif sans RPC complexe, on récupère d'abord tous les IDs de dossiers enfants
            const allFolderIds = [folderId];

            // On récupère les enfants sur 3 niveaux de profondeur (suffisant pour la plupart des usages)
            const { data: level1 } = await supabase.from('folders' as any).select('id').eq('parent_id', folderId);
            if (level1) {
                const l1Ids = (level1 as any[]).map(f => f.id);
                allFolderIds.push(...l1Ids);

                const { data: level2 } = await supabase.from('folders' as any).select('id').in('parent_id', l1Ids);
                if (level2) {
                    const l2Ids = (level2 as any[]).map(f => f.id);
                    allFolderIds.push(...l2Ids);
                }
            }

            query = query.in('folder_id', allFolderIds);
        }

        const { data, error } = await query
            .order('next_review_date', { foreignTable: 'learning_progress', ascending: true })
            .limit(50)

        if (error) throw error

        return data.map(item => ({
            ...item,
            ...item.learning_progress[0]
        }))
    },

    async getStats() {
        const { data: { user } } = await supabase.auth.getUser()
        const userId = user?.id || '00000000-0000-0000-0000-000000000000'

        // On récupère tout en une fois pour éviter 10 requêtes
        // C'est acceptable tant que l'utilisateur n'a pas 10k mots.
        // Sinon, il faudrait créer une VIEW ou RPC en SQL.
        const { data: allProgress, error } = await supabase
            .from('learning_progress')
            .select('status, next_review_date')
            .eq('user_id', userId)

        if (error) {
            console.error('Error fetching stats:', error)
            return { dueCount: 0, learnedCount: 0, totalCount: 0, learningCount: 0, reviewCount: 0, newCount: 0, streak: 0 }
        }

        const now = new Date()

        const stats = {
            totalCount: 0,
            newCount: 0,
            learningCount: 0,
            reviewCount: 0,
            masteredCount: 0,
            dueCount: 0,
            streak: 0
        }

        // On compte côté client
        stats.totalCount = allProgress.length;

        allProgress.forEach(p => {
            if (p.status === 'new') stats.newCount++;
            else if (p.status === 'learning') stats.learningCount++;
            else if (p.status === 'review') stats.reviewCount++;
            else if (p.status === 'mastered') stats.masteredCount++;

            if (p.next_review_date && new Date(p.next_review_date) <= now) {
                stats.dueCount++;
            }
        });

        // Pour le total, on doit aussi compter les mots qui n'ont PAS encore de learning_progress ?
        // Dans notre logique actuelle, add() crée tout de suite un learning_progress.
        // Donc allProgress.length est correct pour le nombre de mots actifs.

        // Si on veut être sûr du vrai total (au cas où des imports ont échoué la création progress), on peut faire un count sur vocab items
        const { count: realTotal } = await supabase
            .from('vocabulary_items')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)

        if (realTotal !== null) stats.totalCount = realTotal;

        // On renvoie un objet plat compatible avec l'ancien + nouveaux champs
        return {
            dueCount: stats.dueCount,
            learnedCount: stats.masteredCount, // Alias pour compatibilité
            totalCount: stats.totalCount,
            streak: 0,
            breakdown: {
                new: stats.newCount,
                learning: stats.learningCount,
                review: stats.reviewCount,
                mastered: stats.masteredCount
            }
        }
    },

    async submitReview(itemId: string, difficulty: Difficulty) {
        const { data: { user } } = await supabase.auth.getUser()
        const userId = user?.id || '00000000-0000-0000-0000-000000000000'

        // 1. Get current progress
        const { data: progress, error: fetchError } = await supabase
            .from('learning_progress')
            .select('*')
            .eq('item_id', itemId)
            .single()

        if (fetchError) throw fetchError

        // 2. Calculate next state
        const next = calculateNextReview(difficulty, {
            easinessFactor: progress.easiness_factor,
            repetitions: progress.repetitions,
            intervalDays: progress.interval_days,
            status: progress.status as any
        })

        // 3. Update Progress
        const nextDate = new Date()
        nextDate.setDate(nextDate.getDate() + next.intervalDays)

        const { error: updateError } = await supabase
            .from('learning_progress')
            .update({
                easiness_factor: next.easinessFactor,
                interval_days: next.intervalDays,
                repetitions: next.repetitions,
                status: next.status,
                next_review_date: nextDate.toISOString(),
                last_review_date: new Date().toISOString(),
                total_reviews: progress.total_reviews + 1,
                correct_reviews: (difficulty !== 'incorrect') ? progress.correct_reviews + 1 : progress.correct_reviews,
                updated_at: new Date().toISOString()
            })
            .eq('id', progress.id)

        if (updateError) throw updateError

        // 4. Log Session
        // difficulty_rating mapping: incorrect=0, hard=1, medium=3, easy=5 (arbitrary scale 1-5)
        let rating = 0;
        if (difficulty === 'hard') rating = 1;
        if (difficulty === 'medium') rating = 3;
        if (difficulty === 'easy') rating = 5;

        await supabase.from('review_sessions').insert({
            user_id: userId,
            item_id: itemId,
            was_correct: difficulty !== 'incorrect',
            difficulty_rating: difficulty === 'incorrect' ? null : rating
        })
    }
}
