const { getPool, sql } = require('../config/db');

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

const vocabularyController = {
    // Récupérer tout ou recherche
    getAll: async (req, res) => {
        try {
            const pool = await getPool();
            const { search, folder_id } = req.query;

            let query = `
                SELECT * FROM vocabulary_items 
                WHERE user_id = @user_id
            `;

            const request = pool.request()
                .input('user_id', sql.UniqueIdentifier, DEFAULT_USER_ID);

            if (folder_id) {
                query += ' AND folder_id = @folder_id';
                request.input('folder_id', sql.UniqueIdentifier, folder_id);
            }

            if (search) {
                query += ' AND (english_word LIKE @search OR french_translation LIKE @search)';
                request.input('search', sql.NVarChar, `%${search}%`);
            }

            query += ' ORDER BY created_at DESC';

            const result = await request.query(query);
            res.json(result.recordset);
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

        try {
            const pool = await getPool();
            const transaction = new sql.Transaction(pool);
            await transaction.begin();

            try {
                // 1. Insérer le mot
                const insertResult = await transaction.request()
                    .input('user_id', sql.UniqueIdentifier, DEFAULT_USER_ID)
                    .input('english_word', sql.NVarChar, english_word.trim())
                    .input('french_translation', sql.NVarChar, french_translation.trim())
                    .input('example_sentence', sql.NVarChar, example_sentence ? example_sentence.trim() : null)
                    .input('folder_id', sql.UniqueIdentifier, folder_id || null)
                    .query(`
                        INSERT INTO vocabulary_items (user_id, english_word, french_translation, example_sentence, folder_id)
                        OUTPUT INSERTED.*
                        VALUES (@user_id, @english_word, @french_translation, @example_sentence, @folder_id)
                    `);

                const newItem = insertResult.recordset[0];

                // 2. Créer la progression initiale
                await transaction.request()
                    .input('user_id', sql.UniqueIdentifier, DEFAULT_USER_ID)
                    .input('item_id', sql.UniqueIdentifier, newItem.id)
                    .query(`
                        INSERT INTO learning_progress (user_id, item_id, status, easiness_factor, interval_days, repetitions)
                        VALUES (@user_id, @item_id, 'new', 2.5, 0, 0)
                    `);

                await transaction.commit();
                res.status(201).json(newItem);
            } catch (err) {
                await transaction.rollback();
                throw err;
            }
        } catch (err) {
            console.error('Erreur create vocabulary:', err);
            res.status(500).json({ error: 'Erreur lors de la création du mot.' });
        }
    },

    // Importation massive (Optimisée)
    bulkCreate: async (req, res) => {
        const { items, folder_id } = req.body;
        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ error: 'Liste de mots invalide.' });
        }

        try {
            const pool = await getPool();
            const transaction = new sql.Transaction(pool);
            await transaction.begin();

            try {
                const results = [];
                for (const item of items) {
                    const insertResult = await transaction.request()
                        .input('user_id', sql.UniqueIdentifier, DEFAULT_USER_ID)
                        .input('english_word', sql.NVarChar, item.english_word.trim())
                        .input('french_translation', sql.NVarChar, item.french_translation.trim())
                        .input('example_sentence', sql.NVarChar, item.example_sentence ? item.example_sentence.trim() : null)
                        .input('folder_id', sql.UniqueIdentifier, folder_id || null)
                        .query(`
                            INSERT INTO vocabulary_items (user_id, english_word, french_translation, example_sentence, folder_id)
                            OUTPUT INSERTED.*
                            VALUES (@user_id, @english_word, @french_translation, @example_sentence, @folder_id)
                        `);
                    
                    const newItem = insertResult.recordset[0];
                    
                    await transaction.request()
                        .input('user_id', sql.UniqueIdentifier, DEFAULT_USER_ID)
                        .input('item_id', sql.UniqueIdentifier, newItem.id)
                        .query(`
                            INSERT INTO learning_progress (user_id, item_id, status, easiness_factor, interval_days, repetitions)
                            VALUES (@user_id, @item_id, 'new', 2.5, 0, 0)
                        `);
                    
                    results.push(newItem);
                }

                await transaction.commit();
                res.status(201).json(results);
            } catch (err) {
                await transaction.rollback();
                throw err;
            }
        } catch (err) {
            console.error('Erreur bulkCreate vocabulary:', err);
            res.status(500).json({ error: 'Erreur lors de l\'importation massive.' });
        }
    },

    // Mettre à jour un mot (Nouvelle fonctionnalité)
    update: async (req, res) => {
        const { id } = req.params;
        const { english_word, french_translation, example_sentence } = req.body;

        try {
            const pool = await getPool();
            const result = await pool.request()
                .input('id', sql.UniqueIdentifier, id)
                .input('english_word', sql.NVarChar, english_word.trim())
                .input('french_translation', sql.NVarChar, french_translation.trim())
                .input('example_sentence', sql.NVarChar, example_sentence ? example_sentence.trim() : null)
                .query(`
                    UPDATE vocabulary_items 
                    SET english_word = @english_word, 
                        french_translation = @french_translation, 
                        example_sentence = @example_sentence
                    WHERE id = @id
                `);
            
            if (result.rowsAffected[0] === 0) {
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
            const pool = await getPool();
            await pool.request()
                .input('id', sql.UniqueIdentifier, id)
                .query('DELETE FROM vocabulary_items WHERE id = @id');
            res.status(204).send();
        } catch (err) {
            console.error('Erreur delete vocabulary:', err);
            res.status(500).json({ error: 'Erreur lors de la suppression.' });
        }
    }
};

module.exports = vocabularyController;
