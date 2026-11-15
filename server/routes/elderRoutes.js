const express = require('express');
const router = express.Router();
const elderController = require('../controllers/elderController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);
router.use(requireRole('ELDER'));

router.get('/today', elderController.getTodaySchedule);
router.post('/confirm-dose', elderController.confirmDose);
router.get('/appointments', elderController.getAppointments);
router.get('/my-people', elderController.getMyPeople);
router.put('/permissions', elderController.updateCaregiverPermission);
router.put('/revoke-access', elderController.revokeCaregiverAccess);

// Patient AI Voice/Chat Assistant routes
router.post('/assistant/chat', elderController.chatWithAssistant);
router.get('/assistant/history', elderController.getAssistantHistory);

module.exports = router;
