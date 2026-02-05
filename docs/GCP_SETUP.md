# GCP & Firebase Manual Setup Guide

To ensure SafeOps Co-pilot runs securely and within the GCP Free Tier, follow these manual steps.

## 1. Firebase Authentication Setup

The backend is now hardened with authentication middleware. You must enable auth in your project.

1.  **Firebase Console**: Go to [Firebase Console](https://console.firebase.google.com/).
2.  **Add/Select Project**: Use the same project as your GCP Project ID (`arcane-dolphin-484007-f8`).
3.  **Authentication**:
    - Go to **Build > Authentication**.
    - Click **Get Started**.
    - Enable **Email/Password** and **Google** sign-in providers.
4.  **Register App**:
    - Go to **Project Settings > General**.
    - Under **Your apps**, click the **</> (Web icon)**.
    - Register it as `SafeOps-Web`.
    - **Note down the `firebaseConfig` object**. You will need this for the frontend `.env.local`.

## 2. GCP Secret Manager (Requires Billing)

> [!IMPORTANT]
> GCP Secret Manager and Budget Alerts require a **linked billing account**, even if usage stays within the free tier. If you do not have billing enabled, skip to **Section 2b: Local Fallback**.

1.  **Enable API**: `gcloud services enable secretmanager.googleapis.com`
2.  **Create Secret**:
    ```bash
    gcloud secrets create SAFEOPS_SERVICE_ACCOUNT --replication-policy="automatic"
    # Upload your service-account.json
    gcloud secrets versions add SAFEOPS_SERVICE_ACCOUNT --data-file="./backend/src/config/service-account.json"
    ```
3.  **Permissions**: Grant the Cloud Run service account access:
    ```bash
    PROJECT_NUMBER=$(gcloud projects describe arcane-dolphin-484007-f8 --format='value(projectNumber)')
    gcloud secrets add-iam-policy-binding SAFEOPS_SERVICE_ACCOUNT \
      --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
      --role="roles/secretmanager.secretAccessor"
    ```

## 2b. Local Fallback (Hackathon/Development)

If you cannot enable billing or prefer a faster setup for the hackathon:

1.  **Place Credentials**: Ensure your `service-account.json` is located at `backend/src/config/service-account.json`.
2.  **Update .env**: Path in `backend/.env` should point to the relative path from the project root:
    ```env
    GOOGLE_APPLICATION_CREDENTIALS=./src/config/service-account.json
    ```
3.  **Status**: The backend is configured to automatically pick up this file in development mode.

## 3. Free Tier Optimization & Cost Guardrails

Since your project has billing enabled, you are automatically on the **Firebase Blaze plan**. However, you still get most "Free Tier" quotas.

### Key Free Quotas (Daily/Monthly)

- **Firebase Auth**: Unlimited (Email/Password & Social Auth). _Phone auth limited to 10k/mo._
- **Cloud Firestore**: 50k Reads, 20k Writes, 20k Deletes per day.
- **Cloud Run (SafeOps Default)**: 2M requests/mo, 360k GB-seconds memory/mo.
- **Artifact Registry**: 0.5 GB storage/mo. _Note: Deployment versions accumulate; see step 5 for cleanup._

### Mandatory: Set a Budget Alert (Requires Billing)

> [!NOTE]
> Budget alerts are only available if a billing account is linked to the project.

To prevent any "bill shock", set a budget alert immediately:

1.  **GCP Console**: Go to [Billing > Budgets & alerts](https://console.cloud.google.com/billing/budgets).
2.  **Create Budget**:
    - Name: `SafeOps-Tight-Budget`
    - Amount: Set a small amount (e.g., **$1.00** or **$5.00**).
    - Under **Actions**, ensure "Email alerts" are checked.
3.  **Thresholds**: Set alerts at 50%, 90%, and 100% of the budget.

## 4. Frontend Environment Variables

Create a `frontend/.env.local` with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 5. Maintenance (Cost Prevention)

To keep the storage costs zero:

- **Cleanup Old Images**: Regularly delete old Docker image versions in [Artifact Registry](https://console.cloud.google.com/artifacts).
- **Auto-Cleanup**: You can set an [Artifact Registry Cleanup Policy](https://cloud.google.com/artifact-registry/docs/repositories/cleanup-policy) to automatically delete images older than 7 days.
