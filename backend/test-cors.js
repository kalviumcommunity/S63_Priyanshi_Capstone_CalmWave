// Simple CORS test script
const express = require('express');
const cors = require('cors');

const app = express();

// Very permissive CORS for testing
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(express.json());

// Test route
app.post('/api/users/register', (req, res) => {
  console.log('Registration test received:', req.body);
  res.json({ 
    message: 'CORS test successful!', 
    body: req.body,
    origin: req.headers.origin 
  });
});

app.get('/', (req, res) => {
  res.send('CORS Test Server Running');
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`CORS Test Server running on port ${PORT}`);
});