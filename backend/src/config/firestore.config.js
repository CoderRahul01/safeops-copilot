/**
 * Firestore Configuration and Connection Setup
 * Handles both production and development emulator configurations
 */

const { Firestore } = require('@google-cloud/firestore');
const path = require('path');
require('dotenv').config();

class FirestoreConfig {
  constructor() {
    this.db = null;
    this.isEmulator = process.env.NODE_ENV === 'development' || process.env.FIRESTORE_EMULATOR_HOST;
    this.projectId = process.env.PROJECT_ID || 'arcane-dolphin-484007-f8';
  }

  /**
   * Initialize Firestore connection
   */
  async initialize() {
    try {
      if (this.isEmulator) {
        console.log('🔧 Initializing Firestore with emulator configuration...');
        this.db = new Firestore({
          projectId: this.projectId,
          host: process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080',
          ssl: false,
          customHeaders: {
            'Authorization': 'Bearer owner'
          }
        });
      } else {
        console.log('🔧 Initializing Firestore with production configuration...');
        // Use service-account.json in the same config directory if GOOGLE_APPLICATION_CREDENTIALS is not set
        const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, 'service-account.json');
        
        this.db = new Firestore({
          projectId: this.projectId,
          keyFilename: keyPath
        });
      }

      await this.testConnection();
      console.log('✅ Firestore connection established successfully');
      
      return this.db;
    } catch (error) {
      console.error('❌ Failed to initialize Firestore:', error.message);
      throw error;
    }
  }

  async testConnection() {
    try {
      const testRef = this.db.collection('_health_check');
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), 5000);
      });
      
      const queryPromise = testRef.limit(1).get();
      await Promise.race([queryPromise, timeoutPromise]);
      
      return true;
    } catch (error) {
      if (this.isEmulator && error.message.includes('Connection timeout')) {
        throw new Error('Firestore emulator not available. Run: npm run emulator');
      }
      throw new Error(`Firestore connection test failed: ${error.message}`);
    }
  }

  getDb() {
    if (!this.db) {
      throw new Error('Firestore not initialized. Call initialize() first.');
    }
    return this.db;
  }

  collection(name) {
    return this.getDb().collection(name);
  }

  async close() {
    if (this.db) {
      await this.db.terminate();
      console.log('🔌 Firestore connection closed');
    }
  }
}

const firestoreConfig = new FirestoreConfig();
module.exports = firestoreConfig;
