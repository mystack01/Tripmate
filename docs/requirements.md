## Problem

Planning a trip usually means juggling several apps: one for weather, one for currency, one for country info, one for notes, one for expenses. This wastes time and causes mistakes, especially for students and budget travellers who cannot afford paid travel planners.

## Target Users

- Students and budget travellers planning short trips
- Casual tourists who want a simple planner without subscriptions
- Admins who need a quick overview of all user activity

## Stakeholders

- **Travellers:** use the app to plan, edit and track trips
- **Admin:** manages users and monitors platform statistics

## Functional Requirements

- **FR1:** User can register with name, email and password
- **FR2:** User can log in and receive a JWT
- **FR3:** User can log out (client clears token)
- **FR4:** User can create a trip (title, destination, dates, budget)
- **FR5:** User can view a list of their trips
- **FR6:** User can open a trip and see full details
- **FR7:** User can edit and delete their own trips
- **FR8:** Trip page shows weather forecast for destination (Open-Meteo)
- **FR9:** Trip page shows country info (World Bank / countries dataset)
- **FR10:** Budget is converted using live exchange rates
- **FR11:** User can add itinerary items
- **FR12:** User can add expenses and see remaining budget
- **FR13:** User can manage a packing list
- **FR14:** Admin can view total users, trips and platform statistics
- **FR15:** Admin can list and delete users

## Non-Functional Requirements

- **Security:** passwords hashed with bcrypt, JWT for sessions, helmet, CORS allow-list, rate limiting, input validation, NoSQL sanitising
- **Usability:** mobile-friendly layout, dark mode, clear error messages
- **Accessibility:** semantic HTML, labels on inputs, keyboard navigation, colour contrast
- **Performance:** client builds with Vite, list endpoints paginated where needed
- **Reliability:** all endpoints validated, JSON error responses, no server crash on bad input

## Feasibility

- All external APIs are **free** (Open-Meteo, World Bank, ExchangeRate-API, countries dataset, OpenStreetMap)
- Hosting on free tiers (Render + Vercel + MongoDB Atlas M0)
- Single language stack (JavaScript) keeps the timeline short