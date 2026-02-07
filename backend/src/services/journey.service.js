const Intent = require('../models/intent.model');

/**
 * Journey Service
 * Manages the state of complex, multi-step cloud operations.
 */
class JourneyService {
  /**
   * Advance an intent to the next step and execute if needed
   */
  async advanceStep(intentId, nextStep) {
    const intent = await Intent.findById(intentId);
    if (!intent) throw new Error('Intent not found');

    const awsAdapter = require('./adapters/aws.adapter');
    const gcpAdapter = require('./adapters/gcp.adapter');

    console.log(`🚀 Advancing intent ${intentId} to step: ${nextStep}`);
    
    // If we're an executing state, perform the action
    if (intent.action === 'STOP_RESOURCE') {
       const adapter = intent.provider === 'aws' ? awsAdapter : (intent.provider === 'gcp' ? gcpAdapter : null);
       if (adapter) {
         const result = await adapter.executeAction('STOP_RESOURCE', intent.parameters);
         intent.result = result;
       }
    }

    intent.status = 'COMPLETED'; // For MVP, we auto-complete after one jump if it's an action
    await intent.save();
    
    return intent;
  }

  /**
   * Complete a journey
   * @param {string} intentId - The ID of the intent
   * @param {any} result - The final result
   */
  async completeJourney(intentId, result) {
    const intent = await Intent.findById(intentId);
    if (!intent) throw new Error('Intent not found');

    intent.status = 'COMPLETED';
    intent.result = result;
    await intent.save();
    
    return intent;
  }
}

module.exports = new JourneyService();
