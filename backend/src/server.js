const app = require('./app');
const firestoreService = require('./services/firestore.service');
const gcpService = require('./services/gcp.service');
require('dotenv').config();
const firebaseConfig = require('./config/firebase.config');
const mongodbConfig = require('./config/mongodb.config');

const port = process.env.PORT || 8080;

/**
 * Fail-Fast Environment Validation
 */
function validateEnv() {
  const required = ['MONGODB_URI', 'PROJECT_ID'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error(`❌ CRITICAL: Missing required environment variables: ${missing.join(', ')}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

async function init() {
  try {
    console.log('⚙️  Starting SafeOps Backend Initialization...');
    
    // 1. Validate Environment
    validateEnv();

    // 2. Initialize Firebase (Primary Identity)
    const firebaseApp = firebaseConfig.initialize();
    if (!firebaseApp && process.env.NODE_ENV === 'production') {
      throw new Error('Firebase Admin failed to initialize in production');
    }

    // 3. Initialize Databases
    await Promise.all([
      firestoreService.initialize(),
      mongodbConfig.connect()
    ]);
    console.log('🔥 Firestore & 🍃 MongoDB connected successfully');
    
    // 4. Validate Cloud Credentials
    const gcpStatus = await gcpService.checkCredentials();
    if (gcpStatus.authenticated) {
      console.log(`🌐 GCP authenticated for project: ${gcpStatus.projectId}`);
    } else {
      console.warn('⚠️  GCP authentication not fully configured');
    }
    
    // 5. Start Listener
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`\x1b[32m🚀 SafeOps Backend Live on port ${port} [${process.env.NODE_ENV || 'development'}]\x1b[0m`);
    });

  } catch (error) {
    console.error('❌ FATAL: Failed to initialize services:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n📡 Received ${signal}, shutting down gracefully...`);
  try {
    await Promise.all([
      firestoreService.close(),
      mongodbConfig.close()
    ]);
    console.log('✅ Connections closed. Goodbye.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

init();
