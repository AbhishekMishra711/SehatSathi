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

module.exports = router;
