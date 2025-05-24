const app = require('./app');
const connectDatabase = require('./config/database');

// Connect to the database
connectDatabase();


// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server is listening on port ${process.env.PORT} in ${process.env.NODE_ENV}`);
});
