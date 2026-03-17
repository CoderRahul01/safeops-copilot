## 2024-03-17 - Hardcoded AES Encryption Key in Credential Service
**Vulnerability:** Found a hardcoded fallback string `'super-secret-key-32-chars-long-!!'` used as the key for encrypting and decrypting sensitive cloud credentials via `aes-256-gcm` in `CredentialService`.
**Learning:** Fallback keys meant for ease of local development can easily slip into production if not carefully guarded. A predictable static key completely undermines encryption at rest.
**Prevention:** Always fail securely instead of falling back to a static key. If `process.env.ENCRYPTION_KEY` is missing, throw an initialization error on startup, forcing a secure key to be set before the application can start and safely encrypt persistent data.
