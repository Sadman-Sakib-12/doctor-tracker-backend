# Doctor Tracker – Backend API

> **Doctor Tracker** is a secure, full-stack administrative web portal that empowers healthcare administrators to manage doctors and their patients from a single dashboard. This is the REST API powering the portal — built with Express.js, TypeScript, and MongoDB with optimized queries, JWT authentication, and full validation.

---

## Setup Guide

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & install
```bash
git clone https://github.com/Sadman-Sakib-12/doctor-tracker-backend.git
cd doctor-tracker-backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```

Fill in `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/doctor-tracker
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### 3. Run
```bash
npm run dev      # development (ts-node-dev)
npm run build    # compile to dist/
npm start        # production
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser (Next.js)                 │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP (Axios + Bearer JWT)
┌──────────────────────▼──────────────────────────────┐
│              Express.js REST API                     │
│                                                      │
│  Routes → Validators → Auth Middleware → Controllers │
│                    ↓                                 │
│             APIFeatures (search/filter/sort/paginate)│
└──────────────────────┬──────────────────────────────┘
                       │ Mongoose ODM
┌──────────────────────▼──────────────────────────────┐
│                   MongoDB Atlas                      │
│  text indexes · compound indexes · aggregation       │
└─────────────────────────────────────────────────────┘
```

---

## Technical Decisions

### 1. Reusable `APIFeatures` class over per-controller query logic

Every list endpoint needs search, filter, sort, and pagination. Duplicating this across controllers creates maintenance burden and inconsistency. The `APIFeatures` class chains `.search()`, `.filter()`, `.sort()`, and `.paginate()` onto any Mongoose query — so every endpoint benefits from the same optimised logic and new indexes apply globally.

### 2. MongoDB text indexes + compound indexes for performance

Instead of scanning all documents on every search, we register `{ name: 'text', specialization: 'text', hospital: 'text' }` text indexes on the Doctor model and `{ name: 'text', condition: 'text' }` on Patient. Combined with compound indexes on `createdAt` and `doctor` (foreign key), pagination and date-range filters run on indexed fields only — keeping query times sub-millisecond even at scale.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register admin |
| POST | `/api/auth/login` | Login |
| GET  | `/api/auth/me` | Current user |
| GET  | `/api/doctors` | List (search, filter, paginate) |
| POST | `/api/doctors` | Create doctor |
| GET  | `/api/doctors/:id` | Get doctor |
| PUT  | `/api/doctors/:id` | Update doctor |
| DELETE | `/api/doctors/:id` | Delete doctor + cascade patients |
| GET  | `/api/doctors/:id/patients` | Doctor's patients |
| POST | `/api/doctors/:id/patients` | Add patient under doctor |
| GET  | `/api/patients` | List all patients |
| GET  | `/api/patients/:id` | Get patient |
| PUT  | `/api/patients/:id` | Update patient |
| DELETE | `/api/patients/:id` | Delete patient |
| GET  | `/api/dashboard/stats` | Aggregated analytics |
| GET  | `/api/health` | Health check |
