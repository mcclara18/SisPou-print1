const express = require('express');
const path = require('path');
const AuthController = require('../controllers/AuthController');
const QuartoController = require('../controllers/QuartoController');

const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'html', 'login.html'));
});

router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'html', 'register.html'));
});

router.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'html', 'dashboard.html'));
});

router.get('/register-room', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'html', 'register-room.html'));
});

router.post('/api/register', (req, res) => AuthController.register(req, res));
router.post('/api/login', (req, res) => AuthController.login(req, res));

router.post('/api/rooms', (req, res) => QuartoController.create(req, res));
router.get('/api/rooms', (req, res) => QuartoController.getAll(req, res));
router.put('/api/rooms/:numero', (req, res) => QuartoController.updateStatus(req, res));


module.exports = router;
