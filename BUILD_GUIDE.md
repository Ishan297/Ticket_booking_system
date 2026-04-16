# Movie Ticket Booking System — Step-by-Step Build Guide

**Tech Stack:** HTML, CSS, Vanilla JavaScript | Java Spring Boot (REST APIs) | MySQL

This guide explains the **system architecture** first, then walks you through building the project **step-by-step**.

---

## Part 1: System Architecture

### 1.1 High-Level Overview

The system has three layers that communicate over HTTP:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     MOVIE TICKET BOOKING SYSTEM                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────┐         REST (JSON)        ┌─────────────────┐   │
│   │    FRONTEND      │ ◄─────────────────────────► │    BACKEND       │   │
│   │  HTML / CSS /    │    http://localhost:8080   │  Spring Boot     │   │
│   │  Vanilla JS      │                             │  REST Controllers│   │
│   └────────┬────────┘                             └────────┬────────┘   │
│            │                                                │            │
│            │                                                │ JPA        │
│            │                                                ▼            │
│            │                                     ┌─────────────────┐    │
│            │                                     │     MySQL       │    │
│            │                                     │  (Tables: user,  │    │
│            │                                     │   movie, etc.)  │    │
│            │                                     └─────────────────┘    │
└────────────┼────────────────────────────────────────────────────────────┘
             │
      User opens pages in browser
```

- **Frontend:** Serves static HTML/CSS/JS. Runs in the browser; can be opened from the file system or a simple static server.
- **Backend:** Spring Boot app on port 8080. Exposes REST APIs; frontend calls these with `fetch()`.
- **Database:** MySQL stores users, movies, theaters, screens, showtimes, seats, bookings, and payments.

### 1.2 Three-Tier Architecture

| Tier | What it is | Your stack |
|------|------------|------------|
| **Presentation** | UI and user actions | HTML, CSS, Vanilla JavaScript |
| **Business logic** | Rules, validation, orchestration | Spring Boot (Controllers + Services) |
| **Data** | Persistent storage | MySQL + Spring Data JPA (Repositories) |

**Request flow example (Book a ticket):**

1. User clicks "Confirm Booking" in the browser.
2. JavaScript sends `POST /api/bookings` with `userId`, `showtimeId`, `seatIds[]`.
3. **Controller** receives the request and calls **BookingService**.
4. **BookingService** checks seat availability, creates **Booking** and **BookingSeat** rows, then creates a **Payment** (mock).
5. **Repositories** save to MySQL.
6. Backend returns booking + payment details; frontend shows confirmation.

### 1.3 Core Data Model (Simplified)

```
User ──► Booking ◄── Showtime ◄── Movie
              │           │
              │           └── Screen ◄── Theater
              │
              └── BookingSeat ──► Seat (belongs to Screen)
              └── Payment (mock: amount, status)
