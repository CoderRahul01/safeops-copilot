const { describe, it, expect, spyOn } = require('bun:test');
const intentService = require('../src/services/intent.service');
const journeyService = require('../src/services/journey.service');
const Intent = require('../src/models/intent.model');

describe('SafeOps Journey Engine', () => {
  // Mock dependencies
  spyOn(Intent.prototype, 'save').mockImplementation(async function() { return this; });
  spyOn(Intent, 'findById').mockImplementation(async (id) => {
      return new Intent({ _id: id, steps: ['Step 1', 'Step 2'], status: 'PENDING_VALIDATION' });
  });

  it('should generate a journey with steps and CTAs using rule-based parser', async () => {
    const prompt = 'Show my AWS costs';
    const context = { userId: 'u1', orgId: 'o1' };
    
    // We force rule-based for the test
    const intent = await intentService.normalize(prompt, context);
    
    expect(intent.steps).toBeDefined();
    expect(intent.steps.length).toBeGreaterThan(0);
    expect(intent.ctas.length).toBeGreaterThan(0);
    expect(intent.summary).toContain('cost');
  });

  it('should advance an intent step correctly', async () => {
    const intentId = '507f1f77bcf86cd799439011';
    const nextStep = 'Step 2';
    
    const intent = await journeyService.advanceStep(intentId, nextStep);
    
    expect(intent.status).toBe('EXECUTING');
  });

  it('should block intents with low confidence during validation', async () => {
    const intent = new Intent({
        intentType: 'UNKNOWN',
        confidence: 0.5,
        status: 'PENDING_VALIDATION'
    });
    
    const validatedIntent = await intentService.validate(intent);
    expect(validatedIntent.status).toBe('BLOCKED');
  });
});
