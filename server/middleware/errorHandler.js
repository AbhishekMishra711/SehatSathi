const config = require('../config');

function errorHandler(err, req, res, next) {
  // Check if Zod error
  if (err.name === 'ZodError' || err.issues) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: (err.errors || err.issues || []).map(e => ({
        field: Array.isArray(e.path) ? e.path.join('.') : e.path,
        message: e.message
      }))
    });
  }

  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(config.nodeEnv === 'development' ? { stack: err.stack } : {})
  });
}

module.exports = errorHandler;
