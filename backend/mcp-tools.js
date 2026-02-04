/**
 * CloudSafetyService - Mock implementation of a cloud resource manager
 * Following professional patterns for backend services.
 */

class CloudSafetyService {
  constructor() {
    this.deployments = [
      { id: "srv-gcp-129", name: "auth-service-v2", cloud: "Google Cloud", cost: 12.50, waste: 85, region: "us-central1", status: "running" },
      { id: "srv-gcp-442", name: "data-pipeline-worker", cloud: "Google Cloud", cost: 4.20, waste: 92, region: "us-east4", status: "running" },
      { id: "srv-gcp-901", name: "frontend-dashboard", cloud: "Google Cloud", cost: 1.20, waste: 5, region: "europe-west1", status: "running" }
    ];
    
    this.budget = {
      freeTierSafe: false,
      totalSpend: 17.90,
      limit: 0.00,
      currency: "USD",
      percentageUsed: 890
    };
  }

  getResources() {
    return this.deployments;
  }

  getSnapshot() {
    const highWaste = this.deployments.filter(d => d.waste > 70);
    return {
      billing: this.budget,
      inventory: {
        total: this.deployments.length,
        highRisk: highWaste.length,
        potentialSavings: highWaste.reduce((acc, d) => acc + d.cost, 0).toFixed(2)
      },
      recommendation: highWaste.length > 0 
        ? `Stop ${highWaste.length} idling services to save $${(highWaste.reduce((acc, d) => acc + d.cost, 0)).toFixed(2)}/mo.`
        : "Your cloud spend is optimized and safe within free tier limits."
    };
  }

  stopService(serviceId) {
    const beforeCount = this.deployments.length;
    
    if (serviceId === "all") {
      this.deployments = this.deployments.filter(d => d.waste < 70);
    } else {
      this.deployments = this.deployments.filter(d => d.id !== serviceId);
    }

    const afterCount = this.deployments.length;
    const stoppedCount = beforeCount - afterCount;
    
    // Recalculate budget
    this.budget.totalSpend = parseFloat(this.deployments.reduce((acc, d) => acc + d.cost, 0).toFixed(2));
    this.budget.freeTierSafe = this.budget.totalSpend <= this.budget.limit;
    this.budget.percentageUsed = this.budget.limit > 0 ? (this.budget.totalSpend / this.budget.limit) * 100 : (this.budget.totalSpend > 0 ? 100 : 0);

    return {
      success: true,
      stoppedCount,
      newSpend: this.budget.totalSpend,
      message: `Successfully halted ${stoppedCount} high-waste services.`
    };
  }
}

const safetyService = new CloudSafetyService();

module.exports = safetyService;
