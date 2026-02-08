const { Logging } = require('@google-cloud/logging');
const gcpAdapter = require('./adapters/gcp.adapter');
const credentialService = require('./credential.service');

/**
 * GCP Logging Service
 * Interfaces with Google Cloud Logging to fetch real infrastructure logs.
 */
class LoggingService {
  constructor() {
    this.loggingMap = new Map(); // Cache logging clients per user
  }

  /**
   * Get an authenticated Logging client for a specific user
   * @param {string} userId - User UID
   */
  async getClient(userId) {
    if (this.loggingMap.has(userId)) {
      return this.loggingMap.get(userId);
    }

    const connection = userId !== 'dev-user' ? await credentialService.getConnection(userId, 'gcp') : null;
    const authClient = await gcpAdapter.getAuthClient(userId);
    
    // Determine projectId - prioritize connection JSON, then env, then fallback
    const projectId = connection?.project_id || process.env.PROJECT_ID || 'arcane-dolphin-484007-f8';
    
    console.log(`📡 [Logging] Initializing client for project: ${projectId}`);
    
    const logging = new Logging({
      projectId,
      authClient
    });

    this.loggingMap.set(userId, logging);
    return logging;
  }

  /**
   * Fetch logs for the project
   * @param {string} userId - User UID
   * @param {number} limit - Number of logs to fetch
   */
  async getLogs(userId, limit = 20) {
    try {
      const logging = await this.getClient(userId);
      
      // Filter for general activity or specific resources if needed
      // Currently fetching 'global' resource logs as a baseline
      const options = {
        pageSize: limit,
        orderBy: 'timestamp desc',
        filter: 'resource.type="global" OR resource.type="cloud_run_revision"' 
      };

      const [entries] = await logging.getEntries(options);

      const logEntries = entries.map(entry => ({
        timestamp: entry.metadata.timestamp || new Date().toISOString(),
        level: this.mapSeverityToLevel(entry.metadata.severity),
        message: this.extractMessage(entry)
      }));

      const { createLogReport } = require('../utils/response.util');
      return createLogReport({
        source: 'GCP',
        entries: logEntries
      });
    } catch (error) {
      console.error('Failed to fetch GCP logs:', error);
      throw error;
    }
  }

  /**
   * Maps GCP Severity to our frontend 'info' | 'warn' | 'error' | 'success'
   */
  mapSeverityToLevel(severity) {
    if (!severity) return 'info';
    const s = severity.toString().toUpperCase();
    if (['ERROR', 'CRITICAL', 'ALERT', 'EMERGENCY'].includes(s)) return 'error';
    if (['WARNING'].includes(s)) return 'warn';
    if (['NOTICE', 'INFO'].includes(s)) return 'info';
    return 'info';
  }

  extractMessage(entry) {
    if (typeof entry.data === 'string') return entry.data;
    if (entry.data && entry.data.message) return entry.data.message;
    if (entry.metadata && entry.metadata.textPayload) return entry.metadata.textPayload;
    return JSON.stringify(entry.data || 'Empty log payload');
  }
}

module.exports = new LoggingService();
