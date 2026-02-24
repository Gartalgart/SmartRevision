const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_DATABASE,
    options: {
        encrypt: false, // true pour Azure, false pour local
        trustServerCertificate: true, // pour le dev local
        enableArithAbort: true
    },
    // Meilleures pratiques pour le pool
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Singleton pour le pool de connexion
let poolPromise = null;

const getPool = async () => {
    if (poolPromise) return poolPromise;

    try {
        poolPromise = await new sql.ConnectionPool(config).connect();
        console.log('✅ Base de données connectée (Pool)');
        return poolPromise;
    } catch (err) {
        console.error('❌ Échec connexion SQL :', err.message);
        poolPromise = null;
        throw err;
    }
};

module.exports = {
    sql,
    getPool
};
