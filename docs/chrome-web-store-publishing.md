# Publishing to the Chrome Web Store (CI/CD runbook)

The CD pipeline (`.github/workflows/deploy.yml`) publishes to the Chrome Web
Store using an OAuth refresh token stored in the `REFRESH_TOKEN` GitHub secret.

**The token expires every 7 days** (the OAuth app is in "Testing" mode). When a
release fails with `HTTP 400` at the "Upload & Submit to Chrome Web Store" step,
the token is dead. Regenerate it with the 4 steps below (~5 minutes).

## TL;DR

1. Copy Client ID + Client Secret from Google Cloud Console.
2. Get a fresh Refresh Token from the OAuth Playground.
3. `gh secret set REFRESH_TOKEN --repo jayll1303/TabMaka` (paste the token).
4. `gh workflow run deploy.yml --ref main -f publish_to_web_store=true`

---

## Step 1 — Get Client ID & Client Secret

1. Open Google Cloud Console → APIs & Services → **Credentials** (project: `tiengnoiaivoice`).
2. Click the OAuth 2.0 Client ID (type: Web application).
3. Copy **Client ID** and **Client secret** (you need both for Step 2).

One-time client setup (already done — only redo if you make a new client):
- Under **Authorized redirect URIs**, this URI must be present:
  `https://developers.google.com/oauthplayground`
- OAuth consent screen → **Audience → Test users**: your Google account must be listed.
- Keep the consent screen **publishing status = Testing** (do not "Publish app").

## Step 2 — Get a Refresh Token (OAuth Playground)

1. Open https://developers.google.com/oauthplayground
2. Click the gear icon (⚙️, top-right) → check **Use your own OAuth credentials** → paste Client ID + Client Secret.
3. Left panel, **Input your own scopes** box, enter exactly:
   `https://www.googleapis.com/auth/chromewebstore`
4. Click **Authorize APIs** → sign in with the **test user** account → on "Google hasn't verified this app" click **Advanced → Continue** → **Allow**.
5. Step 2 section → click **Exchange authorization code for tokens**.
6. Copy the **Refresh token** (`1//...`).

## Step 3 — Update the GitHub secret

```bash
gh secret set REFRESH_TOKEN --repo jayll1303/TabMaka
```
Paste the refresh token at the prompt, press Enter.

Only if you created a NEW OAuth client (different Client ID), also update:
```bash
gh secret set CLIENT_ID --repo jayll1303/TabMaka
gh secret set CLIENT_SECRET --repo jayll1303/TabMaka
```
> All three (`CLIENT_ID`, `CLIENT_SECRET`, `REFRESH_TOKEN`) must come from the
> same OAuth client, or the token exchange fails with 400.

## Step 4 — Run the publish pipeline

```bash
gh workflow run deploy.yml --ref main -f publish_to_web_store=true
```
Watch it:
```bash
gh run list --workflow=deploy.yml --limit 1        # get the run id
gh run watch <run-id> --exit-status
```
Success = the **Upload & Submit to Chrome Web Store** step shows ✓. The new
version is then submitted and waits for Google review before going live.

> Note: `deploy.yml` bumps nothing. It packages the current `main` at whatever
> version is in `package.json`. Cut the release/version bump first.

---

## Troubleshooting (gotchas we hit)

| Symptom | Cause | Fix |
|---|---|---|
| `HTTP 400` at Upload & Submit, response returns in ~100ms | Refresh token expired (7-day Testing limit) or the 3 secrets are from different clients | Regenerate token (Steps 1–3); ensure all 3 secrets share one client |
| `redirect_uri_mismatch` in Playground | Client is missing the Playground redirect URI | Add `https://developers.google.com/oauthplayground` to Authorized redirect URIs |
| `access_denied` during authorize | Your account isn't a Test user | Add it under OAuth consent → Audience → Test users |
| Playground returns no `refresh_token` | Consent already granted, or missing `prompt=consent` | Revoke at https://myaccount.google.com/permissions, then redo Step 2 |
| `400` but token is valid | A previous version is still "Pending review" | Wait until it's Published, then re-run Step 4 |
| "verify ownership of homepage" | Tried to Publish app to Production with a homepage URL you don't own (e.g. github.com) | Stay in Testing, or remove the homepage URL from Branding |

## Make it permanent (optional, ~15 min one-time)

To stop regenerating every 7 days, move the OAuth app to **Production** —
Production refresh tokens don't expire.

1. Branding → **remove the Application home page URL** (this is what triggers the domain-ownership verification wall).
2. Audience → **Publish app** → In production.
3. Regenerate the token (Steps 1–3). The "unverified app" warning is expected; click **Advanced → Continue**.

Trade-off: Production stays "unverified" (fine for a single-maintainer token).
Getting the verified badge would need a homepage on a domain you actually own —
not required.

## Current secrets (names only)

`EXTENSION_ID`, `CLIENT_ID`, `CLIENT_SECRET`, `REFRESH_TOKEN` — set in
repo Settings → Secrets and variables → Actions. Never commit their values.
