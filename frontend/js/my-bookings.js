(function () {
  renderNavAuth('nav-auth');
  const user = requireAuth();
  if (!user) return;
  const list = document.getElementById('bookings-list');
  const message = document.getElementById('message');

  async function loadBookings() {
    try {
      const res = await fetch(API_BASE + '/bookings/user/' + user.id);
      if (!res.ok) throw new Error('Failed to load bookings');
      const bookings = await res.json();
      if (bookings.length === 0) {
        list.innerHTML = '<p>No bookings yet.</p>';
        return;
      }
      list.innerHTML = bookings.map(function (b) {
        const movie = b.showtime && b.showtime.movie ? b.showtime.movie.title : '';
        const theater = b.showtime && b.showtime.screen && b.showtime.screen.theater ? b.showtime.screen.theater.name : '';
        const start = b.showtime && b.showtime.startTime ? new Date(b.showtime.startTime).toLocaleString() : '';
        const seats = (b.bookingSeats || []).map(function (bs) {
          const s = bs.seat;
          return s ? s.rowNo + s.seatNo : '';
        }).join(', ');
        const canCancel = b.status !== 'CANCELLED';
        return '<div class="booking-card" data-id="' + b.id + '">' +
          '<h3>' + movie + '</h3>' +
          '<p class="meta">' + theater + ' | ' + start + '</p>' +
          '<p>Seats: ' + seats + '</p>' +
          '<p class="amount">₹' + (b.totalAmount || 0) + ' | ' + b.status + '</p>' +
          (canCancel ? '<button type="button" class="btn btn-secondary cancel-btn">Cancel</button>' : '') +
          '</div>';
      }).join('');
      list.querySelectorAll('.cancel-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const card = btn.closest('.booking-card');
          const id = card.dataset.id;
          cancelBooking(id, card);
        });
      });
    } catch (e) {
      message.textContent = e.message;
    }
  }

  async function cancelBooking(id, cardEl) {
    try {
      const res = await fetch(API_BASE + '/bookings/' + id, { method: 'DELETE' });
      if (!res.ok) throw new Error('Cancel failed');
      cardEl.querySelector('.meta').nextElementSibling.insertAdjacentHTML('afterend', '<p class="meta">Status: CANCELLED</p>');
      cardEl.querySelector('.cancel-btn').remove();
    } catch (e) {
      message.textContent = e.message;
    }
  }

  loadBookings();
})();
