const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

console.log('Tentative de connexion PostgreSQL avec :', {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
});

pool.query('SELECT NOW() as test')
    .then(result => {
        console.log('✅ SUCCÈS : Connecté à PostgreSQL !');
        console.log('✅ REQUÊTE RÉUSSIE (Heure du serveur) :', result.rows[0].test);
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ ERREUR DE CONNEXION :', err.message);
        process.exit(1);
    });
