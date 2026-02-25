const { pool } = require('../config/db');

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

const folderController = {
    getAll: async (req, res) => {
        const { parent_id } = req.query;
        try {
            let query = 'SELECT * FROM folders WHERE user_id = $1';
            const params = [DEFAULT_USER_ID];

            if (parent_id === 'null' || !parent_id) {
                query += ' AND parent_id IS NULL';
            } else {
                query += ' AND parent_id = $2';
                params.push(parent_id);
            }

            const result = await pool.query(query + ' ORDER BY name ASC', params);
            res.json(result.rows);
        } catch (err) {
            console.error('Erreur getFolders:', err);
            res.status(500).json({ error: 'Erreur récupération dossiers.' });
        }
    },

    create: async (req, res) => {
        const { name, parent_id } = req.body;
        if (!name) return res.status(400).json({ error: 'Nom du dossier requis' });

        try {
            const result = await pool.query(`
                INSERT INTO folders (user_id, name, parent_id)
                VALUES ($1, $2, $3)
                RETURNING *
            `, [DEFAULT_USER_ID, name.trim(), parent_id || null]);
            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error('Erreur createFolder:', err);
            res.status(500).json({ error: 'Erreur création dossier.' });
        }
    },

    delete: async (req, res) => {
        const { id } = req.params;
        try {
            await pool.query('DELETE FROM folders WHERE id = $1', [id]);
            res.status(204).send();
        } catch (err) {
            console.error('Erreur deleteFolder:', err);
            res.status(500).json({ error: 'Erreur suppression dossier.' });
        }
    },

    getPath: async (req, res) => {
        const { id } = req.params;
        try {
            const path = [];
            let currentId = id;
            
            while (currentId) {
                const result = await pool.query('SELECT * FROM folders WHERE id = $1', [currentId]);
                
                if (result.rows.length === 0) break;
                const folder = result.rows[0];
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
