/**
 * Inventory Module Controller
 * Handlers for resource inventory and status
 */

const firestoreService = require('../../services/firestore.service');
const credentialService = require('../../services/credential.service');
const awsAdapter = require('../../services/adapters/aws.adapter');
const gcpAdapter = require('../../services/adapters/gcp.adapter');

const getResources = async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID missing' });
    }

    // 1. Check for Active Cloud Connections
    const [awsConn, gcpConn] = await Promise.all([
      credentialService.getConnection(userId, 'aws'),
      credentialService.getConnection(userId, 'gcp')
    ]);

    // 2. If connected, fetch live data in parallel
    let liveResources = [];
    const fetchPromises = [];

    if (awsConn) {
      fetchPromises.push(awsAdapter.listResources(userId).then(r => r.resources || []).catch(() => []));
    }
    if (gcpConn) {
      fetchPromises.push(gcpAdapter.listResources(userId).then(r => r.resources || []).catch(() => []));
    }

    if (fetchPromises.length > 0) {
      const results = await Promise.all(fetchPromises);
      liveResources = results.flat();
    }

    // 3. If a connection exists, return the liveResources array (even if empty).
    // This prevents showing mock data when the user has actually connected an account.
    if (awsConn || gcpConn) {
      console.log(`📡 [Inventory] Returning ${liveResources.length} LIVE resources for user ${userId}`);
      return res.json(liveResources);
    }

    // 4. Fallback to Firestore (which might have sample data) only if NO connections exist
    console.log(`📂 [Inventory] No cloud connections found for ${userId}, falling back to Firestore`);
    const resources = await firestoreService.getDeployments();
    res.json(resources);
  } catch (error) {
    console.error('Failed to get resources:', error);
    res.status(500).json({ error: 'Failed to retrieve resources', message: error.message });
  }
};

module.exports = {
  getResources
};
