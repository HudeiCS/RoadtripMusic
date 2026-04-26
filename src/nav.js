document.addEventListener('DOMContentLoaded', () => {
  const btn = document.createElement('button');
  btn.id = 'menu-btn';
  btn.setAttribute('aria-label', 'Open navigation menu');
  btn.textContent = '☰';
  document.body.appendChild(btn);

  const overlay = document.createElement('div');
  overlay.id = 'sidebar-overlay';
  document.body.appendChild(overlay);

  btn.addEventListener('click', () => document.body.classList.toggle('sidebar-open'));
  overlay.addEventListener('click', () => document.body.classList.remove('sidebar-open'));
});
