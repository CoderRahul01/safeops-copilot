/**
 * Semantic Integrity Verification Test
 * Ensures backend responses adhere to the Semantic Protocol Spec.
 */

const { createReport, createLogReport, createErrorReport } = require('./src/utils/response.util');
const ErrorCodes = require('./src/constants/error-codes');

function testReport() {
  console.log('--- Testing REPORT Envelope ---');
  const report = createReport({
    reportType: 'TEST_REPORT',
    summary: 'Everything is functional.',
    metadata: { impact: 'Low', risk: 'Minimal', savings: '$0.00' },
    sections: [{ title: 'Status', value: 'OK' }]
  });

  console.log(JSON.stringify(report, null, 2));
  
  if (report.type !== 'REPORT') throw new Error('Invalid type');
  if (!report.metadata || report.metadata.impact !== 'Low') throw new Error('Missing metadata');
  console.log('✅ REPORT Integrity Passed');
}

function testError() {
  console.log('\n--- Testing ERROR_REPORT Envelope ---');
  const error = createErrorReport({
    code: ErrorCodes.CLOUD_NOT_CONNECTED,
    message: 'Test error message'
  });

  console.log(JSON.stringify(error, null, 2));

  if (error.type !== 'ERROR_REPORT') throw new Error('Invalid type');
  if (error.code !== 'CLOUD_NOT_CONNECTED') throw new Error('Invalid code');
  console.log('✅ ERROR_REPORT Integrity Passed');
}

try {
  testReport();
  testError();
  console.log('\n✨ ALL SEMANTIC PROTOCOL TESTS PASSED ✨');
} catch (err) {
  console.error('\n❌ TEST FAILED:', err.message);
  process.exit(1);
}
