/**
 * Real AWS SDK v3 Integration
 * Provides integration for AWS Cost Explorer, EC2, and Lambda
 */

const { CostExplorerClient, GetCostAndUsageCommand } = require("@aws-sdk/client-cost-explorer");
const { EC2Client, DescribeInstancesCommand } = require("@aws-sdk/client-ec2");
const { LambdaClient, ListFunctionsCommand } = require("@aws-sdk/client-lambda");
require('dotenv').config();

class AWSService {
  constructor() {
    const config = {
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    };

    this.ceClient = new CostExplorerClient(config);
    this.ec2Client = new EC2Client(config);
    this.lambdaClient = new LambdaClient(config);
  }

  /**
   * Get AWS Billing Information
   */
  async getBilling() {
    try {
      console.log('💰 Fetching AWS billing information...');
      
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const today = now.toISOString().split('T')[0];

      const command = new GetCostAndUsageCommand({
        TimePeriod: { Start: firstDayOfMonth, End: today },
        Granularity: 'MONTHLY',
        Metrics: ['UnblendedCost'],
        GroupBy: [{ Type: 'DIMENSION', Key: 'SERVICE' }]
      });

      const response = await this.ceClient.send(command);
      
      const totalSpend = response.ResultsByTime[0]?.Total?.UnblendedCost?.Amount || "0.00";
      const breakdown = {};
      response.ResultsByTime[0]?.Groups?.forEach(group => {
        const service = group.Keys[0];
        const amount = parseFloat(group.Metrics.UnblendedCost.Amount);
        breakdown[service] = amount;
      });

      console.log(`✅ Successfully retrieved AWS billing: $${totalSpend}`);
      
      return {
        success: true,
        provider: 'aws',
        currency: 'USD',
        currentSpend: parseFloat(totalSpend),
        breakdown: breakdown,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to get AWS billing:', error.message);
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          provider: 'aws',
          currentSpend: 42.15,
          mock: true,
          message: 'Development mode: Using mock AWS billing'
        };
      }
      throw error;
    }
  }

  /**
   * List active AWS resources (Lambda & EC2)
   */
  async listResources() {
    try {
      console.log('📋 Listing AWS resources...');
      
      const [lambdaRes, ec2Res] = await Promise.all([
        this.lambdaClient.send(new ListFunctionsCommand({})),
        this.ec2Client.send(new DescribeInstancesCommand({}))
      ]);

      const lambdas = (lambdaRes.Functions || []).map(f => ({
        id: f.FunctionArn,
        name: f.FunctionName,
        type: 'lambda',
        status: 'active',
        lastModified: f.LastModified
      }));

      const ec2s = (ec2Res.Reservations || []).flatMap(r => r.Instances || []).map(i => ({
        id: i.InstanceId,
        name: i.Tags?.find(t => t.Key === 'Name')?.Value || i.InstanceId,
        type: 'ec2',
        status: i.State.Name,
        launchTime: i.LaunchTime
      }));

      const resources = [...lambdas, ...ec2s];
      console.log(`✅ Found ${resources.length} AWS resources`);

      return {
        success: true,
        provider: 'aws',
        resources: resources,
        count: resources.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to list AWS resources:', error.message);
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          provider: 'aws',
          resources: [{ id: 'i-mock-123', name: 'mock-ec2', type: 'ec2', status: 'running' }],
          mock: true
        };
      }
      throw error;
    }
  }
}

const awsService = new AWSService();
module.exports = awsService;
