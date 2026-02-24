const { getPool, sql } = require('../config/db');
const { calculateSM2 } = require('../utils/sm2.logic');

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

const progressController = {
    getDueReviews: async (req, res) => {
        const { folder_id } = req.query;
        try {
            const pool = await getPool();
            const request = pool.request();
            let query = `
                SELECT v.*, p.easiness_factor, p.interval_days, p.repetitions, p.next_review_date, p.status
                FROM vocabulary_items v
                JOIN learning_progress p ON v.id = p.item_id
                WHERE p.next_review_date <= SYSDATETIMEOFFSET()
                ORDER BY p.next_review_date ASC
            `;
            if (folder_id) {
                query += ' AND v.folder_id = @folder_id';
                request.input('folder_id', sql.UniqueIdentifier, folder_id);
            }
            const result = await request.query(query);
            res.json(result.recordset);
        } catch (err) {
            console.error('Erreur getDueReviews:', err);
            res.status(500).json({ error: 'Erreur lors de la récupération des révisions.' });
        }
    },

    submitReview: async (req, res) => {
        const { item_id, difficulty } = req.body;
        if (!item_id || !difficulty) {
            return res.status(400).json({ error: 'item_id et difficulty requis' });
        }

        try {
            const pool = await getPool();
            
            // 1. Récupérer l'état actuel
            const currentResult = await pool.request()
                .input('item_id', sql.UniqueIdentifier, item_id)
                .query('SELECT * FROM learning_progress WHERE item_id = @item_id');
            
            if (currentResult.recordset.length === 0) {
                return res.status(404).json({ error: 'Progression non trouvée pour cet item' });
            }

            const current = currentResult.recordset[0];
            
            // 2. Calculer le nouvel état via la logique SM2 centralisée
            const next = calculateSM2(difficulty, {
                easinessFactor: current.easiness_factor,
                repetitions: current.repetitions,
                intervalDays: current.interval_days,
                status: current.status
            });

            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + next.intervalDays);

            const transaction = new sql.Transaction(pool);
            await transaction.begin();

            try {
                // 3. Mettre à jour la progression
                await transaction.request()
                    .input('item_id', sql.UniqueIdentifier, item_id)
                    .input('easiness_factor', sql.Float, next.easinessFactor)
                    .input('interval_days', sql.Int, next.intervalDays)
                    .input('repetitions', sql.Int, next.repetitions)
                    .input('status', sql.NVarChar, next.status)
                    .input('next_review_date', sql.DateTimeOffset, nextDate)
                    .input('last_review_date', sql.DateTimeOffset, new Date())
                    .input('is_correct', sql.Bit, difficulty !== 'incorrect')
                    .query(`
                        UPDATE learning_progress 
                        SET easiness_factor = @easiness_factor, 
                            interval_days = @interval_days, 
                            repetitions = @repetitions, 
                            status = @status, 
                            next_review_date = @next_review_date,
                            last_review_date = @last_review_date,
                            total_reviews = total_reviews + 1,
                            correct_reviews = CASE WHEN @is_correct = 1 THEN correct_reviews + 1 ELSE correct_reviews END,
                            updated_at = SYSDATETIMEOFFSET()
                        WHERE item_id = @item_id
                    `);

                // Mapping difficulté pour l'historique (0-5)
                let rating = 0;
                if (difficulty === 'hard') rating = 1;
                if (difficulty === 'medium') rating = 3;
                if (difficulty === 'easy') rating = 5;

                // 4. Enregistrer la session
                await transaction.request()
                    .input('user_id', sql.UniqueIdentifier, DEFAULT_USER_ID)
                    .input('item_id', sql.UniqueIdentifier, item_id)
                    .input('was_correct', sql.Bit, difficulty !== 'incorrect')
                    .input('difficulty_rating', sql.Int, rating)
                    .query(`
                        INSERT INTO review_sessions (user_id, item_id, was_correct, difficulty_rating)
                        VALUES (@user_id, @item_id, @was_correct, @difficulty_rating)
                    `);

                await transaction.commit();
                res.json({ success: true, next_review_date: nextDate });
            } catch (err) {
                await transaction.rollback();
                throw err;
            }
        } catch (err) {
            console.error('Erreur submitReview:', err);
            res.status(500).json({ error: 'Erreur lors de la soumission de la révision.' });
        }
    },

    getStats: async (req, res) => {
        try {
            const pool = await getPool();
            const result = await pool.request().query(`
                SELECT 
                    COUNT(*) as totalCount,
                    SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as newCount,
                    SUM(CASE WHEN status = 'learning' THEN 1 ELSE 0 END) as learningCount,
                    SUM(CASE WHEN status = 'review' THEN 1 ELSE 0 END) as reviewCount,
                    SUM(CASE WHEN status = 'mastered' THEN 1 ELSE 0 END) as masteredCount,
                    SUM(CASE WHEN next_review_date <= SYSDATETIMEOFFSET() THEN 1 ELSE 0 END) as dueCount
                FROM learning_progress
            `);
            const stats = result.recordset[0];
            res.json({
                totalCount: stats.totalCount || 0,
                dueCount: stats.dueCount || 0,
                learnedCount: stats.masteredCount || 0,
                breakdown: {
                    new: stats.newCount || 0,
                    learning: stats.learningCount || 0,
                    review: stats.reviewCount || 0,
                    mastered: stats.masteredCount || 0
                }
            });
        } catch (err) {
            console.error('Erreur getStats:', err);
            res.status(500).json({ error: 'Erreur serveur stats.' });
        }
    }
};

module.exports = progressController;
