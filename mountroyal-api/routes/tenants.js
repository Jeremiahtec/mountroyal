const express = require('express');
const router = express.Router();
const pool = require('../db'); // Adjust this path if your db.js is located somewhere else

// 1. GET ALL ACTIVE TENANTS
router.get('/', async (req, res) => {
  try {
    // Only fetch tenants where is_archived is false (or null)
    const result = await pool.query(
      'SELECT * FROM tenants WHERE is_archived = false OR is_archived IS NULL ORDER BY id DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching tenants:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

// 2. CREATE A NEW TENANT AND SYNC TO LEDGER
router.post('/', async (req, res) => {
  // Destructure the incoming data from the React frontend
  const { 
    full_name, 
    email, 
    phone, 
    property_id, 
    room_assigned, 
    rent_amount, 
    amount_paid, 
    next_due_date, 
    status 
  } = req.body;

  // We use client.connect() instead of pool.query() because we need a transaction (BEGIN/COMMIT)
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Start the database transaction

    // Step A: Insert the tenant into the database
    const tenantQuery = `
      INSERT INTO tenants (full_name, email, phone, property_id, room_assigned, rent_amount, amount_paid, next_due_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const tenantValues = [
      full_name, 
      email, 
      phone, 
      property_id, 
      room_assigned, 
      rent_amount, 
      amount_paid, 
      next_due_date, 
      status
    ];
    
    const tenantResult = await client.query(tenantQuery, tenantValues);
    const newTenant = tenantResult.rows[0];

    // Step B: If the tenant paid money during onboarding, log it in the transactions table
    if (Number(amount_paid) > 0) {
      const transactionQuery = `
        INSERT INTO transactions (tenant_id, property_id, amount, transaction_type, status, date)
        VALUES ($1, $2, $3, $4, $5, CURRENT_DATE)
      `;
      const transactionValues = [
        newTenant.id, 
        property_id, 
        amount_paid, 
        'Rent Payment', 
        'Completed'
      ];
      
      await client.query(transactionQuery, transactionValues);
    }

    await client.query('COMMIT'); // Lock the data into the database permanently
    res.status(201).json(newTenant); // Send the successful data back to the frontend

  } catch (err) {
    await client.query('ROLLBACK'); // If anything fails, undo everything so data isn't corrupted
    console.error("Transaction Failed:", err.message);
    res.status(500).json({ error: "Server Error" });
  } finally {
    client.release(); // Release the database connection back to the pool
  }
});

// 3. SOFT DELETE A TENANT
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Instead of destroying the data, we just flip the is_archived switch to true
    const result = await pool.query(
      'UPDATE tenants SET is_archived = true WHERE id = $1 RETURNING *', 
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Tenant not found in database." });
    }
    
    res.json({ message: "Tenant archived successfully. Financial records preserved!" });
  } catch (err) {
    console.error("Error archiving tenant:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;