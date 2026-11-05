# TripMate API

Base URL: `http://localhost:5000/api`

## Auth
| Method | URL | Auth required | Purpose |
|--------|-----|---------------|---------|
| POST | /auth/register | No | Register new user |
| POST | /auth/login | No | Login, returns JWT |
| GET | /auth/me | Yes | Get current user |

## Trips
| Method | URL | Auth required | Purpose |
|--------|-----|---------------|---------|
| GET | /trips | Yes | List user's trips |
| POST | /trips | Yes | Create trip |
| GET | /trips/:id | Yes | Get one trip |
| PUT | /trips/:id | Yes | Update trip |
| DELETE | /trips/:id | Yes | Delete trip |

## Admin
| Method | URL | Auth required | Purpose |
|--------|-----|---------------|---------|
| GET | /admin/stats | Yes (admin) | Platform stats |
| GET | /admin/users | Yes (admin) | List all users |
| DELETE | /admin/users/:id | Yes (admin) | Delete user |