# Multi-Tenancy & Data Privacy Guide

SafeOps Co-pilot is designed using a **Single Database, Shared Schema** multi-tenancy model.

## 🔑 Tenant Identification

- Every data model (Deployments, Budgets, Logs) MUST include a `userId` or `tenantId` field.
- The `userId` is currently defaulted to `default-user` for the MVP but is structured to support unique IAM identifiers.

## 🛡 Data Isolation Policy

1. **Scope Queries**: Never perform a global `get()` on collections without a filter.

   ```javascript
   // Correct
   db.collection("deployments").where("userId", "==", currentUserId).get();

   // Incorrect
   db.collection("deployments").get();
   ```

2. **Middleware Enforcement**: Future iterations will include a `tenantMiddleware` to automatically inject the `tenantId` into `req` objects.

3. **Secure SDKs**: Internal services (GCP/AWS) are initialized with credentials on a per-tenant basis during the onboarding flow.

## 📂 Folder-Specific Documentation Strategy

As per policy, each complex task or module contains its own documentation in its folder (e.g., `src/modules/billing/README.md`) to maintain granularity.
