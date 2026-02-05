# Firestore Configuration and Setup

This document explains the Firestore integration for the SafeOps Co-pilot backend.

## Overview

The SafeOps backend uses Google Cloud Firestore as its primary database to store:
- **Deployments**: Cloud service deployment records with cost and status information
- **Budgets**: User budget tracking and free tier monitoring data

## Configuration Files

### Core Files
- `firestore-config.js` - Firestore connection and configuration management
- `firestore-service.js` - Data service layer replacing mock CloudSafetyService
- `firebase.json` - Firebase project configuration for emulator
- `firestore.rules` - Security rules for Firestore collections
- `firestore.indexes.json` - Database indexes for query optimization

### Environment Configuration
The system automatically detects development vs production environments:

**Development (Emulator)**:
```bash
NODE_ENV=development
FIRESTORE_EMULATOR_HOST=localhost:8080
```

**Production**:
```bash
NODE_ENV=production
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
PROJECT_ID=arcane-dolphin-484007-f8
```

## Data Schema

### Deployments Collection
```typescript
interface Deployment {
  id: string                    // Unique deployment identifier
  cloud: 'gcp' | 'aws' | 'azure' // Cloud provider
  service: string               // Service name
  status: 'running' | 'stopped' | 'error' | 'pending'
  cost: number                  // Monthly cost in USD
  region: string                // Deployment region
  createdAt: Timestamp          // Creation timestamp
  updatedAt: Timestamp          // Last update timestamp
  metadata: {                   // Additional service metadata
    instanceType?: string
    memory?: string
    cpu?: string
  }
}
```

### Budgets Collection
```typescript
interface Budget {
  userId: string                // User identifier
  freeTierSafe: boolean         // Whether spending is within free tier
  totalSpend: number            // Total monthly spend in USD
  freeTierLimit: number         // Free tier limit in USD
  alerts: Array<{               // Budget alert configuration
    threshold: number           // Alert threshold percentage
    enabled: boolean            // Whether alert is enabled
    lastTriggered?: Timestamp   // Last time alert was triggered
  }>
  lastUpdated: Timestamp        // Last update timestamp
  breakdown: {                  // Cost breakdown by category
    compute: number
    storage: number
    networking: number
    other: number
  }
}
```

## Development Setup

### 1. Start Firestore Emulator
```bash
# Start emulator only
bun run emulator

# Start emulator with UI (accessible at http://localhost:4000)
bun run emulator:ui

# Start both emulator and backend server
bun run dev:emulator
```

### 2. Test Configuration
```bash
# Run setup and connection test
bun run setup
```

### 3. Development Workflow
1. Start the Firestore emulator: `bun run emulator`
2. In another terminal, start the backend: `bun run dev`
3. The backend will automatically connect to the emulator
4. Sample data will be initialized on first run

## API Integration

The Firestore service replaces the mock CloudSafetyService with these methods:

### Core Methods
- `getDeployments()` - Retrieve all deployment records
- `getBudget(userId)` - Get budget information for a user
- `getSnapshot(userId)` - Get aggregated data for context API
- `stopService(serviceId, userId)` - Stop services and update budget
- `addDeployment(deploymentData)` - Add new deployment record
- `recalculateBudget(userId)` - Recalculate budget totals

### Real-time Features
- `setupRealtimeListeners(callbacks)` - Set up real-time data synchronization
- WebSocket integration for live updates to frontend components

## Production Deployment

### Environment Variables
Set these environment variables for production:
```bash
NODE_ENV=production
PROJECT_ID=your-gcp-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

### Security Rules
The current Firestore rules allow full read/write access for development. For production, implement proper authentication and authorization rules.

### Indexes
Database indexes are defined in `firestore.indexes.json` for optimal query performance:
- Deployments by status and cost (for finding high-cost services)
- Deployments by cloud provider and update time (for recent changes)

## Troubleshooting

### Common Issues

**Connection Timeout**:
- Ensure Firestore emulator is running on localhost:8080
- Check that `FIRESTORE_EMULATOR_HOST` is set correctly

**Permission Errors**:
- Verify service account credentials are valid
- Check Firestore security rules allow the required operations

**Sample Data Not Loading**:
- Check console logs for initialization errors
- Verify collections are empty before sample data insertion

### Debug Commands
```bash
# Check emulator status
curl http://localhost:8080

# View emulator UI
open http://localhost:4000

# Test connection
bun run setup
```

## Migration from Mock Service

The Firestore service maintains API compatibility with the original mock CloudSafetyService:

### Replaced Methods
- `getResources()` → `getDeployments()`
- `getSnapshot()` → `getSnapshot()` (now async)
- `stopService()` → `stopService()` (now async with real persistence)

### New Features
- Real data persistence
- Real-time synchronization
- Multi-user support
- Proper error handling
- Production-ready configuration

## Next Steps

1. **Testing**: Implement comprehensive tests for Firestore operations
2. **Security**: Add proper authentication and authorization rules
3. **Monitoring**: Add logging and monitoring for production deployment
4. **Backup**: Implement backup and disaster recovery procedures