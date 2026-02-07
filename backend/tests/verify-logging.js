const loggingService = require('../src/services/logging.service');
const assert = require('assert');

async function testLoggingService() {
  console.log('🧪 Starting LoggingService Verification...');
  
  try {
    // 1. Test instantiation and mapping
    assert.strictEqual(loggingService.mapSeverityToLevel('ERROR'), 'error');
    assert.strictEqual(loggingService.mapSeverityToLevel('WARNING'), 'warn');
    assert.strictEqual(loggingService.mapSeverityToLevel('INFO'), 'info');
    console.log('✅ Severity mapping verified.');

    // 2. Test fetching logs (will use mock if no credentials)
    console.log('📡 Attempting to fetch logs (userId: dev-user)...');
    const logs = await loggingService.getLogs('dev-user', 5);
    
    assert(Array.isArray(logs), 'Logs should be an array');
    console.log(`✅ Fetched ${logs.length} logs.`);
    
    if (logs.length > 0) {
      assert(logs[0].timestamp, 'Log should have a timestamp');
      assert(logs[0].level, 'Log should have a level');
      assert(logs[0].message, 'Log should have a message');
      console.log('✅ Log entry structure verified.');
      console.log('Sample Log:', JSON.stringify(logs[0], null, 2));
    }

    console.log('🎉 LoggingService Verification PASSED');
  } catch (error) {
    console.error('❌ LoggingService Verification FAILED:', error);
    process.exit(1);
  }
}

testLoggingService();
