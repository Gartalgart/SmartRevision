const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

/**
 * Configuration de la base de données PostgreSQL
 * Supporte soit une DATABASE_URL complète, soit des variables individuelles
 */
const poolConfig = process.env.DATABASE_URL 
    ? { connectionString: process.env.DATABASE_URL }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT || '5432'),
    };

// Configuration SSL (indispensable pour Supabase/DigitalOcean en production)
if (process.env.DB_SSL === 'true') {
    poolConfig.ssl = {
        rejectUnauthorized: false
    };
}

const pool = new Pool(poolConfig);

// Événement d'erreur sur le pool pour éviter les crashs en cas de perte de connexion
pool.on('error', (err) => {
    console.error('⚠️ Erreur inattendue sur le pool PostgreSQL :', err);
});

// Test de connexion initial
pool.connect()
    .then(client => {
        console.log('✅ Base de données PostgreSQL connectée');
        client.release();
    })
    .catch(err => {
        console.error('❌ Échec connexion PostgreSQL :', err.stack);
    });

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
