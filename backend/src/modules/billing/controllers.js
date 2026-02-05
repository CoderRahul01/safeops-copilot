/**
 * Billing Module Controller
 * Handlers for billing summary, context, and cloud billing data
 */

const firestoreService = require('../../services/firestore.service');
const gcpService = require('../../services/gcp.service');
const awsService = require('../../services/aws.service');

const getBillingContext = async (req, res) => {
  try {
    const snapshot = await firestoreService.getSnapshot();
    res.json({
      userRole: "infrastructure-admin",
      environment: "production",
      billingStatus: snapshot.billing,
      recommendation: snapshot.recommendation,
      metrics: {
        active_resources: snapshot.inventory.total,
        risk_count: snapshot.inventory.highRisk,
        saving_potential: snapshot.inventory.potentialSavings
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to get billing context:', error);
    res.status(500).json({ error: 'Failed to retrieve billing context', message: error.message });
  }
};

const getGcpBilling = async (req, res) => {
  try {
    const result = await gcpService.getBilling();
    res.json(result);
  } catch (error) {
    console.error('Failed to get GCP billing:', error);
    res.status(500).json({ error: 'Failed to get GCP billing', message: error.message });
  }
};

const getAwsBilling = async (req, res) => {
  try {
    const result = await awsService.getBilling();
    res.json(result);
  } catch (error) {
    console.error('Failed to get AWS billing:', error);
    res.status(500).json({ error: 'Failed to get AWS billing', message: error.message });
  }
};

module.exports = {
  getBillingContext,
  getGcpBilling,
  getAwsBilling
};
