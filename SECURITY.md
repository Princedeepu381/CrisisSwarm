# 🔒 Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x (Hackathon) | ✅ Active |

## Zero Trust Architecture

CrisisSwarm is designed around **Zero Trust** security principles:

- **AuthGuard** — all routes except `/login` require an authenticated session
- **RBAC** — Role-Based Access Control enforced at login (Security Operations Lead)
- **MFA** — Multi-factor authentication indicator at the login portal
- **Azure AD SSO** — Microsoft-branded OAuth2 authentication flow
- **Session tokens** — Secure per-session token management
- **No secrets in code** — all credentials managed via environment variables (`.env` is gitignored)

## Reporting a Vulnerability

If you discover a security vulnerability in CrisisSwarm, please **do not** open a public GitHub issue.

Instead, contact the maintainer directly:

- **GitHub:** [@Princedeepu381](https://github.com/Princedeepu381)

We will acknowledge your report within 48 hours and aim to release a fix within 7 days.

## Environment Variable Security

The application uses the following sensitive environment variables. **Never commit these to source control.**

```
AZURE_OPENAI_API_KEY       # Azure OpenAI API credentials
AZURE_OPENAI_ENDPOINT      # Azure resource endpoint
```

The `.gitignore` explicitly excludes `.env` and `.env.local`. A `.env.example` template with placeholder values is provided for reference.

## Responsible Disclosure

This project was built for the **Microsoft Build AI Hackathon 2026** and follows responsible disclosure principles in alignment with Microsoft's security guidelines.
