package com.example.moviebooking.service;

import com.example.moviebooking.entity.*;
import com.example.moviebooking.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminService {
    private final MovieRepository movieRepository;
    private final TheaterRepository theaterRepository;
    private final ScreenRepository screenRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;

    public AdminService(MovieRepository movieRepository, TheaterRepository theaterRepository,
                        ScreenRepository screenRepository, ShowtimeRepository showtimeRepository,
                        SeatRepository seatRepository) {
        this.movieRepository = movieRepository;
        this.theaterRepository = theaterRepository;
        this.screenRepository = screenRepository;
        this.showtimeRepository = showtimeRepository;
        this.seatRepository = seatRepository;
    }

    public Movie addMovie(Movie movie) {
        return movieRepository.save(movie);
    }

    public Theater addTheater(Theater theater) {
        return theaterRepository.save(theater);
    }

    @Transactional
    public Screen addScreen(Long theaterId, String name, int capacity) {
        Theater theater = theaterRepository.findById(theaterId)
                .orElseThrow(() -> new RuntimeException("Theater not found"));
        Screen screen = new Screen();
        screen.setTheater(theater);
        screen.setName(name);
        screen.setCapacity(capacity);
        screen = screenRepository.save(screen);
        // Create seats: rows A–E, 10 seats each (customize as needed)
        String[] rows = {"A", "B", "C", "D", "E"};
        int seatsPerRow = Math.max(10, (capacity + rows.length - 1) / rows.length);
        for (String row : rows) {
            for (int sn = 1; sn <= seatsPerRow; sn++) {
                Seat seat = new Seat();
                seat.setScreen(screen);
                seat.setRowNo(row);
                seat.setSeatNo(sn);
                seatRepository.save(seat);
            }
        }
        return screen;
    }

    public Showtime addShowtime(Long movieId, Long screenId, LocalDateTime startTime, LocalDateTime endTime, BigDecimal pricePerSeat) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Movie not found"));
        Screen screen = screenRepository.findById(screenId)
                .orElseThrow(() -> new RuntimeException("Screen not found"));
        Showtime showtime = new Showtime();
        showtime.setMovie(movie);
        showtime.setScreen(screen);
        showtime.setStartTime(startTime);
        showtime.setEndTime(endTime);
        showtime.setPricePerSeat(pricePerSeat);
        return showtimeRepository.save(showtime);
    }
}
