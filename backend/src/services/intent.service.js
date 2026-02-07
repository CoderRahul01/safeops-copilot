const { VertexAI } = require('@google-cloud/vertexai');
const Intent = require('../models/intent.model');
const Audit = require('../models/audit.model');

class IntentService {
  constructor() {
    this.useVertex = process.env.USE_VERTEX_AI === 'true';
    if (this.useVertex) {
      this.vertexAi = new VertexAI({
        project: process.env.PROJECT_ID,
        location: process.env.VERTEX_LOCATION || 'us-central1'
      });
      this.model = 'gemini-1.5-flash'; // Precise and fast "Operator" model
    }
  }

  /**
   * Normalize a raw prompt into a structured intent using Vertex AI
   * @param {string} prompt - Raw user input
   * @param {Object} context - User/Org context
   */
  async normalize(prompt, context) {
    console.log(`🧠 Normalizing intent for prompt: "${prompt}"`);
    
    let normalized;
    if (this.useVertex) {
      normalized = await this._callVertexAI(prompt);
    } else {
      normalized = this._ruleBasedParser(prompt);
    }
    
    const intent = new Intent({
      userId: context.userId,
      orgId: context.orgId,
      threadId: context.threadId,
      rawPrompt: prompt,
      ...normalized,
      status: 'PENDING_VALIDATION'
    });
    
    try {
      await intent.save();
      console.log(`📦 [Data Partition] PERSISTED to Transactional Trace (MongoDB): Intent ID ${intent._id}`);
    } catch (e) {
      console.warn('⚠️  Stateless Mode: Could not persist Intent to MongoDB. (Check Atlas IP Whitelist)');
    }
    return intent;
  }

  /**
   * Call Vertex AI to parse the intent
   */
  async _callVertexAI(prompt) {
    try {
      const generativeModel = this.vertexAi.getGenerativeModel({
        model: this.model,
        generationConfig: { responseMimeType: 'application/json' }
      });

      const systemInstruction = `
        You are the SafeOps Cloud Operator, a high-fidelity console-driven AI.
        Your job is to convert user requests into a structured Intent JSON that drives a CINEMATIC dashboard.
        
        Strictly follow this JSON schema:
        {
          "intentType": "COST_CONTROL" | "INVENTORY" | "SECURITY" | "COMPLIANCE" | "DEPLOYMENT" | "CONNECTIVITY" | "UNKNOWN",
          "provider": "aws" | "gcp" | "multi" | "none",
          "action": "string (e.g., GET_BILLING, LIST_RESOURCES, STOP_RESOURCE, GET_CONNECTIVITY)",
          "parameters": "object",
          "summary": "Impactful technical summary (MUST BE WRAPPED IN MAINFRAMEREPORT ON FRONTEND)",
          "steps": ["step 1", "step 2", "step 3"],
          "ctas": [{ "label": "string", "action": "string", "type": "EXECUTE" | "VIEW_BILLING", "requiresConfirmation": boolean }],
          "hooks": ["technical insight 1", "risk alert X"],
          "confidence": 0-1,
          "requiresConfirmation": boolean
        }
        
        CRITICAL OPERATIONAL RULES:
        1. FORBIDDEN: Plain text storytelling or generic summaries.
        2. MANDATORY: Every narrative response will be displayed inside a 'MainframeReport'. Your 'summary' field should read like a technical briefing.
        3. If it's a "Write" action (stop, delete, disable), requiresConfirmation MUST be true.
        4. Break the journey into clear tactical steps using the 'steps' array.
        5. For 'STOP_RESOURCE' actions, ensure 'parameters' includes 'resourceId' and 'resourceName'.
        6. For 'LIST_RESOURCES' queries, return data for the 'ResourceList' component.
        7. For 'GET_BILLING' queries, return data for the 'SafetyCard' or 'StatusMeter' component.
        8. For 'GET_CONNECTIVITY' queries, return data for the 'CloudConnectivityStatus' component.
        9. Always use a CINEMATIC_TECHNICAL_CONSOLE tone.
      `;

      const request = {
        contents: [{ role: 'user', parts: [{ text: `${systemInstruction}\n\nUser Prompt: ${prompt}` }] }],
      };

      const resp = await generativeModel.generateContent(request);
      const content = resp.response.candidates[0].content.parts[0].text;
      return JSON.parse(content);
    } catch (error) {
      console.error('❌ Vertex AI Error:', error.message);
      return this._ruleBasedParser(prompt); // Fallback
    }
  }

