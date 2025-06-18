const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('Starting server...');
console.log('PORT:', PORT);
console.log('Current directory:', __dirname);
console.log('Build path:', path.join(__dirname, 'build'));

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Server is listening on 0.0.0.0:${PORT}`);
}).on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
}); 