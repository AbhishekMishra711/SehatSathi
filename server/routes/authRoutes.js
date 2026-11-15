const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth, rateLimitLogin } = require('../middleware/auth');

router.post('/send-otp', authController.sendOtp);
router.post('/register-elder', authController.registerElder);
router.post('/register-caregiver', authController.registerCaregiver);
router.post('/login', rateLimitLogin, authController.login);
router.post('/reset-credential', authController.resetCredential);
router.post('/setup-admin', authController.setupAdmin);
router.get('/me', requireAuth, authController.getMe);
router.post('/logout', authController.logout);

module.exports = router;
