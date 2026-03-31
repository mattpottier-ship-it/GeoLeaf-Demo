# Security Policy — GeoLeaf

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x     | :white_check_mark: |
| < 2.0   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

### Contact

Send your report to: **security@geoleaf.dev**

Include in your report:

- A description of the vulnerability and its potential impact
- Steps to reproduce the issue
- Affected version(s)
- Any suggested mitigation or fix (optional)

### Response Timeline

| Step                          | Timeframe        |
| ----------------------------- | ---------------- |
| Acknowledgement of receipt    | Within 48 hours  |
| Initial triage and assessment | Within 5 days    |
| Status update                 | Every 7 days     |
| Fix or workaround             | Within 30 days   |
| Public disclosure             | After fix is out |

We follow a **coordinated disclosure** model. We ask that you give us reasonable time to address the vulnerability before any public disclosure.

## Scope

This policy covers the following repositories:

| Repository        | Scope                                |
| ----------------- | ------------------------------------ |
| `GeoLeaf-Core`    | All code in `src/` — MIT licensed    |
| `GeoLeaf-Js`      | Integration scripts, build pipeline  |
| `GeoLeaf-Plugins` | Commercial plugins (storage, addpoi) |

### In scope

- Cross-Site Scripting (XSS) vulnerabilities in the security module
- CSRF token bypass
- Prototype pollution
- Unsafe HTML injection via the DOM
- URL validation bypass allowing dangerous protocol execution
- Dependency vulnerabilities with direct exploit paths

### Out of scope

- Vulnerabilities in MapLibre GL or other peer dependencies (please report to those projects directly)
- Issues that require physical access to the user's device
- Social engineering attacks
- Issues in outdated, unsupported versions (< 2.0)
- Denial of service attacks against a deployed instance

## Security Architecture

GeoLeaf implements multiple layers of protection:

- **XSS protection**: `modules/security/` — `escapeHtml()`, `escapeAttribute()`, `sanitizeHTML()`, `sanitizeSvgContent()`
- **CSRF protection**: `modules/security/csrf-token.ts` — token generation and validation for POST operations
- **DOM security**: `modules/utils/dom-security.ts` — replaces all direct `innerHTML` usage
- **Input validation**: `modules/utils/validators/` — URL whitelist (`https:`, `http:`, `data:` images only), coordinate bounds, GeoJSON structure
- **Fetch security**: `modules/utils/fetch-helper.ts` — URL validation + rate limiting (50 req/10s/domain)
- **Error sanitization**: `modules/errors/` — `sanitizeErrorMessage()` escapes HTML in error messages

## Deployment Security Recommendations

See [`docs/SECURITY.md`](./docs/SECURITY.md) and [`docs/security/`](./docs/security/) for recommended HTTP headers, CSP configuration, and security architecture guidance.

## Known Limitations

- `data:` URLs for images are permitted by design. Only MIME types `image/png`, `image/jpeg`, `image/gif`, `image/webp`, `image/svg+xml` are allowed.
- The library accepts both `http:` and `https:` protocols by default. For production deployments, see the `security.httpsOnly` configuration option.
- The Service Worker does not implement authentication checks — it handles only static/cacheable resources.

## Bug Bounty

There is currently **no formal bug bounty program**. Responsible disclosure is always appreciated and credited in the changelog (with your permission).
