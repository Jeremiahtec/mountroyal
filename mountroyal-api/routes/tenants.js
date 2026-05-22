const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// @route   GET /api/tenants
// @desc    Get all tenants with their associated property name
router.get('/', async (req, res) => {
    try {
        const allTenants = await pool.query(`
            SELECT t.*, p.name as property_name 
            FROM tenants t
            LEFT JOIN properties p ON t.property_id = p.id
            ORDER BY t.created_at DESC
        `);
        res.json(allTenants.rows);
    } catch (err) {
        console.error("❌ Error fetching tenants:", err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/tenants
// @desc    Add a new tenant
router.post('/', async (req, res) => {
    try {
        const { full_name, email, phone, property_id, room_assigned, rent_amount, next_due_date } = req.body;

        const newTenant = await pool.query(
            `INSERT INTO tenants (full_name, email, phone, property_id, room_assigned, rent_amount, next_due_date) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING *`,
            [full_name, email, phone, property_id || null, room_assigned, rent_amount, next_due_date]
        );

        res.json(newTenant.rows[0]);
    } catch (err) {
        console.error("❌ Error adding tenant:", err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/tenants/:id
// @desc    Update a tenant's info (Edit Mode)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, email, phone, property_id, room_assigned, rent_amount, next_due_date, status } = req.body;

        const updatedTenant = await pool.query(
            `UPDATE tenants 
             SET full_name = $1, email = $2, phone = $3, property_id = $4, room_assigned = $5, rent_amount = $6, next_due_date = $7, status = $8
             WHERE id = $9 RETURNING *`,
            [full_name, email, phone, property_id || null, room_assigned, rent_amount, next_due_date, status || 'Paid', id]
        );

        res.json(updatedTenant.rows[0]);
    } catch (err) {
        console.error("❌ Error updating tenant:", err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/tenants/:id
// @desc    Delete a tenant
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM tenants WHERE id = $1', [id]);
        res.json({ message: "Tenant deleted successfully" });
    } catch (err) {
        console.error("❌ Error deleting tenant:", err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;