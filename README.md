# TripMate – Smart Travel Planner (MERN)

Plan trips with live weather, country information and budget conversion.

**Stack:** MongoDB Atlas · Express · React (Vite) · Node.js
**Free APIs (no key):** Open-Meteo (geocoding + forecast), REST Countries, ExchangeRate-API open endpoint

## Run locally
```bash
# terminal 1
cd server && cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm install && npm run dev

# terminal 2
cd client && cp .env.example .env
npm install && npm run dev
```
Open http://localhost:5173

## Architecture
`routes -> validation -> controllers -> models`, with third-party calls isolated in `services/externalApi.js`.

## Security
bcrypt hashing, JWT auth, role-based authorization, express-validator, helmet, CORS allow-list, rate limiting,
NoSQL-injection sanitising, input size limits, React output escaping, ownership checks on every trip.

## Tests
`cd server && npm test`

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas (Mongoose)
- **Free APIs:** Open-Meteo (weather), World Bank (country data), countries dataset, ExchangeRate-API, OpenStreetMap (maps)
- **Security:** bcrypt, JWT, helmet, CORS, rate limiting, express-validator, express-mongo-sanitize

## Project Structure

- `server/` — Express API
- `client/` — React frontend
- `docs/` — Requirements, API, architecture, security, testing, deployment notes

## Author

mystack01
