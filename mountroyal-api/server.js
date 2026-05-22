require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const app = express();

app.use(cors({
    origin: ['http://localhost:5173', 'https://mountroyal.vercel.app/'],
    credentials: true
}));

app.use(express.json());

// --- Test Route ---
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Mountroyal API Engine is running smoothly!' });
});

// --- API Routes ---
// This tells Express: "Any request going to /api/properties should be handled by our properties.js file"
app.use('/api/properties', require('./routes/properties'));
app.use('/api/tenants', require('./routes/tenants'));
app.use('/api/transactions', require('./routes/transactions'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Mountroyal API is live and listening on port ${PORT}`);
});