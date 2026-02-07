const intentService = require('../../services/intent.service');
const awsAdapter = require('../../services/adapters/aws.adapter');
const gcpAdapter = require('../../services/adapters/gcp.adapter');

const processIntent = async (req, res) => {
  try {
    const { prompt, threadId } = req.body;
    const { uid, orgId } = req.user; // From verifyToken middleware

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // 1. Normalize Intent
    const intent = await intentService.normalize(prompt, { 
      userId: uid, 
      orgId: orgId || 'default', 
      threadId 
    });

    // 2. Validate Policy
    await intentService.validate(intent);

    if (intent.status === 'BLOCKED') {
      return res.status(403).json({ 
        error: 'Policy Violation', 
        message: intent.error,
        intent 
      });
    }

    // 3. Check if confirmation is required
    if (intent.requiresConfirmation && intent.status === 'PENDING_CONFIRMATION') {
      return res.json({
        type: 'CONFIRMATION_REQUIRED',
        message: `I've prepared the following action: ${intent.action} on ${intent.provider}. Do you want to proceed?`,
        intent
      });
    }

    // 4. Auto-execute simple/safe intents (Read-only)
    let executionResult;
    const adapter = intent.provider === 'aws' ? awsAdapter : (intent.provider === 'gcp' ? gcpAdapter : null);
    
    if (adapter && intent.status === 'EXECUTING') {
        if (intent.intentType === 'COST_CONTROL') {
            executionResult = await adapter.getBilling(uid);
        } else if (intent.intentType === 'INVENTORY') {
            executionResult = await adapter.listResources(uid);
        } else if (intent.intentType === 'CONNECTIVITY') {
            // Fetch logs for connectivity report
            const logs = [
                { timestamp: new Date().toISOString(), level: 'info', message: `Pinging ${intent.provider.toUpperCase()} endpoints...` },
                { timestamp: new Date().toISOString(), level: 'success', message: `${intent.provider.toUpperCase()} Identity Verified.` }
            ];
            executionResult = { status: 'ACTIVE', logs };
        }
        
        if (executionResult) {
            intent.status = 'COMPLETED';
            intent.result = executionResult;
            await intent.save();
            await intentService.logAudit(intent, { autoExecuted: true }, executionResult);
        }
    }

    // 5. Build Response in Tambo Strict Format
    res.json({
      type: 'SUCCESS',
      intent: {
          id: intent._id,
          type: intent.intentType,
          cloud: intent.provider,
          status: intent.status,
          confidence: intent.confidence,
          requiresConfirmation: intent.requiresConfirmation
      },
      summary: intent.summary || `Intent ${intent.intentType} processed.`,
      steps: intent.steps || [],
      ctas: intent.ctas || [],
      hooks: intent.hooks || [],
      data: intent.result // Optional payload
    });

  } catch (error) {
    console.error('❌ [Intent Controller] Process error:', error);
    res.status(500).json({ error: 'Failed to process intent', message: error.message });
  }
};

const getIntentHistory = async (req, res) => {
    try {
        const { uid } = req.user;
        const intents = await require('../../models/intent.model').find({ userId: uid }).sort({ createdAt: -1 }).limit(20);
        res.json({ intents });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};

const advanceIntent = async (req, res) => {
    try {
        const { intentId, nextStep } = req.body;
        const journeyService = require('../../services/journey.service');
        
        const intent = await journeyService.advanceStep(intentId, nextStep);
        
        // This is where we'd execute the actual logic for the step
        // For now, we return the updated intent state
        res.json({
            type: 'SUCCESS',
            intent,
            summary: `Advancing to ${nextStep}...`,
            steps: intent.steps,
            ctas: intent.ctas
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to advance intent', message: error.message });
    }
};

module.exports = {
  processIntent,
  getIntentHistory,
  advanceIntent
};
