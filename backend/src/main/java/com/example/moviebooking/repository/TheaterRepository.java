package com.example.moviebooking.repository;

import com.example.moviebooking.entity.Theater;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TheaterRepository extends JpaRepository<Theater, Long> {
    List<Theater> findByStatus(String status);
    List<Theater> findByCityAndStatus(String city, String status);
}
