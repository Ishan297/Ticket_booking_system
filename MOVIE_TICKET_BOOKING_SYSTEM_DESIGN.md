# Movie Ticket Booking System — Complete System Design Documentation

**Tech Stack:** HTML, CSS, JavaScript (Frontend) | Java Spring Boot (Backend) | MySQL (Database)

This document is written for beginner developers. Each section builds on the previous one.

---

## Table of Contents

1. [High Level Design](#1-high-level-design)
2. [Architecture Explanation](#2-architecture-explanation)
3. [Low Level Design](#3-low-level-design)
4. [Database Schema](#4-database-schema)
5. [API Design](#5-api-design)
6. [Backend Class Structure](#6-backend-class-structure)
7. [Frontend Page Structure](#7-frontend-page-structure)
8. [Project Folder Structure](#8-project-folder-structure)
9. [Sample Code Snippets](#9-sample-code-snippets)
10. [Future Scalability Improvements](#10-future-scalability-improvements)

---

## 1. High Level Design

### 1.1 What the System Does

- **Users** browse movies, showtimes, and theaters.
- **Users** select seats and book tickets.
- **Admins** (optional) manage movies, theaters, and showtimes.
- The system stores users, movies, theaters, screens, showtimes, bookings, and payments.

### 1.2 High-Level Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MOVIE TICKET BOOKING SYSTEM                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐     HTTP/JSON      ┌──────────────────┐                 │
│   │   FRONTEND   │ ◄─────────────────► │     BACKEND       │                 │
│   │  (Browser)   │   REST APIs        │  (Spring Boot)    │                 │
│   │ HTML/CSS/JS  │                    │  Controllers      │                 │
│   └──────────────┘                    │  Services         │                 │
│          │                             │  Repositories     │                 │
│          │                             └────────┬─────────┘                 │
│          │                                      │                            │
│          │                                      │ JDBC / JPA                  │
│          │                                      ▼                            │
│          │                             ┌──────────────────┐                 │
│          │                             │     DATABASE     │                 │
│          │                             │     (MySQL)      │                 │
│          │                             └──────────────────┘                 │
│          │                                                                   │
└──────────┼───────────────────────────────────────────────────────────────────┘
           │
    User interacts via browser
```

### 1.3 Main User Flows

| Flow | Steps |
|------|--------|
| **Browse Movies** | Open app → See list of movies → Click movie → See details & showtimes |
| **Book Ticket** | Select movie → Select theater & showtime → Select seats → Confirm → Pay → Get ticket |
| **View My Bookings** | Login → My Bookings → See list with cancel option |

---

## 2. Architecture Explanation

### 2.1 Three-Tier Architecture

We use a **three-tier** (or layered) architecture:

| Tier | Technology | Responsibility |
|------|------------|----------------|
| **Presentation** | HTML, CSS, JavaScript | What the user sees and clicks; sends requests to backend |
| **Business Logic** | Spring Boot (Controllers, Services) | Validates input, applies rules, coordinates data |
| **Data** | MySQL + Spring Data JPA | Stores and retrieves data persistently |

### 2.2 Request Flow (Example: Book a Ticket)

1. **Frontend:** User clicks "Book" → JavaScript sends `POST /api/bookings` with movie, showtime, seat IDs.
2. **Backend Controller:** Receives request, validates format, calls Service.
3. **Backend Service:** Checks seat availability, creates booking, updates seats, (optionally) triggers payment.
4. **Backend Repository:** Saves booking and seat status in MySQL.
5. **Response:** Backend returns booking ID and ticket details; frontend shows confirmation.

### 2.3 Why This Stack?

- **HTML/CSS/JS:** Simple to start, runs in any browser, no build step required for beginners.
- **Spring Boot:** Handles HTTP, JSON, database connection, and security with minimal configuration.
- **MySQL:** Relational data (movies, theaters, showtimes, seats, bookings) fits naturally in tables.

---

## 3. Low Level Design

### 3.1 Core Entities and Relationships

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│  Movie   │       │ Theater  │       │  Screen  │
└────┬─────┘       └────┬─────┘       └────┬─────┘
     │                  │                  │
     │                  │                  │
     │            ┌─────┴─────┐            │
     └───────────► Showtime  ◄────────────┘
                  └─────┬─────┘
                        │
                  ┌─────┴─────┐
                  │   Seat    │ (many seats per showtime)
                  └─────┬─────┘
                        │
                  ┌─────┴─────┐
                  │  Booking  │ (user books one or more seats for one showtime)
                  └─────┬─────┘
                        │
                  ┌─────┴─────┐
                  │   User    │
                  └───────────┘
```

### 3.2 Key Business Rules

- One **Showtime** = one Movie + one Screen (in a Theater) + one date/time.
- **Seats** belong to a Screen; for each Showtime we track which seats are **available** or **booked**.
- A **Booking** ties a User to a Showtime and a set of Seats; seats are marked booked when booking is confirmed.
- **Payment** can be a separate entity (e.g. payment status, amount) linked to Booking; for MVP you can keep it simple (e.g. a status field on Booking).

### 3.3 Component Interaction (Low Level)

```
Frontend (Page)          Controller              Service                Repository
     |                        |                      |                        |
     |  GET /api/movies       |                      |                        |
     |───────────────────────►|  findAll()           |                        |
     |                        |─────────────────────►|  movieRepo.findAll()   |
     |                        |                      |───────────────────────►|
     |                        |                      |◄───────────────────────|
     |                        |◄─────────────────────|                        |
     |  JSON list of movies   |                      |                        |
     |◄───────────────────────|                      |                        |
```

---

## 4. Database Schema

### 4.1 ER Diagram (Tables and Relationships)

```
user          movie          theater         screen          showtime        seat            booking         booking_seat
─────         ─────          ───────        ──────          ────────        ────            ───────         ─────────────
id (PK)       id (PK)        id (PK)         id (PK)         id (PK)         id (PK)         id (PK)         id (PK)
name          title          name            name            movie_id (FK)   screen_id (FK)  user_id (FK)    booking_id(FK)
email         duration       city            theater_id(FK)  screen_id (FK)  row_no          showtime_id(FK) seat_id (FK)
password      genre          address         capacity        start_time      seat_no         status          (unique per booking)
created_at    language       created_at      created_at      end_time        created_at      total_amount    created_at
              release_date   updated_at      updated_at      created_at      updated_at      created_at
              created_at     status          status          status          status          updated_at
              updated_at
              status
```

### 4.2 SQL Table Definitions

```sql
-- Users who book tickets
CREATE TABLE user (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Movies
CREATE TABLE movie (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    duration_min    INT NOT NULL,
    genre           VARCHAR(100),
    language        VARCHAR(50),
    release_date    DATE,
    poster_url      VARCHAR(500),
    status          VARCHAR(20) DEFAULT 'ACTIVE',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Theaters (cinema halls)
CREATE TABLE theater (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    city            VARCHAR(100) NOT NULL,
    address         VARCHAR(500),
    status          VARCHAR(20) DEFAULT 'ACTIVE',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Screens inside a theater
CREATE TABLE screen (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    theater_id      BIGINT NOT NULL,
    name            VARCHAR(100) NOT NULL,
    capacity        INT NOT NULL,
    status          VARCHAR(20) DEFAULT 'ACTIVE',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (theater_id) REFERENCES theater(id)
);

-- Showtime: when a movie runs on a screen
CREATE TABLE showtime (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    movie_id        BIGINT NOT NULL,
    screen_id       BIGINT NOT NULL,
    start_time      DATETIME NOT NULL,
    end_time        DATETIME NOT NULL,
    price_per_seat  DECIMAL(10,2) NOT NULL,
    status          VARCHAR(20) DEFAULT 'ACTIVE',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movie(id),
    FOREIGN KEY (screen_id) REFERENCES screen(id),
    UNIQUE KEY uk_showtime_screen (screen_id, start_time)
);

-- Seats in a screen (same seats reused for every showtime)
CREATE TABLE seat (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    screen_id       BIGINT NOT NULL,
    row_no          VARCHAR(10) NOT NULL,
    seat_no         INT NOT NULL,
    seat_type       VARCHAR(20) DEFAULT 'NORMAL',
    status          VARCHAR(20) DEFAULT 'ACTIVE',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (screen_id) REFERENCES screen(id),
    UNIQUE KEY uk_seat_screen (screen_id, row_no, seat_no)
);

-- Booking (one per user per transaction for one showtime)
CREATE TABLE booking (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    showtime_id     BIGINT NOT NULL,
    status          VARCHAR(20) DEFAULT 'CONFIRMED',
    total_amount    DECIMAL(10,2) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (showtime_id) REFERENCES showtime(id)
);

-- Which seats are part of which booking (many-to-many: booking <-> seats)
CREATE TABLE booking_seat (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id      BIGINT NOT NULL,
    seat_id         BIGINT NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES booking(id),
    FOREIGN KEY (seat_id) REFERENCES seat(id),
    UNIQUE KEY uk_booking_seat (booking_id, seat_id)
);

-- Optional: Payment record (can be added later)
-- CREATE TABLE payment (
--     id BIGINT AUTO_INCREMENT PRIMARY KEY,
--     booking_id BIGINT NOT NULL,
--     amount DECIMAL(10,2),
--     method VARCHAR(50),
--     status VARCHAR(20),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (booking_id) REFERENCES booking(id)
-- );
```

### 4.3 How “Seat Availability” Works

- **Seats** are fixed per **Screen**.
- For a given **Showtime**, a seat is **available** if there is **no** `booking_seat` row linking that `seat_id` to any **confirmed** `booking` for that `showtime_id`.
- Query: “Available seats for showtime X” = seats of that showtime’s screen **minus** seats already in booking_seat for showtime X.

---

## 5. API Design

REST-style APIs. Base URL: `http://localhost:8080/api` (or your server).

### 5.1 Convention

- **GET** = read, **POST** = create, **PUT** = full update, **PATCH** = partial update, **DELETE** = delete.
- Success: HTTP 200/201 with JSON body; Error: 4xx/5xx with optional `{ "message": "..." }`.

### 5.2 API List

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/movies` | List all active movies | - | `[{ id, title, duration_min, genre, ... }]` |
| GET | `/movies/{id}` | Movie details | - | `{ id, title, description, ... }` |
| GET | `/theaters` | List theaters (optional: `?city=`) | - | `[{ id, name, city, address }]` |
| GET | `/theaters/{id}/screens` | Screens in a theater | - | `[{ id, name, capacity }]` |
| GET | `/showtimes` | Showtimes (optional: `?movieId=&theaterId=&date=`) | - | `[{ id, movieId, screenId, startTime, endTime, pricePerSeat }]` |
| GET | `/showtimes/{id}` | Showtime details (movie, screen, theater) | - | `{ id, movie, screen, theater, startTime, pricePerSeat }` |
| GET | `/showtimes/{id}/seats` | Seat layout + availability for showtime | - | `{ showtimeId, seats: [{ id, rowNo, seatNo, available }] }` |
| POST | `/users/register` | Register user | `{ name, email, password }` | `{ id, name, email }` |
| POST | `/users/login` | Login (simplified: return user) | `{ email, password }` | `{ id, name, email }` |
| POST | `/bookings` | Create booking | `{ userId, showtimeId, seatIds[] }` | `{ id, bookingRef, totalAmount, seats }` |
| GET | `/bookings/user/{userId}` | User’s bookings | - | `[{ id, showtime, movie, seats, totalAmount }]` |
| DELETE | `/bookings/{id}` | Cancel booking | - | 204 or 200 |

### 5.3 Sample Request/Response

**POST /api/bookings**

Request:
```json
{
  "userId": 1,
  "showtimeId": 5,
  "seatIds": [10, 11, 12]
}
```

Response (201):
```json
{
  "id": 101,
  "bookingRef": "BK-101",
  "userId": 1,
  "showtimeId": 5,
  "totalAmount": 750.00,
  "status": "CONFIRMED",
  "seats": [
    { "id": 10, "rowNo": "A", "seatNo": 1 },
    { "id": 11, "rowNo": "A", "seatNo": 2 },
    { "id": 12, "rowNo": "A", "seatNo": 3 }
  ]
}
```

---

## 6. Backend Class Structure

Spring Boot uses **layered** packages: web → service → repository → entity.

### 6.1 Package Layout

```
src/main/java/com/example/moviebooking/
├── MovieBookingApplication.java          # Main class with @SpringBootApplication
├── config/                               # CORS, security (if needed)
│   └── WebConfig.java
├── controller/                           # REST API entry points
│   ├── MovieController.java
│   ├── TheaterController.java
│   ├── ShowtimeController.java
│   ├── BookingController.java
│   └── UserController.java
├── service/                              # Business logic
│   ├── MovieService.java
│   ├── TheaterService.java
│   ├── ShowtimeService.java
│   ├── BookingService.java
│   └── UserService.java
├── repository/                            # Database access (JPA)
│   ├── MovieRepository.java
│   ├── TheaterRepository.java
│   ├── ScreenRepository.java
│   ├── ShowtimeRepository.java
│   ├── SeatRepository.java
│   ├── BookingRepository.java
│   ├── BookingSeatRepository.java
│   └── UserRepository.java
├── entity/                                # JPA entities (map to tables)
│   ├── User.java
│   ├── Movie.java
│   ├── Theater.java
│   ├── Screen.java
│   ├── Showtime.java
│   ├── Seat.java
│   ├── Booking.java
│   └── BookingSeat.java
├── dto/                                   # Request/Response DTOs (optional but recommended)
│   ├── BookingRequest.java
│   ├── BookingResponse.java
│   └── LoginRequest.java
└── exception/                             # Global exception handling
    ├── GlobalExceptionHandler.java
    └── ResourceNotFoundException.java
```

### 6.2 Responsibility of Each Layer

| Layer | Responsibility |
|-------|----------------|
| **Controller** | Map URL and HTTP method to service calls; convert DTOs to/from JSON; return HTTP status. |
| **Service** | Business rules (e.g. “are seats available?”, “compute total”); transaction boundaries (`@Transactional`). |
| **Repository** | CRUD and custom queries (e.g. “find showtimes by movie and date”). |
| **Entity** | One class per table; JPA annotations (`@Entity`, `@Table`, `@Id`, `@ManyToOne`, etc.). |

---

## 7. Frontend Page Structure

### 7.1 Pages and Purpose

| Page | File(s) | Purpose |
|------|---------|---------|
| Home / Movie list | `index.html`, `css/style.css`, `js/home.js` | List movies; links to movie detail and “Book” |
| Movie detail | `movie-detail.html`, `js/movie-detail.js` | Movie info + list of showtimes (by theater/date) |
| Theaters | Optional `theaters.html` | List theaters; filter by city |
| Showtime & seat selection | `booking.html`, `js/booking.js` | Pick showtime, see seat map, select seats, proceed to confirm |
| Booking confirmation | `confirm.html`, `js/confirm.js` | Show summary; call POST booking API; show success/cancel |
| My Bookings | `my-bookings.html`, `js/my-bookings.js` | List user bookings; cancel |
| Login / Register | `login.html`, `register.html`, `js/auth.js` | Simple form → call login/register API; store user in sessionStorage |

### 7.2 Frontend Flow

```
index.html (Movies)
    → movie-detail.html?movieId=1 (Showtimes)
        → booking.html?showtimeId=5 (Seat map, select seats)
            → confirm.html (Summary, confirm, pay)
                → success page or my-bookings
```

### 7.3 Shared Frontend Pieces

- **Navigation:** Same header/nav in every page (e.g. “Home”, “My Bookings”, “Login/Logout”).
- **API base URL:** One constant in a shared `js/config.js` or at top of each JS file, e.g. `const API_BASE = 'http://localhost:8080/api';`
- **Auth:** After login, save `user` (or token) in `sessionStorage`; send `userId` in booking request; optional: send token in header for future security.

---

## 8. Project Folder Structure

```
movie-ticket-booking/
├── backend/                          # Spring Boot project
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/moviebooking/
│   │   │   │   ├── MovieBookingApplication.java
│   │   │   │   ├── config/
│   │   │   │   ├── controller/
│   │   │   │   ├── service/
│   │   │   │   ├── repository/
│   │   │   │   ├── entity/
│   │   │   │   ├── dto/
│   │   │   │   └── exception/
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── data.sql or schema.sql (optional)
│   │   └── test/
│   ├── pom.xml
│   └── README.md
│
├── frontend/                         # Static HTML/CSS/JS
│   ├── index.html
│   ├── movie-detail.html
│   ├── booking.html
│   ├── confirm.html
│   ├── my-bookings.html
│   ├── login.html
│   ├── register.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── config.js
│   │   ├── home.js
│   │   ├── movie-detail.js
│   │   ├── booking.js
│   │   ├── confirm.js
│   │   ├── my-bookings.js
│   │   └── auth.js
│   └── assets/                      # Images, icons (optional)
│
└── docs/
    └── MOVIE_TICKET_BOOKING_SYSTEM_DESIGN.md   # This document
```

---

## 9. Sample Code Snippets

### 9.1 Backend (Spring Boot)

#### application.properties

```properties
# Server
server.port=8080

# MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/movie_booking?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

#### Entity: Movie.java

```java
package com.example.moviebooking.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "movie")
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    @Column(length = 2000)
    private String description;
    private Integer durationMin;
    private String genre;
    private String language;
    private java.time.LocalDate releaseDate;
    private String posterUrl;
    private String status = "ACTIVE";
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = updatedAt = LocalDateTime.now();
    }
    @PreUpdate
    public void preUpdate() { updatedAt = LocalDateTime.now(); }

    // Getters and setters for all fields
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getDurationMin() { return durationMin; }
    public void setDurationMin(Integer durationMin) { this.durationMin = durationMin; }
    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public java.time.LocalDate getReleaseDate() { return releaseDate; }
    public void setReleaseDate(java.time.LocalDate releaseDate) { this.releaseDate = releaseDate; }
    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
```

#### Repository: MovieRepository.java

```java
package com.example.moviebooking.repository;

import com.example.moviebooking.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MovieRepository extends JpaRepository<Movie, Long> {
    List<Movie> findByStatus(String status);
}
```

#### Service: MovieService.java

```java
package com.example.moviebooking.service;

import com.example.moviebooking.entity.Movie;
import com.example.moviebooking.repository.MovieRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MovieService {
    private final MovieRepository movieRepository;

    public MovieService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    public List<Movie> findAllActive() {
        return movieRepository.findByStatus("ACTIVE");
    }

    public Movie findById(Long id) {
        return movieRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Movie not found: " + id));
    }
}
```

#### Controller: MovieController.java

```java
package com.example.moviebooking.controller;

import com.example.moviebooking.entity.Movie;
import com.example.moviebooking.service.MovieService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/movies")
@CrossOrigin(origins = "*")   // Allow frontend (adjust in production)
public class MovieController {
    private final MovieService movieService;

    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    @GetMapping
    public List<Movie> getAllMovies() {
        return movieService.findAllActive();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Movie> getMovie(@PathVariable Long id) {
        Movie movie = movieService.findById(id);
        return ResponseEntity.ok(movie);
    }
}
```

#### BookingService (core logic: create booking)

```java
package com.example.moviebooking.service;

import com.example.moviebooking.entity.*;
import com.example.moviebooking.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class BookingService {
    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;

    public BookingService(BookingRepository bookingRepository,
                          BookingSeatRepository bookingSeatRepository,
                          ShowtimeRepository showtimeRepository,
                          SeatRepository seatRepository) {
        this.bookingRepository = bookingRepository;
        this.bookingSeatRepository = bookingSeatRepository;
        this.showtimeRepository = showtimeRepository;
        this.seatRepository = seatRepository;
    }

    @Transactional
    public Booking createBooking(Long userId, Long showtimeId, List<Long> seatIds) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
            .orElseThrow(() -> new RuntimeException("Showtime not found"));
        // Check seats exist and belong to this showtime's screen, and are not already booked
        List<Seat> seats = seatRepository.findAllById(seatIds);
        if (seats.size() != seatIds.size())
            throw new RuntimeException("Invalid seat selection");
        for (Seat s : seats) {
            if (!s.getScreen().getId().equals(showtime.getScreen().getId()))
                throw new RuntimeException("Seat not in this show");
            if (bookingSeatRepository.existsBySeatIdAndBookingShowtimeId(s.getId(), showtimeId))
                throw new RuntimeException("Seat already booked: " + s.getRowNo() + s.getSeatNo());
        }
        BigDecimal total = showtime.getPricePerSeat().multiply(BigDecimal.valueOf(seatIds.size()));
        Booking booking = new Booking();
        booking.setUserId(userId);
        booking.setShowtime(showtime);
        booking.setTotalAmount(total);
        booking.setStatus("CONFIRMED");
        booking = bookingRepository.save(booking);
        for (Seat s : seats) {
            BookingSeat bs = new BookingSeat();
            bs.setBooking(booking);
            bs.setSeat(s);
            bookingSeatRepository.save(bs);
        }
        return booking;
    }
}
```

*(Note: `Booking`, `BookingSeat`, `Showtime`, `Seat` entities need proper JPA mappings; `existsBySeatIdAndBookingShowtimeId` is a method you define in `BookingSeatRepository`.)*

### 9.2 Frontend (JavaScript)

#### config.js

```javascript
const API_BASE = 'http://localhost:8080/api';

function getStoredUser() {
  const user = sessionStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}
```

#### home.js — Fetch and display movies

```javascript
document.addEventListener('DOMContentLoaded', async () => {
  const listEl = document.getElementById('movie-list');
  try {
    const res = await fetch(`${API_BASE}/movies`);
    const movies = await res.json();
    listEl.innerHTML = movies.map(m =>
      `<div class="movie-card" onclick="location.href='movie-detail.html?movieId=${m.id}'">
        <h3>${m.title}</h3>
        <p>${m.genre} | ${m.durationMin} min</p>
      </div>`
    ).join('');
  } catch (e) {
    listEl.innerHTML = '<p>Failed to load movies.</p>';
  }
});
```

#### booking.js — Fetch seats and create booking

```javascript
const showtimeId = new URLSearchParams(location.search).get('showtimeId');
const seatsContainer = document.getElementById('seats');

async function loadSeats() {
  const res = await fetch(`${API_BASE}/showtimes/${showtimeId}/seats`);
  const data = await res.json();
  data.seats.forEach(seat => {
    const btn = document.createElement('button');
    btn.textContent = `${seat.rowNo}${seat.seatNo}`;
    btn.disabled = !seat.available;
    btn.dataset.seatId = seat.id;
    if (seat.available) btn.addEventListener('click', () => toggleSeat(btn));
    seatsContainer.appendChild(btn);
  });
}

let selectedSeatIds = [];
function toggleSeat(btn) {
  const id = Number(btn.dataset.seatId);
  if (selectedSeatIds.includes(id)) {
    selectedSeatIds = selectedSeatIds.filter(x => x !== id);
    btn.classList.remove('selected');
  } else {
    selectedSeatIds.push(id);
    btn.classList.add('selected');
  }
}

document.getElementById('confirm-btn').addEventListener('click', async () => {
  const user = getStoredUser();
  if (!user || selectedSeatIds.length === 0) {
    alert('Please login and select at least one seat.');
    return;
  }
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.id,
      showtimeId: Number(showtimeId),
      seatIds: selectedSeatIds
    })
  });
  const booking = await res.json();
  location.href = `confirm.html?bookingId=${booking.id}`;
});

loadSeats();
```

---

## 10. Future Scalability Improvements

| Area | Improvement | Why |
|------|-------------|-----|
| **Auth & Security** | JWT or session-based login; password hashing (BCrypt); HTTPS | Secure users and APIs |
| **Concurrency** | Pessimistic lock or optimistic locking on seat rows; short-lived “hold” for seats | Avoid double-booking when many users book same show |
| **Caching** | Cache movie list, theater list, showtimes (e.g. Redis or Caffeine) | Reduce DB load for read-heavy traffic |
| **API** | Versioning (`/api/v1/...`); pagination for list APIs; consistent error body | Easier to evolve API without breaking clients |
| **Frontend** | Build step (e.g. Vite/Webpack), split JS, lazy load pages | Faster load and better maintainability |
| **Database** | Indexes on `showtime(movie_id, start_time)`, `booking_seat(seat_id, booking_id)`, `booking(showtime_id, user_id)` | Faster queries for listing and availability |
| **Deployment** | Backend and frontend on same server (e.g. serve static from Spring) or CDN for static; env-based config | Simple production setup |
| **Monitoring** | Logging (e.g. SLF4J + file), health endpoint (`/actuator/health`) | Debug and observe in production |
| **Payments** | Integrate payment gateway (Stripe/Razorpay); store payment status | Real payments and refunds |
| **Notifications** | Email/SMS on booking confirmation and reminder | Better UX |

---

## Quick Implementation Checklist for Beginners

1. **Database:** Create MySQL database `movie_booking`, run the CREATE TABLE scripts from Section 4.
2. **Backend:** Create Spring Boot project (e.g. start.spring.io: Web, JPA, MySQL). Add entities, repositories, services, controllers as in Section 6 and 9. Set `application.properties` and run.
3. **APIs:** Test with Postman or browser: GET `/api/movies`, then implement and test remaining APIs.
4. **Frontend:** Create HTML pages and JS files as in Section 7 and 8. Use `API_BASE` and fetch; start with movie list, then movie detail, then booking flow.
5. **CORS:** Keep `@CrossOrigin` on controllers (or configure once in `WebConfig`) so frontend can call backend from another port/origin.
6. **Data:** Insert a few movies, theaters, screens, showtimes, and seats via SQL or a simple admin API so you can test booking.

---

*End of System Design Document. Use this as a single reference to implement the Movie Ticket Booking System step by step.*
