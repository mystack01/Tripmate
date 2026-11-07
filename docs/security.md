# Security Measures

This document outlines the security practices implemented in the TripMate application.

| Protection | Implementation / File | Threat it stops |
|------------|-----------------------|-----------------|
| **Password Hashing** | `bcryptjs` in `User.js` pre-save hook | Plain-text password theft. Even if the DB is compromised, passwords cannot be read. |
| **Authentication** | JWT via `jsonwebtoken` in `auth.js` middleware | Unauthorized access to protected routes. |
| **Authorization (Roles)** | `adminOnly` middleware | Regular users accessing admin-only endpoints. |
| **Data Ownership** | Checks in `tripController.js` | Users accessing, editing, or deleting other users' trips. |
| **Input Validation** | `express-validator` in `validate.js` middleware | Malicious or malformed input. Returns `400 Bad Request`. |
| **HTTP Headers** | `helmet` in `app.js` | Common web vulnerabilities (e.g., XSS, clickjacking) by setting secure headers. |
| **Cross-Origin Protection** | `cors` in `app.js` with a strict allow-list | Malicious websites making requests to our API. |
| **Rate Limiting** | `express-rate-limit` in `app.js` | Brute-force attacks and DDoS by limiting requests per IP. |
| **NoSQL Injection** | `express-mongo-sanitize` in `app.js` | Strips `$` and `.` from `req.body`, preventing malicious MongoDB queries. |

> **Note:** All secrets (MongoDB URI, JWT Secret) are stored in `.env` and are never committed to version control.