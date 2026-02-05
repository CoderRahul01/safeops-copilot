# SafeOps Knowledge Base: SDK & Tambo Patterns

Reference guide for implementation details to ensure technical accuracy and originality for the hackathon.

## AWS SDK for JavaScript v3 (Node.js)

### Cost Explorer (Billing)

- **Client**: `@aws-sdk/client-cost-explorer`
- **Command**: `GetCostAndUsageCommand`
- **Granularity**: `DAILY` or `MONTHLY`
- **Metrics**: `['UnblendedCost', 'UsageQuantity']`
- **GroupBy**: `[{ Type: 'DIMENSION', Key: 'SERVICE' }]`

### Lambda & EC2 (Resource Monitoring)

- **Lambda**: `ListFunctionsCommand` from `@aws-sdk/client-lambda`
- **EC2**: `DescribeInstancesCommand` from `@aws-sdk/client-ec2`

## Google Cloud (GCP) SDK

### Billing

- **API**: `cloudbilling.googleapis.com`
- **Method**: `billingAccounts.get` or `projects.getBillingInfo`

### Cloud Run

- **Client**: `@google-cloud/run`
- **Scope**: `https://www.googleapis.com/auth/cloud-platform`

## Tambo AI: Generative UI Best Practices

### Dynamic UI Progress

- Use `annotations.tamboStreamableHint: true` in tool definitions.
- Allows partial streaming of results to show progress (e.g., "Scanning AWS...").

### Troubleshooting Workflow

- **State Visibility**: Use `useTamboComponentState` to expose component data to the agent.
- **Workflow Pattern**:
  1. Detect Issue (e.g., high Lambda spend).
  2. Render `TroubleshootingWorkflow` component with specific steps.
  3. AI monitors step completion via tool calls (e.g., `check_service_status`).
  4. UI dynamically updates step status (✅).

### Judging Criteria Focus

- **Aesthetics**: Monochrome (B&W) theme with bold typography.
- **Impact**: Real-time prevention of free tier overspend.
- **Tambo Use Case**: Agent-driven remediation (killing expensive services via chat).
