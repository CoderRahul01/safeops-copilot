# API & Route Design: SafeOps Co-pilot

This document specifies the RESTful interface for the SafeOps Co-pilot backend.

## Base URL

`http://localhost:8080/api`

## Authentication

Initially, the platform uses local service account credentials for testing. The `/onboard` endpoint allows users to submit their own IAM credentials for live monitoring.

## Endpoints

### 1. General & Context

- **GET `/context`**
  - **Purpose**: Provides high-level state for the Tambo Agent.
  - **Response**:
    ```json
    {
      "userRole": "infrastructure-admin",
      "billingStatus": { "totalSpend": 12.5, "freeTierSafe": true },
      "metrics": { "active_resources": 5, "risk_count": 0 },
      "recommendation": "Optimization suggested for 2 Lambda functions."
    }
    ```

### 2. Onboarding

- **POST `/onboard`**
  - **Purpose**: Submit AWS/GCP credentials.
  - **Request Body**:
    ```json
    {
      "provider": "aws" | "gcp",
      "credentials": { ... }
    }
    ```

### 3. AWS Specific

- **GET `/aws/billing`**: Fetches current month's spend via Cost Explorer.
- **GET `/aws/services`**: Lists active Lambda, EC2, and RDS resources.
- **POST `/aws/stop-service`**: Scales a resource to zero or terminates it.

### 4. GCP Specific

- **GET `/gcp/billing`**: Fetches GCP billing info.
- **GET `/gcp/services`**: Lists Cloud Run and GCE resources.
- **POST `/gcp/stop-service`**: Stops a Cloud Run service.

### 5. Safety & Troubleshooting

- **GET `/safety/overspend-check`**: Validates current spend against user-defined thresholds.
- **POST `/safety/evaluate-deployment`**: Simulates cost impact of a new deployment.
- **GET `/safety/troubleshoot/:issueId`**: Returns status for a specific troubleshooting workflow.
