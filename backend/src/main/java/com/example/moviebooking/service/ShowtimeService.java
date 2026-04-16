package com.example.moviebooking.service;

import com.example.moviebooking.entity.Seat;
import com.example.moviebooking.entity.Showtime;
import com.example.moviebooking.repository.BookingSeatRepository;
import com.example.moviebooking.repository.SeatRepository;
import com.example.moviebooking.repository.ShowtimeRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ShowtimeService {
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final BookingSeatRepository bookingSeatRepository;

    public ShowtimeService(ShowtimeRepository showtimeRepository, SeatRepository seatRepository,
                          BookingSeatRepository bookingSeatRepository) {
        this.showtimeRepository = showtimeRepository;
        this.seatRepository = seatRepository;
        this.bookingSeatRepository = bookingSeatRepository;
    }

    public List<Showtime> findShowtimes(Long movieId, Long theaterId, LocalDate date) {
        LocalDateTime start = date != null ? date.atStartOfDay() : LocalDateTime.now();
        if (movieId != null) {
            return showtimeRepository.findByMovieIdAndFromTime(movieId, start);
        }
        if (theaterId != null) {
            return showtimeRepository.findByScreenTheaterIdAndStatus(theaterId, "ACTIVE");
        }
        return showtimeRepository.findByStatus("ACTIVE");
    }

    public Showtime findById(Long id) {
        return showtimeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Showtime not found: " + id));
    }

    public List<Map<String, Object>> getSeatsWithAvailability(Long showtimeId) {
        Showtime showtime = findById(showtimeId);
        Long screenId = showtime.getScreen().getId();
        List<Seat> seats = seatRepository.findByScreenIdAndStatus(screenId, "ACTIVE");
        List<Map<String, Object>> result = new ArrayList<>();
        for (Seat s : seats) {
            boolean available = !bookingSeatRepository.existsBySeatIdAndShowtimeIdAndBookingNotCancelled(s.getId(), showtimeId);
            result.add(Map.of(
                    "id", s.getId(),
                    "rowNo", s.getRowNo(),
                    "seatNo", s.getSeatNo(),
                    "available", available
            ));
        }
        return result;
    }
}
