const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Servir api.js como módulo (fora de public)
app.use('/api', express.static(path.join(__dirname, 'api')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'register.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'dashboard.html'));
});

app.get('/register-room', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'register-room.html'));
});

app.get('/register-client', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'register-client.html'));
});

app.get('/register-price', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'register-price.html'));
});

app.get('/register-reservation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'register-reservation.html'));
});

app.listen(port, 'localhost', () => {
    console.log(`✅ Frontend server running on http://localhost:${port}`);
    console.log('📝 Note: APIs are expected to be running on http://localhost:3001');
});

module.exports = app;
