const express = require('express');
const router = express.Router();
const cronController = require('../controllers/cronController');

router.get('/tick', cronController.handleCronTick);
router.post('/tick', cronController.handleCronTick);

module.exports = router;
