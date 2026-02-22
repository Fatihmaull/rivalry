const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function main() {
    const client = await pool.connect();
    try {
        console.log('--- Database Verification ---');

        const userCount = await client.query('SELECT COUNT(*) FROM "User"');
        console.log('Total Users:', userCount.rows[0].count);

        const roomCount = await client.query('SELECT COUNT(*) FROM "Room"');
        console.log('Total Rooms:', roomCount.rows[0].count);

        const targetUser = await client.query('SELECT id, email, username, role, status FROM "User" WHERE email = $1', ['fatihmaulanamail@gmail.com']);
        console.log('Target User (testing101):', JSON.stringify(targetUser.rows[0], null, 2));

        const adminUser = await client.query('SELECT id, email, username, role, status FROM "User" WHERE role = \'admin\' OR role = \'super_admin\' LIMIT 1');
        console.log('One Admin User:', JSON.stringify(adminUser.rows[0], null, 2));

    } finally {
        client.release();
        await pool.end();
    }
}

main().catch(console.error);
