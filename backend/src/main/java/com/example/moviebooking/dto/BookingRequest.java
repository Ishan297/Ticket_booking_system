package com.example.moviebooking.dto;

import javax.validation.constraints.NotNull;
import java.util.List;

public class BookingRequest {
    @NotNull
    private Long userId;
    @NotNull
    private Long showtimeId;
    @NotNull
    private List<Long> seatIds;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getShowtimeId() { return showtimeId; }
    public void setShowtimeId(Long showtimeId) { this.showtimeId = showtimeId; }
    public List<Long> getSeatIds() { return seatIds; }
    public void setSeatIds(List<Long> seatIds) { this.seatIds = seatIds; }
}
