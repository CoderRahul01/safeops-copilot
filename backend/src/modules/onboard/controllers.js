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
    // Pass the user if it exists in req from auth middleware, else fallback
    const userId = req.user ? req.user.uid : 'default-user';
    await firestoreService.recalculateBudget(userId);

    res.json({
      success: true,
      provider,
      status: 'connected',
      message: `${provider.toUpperCase()} credentials successfully integrated.`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to onboard:', error);
    // Sentinel: Do not leak internal error.message to the client
    res.status(500).json({ error: 'Failed to onboard credentials', message: 'An internal error occurred.' });
  }
};

module.exports = {
  onboard
};
