const admin = require('firebase-admin');
const path = require('path');

/**
 * Firebase Admin Initialization
 * Handles production and development environments.
 */
const initialize = () => {
  if (admin.apps.length > 0) return admin;

  try {
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
                             path.join(__dirname, 'service-account.json');
    
    // Resolve path relative to process.cwd() if it's not absolute
    const resolvedPath = path.isAbsolute(serviceAccountPath) 
      ? serviceAccountPath 
      : path.resolve(process.cwd(), serviceAccountPath);

    console.log(`🔧 [Firebase] Attempting initialization with path: ${resolvedPath}`);

    // Always try to use the service account file if it exists
    const fs = require('fs');
    if (fs.existsSync(resolvedPath)) {
      admin.initializeApp({
        credential: admin.credential.cert(require(resolvedPath)),
        projectId: process.env.PROJECT_ID || 'arcane-dolphin-484007-f8'
      });
      console.log('🛡️  Firebase Admin initialized with service account file');
    } else {
      // Fallback to ADC if no file found (e.g. on Cloud Run)
      admin.initializeApp({
        projectId: process.env.PROJECT_ID || 'arcane-dolphin-484007-f8'
      });
      console.log('🛡️  Firebase Admin initialized with Application Default Credentials');
    }

    return admin;

    console.log('🛡️  Firebase Admin initialized successfully');
    return admin;
  } catch (error) {
    console.warn('⚠️  Firebase Admin initialization failed:', error.message);
    console.log('💡 Continuing in unauthenticated mode for development...');
    return null;
  }
};

module.exports = { initialize };
