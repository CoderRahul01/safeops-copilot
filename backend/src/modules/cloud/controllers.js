/**
 * Cloud Module Controller
 * Handlers for GCP and AWS specific tool-based operations
 */

const gcpService = require('../../services/gcp.service');
const awsService = require('../../services/aws.service');
const awsAdapter = require('../../services/adapters/aws.adapter');
const gcpAdapter = require('../../services/adapters/gcp.adapter');
const credentialService = require('../../services/credential.service');
const loggingService = require('../../services/logging.service');

// GCP Handlers
const listGcpServices = async (req, res) => {
  try {
    const { region } = req.query;
    const result = await gcpService.listCloudRunServices(region);
    res.json(result);
  } catch (error) {
    console.error('Failed to list GCP services:', error);
    res.status(500).json({ error: 'Failed to list GCP services', message: error.message });
  }
};

const stopGcpService = async (req, res) => {
  try {
    const { serviceName, region } = req.body;
    if (!serviceName) return res.status(400).json({ error: "serviceName is required" });
    const result = await gcpService.stopCloudRun(serviceName, region);
    res.json({ ...result, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to stop GCP service:', error);
    res.status(500).json({ error: 'Failed to stop GCP service', message: error.message });
  }
};

// AWS Handlers
const listAwsServices = async (req, res) => {
  try {
    const result = await awsAdapter.listResources();
    res.json(result);
  } catch (error) {
    console.error('Failed to list AWS resources:', error);
    res.status(500).json({ error: 'Failed to list AWS resources', message: error.message });
  }
};

// Unified Termination Handler
const terminateResource = async (req, res) => {
  try {
    const { resourceId, resourceName, provider, region, zone, type } = req.body;
    
    if (!provider) return res.status(400).json({ error: "provider is required" });
    
    const adapter = provider === 'aws' ? awsAdapter : (provider === 'gcp' ? gcpAdapter : null);
    if (!adapter) return res.status(400).json({ error: "Invalid provider" });

    const result = await adapter.executeAction('STOP_RESOURCE', {
      resourceId,
      resourceName,
      region,
      zone,
      type
    }, req.user.uid);

    res.json(result);
  } catch (error) {
    console.error('Termination failed:', error);
    res.status(500).json({ error: 'Termination failed', message: error.message });
  }
};

const updateCredentials = async (req, res) => {
    try {
        const { provider, credentials } = req.body;
        const userId = req.user.uid;

        console.log(`🔌 [Simplification] Direct Onboarding: Received ${provider} keys for User ${userId}`);
        await credentialService.storeConnection(userId, provider, credentials);

        res.json({ 
          success: true, 
          message: `${provider.toUpperCase()} connection established using direct credentials. Uplink verified.` 
        });
    } catch (error) {
        console.error('❌ [Onboarding] Failed to store credentials:', error);
        res.status(500).json({ 
          error: 'Failed to onboard credentials', 
          message: error.message
        });
    }
};

const getCloudOverview = async (req, res) => {
    try {
        const userId = req.user?.uid || 'dev-user';
        const [logs, awsConn, gcpConn] = await Promise.all([
            loggingService.getLogs(userId),
            credentialService.getConnection(userId, 'aws'),
            credentialService.getConnection(userId, 'gcp')
        ]);

        res.json({
            logs,
            status: {
                aws: !!awsConn,
                gcp: !!gcpConn
            }
        });
    } catch (error) {
        console.error('Failed to fetch cloud overview:', error);
        res.status(500).json({ error: 'Failed to fetch cloud overview', message: error.message });
    }
};

const getCloudLogs = async (req, res) => {
    try {
        const userId = req.user?.uid || 'dev-user';
        const logs = await loggingService.getLogs(userId);
        res.json(logs);
    } catch (error) {
        console.error('Failed to fetch logs:', error);
        res.status(500).json({ error: 'Failed to fetch logs', message: error.message });
    }
};

const getConnectionStatus = async (req, res) => {
    try {
        const userId = req.user.uid;
        const awsConn = await credentialService.getConnection(userId, 'aws');
        const gcpConn = await credentialService.getConnection(userId, 'gcp');

        res.json({
            aws: !!awsConn,
            gcp: !!gcpConn
        });
    } catch (error) {
        console.error('Failed to get connection status:', error);
        res.status(500).json({ error: 'Failed to get connection status', message: error.message });
    }
};

module.exports = {
  listGcpServices,
  stopGcpService,
  listAwsServices,
  terminateResource,
  updateCredentials,
  getCloudLogs,
  getConnectionStatus,
  getCloudOverview
};
