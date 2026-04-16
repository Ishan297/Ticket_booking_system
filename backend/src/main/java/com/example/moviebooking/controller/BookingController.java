package com.example.moviebooking.controller;

import com.example.moviebooking.dto.BookingRequest;
import com.example.moviebooking.entity.Booking;
import com.example.moviebooking.entity.Payment;
import com.example.moviebooking.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {
    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(@Valid @RequestBody BookingRequest req) {
        Booking booking = bookingService.createBooking(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    @GetMapping("/user/{userId}")
    public List<Booking> getUserBookings(@PathVariable Long userId) {
        return bookingService.findByUserId(userId);
    }

    @GetMapping("/{id}")
    public Booking getBooking(@PathVariable Long id) {
        return bookingService.findById(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        bookingService.cancelBooking(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/payment")
    public ResponseEntity<Map<String, Object>> mockPayment(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        Payment payment = bookingService.processMockPayment(id);
        Booking booking = bookingService.findById(id);
        return ResponseEntity.ok(Map.of("payment", payment, "booking", booking));
    }
}
