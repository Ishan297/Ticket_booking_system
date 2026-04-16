(function () {
  renderNavAuth('nav-auth');
  const params = new URLSearchParams(window.location.search);
  const bookingId = params.get('bookingId');
  const ticketSummary = document.getElementById('ticket-summary');
  if (!bookingId) return;
  fetch(API_BASE + '/bookings/' + bookingId)
    .then(function (r) { return r.json(); })
    .then(function (b) {
      const movie = b.showtime && b.showtime.movie ? b.showtime.movie.title : '';
      const theater = b.showtime && b.showtime.screen && b.showtime.screen.theater ? b.showtime.screen.theater.name : '';
      const start = b.showtime && b.showtime.startTime ? new Date(b.showtime.startTime).toLocaleString() : '';
      const seats = (b.bookingSeats || []).map(function (bs) {
        const s = bs.seat;
        return s ? s.rowNo + s.seatNo : '';
      }).join(', ');
      ticketSummary.innerHTML = '<div class="booking-card"><p><strong>' + movie + '</strong></p><p>' + theater + ' | ' + start + '</p><p>Seats: ' + seats + '</p><p>Amount: ₹' + (b.totalAmount || 0) + '</p><p>Booking #' + b.id + '</p></div>';
    })
    .catch(function () {
      ticketSummary.innerHTML = '<p>Booking #' + bookingId + '</p>';
    });
})();
