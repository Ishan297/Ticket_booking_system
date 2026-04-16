// Same origin when UI is served by Spring Boot on :8080; full URL for file:// or other dev servers
const API_BASE = (function () {
  var h = window.location.hostname;
  var p = window.location.port;
  if ((h === 'localhost' || h === '127.0.0.1') && p === '8080') {
    return '/api';
  }
  return 'http://localhost:8080/api';
})();

function getStoredUser() {
  const user = sessionStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

function setStoredUser(user) {
  sessionStorage.setItem('user', JSON.stringify(user));
}

function clearStoredUser() {
  sessionStorage.removeItem('user');
}

function requireAuth() {
  const user = getStoredUser();
  if (!user) {
    window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
    return null;
  }
  return user;
}

function isAdminUser(user) {
  return !!user && String(user.role || '').toUpperCase() === 'ADMIN';
}

function syncAdminNavVisibility() {
  const user = getStoredUser();
  const showAdmin = isAdminUser(user);
  const adminLinks = document.querySelectorAll('a[href="admin.html"]');
  adminLinks.forEach(function (link) {
    link.style.display = showAdmin ? '' : 'none';
  });
}

function renderNavAuth(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const user = getStoredUser();
  if (user) {
    el.innerHTML = '<span>Hello, ' + user.name + '</span> <a href="#" id="nav-logout">Logout</a>';
    const logout = document.getElementById('nav-logout');
    if (logout) logout.addEventListener('click', function (e) { e.preventDefault(); clearStoredUser(); window.location.href = 'index.html'; });
  } else {
    el.innerHTML = '<a href="login.html">Login</a> <a href="register.html">Register</a>';
  }
  syncAdminNavVisibility();
}

document.addEventListener('DOMContentLoaded', syncAdminNavVisibility);
