/**
 * Cloud Module Controller
 * Handlers for GCP and AWS specific tool-based operations
 */

const gcpService = require('../../services/gcp.service');
const awsService = require('../../services/aws.service');

// GCP Handlers
const listGcpServices = async (req, res) => {
  try {
    const { region } = req.query;
    const result = await gcpService.listCloudRunServices(region);
    res.json(result);
  } catch (error) {
    console.error('Failed to list GCP services:', error);
    res.status(500).json({ error: 'Failed to list GCP services', message: error.message });
  }
};

const stopGcpService = async (req, res) => {
  try {
    const { serviceName, region } = req.body;
    if (!serviceName) return res.status(400).json({ error: "serviceName is required" });
    const result = await gcpService.stopCloudRun(serviceName, region);
    res.json({ ...result, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to stop GCP service:', error);
    res.status(500).json({ error: 'Failed to stop GCP service', message: error.message });
  }
};

// AWS Handlers
const listAwsServices = async (req, res) => {
  try {
    const result = await awsService.listResources();
    res.json(result);
  } catch (error) {
    console.error('Failed to list AWS services:', error);
    res.status(500).json({ error: 'Failed to list AWS services', message: error.message });
  }
};

module.exports = {
  listGcpServices,
  stopGcpService,
  listAwsServices
};
