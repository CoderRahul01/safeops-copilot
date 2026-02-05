const app = require('./app');
const firestoreService = require('./services/firestore.service');
const gcpService = require('./services/gcp.service');
require('dotenv').config();
const firebaseConfig = require('./config/firebase.config');

const port = process.env.PORT || 8080;

async function init() {
  try {
    // 0. Initialize Firebase (for Auth)
    firebaseConfig.initialize();

    // 1. Initialize Firestore
    await firestoreService.initialize();
    console.log('🔥 Firestore service initialized successfully');
    
    // 2. Check Cloud Credentials
    const gcpStatus = await gcpService.checkCredentials();
    if (gcpStatus.authenticated) {
      console.log(`🌐 GCP authenticated for project: ${gcpStatus.projectId}`);
    } else {
      console.log('⚠️  GCP authentication not configured - using development mode');
    }
    
    // 3. Start Listener
    app.listen(port, '0.0.0.0', () => {
      console.log(`\x1b[32m🚀 SafeOps Backend Live on port ${port}\x1b[0m`);
    });

  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    process.exit(1);
  }
}

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n📡 Received ${signal}, shutting down gracefully...`);
  try {
    await firestoreService.close();
    console.log('✅ Server shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

init();
