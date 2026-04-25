// Node.js 18+ has native fetch
async function testApi() {
    const baseUrl = 'http://localhost:3001/api';
    
    try {
        console.log('Fetching mastery...');
        const r1 = await fetch(`${baseUrl}/dashboard/mastery`);
        const d1 = await r1.json();
        console.log('Mastery:', JSON.stringify(d1, null, 2));

        console.log('Fetching activity...');
        const r2 = await fetch(`${baseUrl}/dashboard/activity`);
        const d2 = await r2.json();
        console.log('Activity first item:', d2[0]);

        console.log('Fetching feeds...');
        const r3 = await fetch(`${baseUrl}/feeds?category=考研`);
        const d3 = await r3.json();
        console.log('Feeds first item:', d3[0]);

    } catch (e) {
        console.error('API Test Failed:', e);
    }
}

testApi();
