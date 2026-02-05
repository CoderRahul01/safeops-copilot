/**
 * Inventory Module Controller
 * Handlers for resource inventory and status
 */

const firestoreService = require('../../services/firestore.service');

const getResources = async (req, res) => {
  try {
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
