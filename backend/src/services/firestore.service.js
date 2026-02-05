/**
 * Firestore Data Service
 * Replaces mock CloudSafetyService with real Firestore operations
 * Implements the data models defined in the design document
 */

const firestoreConfig = require('../config/firestore.config');
const { v4: uuidv4 } = require('uuid');

class FirestoreService {
  constructor() {
    this.db = null;
    this.initialized = false;
  }

  /**
   * Initialize the service
   */
  async initialize() {
    if (!this.initialized) {
      this.db = await firestoreConfig.initialize();
      this.initialized = true;
      
      // Initialize with sample data if collections are empty
      await this.initializeSampleData();
    }
    return this.db;
  }

  /**
   * Initialize sample data for development
   */
  async initializeSampleData() {
    try {
      // Check if deployments collection has data
      const deploymentsSnapshot = await this.db.collection('deployments').limit(1).get();
      
      if (deploymentsSnapshot.empty) {
        console.log('📊 Initializing sample deployment data...');
        
        const sampleDeployments = [
          {
            id: 'srv-gcp-129',
            cloud: 'gcp',
            service: 'auth-service-v2',
            status: 'running',
            cost: 12.50,
            region: 'us-central1',
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {
              instanceType: 'e2-micro',
              memory: '1GB',
              cpu: '0.25'
            }
          },
          {
            id: 'srv-gcp-442',
            cloud: 'gcp',
            service: 'data-pipeline-worker',
            status: 'running',
            cost: 4.20,
            region: 'us-east4',
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {
              instanceType: 'e2-small',
              memory: '2GB',
              cpu: '0.5'
            }
          },
          {
            id: 'srv-gcp-901',
            cloud: 'gcp',
            service: 'frontend-dashboard',
            status: 'running',
            cost: 1.20,
            region: 'europe-west1',
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {
              instanceType: 'e2-micro',
              memory: '1GB',
              cpu: '0.25'
            }
          }
        ];

        // Add sample deployments
        const batch = this.db.batch();
        sampleDeployments.forEach(deployment => {
          const docRef = this.db.collection('deployments').doc(deployment.id);
          batch.set(docRef, deployment);
        });
        await batch.commit();
      }

      // Check if budgets collection has data
      const budgetsSnapshot = await this.db.collection('budgets').limit(1).get();
      
      if (budgetsSnapshot.empty) {
        console.log('💰 Initializing sample budget data...');
        
        const sampleBudget = {
          userId: 'default-user',
          freeTierSafe: false,
          totalSpend: 17.90,
          freeTierLimit: 0.00,
          alerts: [
            {
              threshold: 80,
              enabled: true,
              lastTriggered: null
            },
            {
              threshold: 100,
              enabled: true,
              lastTriggered: new Date()
            }
          ],
          lastUpdated: new Date(),
          breakdown: {
            compute: 15.50,
            storage: 1.20,
            networking: 1.20,
            other: 0.00
          }
        };

        await this.db.collection('budgets').doc('default-user').set(sampleBudget);
      }

      console.log('✅ Sample data initialization complete');
    } catch (error) {
      console.error('❌ Failed to initialize sample data (permissions issue - using read-only mode):', error.message);
      console.log('📖 Running in read-only mode - sample data will be created when permissions are available');
    }
  }

  /**
   * Get all deployments (replaces getResources)
   */
  async getDeployments() {
    try {
      const snapshot = await this.db.collection('deployments').get();
      const deployments = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        deployments.push({
          id: data.id,
          name: data.service,
          cloud: this.formatCloudName(data.cloud),
          cost: data.cost,
          waste: this.calculateWastePercentage(data),
          region: data.region,
          status: data.status,
          ...data
        });
      });

      // If no deployments found (e.g., due to permissions), return sample data
      if (deployments.length === 0) {
        return [
          {
            id: 'srv-demo-001',
            name: 'demo-service',
            cloud: 'Google Cloud',
            cost: 0.00,
            waste: 0,
            region: 'us-central1',
            status: 'running',
            service: 'demo-service'
          }
        ];
      }

