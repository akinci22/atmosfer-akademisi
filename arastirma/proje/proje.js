// Proje ayrıntı sayfası: etkin bölüm (üst çipler + sağdaki konum şeridi), çapayla gelince kapalı katmanı aç. Betiksiz de okunur.
(function () {
  function ac() {
    var id = decodeURIComponent(location.hash.slice(1)); if (!id) return;
    var h = document.getElementById(id); if (!h) return;
    for (var x = h; x; x = x.parentElement) if (x.tagName === 'DETAILS') x.open = true;
    h.scrollIntoView();
  }
  addEventListener('hashchange', ac); ac();
  var bag = document.querySelectorAll('.cip, .serit a'), bol = document.querySelectorAll('section.bolum[id]');
  if (!('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (g) {
    g.forEach(function (x) {
      if (!x.isIntersecting) return;
      bag.forEach(function (c) {
        var on = c.getAttribute('href') === '#' + x.target.id;
        c.classList.toggle('etkin', on);
        if (on && c.classList.contains('cip')) { var k = c.parentElement; k.scrollLeft = c.offsetLeft - (k.clientWidth - c.offsetWidth) / 2; }
      });
    });
  }, { rootMargin: '-35% 0px -60% 0px' });
  bol.forEach(function (b) { io.observe(b); });
})();
