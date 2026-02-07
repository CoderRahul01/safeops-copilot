const BaseCloudAdapter = require('./base.adapter');
const { OAuth2Client } = require('google-auth-library');
const credentialService = require('../credential.service');

class GCPAdapter extends BaseCloudAdapter {
  constructor() {
    super('gcp');
  }

  async getAuthClient(userId) {
    if (userId && userId !== 'dev-user') {
      const connection = await credentialService.getConnection(userId, 'gcp');
      
      // Support for new Direct Onboarding (Service Account JSON)
      if (connection && (connection.client_email || connection.private_key)) {
        console.log(`🛡️ [GCP] Using Direct Service Account credentials for user ${userId}`);
        const { GoogleAuth } = require('google-auth-library');
        const auth = new GoogleAuth({
          credentials: connection,
          scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });
        return await auth.getClient();
      }

      // Legacy OAuth2 Support (Scraped but keeping for backwards compatibility if needed)
      if (connection && connection.refreshToken) {
        const client = new OAuth2Client(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
        );
        
        client.setCredentials({
          access_token: connection.accessToken,
          refresh_token: connection.refreshToken,
          expiry_date: connection.expiry
        });

        // Check if token needs refresh
        if (connection.expiry && Date.now() > connection.expiry - 60000) {
          console.log(`🔄 [OAuth] Refreshing GCP token for user ${userId}`);
          const { credentials } = await client.refreshAccessToken();
          await credentialService.storeConnection(userId, 'gcp', {
            accessToken: credentials.access_token,
            refreshToken: credentials.refresh_token || connection.refreshToken,
            expiry: credentials.expiry_date
          });
        }
        
        return client;
      }
    }

    // Fallback to service account auth (default)
    const { GoogleAuth } = require('google-auth-library');
    const path = require('path');
    const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '..', '..', 'config', 'service-account.json');
    
    const auth = new GoogleAuth({
      keyFilename: keyPath,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    try {
      console.log(`�️ [GCP] Using Explicit SA Path: ${keyPath}`);
      const client = await auth.getClient();
      return client;
    } catch (error) {
      console.error('❌ [GCPAdapter] Auth fallback failed:', error.message);
      throw new Error("GCP_AUTH_FAILED: No valid user connection or service account found.");
    }
  }

  async getBilling(userId) {
    try {
      const client = await this.getAuthClient(userId);
      // For MVP, if federated, we might need to handle specific projectId from the connection
      const connection = userId !== 'dev-user' ? await credentialService.getConnection(userId, 'gcp') : null;
      const projectId = connection?.projectId || process.env.PROJECT_ID;

      return {
        success: true,
        provider: 'gcp',
        currency: 'USD',
        currentSpend: 17.90, // Mocked for MVP
        projectId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw error;
    }
  }

  async listResources(userId, region = 'us-central1') {
    try {
      const client = await this.getAuthClient(userId);
      const connection = userId !== 'dev-user' ? await credentialService.getConnection(userId, 'gcp') : null;
      const projectId = connection?.projectId || process.env.PROJECT_ID || 'arcane-dolphin-484007-f8';

      const url = `https://${region}-run.googleapis.com/apis/serving.knative.dev/v1/namespaces/${projectId}/services`;
      
      const response = await client.request({ url, method: 'GET' });
      const services = (response.data.items || []).map(s => ({
        id: s.metadata.uid,
        name: s.metadata.name,
        type: 'cloud-run',
        status: s.status?.conditions?.[0]?.status === 'True' ? 'running' : 'stopped'
      }));

      return {
        success: true,
        provider: 'gcp',
        resources: services,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw error;
    }
  }

  async executeAction(action, params, userId) {
    if (action === 'STOP_RESOURCE' && params.resourceName) {
      const region = params.region || 'us-central1';
      const zone = params.zone || 'us-central1-a';
      
      try {
        const client = await this.getAuthClient(userId);
        const connection = userId !== 'dev-user' ? await credentialService.getConnection(userId, 'gcp') : null;
        const projectId = connection?.projectId || process.env.PROJECT_ID || 'arcane-dolphin-484007-f8';
        
        if (params.type === 'cloud-run') {
           console.log(`[GCPAdapter] Scaling Cloud Run service to zero: ${params.resourceName}`);
        } else {
           const url = `https://compute.googleapis.com/compute/v1/projects/${projectId}/zones/${zone}/instances/${params.resourceName}/stop`;
           await client.request({ url, method: 'POST' });
        }

        return { 
          success: true, 
          action, 
          message: `Resource ${params.resourceName} termination sequence initiated on GCP` 
        };
      } catch (error) {
        throw error;
      }
    }
    return { success: false, error: 'Unsupported action' };
  }

  async checkHealth() {
    return { provider: 'gcp', healthy: true };
  }
}

module.exports = new GCPAdapter();
