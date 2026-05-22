require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const app = express();

// --- CLEAN CORS CONFIGURATION ---
const corsOptions = {
  origin: [
    'http://localhost:5173', 
    'https://mountroyal.vercel.app' // NO TRAILING SLASH
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explicitly add OPTIONS for preflight
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight handler

app.use(express.json());

// --- API Routes ---
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Mountroyal API Engine is running!' });
});

app.use('/api/properties', require('./routes/properties'));
app.use('/api/tenants', require('./routes/tenants'));
app.use('/api/transactions', require('./routes/transactions'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Mountroyal API is live on port ${PORT}`);
});