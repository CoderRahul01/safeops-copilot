const admin = require('firebase-admin');

/**
 * Authentication Middleware
 * Verifies Firebase ID Tokens for protected routes.
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Missing or invalid authorization header' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // In production, we'd use admin.auth().verifyIdToken(token)
    // For now, if NODE_ENV is development or we are in hackathon mode, 
    // we might have a bypass or a mock check.
    
    if (process.env.NODE_ENV === 'development' && token === 'dev-token') {
      req.user = { uid: 'dev-user', email: 'dev@safeops.com' };
      return next();
    }

    // Attempting real verification if service account is available
    if (admin.apps.length > 0) {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const orgId = decodedToken.orgId || decodedToken.org_id;
      req.user = { uid: decodedToken.uid, email: decodedToken.email, orgId: orgId || 'default-org' };
      next();
    } else {
      console.warn('⚠️ Firebase Admin not initialized, skipping auth verification');
      // Fallback for demo/hackathon context if needed, but risky for production
      // req.user = { uid: 'demo-user' }; 
      // return next();
      return res.status(503).json({ error: 'Authentication service unavailable' });
    }
  } catch (error) {
    console.error('❌ Auth Error:', error.message);
    res.status(403).json({ 
      error: 'Forbidden', 
      message: 'Invalid or expired token' 
    });
  }
};

module.exports = { verifyToken };
