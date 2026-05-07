## 2024-05-24 - [Information Disclosure in 500 Responses]
**Vulnerability:** Internal system errors and API error messages (like `error.message` from GCP/AWS SDKs) were directly forwarded to clients in HTTP 500 JSON responses.
**Learning:** Returning unhandled exception messages from cloud provider SDKs can leak internal details about project structure, IAM policies, and infrastructure configuration to unauthorized users.
**Prevention:** Always catch exceptions at the controller level and return generic, safe error messages (e.g., "An internal error occurred.") to the client, while logging the actual `error.message` securely on the server-side.
## 2024-05-07 - Information Disclosure via Error Messages
**Vulnerability:** Raw `error.message` strings were returned directly to the client in HTTP 500 response bodies.
**Learning:** This is a common pattern when quickly writing catch blocks, but it can leak sensitive internal paths.
**Prevention:** Always log the raw error on the server side (`console.error`) and return generic, safe error messages to the client.
