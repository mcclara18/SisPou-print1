const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

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
    console.log(`Frontend Rodando em: http://localhost:${port}`);
    console.log('Back Rodando em: http://localhost:3001');
});

module.exports = app;
