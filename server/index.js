const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Imports des contrôleurs
const vocabularyController = require('./controllers/vocabulary.controller');
const progressController = require('./controllers/progress.controller');
const folderController = require('./controllers/folders.controller');

const app = express();
app.use(cors());
app.use(express.json());

// --- ROUTES VOCABULAIRE ---
app.get('/api/vocabulary', vocabularyController.getAll);
app.post('/api/vocabulary', vocabularyController.create);
app.post('/api/vocabulary/bulk', vocabularyController.bulkCreate); // Nouvelle route bulk
app.put('/api/vocabulary/:id', vocabularyController.update);
app.delete('/api/vocabulary/:id', vocabularyController.delete);

// --- ROUTES PROGRESSION ---
app.get('/api/progress/due', progressController.getDueReviews);
app.get('/api/progress/stats', progressController.getStats);
app.post('/api/progress/review', progressController.submitReview);

// --- ROUTES DOSSIERS ---
app.get('/api/folders', folderController.getAll);
app.post('/api/folders', folderController.create);
app.delete('/api/folders/:id', folderController.delete);
app.get('/api/folders/path/:id', folderController.getPath);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Serveur SmartRevision (Sécurisé) lancé sur le port ${PORT}`));
