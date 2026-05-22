const { Pool } = require('pg');
require('dotenv').config();

// Create a new connection pool using the URL from our .env file
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Test the connection immediately
pool.connect()
    .then(() => console.log('📦 Successfully connected to PostgreSQL Database'))
    .catch((err) => console.error('❌ Database connection error:', err.stack));

module.exports = pool;