```

- **Movie:** title, duration, genre, etc.
- **Theater:** name, city, address. Has many **Screens**.
- **Screen:** belongs to one Theater; has many **Seats**.
- **Showtime:** one Movie + one Screen + start_time + end_time + price_per_seat.
- **Seat:** belongs to a Screen (row_no, seat_no). Same seats for every showtime on that screen.
- **Booking:** one User + one Showtime + total_amount + status. Linked to many **BookingSeat** and one **Payment**.
- **BookingSeat:** links Booking to Seat (so we know which seats are taken for that showtime).
- **Payment:** booking_id, amount, method (e.g. "MOCK_CARD"), status (e.g. "COMPLETED"). Used for mock payment.

### 1.4 Feature Map

| Feature | Frontend | Backend API |
|---------|----------|-------------|
| User registration | `register.html` + `auth.js` | `POST /api/users/register` |
| User login | `login.html` + `auth.js` | `POST /api/users/login` |
| Browse movies | `index.html` + `home.js` | `GET /api/movies` |
| View theatres & show timings | `movie-detail.html`, `booking.html` | `GET /api/theaters`, `GET /api/showtimes?movieId=&theaterId=` |
| Seat selection | `booking.html` + `booking.js` | `GET /api/showtimes/{id}/seats` |
| Ticket booking | `booking.js` → `confirm.js` | `POST /api/bookings` |
| Mock payment | `confirm.html` + `confirm.js` | `POST /api/bookings/{id}/payment` (mock) |
| Booking confirmation | `confirm.html`, `success.html` | `GET /api/bookings/{id}` |
| Booking history | `my-bookings.html` + `my-bookings.js` | `GET /api/bookings/user/{userId}` |
| Admin: add movies | `admin.html` (or admin section) | `POST /api/admin/movies` |
| Admin: add theatres | same | `POST /api/admin/theaters` |
| Admin: add shows | same | `POST /api/admin/showtimes` |

---

## Part 2: Step-by-Step Build Order

Follow these phases in order. Each phase builds on the previous one.

---

### Phase 1: Environment and Project Setup

**Goal:** MySQL installed, database created, Spring Boot app runs, frontend folder ready.

| Step | Task | Details |
|------|------|---------|
| 1.1 | Install MySQL | Install MySQL 8 (or use existing). Note username/password. |
| 1.2 | Create database | `CREATE DATABASE movie_booking;` |
| 1.3 | Backend project | Use the scaffolded `backend/` (Maven + Spring Boot). Open in IDE. |
| 1.4 | Configure DB | In `application.properties` set `spring.datasource.url`, `username`, `password` for `movie_booking`. |
| 1.5 | Run backend | `mvn spring-boot:run` from `backend/`. App should start on port 8080. |
| 1.6 | Frontend | Use the scaffolded `frontend/` folder. Open `index.html` in browser or serve with a simple HTTP server. |

**Check:** Backend starts without errors; you can open `index.html` and see the home page.

---

### Phase 2: Database Schema and JPA Entities

**Goal:** All tables created (via JPA or SQL) and mapped to entities.

| Step | Task | Details |
|------|------|---------|
| 2.1 | Run schema | Either let JPA create tables (`ddl-auto=update`) or run the SQL from `MOVIE_TICKET_BOOKING_SYSTEM_DESIGN.md` (Section 4). Add a `payment` table for mock payment. |
| 2.2 | Entity: User | `entity/User.java` — id, name, email, password, role (USER/ADMIN), phone, timestamps. Table name `user` or `users`. |
| 2.3 | Entity: Movie | `entity/Movie.java` — id, title, description, durationMin, genre, language, releaseDate, posterUrl, status. |
| 2.4 | Entity: Theater, Screen, Seat | Theater → screens; Screen → seats. All with status, timestamps. |
| 2.5 | Entity: Showtime | movie_id, screen_id, start_time, end_time, price_per_seat, status. |
| 2.6 | Entity: Booking, BookingSeat, Payment | Booking → user, showtime, totalAmount, status. BookingSeat → booking, seat. Payment → booking, amount, method, status. |

**Check:** Restart backend; no schema errors. Tables exist in MySQL.

---

### Phase 3: Repositories and User APIs (Registration / Login)

**Goal:** User registration and login work end-to-end.

| Step | Task | Details |
|------|------|---------|
| 3.1 | Repositories | Create JPA repositories for User, Movie, Theater, Screen, Showtime, Seat, Booking, BookingSeat, Payment. |
| 3.2 | UserService | Register: check email unique, hash password (e.g. BCrypt), save user. Login: find by email, verify password, return user (and role). |
| 3.3 | UserController | `POST /api/users/register` (body: name, email, password). `POST /api/users/login` (body: email, password). Return user JSON (no password). |
| 3.4 | DTOs | Use request DTOs for register/login; response DTO with id, name, email, role. |
| 3.5 | Frontend: Register | `register.html` form; `auth.js` POST to register API; on success redirect to login or home. |
| 3.6 | Frontend: Login | `login.html` form; POST to login API; store user in `sessionStorage`; redirect to home. |

**Check:** Register a user, then log in. Stored user appears in sessionStorage.

---

### Phase 4: Movies, Theaters, and Showtimes (Browse + Admin)

**Goal:** Browse movies and showtimes; admin can add movies, theaters, and shows.

| Step | Task | Details |
|------|------|---------|
| 4.1 | MovieService / MovieController | `GET /api/movies` (list active), `GET /api/movies/{id}` (detail). |
| 4.2 | TheaterService / TheaterController | `GET /api/theaters` (optional `?city=`), `GET /api/theaters/{id}/screens`. |
| 4.3 | ShowtimeService / ShowtimeController | `GET /api/showtimes?movieId=&theaterId=&date=`, `GET /api/showtimes/{id}` with movie + screen + theater. |
| 4.4 | Admin APIs | `POST /api/admin/movies`, `POST /api/admin/theaters`, `POST /api/admin/screens`, `POST /api/admin/showtimes`. Optionally check `role == ADMIN` in a filter or in controller. For simplicity, you can skip auth and add it later. |
| 4.5 | Frontend: Home | `index.html` + `home.js`: fetch movies, render list; link each to `movie-detail.html?movieId=`. |
| 4.6 | Frontend: Movie detail | `movie-detail.html` + `movie-detail.js`: fetch movie by id; fetch showtimes by movieId; show theatres and timings; "Book" → `booking.html?showtimeId=`. |
| 4.7 | Frontend: Admin | `admin.html` + `admin.js`: forms to add movie, theater, screen, showtime; call admin APIs. |

**Check:** See movies on home; open movie detail and see showtimes; add a movie/theater/show from admin.

---

### Phase 5: Seats and Booking

**Goal:** For a showtime, show seat map; user selects seats and creates a booking.

| Step | Task | Details |
|------|------|---------|
| 5.1 | Seat availability | In ShowtimeService or BookingService: for showtime X, get all seats of its screen; mark "available" if no BookingSeat exists for that seat and any confirmed booking for showtime X. |
| 5.2 | API: seats for showtime | `GET /api/showtimes/{id}/seats` returns `{ showtimeId, seats: [{ id, rowNo, seatNo, available }] }`. |
| 5.3 | BookingService | `createBooking(userId, showtimeId, seatIds)`: validate showtime and seats; check all seats available; compute total; create Booking, BookingSeat rows; return booking + seats. Use `@Transactional`. |
| 5.4 | BookingController | `POST /api/bookings` body: userId, showtimeId, seatIds (array). Return 201 + booking response. |
| 5.5 | Frontend: Booking page | `booking.html` + `booking.js`: get showtimeId from query; fetch showtime and seats; render seat map (e.g. buttons); user selects seats; "Proceed" → redirect to `confirm.html?bookingId=` (you’ll need to create booking first and then pass bookingId) or pass showtimeId+seatIds and create booking on confirm page. **Simpler flow:** On booking page, "Proceed to Pay" → create booking via POST (status PENDING); redirect to confirm with bookingId. On confirm, mock payment then set booking to CONFIRMED. |
| 5.6 | Optional: create booking after seat selection | Either create booking on "Proceed" (status PENDING) and confirm on payment, or create booking only after mock payment. Document your choice in code comments. |

**Check:** Select a showtime, see seats, select a few, create booking; see booking in DB.

---

### Phase 6: Mock Payment and Booking Confirmation

**Goal:** After booking creation, user sees a mock payment step; on "Pay" we record payment and confirm booking.

| Step | Task | Details |
|------|------|---------|
| 6.1 | Payment entity | Already in DB. Fields: booking_id, amount, method (e.g. "MOCK_CARD"), status ("COMPLETED"). |
| 6.2 | PaymentService | `processMockPayment(bookingId)`: find booking; create Payment(amount=booking.totalAmount, method="MOCK_CARD", status="COMPLETED"); set booking.status = "CONFIRMED". |
| 6.3 | API | `POST /api/bookings/{id}/payment` body: `{ "method": "MOCK_CARD" }` or empty. Returns payment + booking. |
| 6.4 | Frontend: Confirm | `confirm.html` + `confirm.js`: read bookingId; fetch booking details; show summary and "Pay with Mock Card" button; on click call payment API; on success redirect to `success.html?bookingId=`. |
| 6.5 | Success page | `success.html`: show "Booking confirmed" and booking/ticket summary (optional: fetch booking by id). |

**Check:** Complete flow: login → movie → showtime → seats → create booking → confirm → mock pay → success.

---

### Phase 7: Booking History and Cancel

**Goal:** User sees list of their bookings; can cancel (optional: only if status allows).

| Step | Task | Details |
|------|------|---------|
| 7.1 | API | `GET /api/bookings/user/{userId}` returns list of bookings with showtime, movie, seats, amount, status. |
| 7.2 | Cancel | `DELETE /api/bookings/{id}` or `PATCH /api/bookings/{id}/cancel`: set booking.status = CANCELLED; optionally delete or keep Payment. Do not delete BookingSeat (needed for history); for "availability" we only count CONFIRMED bookings. So when cancelling, just mark booking cancelled — seats become available again because availability query ignores cancelled bookings. |
| 7.3 | Frontend: My Bookings | `my-bookings.html` + `my-bookings.js`: get userId from sessionStorage; fetch bookings; render list with cancel button; on cancel call DELETE (or cancel API). |

**Check:** After a few bookings, open My Bookings; see list; cancel one and verify it no longer holds seats.

---

### Phase 8: Polish and CORS

**Goal:** Frontend and backend work together from different origins; basic error handling and nav.

| Step | Task | Details |
|------|------|---------|
| 8.1 | CORS | In backend, allow your frontend origin (e.g. `http://localhost:5500` or `file://`). Use `@CrossOrigin` on controllers or `WebMvcConfigurer` with `addCorsMappings`. |
| 8.2 | Global exception handler | `@ControllerAdvice`: on RuntimeException return 400/404 with message; on exception return 500. |
| 8.3 | Nav and auth checks | Same header/nav on all pages; if a page requires login, check sessionStorage user and redirect to login if missing. |
| 8.4 | Seed data | Add a few movies, theaters, screens, showtimes, and seats (SQL or admin UI) so you can test full flow. |

