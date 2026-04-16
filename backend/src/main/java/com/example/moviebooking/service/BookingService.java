package com.example.moviebooking.service;

import com.example.moviebooking.dto.BookingRequest;
import com.example.moviebooking.entity.*;
import com.example.moviebooking.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class BookingService {
    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final PaymentRepository paymentRepository;

    public BookingService(BookingRepository bookingRepository, BookingSeatRepository bookingSeatRepository,
                          ShowtimeRepository showtimeRepository, SeatRepository seatRepository,
                          PaymentRepository paymentRepository) {
        this.bookingRepository = bookingRepository;
        this.bookingSeatRepository = bookingSeatRepository;
        this.showtimeRepository = showtimeRepository;
        this.seatRepository = seatRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public Booking createBooking(BookingRequest req) {
        Showtime showtime = showtimeRepository.findById(req.getShowtimeId())
                .orElseThrow(() -> new RuntimeException("Showtime not found"));
        if (req.getSeatIds() == null || req.getSeatIds().isEmpty())
            throw new RuntimeException("Select at least one seat");
        List<Seat> seats = seatRepository.findAllById(req.getSeatIds());
        if (seats.size() != req.getSeatIds().size())
            throw new RuntimeException("Invalid seat selection");
        for (Seat s : seats) {
            if (!s.getScreen().getId().equals(showtime.getScreen().getId()))
                throw new RuntimeException("Seat not in this show");
            if (bookingSeatRepository.existsBySeatIdAndShowtimeIdAndBookingNotCancelled(s.getId(), showtime.getId()))
                throw new RuntimeException("Seat already booked: " + s.getRowNo() + s.getSeatNo());
        }
        BigDecimal total = showtime.getPricePerSeat().multiply(BigDecimal.valueOf(seats.size()));
        Booking booking = new Booking();
        booking.setUserId(req.getUserId());
        booking.setShowtime(showtime);
        booking.setTotalAmount(total);
        booking.setStatus("CONFIRMED");
        booking = bookingRepository.save(booking);
        for (Seat s : seats) {
            BookingSeat bs = new BookingSeat();
            bs.setBooking(booking);
            bs.setSeat(s);
            bookingSeatRepository.save(bs);
        }
        return booking;
    }

    public List<Booking> findByUserId(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Booking findById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + id));
    }

    @Transactional
    public Booking cancelBooking(Long id) {
        Booking booking = findById(id);
        if ("CANCELLED".equals(booking.getStatus()))
            throw new RuntimeException("Booking already cancelled");
        booking.setStatus("CANCELLED");
        return bookingRepository.save(booking);
    }

    @Transactional
    public Payment processMockPayment(Long bookingId) {
        Booking booking = findById(bookingId);
        if (booking.getPayment() != null)
            return booking.getPayment();
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(booking.getTotalAmount());
        payment.setMethod("MOCK_CARD");
        payment.setStatus("COMPLETED");
        payment = paymentRepository.save(payment);
        booking.setPayment(payment);
        booking.setStatus("CONFIRMED");
        bookingRepository.save(booking);
        return payment;
    }
}
