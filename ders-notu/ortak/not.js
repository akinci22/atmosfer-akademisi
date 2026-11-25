/* Ders notları: terim balonu, cevap göster, Mihenk (sütun/satır odak, şunu bil, kendini dene), Okudum ilerlemesi. */
(function () {
  'use strict';
  var $ = function (s, k) { return (k || document).querySelector(s); };
  var $$ = function (s, k) { return Array.prototype.slice.call((k || document).querySelectorAll(s)); };
  var NOT = document.body.dataset.not || 'dizin';
  function depo(k, v) {
    try {
      if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null');
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) { return null; }
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function baglar(l) {
    if (!l || !l.length) return '';
    var ad = { kitap: 'Kitaplık', soru: 'Çözümlü soru', sinav: 'Sınav atölyesi', url: 'Akademi' };
    return '<div class="baglar">' + l.map(function (b) {
      return '<a class="bag bag-' + b.tur + '" href="' + esc(b.href) + '"><span class="bag-tur">' + esc(b.etiket || ad[b.tur]) +
        '</span><span class="bag-ad">' + esc(b.ad) + '</span><span class="bag-ok" aria-hidden="true">→</span></a>';
    }).join('') + '</div>';
  }

  /* ---- terim balonu ---- */
  var TV = $('#terimler') ? JSON.parse($('#terimler').textContent) : {};
  var pop = $('#pop'), acan = null;
  function popKapat() { if (pop) { pop.hidden = true; if (acan) acan.focus(); acan = null; } }
  document.addEventListener('click', function (o) {
    var t = o.target.closest('.trm');
    if (t && TV[t.dataset.t]) {
      var v = TV[t.dataset.t];
      pop.innerHTML = '<button type="button" class="kapat" aria-label="Kapat">×</button><h3>' + esc(v.ad) + '</h3><p class="en" lang="en">' +
        esc(v.en) + '</p><p>' + v.tanim + '</p>' + baglar(v.bag);
      pop.hidden = false;
      var r = t.getBoundingClientRect(), w = Math.min(440, window.innerWidth - 32);
      pop.style.left = Math.max(16, Math.min(window.scrollX + r.left, window.scrollX + window.innerWidth - w - 16)) + 'px';
      pop.style.top = (window.scrollY + r.bottom + 8) + 'px';
      acan = t; $('.kapat', pop).focus();
      return;
    }
    if (o.target.closest('.kapat') || (pop && !pop.hidden && !o.target.closest('#pop'))) popKapat();
    var g = o.target.closest('.goster');
    if (g) {
      var c = g.nextElementSibling, ac = c.hidden;
      c.hidden = !ac; g.setAttribute('aria-expanded', String(ac)); g.textContent = ac ? 'Cevabı gizle' : 'Cevabı göster';
    }
    var bb = o.target.closest('.bil-b');
    if (bb) {
      var ic = bb.nextElementSibling, a2 = ic.hidden;
      ic.hidden = !a2; bb.setAttribute('aria-expanded', String(a2));
    }
  });
  document.addEventListener('keydown', function (o) { if (o.key === 'Escape') popKapat(); });

  /* ---- Mihenk ---- */
  $$('.mihenk').forEach(function (m) {
    var V = JSON.parse($('.mh-veri', m).textContent), det = $('.mh-detay', m);
    function temizle() {
      m.removeAttribute('data-k');
      $$('.sec', m).forEach(function (e) { e.classList.remove('sec'); });
    }
    function sutun(k) {
      if (m.dataset.k === String(k)) { temizle(); det.innerHTML = '<p class="mh-bos">Seçim yok. Bir sütun ya da satır seç.</p>'; return; }
      temizle(); m.dataset.k = k;
      $$('[data-k="' + k + '"]', m).forEach(function (e) { (e.tagName === 'BUTTON' ? e.parentNode : e).classList.add('sec'); });
      var s = V.sutun[k];
      det.innerHTML = '<h3>' + esc(s.ad) + '</h3><p>' + s.not + '</p>' + baglar(s.bag);
    }
    function satir(r) {
      temizle();
      var tr = $('tr[data-r="' + r + '"]', m); tr.classList.add('sec');
      var s = V.satir[r];
      det.innerHTML = '<h3>' + s.ad + '</h3><p>' + s.not + '</p>';
    }
    m.addEventListener('click', function (o) {
      var a = o.target.closest('.mh-sut'), b = o.target.closest('.mh-sat');
      if (a) sutun(+a.dataset.k);
      if (b) satir(+b.dataset.r);
    });
    /* kendini dene */
    var D = JSON.parse($('.mh-dene', m).dataset.dene || '[]'), i = 0, dogru = 0;
    var ds = $('.dene-s', m), dc = $('.dene-sec', m), sn = $('.dene-sonuc', m);
    function goster() {
      if (i >= D.length) {
        ds.textContent = D.length + ' sorudan ' + dogru + ' doğru.';
        dc.innerHTML = '<button type="button" data-yeniden>Yeniden dene</button>'; sn.textContent = ''; return;
      }
      ds.textContent = (i + 1) + '/' + D.length + ' · ' + D[i].s;
      dc.innerHTML = V.sutun.map(function (s, k) { return '<button type="button" data-c="' + k + '">' + esc(s.ad) + '</button>'; }).join('');
    }
    dc.addEventListener('click', function (o) {
      var b = o.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-yeniden')) { i = 0; dogru = 0; goster(); return; }
      if (dc.dataset.kilit) return;
      var c = +b.dataset.c, d = D[i].c;
      b.classList.add(c === d ? 'dogru' : 'yanlis');
      if (c !== d) $('[data-c="' + d + '"]', dc).classList.add('dogru'); else dogru++;
      sn.textContent = c === d ? 'Doğru.' : 'Doğrusu: ' + V.sutun[d].ad + '. Tabloda o sütunu aç.';
      sutun(d);
      dc.dataset.kilit = '1';
      setTimeout(function () { delete dc.dataset.kilit; i++; goster(); }, 1400);
    });
    if (D.length) goster(); else $('.mh-dene', m).hidden = true;
  });

  /* ---- Okudum + ilerleme ---- */
  var KEY = 'dn.' + NOT + '.okudum', ok = depo(KEY) || {};
  var kutular = $$('[data-ok]'), cubuk = $('.ilerleme i'), say = $('.ilerleme-say');
  function guncelle() {
    var n = kutular.filter(function (k) { return k.checked; }).length;
    if (cubuk) cubuk.style.width = (kutular.length ? 100 * n / kutular.length : 0) + '%';
    if (say) say.textContent = n + '/' + kutular.length;
  }
  kutular.forEach(function (k) {
    k.checked = !!ok[k.dataset.ok];
    k.addEventListener('change', function () { ok[k.dataset.ok] = k.checked; depo(KEY, ok); guncelle(); });
  });
  guncelle();

  /* ---- etkin çip ---- */
  var cipler = $$('.cipler a');
  if ('IntersectionObserver' in window && cipler.length) {
    var io = new IntersectionObserver(function (g) {
      g.forEach(function (e) {
        if (!e.isIntersecting) return;
        cipler.forEach(function (c) { c.classList.toggle('etkin', c.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    $$('[data-sid]').forEach(function (s) { io.observe(s); });
  }
})();
