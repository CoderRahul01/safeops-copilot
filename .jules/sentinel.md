## 2024-05-24 - [Information Disclosure in 500 Responses]
**Vulnerability:** Internal system errors and API error messages (like `error.message` from GCP/AWS SDKs) were directly forwarded to clients in HTTP 500 JSON responses.
**Learning:** Returning unhandled exception messages from cloud provider SDKs can leak internal details about project structure, IAM policies, and infrastructure configuration to unauthorized users.
**Prevention:** Always catch exceptions at the controller level and return generic, safe error messages (e.g., "An internal error occurred.") to the client, while logging the actual `error.message` securely on the server-side.

## 2024-05-24 - [Unauthenticated Onboarding Endpoint]
**Vulnerability:** The `/onboard` endpoint for adding cloud provider credentials was missing authentication middleware, allowing unauthorized requests to submit credentials and interact with the service.
**Learning:** All endpoints that handle sensitive operations or data modifications must explicitly apply authentication middleware, even if they don't immediately crash without a user object.
**Prevention:** Always verify that route definitions for new modules include `verifyAuth` or similar protection before deploying to production.
