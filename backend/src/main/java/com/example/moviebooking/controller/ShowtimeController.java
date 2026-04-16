package com.example.moviebooking.controller;

import com.example.moviebooking.entity.Showtime;
import com.example.moviebooking.service.ShowtimeService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/showtimes")
@CrossOrigin(origins = "*")
public class ShowtimeController {
    private final ShowtimeService showtimeService;

    public ShowtimeController(ShowtimeService showtimeService) {
        this.showtimeService = showtimeService;
    }

    @GetMapping
    public List<Showtime> getShowtimes(
            @RequestParam(required = false) Long movieId,
            @RequestParam(required = false) Long theaterId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return showtimeService.findShowtimes(movieId, theaterId, date);
    }

    @GetMapping("/{id}")
    public Showtime getShowtime(@PathVariable Long id) {
        return showtimeService.findById(id);
    }

    @GetMapping("/{id}/seats")
    public Map<String, Object> getSeats(@PathVariable Long id) {
        List<Map<String, Object>> seats = showtimeService.getSeatsWithAvailability(id);
        return Map.of("showtimeId", id, "seats", seats);
    }
}
