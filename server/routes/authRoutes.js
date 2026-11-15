const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth, rateLimitLogin } = require('../middleware/auth');

router.post('/login', rateLimitLogin, authController.login);
router.post('/quick-demo-login', authController.quickDemoLogin);
router.get('/me', requireAuth, authController.getMe);
router.post('/logout', authController.logout);

module.exports = router;
