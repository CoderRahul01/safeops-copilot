const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: "optimal", service: "SafeOps-Cloud-Safety", mode: "modular" });
});

/**
 * High-Granularity Module Loader
 * Automatically discovers and registers modules from the modules/ directory.
 * Each module must export { name, routes, prefix }
 */
const modulesPath = path.join(__dirname, '..', 'modules');
const modules = fs.readdirSync(modulesPath);

console.log('📂 [Core] Discovering feature modules...');

modules.forEach(moduleName => {
  const moduleDir = path.join(modulesPath, moduleName);
  if (fs.statSync(moduleDir).isDirectory()) {
    try {
      const module = require(moduleDir);
      if (module.routes && module.prefix) {
        console.log(`📦 [Core] Registering Module: ${module.name} at ${module.prefix}`);
        router.use(module.prefix, module.routes);
      }
    } catch (error) {
      console.error(`❌ [Core] Failed to load module ${moduleName}:`, error.message);
    }
  }
});

module.exports = router;
