// Araştırma — ortak betik (TUR 3). Betiksiz de okunur; bu dosya yalnız kolaylık ekler.
//  katlar (Detay/Örnek/Derin/İlgili düğmeleri) · çapa ile gelince aç · soldaki bölüm listesi · TR/EN · sözcük balonu (sozcuk.json, tembel)
//  Defter düğmesi (ekrandaki bölümün defter sayfası) · Kopyala · merkezde arama (ortak/ara.json, tembel) · «bu hafta»
(function () {
  'use strict';
  var d = document, kok = d.documentElement;
  kok.classList.add('js');
  var $ = function (s, k) { return (k || d).querySelector(s); };
  var $$ = function (s, k) { return Array.prototype.slice.call((k || d).querySelectorAll(s)); };
  var ORTAK = (function () { var s = $('script[src$="ortak/sayfa.js"]'); return s ? s.getAttribute('src').replace(/sayfa\.js$/, '') : 'ortak/'; })();

  // ---------- TR / EN ----------
  var dil = $('#dil');
  if (dil) {
    try { if (localStorage.getItem('arastirma-dil') === 'en') kok.dataset.dil = 'en'; } catch (e) {}
    dil.hidden = false;
    var yazDil = function () { var en = kok.dataset.dil === 'en'; dil.textContent = en ? 'TR' : 'EN'; dil.setAttribute('aria-pressed', en ? 'true' : 'false'); kok.lang = en ? 'en' : 'tr'; };
    yazDil();
    dil.addEventListener('click', function () { kok.dataset.dil = kok.dataset.dil === 'en' ? 'tr' : 'en'; yazDil(); try { localStorage.setItem('arastirma-dil', kok.dataset.dil); } catch (e) {} });
  }

  // ---------- katlar ----------
  $$('.katlar').forEach(function (k) {
    var katlar = $$(':scope > .kat', k); if (!katlar.length) return;
    var sira = d.createElement('div'); sira.className = 'kat-sira';
    katlar.forEach(function (kt, i) {
      var b = d.createElement('button'); b.type = 'button'; b.className = 'kat-dugme';
      b.textContent = kt.dataset.ad || kt.querySelector('summary').textContent;
      var id = (k.closest('[id]') ? k.closest('[id]').id : 'k') + '-kat-' + i; kt.id = kt.id || id;
      b.setAttribute('aria-controls', kt.id); b.setAttribute('aria-expanded', kt.open ? 'true' : 'false');
      b.addEventListener('click', function () { kt.open = !kt.open; });
      kt.addEventListener('toggle', function () { b.setAttribute('aria-expanded', kt.open ? 'true' : 'false'); });
      sira.appendChild(b);
    });
    var db = $(':scope > .dbag', k); if (db) sira.appendChild(db);
    k.insertBefore(sira, k.firstChild);
  });

  // ---------- çapa: kapalı katı aç, göster ----------
  function ac() {
    var id = decodeURIComponent(location.hash.slice(1)); if (!id) return;
    var h = d.getElementById(id); if (!h) return;
    for (var x = h; x; x = x.parentElement) if (x.tagName === 'DETAILS' && !x.classList.contains('ic')) x.open = true;
    requestAnimationFrame(function () { h.scrollIntoView(); });
  }
  addEventListener('hashchange', ac); ac();

  // ---------- soldaki bölüm listesi ----------
  var ic = $('.yan .ic');
  if (ic && matchMedia('(max-width: 1040px)').matches) ic.open = false;
  var navA = $$('.yan .ic a');
  if (ic) ic.addEventListener('click', function (ev) { if (ev.target.closest('a') && matchMedia('(max-width: 1040px)').matches) ic.open = false; });
  var bolumler = $$('.icerik > .kart[id]');
  function etkinBul() {
    var y = 100, son = null;
    for (var i = 0; i < bolumler.length; i++) { if (bolumler[i].getBoundingClientRect().top - y <= 0) son = bolumler[i]; else break; }
    return son || bolumler[0];
  }

  // ---------- Defter düğmesi ----------
  var dd = $('#defter-dugme');
  var DOSYA = { 'Eşlik': ['ING201A_ESLIK_ARASTIRMA_v2.pdf', 'Eşlik'], 'Okuma': ['ING201A_MAKALE-OKUMA_v2.pdf', 'Okuma'], 'Proje': ['TUBITAK2209_PROJE-DEFTERI.pdf', 'Proje'] };
  var defterli = $$('[data-defter]');
  function defterYaz(b) {
    if (!dd) return;
    var el = null;
    for (var i = defterli.length - 1; i >= 0; i--) { if (defterli[i].getBoundingClientRect().top < 140) { el = defterli[i]; break; } }
    el = el || defterli[0];
    if (!el) { dd.hidden = true; return; }
    var p = el.dataset.defter.split(':'), f = DOSYA[p[0]]; if (!f) { dd.hidden = true; return; }
    dd.href = ORTAK + '../defter/' + f[0] + '#page=' + p[1];
    dd.querySelector('span').textContent = f[1] + ' · s. ' + p[1] + ' ↗';
    dd.setAttribute('aria-label', f[1] + ' defteri, sayfa ' + p[1] + ', yeni sekmede aç');
    dd.dataset.sayfa = p[1]; dd.hidden = false;
  }
  var bekle = false;
  function konumla() {
    if (bekle) return; bekle = true;
    requestAnimationFrame(function () {
      bekle = false; defterYaz();
      var e = etkinBul(); if (!e) return;
      navA.forEach(function (a) { a.classList.toggle('etkin', a.getAttribute('href') === '#' + e.id); });
    });
  }
  addEventListener('scroll', konumla, { passive: true }); addEventListener('resize', konumla); konumla();

  // ---------- Kopyala ----------
  d.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('.kopyala'); if (!b) return;
    var m = b.dataset.kopya, bitti = function () { b.classList.add('oldu'); b.textContent = 'Kopyalandı'; setTimeout(function () { b.classList.remove('oldu'); b.textContent = 'Kopyala'; }, 1600); };
    var yedek = function () { var ta = d.createElement('textarea'); ta.value = m; ta.style.position = 'fixed'; ta.style.opacity = '0'; d.body.appendChild(ta); ta.select(); try { d.execCommand('copy'); } catch (e) {} ta.remove(); bitti(); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(m).then(bitti, yedek); else yedek();
  });

  // ---------- sözcük balonu ----------
  var VERI = null, yukleniyor = false, balon = d.createElement('div');
  balon.id = 'balon'; balon.setAttribute('role', 'tooltip'); balon.hidden = true; d.body.appendChild(balon);
  function yukle(sonra) {
    if (VERI) { if (sonra) sonra(); return; }
    if (yukleniyor) return; yukleniyor = true;
    fetch('sozcuk.json').then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { VERI = j || { g: [], s: [] }; if (sonra) sonra(); })
      .catch(function () { VERI = { g: [], s: [] }; });
  }
  if ($('[data-i]')) {
    var bos = window.requestIdleCallback || function (f) { return setTimeout(f, 400); };
    addEventListener('load', function () { bos(function () { yukle(); }); });
  }
  var acik = null, sabit = false;
  function goster(w) {
    if (!VERI) { yukle(function () { goster(w); }); return; }
    var g = VERI.g[+w.dataset.i]; if (!g) return;
    var ipEl = w.closest('[data-s]'), s = ipEl ? VERI.s[+ipEl.dataset.s] : '';
    if (acik && acik !== w) acik.classList.remove('on');
    acik = w; w.classList.add('on');
    balon.innerHTML = '';
    var b = d.createElement('b'); b.textContent = w.textContent + ' → ' + g[0] + ' ';
    var tr = d.createElement('span'); tr.className = 'tur'; tr.textContent = '(tür: ' + g[1] + ')'; b.appendChild(tr); balon.appendChild(b);
    if (s && s !== g[0]) { var k = d.createElement('small'); k.textContent = s; balon.appendChild(k); }
    balon.hidden = false;
    var r = w.getBoundingClientRect(), bw = balon.offsetWidth, bh = balon.offsetHeight;
    var x = Math.max(12, Math.min(r.left, innerWidth - bw - 12)), y = r.bottom + 8;
    if (y + bh > innerHeight - 8) y = Math.max(8, r.top - bh - 8);
    balon.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
  }
  function gizle() { if (acik) acik.classList.remove('on'); acik = null; sabit = false; balon.hidden = true; }
  function soz(t) { return t && t.closest ? t.closest('.ip [data-i]') : null; }
  d.addEventListener('pointerover', function (ev) { if (ev.pointerType !== 'mouse' && ev.pointerType !== 'pen') return; var w = soz(ev.target); if (w && w !== acik) { sabit = false; goster(w); } });
  d.addEventListener('pointerout', function (ev) { if (ev.pointerType !== 'mouse' && ev.pointerType !== 'pen') return; var w = soz(ev.target); if (w && w === acik && !sabit && !w.contains(ev.relatedTarget)) gizle(); });
  d.addEventListener('click', function (ev) {
    var w = soz(ev.target);
    if (!w) { if (acik) gizle(); return; }
    if (w === acik && sabit) { gizle(); return; }
    goster(w); sabit = true;
  });
  d.addEventListener('focusin', function (ev) { var ip = ev.target.closest && ev.target.closest('.ip'); if (ip) { var w = $('[data-i]', ip); if (w) { goster(w); sabit = true; } } });
  d.addEventListener('focusout', function (ev) { var ip = ev.target.closest && ev.target.closest('.ip'); if (ip && !ip.contains(ev.relatedTarget)) gizle(); });
  d.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') { gizle(); return; }
    var ip = ev.target.closest && ev.target.closest('.ip'); if (!ip || (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft')) return;
    var ws = $$('[data-i]', ip), i = ws.indexOf(acik); if (!ws.length) return;
    ev.preventDefault(); i = ev.key === 'ArrowRight' ? Math.min(ws.length - 1, i + 1) : Math.max(0, i - 1); goster(ws[i]); sabit = true;
  });
  addEventListener('scroll', function () {   // balon sözcüğe bağlı kalır; sözcük ekrandan çıkınca kapanır
    if (!acik) return; var r = acik.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) gizle(); else goster(acik);
  }, { passive: true });

  // ---------- bu hafta ----------
  var HAFTA = [['2026-09-28', 1], ['2026-10-05', 2], ['2026-10-12', 3], ['2026-10-19', 4], ['2026-10-26', 5], ['2026-11-02', 6], ['2026-11-09', 7], ['2026-11-16', 0],
    ['2026-11-23', 8], ['2026-11-30', 9], ['2026-12-07', 10], ['2026-12-14', 11], ['2026-12-21', 12], ['2026-12-28', 13], ['2027-01-04', -1]];
  var ADIM = { 1: 'a-konu', 2: 'a-arama', 3: 'a-kaynak', 4: 'a-kanit', 5: 'a-tez', 6: 'a-tez', 7: 'a-paragraf', 0: 'a-paragraf', 8: 'a-paragraf', 9: 'a-vize', 10: 'a-giris', 11: 'a-giris', 12: 'a-giris', 13: 'a-final', '-1': 'a-final' };
  var YAZ = { 1: 'yaz-konu', 2: 'yaz-daralt', 3: 'yaz-kanit', 4: 'yaz-taslak', 5: 'yaz-taslak', 6: 'yaz-tez', 7: 'yaz-a1', 0: 'yaz-a2', 8: 'yaz-a2', 9: 'yaz-vize', 10: 'yaz-giris', 11: 'yaz-giris', 12: 'yaz-giris', 13: 'yaz-yukle', '-1': 'yaz-yukle' };
  var bugun = new Date(), hafta = null;
  HAFTA.forEach(function (h) { var t = h[0].split('-'); if (new Date(+t[0], +t[1] - 1, +t[2]) <= bugun) hafta = h[1]; });
  if (hafta !== null) {
    var ad = hafta > 0 ? 'Hafta ' + hafta : hafta === 0 ? 'Ara tatil' : 'Dönem sonu';
    var bh = $('#bu-hafta'), kart = d.getElementById(ADIM[hafta]);
    if (bh && kart) {
      var yz = $('.yazacagin p', kart);
      bh.innerHTML = '<b>Bu hafta: ' + ad + '</b> — <a href="#' + ADIM[hafta] + '"></a><br><span></span>';
      bh.querySelector('a').textContent = $('h2 .tr', kart) ? $('h2 .tr', kart).textContent : $('h2', kart).textContent;
      bh.querySelector('span').textContent = yz ? 'Yazacağın: ' + yz.textContent : ''; bh.hidden = false;
    }
    var hb = $('#bu-hafta-bag'); if (hb) { hb.href = 'ing201a/#' + ADIM[hafta]; var ha = $('#bu-hafta-ad'); if (ha) ha.textContent = ad + ': yazacağın şey ve sınıfta olacaklar'; }
    var sat = $('tr[data-yaz="' + YAZ[hafta] + '"]'); if (sat) sat.classList.add('bu-hafta-satir');
  }

  // ---------- merkezde arama ----------
  var ara = $('#ara'), sonuc = $('#sonuc');
  if (ara && sonuc) {
    var DIZIN = null, sec = -1;
    var norm = function (s) { return (s || '').toLocaleLowerCase('tr').replace(/[çğıöşüâîû]/g, function (c) { return { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'â': 'a', 'î': 'i', 'û': 'u' }[c]; }); };
    var al = function (f) {
      if (DIZIN) return f();
      fetch(ORTAK + 'ara.json').then(function (r) { return r.json(); }).then(function (j) { DIZIN = j.map(function (x) { x.n = norm(x.t); x.m = norm(x.t + ' ' + x.d + ' ' + x.k); return x; }); f(); });
    };
    var ciz = function () {
      var q = norm(ara.value.trim()); sec = -1;
      if (!q) { sonuc.hidden = true; ara.setAttribute('aria-expanded', 'false'); return; }
      var p = q.split(/\s+/), bul = [];
      DIZIN.forEach(function (x) {
        if (!p.every(function (w) { return x.m.indexOf(w) >= 0; })) return;
        var puan = p.reduce(function (a, w) { return a + (x.n.indexOf(w) === 0 ? 6 : x.n.indexOf(w) >= 0 ? 3 : 1); }, 0);
        bul.push([puan, x]);
      });
      bul.sort(function (a, b) { return b[0] - a[0]; });
      sonuc.innerHTML = '';
      bul.slice(0, 14).forEach(function (b, i) {
        var li = d.createElement('li'), a = d.createElement('a'); a.href = b[1].u; a.setAttribute('role', 'option'); a.id = 'sonuc-' + i;
        var em = d.createElement('em'); em.textContent = b[1].k; a.appendChild(em); a.appendChild(d.createTextNode(b[1].t));
        var sm = d.createElement('small'); sm.textContent = b[1].d.slice(0, 140); a.appendChild(sm); li.appendChild(a); sonuc.appendChild(li);
      });
      if (!bul.length) { var li = d.createElement('li'); li.className = 'yok'; li.textContent = 'Sonuç yok. Başka bir sözcük dene (ör. tez, kanıt, Hafta 9).'; sonuc.appendChild(li); }
      sonuc.hidden = false; ara.setAttribute('aria-expanded', 'true');
    };
    ara.addEventListener('focus', function () { al(function () {}); });
    ara.addEventListener('input', function () { al(ciz); });
    ara.addEventListener('keydown', function (ev) {
      var as = $$('a', sonuc); if (!as.length) return;
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
        ev.preventDefault(); sec = ev.key === 'ArrowDown' ? Math.min(as.length - 1, sec + 1) : Math.max(0, sec - 1);
        as.forEach(function (a, i) { a.setAttribute('aria-selected', i === sec ? 'true' : 'false'); }); as[sec].scrollIntoView({ block: 'nearest' });
        ara.setAttribute('aria-activedescendant', as[sec].id);
      } else if (ev.key === 'Escape') { sonuc.hidden = true; }
    });
    $('#ara-form').addEventListener('submit', function (ev) { ev.preventDefault(); var as = $$('a', sonuc); var a = as[Math.max(0, sec)]; if (a) location.href = a.href; });
    d.addEventListener('click', function (ev) { if (!ev.target.closest('.ara-kutu')) sonuc.hidden = true; });
    if (location.hash === '#ara') { ara.focus(); }
  }
})();
