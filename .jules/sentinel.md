## 2024-05-24 - [Information Disclosure in 500 Responses]
**Vulnerability:** Internal system errors and API error messages (like `error.message` from GCP/AWS SDKs) were directly forwarded to clients in HTTP 500 JSON responses.
**Learning:** Returning unhandled exception messages from cloud provider SDKs can leak internal details about project structure, IAM policies, and infrastructure configuration to unauthorized users.
**Prevention:** Always catch exceptions at the controller level and return generic, safe error messages (e.g., "An internal error occurred.") to the client, while logging the actual `error.message` securely on the server-side.

## 2024-05-24 - [Medium] Prevent Information Disclosure in HTTP Responses
**Vulnerability:** HTTP 500 error responses were exposing internal error details via `error.message` directly to the client (e.g., `res.status(500).json({ error: 'Failed', message: error.message })`).
**Learning:** Returning raw internal error messages from cloud provider SDKs or internal exceptions to the client can leak sensitive information about the backend architecture or stack.
**Prevention:** Always catch exceptions and return generic, safe error messages to the client (e.g., `message: 'An internal error occurred.'`) while logging the actual `error.message` server-side for debugging.
