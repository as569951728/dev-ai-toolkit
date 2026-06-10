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
| `0.1.x` | Best effort |

## Reporting A Security Issue

Please avoid sharing sensitive proof-of-concept details in a public issue.

If you find a security issue, use GitHub private vulnerability reporting if it is
available for the repository. If it is not available, open a GitHub issue with a
short, low-detail summary and ask to coordinate reproduction details privately.
Include:

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
