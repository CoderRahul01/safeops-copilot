const mongoose = require('mongoose');

const intentSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  orgId: { type: String, required: true, index: true },
  threadId: { type: String, index: true },
  rawPrompt: { type: String, required: true },
  
  // Normalized Intent
  intentType: { 
    type: String, 
    enum: ['COST_CONTROL', 'INVENTORY', 'SECURITY', 'COMPLIANCE', 'DEPLOYMENT', 'UNKNOWN'],
    required: true,
    index: true 
  },
  provider: { type: String, enum: ['aws', 'gcp', 'multi', 'none'], required: true },
  action: { type: String, required: true },
  parameters: { type: mongoose.Schema.Types.Mixed, default: {} },
  
  // The Journey Pattern (Tambo Strict Format)
  summary: { type: String },
  steps: [{ type: String }], // Plan for execution
  ctas: [{
    label: { type: String },
    action: { type: String },
    type: { type: String, enum: ['EXECUTE', 'VIEW_BILLING', 'NAVIGATE', 'LINK'], default: 'EXECUTE' },
    requiresConfirmation: { type: Boolean, default: false }
  }],
  hooks: [{ type: String }], // Cost estimates, safety alerts
  
  // State Tracking
  status: { 
    type: String, 
    enum: ['PENDING_VALIDATION', 'PENDING_CONFIRMATION', 'EXECUTING', 'COMPLETED', 'FAILED', 'BLOCKED'],
    default: 'PENDING_VALIDATION'
  },
  confidence: { type: Number, min: 0, max: 1 },
  requiresConfirmation: { type: Boolean, default: true },
  
  // Execution Output
  result: { type: mongoose.Schema.Types.Mixed },
  error: { type: String },
  executionTimeMs: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Intent', intentSchema);
