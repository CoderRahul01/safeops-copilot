## 2024-05-24 - [Information Disclosure in 500 Responses]
**Vulnerability:** Internal system errors and API error messages (like `error.message` from GCP/AWS SDKs) were directly forwarded to clients in HTTP 500 JSON responses.
**Learning:** Returning unhandled exception messages from cloud provider SDKs can leak internal details about project structure, IAM policies, and infrastructure configuration to unauthorized users.
**Prevention:** Always catch exceptions at the controller level and return generic, safe error messages (e.g., "An internal error occurred.") to the client, while logging the actual `error.message` securely on the server-side.

## 2025-04-16 - [Information Disclosure in Catch Blocks]
**Vulnerability:** Raw error messages from exceptions (e.g. `error.message`) were directly passed to `res.status(500).json` in several module controllers and routes (Onboard, Security Audit, AI).
**Learning:** Returning unhandled exception messages to the client can leak internal details or sensitive stack traces.
**Prevention:** Catch errors and return generic error messages to the client, while explicitly logging the real error server-side.
