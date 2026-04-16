(function () {
  const movieList = document.getElementById('movie-list');
  const message = document.getElementById('message');
  const searchInput = document.getElementById('movie-search');
  const movieCount = document.getElementById('movie-count');
  let allMovies = [];

  function renderNav() {
    renderNavAuth('nav-auth');
  }

  function renderMovies(movies) {
    if (!movies || movies.length === 0) {
      movieList.innerHTML = '<p>No matching movies found.</p>';
      movieCount.textContent = '0 movies';
      return;
    }
    movieCount.textContent = movies.length + (movies.length === 1 ? ' movie' : ' movies');
    movieList.innerHTML = movies.map(function (m) {
      return '<div class="movie-card" data-id="' + m.id + '">' +
        '<h3>' + (m.title || '') + '</h3>' +
        '<p>' + (m.genre || 'Genre not set') + ' | ' + (m.durationMin || 0) + ' min</p>' +
        '<button class="btn">View Showtimes</button>' +
        '</div>';
    }).join('');
    movieList.querySelectorAll('.movie-card').forEach(function (el) {
      el.addEventListener('click', function () {
        window.location.href = 'movie-detail.html?movieId=' + el.dataset.id;
      });
    });
  }

  function filterMovies() {
    const q = (searchInput && searchInput.value ? searchInput.value : '').trim().toLowerCase();
    if (!q) {
      renderMovies(allMovies);
      return;
    }
    const filtered = allMovies.filter(function (m) {
      const title = String(m.title || '').toLowerCase();
      const genre = String(m.genre || '').toLowerCase();
      return title.includes(q) || genre.includes(q);
    });
    renderMovies(filtered);
  }

  async function loadMovies() {
    try {
      message.textContent = '';
      const res = await fetch(API_BASE + '/movies');
      if (!res.ok) throw new Error('Failed to load movies');
      allMovies = await res.json();
      if (allMovies.length === 0) {
        movieList.innerHTML = '<p>No movies available. Add some from Admin.</p>';
        movieCount.textContent = '0 movies';
        return;
      }
      renderMovies(allMovies);
    } catch (e) {
      message.textContent = e.message || 'Failed to load movies. Is the backend running on port 8080?';
    }
  }

  renderNav();
  if (searchInput) searchInput.addEventListener('input', filterMovies);
  loadMovies();
})();
