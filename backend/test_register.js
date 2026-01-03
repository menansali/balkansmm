const axios = require('axios');

async function testRegister() {
    try {
        const email = `test_${Math.floor(Math.random() * 10000)}@example.com`;
        console.log(`Attempting to register with ${email}...`);

        const res = await axios.post('http://localhost:3001/auth/register', {
            email: email,
            password: 'password123',
            name: 'Test User'
        });

        console.log('Registration successful:', res.data);
    } catch (e) {
        console.error('Registration failed:', e.response ? e.response.data : e.message);
    }
}

testRegister();
