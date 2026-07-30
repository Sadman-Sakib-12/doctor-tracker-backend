# Doctor Tracker – Backend API

REST API built with **Express.js** and **MongoDB** that powers the Doctor Tracker admin portal.

---

## Setup

```bash
git clone https://github.com/Sadman-Sakib-12/doctor-tracker-backend.git
cd doctor-tracker-backend
npm install
cp .env.example .env   # fill in your values
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default 5000) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `CLIENT_URL` | Frontend URL for CORS |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register admin |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| GET | `/api/doctors` | List doctors (search/filter/paginate) |
| POST | `/api/doctors` | Create doctor |
| GET | `/api/doctors/:id` | Get doctor |
| PUT | `/api/doctors/:id` | Update doctor |
| DELETE | `/api/doctors/:id` | Delete doctor |
| GET | `/api/doctors/:id/patients` | Doctor's patients |
| POST | `/api/doctors/:id/patients` | Add patient to doctor |
| GET | `/api/patients` | List all patients |
| GET | `/api/patients/:id` | Get patient |
| PUT | `/api/patients/:id` | Update patient |
| DELETE | `/api/patients/:id` | Delete patient |
| GET | `/api/dashboard/stats` | Aggregated analytics |
