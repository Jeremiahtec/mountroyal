const express = require('express');
const router = express.Router();
const pool = require('../config/db'); 
const verifyToken = require('../middleware/authMiddleware');

// Helper function to fetch a single tenant with property details
const fetchTenantWithProperty = async (clientOrPool, tenantId) => {
  const query = `
    SELECT 
      t.*, 
      p.name AS property_name 
    FROM tenants t
    LEFT JOIN properties p ON t.property_id = p.id
    WHERE t.id = $1;
  `;
  const { rows } = await clientOrPool.query(query, [tenantId]);
  return rows[0];
};

// 1. GET ALL ACTIVE TENANTS
router.get('/', verifyToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        t.*, 
        p.name AS property_name 
      FROM tenants t
      LEFT JOIN properties p ON t.property_id = p.id
      ORDER BY t.created_at DESC;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching tenants:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 2. CREATE A NEW TENANT AND SYNC TO LEDGER
router.post('/', verifyToken, async (req, res) => {
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

  // Sanitize property_id to null if empty string is sent
  const sanitizedPropertyId = property_id || null;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Step A: Insert tenant
    const tenantQuery = `
      INSERT INTO tenants (full_name, email, phone, property_id, room_assigned, rent_amount, amount_paid, next_due_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id;
    `;
    const tenantValues = [
      full_name, 
      email, 
      phone, 
      sanitizedPropertyId, 
      room_assigned, 
      rent_amount, 
      amount_paid, 
      next_due_date, 
      status
    ];
    
    const tenantResult = await client.query(tenantQuery, tenantValues);
    const newTenantId = tenantResult.rows[0].id;

    // Step B: Log payment in transactions if applicable
    if (Number(amount_paid) > 0) {
      const transactionQuery = `
        INSERT INTO transactions (tenant_id, property_id, amount, transaction_type, status, date)
        VALUES ($1, $2, $3, $4, $5, CURRENT_DATE)
      `;
      const transactionValues = [
        newTenantId, 
        sanitizedPropertyId, 
        amount_paid, 
        'Rent Payment', 
        'Completed'
      ];
      
      await client.query(transactionQuery, transactionValues);
    }

    await client.query('COMMIT');

    // Fetch full tenant record with property_name before returning to frontend
    const createdTenant = await fetchTenantWithProperty(pool, newTenantId);
    res.status(201).json(createdTenant);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Transaction Failed:", err.message);
    res.status(500).json({ error: "Server Error" });
  } finally {
    client.release();
  }
});

// 3. SOFT DELETE A TENANT
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  
  try {
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

// 4. PUT (Update) AN EXISTING TENANT
router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { 
    full_name, email, phone, property_id, 
    room_assigned, rent_amount, amount_paid, 
    next_due_date, status 
  } = req.body;

  const sanitizedPropertyId = property_id || null;

  try {
    const updateQuery = `
      UPDATE tenants 
      SET full_name = $1, email = $2, phone = $3, property_id = $4, 
          room_assigned = $5, rent_amount = $6, amount_paid = $7, 
          next_due_date = $8, status = $9
      WHERE id = $10
      RETURNING id;
    `;
    
    const values = [
      full_name, email, phone, sanitizedPropertyId, 
      room_assigned, rent_amount, amount_paid, 
      next_due_date, status, id
    ];

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    // Fetch full tenant record with property_name before returning
    const updatedTenant = await fetchTenantWithProperty(pool, id);
    res.json(updatedTenant);
  } catch (error) {
    console.error("Error updating tenant:", error);
    res.status(500).json({ error: "Server error while updating tenant" });
  }
});

module.exports = router;