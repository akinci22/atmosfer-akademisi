/* CBS Uygulamaları — adım kartları, ilerleme, büyütme, küçük açıklayıcılar. Bağımlılık yok. */
(function () {
  'use strict';
  var V = window.CBS, $ = function (s, k) { return (k || document).querySelector(s); };
  var ANAHTAR = 'cbs.u1.bitti', ANAHTAR_L = 'cbs.u1.liste';
  function oku(a) { try { return JSON.parse(localStorage.getItem(a) || '[]'); } catch (e) { return []; } }
  function yaz(a, d) { try { localStorage.setItem(a, JSON.stringify(d)); } catch (e) { /* özel pencere */ } }
  var bitti = oku(ANAHTAR), liste = oku(ANAHTAR_L);
  function e(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function tr(n, o) { return n.toFixed(o == null ? 0 : o).replace('.', ','); }
  function bin(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

  function boyut(ad) { var b = (window.CBS_BOYUT || {})[ad]; return b ? ' width="' + b[0] + '" height="' + b[1] + '"' : ''; }
  var TIK = '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8L16 9.5"/></svg>';
  var SEMA = {
    paket: '<svg viewBox="0 0 640 150" role="img" aria-label="Zip dosyası klasöre açılır, içindeki QGIS projesi açılır">' +
      '<g font-family="system-ui,Segoe UI,Arial" font-size="15" fill="#14181f">' +
      '<rect x="14" y="40" width="150" height="70" rx="10" fill="#fff" stroke="#c9d0da"/><text x="89" y="70" text-anchor="middle" font-weight="700">.zip</text><text x="89" y="92" text-anchor="middle" fill="#5a6472">indir</text>' +
      '<rect x="245" y="40" width="150" height="70" rx="10" fill="#fff" stroke="#c9d0da"/><text x="320" y="70" text-anchor="middle" font-weight="700">klasör</text><text x="320" y="92" text-anchor="middle" fill="#5a6472">10m · 50m · 110m</text>' +
      '<rect x="476" y="40" width="150" height="70" rx="10" fill="#eef3ff" stroke="#1d4ed8"/><text x="551" y="70" text-anchor="middle" font-weight="700">…_QGIS_v3.qgs</text><text x="551" y="92" text-anchor="middle" fill="#5a6472">QGIS\'te aç</text>' +
      '<g stroke="#5a6472" stroke-width="1.75" fill="none" stroke-linecap="round"><path d="M172 75h62m-8-7l8 7-8 7"/><path d="M403 75h62m-8-7l8 7-8 7"/></g>' +
      '<text x="203" y="62" text-anchor="middle" font-size="13" fill="#5a6472">ayıkla</text><text x="434" y="62" text-anchor="middle" font-size="13" fill="#5a6472">içinde</text></g></svg>'
  };

  /* ---------- kurulum ---------- */
  var asamaKap = $('#asamalar'), no = 0, html = '';
  V.asamalar.forEach(function (a, ai) {
    html += '<section class="kap asama" id="uygulama1-' + a.id + '" data-asama="' + a.id + '"><div class="asama-bas"><span class="asama-no">' + (ai + 1) +
      '</span><h2>' + e(a.uzun) + '</h2><p class="asama-ozet">' + e(a.ozet) + '</p></div><div class="adimlar">';
    V.adimlar.forEach(function (d) {
      if (d.f !== a.id) return;
      no++; d.no = no;
      var gorsel = '';
      (d.img || []).forEach(function (g) {
        var notlar = (g.not || []).map(function (t, i) { return '<li><b>' + (i + 1) + '</b>' + e(t) + '</li>'; }).join('');
        gorsel += '<figure class="sekil' + (g.kucuk ? ' kucuk' : '') + (g.uzun ? ' uzun' : '') + '"><button class="buyut" type="button" data-buyut="img/' + g.ad +
          '.webp" aria-label="Görseli büyüt: ' + e(g.alt) + '"><img src="img/' + g.ad + '.webp" loading="lazy" decoding="async"' + boyut(g.ad) + ' alt="' + e(g.alt) + '"></button>' +
          (notlar ? '<ul class="notlar">' + notlar + '</ul>' : '') + '</figure>';
      });
      if (d.sema) gorsel += '<div class="sema">' + SEMA[d.sema] + '</div>';
      var tablo = d.tablo ? '<dl class="tablo">' + d.tablo.map(function (s) { return '<div><dt>' + e(s[0]) + '</dt><dd>' + e(s[1]) + '</dd></div>'; }).join('') + '</dl>' : '';
      var den = d.liste ? '<ul class="denetim">' + d.liste.map(function (s, i) {
        return '<li><label><input type="checkbox" data-liste="' + i + '"' + (liste.indexOf(i) >= 0 ? ' checked' : '') + '><span>' + e(s) + '</span></label></li>';
      }).join('') + '</ul>' : '';
      html += '<article class="adim-kart' + (gorsel ? '' : ' yalniz') + '" id="uygulama1-a' + no + '" data-no="' + no + '"><div class="adim-yazi">' +
        '<div class="adim-ust"><span class="adim-no">' + no + '</span><h3>' + e(d.baslik) + '</h3></div>' +
        '<p class="yol">' + e(d.yol) + '</p>' +
        '<ul class="ucluk"><li><span>NE YAPIYORUM</span><div>' + e(d.ne) + '</div></li><li><span>NEREDE</span><div>' + e(d.nerede) +
        '</div></li><li><span>NEDEN</span><div>' + e(d.neden) + '</div></li></ul>' + tablo + den +
        (d.ipucu ? '<p class="ipucu">' + e(d.ipucu) + '</p>' : '') +
        '<button class="bitir" type="button" aria-pressed="false">' + TIK + '<span>Bitirdim</span></button></div>' +
        (gorsel ? '<div class="gorseller">' + gorsel + '</div>' : '') +
        (d.arac ? '<div class="arac" data-arac="' + d.arac + '"></div>' : '') + '</article>';
    });
    html += '</div></section>';
  });
  asamaKap.innerHTML = html;
  var TOPLAM = no;
  $('#adim-sayi').textContent = TOPLAM;

  $('#cipler').innerHTML = V.asamalar.map(function (a, i) {
    return '<a class="cip" href="#uygulama1-' + a.id + '" data-cip="' + a.id + '"><b>' + (i + 1) + '</b>' + e(a.ad) + ' <small></small></a>';
  }).join('') + '<a class="cip" href="#hatalar" data-cip="hatalar"><b>?</b>Hatalar</a><a class="cip" href="#bitmis" data-cip="bitmis"><b>✓</b>Bitmiş harita</a>';

  $('#hata-liste').innerHTML = V.hatalar.map(function (h) {
    return '<details class="hata"><summary>' + e(h.h) + '</summary><p>' + e(h.c) + '</p></details>';
  }).join('');

  /* ---------- ilerleme ---------- */
  function ciz() {
    var say = 0;
    document.querySelectorAll('.adim-kart').forEach(function (k) {
      var b = bitti.indexOf(+k.dataset.no) >= 0;
      if (b) say++;
      k.classList.toggle('bitti', b);
      var d = $('.bitir', k);
      d.setAttribute('aria-pressed', b ? 'true' : 'false');
      $('span', d).textContent = b ? 'Bitti' : 'Bitirdim';
    });
    V.asamalar.forEach(function (a) {
      var ad = V.adimlar.filter(function (d) { return d.f === a.id; });
      var b = ad.filter(function (d) { return bitti.indexOf(d.no) >= 0; }).length;
      var c = $('[data-cip="' + a.id + '"]');
      $('small', c).textContent = b + '/' + ad.length;
      c.classList.toggle('bitti', b === ad.length);
    });
    $('#ilerleme-cubuk').style.transform = 'scaleX(' + (say / TOPLAM) + ')';
    $('#durum-yazi').textContent = say + ' / ' + TOPLAM + ' adım';
    $('#devam').textContent = say === 0 ? 'Başla' : say === TOPLAM ? 'Hepsi bitti · başa dön' : 'Kaldığım yere git';
  }
  document.addEventListener('click', function (o) {
    var b = o.target.closest('.bitir');
    if (b) {
      var n = +b.closest('.adim-kart').dataset.no, i = bitti.indexOf(n);
      if (i >= 0) bitti.splice(i, 1); else bitti.push(n);
      yaz(ANAHTAR, bitti); ciz(); return;
    }
    var g = o.target.closest('[data-buyut]');
    if (g) { isikAc(g.dataset.buyut, $('img', g).alt); return; }
  });
  document.addEventListener('change', function (o) {
    if (o.target.dataset && o.target.dataset.liste != null) {
      var i = +o.target.dataset.liste, k = liste.indexOf(i);
      if (o.target.checked && k < 0) liste.push(i);
      if (!o.target.checked && k >= 0) liste.splice(k, 1);
      yaz(ANAHTAR_L, liste);
    }
  });
  $('#devam').addEventListener('click', function () {
    var hedef = null;
    for (var i = 1; i <= TOPLAM; i++) if (bitti.indexOf(i) < 0) { hedef = $('#uygulama1-a' + i); break; }
    (hedef || $('#uygulama1')).scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  ciz();

  /* çip: yumuşak git, adresi güncelle */
  $('#cipler').addEventListener('click', function (o) {
    var c = o.target.closest('.cip'), h = c && document.getElementById(c.getAttribute('href').slice(1));
    if (!h) return;
    o.preventDefault();
    history.pushState(null, '', c.getAttribute('href'));
    h.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  window.addEventListener('popstate', function () { var h = document.getElementById(location.hash.slice(1)); if (h) h.scrollIntoView(); });

  /* etkin çip */
  var cipKap = $('#cipler');
  function etkin(id) {
    cipKap.querySelectorAll('.cip').forEach(function (c) {
      var b = c.dataset.cip === id;
      if (b && !c.classList.contains('etkin')) {
        var hedef = c.offsetLeft - (cipKap.clientWidth - c.offsetWidth) / 2;
        cipKap.scrollTo({ left: Math.max(0, hedef), behavior: 'smooth' });
      }
      c.classList.toggle('etkin', b);
    });
  }
  if ('IntersectionObserver' in window) {
    var gorunen = {};
    var io = new IntersectionObserver(function (gs) {
      gs.forEach(function (g) { gorunen[g.target.dataset.asama || g.target.id] = g.isIntersecting; });
      var sira = V.asamalar.map(function (a) { return a.id; }).concat(['hatalar', 'bitmis']);
      for (var i = 0; i < sira.length; i++) if (gorunen[sira[i]]) { etkin(sira[i]); return; }
    }, { rootMargin: '-130px 0px -55% 0px' });
    document.querySelectorAll('.asama, #hatalar, #bitmis').forEach(function (s) { io.observe(s); });
  }

  /* ---------- büyütme ---------- */
  var isik = $('#isik'), isikImg = $('img', isik);
  function isikAc(src, alt) {
    isikImg.src = src; isikImg.alt = alt || '';
    isik.classList.add('sigdir'); isik.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    $('.isik-kapat', isik).focus();
  }
  function isikKapat() { isik.hidden = true; document.documentElement.style.overflow = ''; }
  isik.addEventListener('click', function (o) {
    if (o.target === isikImg) { isik.classList.toggle('sigdir'); return; }
    isikKapat();
  });
  document.addEventListener('keydown', function (o) { if (o.key === 'Escape' && !isik.hidden) isikKapat(); });

  /* ---------- açıklayıcılar ---------- */
  function okuma(kap, ad) { return '<div>' + ad + '<b data-o="' + kap + '">–</b></div>'; }
  function yansit(kok, deger) {          /* E1: değişen değer kısa süre parlar */
    Object.keys(deger).forEach(function (k) {
      var b = $('[data-o="' + k + '"]', kok);
      if (b.textContent === deger[k]) return;
      var ilk = b.textContent === '–';
      b.textContent = deger[k];
      if (ilk) return;
      b.classList.add('yan');
      clearTimeout(b._z); b._z = setTimeout(function () { b.classList.remove('yan'); }, 60);
    });
  }
  var ARAC = {
    olcek: function (k) {
      k.innerHTML = '<h4>Ölçek değişince ölçek çubuğu <small>sürgüyü çek</small></h4>' +
        '<svg viewBox="0 0 640 170" role="img" aria-label="Kâğıt üzerinde 0–200–400 km ölçek çubuğu">' +
        '<rect class="hayal" x="40" y="52" height="22" fill="#1d4ed8" opacity="0"/>' +
        '<rect class="s1" x="40" y="52" height="22" fill="#14181f"/><rect class="s2" y="52" height="22" fill="#fff" stroke="#14181f" stroke-width="1.5"/>' +
        '<g font-family="system-ui,Arial" font-size="19" fill="#14181f"><text x="40" y="42" text-anchor="middle">0</text><text class="t1" y="42" text-anchor="middle">200</text><text class="t2" y="42" text-anchor="middle">400 km</text></g>' +
        '<g class="cetvel" font-family="system-ui,Arial" font-size="16" fill="#5a6472"></g></svg>' +
        '<div class="arac-yan"><label>Harita ölçeği<input type="range" min="4" max="40" step="1" value="10" aria-label="Harita ölçeği, milyon"></label>' +
        '<div class="okuma">' + okuma('olcek', 'Ölçek') + okuma('cm', 'Kâğıtta 1 cm') + okuma('bar', '200 km kâğıtta') + okuma('gen', '18 cm\'lik harita') + '</div>' +
        '<p>Ölçek paydası büyüdükçe aynı 200 km kâğıtta kısalır.</p></div>';
      var PX = 6, c = $('.cetvel', k), s = '';
      for (var mm = 0; mm <= 95; mm += 5) s += '<path d="M' + (40 + mm * PX) + ' 100v' + (mm % 10 ? 7 : 13) + '" stroke="#8a94a3"/>' + (mm % 10 ? '' : '<text x="' + (40 + mm * PX) + '" y="134" text-anchor="middle">' + mm / 10 + '</text>');
      c.innerHTML = s + '<text x="40" y="160">kâğıt, cm</text>';
      var g = $('input', k), h = $('.hayal', k);
      function ciz2() {
        var S = +g.value, w = 200 / S * PX;
        $('.s1', k).setAttribute('width', w); $('.s2', k).setAttribute('x', 40 + w); $('.s2', k).setAttribute('width', w);
        $('.t1', k).setAttribute('x', 40 + w); $('.t2', k).setAttribute('x', Math.min(40 + 2 * w, 600));
        yansit(k, { olcek: '1:' + bin(S * 1e6), cm: bin(S * 10) + ' km', bar: tr(200 / S, 1) + ' mm', gen: bin(S * 180) + ' km' });
      }
      g.addEventListener('pointerdown', function () { h.setAttribute('width', 400 / +g.value * PX); h.style.transition = 'none'; h.style.opacity = .22; });
      function birak() { h.style.transition = 'opacity .9s'; h.style.opacity = 0; }
      g.addEventListener('pointerup', birak); g.addEventListener('pointercancel', birak); g.addEventListener('blur', birak);
      g.addEventListener('input', ciz2); ciz2();
    },
    izdusum: function (k) {
      k.innerHTML = '<h4>Mercator\'da şekil nasıl büyür? <small>enlemi değiştir</small></h4>' +
        '<svg viewBox="0 0 640 230" role="img" aria-label="Aynı daire yerkürede ve Mercator haritasında">' +
        '<g font-family="system-ui,Arial" font-size="19" fill="#5a6472"><text x="150" y="26" text-anchor="middle">Yerde (gerçek boy)</text><text x="460" y="26" text-anchor="middle">EPSG:3857 haritasında</text></g>' +
        '<path d="M300 14v206" stroke="#e3e6eb"/>' +
        '<circle cx="150" cy="125" r="32" fill="#eef3ff" stroke="#1d4ed8" stroke-width="2"/>' +
        '<circle class="hayal" cx="460" cy="125" r="32" fill="none" stroke="#1d4ed8" stroke-dasharray="4 4" opacity=".45"/>' +
        '<circle class="m" cx="460" cy="125" r="32" fill="#fff3d6" stroke="#f59e0b" stroke-width="2.5"/>' +
        '<text class="e" x="460" y="130" text-anchor="middle" font-family="system-ui,Arial" font-size="19" font-weight="700" fill="#14181f"></text></svg>' +
        '<div class="arac-yan"><label>Enlem<input type="range" min="0" max="70" step="1" value="36" aria-label="Enlem, derece"></label>' +
        '<div class="okuma">' + okuma('enlem', 'Enlem') + okuma('boy', 'Boy büyümesi') + okuma('alan', 'Alan büyümesi') + okuma('km', 'Haritadaki «200 km»') + '</div>' +
        '<p>Japonya 30°–46° arasında: kuzeyi, güneyine göre daha çok büyür. Kesikli daire gerçek boydur.</p></div>';
      var g = $('input', k);
      function c2() {
        var f = +g.value, kat = 1 / Math.cos(f * Math.PI / 180);
        $('.m', k).setAttribute('r', 32 * kat); $('.e', k).textContent = '×' + tr(kat, 2);
        yansit(k, { enlem: f + '° K', boy: '×' + tr(kat, 2), alan: '×' + tr(kat * kat, 2), km: 'yerde ≈ ' + bin(200 / kat) + ' km' });
      }
      g.addEventListener('input', c2); c2();
    },
    katman: function (k) {
      var KAT = [
        { id: 'kent', ad: 'Kentler (nokta)', renk: '#d71e1e', svg: '<g fill="#d71e1e" stroke="#fff" stroke-width="1.5"><circle cx="250" cy="96" r="7"/><circle cx="168" cy="126" r="6"/><circle cx="318" cy="70" r="6"/></g>' },
        { id: 'yol', ad: 'Yollar (çizgi)', renk: '#a05a78', svg: '<path d="M96 150C150 120 190 130 250 96S330 60 372 38M168 126l22 44" fill="none" stroke="#a05a78" stroke-width="3" stroke-linecap="round"/>' },
        { id: 'kentsel', ad: 'Kentsel alan (alan)', renk: '#f2d28a', svg: '<path d="M214 108q20-34 58-22 22 24-8 44-34 10-50-22z" fill="#f2d28a"/><ellipse cx="166" cy="128" rx="24" ry="14" fill="#f2d28a"/>', kapat: true, dar: true },
        { id: 'kara', ad: 'Kara (alan)', renk: '#e0e0e0', svg: '<path d="M70 168q20-50 96-62 40-30 96-48 60-34 124-36 14 16-10 38-40 26-70 60-50 40-110 52-70 22-126-4z" fill="#e0e0e0" stroke="#b9b9b9"/>', kapat: true },
        { id: 'deniz', ad: 'Deniz (alan)', renk: '#a5d0ee', svg: '<rect x="0" y="0" width="460" height="210" fill="#a5d0ee"/>', kapat: true, tam: true }
      ];
      k.innerHTML = '<h4>Katman sırası: üstteki alttakini örter <small>okla ya da tutup taşı</small></h4>' +
        '<svg viewBox="0 0 460 210" role="img" aria-label="Katman sırasına göre çizilen küçük harita"></svg>' +
        '<div class="arac-yan"><ol class="sira"></ol><div class="okuma">' + okuma('gizli', 'Örtülen katman') + '</div>' +
        '<p>QGIS, listeyi alttan üste çizer. Alan katmanı üstte kalırsa altındaki nokta ve çizgiler görünmez.</p></div>';
      var ol = $('.sira', k), svg = $('svg', k);
      function c3() {
        ol.innerHTML = KAT.map(function (t, i) {
          return '<li data-i="' + i + '"><i style="background:' + t.renk + '"></i><span>' + t.ad + '</span>' +
            '<button type="button" data-yon="-1" aria-label="' + t.ad + ' yukarı"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
            '<button type="button" data-yon="1" aria-label="' + t.ad + ' aşağı"' + (i === KAT.length - 1 ? ' disabled' : '') + '>↓</button></li>';
        }).join('');
        svg.innerHTML = KAT.slice().reverse().map(function (t) { return t.svg; }).join('');
        var gizli = [];
        KAT.forEach(function (t, i) {
          for (var j = 0; j < i; j++) {
            if (KAT[j].id === 'deniz' || (KAT[j].id === 'kara' && t.id !== 'deniz')) { gizli.push(t.ad.split(' (')[0]); break; }
          }
        });
        yansit(k, { gizli: gizli.length ? gizli.join(', ') : 'yok' });
      }
      function tasi(i, yon) {
        var j = i + yon;
        if (j < 0 || j >= KAT.length) return;
        var t = KAT[i]; KAT[i] = KAT[j]; KAT[j] = t; c3();
      }
      ol.addEventListener('click', function (o) {
        var b = o.target.closest('button');
        if (b) { var yeni = +b.closest('li').dataset.i + (+b.dataset.yon); tasi(+b.closest('li').dataset.i, +b.dataset.yon); var d = ol.children[yeni]; if (d) (d.querySelector('button[data-yon="' + b.dataset.yon + '"]:not(:disabled)') || d.querySelector('button:not(:disabled)')).focus(); }
      });
      /* tutup taşıma (fare + dokunma) */
      var tut = null;
      ol.addEventListener('pointerdown', function (o) {
        var li = o.target.closest('li');
        if (!li || o.target.closest('button')) return;
        tut = { i: +li.dataset.i, y: o.clientY, h: li.offsetHeight + 6 };
        li.classList.add('tutulan'); ol.setPointerCapture(o.pointerId);
      });
      ol.addEventListener('pointermove', function (o) {
        if (!tut) return;
        var fark = Math.round((o.clientY - tut.y) / tut.h);
        if (fark) { var yon = fark > 0 ? 1 : -1; tasi(tut.i, yon); tut.i = Math.max(0, Math.min(KAT.length - 1, tut.i + yon)); tut.y += yon * tut.h; ol.children[tut.i].classList.add('tutulan'); }
      });
      function bit() { tut = null; var t = $('.tutulan', ol); if (t) t.classList.remove('tutulan'); }
      ol.addEventListener('pointerup', bit); ol.addEventListener('pointercancel', bit);
      c3();
    },
    izgara: function (k) {
      k.innerHTML = '<h4>Izgara aralığı <small>bir aralık seç</small></h4>' +
        '<svg viewBox="92 470 1028 640" role="img" aria-label="Harita kesiti üzerinde seçilen aralıkta enlem ve boylam çizgileri">' +
        '<image href="img/harita-bitmis.webp" x="0" y="0" width="1200" height="1697" opacity=".55"/><g class="cizgi"></g></svg>' +
        '<div class="arac-yan"><div class="secenek" role="group" aria-label="Izgara aralığı">' +
        [1, 2, 5, 10].map(function (a) { return '<button type="button" data-a="' + a + '" aria-pressed="' + (a === 5) + '">' + a + '°</button>'; }).join('') + '</div>' +
        '<div class="okuma">' + okuma('boylam', 'Boylam çizgisi') + okuma('enlem', 'Enlem çizgisi') + okuma('yazi', 'Kenar yazısı') + '</div>' +
        '<p>1° çizgi kalabalığı yaratır, 10° konum vermez. Bu harita için 5° dengeli.</p></div>';
      var g = $('.cizgi', k);
      function X(lon) { return 112 + (lon - 130) * 63.667; }
      function Y(lat) { return 3479.4 - 3643.5 * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)); }
      function c4(a) {
        var s = '', nb = 0, ne = 0, lon, lat;
        for (lon = Math.ceil(129.7 / a) * a; lon <= 145.8; lon += a) { nb++; s += '<path d="M' + X(lon) + ' 178V1497"/>'; }
        for (lat = Math.ceil(29.9 / a) * a; lat <= 45.9; lat += a) { ne++; s += '<path d="M92 ' + Y(lat) + 'H1120"/>'; }
        g.innerHTML = '<g stroke="#1d4ed8" stroke-width="' + (a < 5 ? 2 : 3.5) + '" fill="none">' + s + '</g>';
        k.querySelectorAll('.secenek button').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.a === a)); });
        yansit(k, { boylam: String(nb), enlem: String(ne), yazi: String(2 * (nb + ne)) });
      }
      k.addEventListener('click', function (o) { var b = o.target.closest('[data-a]'); if (b) c4(+b.dataset.a); });
      c4(5);
    }
  };
  document.querySelectorAll('[data-arac]').forEach(function (k) { ARAC[k.dataset.arac](k); });

  /* çapa ile gelindiyse görseller yüklenince yeniden hizala */
  if (location.hash.length > 1) {
    window.addEventListener('load', function () { var h = document.getElementById(location.hash.slice(1)); if (h) h.scrollIntoView(); });
  }
})();
