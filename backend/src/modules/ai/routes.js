const express = require('express');
const router = express.Router();
const memoryService = require('../../services/memory.service');
const { verifyAuth } = require('../../middleware/auth.middleware');
const intentController = require('./intent.controller');

/**
 * AI Memory & Intent Module
 * Handles storage, retrieval, and structured intent execution.
 */

// Route to process a structured intent
router.post('/intent', verifyAuth, intentController.processIntent);

// Route to get personal intent history
router.get('/intent/history', verifyAuth, intentController.getIntentHistory);

// Route to advance an intent step (The Journey)
router.post('/intent/advance', verifyAuth, intentController.advanceIntent);

// Route to store a user interaction (message + optional response)
router.post('/store', verifyAuth, async (req, res) => {
    try {
        const { content, role, metadata } = req.body;
        const userId = req.user.uid;

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        await memoryService.addInteraction(userId, content, {
            ...metadata,
            role: role || 'user'
        });

        res.json({ success: true });
    } catch (error) {
        console.error('❌ [AI Module] Store memory error:', error.message);
        res.status(500).json({ error: 'Failed to store memory' });
    }
});

// Route to get context based on a query
router.get('/context', verifyAuth, async (req, res) => {
    try {
        const { q, threadId } = req.query;
        const userId = req.user.uid;

        if (!q) {
            return res.status(400).json({ error: 'Query (q) is required' });
        }

        const context = await memoryService.searchContext(userId, q, threadId);
        res.json({ context });
    } catch (error) {
        console.error('❌ [AI Module] Get context error:', error.message);
        res.status(500).json({ error: 'Failed to retrieve context' });
    }
});

module.exports = router;
