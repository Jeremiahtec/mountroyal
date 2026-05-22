const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// @route   GET /api/properties
// @desc    Get all properties
router.get('/', async (req, res) => {
    try {
        const allProperties = await pool.query('SELECT * FROM properties ORDER BY created_at DESC');
        res.json(allProperties.rows);
    } catch (err) {
        console.error("❌ Error fetching properties:", err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/properties/:id
// @desc    Get a single property by its ID 
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const property = await pool.query('SELECT * FROM properties WHERE id = $1', [id]);
        
        if (property.rows.length === 0) return res.status(404).json({ message: "Property not found" });
        res.json(property.rows[0]);
    } catch (err) {
        console.error("❌ Error fetching property details:", err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/properties
// @desc    Add a new property
router.post('/', async (req, res) => {
    try {
        const { name, location, total_rooms, status, image_url } = req.body;

        const newProperty = await pool.query(
            `INSERT INTO properties (name, location, total_rooms, status, image_url) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [name, location, total_rooms, status, image_url]
        );

        res.json(newProperty.rows[0]);
    } catch (err) {
        console.error("❌ Error adding property:", err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/properties/:id
// @desc    Update a property (Edit Mode)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, location, total_rooms, status, image_url } = req.body;

        const updatedProperty = await pool.query(
            `UPDATE properties 
             SET name = $1, location = $2, total_rooms = $3, status = $4, image_url = $5
             WHERE id = $6 RETURNING *`,
            [name, location, total_rooms, status, image_url, id]
        );

        res.json(updatedProperty.rows[0]);
    } catch (err) {
        console.error("❌ Error updating property:", err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/properties/:id
// @desc    Delete a property
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM properties WHERE id = $1', [id]);
        res.json({ message: "Property deleted successfully" });
    } catch (err) {
        console.error("❌ Error deleting property:", err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;