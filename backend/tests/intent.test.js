const { describe, it, expect, spyOn } = require('bun:test');
const intentService = require('../src/services/intent.service');
const Intent = require('../src/models/intent.model');

describe('Intent Normalization Engine', () => {
  // Mock the save method on the Intent model prototype
  spyOn(Intent.prototype, 'save').mockImplementation(async function() {
    return this;
  });

  it('should normalize a billing prompt correctly', async () => {
    const prompt = 'Show me my AWS costs for this month';
    const context = { userId: 'user_1', orgId: 'org_1' };
    
    const intent = await intentService.normalize(prompt, context);
    
    expect(intent.intentType).toBe('COST_CONTROL');
    expect(intent.provider).toBe('aws');
    expect(intent.action).toBe('GET_BILLING');
  });

  it('should validate an intent and update its status', async () => {
    const prompt = 'What ec2 instances are running?';
    const context = { userId: 'user_1', orgId: 'org_1' };
    
    let intent = await intentService.normalize(prompt, context);
    intent = await intentService.validate(intent);
    
    expect(intent.intentType).toBe('INVENTORY');
    expect(intent.status).toBe('PENDING_CONFIRMATION');
  });

  it('should handle unknown intents gracefully', async () => {
    const prompt = 'Tell me a joke about clouds';
    const context = { userId: 'user_1', orgId: 'org_1' };
    
    let intent = await intentService.normalize(prompt, context);
    intent = await intentService.validate(intent);
    
    expect(intent.intentType).toBe('UNKNOWN');
    expect(intent.status).toBe('BLOCKED');
  });
});