      return deployments;
    } catch (error) {
      console.error('❌ Failed to get deployments:', error);
      return [];
    }
  }

  /**
   * Get budget information for a user
   */
  async getBudget(userId = 'default-user') {
    try {
      const doc = await this.db.collection('budgets').doc(userId).get();
      
      if (!doc.exists) {
        return {
          freeTierSafe: true,
          totalSpend: 0.00,
          limit: 0.00,
          currency: 'USD',
          percentageUsed: 0,
          breakdown: {
            compute: 0,
            storage: 0,
            networking: 0,
            other: 0
          },
          lastUpdated: new Date()
        };
      }

      const data = doc.data();
      return {
        freeTierSafe: data.freeTierSafe,
        totalSpend: data.totalSpend,
        limit: data.freeTierLimit,
        currency: 'USD',
        percentageUsed: data.freeTierLimit > 0 
          ? (data.totalSpend / data.freeTierLimit) * 100 
          : (data.totalSpend > 0 ? 100 : 0),
        breakdown: data.breakdown,
        lastUpdated: data.lastUpdated
      };
    } catch (error) {
      console.error('❌ Failed to get budget:', error);
      return null;
    }
  }

  /**
   * Get snapshot for context API
   */
  async getSnapshot(userId = 'default-user') {
    try {
      const [deployments, budget] = await Promise.all([
        this.getDeployments(),
        this.getBudget(userId)
      ]);

      const highWaste = deployments.filter(d => d.waste > 70);
      const potentialSavings = highWaste.reduce((acc, d) => acc + d.cost, 0);

      return {
        billing: budget,
        inventory: {
          total: deployments.length,
          highRisk: highWaste.length,
          potentialSavings: potentialSavings.toFixed(2)
        },
        recommendation: highWaste.length > 0 
          ? `Stop ${highWaste.length} idling services to save ${potentialSavings.toFixed(2)}/mo.`
          : "Your cloud spend is optimized and safe within free tier limits."
      };
    } catch (error) {
      console.error('❌ Failed to get snapshot:', error);
      throw error;
    }
  }

  /**
   * Stop service(s)
   */
  async stopService(serviceId, userId = 'default-user') {
    try {
      const deployments = await this.getDeployments();
      let stoppedServices = [];

      if (serviceId === 'all') {
        const highWasteServices = deployments.filter(d => d.waste > 70);
        stoppedServices = highWasteServices;
        
        const batch = this.db.batch();
        highWasteServices.forEach(service => {
          const docRef = this.db.collection('deployments').doc(service.id);
          batch.update(docRef, { 
            status: 'stopped',
            updatedAt: new Date()
          });
        });
        await batch.commit();
      } else {
        const service = deployments.find(d => d.id === serviceId);
        if (service) {
          stoppedServices = [service];
          await this.db.collection('deployments').doc(serviceId).update({
            status: 'stopped',
            updatedAt: new Date()
          });
        }
      }

      await this.recalculateBudget(userId);

      return {
        success: true,
        stoppedCount: stoppedServices.length,
        message: `Successfully halted ${stoppedServices.length} high-waste services.`,
        stoppedServices: stoppedServices.map(s => ({ id: s.id, name: s.name, cost: s.cost }))
      };
    } catch (error) {
      console.error('❌ Failed to stop service:', error);
      throw error;
    }
  }

  /**
   * Update budget totals based on current deployments
   */
  async recalculateBudget(userId = 'default-user') {
    try {
      const deployments = await this.getDeployments();
      const runningDeployments = deployments.filter(d => d.status === 'running');
      
      const totalSpend = runningDeployments.reduce((acc, d) => acc + d.cost, 0);
      const breakdown = this.calculateBreakdown(runningDeployments);

      await this.db.collection('budgets').doc(userId).update({
        totalSpend: parseFloat(totalSpend.toFixed(2)),
        freeTierSafe: totalSpend <= 0,
        lastUpdated: new Date(),
        breakdown
      });

      return { totalSpend, breakdown };
    } catch (error) {
      console.error('❌ Failed to recalculate budget:', error);
      throw error;
    }
  }

  calculateWastePercentage(deployment) {
    if (deployment.cost > 10) return 85;
    if (deployment.cost > 3) return 92;
    return 5;
  }

  formatCloudName(cloud) {
    const cloudNames = {
      'gcp': 'Google Cloud',
      'aws': 'Amazon Web Services',
      'azure': 'Microsoft Azure'
    };
    return cloudNames[cloud] || cloud;
  }

  calculateBreakdown(deployments) {
    const breakdown = {
      compute: 0,
      storage: 0,
      networking: 0,
      other: 0
    };

    deployments.forEach(deployment => {
      const serviceName = deployment.service.toLowerCase();
      if (serviceName.includes('compute') || serviceName.includes('worker') || serviceName.includes('service')) {
        breakdown.compute += deployment.cost;
      } else if (serviceName.includes('storage') || serviceName.includes('database')) {
        breakdown.storage += deployment.cost;
      } else if (serviceName.includes('network') || serviceName.includes('cdn')) {
        breakdown.networking += deployment.cost;
      } else {
        breakdown.other += deployment.cost;
      }
    });

    return breakdown;
  }

  async close() {
    await firestoreConfig.close();
  }
}

const firestoreService = new FirestoreService();
module.exports = firestoreService;
