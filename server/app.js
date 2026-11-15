const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const elderRoutes = require('./routes/elderRoutes');
const caretakerRoutes = require('./routes/caretakerRoutes');
const cronRoutes = require('./routes/cronRoutes');

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: false // Allows inline scripts for PWA if needed
}));

// CORS setup
app.use(cors({
  origin: config.nodeEnv === 'production' ? true : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SehatSathi API'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/elder', elderRoutes);
app.use('/api/caretaker', caretakerRoutes);
app.use('/api/cron', cronRoutes);

// In production, serve static files from client build
if (config.nodeEnv === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Central error handler
app.use(errorHandler);

module.exports = app;
