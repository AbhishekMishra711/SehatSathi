const config = require('../config');
const escalation = require('../services/escalation');

async function handleCronTick(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const querySecret = req.query.secret;

    const providedSecret = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : querySecret;

    if (!providedSecret || providedSecret !== config.cronSecret) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Invalid cron secret key' });
    }

    const summary = await escalation.processEscalationTick(new Date());

    res.json({
      success: true,
      message: 'Cron tick processed successfully',
      summary
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  handleCronTick
};
