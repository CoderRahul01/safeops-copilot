const fastify = require("fastify")({ 
  logger: true // Use built-in pino logger without complex transports for stability
});
const cors = require("@fastify/cors");
const safetyService = require("./mcp-tools.js");

// Register CORS for frontend access
fastify.register(cors, {
  origin: "*",
  methods: ["GET", "POST"]
});

/**
 * --- TAMBO ADAPTED ENDPOINTS ---
 * These endpoints provide structured, semantic data for the Generative UI.
 */

// 1. Context Endpoint: The high-level state for the Tambo Agent
fastify.get("/api/context", async (request, reply) => {
  const snapshot = safetyService.getSnapshot();
  return {
    userRole: "infrastructure-admin",
    environment: "production",
    billingStatus: snapshot.billing,
    recommendation: snapshot.recommendation,
    metrics: {
      active_resources: snapshot.inventory.total,
      risk_count: snapshot.inventory.highRisk,
      saving_potential: snapshot.inventory.potentialSavings
    },
    timestamp: new Date().toISOString()
  };
});

// 2. Resources List: Detailed list for the ResourceList component
fastify.get("/api/resources", async () => {
  return safetyService.getResources();
});

// 3. Action Endpoint: Remediate waste
fastify.post("/api/stop-waste", async (request, reply) => {
  const { serviceId } = request.body;
  if (!serviceId) {
    return reply.status(400).send({ error: "serviceId is required" });
  }

  const result = safetyService.stopService(serviceId);
  return {
    ...result,
    timestamp: new Date().toISOString()
  };
});

// Health check
fastify.get("/health", async () => ({ status: "optimal", service: "SafeOps-Cloud-Safety" }));

const start = async () => {
  try {
    const port = process.env.PORT || 8080;
    await fastify.listen({ port, host: "0.0.0.0" });
    console.log(`\x1b[32m🚀 SafeOps Backend Live on port ${port}\x1b[0m`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
