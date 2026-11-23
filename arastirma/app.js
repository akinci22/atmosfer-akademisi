// Araştırma bölümü: TR/EN düğmesi, yapışkan çiplerde etkin bölüm, çapa ile gelince kapalı adımı aç. Betiksiz de okunur.
(function () {
  var kok = document.documentElement, dil = document.getElementById('dil');
  try { if (localStorage.getItem('arastirma-dil') === 'en') kok.dataset.dil = 'en'; } catch (e) {}
  dil.hidden = false;
  function yaz() {
    var en = kok.dataset.dil === 'en';
    dil.textContent = en ? 'TR' : 'EN'; dil.setAttribute('aria-pressed', en ? 'true' : 'false'); kok.lang = en ? 'en' : 'tr';
  }
  yaz();
  dil.addEventListener('click', function () {
    kok.dataset.dil = kok.dataset.dil === 'en' ? 'tr' : 'en'; yaz();
    try { localStorage.setItem('arastirma-dil', kok.dataset.dil); } catch (e) {}
  });
  function ac() {
    var id = decodeURIComponent(location.hash.slice(1)); if (!id) return;
    var h = document.getElementById(id); if (!h) return;
    for (var x = h; x; x = x.parentElement) if (x.tagName === 'DETAILS') x.open = true;
    h.scrollIntoView();
  }
  window.addEventListener('hashchange', ac); ac();
  var cipler = document.querySelectorAll('.cip'), bol = document.querySelectorAll('.bolum');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (g) {
      g.forEach(function (x) {
        if (x.isIntersecting) cipler.forEach(function (c) { c.classList.toggle('etkin', c.getAttribute('href') === '#' + x.target.id); });
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    bol.forEach(function (b) { io.observe(b); });
  }
})();
