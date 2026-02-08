/**
 * Semantic Response Utility
 * Enforces structured response envelopes for Tambo AI
 */

/**
 * Create a standard REPORT response
 */
const createReport = ({ reportType, summary, metadata = { impact: 'N/A', risk: 'N/A', savings: 'N/A' }, sections = [], actions = [], hooks = [] }) => ({
  type: 'REPORT',
  reportType,
  summary,
  metadata,
  sections,
  actions,
  hooks,
  timestamp: new Date().toISOString()
});

/**
 * Create a standard LOG_REPORT response
 */
const createLogReport = ({ source, entries = [] }) => ({
  type: 'LOG_REPORT',
  source,
  entries,
  timestamp: new Date().toISOString()
});

/**
 * Create a standard ERROR_REPORT response
 */
const createErrorReport = ({ error, message, code = 'INTERNAL_ERROR' }) => ({
  type: 'ERROR_REPORT',
  error: error || message,
  message: message || error,
  code,
  timestamp: new Date().toISOString()
});

module.exports = {
  createReport,
  createLogReport,
  createErrorReport
};
