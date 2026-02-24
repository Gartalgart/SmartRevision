const { getPool, sql } = require('../config/db');

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

const folderController = {
    getAll: async (req, res) => {
        const { parent_id } = req.query;
        try {
            const pool = await getPool();
            const request = pool.request();
            let query = 'SELECT * FROM folders WHERE user_id = @user_id';
            request.input('user_id', sql.UniqueIdentifier, DEFAULT_USER_ID);

            if (parent_id === 'null' || !parent_id) {
                query += ' AND parent_id IS NULL';
            } else {
                query += ' AND parent_id = @parent_id';
                request.input('parent_id', sql.UniqueIdentifier, parent_id);
            }

            const result = await request.query(query + ' ORDER BY name ASC');
            res.json(result.recordset);
        } catch (err) {
            console.error('Erreur getFolders:', err);
            res.status(500).json({ error: 'Erreur récupération dossiers.' });
        }
    },

    create: async (req, res) => {
        const { name, parent_id } = req.body;
        if (!name) return res.status(400).json({ error: 'Nom du dossier requis' });

        try {
            const pool = await getPool();
            const result = await pool.request()
                .input('name', sql.NVarChar, name.trim())
                .input('parent_id', sql.UniqueIdentifier, parent_id || null)
                .input('user_id', sql.UniqueIdentifier, DEFAULT_USER_ID)
                .query(`
                    INSERT INTO folders (user_id, name, parent_id)
                    OUTPUT INSERTED.*
                    VALUES (@user_id, @name, @parent_id)
                `);
            res.status(201).json(result.recordset[0]);
        } catch (err) {
            console.error('Erreur createFolder:', err);
            res.status(500).json({ error: 'Erreur création dossier.' });
        }
    },

    delete: async (req, res) => {
        const { id } = req.params;
        try {
            const pool = await getPool();
            await pool.request()
                .input('id', sql.UniqueIdentifier, id)
                .query('DELETE FROM folders WHERE id = @id');
            res.status(204).send();
        } catch (err) {
            console.error('Erreur deleteFolder:', err);
            res.status(500).json({ error: 'Erreur suppression dossier.' });
        }
    },

    getPath: async (req, res) => {
        const { id } = req.params;
        try {
            const pool = await getPool();
            const path = [];
            let currentId = id;
            
            while (currentId) {
                const result = await pool.request()
                    .input('id', sql.UniqueIdentifier, currentId)
                    .query('SELECT * FROM folders WHERE id = @id');
                
                if (result.recordset.length === 0) break;
                const folder = result.recordset[0];
                path.unshift(folder);
                currentId = folder.parent_id;
                if (path.length > 10) break; // Sécurité anti-boucle infinie
            }
            res.json(path);
        } catch (err) {
            console.error('Erreur getPath:', err);
            res.status(500).json({ error: 'Erreur récupération chemin dossier.' });
        }
    }
};

module.exports = folderController;
