const mongoose = require('mongoose');

const cloudConnectionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  provider: {
    type: String,
    enum: ['aws', 'gcp'],
    required: true
  },
  projectId: {
    type: String,
    default: null
  },
  accountId: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['CONNECTED', 'DISCONNECTED'],
    default: 'CONNECTED'
  },
  encryptedData: {
    type: String,
    required: true
  },
  connectedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure unique connection per user per provider
cloudConnectionSchema.index({ userId: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model('CloudConnection', cloudConnectionSchema);
