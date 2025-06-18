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

// CORS and security headers configuration
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  next();
});

// Enable CORS with more flexible configuration
const allowedOrigins = [
  'http://localhost:2222',
  'http://localhost:3000',
  'https://moduno-lms.vercel.app',
  'https://moduno-lms-frontend.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
}));

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