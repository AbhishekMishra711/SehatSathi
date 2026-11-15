const express = require('express');
const router = express.Router();
const caretakerController = require('../controllers/caretakerController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);
router.use(requireRole(['CARETAKER', 'FAMILY']));

router.post('/link-patient', caretakerController.linkPatientWithCode);
router.get('/overview/:elderProfileId', caretakerController.getElderOverview);
router.get('/medications/:elderProfileId', caretakerController.getMedications);
router.post('/medications/:elderProfileId', caretakerController.addMedication);
router.post('/parse-prescription', caretakerController.parsePrescriptionAI);
router.get('/appointments/:elderProfileId', caretakerController.getAppointments);
router.post('/appointments/:elderProfileId', caretakerController.addAppointment);
router.get('/audit-trail/:elderProfileId', caretakerController.getAuditTrail);
router.post('/simulate-escalation/:elderProfileId', caretakerController.simulateEscalation);

module.exports = router;
