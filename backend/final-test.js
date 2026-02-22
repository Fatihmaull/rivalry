const http = require('http');

const loginData = JSON.stringify({
    email: 'admin@rivalry.app',
    password: 'password123'
});

const loginOptions = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
    }
};

const req = http.request(loginOptions, (res) => {
    let body = '';
    res.on('data', (d) => body += d);
    res.on('end', () => {
        console.log('Login Response Status:', res.statusCode);
        const data = JSON.parse(body);
        if (data.accessToken) {
            console.log('Login Successful!');
            const token = data.accessToken;

            const statsOptions = {
                hostname: 'localhost',
                port: 4000,
                path: '/api/admin/dashboard',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            const statsReq = http.request(statsOptions, (statsRes) => {
                let statsBody = '';
                statsRes.on('data', (d) => statsBody += d);
                statsRes.on('end', () => {
                    console.log('Dashboard Stats Status:', statsRes.statusCode);
                    console.log('Dashboard Stats:', JSON.parse(statsBody));
                });
            });
            statsReq.end();
        } else {
            console.log('Login failed:', data);
        }
    });
});

req.on('error', (e) => console.error('Error:', e));
req.write(loginData);
req.end();
