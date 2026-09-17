/**
 * Production Load Test - Login Capacity
 * Target: https://mozhibu.onrender.com
 */

const autocannon = require('autocannon');

const PRODUCTION_URL = process.argv[2] || 'https://mozhibu.onrender.com';
const BASE_URL = `${PRODUCTION_URL}/api/auth/login`;

const TEST_EMAIL = 'varun@gmail.com';
const TEST_PASSWORD = 'Varun123';

const loginBody = JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD });

console.log('\n🚀 Starting Production Load Test...');
console.log(`📌 Target: ${BASE_URL}`);
console.log(`👤 Test User: ${TEST_EMAIL}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function runTest(connections, durationSeconds, label) {
  return new Promise((resolve) => {
    const instance = autocannon({
      url: BASE_URL,
      connections,
      duration: durationSeconds,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://mozhibu-wine.vercel.app',
        'Referer': 'https://mozhibu-wine.vercel.app',
        'X-Requested-With': 'XMLHttpRequest',   // Required by CSRF middleware
      },
      body: loginBody,
      timeout: 30,
    }, (err, result) => {
      resolve({ label, connections, result, err });
    });

    autocannon.track(instance, { renderProgressBar: true });
  });
}

async function main() {
  const results = [];

  console.log('🔵 Test 1: 10 Concurrent Users (15s)');
  results.push(await runTest(10, 15, '10 Concurrent Users'));

  console.log('\n🟡 Test 2: 50 Concurrent Users (15s)');
  results.push(await runTest(50, 15, '50 Concurrent Users'));

  console.log('\n🟠 Test 3: 100 Concurrent Users (15s)');
  results.push(await runTest(100, 15, '100 Concurrent Users'));

  console.log('\n🔴 Test 4: 200 Concurrent Users (15s)');
  results.push(await runTest(200, 15, '200 Concurrent Users'));

  // ─── Print Summary Report ──────────────────────────────────────────────────
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('                    📊  MOZHIBU LOAD TEST REPORT                  ');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`  Target:  ${PRODUCTION_URL}`);
  console.log(`  Route:   POST /api/auth/login`);
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('  Test                 | Req/sec | Avg Latency | Errors | Status  ');
  console.log('  ─────────────────────────────────────────────────────────────────');

  let allPassed = true;
  for (const { label, result, err } of results) {
    if (err) {
      console.log(`  ${label.padEnd(21)} | ERROR: ${err.message}`);
      allPassed = false;
      continue;
    }
    const reqSec    = result.requests.average.toFixed(1).padStart(7);
    const latency   = `${result.latency.average.toFixed(0)}ms`.padStart(11);
    const errors    = result.errors.toString().padStart(6);
    const status    = result.errors === 0
      ? '✅ PASS'
      : result.errors < result.requests.total * 0.05
        ? '⚠️  WARN'
        : '❌ FAIL';

    if (result.errors > 0) allPassed = false;
    console.log(`  ${label.padEnd(21)} | ${reqSec} | ${latency} | ${errors} | ${status}`);
  }

  console.log('═══════════════════════════════════════════════════════════════════');

  // Overall verdict
  const peak = results[results.length - 1];
  if (!peak.err && peak.result) {
    const total = peak.result.requests.total;
    const errors = peak.result.errors;
    const errorPct = total > 0 ? (errors / total * 100).toFixed(1) : '0.0';

    console.log(`\n📈 Peak test (200 users): ${total} total requests, ${errors} errors (${errorPct}% error rate)`);

    if (parseFloat(errorPct) === 0) {
      console.log('✅ VERDICT: Excellent! Server handles 200 concurrent logins with ZERO errors.');
    } else if (parseFloat(errorPct) < 5) {
      console.log('⚠️  VERDICT: Good. Minor errors under peak load. Consider upgrading Render plan for better headroom.');
    } else {
      console.log('❌ VERDICT: Server struggles at 200 concurrent users. Render plan upgrade recommended.');
    }
  }
  console.log('');
}

main().catch(console.error);
