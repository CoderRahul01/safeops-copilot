const Supermemory = require('supermemory').default;

class MemoryService {
    constructor() {
        this.client = null;
        if (process.env.SUPERMEMORY_API_KEY) {
            this.client = new Supermemory({
                apiKey: process.env.SUPERMEMORY_API_KEY
            });
            console.log('🧠 [MemoryService] Supermemory client initialized.');
        } else {
            console.warn('⚠️ [MemoryService] SUPERMEMORY_API_KEY missing. Running in stateless mode (no memory).');
        }
    }

    /**
     * Add a chat interaction to memory
     * @param {string} userId - User ID for container tagging
     * @param {string} content - Message content
     * @param {object} metadata - Optional metadata (role, timestamp, etc.)
     */
    async addInteraction(userId, content, metadata = {}) {
        try {
            if (!this.client) return;
            const threadId = (metadata.threadId || 'default').replace(/[^a-zA-Z0-9-_]/g, '_');
            const sanitizedUserId = String(userId).replace(/[^a-zA-Z0-9-_]/g, '_');
            
            if (!content || String(content).trim().length < 2) {
                console.warn(`⚠️ [MemoryService] Skipping storage: Content too short for User:${sanitizedUserId}`);
                return;
            }

            console.log(`🧠 [MemoryService] Storing memory for User:${sanitizedUserId} (Thread:${threadId})`);
            await this.client.add({
                content: String(content),
                containerTag: sanitizedUserId,
                metadata: {
                    ...metadata,
                    threadId,
                    timestamp: new Date().toISOString(),
                    source: 'safeops-copilot'
                }
            });
        } catch (error) {
            console.error('❌ [MemoryService] Error adding memory:', error.message);
        }
    }

    /**
     * Search relevant memories for context
     * @param {string} userId - User ID
     * @param {string} query - Search query
     * @returns {Promise<Array>} - Search results
     */
    async searchContext(userId, query, threadId = null) {
        try {
            const sanitizedUserId = String(userId).replace(/[^a-zA-Z0-9-_]/g, '_');
            const sanitizedThreadId = threadId ? String(threadId).replace(/[^a-zA-Z0-9-_]/g, '_') : null;
            
            if (!this.client) return [];
            console.log(`🔍 [MemoryService] Searching memory for context: "${query}" (User: ${sanitizedUserId})`);
            
            // Note: Supermemory v4 search primarily uses one containerTag
            const response = await this.client.search.documents({
                q: query,
                containerTag: sanitizedUserId
            });
            return response.results || [];
        } catch (error) {
            console.error('❌ [MemoryService] Error searching memory:', error.message);
            return [];
        }
    }

    /**
     * Get user profile context
     * @param {string} userId 
     */
    async getUserProfile(userId) {
        try {
            if (!this.client) return null;
            const sanitizedUserId = String(userId).replace(/[^a-zA-Z0-9-_]/g, '_');
            const profile = await this.client.profile({ containerTag: `user_${sanitizedUserId}` });
            return profile;
        } catch (error) {
            console.error('❌ [MemoryService] Error getting profile:', error.message);
            return null;
        }
    }
}

module.exports = new MemoryService();
