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
    
    const [ivHex, tagHex, contentHex] = encryptedText.split(':');
    if (!ivHex || !tagHex || !contentHex) return null;
    
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    
    decipher.setAuthTag(tag);
    
    return decrypted;
  }

  /**
   * Store a cloud connection for a user
   * @param {string} userId - The user's UID
   * @param {string} provider - 'aws' or 'gcp'
   * @param {object} tokens - { accessToken, refreshToken, expiry }
   */
  async storeConnection(userId, provider, tokens) {
    const admin = require('firebase-admin');
    const db = admin.firestore();
    
    const encryptedRefreshToken = this.encrypt(tokens.refreshToken);
    
    await db.collection('connections').doc(`${userId}_${provider}`).set({
      userId,
      provider,
      accessToken: tokens.accessToken, // Short-lived, encryption optional but recommended
      refreshToken: encryptedRefreshToken,
      expiry: tokens.expiry,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    return true;
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
    data.refreshToken = this.decrypt(data.refreshToken);
    
    return data;
  }
}

module.exports = new CredentialService();
