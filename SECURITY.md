# Security Policy

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability, please report it privately:

1. **Email**: Send details to security@galaxyco.ai (or your preferred contact)
2. **GitHub Security Advisories**: Use the "Report a vulnerability" button in the Security tab

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes (optional)

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Resolution Timeline**: Depends on severity, typically 30-90 days

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.x.x   | :white_check_mark: |

## Security Best Practices for Contributors

### Environment Variables

- Never commit `.env` or `.env.local` files
- Use `.env.example` for documentation only
- Rotate any accidentally exposed credentials immediately

### Dependencies

- Keep dependencies updated
- Review dependency changes in PRs
- Report suspicious packages

### Code Review

- All code changes require review
- Security-sensitive changes need extra scrutiny
- CI checks must pass before merge

## Scope

This security policy applies to:

- The Nerve Agent web application (`apps/web/`)
- Official documentation
- Build and deployment configurations

Third-party integrations and self-hosted instances are outside our direct scope, but we welcome reports about issues that could affect users.
