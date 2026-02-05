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

    // In production, Firebase Admin often picks up credentials automatically 
    // from the environment (GCP service account).
    if (process.env.NODE_ENV === 'production' && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp({
        projectId: process.env.PROJECT_ID
      });
    } else {
      // Use explicit service account file
      admin.initializeApp({
        credential: admin.credential.cert(require(resolvedPath)),
        projectId: process.env.PROJECT_ID
      });
    }

    console.log('🛡️  Firebase Admin initialized successfully');
    return admin;
  } catch (error) {
    console.warn('⚠️  Firebase Admin initialization failed:', error.message);
    console.log('💡 Continuing in unauthenticated mode for development...');
    return null;
  }
};

module.exports = { initialize };
