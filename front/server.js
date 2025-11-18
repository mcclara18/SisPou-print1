const express = require('express');
const path = require('path');

const app = express();
const port = 3000; // Frontend em porta 3000, Backend em 3001

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rota padrão - retorna login.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
});

// Rota para /register
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'register.html'));
});

// Rota para /dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'dashboard.html'));
});

// Rota para /register-room
app.get('/register-room', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'register-room.html'));
});

// Rota para /register-client
app.get('/register-client', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'register-client.html'));
});

// Middleware de erro
app.use((err, req, res, next) => {
    console.error('Erro: ', err);
    res.status(500).json({ message: 'Erro interno no servidor.' });
});

// Iniciar servidor
app.listen(port, 'localhost', () => {
    console.log(`Frontend rodando em http://localhost:${port}`);
    console.log('Pressione Ctrl+C para parar');
});

module.exports = app;
