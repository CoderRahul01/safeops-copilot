const Supermemory = require('supermemory').default;

class MemoryService {
    constructor() {
        this.client = new Supermemory({
            apiKey: process.env.SUPERMEMORY_API_KEY
        });
    }

    /**
     * Add a chat interaction to memory
     * @param {string} userId - User ID for container tagging
     * @param {string} content - Message content
     * @param {object} metadata - Optional metadata (role, timestamp, etc.)
     */
    async addInteraction(userId, content, metadata = {}) {
        try {
            const threadId = metadata.threadId || 'default';
            console.log(`🧠 [MemoryService] Storing memory for User:${userId} Thread:${threadId}`);
            await this.client.add({
                content,
                containerTags: [`user_${userId}`, `thread_${threadId}`],
                metadata: {
                    ...metadata,
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
            console.log(`🔍 [MemoryService] Searching memory for context: "${query}" (Thread: ${threadId || 'ALL'})`);
            const tags = [`user_${userId}`];
            if (threadId) tags.push(`thread_${threadId}`);
            
            const response = await this.client.search.documents({
                q: query,
                containerTags: tags
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
            const profile = await this.client.profile({ containerTag: `user_${userId}` });
            return profile;
        } catch (error) {
            console.error('❌ [MemoryService] Error getting profile:', error.message);
            return null;
        }
    }
}

module.exports = new MemoryService();
