(function () {
  const params = new URLSearchParams(window.location.search);
  const showtimeId = params.get('showtimeId');
  renderNavAuth('nav-auth');
  const user = requireAuth();
  if (!user) return;

  const showtimeInfo = document.getElementById('showtime-info');
  const seatsEl = document.getElementById('seats');
  const selectedCountEl = document.getElementById('selected-count');
  const totalAmountEl = document.getElementById('total-amount');
  const proceedBtn = document.getElementById('proceed-btn');
  const message = document.getElementById('message');

  let showtime = null;
  let selectedSeatIds = [];

  async function loadShowtime() {
    if (!showtimeId) {
      message.textContent = 'No showtime selected.';
      return;
    }
    try {
      const res = await fetch(API_BASE + '/showtimes/' + showtimeId);
      if (!res.ok) throw new Error('Showtime not found');
      showtime = await res.json();
      const movie = showtime.movie ? showtime.movie.title : '';
      const theater = showtime.screen && showtime.screen.theater ? showtime.screen.theater.name : '';
      const start = showtime.startTime ? new Date(showtime.startTime).toLocaleString() : '';
      showtimeInfo.innerHTML = '<p><strong>' + movie + '</strong> at ' + theater + ' - ' + (showtime.screen ? showtime.screen.name : '') + '</p><p>' + start + '</p>';
    } catch (e) {
      message.textContent = e.message;
    }
  }

  async function loadSeats() {
    try {
      const res = await fetch(API_BASE + '/showtimes/' + showtimeId + '/seats');
      if (!res.ok) throw new Error('Failed to load seats');
      const data = await res.json();
      const seats = data.seats || [];
      seatsEl.innerHTML = seats.map(function (s) {
        const cls = s.available ? 'available' : 'booked';
        return '<button type="button" class="seat ' + cls + '" data-id="' + s.id + '" data-available="' + s.available + '">' + s.rowNo + s.seatNo + '</button>';
      }).join('');
      seatsEl.querySelectorAll('.seat.available').forEach(function (btn) {
        btn.addEventListener('click', function () {
          toggleSeat(btn);
        });
      });
    } catch (e) {
      message.textContent = e.message;
    }
  }

  function toggleSeat(btn) {
    const id = parseInt(btn.dataset.id, 10);
    if (selectedSeatIds.indexOf(id) >= 0) {
      selectedSeatIds = selectedSeatIds.filter(function (x) { return x !== id; });
      btn.classList.remove('selected');
    } else {
      selectedSeatIds.push(id);
      btn.classList.add('selected');
    }
    updateSummary();
  }

  function updateSummary() {
    const count = selectedSeatIds.length;
    const price = showtime && showtime.pricePerSeat ? parseFloat(showtime.pricePerSeat) : 0;
    selectedCountEl.textContent = count;
    totalAmountEl.textContent = (count * price).toFixed(2);
    proceedBtn.disabled = count === 0;
  }

  proceedBtn.addEventListener('click', async function () {
    if (selectedSeatIds.length === 0) return;
    message.textContent = '';
    try {
      const res = await fetch(API_BASE + '/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          showtimeId: parseInt(showtimeId, 10),
          seatIds: selectedSeatIds
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Booking failed');
      window.location.href = 'confirm.html?bookingId=' + data.id;
    } catch (e) {
      message.textContent = e.message || 'Booking failed';
    }
  });

  loadShowtime().then(loadSeats);
})();
