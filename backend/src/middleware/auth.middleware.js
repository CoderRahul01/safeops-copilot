const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

function initializeFirebase() {
  if (firebaseInitialized) return;
  
  try {
    // Check if running on Cloud Run (uses Application Default Credentials)
    if (process.env.K_SERVICE) {
      admin.initializeApp({
        projectId: process.env.PROJECT_ID || 'arcane-dolphin-484007-f8'
      });
    } else {
      // Local development - use service account key
      const serviceAccount = require('../safeops-sa-key.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.PROJECT_ID || 'arcane-dolphin-484007-f8'
      });
    }
    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
  }
}

/**
 * Middleware to verify Firebase ID tokens
 */
async function verifyAuth(req, res, next) {
  initializeFirebase();
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header'
    });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email
    };
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }
}

/**
 * Optional auth middleware - allows requests without auth but attaches user if present
 */
async function optionalAuth(req, res, next) {
  initializeFirebase();
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email
    };
  } catch (error) {
    console.warn('Optional auth failed:', error.message);
    req.user = null;
  }
  
  next();
}

module.exports = {
  verifyAuth,
  optionalAuth,
  initializeFirebase
};
