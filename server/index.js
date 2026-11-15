const app = require('./app');
const config = require('./config');

const server = app.listen(config.port, () => {
  console.log(`SehatSathi API server running on port ${config.port} in ${config.nodeEnv} mode`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server terminated gracefully');
  });
});

