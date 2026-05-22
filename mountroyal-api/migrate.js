const pool = require('./config/db');

const runMigrations = async () => {
    console.log("⏳ Building database tables...");

    const buildQuery = `
        -- 1. Properties Table
        CREATE TABLE IF NOT EXISTS properties (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            total_rooms INTEGER NOT NULL,
            status VARCHAR(50) DEFAULT 'Operational',
            image_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- 2. Tenants Table
        CREATE TABLE IF NOT EXISTS tenants (
            id SERIAL PRIMARY KEY,
            full_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            phone VARCHAR(50),
            property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
            room_assigned VARCHAR(50),
            rent_amount NUMERIC(12, 2) NOT NULL,
            next_due_date DATE NOT NULL,
            status VARCHAR(50) DEFAULT 'Paid',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- 3. Transactions Table
        CREATE TABLE IF NOT EXISTS transactions (
            id VARCHAR(50) PRIMARY KEY,
            tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
            property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
            amount NUMERIC(12, 2) NOT NULL,
            payment_method VARCHAR(50) NOT NULL,
            status VARCHAR(50) DEFAULT 'Completed',
            payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        // Execute the massive SQL string
        await pool.query(buildQuery);
        console.log("✅ Success! All Mountroyal tables have been created.");
    } catch (error) {
        console.error("❌ Error building tables:", error);
    } finally {
        // Shut down the connection so the terminal doesn't hang
        pool.end();
    }
};

runMigrations();