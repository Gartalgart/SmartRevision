const { pool } = require('../config/db');
const { calculateSM2 } = require('../utils/sm2.logic');

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

const progressController = {
    getDueReviews: async (req, res) => {
        const { folder_id } = req.query;
        try {
            let query = `
                SELECT v.*, p.easiness_factor, p.interval_days, p.repetitions, p.next_review_date, p.status
                FROM vocabulary_items v
                JOIN learning_progress p ON v.id = p.item_id
                WHERE p.next_review_date <= NOW()
            `;
            const params = [];

            if (folder_id) {
                query += ' AND v.folder_id = $1';
                params.push(folder_id);
            }

            query += ' ORDER BY p.next_review_date ASC';
            
            const result = await pool.query(query, params);
            res.json(result.rows);
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

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // 1. Récupérer l'état actuel
            const currentResult = await client.query(
                'SELECT * FROM learning_progress WHERE item_id = $1',
                [item_id]
            );
            
            if (currentResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Progression non trouvée pour cet item' });
            }

            const current = currentResult.rows[0];
            
            // 2. Calculer le nouvel état via la logique SM2 centralisée
            const next = calculateSM2(difficulty, {
                easinessFactor: parseFloat(current.easiness_factor),
                repetitions: parseInt(current.repetitions),
                intervalDays: parseInt(current.interval_days),
                status: current.status
            });

            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + next.intervalDays);

            // 3. Mettre à jour la progression
            const isCorrect = difficulty !== 'incorrect';
            await client.query(`
                UPDATE learning_progress 
                SET easiness_factor = $1, 
                    interval_days = $2, 
                    repetitions = $3, 
                    status = $4, 
                    next_review_date = $5,
                    last_review_date = NOW(),
                    total_reviews = total_reviews + 1,
                    correct_reviews = CASE WHEN $6 = true THEN correct_reviews + 1 ELSE correct_reviews END,
                    updated_at = NOW()
                WHERE item_id = $7
            `, [
                next.easinessFactor,
                next.intervalDays,
                next.repetitions,
                next.status,
                nextDate,
                isCorrect,
                item_id
            ]);

            // Mapping difficulté pour l'historique (0-5)
            let rating = 0;
            if (difficulty === 'hard') rating = 1;
            if (difficulty === 'medium') rating = 3;
            if (difficulty === 'easy') rating = 5;

            // 4. Enregistrer la session
            await client.query(`
                INSERT INTO review_sessions (user_id, item_id, was_correct, difficulty_rating)
                VALUES ($1, $2, $3, $4)
            `, [DEFAULT_USER_ID, item_id, isCorrect, rating]);

            await client.query('COMMIT');
            res.json({ success: true, next_review_date: nextDate });
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Erreur submitReview:', err);
            res.status(500).json({ error: 'Erreur lors de la soumission de la révision.' });
        } finally {
            client.release();
        }
    },

    getStats: async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT 
                    COUNT(*) as "totalCount",
                    SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as "newCount",
                    SUM(CASE WHEN status = 'learning' THEN 1 ELSE 0 END) as "learningCount",
                    SUM(CASE WHEN status = 'review' THEN 1 ELSE 0 END) as "reviewCount",
                    SUM(CASE WHEN status = 'mastered' THEN 1 ELSE 0 END) as "masteredCount",
                    SUM(CASE WHEN next_review_date <= NOW() THEN 1 ELSE 0 END) as "dueCount"
                FROM learning_progress
            `);
            const stats = result.rows[0];
            res.json({
                totalCount: parseInt(stats.totalCount) || 0,
                dueCount: parseInt(stats.dueCount) || 0,
                learnedCount: parseInt(stats.masteredCount) || 0,
                breakdown: {
                    new: parseInt(stats.newCount) || 0,
                    learning: parseInt(stats.learningCount) || 0,
                    review: parseInt(stats.reviewCount) || 0,
                    mastered: parseInt(stats.masteredCount) || 0
                }
            });
        } catch (err) {
            console.error('Erreur getStats:', err);
            res.status(500).json({ error: 'Erreur serveur stats.' });
        }
    }
};

module.exports = progressController;
