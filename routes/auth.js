const express = require('express');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

// Rotas de autenticação
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/google-login', AuthController.loginWithGoogle);
router.post('/login-google', AuthController.loginWithGoogle);
router.post('/test-login', AuthController.testLogin);
router.post('/verify', AuthController.verify);
router.post('/logout', AuthController.logout);

module.exports = router;
