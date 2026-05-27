const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// @route   GET /api/dashboard/metrics
router.get('/metrics', async (req, res) => {
    try {
        // 1. Total Active Tenants
        const tenantsRes = await pool.query("SELECT COUNT(*)::int AS count FROM tenants");
        const active_tenants = tenantsRes.rows[0].count;

        // 2. Total Rooms across all properties
        const roomsRes = await pool.query("SELECT SUM(total_rooms)::int AS count FROM properties");
        const total_rooms = roomsRes.rows[0].count || 0;
        
        // Calculate Global Occupancy Rate
        const occupancy_rate = total_rooms > 0 ? Math.round((active_tenants / total_rooms) * 100) : 0;

        // 3. Total Revenue (Sum of all amount_paid from tenants)
        const revRes = await pool.query("SELECT SUM(amount_paid)::numeric AS total FROM tenants");
        const total_revenue = revRes.rows[0].total || 0;

        // 4. Pending Rent (Total Rent minus Amount Paid)
        const pendingRes = await pool.query("SELECT SUM(rent_amount - amount_paid)::numeric AS total FROM tenants WHERE rent_amount > amount_paid");
        const pending_rent = pendingRes.rows[0].total || 0;

        res.json({
            active_tenants,
            occupancy_rate,
            total_rooms,
            total_revenue,
            pending_rent
        });
    } catch (err) {
        console.error("❌ Dashboard error:", err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;