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
// TUR 2: İngilizce cümle balonu (fare, klavye odağı, dokunma: ikinci dokunuş kapatır) + üç katman sekmesi
(function () {
  var b = document.createElement('div'); b.id = 'balon'; b.setAttribute('role', 'tooltip'); b.hidden = true; document.body.appendChild(b);
  var acik = null;
  function goster(el) {
    acik = el; b.textContent = el.getAttribute('data-tr'); b.hidden = false;
    var r = el.getBoundingClientRect(), bw = b.offsetWidth, bh = b.offsetHeight;
    var x = Math.max(12, Math.min(r.left, innerWidth - bw - 12)), y = r.bottom + 6;
    if (y + bh > innerHeight - 8) y = Math.max(8, r.top - bh - 6);
    b.style.left = x + 'px'; b.style.top = y + 'px';
  }
  function gizle() { if (acik) acik.classList.remove('acik'); acik = null; b.hidden = true; }
  function ipOf(t) { return t && t.closest ? t.closest('.ip') : null; }
  document.addEventListener('mouseover', function (ev) { var el = ipOf(ev.target); if (el && el !== acik && !el.classList.contains('acik')) goster(el); });
  document.addEventListener('mouseout', function (ev) { var el = ipOf(ev.target); if (el && el === acik && !el.classList.contains('acik') && !el.contains(ev.relatedTarget)) gizle(); });
  document.addEventListener('focusin', function (ev) { var el = ipOf(ev.target); if (el) goster(el); });
  document.addEventListener('focusout', function (ev) { var el = ipOf(ev.target); if (el && el === acik) gizle(); });
  document.addEventListener('click', function (ev) {
    var el = ipOf(ev.target);
    if (!el) { gizle(); return; }
    if (el.classList.contains('acik')) { gizle(); el.blur(); }
    else { if (acik && acik !== el) gizle(); goster(el); el.classList.add('acik'); }
  });
  document.addEventListener('keydown', function (ev) {
    var el = ipOf(ev.target);
    if (ev.key === 'Escape') gizle();
    else if (el && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); el.click(); }
  });
  addEventListener('scroll', function () { if (acik) gizle(); }, { passive: true });
  document.querySelectorAll('.katman').forEach(function (k) {
    var sira = k.querySelector('.kt-sira'); if (!sira) return;
    sira.hidden = false; k.classList.add('sekmeli');
    var sek = sira.querySelectorAll('.kt');
    function sec(i) {
      sek.forEach(function (s, j) { s.setAttribute('aria-selected', i === j ? 'true' : 'false'); s.tabIndex = i === j ? 0 : -1; document.getElementById(s.getAttribute('aria-controls')).hidden = i !== j; });
    }
    sek.forEach(function (s, i) {
      s.addEventListener('click', function () { sec(i); });
      s.addEventListener('keydown', function (ev) { var n = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0; if (n) { var j = (i + n + sek.length) % sek.length; sec(j); sek[j].focus(); } });
    });
    sec(0);
  });
})();
