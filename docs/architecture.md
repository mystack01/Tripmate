# TripMate Architecture

TripMate follows a standard three-tier MERN architecture. The client and server are decoupled and communicate over a REST API.

## System Overview

```mermaid
flowchart LR
  Browser["React client (Vercel)"] -->|JSON over HTTPS| API["Express API (Render)"]
  API --> DB[("MongoDB Atlas")]
  API --> Ext["Open-Meteo, World Bank, ExchangeRate-API"]