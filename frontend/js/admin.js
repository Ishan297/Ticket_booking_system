(function () {
  const message = document.getElementById('message');
  renderNavAuth('nav-auth');

  const currentUser = getStoredUser();
  if (!isAdminUser(currentUser)) {
    message.textContent = 'Admin access only. Please login with an admin account.';
    message.className = 'error';
    document.querySelectorAll('form').forEach(function (form) {
      const controls = form.querySelectorAll('input, button');
      controls.forEach(function (el) { el.disabled = true; });
    });
    return;
  }

  function show(msg, isError) {
    message.textContent = msg;
    message.className = isError ? 'error' : 'success';
  }

  document.getElementById('form-movie').addEventListener('submit', async function (e) {
    e.preventDefault();
    const f = e.target;
    try {
      const res = await fetch(API_BASE + '/admin/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: f.title.value,
          description: f.description.value || null,
          durationMin: parseInt(f.durationMin.value, 10),
          genre: f.genre.value || null,
          language: f.language.value || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      show('Movie added. ID: ' + data.id, false);
      f.reset();
    } catch (err) {
      show(err.message, true);
    }
  });

  document.getElementById('form-theater').addEventListener('submit', async function (e) {
    e.preventDefault();
    const f = e.target;
    try {
      const res = await fetch(API_BASE + '/admin/theaters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: f.name.value,
          city: f.city.value,
          address: f.address.value || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      show('Theater added. ID: ' + data.id, false);
      f.reset();
    } catch (err) {
      show(err.message, true);
    }
  });

  document.getElementById('form-screen').addEventListener('submit', async function (e) {
    e.preventDefault();
    const f = e.target;
    try {
      const res = await fetch(API_BASE + '/admin/screens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theaterId: parseInt(f.theaterId.value, 10),
          name: f.name.value,
          capacity: parseInt(f.capacity.value, 10) || 50
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      show('Screen added. ID: ' + data.id, false);
      f.reset();
    } catch (err) {
      show(err.message, true);
    }
  });

  document.getElementById('form-showtime').addEventListener('submit', async function (e) {
    e.preventDefault();
    const f = e.target;
    try {
      const start = new Date(f.startTime.value).toISOString();
      const end = new Date(f.endTime.value).toISOString();
      const res = await fetch(API_BASE + '/admin/showtimes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId: parseInt(f.movieId.value, 10),
          screenId: parseInt(f.screenId.value, 10),
          startTime: start,
          endTime: end,
          pricePerSeat: parseFloat(f.pricePerSeat.value)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      show('Showtime added. ID: ' + data.id, false);
      f.reset();
    } catch (err) {
      show(err.message, true);
    }
  });
})();
