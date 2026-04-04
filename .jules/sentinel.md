## 2024-05-24 - [Information Disclosure in 500 Responses]
**Vulnerability:** Internal system errors and API error messages (like `error.message` from GCP/AWS SDKs) were directly forwarded to clients in HTTP 500 JSON responses.
**Learning:** Returning unhandled exception messages from cloud provider SDKs can leak internal details about project structure, IAM policies, and infrastructure configuration to unauthorized users.
**Prevention:** Always catch exceptions at the controller level and return generic, safe error messages (e.g., "An internal error occurred.") to the client, while logging the actual `error.message` securely on the server-side.

## 2024-04-04 - Unauthenticated Module Route Loading
**Vulnerability:** The dynamic module loader in `app.js` or manual route configurations like `backend/src/modules/onboard/routes.js` loaded module routes without applying standard authentication middleware at the router level.
**Learning:** Due to the modular architecture, relying on individual module files (`routes.js`) to self-enforce authentication leads to misses. The `POST /` route in `onboard` was left completely unauthenticated, exposing potentially sensitive logic (`recalculateBudget`) to any caller.
**Prevention:** Consider enforcing a default-deny policy at the module registration layer in `app.js` or implementing automated linting/testing that explicitly flags any new `express.Router()` endpoint lacking `verifyAuth` middleware.

## 2024-04-04 - Authentication on Public Flow Endpoints
**Vulnerability:** Adding authentication middleware to intentionally public endpoints (like onboarding/registration).
**Learning:** Security fixes should not disrupt intended public business logic. Attempting to restrict a `POST /onboard` endpoint broke the application's onboarding flow because the system requires unauthenticated users to start the process.
**Prevention:** Always verify if an endpoint is part of a public registration, onboarding, or webhook flow before blindly adding authentication middleware to it.
