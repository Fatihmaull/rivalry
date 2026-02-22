const axios = require('axios');

async function testAdmin() {
    try {
        console.log('Logging in as admin...');
        const loginRes = await axios.post('http://localhost:4000/api/auth/login', {
            email: 'admin@rivalry.app',
            password: 'password123'
        });

        const token = loginRes.data.accessToken;
        console.log('Login successful. Token acquired.');

        console.log('Fetching dashboard stats...');
        const statsRes = await axios.get('http://localhost:4000/api/admin/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Dashboard Stats:', JSON.stringify(statsRes.data, null, 2));

    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
}

testAdmin();
