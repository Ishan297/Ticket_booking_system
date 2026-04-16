package com.example.moviebooking.repository;

import com.example.moviebooking.entity.BookingSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingSeatRepository extends JpaRepository<BookingSeat, Long> {

    @Query("SELECT COUNT(bs) > 0 FROM BookingSeat bs WHERE bs.seat.id = :seatId AND bs.booking.showtime.id = :showtimeId AND bs.booking.status IN ('CONFIRMED', 'PENDING')")
    boolean existsBySeatIdAndShowtimeIdAndBookingNotCancelled(@Param("seatId") Long seatId, @Param("showtimeId") Long showtimeId);
}
