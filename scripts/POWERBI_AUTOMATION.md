Power BI automation: dataset refresh + monitoring

Overview
- scripts/powerbi-refresh.ps1: Starts a dataset refresh using a service principal (client credentials), polls for completion, and optionally posts JSON notifications to a webhook.
- .github/workflows/powerbi-refresh.yml: example GitHub Actions workflow to run the script on a schedule.

Setup
1. Azure AD app registration
   - Create an app registration in Azure AD.
   - Under API permissions, add Power BI Service -> Application permission: Dataset.ReadWrite.All (or least required), then grant admin consent.
   - Create a client secret and copy ClientId and ClientSecret.

2. Power BI tenant settings
   - In the Power BI admin portal, enable service principals and allow the app to access Power BI APIs.
   - Optionally add the service principal to the target workspace with appropriate role.

3. GitHub Secrets
   - Add these secrets to the repo: POWERBI_TENANT_ID, POWERBI_CLIENT_ID, POWERBI_CLIENT_SECRET, POWERBI_GROUP_ID, POWERBI_DATASET_ID
   - Optional: POWERBI_NOTIFY_WEBHOOK (HTTP endpoint to receive JSON notifications)

Usage
- Run locally:
  pwsh -File scripts\powerbi-refresh.ps1
  (script reads values from environment variables if not passed as parameters)

- Using GitHub Actions:
  The provided workflow triggers on schedule and manual dispatch. Update cron and secrets as needed.

Security
- Use a least-privilege service principal and rotate secrets regularly.
- If sending notifications, secure the webhook endpoint.

Notes
- This script uses client credentials. For delegated flows or user-scoped refreshes, adapt the authentication flow.
- Test in a non-production workspace first.
