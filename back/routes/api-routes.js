const express = require('express');
   const AuthController = require('../controllers/AuthController');
   const QuartoController = require('../controllers/QuartoController');
   const ClienteController = require('../controllers/ClienteController');

   const router = express.Router();

   router.post('/api/login', (req, res) => AuthController.login(req, res));
   router.post('/api/register', (req, res) => AuthController.register(req, res));

   router.post('/api/rooms', (req, res) => QuartoController.create(req, res));
   router.get('/api/rooms', (req, res) => QuartoController.getAll(req, res));
   router.put('/api/rooms/:numero', (req, res) => QuartoController.updateStatus(req, res));

   router.post('/api/clients', (req, res) => ClienteController.create(req, res));
   router.get('/api/clients', (req, res) => ClienteController.getAll(req, res));

   module.exports = router;