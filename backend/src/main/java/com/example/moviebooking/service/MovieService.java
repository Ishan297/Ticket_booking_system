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
