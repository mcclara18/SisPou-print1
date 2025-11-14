const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const Database = require('../models/Database');
const routes = require('../routes');

const app = express();
const port = 3001; // Porta interna, apenas para Electron

// ============ MIDDLEWARES ============
// Apenas localhost pode acessar - sem CORS público
app.use((req, res, next) => {
    const host = req.get('host') || '';
    if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
        return res.status(403).json({ message: 'Acesso negado' });
    }
    next();
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// ============ INICIALIZAR BANCO DE DADOS ============
async function initializeApp() {
    try {
        await Database.init();
        console.log('✅ Database initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize database:', error);
        process.exit(1);
    }
}

// ============ USAR ROTAS ============
app.use('/', routes);

// ============ MIDDLEWARE DE ERRO ============
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({ 
        message: 'Erro interno no servidor.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ============ INICIAR SERVIDOR ============
async function startServer() {
    await initializeApp();
    
    // Ouvir apenas em localhost - sem acesso externo
    app.listen(port, 'localhost', () => {
        console.log(`🚀 Server running internally on http://localhost:${port}`);
        console.log('🔒 Access restricted to Electron application only');
    });
}

startServer().catch(error => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});

module.exports = app;