---

## Part 3: Quick Reference

### Backend package structure

```
backend/src/main/java/com/example/moviebooking/
├── MovieBookingApplication.java
├── config/WebConfig.java
├── controller/
│   ├── UserController.java
│   ├── MovieController.java
│   ├── TheaterController.java
│   ├── ShowtimeController.java
│   ├── BookingController.java
│   └── AdminController.java
├── service/ (same names)
├── repository/ (same names)
├── entity/ (User, Movie, Theater, Screen, Showtime, Seat, Booking, BookingSeat, Payment)
├── dto/ (RegisterRequest, LoginRequest, BookingRequest, etc.)
└── exception/GlobalExceptionHandler.java
```

### Frontend pages

| Page | Purpose |
|------|---------|
| `index.html` | Home – list movies |
| `movie-detail.html` | Movie info + showtimes |
| `booking.html` | Seat selection + proceed to confirm |
| `confirm.html` | Booking summary + mock payment |
| `success.html` | Booking confirmed message |
| `my-bookings.html` | User’s booking history |
| `login.html` / `register.html` | Auth |
| `admin.html` | Admin: add movie, theater, show |

### API base URL (frontend)

In `js/config.js` (or equivalent):

```javascript
const API_BASE = 'http://localhost:8080/api';
```

---

## Part 4: Suggested Order of Implementation (Summary)

1. **Phase 1** – Setup DB, backend, frontend structure.  
2. **Phase 2** – Entities + schema (including Payment).  
3. **Phase 3** – User register/login (backend + frontend).  
4. **Phase 4** – Movies, theaters, showtimes + admin (backend + frontend).  
5. **Phase 5** – Seats API + create booking (backend + booking page).  
6. **Phase 6** – Mock payment API + confirm/success pages.  
7. **Phase 7** – Booking history + cancel.  
8. **Phase 8** – CORS, error handling, nav, seed data.

For full **database schema**, **sample API request/response**, and **code snippets**, see `MOVIE_TICKET_BOOKING_SYSTEM_DESIGN.md`.
