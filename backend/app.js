const express = require('express');
const app = express();
const errorMiddleware = require('../backend/middlewares/error');


const cookieParser = require('cookie-parser');
const cors = require("cors");
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
dotenv.config({ path: path.join(__dirname, "config/config.env") });


// Enable CORS for frontend on localhost:2222
const corsOptions = {
  origin: "http://localhost:2222", // Frontend URL
  methods: "GET,POST,PUT,DELETE,PATCH",
  credentials: true, // Allow cookies if needed
};

// Apply CORS middleware
app.use(cors(corsOptions));

const storage = multer.memoryStorage();  // You can also use diskStorage for saving to disk
const upload = multer({ storage: storage });
const { isAuthenticatedUser, authorizeRoles } = require('./middlewares/authenticate');



app.use(express.json()); // This is necessary to parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded data
app.use(cookieParser());

app.use('/api/v1/', authRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use(express.json());
app.use('/api/v1/enrollments', enrollmentRoutes);

app.use('/api/v1/admin', adminRoutes);
app.use(errorMiddleware);

// Add this temporary route debugger


module.exports = app;  // Export the app to be used in server.js
