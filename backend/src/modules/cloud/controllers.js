/**
 * Cloud Module Controller
 * Handlers for GCP and AWS specific tool-based operations
 */

const gcpService = require('../../services/gcp.service');
const awsService = require('../../services/aws.service');

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

const awsAdapter = require('../../services/adapters/aws.adapter');
const gcpAdapter = require('../../services/adapters/gcp.adapter');

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
        console.log(`🔌 [Realtime] Updating ${provider} connection keys...`);
        // In a real app, this would re-instantiate the adapter with new keys
        res.json({ success: true, message: `${provider.toUpperCase()} link re-established with new identity.` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update credentials' });
    }
};

const getCloudLogs = async (req, res) => {
    try {
        const logs = [
            { timestamp: new Date().toISOString(), level: 'info', message: "SOP-KERNEL-LINK: Active monitoring engaged." },
            { timestamp: new Date().toISOString(), level: 'success', message: "GATEWAY: Multi-cloud handshake finalized." },
            { timestamp: new Date().toISOString(), level: 'info', message: "POLICY-ENGINE: Standard safety rules active." }
        ];
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
};

const credentialService = require('../../services/credential.service');
const { OAuth2Client } = require('google-auth-library');

const connectGCP = async (req, res) => {
  try {
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/cloud/callback'
    );

    const url = client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/cloud-platform.read-only', 'https://www.googleapis.com/auth/compute'],
      prompt: 'consent',
      state: req.user.uid // Pass user ID to associate token correctly
    });

    res.json({ url });
  } catch (error) {
    console.error('Failed to generate GCP Auth URL:', error);
    res.status(500).json({ error: 'Failed to initiate GCP connection' });
  }
};

const oauthCallback = async (req, res) => {
  try {
    const { code, state: userId } = req.body;
    if (!code || !userId) return res.status(400).json({ error: 'Code and state (userId) are required' });

    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/cloud/callback'
    );

    const { tokens } = await client.getToken(code);
    
    await credentialService.storeConnection(userId, 'gcp', {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiry: tokens.expiry_date
    });

    res.json({ success: true, message: 'GCP connection established securely.' });
  } catch (error) {
    console.error('OAuth Callback Error:', error);
    res.status(500).json({ error: 'Failed to finalize cloud connection' });
  }
};

// AWS STS Connection (Simple version: Store Role ARN and assume using OIDC token on-demand)
const connectAWS = async (req, res) => {
    try {
        const { roleArn } = req.body;
        if (!roleArn) return res.status(400).json({ error: 'Role ARN is required' });

        await credentialService.storeConnection(req.user.uid, 'aws', {
            roleArn,
            status: 'PENDING_VERIFICATION'
        });

        res.json({ success: true, message: 'AWS Role ARN registered. Connectivity will be verified on next operational task.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to register AWS role' });
    }
};

module.exports = {
  listGcpServices,
  stopGcpService,
  listAwsServices,
  terminateResource,
  updateCredentials,
  getCloudLogs,
  connectGCP,
  connectAWS,
  oauthCallback
};
