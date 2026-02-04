const fastify = require("fastify")({ logger: true });
fastify.get("/", async () => ({ status: "SafeOps Backend Ready" }));
fastify.listen({ port: process.env.PORT || 8080, host: "0.0.0.0" });
