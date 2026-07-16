# Security Policy

`dev-ai-toolkit` is currently a local-first browser application. It does not
run a backend service, create user accounts, or store shared project data on a
server.

## Supported Versions

Security fixes are handled on the `main` branch first. Released versions may be
patched when the fix is small and useful for users of the current public
release.

| Version | Supported |
| --- | --- |
| `main` | Yes |
| `0.2.x` | Yes |
| `0.1.x` | No |

## Reporting A Security Issue

Please do not share vulnerability details in a public issue.

Use [GitHub private vulnerability reporting](https://github.com/as569951728/dev-ai-toolkit/security/advisories/new)
to send the maintainer a private report. Include:

- Affected feature or file
- Steps to reproduce, if safe to share
- Browser and operating system
- Possible impact

## Current Security Scope

The most relevant areas for this project today are:

- Local storage import/export handling
- JSON parsing and file download flows
- Links, copied snippets, and generated text shown in the UI
- Dependency and build-chain updates

Because the app is local-first, data in one browser profile is not shared with
other users unless the user exports it manually.
