/**
 * Base Cloud Adapter Interface
 * Every cloud-specific adapter must implement these methods.
 */
class BaseCloudAdapter {
  constructor(provider) {
    this.provider = provider;
    this.isReadOnly = process.env.SAFE_OPS_READ_ONLY !== 'false'; // Secure by default
  }

  /**
   * Get billing/cost information for the provider
   */
  async getBilling() {
    throw new Error('getBilling() not implemented');
  }

  /**
   * List resources managed by the provider
   */
  async listResources() {
    throw new Error('listResources() not implemented');
  }

  /**
   * Perform a specific action on a resource
   * @param {string} action - Action code (e.g. STOP, RESTART)
   * @param {Object} params - Action parameters
   */
  async executeAction(action, params) {
    if (this.isReadOnly) {
        throw new Error(`🚫 Action BLOCKED: ${action} is a write operation and system is in READ-ONLY mode.`);
    }
    throw new Error(`executeAction(${action}) not implemented`);
  }

  /**
   * Check if credentials are valid
   */
  async checkHealth() {
    throw new Error('checkHealth() not implemented');
  }
}

module.exports = BaseCloudAdapter;
