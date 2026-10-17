# Security Policy

## Reporting a vulnerability

Please report suspected vulnerabilities privately through GitHub's private vulnerability reporting for this repository. Do not open a public issue containing credentials, tokens, private user data, exploit details, or production infrastructure information.

Include the affected component, reproduction steps, impact, and any suggested mitigation. Redact secrets from logs and request payloads.

## Credential exposure

If a Firebase service-account key, Gemini key, payment secret, token, or other credential is exposed:

1. Revoke or rotate it immediately in the owning provider.
2. Remove it from local files and deployment configuration.
3. Check Git history and CI logs for additional exposure.
4. Report the incident privately with the affected credential type and rotation time.

A `.gitignore` entry prevents future staging; it does not invalidate an already exposed credential.

## Supported versions

Only the latest `main` branch is currently supported. Deployments should use the dependency lockfile and the repository CI checks.
