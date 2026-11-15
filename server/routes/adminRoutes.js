const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);
router.use(requireRole('ADMIN'));

router.get('/metrics', adminController.getMetrics);
router.get('/users', adminController.getAllUsers);
router.delete('/user/:userId', adminController.deleteUser);
router.post('/user/:userId/unlock', adminController.unlockUser);
router.get('/audit-logs', adminController.getSystemAuditLogs);
router.post('/trigger-escalation', adminController.triggerManualEscalation);

module.exports = router;

