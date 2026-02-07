const crypto = require('crypto');

/**
 * Credential Service
 * Handles encryption/decryption of cloud tokens using AES-256-GCM.
 */
class CredentialService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.key = Buffer.from(process.env.ENCRYPTION_KEY || 'super-secret-key-32-chars-long-!!', 'utf8').slice(0, 32);
    this.ivLength = 16;
    this.saltLength = 64;
    this.tagLength = 16;
  }

  /**
   * Encrypt a string
   * @param {string} text - The text to encrypt
   * @returns {string} - Encrypted text in format iv:tag:content
   */
  encrypt(text) {
    if (!text) return null;
    
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt a string
   * @param {string} encryptedText - The text to decrypt (iv:tag:content)
   * @returns {string} - Decrypted text
   */
  decrypt(encryptedText) {
    if (!encryptedText) return null;
    
    try {
      const [ivHex, tagHex, contentHex] = encryptedText.split(':');
      if (!ivHex || !tagHex || !contentHex) return null;
      
      const iv = Buffer.from(ivHex, 'hex');
      const tag = Buffer.from(tagHex, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(contentHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  /**
   * Store a cloud connection for a user
   * @param {string} userId - The user's UID
   * @param {string} provider - 'aws' or 'gcp'
   * @param {object} credentials - The credential object (JSON or Keys)
   */
  async storeConnection(userId, provider, credentials) {
    const admin = require('firebase-admin');
    const db = admin.firestore();
    
    // Encrypt the entire credentials object as a string for maximum security
    const encryptedData = this.encrypt(JSON.stringify(credentials));
    
    try {
      await db.collection('connections').doc(`${userId}_${provider}`).set({
        userId,
        provider,
        encryptedData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      console.log(`✅ [CredentialService] Stored ${provider} credentials for user ${userId}`);
      return true;
    } catch (error) {
      console.error(`❌ [CredentialService] Failed to store ${provider} credentials:`, error);
      throw error;
    }
  }

  /**
   * Get a cloud connection for a user
   * @param {string} userId - The user's UID
   * @param {string} provider - 'aws' or 'gcp'
   */
  async getConnection(userId, provider) {
    const admin = require('firebase-admin');
    const db = admin.firestore();
    
    const doc = await db.collection('connections').doc(`${userId}_${provider}`).get();
    if (!doc.exists) return null;
    
    const data = doc.data();
    if (data.encryptedData) {
      const decrypted = this.decrypt(data.encryptedData);
      return JSON.parse(decrypted);
    }
    
    return data;
  }
}

module.exports = new CredentialService();