  /**
   * Validate the intent against policies and permissions
   */
  async validate(intent) {
    console.log(`🛡️ Validating intent: ${intent.intentType} - ${intent.action}`);
    
    if (intent.intentType === 'UNKNOWN') {
      intent.status = 'BLOCKED';
      intent.error = 'Unrecognized intent';
    } else if (intent.confidence < 0.7) {
      intent.status = 'BLOCKED';
      intent.error = 'Confidence too low - please clarify your request';
    } else {
      intent.status = intent.requiresConfirmation ? 'PENDING_CONFIRMATION' : 'EXECUTING';
    }

    try {
      await intent.save();
    } catch (e) {
      console.warn('⚠️  Could not update Intent status in MongoDB.');
    }
    return intent;
  }

  /**
   * Rule-based fallback parser
   */
  _ruleBasedParser(prompt) {
    const p = prompt.toLowerCase();
    
    const base = {
      summary: `I've analyzed your request about "${prompt}".`,
      steps: ["Authenticate with cloud provider", "Fetch real-time data", "Present findings"],
      hooks: ["Optimization check active"],
      ctas: [{ label: "View Details", action: "NAVIGATE", type: "VIEW_BILLING" }]
    };

    if (p.includes('cost') || p.includes('billing') || p.includes('spend')) {
      return {
        ...base,
        intentType: 'COST_CONTROL',
        provider: p.includes('aws') ? 'aws' : (p.includes('gcp') ? 'gcp' : 'multi'),
        action: 'GET_BILLING',
        confidence: 0.9,
        requiresConfirmation: false
      };
    }

    if (p.includes('resource') || p.includes('list') || p.includes('instances') || p.includes('lambda')) {
      return {
        ...base,
        intentType: 'INVENTORY',
        provider: p.includes('aws') ? 'aws' : (p.includes('gcp') ? 'gcp' : 'multi'),
        action: 'LIST_RESOURCES',
        confidence: 0.85,
        requiresConfirmation: false
      };
    }

    if (p.includes('stop') || p.includes('disable') || p.includes('delete')) {
      return {
        ...base,
        intentType: 'DEPLOYMENT',
        provider: p.includes('aws') ? 'aws' : (p.includes('gcp') ? 'gcp' : 'multi'),
        action: 'STOP_RESOURCE',
        confidence: 0.8,
        requiresConfirmation: true,
        parameters: { resourceName: prompt.split(' ').pop() }
      };
    }

    if (p.includes('log') || p.includes('connectivity') || p.includes('link')) {
      return {
        ...base,
        intentType: 'CONNECTIVITY',
        provider: p.includes('aws') ? 'aws' : (p.includes('gcp') ? 'gcp' : 'multi'),
        action: 'GET_CONNECTIVITY',
        confidence: 0.9,
        requiresConfirmation: false
      };
    }

    return {
      ...base,
      intentType: 'UNKNOWN',
      provider: 'none',
      action: 'NONE',
      confidence: 0.5,
      requiresConfirmation: false
    };
  }

  /**
   * Log an action to the audit trail
   */
  async logAudit(intent, payload, result = null) {
    const audit = new Audit({
      userId: intent.userId,
      orgId: intent.orgId,
      intentId: intent._id,
      provider: intent.provider,
      action: intent.action,
      payload,
      newState: result,
      severity: intent.requiresConfirmation ? 'MEDIUM' : 'INFO'
    });
    
    try {
      await audit.save();
      console.log(`🔊 [Audit Trail] RECORDED in MongoDB: ${intent.action} for User ${intent.userId}`);
    } catch (e) {
      console.warn('⚠️  Audit Persistence Failed: Security trace not captured in MongoDB.');
    }
    return audit;
  }
}

module.exports = new IntentService();
