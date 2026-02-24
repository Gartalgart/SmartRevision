const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
};

console.log('Tentative de connexion avec :', {
    user: config.user,
    server: config.server,
    database: config.database
});

sql.connect(config)
    .then(pool => {
        console.log('✅ SUCCÈS : Connecté à SQL Server !');
        return pool.request().query('SELECT 1 as test');
    })
    .then(result => {
        console.log('✅ REQUÊTE RÉUSSIE :', result.recordset);
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ ERREUR DE CONNEXION :', err.message);
        process.exit(1);
    });
