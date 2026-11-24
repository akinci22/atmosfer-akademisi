// Soru çözümleri giriş sayfası: ortak/atolye.json'daki derslere «Sınav atölyesi →» bağı ekler;
// kartı olmayan ders (ör. yeni yayımlanan) için kart oluşturur. Liste yoksa sayfa olduğu gibi kalır.
(() => {
  'use strict';
  const d = document, nav = d.getElementById('dersler');
  if (!nav) return;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  fetch('ortak/atolye.json', { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : null)).then((j) => {
    if (!j || !Array.isArray(j.dersler)) return;
    for (const r of j.dersler) {
      if (!r || !r.klasor || r.klasor[0] === '_' || !/^[a-z0-9-]+$/.test(r.klasor)) continue;
      let kart = nav.querySelector('.ders[data-k="' + r.klasor + '"]');
      if (!kart && (r.cozum || r.calis)) {
        kart = d.createElement('div'); kart.className = 'ders'; kart.dataset.k = r.klasor;
        const hedef = r.cozum ? r.klasor + '/' : r.klasor + '/calis/';
        const alt = r.cozum ? (r.ad || '') + (r.cozumSoru ? ' · ' + r.cozumSoru + ' soru' : '') : (r.ad || '') + ' · sınav atölyesi' + (r.soru ? ' · ' + r.soru + ' soru' : '');
        kart.innerHTML = '<a href="' + esc(hedef) + '"><b>' + esc(r.kod || r.klasor.toUpperCase()) + '</b><span>' + esc(alt) + '</span></a>';
        nav.appendChild(kart);
        if (!r.cozum) continue;
      }
      if (kart && r.calis && !kart.querySelector('.atolye')) {
        const a = d.createElement('a'); a.className = 'atolye'; a.href = r.klasor + '/calis/';
        a.textContent = 'Sınav atölyesi' + (r.soru ? ' · ' + r.soru + ' soru' : '') + ' →';
        kart.appendChild(a);
      }
    }
  }).catch(() => {});
})();
