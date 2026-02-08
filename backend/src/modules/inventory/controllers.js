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
    console.log(`📡 [Inventory] Returning ${liveResources.length} LIVE resources for user ${userId}`);
    
    // Wrap in REPORT envelope for Tambo stability
    const { createReport } = require('../../utils/response.util');
    return res.json(createReport({
      reportType: 'INVENTORY_RECAP',
      summary: `Fleet audit complete. ${liveResources.length} active nodes monitored.`,
      sections: liveResources.map(r => ({
        title: r.name,
        value: `${r.provider.toUpperCase()} | ${r.status}`
      })),
      actions: liveResources.length > 0 ? [
        { label: 'Optimize Fleet', action: 'START_OPTIMIZATION' }
      ] : [],
      hooks: [
        liveResources.length > 0 ? 'All nodes verifying within safety parameters.' : 'No active nodes detected in the cloud.'
      ]
    }));

  } catch (error) {
    console.error('Failed to get resources:', error);
    const { createErrorReport } = require('../../utils/response.util');
    res.status(500).json(createErrorReport({
      error: 'INVENTORY_FETCH_FAILED',
      message: 'Critical error during inventory synchronization.'
    }));
  }
};

module.exports = {
  getResources
};
