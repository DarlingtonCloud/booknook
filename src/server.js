const express = require('express');
require('dotenv').config();

const bookRoutes = require('./routes/books');

const app = express();

app.use(express.json());

// routes
app.use('/api/books', bookRoutes);

// health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'BookNook API is running'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});