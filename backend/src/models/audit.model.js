const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  orgId: { type: String, required: true, index: true },
  intentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Intent', index: true },
  
  provider: { type: String, required: true },
  action: { type: String, required: true },
  resourceId: { type: String },
  
  payload: { type: mongoose.Schema.Types.Mixed },
  previousState: { type: mongoose.Schema.Types.Mixed },
  newState: { type: mongoose.Schema.Types.Mixed },
  
  ipAddress: { type: String },
  userAgent: { type: String },
  
  severity: { 
    type: String, 
    enum: ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'INFO'
  }
}, { timestamps: true });

// Make audit logs essentially immutable via middleware if needed
// or just enforce it via the service layer

module.exports = mongoose.model('Audit', auditSchema);
