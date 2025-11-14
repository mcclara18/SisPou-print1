const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const Database = require('../models/Database');
const routes = require('../routes');

const app = express();
const port = 3001; 

app.use((req, res, next) => {
    const host = req.get('host') || '';
    if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
        return res.status(403).json({ message: 'Acesso negado' });
    }
    next();
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

async function initializeApp() {
    try {
        await Database.init();
        console.log('Banco de dados inicializado com sucesso');
    } catch (error) {
        console.error('Falha ao inicializar o banco de dados:', error);
        process.exit(1);
    }
}

app.use('/', routes);

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
        console.log('Abrindo o Electron');
    });
}

startServer().catch(error => {
    console.error('Falha ao iniciar: ', error);
    process.exit(1);
});

module.exports = app;
