(function () {
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get('movieId');
  const movieInfo = document.getElementById('movie-info');
  const showtimesEl = document.getElementById('showtimes');
  const message = document.getElementById('message');

  renderNavAuth('nav-auth');
  if (!movieId) {
    message.textContent = 'No movie selected.';
    return;
  }

  async function loadMovie() {
    try {
      const res = await fetch(API_BASE + '/movies/' + movieId);
      if (!res.ok) throw new Error('Movie not found');
      const movie = await res.json();
      movieInfo.innerHTML = '<h1>' + movie.title + '</h1>' +
        '<p>' + (movie.description || '') + '</p>' +
        '<p>' + (movie.genre || '') + ' | ' + (movie.durationMin || 0) + ' min | ' + (movie.language || '') + '</p>';
    } catch (e) {
      message.textContent = e.message;
    }
  }

  async function loadShowtimes() {
    try {
      const res = await fetch(API_BASE + '/showtimes?movieId=' + movieId);
      if (!res.ok) throw new Error('Failed to load showtimes');
      const list = await res.json();
      if (list.length === 0) {
        showtimesEl.innerHTML = '<p>No showtimes available.</p>';
        return;
      }
      showtimesEl.innerHTML = '<ul class="showtime-list">' + list.map(function (s) {
        const start = s.startTime ? new Date(s.startTime).toLocaleString() : '';
        const theater = s.screen && s.screen.theater ? s.screen.theater.name : '';
        const screen = s.screen ? s.screen.name : '';
        return '<li>' +
          '<span>' + theater + ' - ' + screen + ' | ' + start + ' | ₹' + (s.pricePerSeat || 0) + '</span>' +
          ' <a href="booking.html?showtimeId=' + s.id + '">Book</a>' +
          '</li>';
      }).join('') + '</ul>';
    } catch (e) {
      showtimesEl.innerHTML = '<p class="error">' + (e.message || 'Failed to load showtimes') + '</p>';
    }
  }

  loadMovie();
  loadShowtimes();
})();
