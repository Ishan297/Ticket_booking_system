package com.example.moviebooking.service;

import com.example.moviebooking.entity.Screen;
import com.example.moviebooking.entity.Theater;
import com.example.moviebooking.repository.ScreenRepository;
import com.example.moviebooking.repository.TheaterRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TheaterService {
    private final TheaterRepository theaterRepository;
    private final ScreenRepository screenRepository;

    public TheaterService(TheaterRepository theaterRepository, ScreenRepository screenRepository) {
        this.theaterRepository = theaterRepository;
        this.screenRepository = screenRepository;
    }

    public List<Theater> findAll(String city) {
        if (city != null && !city.isBlank())
            return theaterRepository.findByCityAndStatus(city, "ACTIVE");
        return theaterRepository.findByStatus("ACTIVE");
    }

    public Theater findById(Long id) {
        return theaterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Theater not found: " + id));
    }

    public List<Screen> getScreens(Long theaterId) {
        return screenRepository.findByTheaterIdAndStatus(theaterId, "ACTIVE");
    }
}
