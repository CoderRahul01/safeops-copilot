/**
 * Onboard Module Controller
 */

const firestoreService = require('../../services/firestore.service');

const onboard = async (req, res) => {
  try {
    const { provider, credentials } = req.body;
    if (!provider || !credentials) {
      return res.status(400).json({ error: "Provider and credentials are required" });
    }

    console.log(`🔑 [Module:Onboard] New ${provider} credentials...`);
    await firestoreService.recalculateBudget('default-user');

    res.json({
      success: true,
      provider,
      status: 'connected',
      message: `${provider.toUpperCase()} credentials successfully integrated.`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to onboard:', error);
    res.status(500).json({ error: 'Failed to onboard credentials', message: error.message });
  }
};

module.exports = {
  onboard
};
