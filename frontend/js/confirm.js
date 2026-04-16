(function () {
  const params = new URLSearchParams(window.location.search);
  const bookingId = params.get('bookingId');
  renderNavAuth('nav-auth');
  requireAuth();
  const summary = document.getElementById('booking-summary');
  const payBtn = document.getElementById('pay-btn');
  const message = document.getElementById('message');

  if (!bookingId) {
    message.textContent = 'No booking specified.';
    return;
  }

  async function loadBooking() {
    try {
      const res = await fetch(API_BASE + '/bookings/' + bookingId);
      if (!res.ok) throw new Error('Booking not found');
      const b = await res.json();
      const movie = b.showtime && b.showtime.movie ? b.showtime.movie.title : '';
      const theater = b.showtime && b.showtime.screen && b.showtime.screen.theater ? b.showtime.screen.theater.name : '';
      const start = b.showtime && b.showtime.startTime ? new Date(b.showtime.startTime).toLocaleString() : '';
      const seats = (b.bookingSeats || []).map(function (bs) {
        const s = bs.seat;
        return s ? s.rowNo + s.seatNo : '';
      }).join(', ');
      summary.innerHTML = '<div class="booking-card">' +
        '<h3>' + movie + '</h3>' +
        '<p class="meta">' + theater + ' | ' + start + '</p>' +
        '<p>Seats: ' + seats + '</p>' +
        '<p class="amount">Total: ₹' + (b.totalAmount || 0) + '</p>' +
        '</div>';
    } catch (e) {
      message.textContent = e.message;
    }
  }

  payBtn.addEventListener('click', async function () {
    payBtn.disabled = true;
    message.textContent = '';
    try {
      const res = await fetch(API_BASE + '/bookings/' + bookingId + '/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'MOCK_CARD' })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Payment failed');
      }
      window.location.href = 'success.html?bookingId=' + bookingId;
    } catch (e) {
      message.textContent = e.message;
      payBtn.disabled = false;
    }
  });

  loadBooking();
})();
