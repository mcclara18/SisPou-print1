const express = require('express');
   const AuthController = require('../controllers/AuthController');
   const QuartoController = require('../controllers/QuartoController');
   const ClienteController = require('../controllers/ClienteController');
   const PrecoController = require('../controllers/PrecoController');
   const ReservaController = require('../controllers/ReservaController');
   const AuthMiddleware = require('../middleware/authMiddleware');
   const SanitizationMiddleware = require('../middleware/sanitizationMiddleware');

   const router = express.Router();

   router.use(SanitizationMiddleware.sanitize);

   router.post('/api/login', (req, res) => AuthController.login(req, res));
   router.post('/api/register', (req, res) => AuthController.register(req, res));

   router.post('/api/rooms', AuthMiddleware.verifyToken, AuthMiddleware.verifyAdminRole, (req, res) => QuartoController.create(req, res));
   router.get('/api/rooms', AuthMiddleware.verifyToken, (req, res) => QuartoController.getAll(req, res));
   router.put('/api/rooms/:numero', AuthMiddleware.verifyToken, AuthMiddleware.verifyAdminRole, (req, res) => QuartoController.updateStatus(req, res));

   router.post('/api/clients', AuthMiddleware.verifyToken, (req, res) => ClienteController.create(req, res));
   router.get('/api/clients', AuthMiddleware.verifyToken, (req, res) => ClienteController.getAll(req, res));

   router.post('/api/prices', AuthMiddleware.verifyToken, AuthMiddleware.verifyAdminRole, (req, res) => PrecoController.create(req, res));
   router.get('/api/prices', AuthMiddleware.verifyToken, (req, res) => PrecoController.getAll(req, res));

   router.post('/api/reservations', AuthMiddleware.verifyToken, (req, res) => ReservaController.create(req, res));
   router.get('/api/reservations', AuthMiddleware.verifyToken, (req, res) => ReservaController.getAll(req, res));

   module.exports = router;