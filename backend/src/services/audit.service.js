const Audit = require('../models/audit.model');
const Intent = require('../models/intent.model');

/**
 * Audit Service
 * Centralized persistence for the Semantic Control Plane.
 * Records all Reports, Logs, and Errors to MongoDB for traceability.
 */
class AuditService {
  /**
   * Record a standard Semantic Report
   * @param {string} userId - User UID
   * @param {Object} report - The REPORT envelope
   * @param {string} intentId - Optional ID of the intent that triggered this
   */
  async recordReport(userId, report, intentId = null) {
    try {
      if (!userId || !report) return null;

      const audit = new Audit({
        userId,
        orgId: 'default', // Fallback orgId
        intentId,
        provider: report.metadata?.provider || 'system',
        action: report.reportType || 'SEMANTIC_REPORT',
        payload: report,
        severity: report.metadata?.risk === 'Critical' ? 'HIGH' : 'INFO',
        timestamp: report.timestamp || new Date().toISOString()
      });

      await audit.save();
      console.log(`🔊 [AuditService] REPORT Persisted: ${report.reportType} for User:${userId}`);
      return audit;
    } catch (error) {
      console.error('❌ [AuditService] Failed to record report:', error.message);
      return null;
    }
  }

  /**
   * Record a Log Trace (Snapshots of Cloud Logs)
   * @param {string} userId - User UID
   * @param {Object} logReport - The LOG_REPORT envelope
   */
  async recordLogTrace(userId, logReport) {
    try {
      if (!userId || !logReport) return null;

      const audit = new Audit({
        userId,
        orgId: 'default',
        provider: logReport.source || 'unknown',
        action: 'LOG_TRACE',
        payload: logReport,
        severity: 'INFO',
        timestamp: logReport.timestamp || new Date().toISOString()
      });

      await audit.save();
      console.log(`🔊 [AuditService] LOG_TRACE Persisted: ${logReport.source} (${logReport.entries?.length || 0} entries)`);
      return audit;
    } catch (error) {
      console.error('❌ [AuditService] Failed to record log trace:', error.message);
      return null;
    }
  }

  /**
   * Record an Error Report
   * @param {string} userId - User UID
   * @param {Object} errorReport - The ERROR_REPORT envelope
   * @param {Object} context - Additional context (provider, action)
   */
  async recordError(userId, errorReport, context = {}) {
    try {
      if (!userId || !errorReport) return null;

      const audit = new Audit({
        userId,
        orgId: 'default',
        provider: context.provider || 'system',
        action: `ERROR:${errorReport.code || 'UNKNOWN'}`,
        payload: errorReport,
        severity: 'MEDIUM',
        timestamp: errorReport.timestamp || new Date().toISOString()
      });

      await audit.save();
      console.log(`🔊 [AuditService] ERROR Persisted: ${errorReport.code} for User:${userId}`);
      return audit;
    } catch (error) {
      console.error('❌ [AuditService] Failed to record error:', error.message);
      return null;
    }
  }
}

module.exports = new AuditService();
