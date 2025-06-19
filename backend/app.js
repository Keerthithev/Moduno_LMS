const express = require('express');
const app = express();
const errorMiddleware = require('../backend/middlewares/error');
const cookieParser = require('cookie-parser');
const cors = require("cors");
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');

// Import routes
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const profile = require('./routes/profile');

dotenv.config({ path: path.join(__dirname, "config/config.env") });

// CORS and security headers configuration - More aggressive approach
app.use((req, res, next) => {
  console.log('=== CORS DEBUG ===');
  console.log('Request Origin:', req.headers.origin);
  console.log('Request Method:', req.method);
  console.log('Request Path:', req.path);
  
  // Set CORS headers for all requests - temporarily allow all origins
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  console.log('CORS Headers Set:', {
    'Access-Control-Allow-Origin': res.getHeader('Access-Control-Allow-Origin'),
    'Access-Control-Allow-Methods': res.getHeader('Access-Control-Allow-Methods'),
    'Access-Control-Allow-Headers': res.getHeader('Access-Control-Allow-Headers'),
    'Access-Control-Allow-Credentials': res.getHeader('Access-Control-Allow-Credentials')
  });
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    res.status(200).end();
    return;
  }
  
  console.log('=== END CORS DEBUG ===');
  next();
});

// Remove the cors middleware to avoid conflicts
// app.use(cors({...}));

// Add debugging middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { isAuthenticatedUser, authorizeRoles } = require('./middlewares/authenticate');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/v1/', authRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/profile', profile);

app.use(errorMiddleware);

module.exports = app;  // Export the app to be used in server.js