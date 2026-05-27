const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET: Fetch tenants (JOIN with properties to get the building name)
router.get('/', async (req, res) => {
    try {
        // This JOIN fixes the issue of the property name not showing in the table
        const query = `
            SELECT tenants.*, properties.name AS property_name 
            FROM tenants 
            LEFT JOIN properties ON tenants.property_id = properties.id
            ORDER BY tenants.id DESC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST: Add new tenant AND sync to Ledger
router.post('/', async (req, res) => {
    const { full_name, email, phone, property_id, room_assigned, rent_amount, next_due_date, status } = req.body;

    // Use a client for Transactions (Atomic operations)
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN'); // Start Transaction

        // 1. Insert the Tenant (This fixes the Assignment issue)
        const tenantQuery = `
            INSERT INTO tenants (full_name, email, phone, property_id, room_assigned, rent_amount, next_due_date, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const tenantResult = await client.query(tenantQuery, [
            full_name, email, phone, property_id || null, room_assigned, rent_amount, next_due_date, status
        ]);
        const newTenant = tenantResult.rows[0];

        // 2. Sync to Ledger (This fixes the Ledger issue)
        if (status === 'Paid') {
            const ledgerQuery = `
                INSERT INTO transactions (tenant_id, property_id, amount, transaction_type, status, date)
                VALUES ($1, $2, $3, 'Rent Payment', 'Completed', CURRENT_DATE);
            `;
            // Assumes you have a transactions table. Adjust column names if your ledger schema differs.
            await client.query(ledgerQuery, [newTenant.id, property_id || null, rent_amount]);
        }

        await client.query('COMMIT'); // Save everything
        res.status(201).json(newTenant);
        
    } catch (err) {
        await client.query('ROLLBACK'); // Cancel everything if there is an error
        console.error('Transaction Failed:', err.message);
        res.status(500).json({ error: 'Failed to onboard tenant and sync ledger' });
    } finally {
        client.release();
    }
});

module.exports = router;