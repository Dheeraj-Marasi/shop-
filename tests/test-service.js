require('dotenv').config();
const http = require('http');
const app = require('../src/app');

async function runTests() {
  console.log('🧪 Starting Activity Confirmation Email Service automated test suite...\n');

  // Start temporary server on random port
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`📡 Test server listening on ${baseUrl}`);

  let passed = 0;
  let failed = 0;

  async function assert(testName, fn) {
    try {
      process.stdout.write(`• Testing: ${testName}... `);
      await fn();
      console.log('✅ PASSED');
      passed++;
    } catch (err) {
      console.log('❌ FAILED:', err.message);
      failed++;
    }
  }

  try {
    // Test 1: Healthcheck
    await assert('GET /api/health returns status ok', async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      const data = await res.json();
      if (res.status !== 200 || data.status !== 'ok') {
        throw new Error(`Expected status 200 and { status: 'ok' }, got ${res.status}`);
      }
    });

    // Test 2: Reject request without recipient email
    await assert('POST /api/activity/notify rejects missing email', async () => {
      const res = await fetch(`${baseUrl}/api/activity/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity: { type: 'login' }
        })
      });
      const data = await res.json();
      if (res.status !== 400 || data.success !== false) {
        throw new Error('Expected 400 rejection for missing email');
      }
    });

    // Test 3: Send Login activity confirmation email
    await assert('POST /api/activity/notify sends Login confirmation', async () => {
      const res = await fetch(`${baseUrl}/api/activity/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            email: 'test.user@example.com',
            name: 'Test Tester'
          },
          activity: {
            type: 'login',
            title: 'New Sign-In from Edge',
            ip: '192.168.1.100',
            device: 'Edge on Windows 11',
            location: 'New York, USA'
          }
        })
      });
      const data = await res.json();
      if (!data.success || !data.messageId) {
        throw new Error('Expected success with messageId, got ' + JSON.stringify(data));
      }
    });

    // Test 4: Send Password Changed activity confirmation email
    await assert('POST /api/activity/notify sends Password Change confirmation', async () => {
      const res = await fetch(`${baseUrl}/api/activity/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            email: 'test.user@example.com',
            name: 'Test Tester'
          },
          activity: {
            type: 'password_change',
            title: 'Password Updated'
          }
        })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error('Expected success for password change');
      }
    });

    // Test 5: Send Order Placed activity confirmation email
    await assert('POST /api/activity/notify sends Order confirmation', async () => {
      const res = await fetch(`${baseUrl}/api/activity/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            email: 'shopper@example.com',
            name: 'Shopper Sam'
          },
          activity: {
            type: 'order_placed',
            details: {
              orderId: 'ORD-5544',
              total: '$45.00',
              items: [{ name: 'Premium Theme', qty: 1, price: '$45.00' }]
            }
          }
        })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error('Expected success for order placement');
      }
    });

    // Test 6: Verify Activity History endpoint has records
    await assert('GET /api/activity/history returns logged activities', async () => {
      const res = await fetch(`${baseUrl}/api/activity/history`);
      const data = await res.json();
      if (!data.success || data.activities.length < 3) {
        throw new Error(`Expected at least 3 activities in history, got ${data.activities.length}`);
      }
    });

    // Test 7: Template Preview HTML endpoint
    await assert('GET /api/activity/templates/preview/login renders valid HTML', async () => {
      const res = await fetch(`${baseUrl}/api/activity/templates/preview/login`);
      const html = await res.text();
      if (res.status !== 200 || !html.includes('New Sign-In Detected')) {
        throw new Error('Expected HTML containing "New Sign-In Detected"');
      }
    });

    // Test 8: ShopLedger Web App is served
    await assert('GET /shopledger.html serves ShopLedger web application', async () => {
      const res = await fetch(`${baseUrl}/shopledger.html`);
      const html = await res.text();
      if (res.status !== 200 || !html.includes('<title>ShopLedger') || !html.includes('website-tracker.js')) {
        throw new Error('Expected ShopLedger HTML containing title and tracker script');
      }
    });

  } finally {
    server.close();
  }

  console.log('\n=======================================');
  console.log(`Summary: ${passed} passed, ${failed} failed.`);
  console.log('=======================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
