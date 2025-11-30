const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'login.html'));
});

router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'register.html'));
});

router.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'dashboard.html'));
});

router.get('/register-room', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'register-room.html'));
});

router.get('/register-client', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'register-client.html'));
});

router.get('/register-price', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'register-price.html'));
});

router.get('/register-reservation', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'register-reservation.html'));
});

module.exports = router;