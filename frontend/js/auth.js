(function () {
  const redirect = new URLSearchParams(window.location.search).get('redirect') || 'index.html';

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const msg = document.getElementById('message');
      msg.textContent = '';
      try {
        const res = await fetch(API_BASE + '/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');
        setStoredUser(data);
        window.location.href = redirect;
      } catch (e) {
        msg.textContent = e.message;
      }
    });
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const msg = document.getElementById('message');
      msg.textContent = '';
      try {
        const res = await fetch(API_BASE + '/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            phone: document.getElementById('phone').value || null
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');
        setStoredUser(data);
        window.location.href = redirect;
      } catch (e) {
        msg.textContent = e.message;
      }
    });
  }
})();
