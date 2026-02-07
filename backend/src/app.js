const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');

const app = express();

// Security Middleware - Relaxed CSP for development/hackathon compatibility
app.use(helmet({
  contentSecurityPolicy: false, 
}));
app.use(cors({ origin: '*' }));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // High limit for hackathon/dev polling
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Routes
app.use('/api', routes);

module.exports = app;
