const mongoose = require('mongoose');

/**
 * MongoDB Initialization Script
 * Creates required collections and indexes
 */

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://maruthirp432_db_user:0Yk4V4yUQnhHPRrJ@cluster0.aa1mbrf.mongodb.net/';

async function initializeCollections() {
  try {
    console.log('📦 Initializing MongoDB collections...');
    
    const db = mongoose.connection.db;
    
    // Get list of existing collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('📋 Existing collections:', collectionNames);
    
    // Required collections
    const requiredCollections = [
      'cloudconnections',
      'audits',
      'intents'
    ];
    
    // Create missing collections
    for (const collName of requiredCollections) {
      if (!collectionNames.includes(collName)) {
        await db.createCollection(collName);
        console.log(`✅ Created collection: ${collName}`);
      } else {
        console.log(`✓ Collection exists: ${collName}`);
      }
    }
    
    // Create indexes for cloudconnections
    const cloudConnectionsColl = db.collection('cloudconnections');
    await cloudConnectionsColl.createIndex({ userId: 1, provider: 1 }, { unique: true });
    console.log('✅ Created index on cloudconnections: userId + provider');
    
    // Create indexes for audits
    const auditsColl = db.collection('audits');
    await auditsColl.createIndex({ userId: 1 });
    await auditsColl.createIndex({ createdAt: -1 });
    console.log('✅ Created indexes on audits');
    
    // Create indexes for intents
    const intentsColl = db.collection('intents');
    await intentsColl.createIndex({ userId: 1 });
    await intentsColl.createIndex({ status: 1 });
    console.log('✅ Created indexes on intents');
    
    console.log('✅ MongoDB collections initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize collections:', error.message);
    // Don't throw - allow server to continue
  }
}

async function connect() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log('📍 Database: safeops');
    
    // Disconnect if already connected (for hot reload)
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    
    // Initialize collections after connection
    await initializeCollections();
    
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('🔍 Connection string (masked):', MONGODB_URI.replace(/:[^:@]+@/, ':****@'));
    console.warn('⚠️  Continuing without MongoDB. Some features may be limited.');
    
    // Don't throw - allow server to start
    return null;
  }
}

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  Mongoose disconnected from MongoDB');
});

module.exports = { connect, initializeCollections };
