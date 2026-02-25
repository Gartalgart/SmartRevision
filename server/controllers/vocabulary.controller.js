const { pool } = require('../config/db');

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

const vocabularyController = {
    // Récupérer tout ou recherche
    getAll: async (req, res) => {
        try {
            const { search, folder_id } = req.query;
            let query = 'SELECT * FROM vocabulary_items WHERE user_id = $1';
            const params = [DEFAULT_USER_ID];
            let paramIndex = 2;

            if (folder_id) {
                query += ` AND folder_id = $${paramIndex++}`;
                params.push(folder_id);
            }

            if (search) {
                query += ` AND (english_word ILIKE $${paramIndex} OR french_translation ILIKE $${paramIndex})`;
                params.push(`%${search}%`);
                paramIndex++;
            }

            query += ' ORDER BY created_at DESC';

            const result = await pool.query(query, params);
            res.json(result.rows);
        } catch (err) {
            console.error('Erreur getAll vocabulary:', err);
            res.status(500).json({ error: 'Erreur serveur lors de la récupération des mots.' });
        }
    },

    // Ajouter un mot
    create: async (req, res) => {
        const { english_word, french_translation, example_sentence, folder_id } = req.body;

        if (!english_word || !french_translation) {
            return res.status(400).json({ error: 'Les champs mot anglais et traduction sont requis.' });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Insérer le mot
            const insertQuery = `
                INSERT INTO vocabulary_items (user_id, english_word, french_translation, example_sentence, folder_id)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;
            const insertResult = await client.query(insertQuery, [
                DEFAULT_USER_ID,
                english_word.trim(),
                french_translation.trim(),
                example_sentence ? example_sentence.trim() : null,
                folder_id || null
            ]);

            const newItem = insertResult.rows[0];

            // 2. Créer la progression initiale
            await client.query(`
                INSERT INTO learning_progress (user_id, item_id, status, easiness_factor, interval_days, repetitions)
                VALUES ($1, $2, 'new', 2.5, 0, 0)
            `, [DEFAULT_USER_ID, newItem.id]);

            await client.query('COMMIT');
            res.status(201).json(newItem);
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Erreur create vocabulary:', err);
            res.status(500).json({ error: 'Erreur lors de la création du mot.' });
        } finally {
            client.release();
        }
    },

    // Importation massive
    bulkCreate: async (req, res) => {
        const { items, folder_id } = req.body;
        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ error: 'Liste de mots invalide.' });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const results = [];
            for (const item of items) {
                const insertResult = await client.query(`
                    INSERT INTO vocabulary_items (user_id, english_word, french_translation, example_sentence, folder_id)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING *
                `, [
                    DEFAULT_USER_ID,
                    item.english_word.trim(),
                    item.french_translation.trim(),
                    item.example_sentence ? item.example_sentence.trim() : null,
                    folder_id || null
                ]);
                
                const newItem = insertResult.rows[0];
                
                await client.query(`
                    INSERT INTO learning_progress (user_id, item_id, status, easiness_factor, interval_days, repetitions)
                    VALUES ($1, $2, 'new', 2.5, 0, 0)
                `, [DEFAULT_USER_ID, newItem.id]);
                
                results.push(newItem);
            }

            await client.query('COMMIT');
            res.status(201).json(results);
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Erreur bulkCreate vocabulary:', err);
            res.status(500).json({ error: 'Erreur lors de l\'importation massive.' });
        } finally {
            client.release();
        }
    },

    // Mettre à jour un mot
    update: async (req, res) => {
        const { id } = req.params;
        const { english_word, french_translation, example_sentence } = req.body;

        try {
            const result = await pool.query(`
                UPDATE vocabulary_items 
                SET english_word = $1, 
                    french_translation = $2, 
                    example_sentence = $3,
                    updated_at = NOW()
                WHERE id = $4
            `, [
                english_word.trim(),
                french_translation.trim(),
                example_sentence ? example_sentence.trim() : null,
                id
            ]);
            
            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Mot non trouvé.' });
            }

            res.json({ id, english_word, french_translation, example_sentence });
        } catch (err) {
            console.error('Erreur update vocabulary:', err);
            res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
        }
    },

    // Supprimer un mot
    delete: async (req, res) => {
        const { id } = req.params;
        try {
            await pool.query('DELETE FROM vocabulary_items WHERE id = $1', [id]);
            res.status(204).send();
        } catch (err) {
            console.error('Erreur delete vocabulary:', err);
            res.status(500).json({ error: 'Erreur lors de la suppression.' });
        }
    }
};

module.exports = vocabularyController;
