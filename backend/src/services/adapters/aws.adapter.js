const BaseCloudAdapter = require('./base.adapter');
const { CostExplorerClient, GetCostAndUsageCommand } = require("@aws-sdk/client-cost-explorer");
const { EC2Client, DescribeInstancesCommand, StopInstancesCommand } = require("@aws-sdk/client-ec2");
const { LambdaClient, ListFunctionsCommand } = require("@aws-sdk/client-lambda");
const credentialService = require('../credential.service');

class AWSAdapter extends BaseCloudAdapter {
  constructor() {
    super('aws');
  }

  async getClientConfig(userId) {
    const baseConfig = { region: process.env.AWS_REGION || 'us-east-1' };
    
    if (userId && userId !== 'dev-user') {
      const connection = await credentialService.getConnection(userId, 'aws');
      
      // Support for new Direct Onboarding (Access Keys)
      if (connection && connection.accessKey && connection.secretKey) {
        console.log(`🛡️ [AWS] Using Direct Access Key credentials for user ${userId}`);
        return {
          ...baseConfig,
          credentials: {
            accessKeyId: connection.accessKey,
            secretAccessKey: connection.secretKey
          }
        };
      }

      // Legacy STS Role Support (Federated Identity)
      if (connection && connection.roleArn) {
        console.log(`🛡️ [STS] Assuming role for user ${userId}: ${connection.roleArn}`);
        const { STSClient, AssumeRoleCommand } = require("@aws-sdk/client-sts");
        const sts = new STSClient(baseConfig);
        
        try {
          const command = new AssumeRoleCommand({
            RoleArn: connection.roleArn,
            RoleSessionName: `SafeOpsSession_${userId}`
          });
          
          const { Credentials } = await sts.send(command);
          return {
            ...baseConfig,
            credentials: {
              accessKeyId: Credentials.AccessKeyId,
              secretAccessKey: Credentials.SecretAccessKey,
              sessionToken: Credentials.SessionToken
            }
          };
        } catch (stsError) {
          console.error('❌ [STS] AssumeRole failed:', stsError.message);
          // Fallback to dev if failed and in dev
          if (process.env.NODE_ENV === 'development') return baseConfig;
          throw stsError;
        }
      }
    }

    // Default/Fallback credentials
    return {
      ...baseConfig,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    };
  }

  async getBilling(userId) {
    try {
      const config = await this.getClientConfig(userId);
      const ceClient = new CostExplorerClient(config);
      
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const today = now.toISOString().split('T')[0];

      const command = new GetCostAndUsageCommand({
        TimePeriod: { Start: firstDayOfMonth, End: today },
        Granularity: 'MONTHLY',
        Metrics: ['UnblendedCost'],
        GroupBy: [{ Type: 'DIMENSION', Key: 'SERVICE' }]
      });

      const response = await ceClient.send(command);
      const totalSpend = response.ResultsByTime[0]?.Total?.UnblendedCost?.Amount || "0.00";
      const breakdown = {};
      response.ResultsByTime[0]?.Groups?.forEach(group => {
        const service = group.Keys[0];
        const amount = parseFloat(group.Metrics.UnblendedCost.Amount);
        breakdown[service] = amount;
      });

      return {
        success: true,
        provider: 'aws',
        currency: 'USD',
        currentSpend: parseFloat(totalSpend),
        breakdown,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ [AWSAdapter] getBilling failed:', error.message);
      const err = new Error(`AWS_BILLING_FAILED: ${error.message}`);
      err.code = 'BILLING_DISABLED';
      throw err;
    }
  }

  async listResources(userId) {
    try {
      const config = await this.getClientConfig(userId);
      const lambdaClient = new LambdaClient(config);
      const ec2Client = new EC2Client(config);

      const [lambdaRes, ec2Res] = await Promise.all([
        lambdaClient.send(new ListFunctionsCommand({})),
        ec2Client.send(new DescribeInstancesCommand({}))
      ]);

      const lambdas = (lambdaRes.Functions || []).map(f => ({
        id: f.FunctionArn,
        name: f.FunctionName,
        type: 'lambda',
        status: 'active'
      }));

      const ec2s = (ec2Res.Reservations || []).flatMap(r => r.Instances || []).map(i => ({
        id: i.InstanceId,
        name: i.Tags?.find(t => t.Key === 'Name')?.Value || i.InstanceId,
        type: 'ec2',
        status: i.State.Name
      }));

      return {
        success: true,
        provider: 'aws',
        resources: [...lambdas, ...ec2s],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ [AWSAdapter] listResources failed:', error.message);
      const err = new Error(`AWS_RESOURCES_FAILED: ${error.message}`);
      err.code = 'CREDENTIAL_EXPIRED';
      throw err;
    }
  }

  async executeAction(action, params, userId) {
    if (action === 'STOP_RESOURCE' && params.resourceId) {
      try {
        const config = await this.getClientConfig(userId);
        const ec2Client = new EC2Client(config);
        
        const command = new StopInstancesCommand({
          InstanceIds: [params.resourceId]
        });
        
        await ec2Client.send(command);
        return { 
          success: true, 
          action, 
          message: `Termination command issued for AWS EC2 instance: ${params.resourceId}` 
        };
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[AWSAdapter] MOCK STOP: ${params.resourceId}`);
          return { success: true, action, message: `[MOCK] Instance ${params.resourceId} stopped on AWS` };
        }
        throw error;
      }
    }
    return { success: false, error: 'Unsupported action' };
  }

  async checkHealth() {
    return { provider: 'aws', healthy: !!process.env.AWS_ACCESS_KEY_ID };
  }
}

module.exports = new AWSAdapter();
