const express = require('express');
const bodyParser = require('body-parser');
const Database = require('../models/Database.js');
const apiRoutes = require('../routes/api-routes.js');
const SanitizationMiddleware = require('../middleware/sanitizationMiddleware.js');

const app = express();
const port = 3001; 

app.use((req, res, next) => {
    const host = req.get('host') || '';
    if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
        return res.status(403).json({ message: 'Acesso negado' });
    }
    next();
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(bodyParser.json());

app.use(SanitizationMiddleware.sanitize);

app.use('/', apiRoutes);

async function initializeApp() {
    try {
        await Database.init();
        console.log('Banco de dados inicializado com sucesso');
    } catch (error) {
        console.error('Falha ao inicializar o banco de dados:', error);
        process.exit(1);
    }
}

app.use((err, req, res, next) => {
    console.error('Erro: ', err);
    res.status(500).json({ 
        message: 'Erro interno no servidor.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

async function startServer() {
    await initializeApp();

    app.listen(port, 'localhost', () => {
        console.log(`✅ Backend server running on http://localhost:${port}`);
    });
}

startServer().catch(error => {
    console.error('Falha ao iniciar: ', error);
    process.exit(1);
});

module.exports = app;
