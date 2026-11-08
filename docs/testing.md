Tested locally with VS Code REST Client on http://localhost:5000.

| Test | Method | URL | Status | Response observed |
|------|--------|-----|--------|-------------------|
| Register (first run, new email) | POST | /api/auth/register | 201 | User created, JWT `token` + `user` object returned |
| Register (second run, same email) | POST | /api/auth/register | 409 | `"Email is already registered"` |
| Register (invalid email) | POST | /api/auth/register | 400 | `"Validation failed"` + `"Enter a valid email"` for field `email` |
| Login (success) | POST | /api/auth/login | 200 | JWT `token` + `user` object (`role: user`) |
| GET /me (no token) | GET | /api/auth/me | 401 | `"Not authenticated"` |

## Trips and Admin API

Tested locally with VS Code REST Client on http://localhost:5000.

| Test | Method | URL | Status | Response observed |
|------|--------|-----|--------|-------------------|
| Get trips without token | GET | /api/trips | 401 | `"Not authenticated"` |
| Admin route as normal user | GET | /api/admin/users | 403 | `"Admin access only"` |
| Access another user's trip | GET | /api/trips/:id | 403 | `"Not authorized"` |
| Create trip with empty title | POST | /api/trips | 400 | `"Validation failed"` + title error |

## Quality & Accessibility

- **Lighthouse Accessibility Score:** 100/100
- **Notes:** Ran Lighthouse audit in Chrome on the local development server. No major issues found.

## Pre-Deployment Checks

- **Local smoke test:** Verified register, login, create trip, edit trip, delete trip, and admin dashboard all work locally.
- **Known limitations:** 
  1. No email verification.
  2. No password reset.
  3. Token stored in localStorage.
  4. Free-tier servers sleep after 15 minutes of inactivity.