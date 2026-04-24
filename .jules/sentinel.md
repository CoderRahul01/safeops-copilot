## 2024-05-24 - [Information Disclosure in 500 Responses]
**Vulnerability:** Internal system errors and API error messages (like `error.message` from GCP/AWS SDKs) were directly forwarded to clients in HTTP 500 JSON responses.
**Learning:** Returning unhandled exception messages from cloud provider SDKs can leak internal details about project structure, IAM policies, and infrastructure configuration to unauthorized users.
**Prevention:** Always catch exceptions at the controller level and return generic, safe error messages (e.g., "An internal error occurred.") to the client, while logging the actual `error.message` securely on the server-side.

## 2024-04-24 - Information Disclosure in Module Error Handlers
**Vulnerability:** Raw `error.message` was exposed to clients in HTTP 500 error responses in `backend/src/modules/onboard/controllers.js`, `backend/src/modules/security-audit/routes.js`, and `backend/src/modules/ai/intent.controller.js`.
**Learning:** Returning internal errors to clients can leak sensitive environment, database, or cloud architecture details, aiding potential attackers.
**Prevention:** Always return a generic error message (e.g., `'An internal error occurred.'`) to the client, while ensuring the raw error is logged securely on the server (e.g., `console.error`) for observability.
