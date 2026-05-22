const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET: Fetch current profile settings
router.get('/profile', async (req, res) => {
    try {
        // Fetching the first row (assuming ID 1 is the main admin)
        const result = await pool.query('SELECT full_name, email, phone FROM system_settings WHERE id = 1');
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT: Update profile settings
router.put('/profile', async (req, res) => {
    const { full_name, email, phone } = req.body;

    try {
        const updateQuery = `
            UPDATE system_settings 
            SET full_name = $1, email = $2, phone = $3 
            WHERE id = 1 
            RETURNING full_name, email, phone;
        `;
        
        const result = await pool.query(updateQuery, [full_name, email, phone]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;