package com.example.moviebooking.repository;

import com.example.moviebooking.entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {
    List<Showtime> findByStatus(String status);

    @Query("SELECT s FROM Showtime s WHERE s.status = 'ACTIVE' AND s.movie.id = :movieId " +
           "AND s.startTime >= :start ORDER BY s.startTime")
    List<Showtime> findByMovieIdAndFromTime(@Param("movieId") Long movieId, @Param("start") LocalDateTime start);

    List<Showtime> findByScreenTheaterIdAndStatus(Long theaterId, String status);
}
