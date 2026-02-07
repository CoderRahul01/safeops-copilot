/**
 * MongoDB & Partitioning Verification Script
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Intent = require('../src/models/intent.model');
const Audit = require('../src/models/audit.model');

async function verify() {
  console.log('🧪 Starting Database Partitioning Verification...');
  
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/safeops";
  
  try {
    console.log(`📡 Connecting to: ${MONGODB_URI.split('@').pop()}`);
    await mongoose.connect(MONGODB_URI, { dbName: 'safeops', serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connection Successful!');

    // 1. Check database name
    console.log(`📂 Database Name: ${mongoose.connection.db.databaseName}`);
    if (mongoose.connection.db.databaseName === 'safeops') {
        console.log('✅ Database Partition: safeops verified.');
    } else {
        console.warn('⚠️  Warning: Unexpected database name.');
    }

    // 2. Mock persistence test
    console.log('📝 Testing persistence for Intents...');
    const testIntent = new Intent({
        userId: 'test-user',
        orgId: 'test-org',
        rawPrompt: 'Verify MongoDB Connectivity',
        intentType: 'SECURITY',
        provider: 'none',
        action: 'VERIFY_DB',
        confidence: 1.0
    });
    await testIntent.save();
    console.log(`✅ Intent persisted. ID: ${testIntent._id}`);

    console.log('📝 Testing persistence for Audits...');
    const testAudit = new Audit({
        userId: 'test-user',
        orgId: 'test-org',
        intentId: testIntent._id,
        provider: 'internal',
        action: 'DB_VERIFICATION',
        severity: 'INFO'
    });
    await testAudit.save();
    console.log(`✅ Audit persisted. ID: ${testAudit._id}`);

    // 3. Cleanup
    await testIntent.deleteOne();
    await testAudit.deleteOne();
    console.log('🧹 Cleanup complete.');

  } catch (error) {
    console.error('❌ Verification Failed:', error.message);
    if (error.message.includes('whitelist') || error.message.includes('selection timeout')) {
        console.log('💡 TIP: This is likely a MongoDB Atlas IP Whitelist issue.');
    }
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
}

verify();
