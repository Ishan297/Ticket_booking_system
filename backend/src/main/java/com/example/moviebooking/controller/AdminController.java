package com.example.moviebooking.controller;

import com.example.moviebooking.entity.Movie;
import com.example.moviebooking.entity.Screen;
import com.example.moviebooking.entity.Showtime;
import com.example.moviebooking.entity.Theater;
import com.example.moviebooking.service.AdminService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {
    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/movies")
    public ResponseEntity<Movie> addMovie(@RequestBody Movie movie) {
        Movie saved = adminService.addMovie(movie);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/theaters")
    public ResponseEntity<Theater> addTheater(@RequestBody Theater theater) {
        Theater saved = adminService.addTheater(theater);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/screens")
    public ResponseEntity<Screen> addScreen(@RequestBody AddScreenRequest req) {
        Screen saved = adminService.addScreen(req.getTheaterId(), req.getName(), req.getCapacity());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/showtimes")
    public ResponseEntity<Showtime> addShowtime(@RequestBody AddShowtimeRequest req) {
        Showtime saved = adminService.addShowtime(
                req.getMovieId(), req.getScreenId(),
                req.getStartTime(), req.getEndTime(),
                req.getPricePerSeat());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    public static class AddScreenRequest {
        private Long theaterId;
        private String name;
        private int capacity = 50;
        public Long getTheaterId() { return theaterId; }
        public void setTheaterId(Long theaterId) { this.theaterId = theaterId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public int getCapacity() { return capacity; }
        public void setCapacity(int capacity) { this.capacity = capacity; }
    }

    public static class AddShowtimeRequest {
        private Long movieId;
        private Long screenId;
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime startTime;
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime endTime;
        private BigDecimal pricePerSeat;
        public Long getMovieId() { return movieId; }
        public void setMovieId(Long movieId) { this.movieId = movieId; }
        public Long getScreenId() { return screenId; }
        public void setScreenId(Long screenId) { this.screenId = screenId; }
        public LocalDateTime getStartTime() { return startTime; }
        public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
        public LocalDateTime getEndTime() { return endTime; }
        public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
        public BigDecimal getPricePerSeat() { return pricePerSeat; }
        public void setPricePerSeat(BigDecimal pricePerSeat) { this.pricePerSeat = pricePerSeat; }
    }
}
