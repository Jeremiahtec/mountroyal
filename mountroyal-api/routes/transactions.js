const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// @route   GET /api/transactions
// @desc    Get all rent payments with tenant and property names
router.get('/', async (req, res) => {
    try {
        const allTxns = await pool.query(`
            SELECT tx.*, t.full_name as tenant_name, p.name as property_name 
            FROM transactions tx
            LEFT JOIN tenants t ON tx.tenant_id = t.id
            LEFT JOIN properties p ON tx.property_id = p.id
            ORDER BY tx.payment_date DESC
        `);
        res.json(allTxns.rows);
    } catch (err) {
        console.error("❌ Error fetching transactions:", err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/transactions
// @desc    Log a payment AND update the tenant's status automatically
router.post('/', async (req, res) => {
    // We use a dedicated 'client' so we can lock the database for a multi-step financial transaction
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN'); // Start the lock

        const { tenant_id, property_id, amount, payment_method, next_due_date } = req.body;
        
        // Generate a random professional transaction ID (e.g., 'TXN-8492')
        const txnId = 'TXN-' + Math.floor(1000 + Math.random() * 9000);

        // 1. Save the receipt to the ledger
        const newTxn = await client.query(
            `INSERT INTO transactions (id, tenant_id, property_id, amount, payment_method, status) 
             VALUES ($1, $2, $3, $4, $5, 'Completed') 
             RETURNING *`,
            [txnId, tenant_id, property_id, amount, payment_method]
        );

        // 2. Update the tenant to "Paid" and push their due date forward
        await client.query(
            `UPDATE tenants SET status = 'Paid', next_due_date = $1 WHERE id = $2`,
            [next_due_date, tenant_id]
        );

        await client.query('COMMIT'); // Save everything permanently
        res.json(newTxn.rows[0]);
        
    } catch (err) {
        await client.query('ROLLBACK'); // If anything fails, cancel the whole process!
        console.error("❌ Error logging payment:", err.message);
        res.status(500).send('Server Error');
    } finally {
        client.release(); // Free up the database connection
    }
});

module.exports = router;