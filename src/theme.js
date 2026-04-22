(function () {
  document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || 'light');
})();

document.addEventListener('DOMContentLoaded', function () {
  var btn = document.createElement('button');
  btn.id = 'theme-toggle';
  btn.setAttribute('aria-label', 'Toggle theme');
  document.body.appendChild(btn);

  function updateIcon() {
    btn.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀' : '☾';
  }

  updateIcon();

  btn.addEventListener('click', function () {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateIcon();
  });
});
