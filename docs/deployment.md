# Deployment Guide

## 1. Database (MongoDB Atlas)
- Already hosted on Atlas (M0 cluster).
- Ensure Network Access allows `0.0.0.0/0`.

## 2. Backend (Render)
- Create a new Web Service on Render.
- Connect the GitHub repository.
- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`

## 3. Frontend (Vercel)
- Create a new project on Vercel.
- Connect the GitHub repository.
- Root directory: `client`
- Framework preset: `Vite`
- Environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`