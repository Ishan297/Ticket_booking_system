# Movie Ticket Booking System

Full-stack movie ticket booking: **React (Vite) + Tailwind** frontend + **Java Spring Boot** REST API. **Local runs use embedded H2** (no database install). **MySQL** is optional via a Spring profile.

## Features

- User registration and login
- Browse movies, view theatres and show timings
- Seat selection and ticket booking
- Mock payment and booking confirmation
- Booking history and cancel
- Admin: add movies, theatres, screens, and showtimes

## Quick Start (end-to-end on one machine)

Requirements: **JDK 11+**, **Maven**, **Node.js 18+** (for the React UI).

### 1. Build the React UI, then run backend + UI together

The Spring Boot build copies `web/dist` into the app. Build the UI first:

```bash
cd web
npm install
npm run build
cd ../backend
mvn spring-boot:run
```

Then open **http://localhost:8080/** in your browser. The API is at **http://localhost:8080/api**. The embedded **H2** database file is created under `backend/data/` on first run.

**React dev server (hot reload):** with the backend running on port 8080, in another terminal run `cd web && npm run dev` and open **http://localhost:5173** — Vite proxies `/api` to the backend.

### 2. Seed data (Admin)

1. Open **Admin** page.
2. Add a **Movie** (title, duration, genre, etc.).
3. Add a **Theater** (name, city).
4. Add a **Screen** (use the Theater ID from step 3, name and capacity).
5. Add a **Showtime** (Movie ID, Screen ID, start/end time, price per seat).

Then use **Home** → select movie → **Book** → select seats → **Proceed to Pay** → **Pay with Mock Card**.

### Optional: legacy static HTML

The old `frontend/` folder is kept for reference only; the default build uses **`web/`** (React).

### Optional: MySQL instead of H2

1. Create a database: `CREATE DATABASE movie_booking;`
2. Edit `backend/src/main/resources/application-mysql.properties` (username, password).
3. Run: `mvn spring-boot:run -Dspring-boot.run.profiles=mysql`

## Docs

- **BUILD_GUIDE.md** – System architecture and **step-by-step build instructions** (phases 1–8).
- **MOVIE_TICKET_BOOKING_SYSTEM_DESIGN.md** – Full design: schema, APIs, code snippets, scalability.

## Project Layout

```
JAVA_RORJECT/
├── backend/          # Spring Boot (REST API)
├── web/              # React + Vite + Tailwind (UI)
├── frontend/         # Legacy static HTML (unused by default)
├── BUILD_GUIDE.md    # Architecture + step-by-step guide
├── MOVIE_TICKET_BOOKING_SYSTEM_DESIGN.md
└── README.md
```

## API Base URL

The React app calls **`/api`** (same origin on port 8080, or proxied through Vite on port 5173 during `npm run dev`).
