const express = require('express');
const path = require('path');

const router = express.Router();

// ROTAS DE PÁGINAS FRONTEND
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'html', 'login.html'));
});

router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'html', 'register.html'));
});

router.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'html', 'dashboard.html'));
});

router.get('/register-room', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'html', 'register-room.html'));
});

router.get('/register-client', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'html', 'register-client.html'));
});

module.exports = router;