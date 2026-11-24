// Sınav Atölyesi motoru (soru-cozum/ortak/sinav.js)
// Her dersin calis/index.html'i yükler; veri ../banka.json. Kanallar: test · dy · sayisal · yorum · fark · terim · bosluk · esle · sirala.
// Kipler: pratik (süzgeçli akış) · deneme (puanlı, süre isteğe bağlı) · yanlis (cihazda saklanan liste) · atlas (formül atlası).
(() => {
  'use strict';
  const d = document;
  const kok = d.getElementById('sinav');
  if (!kok) return;

  const KANAL_SIRA = ['test', 'dy', 'sayisal', 'yorum', 'fark', 'terim', 'bosluk', 'esle', 'sirala'];
  const KANAL_AD = { test: 'Mini test', dy: 'Doğru / Yanlış', sayisal: 'Sayısal', yorum: 'Sonucu yorumla', fark: 'Kavram farkı', terim: 'Formül terimi', bosluk: 'Boşluk doldur', esle: 'Eşleştir', sirala: 'Sırala' };
  const ZOR_AD = { 1: 'Kolay', 2: 'Orta', 3: 'Zor' };
  const KANAL_KISA = { test: 'Test', dy: 'D/Y', sayisal: 'Sayısal', yorum: 'Yorum', fark: 'Fark', terim: 'Terim', bosluk: 'Boşluk', esle: 'Eşleştir', sirala: 'Sırala' };
  const HARF = 'ABCDEFGH';
  const SVG = {
    fener: '<path d="M10 9.5h4l1.6 11.5H8.4z"/><path d="M6.5 21h11"/><path d="M9.3 9.5 12 5.5l2.7 4"/><path d="M12 5.5V3"/><path d="M3 5.5l3.6 1.7M21 5.5l-3.6 1.7M3 10.5l3.6-1M21 10.5l-3.6-1"/><path d="M9.2 14.5h5.6"/>',
    tik: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    carpi: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    asagi: '<path d="m6 9 6 6 6-6"/>',
    yukari: '<path d="m6 15 6-6 6 6"/>',
    sag: '<path d="m9 18 6-6-6-6"/>',
    sol: '<path d="m15 18-6-6 6-6"/>',
    saat: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.6 2.4M9.5 2.5h5"/>',
    yanlis: '<path d="M6 3h12v18l-6-4-6 4z"/><path d="m9.8 7.8 4.4 4.4M14.2 7.8l-4.4 4.4"/>',
    atlas: '<path d="M17 4.5H7l5.4 7.5L7 19.5h10"/>',
    yenile: '<path d="M20 11a8 8 0 1 0-2.4 5.7"/><path d="M20 4.5V11h-6.5"/>',
    goz: '<path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.7"/>',
    tekrar: '<path d="M4 11a8 8 0 1 1 2.4 5.7"/><path d="M4 4.5V11h6.5"/>',
    kitap: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19"/>',
    yorum: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
    bag: '<path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    bayrak: '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
  };
  const ikon = (ad, sinif) => `<svg class="${sinif || 'sv-i'}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${SVG[ad] || ''}</svg>`;

  // ---------- küçük yardımcılar
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const karistir = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  let KLASOR = 'ders';
  const depo = {
    al(k, v0) { try { const v = localStorage.getItem('sinav:' + KLASOR + ':' + k); return v ? JSON.parse(v) : v0; } catch (e) { return v0; } },
    koy(k, v) { try { localStorage.setItem('sinav:' + KLASOR + ':' + k, JSON.stringify(v)); } catch (e) { /* depolama kapalı: oturumla sınırlı */ } },
  };

  // ---------- matematik (KaTeX) ve metin
  const TEX_OPT = { throwOnError: false, strict: 'ignore', trust: (c) => c.command === '\\htmlClass' };
  function tex(t, blok) {
    if (window.katex) { try { return window.katex.renderToString(String(t), Object.assign({ displayMode: !!blok }, TEX_OPT)); } catch (e) { /* aşağıda düz göster */ } }
    return `<code class="sv-ham">${esc(t)}</code>`;
  }
  const UST = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻' };
  function sayiParca(x, bic) {
    if (typeof x !== 'number' || !Number.isFinite(x)) return null;
    if (bic != null && /^\d$/.test(bic)) return { m: x.toFixed(+bic), e: null };
    const anl = bic && bic[0] === 's' ? Math.max(1, +bic.slice(1)) : 4;
    if (x === 0) return { m: '0', e: null };
    const ax = Math.abs(x);
    if (ax >= 1e6 || ax < 1e-3) {
      let e = Math.floor(Math.log10(ax));
      let m = +(x / Math.pow(10, e)).toPrecision(anl);
      if (Math.abs(m) >= 10) { m = +(m / 10).toPrecision(anl); e += 1; }
      return { m: String(m), e };
    }
    return { m: String(+x.toPrecision(anl)), e: null };
  }
  function grupla(m) {
    const neg = m[0] === '-'; const [t, k] = m.replace('-', '').split('.');
    const tt = t.length > 4 ? t.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : t;
    return (neg ? '-' : '') + tt + (k != null ? '.' + k : '');
  }
  function sayiDuz(x, bic) {
    const p = sayiParca(x, bic); if (!p) return '—';
    const m = grupla(p.m).replace('.', ',').replace('-', '−');
    return p.e == null ? m : `${m} × 10${String(p.e).split('').map((c) => UST[c]).join('')}`;
  }
  function sayiTex(x, bic) {
    const p = sayiParca(x, bic); if (!p) return '?';
    const m = grupla(p.m).replace('.', '{,}').replace(/ /g, '\\,');
    return p.e == null ? m : `${m}\\times 10^{${p.e}}`;
  }
  // Yer tutucular: {P} → değişken, {=ifade|biçim} → hesap. TeX içinde süslü parantezle korunur.
  const YER_RE = /\{=([^{}]+?)\}|\{([A-Za-z_][A-Za-z0-9_]*)\}/g;
  function yerDoldur(s, deg, texMi) {
    return s.replace(YER_RE, (tam, ifade, ad) => {
      let v, bic = null;
      if (ifade != null) {
        const m = /\|(s?\d)\s*$/.exec(ifade);
        if (m) { bic = m[1]; ifade = ifade.slice(0, m.index); }
        try { v = hesapla(ifade, deg); } catch (e) { return tam; }
        if (typeof v === 'string') return texMi ? `\\text{${v}}` : v;
      } else {
        if (!deg[ad]) return tam;
        v = deg[ad].v; bic = deg[ad].b;
      }
      return texMi ? `{${sayiTex(v, bic)}}` : sayiDuz(v, bic);
    });
  }
  function duz(s, deg) {
    if (deg) s = yerDoldur(s, deg, false);
    return esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
  }
  function metin(s, deg) {
    s = String(s == null ? '' : s).replace(/\\\$/g, '\u0001');
    const re = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g;
    let m, son = 0, out = '';
    while ((m = re.exec(s))) {
      out += duz(s.slice(son, m.index), deg);
      const t = m[1] != null ? m[1] : m[2];
      out += tex(deg ? yerDoldur(t, deg, true) : t, m[1] != null);
      son = re.lastIndex;
    }
    out += duz(s.slice(son), deg);
    return out.replace(/\u0001/g, '$');
  }

  // ---------- sayısal: değişken seçimi ve ifade hesabı
  const YAR = { ln: Math.log, log10: Math.log10, sqrt: Math.sqrt, exp: Math.exp, pow: Math.pow, abs: Math.abs, min: Math.min, max: Math.max, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, PI: Math.PI, round: Math.round, floor: Math.floor, ceil: Math.ceil };
  const fnBellek = new Map();
  function hesapla(ifade, deg) {
    const adlar = Object.keys(deg);
    const yar = Object.keys(YAR).filter((k) => !(k in deg));
    const anahtar = ifade + '\u0002' + adlar.join(',');
    let f = fnBellek.get(anahtar);
    if (!f) { f = new Function('Math', ...yar, ...adlar, 'return (' + ifade + ');'); fnBellek.set(anahtar, f); }
    return f(Math, ...yar.map((k) => YAR[k]), ...adlar.map((k) => deg[k].v));
  }
  function ondalik(n) { const s = String(n); if (/e-/i.test(s)) return +s.split(/e-/i)[1]; const i = s.indexOf('.'); return i < 0 ? 0 : s.length - i - 1; }
  function degerSec(q, onceki) {
    let son = null;
    for (let deneme = 0; deneme < 300; deneme++) {
      const deg = {};
      for (const [ad, a] of Object.entries(q.degisken || {})) {
        if (Array.isArray(a.liste) && a.liste.length) { const v = a.liste[Math.floor(Math.random() * a.liste.length)]; deg[ad] = { v, b: String(ondalik(v)) }; continue; }
        const adim = a.adim > 0 ? a.adim : 1;
        const ond = Math.max(ondalik(adim), ondalik(a.min));
        const n = Math.max(0, Math.floor((a.max - a.min) / adim + 1e-9));
        deg[ad] = { v: +(a.min + Math.floor(Math.random() * (n + 1)) * adim).toFixed(ond), b: String(ond) };
      }
      try {
        for (const [ad, ifade] of Object.entries(q.ara || {})) deg[ad] = { v: hesapla(ifade, deg), b: null };
        if (q.kosul && !hesapla(q.kosul, deg)) continue;
        if (!Number.isFinite(hesapla(q.cevap, deg))) continue;
      } catch (e) { return deg; }
      son = deg;
      if (onceki && Object.keys(q.degisken || {}).every((k) => onceki[k] && onceki[k].v === deg[k].v) && deneme < 20) continue;
      return deg;
    }
    return son || {};
  }
  function sayiOku(s) {
    s = String(s || '').trim().replace(/[\s  ]/g, '').replace(/[−–]/g, '-');
    if (!s) return null;
    s = s.replace(/[×x*·]10\^?\(?([+-]?\d+)\)?$/i, 'e$1');
    if (s.includes(',') && s.includes('.')) s = s.replace(/\./g, '').replace(',', '.');
    else s = s.replace(',', '.');
    const v = Number(s);
    return Number.isFinite(v) ? v : NaN;
  }
  const norm = (s) => String(s == null ? '' : s).replace(/∆/g, 'Δ').toLocaleLowerCase('tr').normalize('NFC').replace(/(\d),(\d)/g, '$1.$2').replace(/\s+/g, ' ').replace(/^[\s.,;:!?"'«»]+|[\s.,;:!?"'«»]+$/g, '');
  const katla = (s) => norm(s).replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[âà]/g, 'a').replace(/î/g, 'i').replace(/û/g, 'u').replace(/[\s-]/g, '');

  // ---------- veri
  let B = null, ana = null, aktif = null, denemeZaman = 0;
  const KONU = new Map(), FORM = new Map(), KAYNAK = new Map(), SORU = new Map();
  let YANLIS = {}, DURUM = {};
  const S = { mod: 'pratik', kanal: 'hepsi', konu: 'hepsi', zorluk: 0, liste: [], i: 0, oturum: { d: 0, y: 0 }, deneme: null, atlas: { f: null, t: null }, ayar: { n: 20, sure: 30 } };

  kok.innerHTML = '<p class="sv-yukle">Sorular hazırlanıyor…</p>';
  fetch(kok.dataset.banka || '../banka.json', { cache: 'no-cache' })
    .then((r) => { if (!r.ok) throw new Error('banka ' + r.status); return r.json(); })
    .then(basla)
    .catch((e) => { kok.innerHTML = '<p class="sv-hata-m">Soru bankası açılamadı. Sayfayı yenile ya da biraz sonra yeniden dene.</p>'; if (window.console) console.warn(e); });

  function basla(b) {
    B = b; KLASOR = b.klasor || 'ders';
    (b.konular || []).forEach((k) => KONU.set(k.id, k));
    (b.formuller || []).forEach((f) => FORM.set(f.id, f));
    (b.kaynaklar || []).forEach((k) => KAYNAK.set(k.id, k));
    B.sorular = (b.sorular || []).filter((q) => q && KANAL[q.kanal] && q.id);
    B.sorular.forEach((q) => SORU.set(q.id, q));
    YANLIS = depo.al('yanlis', {}) || {}; DURUM = depo.al('durum', {}) || {};
    for (const id of Object.keys(YANLIS)) if (!SORU.has(id)) delete YANLIS[id];
    const sec = depo.al('secim', null);
    if (sec) {
      if (sec.kanal === 'hepsi' || KANAL_AD[sec.kanal]) S.kanal = sec.kanal;
      if (sec.konu === 'hepsi' || KONU.has(sec.konu)) S.konu = sec.konu;
      if ([0, 1, 2, 3].includes(sec.zorluk)) S.zorluk = sec.zorluk;
    }
    const ay = depo.al('ayar', null); if (ay && ay.n) S.ayar = ay;
    iskelet();
    hashIsle(true);
    addEventListener('hashchange', () => hashIsle(false));
    d.addEventListener('keydown', tus);
    d.addEventListener('click', (e) => { if (!e.target.closest('.sv-sec')) panelKapat(); });
    window.__sinav = { S, B, hesapla, degerSec, sayiOku, sayiDuz, metin, aktif: () => aktif }; // sınama kancası
  }

  // ---------- iskelet ve üst seçiciler
  function iskelet() {
    const geri = kok.dataset.geri || '../', geriAd = kok.dataset.geriAd || 'Çözümlere dön', ust = kok.dataset.kok || '../../';
    const dd = (s, e) => `<div class="sv-sec" data-s="${s}"><button type="button" class="sv-dd" aria-haspopup="true" aria-expanded="false"><span class="sv-dd-e">${e}</span><span class="sv-dd-d"></span>${ikon('asagi', 'sv-i sv-dd-o')}</button><div class="sv-panel" hidden></div></div>`;
    kok.innerHTML = `<header class="sv-ust">
<div class="sv-bas"><a class="sv-geri" href="${esc(geri)}">${ikon('sol')}<span>${esc(geriAd)}</span></a><p class="sv-kod">${esc(B.ders || '')} · Sınav atölyesi</p></div>
<h1 class="sv-h1">${esc(B.ad || '')}</h1>
<div class="sv-secim" role="toolbar" aria-label="Soru seçimi">
<div class="sv-suz">${dd('kanal', 'Kanal')}${dd('konu', 'Konu')}${dd('zorluk', 'Zorluk')}</div>
<div class="sv-modlar"><button type="button" class="sv-mod" data-m="deneme" aria-pressed="false">${ikon('saat')}<span>Deneme sınavı</span></button><button type="button" class="sv-mod" data-m="yanlis" aria-pressed="false">${ikon('yanlis')}<span>Yanlışlarım</span><span class="sv-rozet" hidden></span></button><button type="button" class="sv-mod" data-m="atlas" aria-pressed="false">${ikon('atlas')}<span>Formül atlası</span></button></div>
</div></header>
<main class="sv-ana" id="sv-ana" tabindex="-1"></main>
<footer class="sv-alt"><a href="${esc(geri)}">${esc(geriAd)}</a> · <a href="${esc(ust)}">Soru çözümleri</a> · <a href="${esc(ust)}../">Atmosfer Akademisi</a></footer>`;
    ana = kok.querySelector('.sv-ana');
    const ustEl = kok.querySelector('.sv-ust');
    ustEl.addEventListener('click', (e) => {
      const dug = e.target.closest('.sv-dd');
      if (dug) { const sec = dug.parentElement; panelAc(sec, dug.getAttribute('aria-expanded') !== 'true'); return; }
      const se = e.target.closest('[data-sec]');
      if (se) { secimYap(se.closest('.sv-sec').dataset.s, se.dataset.sec); return; }
      const m = e.target.closest('.sv-mod');
      if (m) {
        const k = m.dataset.m;
        if (S.mod === k) { if (k === 'deneme' && S.deneme && !S.deneme.bitti) return; pratik(); return; }
        if (k === 'deneme') denemeAc(); else if (k === 'atlas') atlasAc(); else modYanlis();
      }
    });
    ana.addEventListener('click', anaTik);
    ana.addEventListener('change', (e) => { if (e.target.id === 'sv-a-s') atlasAc(e.target.value); });
  }
  function sayac(alan) {
    const say = {};
    for (const q of B.sorular) {
      if (alan !== 'kanal' && S.kanal !== 'hepsi' && q.kanal !== S.kanal) continue;
      if (alan !== 'konu' && S.konu !== 'hepsi' && q.konu !== S.konu) continue;
      if (alan !== 'zorluk' && S.zorluk && q.zorluk !== S.zorluk) continue;
      const k = alan === 'kanal' ? q.kanal : alan === 'konu' ? q.konu : q.zorluk;
      say[k] = (say[k] || 0) + 1; say.__ = (say.__ || 0) + 1;
    }
    return say;
  }
  const secDug = (v, ad, n, ak) => `<button type="button" class="sv-se" data-sec="${esc(v)}" aria-pressed="${ak}"${n ? '' : ' disabled'}><span>${ad}</span><span class="sv-se-n">${n || 0}</span></button>`;
  function panelIcerik(s) {
    const say = sayac(s);
    if (s === 'kanal') return secDug('hepsi', 'Karışık (tüm kanallar)', say.__, S.kanal === 'hepsi') + KANAL_SIRA.filter((k) => B.sorular.some((q) => q.kanal === k)).map((k) => secDug(k, KANAL_AD[k], say[k], S.kanal === k)).join('');
    if (s === 'zorluk') return secDug('0', 'Tümü', say.__, !S.zorluk) + [1, 2, 3].map((z) => secDug(String(z), `${z} · ${ZOR_AD[z]}`, say[z], S.zorluk === z)).join('');
    // konu: haftaya göre iç içe
    const konular = B.konular || [];
    const gruplar = new Map();
    for (const k of konular) { const g = k.hafta != null ? `${k.hafta}. hafta` : 'Diğer'; if (!gruplar.has(g)) gruplar.set(g, []); gruplar.get(g).push(k); }
    let h = secDug('hepsi', 'Tüm konular', say.__, S.konu === 'hepsi');
    if (gruplar.size <= 1) return h + konular.map((k) => secDug(k.id, esc(k.ad), say[k.id], S.konu === k.id)).join('');
    for (const [g, ks] of gruplar) {
      const top = ks.reduce((t, k) => t + (say[k.id] || 0), 0);
      const acik = ks.some((k) => k.id === S.konu);
      h += `<details class="sv-grup"${acik ? ' open' : ''}><summary><span>${esc(g)}</span><span class="sv-se-n">${top}</span></summary>${ks.map((k) => secDug(k.id, esc(k.ad), say[k.id], S.konu === k.id)).join('')}</details>`;
    }
    return h;
  }
  function panelAc(sec, ac) {
    panelKapat(sec);
    const dug = sec.querySelector('.sv-dd'), p = sec.querySelector('.sv-panel');
    if (ac) { p.innerHTML = panelIcerik(sec.dataset.s); p.hidden = false; dug.setAttribute('aria-expanded', 'true'); const b = p.querySelector('[aria-pressed="true"]') || p.querySelector('button'); if (b) b.focus({ preventScroll: true }); }
    else { p.hidden = true; dug.setAttribute('aria-expanded', 'false'); }
  }
  function panelKapat(haric) {
    let kapandi = false;
    kok.querySelectorAll('.sv-sec').forEach((s) => { if (s === haric) return; const p = s.querySelector('.sv-panel'); if (p && !p.hidden) { p.hidden = true; s.querySelector('.sv-dd').setAttribute('aria-expanded', 'false'); kapandi = true; } });
    return kapandi;
  }
  function secimYap(s, v) {
    if (s === 'zorluk') S.zorluk = +v; else S[s] = v;
    depo.koy('secim', { kanal: S.kanal, konu: S.konu, zorluk: S.zorluk });
    panelKapat();
    if (S.mod !== 'yanlis') S.mod = 'pratik';
    S.liste = listeKur(); S.i = 0;
    ustGuncelle(); goster();
    const dug = kok.querySelector(`.sv-sec[data-s="${s}"] .sv-dd`); if (dug) dug.focus({ preventScroll: true });
  }
  function ustGuncelle() {
    const etiket = { kanal: S.kanal === 'hepsi' ? 'Karışık' : KANAL_AD[S.kanal], konu: S.konu === 'hepsi' ? 'Tümü' : (KONU.get(S.konu) || {}).ad || S.konu, zorluk: S.zorluk ? `${S.zorluk} · ${ZOR_AD[S.zorluk]}` : 'Tümü' };
    const kisa = { kanal: S.kanal === 'hepsi' ? 'Karışık' : KANAL_KISA[S.kanal], konu: etiket.konu, zorluk: S.zorluk ? ZOR_AD[S.zorluk] : 'Tümü' };
    kok.querySelectorAll('.sv-sec').forEach((s) => { const k = s.dataset.s; s.querySelector('.sv-dd-d').innerHTML = `<span class="sv-uzun">${esc(etiket[k])}</span><span class="sv-kisa">${esc(kisa[k])}</span>`; s.querySelector('.sv-dd').setAttribute('aria-label', `${s.querySelector('.sv-dd-e').textContent}: ${etiket[k]}`); s.classList.toggle('sv-sec-on', k === 'kanal' ? S.kanal !== 'hepsi' : k === 'konu' ? S.konu !== 'hepsi' : !!S.zorluk); });
    kok.querySelectorAll('.sv-mod').forEach((b) => b.setAttribute('aria-pressed', String(S.mod === b.dataset.m)));
    const n = Object.keys(YANLIS).length, r = kok.querySelector('.sv-rozet');
    if (r) { r.hidden = !n; r.textContent = n; }
  }
  function listeKur() {
    let l = B.sorular.filter((q) => (S.kanal === 'hepsi' || q.kanal === S.kanal) && (S.konu === 'hepsi' || q.konu === S.konu) && (!S.zorluk || q.zorluk === S.zorluk));
    if (S.mod === 'yanlis') l = l.filter((q) => YANLIS[q.id]);
    if (S.kanal === 'hepsi') { // kanalları sırayla karıştır: arka arkaya aynı kanal gelmesin
      const g = {}; l.forEach((q) => (g[q.kanal] = g[q.kanal] || []).push(q));
      const out = []; const ks = KANAL_SIRA.filter((k) => g[k]);
      for (let i = 0; out.length < l.length; i++) for (const k of ks) if (g[k][i]) out.push(g[k][i]);
      l = out;
    }
    return l;
  }

  // ---------- adres
  function hashYaz(h) { const yeni = h ? '#' + h : location.pathname + location.search; if (h && location.hash === '#' + h) return; try { history.replaceState(null, '', yeni); } catch (e) { /* dosya kipinde */ } }
  function hashIsle(ilk) {
    let h = location.hash.slice(1);
    try { h = decodeURIComponent(h); } catch (e) { /* bozuk adres */ }
    if (!h) { if (ilk) pratik(); return; }
    if (h === 'deneme') return denemeAc();
    if (h === 'yanlis') return modYanlis();
    if (h === 'atlas' || h.indexOf('atlas/') === 0) { const p = h.split('/'); return atlasAc(p[1], p[2]); }
    if (SORU.has(h)) return soruAc(h);
    if (ilk) pratik();
  }
  function soruAc(id) {
    const q = SORU.get(id);
    S.mod = 'pratik';
    let l = listeKur();
    if (!l.includes(q)) { S.kanal = 'hepsi'; S.konu = 'hepsi'; S.zorluk = 0; l = listeKur(); }
    S.liste = l; S.i = Math.max(0, l.indexOf(q));
    ustGuncelle(); goster(true);
  }
  function pratik() { S.mod = 'pratik'; const q = S.liste[S.i]; S.liste = listeKur(); S.i = Math.max(0, S.liste.indexOf(q)); ustGuncelle(); goster(); }
  function modYanlis() { S.mod = 'yanlis'; S.liste = listeKur(); S.i = 0; ustGuncelle(); goster(); }

  // ---------- ana alan
  function goster(odakla) {
    clearInterval(denemeZaman);
    aktif = null;
    if (S.mod === 'atlas') return atlasCiz();
    if (S.mod === 'deneme') return denemeCiz();
    const l = S.liste;
    if (!l.length) {
      ana.innerHTML = S.mod === 'yanlis'
        ? `<section class="sv-bosm"><h2>Yanlışlarım boş</h2><p>Pratikte ya da deneme sınavında yanlış yaptığın sorular burada toplanır; doğru çözünce listeden çıkar.</p><button type="button" class="sv-dug" data-e="pratik">Pratiğe dön</button></section>`
        : `<section class="sv-bosm"><h2>Bu seçimde soru yok</h2><p>Kanal, konu ya da zorluk seçimini genişlet.</p><button type="button" class="sv-dug" data-e="sifirla">Seçimi sıfırla</button></section>`;
      hashYaz(S.mod === 'yanlis' ? 'yanlis' : '');
      return;
    }
    S.i = Math.min(Math.max(0, S.i), l.length - 1);
    const q = l[S.i];
    ana.innerHTML = `<div class="sv-izgara"><section class="sv-sahne" aria-label="Soru"><div class="sv-gez"><p class="sv-sira">${S.mod === 'yanlis' ? 'Yanlışlarım · ' : ''}<b>${S.i + 1}</b> / ${l.length}</p></div></section>${yanHtml(q)}</div>`;
    const sahne = ana.querySelector('.sv-sahne');
    aktif = kartKur(q, { mod: 'pratik', kap: sahne });
    hashYaz(q.id);
    if (odakla !== false) gorunurYap(odakla === true);
  }
  function gorunurYap(zorla) {
    const r = ana.getBoundingClientRect();
    if (zorla || r.top < 0) ana.scrollIntoView({ block: 'start' });
    try { ana.focus({ preventScroll: true }); } catch (e) { ana.focus(); }
  }
  function yanHtml(q) {
    const konu = KONU.get(q.konu);
    const dogruSay = Object.keys(DURUM).filter((id) => DURUM[id] === 1 && SORU.has(id)).length;
    const baglar = bagListe(q);
    return `<aside class="sv-yan" aria-label="Oturum">
<section><h2 class="sv-etiket">Bu oturum</h2><p class="sv-oturum"><b class="ok">${S.oturum.d}</b> doğru · <b class="hata">${S.oturum.y}</b> yanlış</p><p class="sv-ilerleme"><span class="sv-cubuk"><i style="width:${(100 * dogruSay / Math.max(1, B.sorular.length)).toFixed(1)}%"></i></span>${dogruSay} / ${B.sorular.length} soru en az bir kez doğru</p></section>
${konu ? `<section><h2 class="sv-etiket">Konu</h2><p class="sv-yan-k">${esc(konu.ad)}${konu.hafta != null ? ` <span class="sv-soluk">· ${esc(konu.hafta)}. hafta</span>` : ''}</p>${baglar}</section>` : ''}
<section class="sv-klavye"><h2 class="sv-etiket">Klavye</h2><ul><li><kbd>1</kbd>–<kbd>4</kbd> şık seç</li><li><kbd>Enter</kbd> kontrol</li><li><kbd>→</kbd> sonraki · <kbd>←</kbd> önceki</li><li><kbd>F</kbd> bilgi feneri</li></ul></section>
</aside>`;
  }
  function bagListe(q) {
    const g = new Set(), out = [];
    const ekle = (b) => { if (b && b.url && !g.has(b.url)) { g.add(b.url); out.push(b); } };
    (q.bag || []).forEach(ekle); ((KONU.get(q.konu) || {}).bag || []).forEach(ekle);
    return out.length ? `<ul class="sv-baglar">${out.map((b) => `<li><a href="${esc(b.url)}" target="_blank" rel="noopener">${ikon('bag')}<span>${esc(b.ad)}</span></a></li>`).join('')}</ul>` : '';
  }
  function kaynakHtml(k) {
    if (!k) return '';
    const m = /^\s*([A-Za-z0-9_-]+)\s*[·,:]?\s*(.*)$/.exec(String(k));
    let t;
    if (m && KAYNAK.has(m[1])) t = esc(KAYNAK.get(m[1]).kunye) + (m[2] ? ' · ' + esc(m[2]) : '');
    else t = esc(String(k).replace(/^\s*ders\b/i, 'Ders içeriği'));
    return `<p class="sv-kay">${ikon('kitap')}<span><span class="sv-soluk">Kaynak:</span> ${t}</span></p>`;
  }

  function anaTik(e) {
    const b = e.target.closest('[data-e]');
    if (b && ana.contains(b)) {
      const k = b.dataset.e;
      if (k === 'pratik') return pratik();
      if (k === 'sifirla') { S.kanal = 'hepsi'; S.konu = 'hepsi'; S.zorluk = 0; depo.koy('secim', { kanal: 'hepsi', konu: 'hepsi', zorluk: 0 }); return pratik(); }
      if (k === 'konu-git') { S.mod = 'pratik'; S.kanal = 'hepsi'; S.konu = b.dataset.konu; S.zorluk = 0; S.liste = listeKur(); S.i = 0; ustGuncelle(); return goster(true); }
      if (aktif && aktif.eylem && aktif.eylem(k, b)) return;
      if (k.indexOf('d-') === 0 || k === 'basla' || k === 'bitir' || k === 'yeni-deneme' || k === 'yanlislara' || k === 'incele' || k === 'sonuca') return denemeEylem(k, b);
    }
    const t = e.target.closest('.sv-t, .sv-a-tb');
    if (t && S.mod === 'atlas') {
      const i = t.dataset.t != null ? +t.dataset.t : +((/sv-t(\d+)/.exec(t.className) || [])[1]);
      if (Number.isFinite(i)) { const f = FORM.get(S.atlas.f); S.atlas.t = ((f.terimler || [])[i] || {}).s; atlasCiz(true); }
      return;
    }
    const fb = e.target.closest('[data-f]');
    if (fb && S.mod === 'atlas') atlasAc(fb.dataset.f);
  }

  // ---------- soru kartı
  function kartKur(q, ayar) {
    const sinavda = ayar.mod === 'deneme', inceleme = ayar.mod === 'inceleme';
    let deg = q.kanal === 'sayisal' ? (ayar.deg || degerSec(q)) : null;
    let g = KANAL[q.kanal](q, deg);
    let cozuldu = false;
    const art = d.createElement('article');
    art.className = 'sv-kart';
    art.dataset.kanal = q.kanal; art.dataset.id = q.id;
    const konu = KONU.get(q.konu);
    const kafa = `<header class="sv-kb"><span class="sv-kanal">${KANAL_AD[q.kanal]}</span>${konu ? `<span class="sv-konu">${esc(konu.ad)}</span>` : ''}<span class="sv-zor" role="img" aria-label="Zorluk ${q.zorluk || 1} / 3" title="Zorluk: ${ZOR_AD[q.zorluk] || ''}">${[1, 2, 3].map((i) => `<i class="${i <= (q.zorluk || 1) ? 'on' : ''}"></i>`).join('')}</span>${sinavda ? '' : `<a class="sv-id" href="#${esc(q.id)}" title="Bu sorunun adresi">#${esc(q.id)}</a>`}</header>`;
    const eylem = sinavda ? '' : inceleme
      ? `<div class="sv-eylem"><button type="button" class="sv-dug" data-e="sonuca">${ikon('sol')}<span>Sonuçlara dön</span></button><span class="sv-ara"></span>${ayar.sonrakiYanlis ? `<button type="button" class="sv-dug sv-ana-dug" data-e="incele" data-id="${esc(ayar.sonrakiYanlis)}"><span>Sonraki yanlış</span>${ikon('sag')}</button>` : ''}</div>`
      : `<div class="sv-eylem"><button type="button" class="sv-dug sv-ana-dug" data-e="kontrol">${ikon('tik')}<span class="sv-ke">Kontrol</span></button><button type="button" class="sv-dug sv-fener-d" data-e="fener" aria-expanded="false" title="Bilgi feneri (F)">${ikon('fener')}<span class="sv-et">Bilgi feneri</span></button>${q.kanal === 'sayisal' ? `<button type="button" class="sv-dug" data-e="yeni" title="Yeni sayılar">${ikon('yenile')}<span class="sv-et">Yeni sayılar</span></button>` : ''}<button type="button" class="sv-dug sv-ikinci" data-e="goster" title="Çözümü göster">${ikon('goz')}<span class="sv-et">Çözümü göster</span></button><span class="sv-ara"></span><button type="button" class="sv-dug sv-ok-d" data-e="once" aria-label="Önceki soru" title="Önceki (←)">${ikon('sol')}</button><button type="button" class="sv-dug sv-ok-d" data-e="sonra" aria-label="Sonraki soru" title="Sonraki (→)">${ikon('sag')}</button></div>`;
    art.innerHTML = `${kafa}<div class="sv-govde">${g.html}</div><p class="sv-uyari" role="status" hidden></p>${sinavda ? '' : `<div class="sv-fener" hidden><p class="sv-fener-b">${ikon('fener')}<span>Bilgi feneri</span></p><div class="sv-fener-m">${metin(q.fener, deg)}</div></div><div class="sv-sonuc" aria-live="polite" hidden></div>`}${eylem}${sinavda ? '' : `<footer class="sv-kf">${kaynakHtml(q.kaynak)}${bagListe(q)}</footer>`}`;
    ayar.kap.appendChild(art);
    const govde = art.querySelector('.sv-govde');
    g.bagla(govde);
    const uyariEl = art.querySelector('.sv-uyari');
    const uyar = (m) => { uyariEl.textContent = m; uyariEl.hidden = !m; };
    if (ayar.cevap != null) g.koy(ayar.cevap);

    function sonucYaz(s, c) {
      const el = art.querySelector('.sv-sonuc');
      const bas = s.goster ? `${ikon('goz')}<span>Çözüm</span>` : s.tam ? `${ikon('tik')}<span>Doğru</span>` : s.bos ? `${ikon('carpi')}<span>Boş bırakıldı</span>` : s.puan > 0 ? `${ikon('carpi')}<span>Kısmen doğru · ${esc(s.ayrinti || '')}</span>` : `${ikon('carpi')}<span>Yanlış</span>`;
      el.className = 'sv-sonuc ' + (s.goster ? 'notr' : s.tam ? 'ok' : 'hata');
      el.innerHTML = `<p class="sv-s-b">${bas}</p>${g.dogru(c, s)}${q.aciklama ? `<div class="sv-acik"><h3>Neden?</h3><div>${metin(q.aciklama, deg)}</div></div>` : ''}${g.ek ? g.ek() : ''}${s.cikti ? `<p class="sv-not">${ikon('tik')}Bu soru Yanlışlarım listesinden çıktı.</p>` : ''}${!inceleme ? `<p class="sv-s-alt"><button type="button" class="sv-dug sv-ikinci" data-e="tekrar">${ikon('tekrar')}<span>Yeniden dene</span></button></p>` : ''}`;
      el.hidden = false;
    }
    function kilitle() { art.classList.add('kilit'); }
    function kontrol() {
      if (cozuldu) return sonraki();
      const c = g.al();
      if (c == null) { uyar(q.kanal === 'sayisal' ? 'Önce cevabını yaz.' : q.kanal === 'sirala' ? 'Önce adımları sırala.' : 'Önce bir cevap seç.'); return; }
      const s = g.denetle(c);
      if (s.okunamadi) { uyar('Sayıyı okuyamadım: 12,5 ya da 1,2e3 biçiminde yaz.'); return; }
      uyar('');
      cozuldu = true; kilitle();
      g.isaretle(c, s);
      s.cikti = izle(q, s.tam);
      sonucYaz(s, c);
      const kd = art.querySelector('[data-e="kontrol"]');
      if (kd) { kd.innerHTML = `<span class="sv-ke">Sonraki</span>${ikon('sag')}`; kd.focus({ preventScroll: true }); }
      const yan = ana.querySelector('.sv-yan'); if (yan) yan.outerHTML = yanHtml(q);
    }
    function cozumGoster() {
      if (cozuldu) return;
      cozuldu = true; kilitle(); uyar('');
      g.isaretle(null, { goster: true });
      sonucYaz({ goster: true }, null);
      const kd = art.querySelector('[data-e="kontrol"]');
      if (kd) kd.innerHTML = `<span class="sv-ke">Sonraki</span>${ikon('sag')}`;
    }
    function fener() {
      const f = art.querySelector('.sv-fener'), b = art.querySelector('[data-e="fener"]');
      if (!f || !b) return;
      f.hidden = !f.hidden; b.setAttribute('aria-expanded', String(!f.hidden));
    }
    function yenidenKur(yeniDeg) {
      const k = ayar.kap; art.remove();
      const yeni = kartKur(q, Object.assign({}, ayar, { deg: yeniDeg, cevap: null }));
      aktif = yeni; const fe = yeni.el.querySelector('.sv-govde input, .sv-govde button'); if (fe) fe.focus({ preventScroll: true }); void k;
    }
    function sonraki() { if (sinavda || inceleme) return; S.i = (S.i + 1) % S.liste.length; goster(); }
    function onceki() { if (sinavda || inceleme) return; S.i = (S.i - 1 + S.liste.length) % S.liste.length; goster(); }
    const kontrolcu = {
      el: art, q, deg: () => deg, al: () => g.al(),
      enter(t) { if (t && t.matches && t.matches('.sv-sik[aria-pressed="false"], .sv-f-b[aria-pressed="false"]')) { t.click(); return; } if (sinavda) return; if (inceleme) return; kontrol(); },
      sonraki, onceki, fener,
      tus: (k) => (!cozuldu || sinavda) && g.tus ? g.tus(k) : false,
      eylem(k, b) {
        if (k === 'kontrol') { kontrol(); return true; }
        if (k === 'fener') { fener(); return true; }
        if (k === 'goster') { cozumGoster(); return true; }
        if (k === 'yeni') { yenidenKur(degerSec(q, deg)); return true; }
        if (k === 'tekrar') { yenidenKur(deg); return true; }
        if (k === 'sonra') { sonraki(); return true; }
        if (k === 'once') { onceki(); return true; }
        void b; return false;
      },
      notla() { // deneme sonunda / incelemede
        const c = g.al();
        const s = c == null ? { tam: false, puan: 0, bos: true } : g.denetle(c);
        return s.okunamadi ? { tam: false, puan: 0, okunamadi: true } : s;
      },
      incele(c) { cozuldu = true; kilitle(); const s = c == null ? { tam: false, puan: 0, bos: true } : g.denetle(c); g.isaretle(c, s.okunamadi ? { tam: false } : s); sonucYaz(s, c); },
    };
    return kontrolcu;
  }

  // Yanlış / doğru izleme: cihazda saklanır
  function izle(q, tam) {
    let cikti = false;
    DURUM[q.id] = tam ? 1 : (DURUM[q.id] === 1 ? 1 : 0);
    if (tam) { S.oturum.d++; if (YANLIS[q.id]) { delete YANLIS[q.id]; cikti = true; } } else { S.oturum.y++; YANLIS[q.id] = (YANLIS[q.id] || 0) + 1; }
    depo.koy('durum', DURUM); depo.koy('yanlis', YANLIS); ustGuncelle();
    return cikti;
  }

  // ---------- kanallar
  function secenekli(q) {
    let secili = null, kap = null;
    const n = (q.secenekler || []).length;
    let ust = '';
    if (q.kanal === 'yorum') ust = `<div class="sv-durum"><p class="sv-etiket">Durum</p><div>${metin(q.durum)}</div></div>`;
    if (q.kanal === 'terim') ust = terimUst(q);
    const sec = (i) => { secili = i; kap.querySelectorAll('.sv-sik').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.i === i))); };
    return {
      html: `${ust}<div class="sv-soru">${metin(q.soru)}</div><div class="sv-siklar" role="group" aria-label="Şıklar">${(q.secenekler || []).map((s, i) => `<button type="button" class="sv-sik" data-i="${i}" aria-pressed="false"><span class="sv-harf" aria-hidden="true">${HARF[i]}</span><span class="sv-sik-m">${metin(s)}</span></button>`).join('')}</div>`,
      bagla(k) { kap = k; k.addEventListener('click', (e) => { const b = e.target.closest('.sv-sik'); if (b && !k.closest('.kilit')) sec(+b.dataset.i); }); },
      al: () => secili,
      koy: (c) => { if (c != null) sec(c); },
      denetle: (c) => { const t = c === q.dogru; return { tam: t, puan: t ? 1 : 0 }; },
      isaretle(c) { kap.querySelectorAll('.sv-sik').forEach((b) => { const i = +b.dataset.i; b.classList.toggle('ok', i === q.dogru); b.classList.toggle('hata', i === c && i !== q.dogru); }); },
      dogru: () => `<p class="sv-dc">Doğru cevap: <b>${HARF[q.dogru] || '?'}</b> · ${metin((q.secenekler || [])[q.dogru])}</p>`,
      tus(k) { const i = +k - 1; if (/^[1-9]$/.test(k) && i < n) { sec(i); return true; } return false; },
    };
  }
  function dyKur(q) {
    let secili = null, kap = null;
    const sec = (v) => { secili = v; kap.querySelectorAll('.sv-sik').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.v === '1') === v))); };
    return {
      html: `<p class="sv-etiket">Bu ifade doğru mu?</p><div class="sv-ifade">${metin(q.ifade)}</div><div class="sv-dy" role="group" aria-label="Doğru ya da yanlış"><button type="button" class="sv-sik sv-dyb" data-v="1" aria-pressed="false">${ikon('tik')}<span>Doğru</span></button><button type="button" class="sv-sik sv-dyb" data-v="0" aria-pressed="false">${ikon('carpi')}<span>Yanlış</span></button></div>`,
      bagla(k) { kap = k; k.addEventListener('click', (e) => { const b = e.target.closest('.sv-sik'); if (b && !k.closest('.kilit')) sec(b.dataset.v === '1'); }); },
      al: () => secili,
      koy: (c) => { if (c != null) sec(!!c); },
      denetle: (c) => { const t = c === !!q.dogru; return { tam: t, puan: t ? 1 : 0 }; },
      isaretle(c) { kap.querySelectorAll('.sv-sik').forEach((b) => { const v = b.dataset.v === '1'; b.classList.toggle('ok', v === !!q.dogru); b.classList.toggle('hata', v === c && v !== !!q.dogru); }); },
      dogru: () => `<p class="sv-dc">Bu ifade <b>${q.dogru ? 'doğru' : 'yanlış'}</b>.</p>`,
      tus(k) { if (k === '1' || k === 'd' || k === 'D') { sec(true); return true; } if (k === '2' || k === 'y' || k === 'Y') { sec(false); return true; } return false; },
    };
  }
  function sayisalKur(q, deg) {
    let inp = null;
    const tol = q.tolerans > 0 ? q.tolerans : 0.02;
    const dogruDeger = () => { try { return hesapla(q.cevap, deg); } catch (e) { return NaN; } };
    const gid = 'g' + Math.random().toString(36).slice(2, 8);
    return {
      html: `<div class="sv-soru">${metin(q.soru, deg)}</div><div class="sv-giris"><label class="sv-etiket" for="${gid}">Cevabın</label><div class="sv-g-k"><input id="${gid}" class="sv-g" type="text" inputmode="decimal" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" placeholder="ör. 12,5"><button type="button" class="sv-dug sv-isaret" aria-label="İşareti değiştir (eksi / artı)" title="İşareti değiştir">±</button><span class="sv-birim">${metin(q.birim || '')}</span></div></div>`,
      bagla(k) {
        inp = k.querySelector('input');
        const isr = k.querySelector('.sv-isaret');
        if (isr) isr.addEventListener('click', () => { if (inp.readOnly) return; const v = inp.value.trim(); inp.value = /^[-−]/.test(v) ? v.replace(/^[-−]\s*/, '') : '−' + v; inp.focus(); });
      },
      al: () => (inp.value.trim() ? inp.value.trim() : null),
      koy: (c) => { if (c != null) inp.value = c; },
      denetle(c) {
        const v = sayiOku(c), r = dogruDeger();
        if (v == null || Number.isNaN(v)) return { okunamadi: true };
        const fark = Math.abs(v - r), tam = r === 0 ? fark <= tol : fark <= tol * Math.abs(r) * (1 + 1e-9);
        return { tam, puan: tam ? 1 : 0, v, r, sapma: r ? fark / Math.abs(r) : null };
      },
      isaretle(c, s) { inp.readOnly = true; inp.classList.toggle('ok', !!(s && s.tam)); inp.classList.toggle('hata', !!(s && !s.tam && !s.goster)); },
      dogru(c, s) {
        const r = dogruDeger();
        let h = `<p class="sv-dc">Doğru cevap: <b>${sayiDuz(r)}</b> ${metin(q.birim || '')} <span class="sv-soluk">(±%${sayiDuz(tol * 100, 's2')} kabul)</span></p>`;
        if (s && s.v != null && !s.tam && !s.goster) h += `<p class="sv-dc2">Senin cevabın ${sayiDuz(s.v)} · sapma %${s.sapma != null ? sayiDuz(s.sapma * 100, 's2') : '—'}</p>`;
        return h;
      },
      ek: () => `${(q.adimlar || []).length ? `<div class="sv-adim"><h3>Adım adım çözüm</h3><ol>${q.adimlar.map((a) => `<li>${metin(a, deg)}</li>`).join('')}</ol></div>` : ''}${q.yorum ? `<div class="sv-yorum"><h3>${ikon('yorum')}<span>Sonucu yorumla</span></h3><div>${metin(q.yorum, deg)}</div></div>` : ''}`,
      tus: () => false,
    };
  }
  function farkKur(q) {
    const kav = q.kavramlar || [];
    const aitI = (f) => (typeof f.ait === 'number' ? f.ait : kav.indexOf(f.ait));
    const ifs = q.ifadeler || [];
    const sec = new Array(ifs.length).fill(null);
    let kap = null;
    const ciz = () => kap.querySelectorAll('li[data-i]').forEach((li) => { const i = +li.dataset.i; li.querySelectorAll('.sv-f-b').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.j === sec[i]))); });
    return {
      html: `<p class="sv-yon">Her ifade hangi kavrama ait?</p><div class="sv-kavlar">${kav.map((k, j) => `<span class="sv-kv">${HARF[j]} · ${metin(k)}</span>`).join('')}</div><ol class="sv-fark">${ifs.map((f, i) => `<li data-i="${i}"><div class="sv-f-m">${metin(f.metin)}</div><div class="sv-f-s" role="group" aria-label="${i + 1}. ifadenin kavramı">${kav.map((k, j) => `<button type="button" class="sv-f-b" data-j="${j}" aria-pressed="false">${metin(k)}</button>`).join('')}</div><p class="sv-f-d" hidden></p></li>`).join('')}</ol>`,
      bagla(k) { kap = k; k.addEventListener('click', (e) => { const b = e.target.closest('.sv-f-b'); if (!b || k.closest('.kilit')) return; sec[+b.closest('li').dataset.i] = +b.dataset.j; ciz(); }); },
      al: () => (sec.some((x) => x != null) ? sec.slice() : null),
      koy: (c) => { if (Array.isArray(c)) { c.forEach((x, i) => { sec[i] = x; }); ciz(); } },
      denetle(c) { let n = 0; ifs.forEach((f, i) => { if (c[i] === aitI(f)) n++; }); return { tam: n === ifs.length, puan: n / Math.max(1, ifs.length), ayrinti: `${n}/${ifs.length}` }; },
      isaretle(c, s) {
        kap.querySelectorAll('li[data-i]').forEach((li) => {
          const i = +li.dataset.i, a = aitI(ifs[i]); const ok = !!(c && c[i] === a);
          if (!(s && s.goster)) { li.classList.toggle('ok', ok); li.classList.toggle('hata', !ok); }
          li.querySelectorAll('.sv-f-b').forEach((b) => b.classList.toggle('ok', +b.dataset.j === a));
          const p = li.querySelector('.sv-f-d'); if (!ok) { p.hidden = false; p.innerHTML = `Doğrusu: <b>${metin(kav[a])}</b>`; }
        });
      },
      dogru: (c, s) => (s && !s.goster && !s.bos ? `<p class="sv-dc">${esc(s.ayrinti)} ifade doğru yerde.</p>` : ''),
      tus: () => false,
    };
  }
  function boslukKur(q) {
    const parca = String(q.metin || '').split(/_{3,}/);
    const n = parca.length - 1;
    const kabul = (i) => { const c = (q.cevaplar || [])[i]; return Array.isArray(c) ? c : c != null ? [c] : []; };
    const uyar = (v, i) => { const a = norm(v), b = katla(v); return kabul(i).some((k) => norm(k) === a || katla(k) === b); };
    let inps = [];
    return {
      html: `<p class="sv-yon">Boşlukları doldur.</p><div class="sv-bos">${parca.map((p, i) => metin(p) + (i < n ? `<span class="sv-b-y"><input class="sv-b-g" type="text" data-i="${i}" aria-label="${i + 1}. boşluk" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="${i < n - 1 ? 'next' : 'done'}"><span class="sv-b-d" hidden></span></span>` : '')).join('')}</div>`,
      bagla(k) {
        inps = [...k.querySelectorAll('.sv-b-g')];
        inps.forEach((inp, i) => inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' && i < inps.length - 1 && !inps[i + 1].value) { e.preventDefault(); e.stopPropagation(); inps[i + 1].focus(); } }));
      },
      al: () => (inps.some((x) => x.value.trim()) ? inps.map((x) => x.value.trim()) : null),
      koy: (c) => { if (Array.isArray(c)) inps.forEach((x, i) => { x.value = c[i] || ''; }); },
      denetle(c) { let k = 0; for (let i = 0; i < n; i++) if (c[i] && uyar(c[i], i)) k++; return { tam: k === n, puan: k / Math.max(1, n), ayrinti: `${k}/${n}` }; },
      isaretle(c, s) {
        inps.forEach((x, i) => {
          x.readOnly = true; const ok = !!(c && c[i] && uyar(c[i], i));
          if (!(s && s.goster)) { x.classList.toggle('ok', ok); x.classList.toggle('hata', !ok); }
          const dd = x.nextElementSibling; if (!ok && dd) { dd.hidden = false; dd.textContent = kabul(i)[0] || ''; }
        });
      },
      dogru: () => `<p class="sv-dc">Tam metin: ${parca.map((p, i) => metin(p) + (i < n ? `<b class="sv-b-c">${esc(kabul(i)[0] || '')}</b>` : '')).join('')}</p>`,
      tus: () => false,
    };
  }
  function esleKur(q) {
    const sol = q.sol || [], sag = q.sag || [], dg = q.dogru || [];
    const sira = karistir(sag.map((_, i) => i));
    const yer = new Array(sol.length).fill(null);
    let secC = null, secY = null, kap = null;
    const ciz = () => {
      kap.querySelectorAll('.sv-yuva').forEach((b) => { const i = +b.dataset.i, j = yer[i]; b.innerHTML = j == null ? '<span class="sv-yuva-b">Eşini seç</span>' : `<span class="sv-yuva-d">${metin(sag[j])}</span>`; b.classList.toggle('dolu', j != null); b.setAttribute('aria-pressed', String(secY === i)); });
      kap.querySelectorAll('.sv-cip').forEach((b) => { const j = +b.dataset.j; b.hidden = yer.includes(j); b.setAttribute('aria-pressed', String(secC === j)); });
      const h = kap.querySelector('.sv-havuz'); if (h) h.classList.toggle('bos', yer.filter((x) => x != null).length >= sag.length);
    };
    const yerlestir = (i, j) => { const eski = yer.indexOf(j); if (eski >= 0) yer[eski] = null; yer[i] = j; secC = null; secY = null; ciz(); };
    return {
      html: `<p class="sv-yon">Soldaki her öğeye eşini yerleştir: önce bir seçeneğe, sonra yuvasına dokun${matchMedia('(pointer:fine)').matches ? ' ya da sürükle' : ''}.</p><ol class="sv-esle">${sol.map((s, i) => `<li data-i="${i}"><div class="sv-e-sol">${metin(s)}</div><button type="button" class="sv-yuva" data-i="${i}" aria-label="${i + 1}. öğenin eşi" aria-pressed="false"></button><p class="sv-e-d" hidden></p></li>`).join('')}</ol><div class="sv-havuz" role="group" aria-label="Seçenekler">${sira.map((j) => `<button type="button" class="sv-cip" data-j="${j}" aria-pressed="false">${metin(sag[j])}</button>`).join('')}</div>`,
      bagla(k) {
        kap = k; ciz();
        k.addEventListener('click', (e) => {
          if (k.closest('.kilit')) return;
          const c = e.target.closest('.sv-cip'), y = e.target.closest('.sv-yuva');
          if (c) { const j = +c.dataset.j; if (secY != null) yerlestir(secY, j); else { secC = secC === j ? null : j; ciz(); } }
          else if (y) { const i = +y.dataset.i; if (secC != null) yerlestir(i, secC); else if (yer[i] != null) { yer[i] = null; ciz(); } else { secY = secY === i ? null : i; ciz(); } }
        });
        k.addEventListener('pointerdown', (e) => {
          if (e.pointerType === 'touch' || e.button !== 0 || k.closest('.kilit')) return;
          const c = e.target.closest('.sv-cip'); if (!c) return;
          surukle(e, c, (hedef) => { const y = hedef && hedef.closest && hedef.closest('.sv-yuva'); if (y && k.contains(y)) yerlestir(+y.dataset.i, +c.dataset.j); });
        });
      },
      al: () => (yer.some((x) => x != null) ? yer.slice() : null),
      koy: (c) => { if (Array.isArray(c)) { c.forEach((x, i) => { yer[i] = x; }); ciz(); } },
      denetle(c) { let n = 0; sol.forEach((_, i) => { if (c[i] === dg[i]) n++; }); return { tam: n === sol.length, puan: n / Math.max(1, sol.length), ayrinti: `${n}/${sol.length}` }; },
      isaretle(c, s) {
        kap.querySelectorAll('.sv-esle li').forEach((li) => {
          const i = +li.dataset.i, ok = !!(c && c[i] === dg[i]);
          if (!(s && s.goster)) { li.classList.toggle('ok', ok); li.classList.toggle('hata', !ok); }
          const p = li.querySelector('.sv-e-d'); if (!ok) { p.hidden = false; p.innerHTML = `Doğrusu: ${metin(sag[dg[i]])}`; }
        });
      },
      dogru: (c, s) => (s && !s.goster && !s.bos ? `<p class="sv-dc">${esc(s.ayrinti)} eşleşme doğru.</p>` : ''),
      tus: () => false,
    };
  }
  function surukle(e, kaynak, birak) {
    const x0 = e.clientX, y0 = e.clientY; let hayalet = null;
    const hareket = (ev) => {
      if (!hayalet) {
        if (Math.abs(ev.clientX - x0) + Math.abs(ev.clientY - y0) < 6) return;
        hayalet = kaynak.cloneNode(true); hayalet.classList.add('sv-hayalet'); hayalet.removeAttribute('data-j'); d.body.appendChild(hayalet); kaynak.classList.add('sv-tasi');
      }
      hayalet.style.transform = `translate(${ev.clientX + 10}px,${ev.clientY + 10}px)`;
    };
    const bit = (ev) => {
      removeEventListener('pointermove', hareket); removeEventListener('pointerup', bit); removeEventListener('pointercancel', bit);
      if (hayalet) { hayalet.remove(); kaynak.classList.remove('sv-tasi'); if (ev.type === 'pointerup') birak(d.elementFromPoint(ev.clientX, ev.clientY)); }
    };
    addEventListener('pointermove', hareket); addEventListener('pointerup', bit); addEventListener('pointercancel', bit);
  }
  function siralaKur(q) {
    const ad = q.adimlar || [], n = ad.length;
    let sira = karistir([...Array(n).keys()]);
    if (n > 1 && sira.every((v, i) => v === i)) sira.push(sira.shift());
    let dokundu = false, kap = null;
    const ciz = () => {
      kap.querySelector('.sv-sira-l').innerHTML = sira.map((j, p) => `<li data-j="${j}"><span class="sv-s-no">${p + 1}</span><span class="sv-s-m">${metin(ad[j])}</span><span class="sv-s-d"><button type="button" class="sv-dug sv-kucuk" data-y="-1" aria-label="${p + 1}. adımı yukarı al"${p === 0 ? ' disabled' : ''}>${ikon('yukari')}</button><button type="button" class="sv-dug sv-kucuk" data-y="1" aria-label="${p + 1}. adımı aşağı al"${p === n - 1 ? ' disabled' : ''}>${ikon('asagi')}</button></span><span class="sv-s-dg" hidden></span></li>`).join('');
    };
    return {
      html: `<p class="sv-yon">Adımları doğru sıraya diz: okla yukarı ya da aşağı al.</p><ol class="sv-sira-l"></ol>`,
      bagla(k) {
        kap = k; ciz();
        k.addEventListener('click', (e) => {
          const b = e.target.closest('[data-y]'); if (!b || k.closest('.kilit')) return;
          const li = b.closest('li'), p = [...li.parentNode.children].indexOf(li), p2 = p + +b.dataset.y;
          if (p2 < 0 || p2 >= n) return;
          [sira[p], sira[p2]] = [sira[p2], sira[p]]; dokundu = true; ciz();
          const yeni = kap.querySelectorAll('.sv-sira-l li')[p2];
          const bb = yeni && (yeni.querySelector(`[data-y="${b.dataset.y}"]:not([disabled])`) || yeni.querySelector('[data-y]:not([disabled])'));
          if (bb) bb.focus({ preventScroll: true });
        });
      },
      al: () => (dokundu ? sira.slice() : null),
      koy: (c) => { if (Array.isArray(c) && c.length === n) { sira = c.slice(); dokundu = true; ciz(); } },
      denetle(c) { let k = 0; c.forEach((j, p) => { if (j === p) k++; }); return { tam: k === n, puan: k / Math.max(1, n), ayrinti: `${k}/${n} yerinde` }; },
      isaretle(c, s) {
        kap.querySelectorAll('.sv-sira-l li').forEach((li, p) => {
          const j = +li.dataset.j, ok = j === p;
          if (!(s && s.goster)) { li.classList.toggle('ok', ok); li.classList.toggle('hata', !ok); }
          li.querySelectorAll('[data-y]').forEach((b) => { b.disabled = true; });
          const t = li.querySelector('.sv-s-dg'); if (!ok) { t.hidden = false; t.textContent = `doğru yeri: ${j + 1}`; }
        });
      },
      dogru: () => `<div class="sv-dc"><p>Doğru sıra:</p><ol class="sv-dogru-sira">${ad.map((a) => `<li>${metin(a)}</li>`).join('')}</ol></div>`,
      tus: () => false,
    };
  }
  const KANAL = { test: secenekli, yorum: secenekli, terim: secenekli, dy: dyKur, sayisal: sayisalKur, fark: farkKur, bosluk: boslukKur, esle: esleKur, sirala: siralaKur };

  // ---------- formül: terimleri tıklanır/vurgulu sar
  function varyant(s) {
    const v = new Set([s]);
    v.add(s.replace(/_\{([A-Za-z0-9])\}/g, '_$1')); v.add(s.replace(/_([A-Za-z0-9])(?![A-Za-z0-9{])/g, '_{$1}'));
    v.add(s.replace(/\^\{([A-Za-z0-9])\}/g, '^$1'));
    return [...v].filter(Boolean);
  }
  function terimSar(t, terimler, vurgu, hepsi) {
    const aday = [];
    terimler.forEach((x, i) => { if (!x || !x.s) return; if (!hepsi && i !== vurgu) return; varyant(String(x.s)).forEach((v) => aday.push({ v, i })); });
    aday.sort((a, b) => b.v.length - a.v.length);
    const harf = (c) => /[A-Za-z]/.test(c || '');
    let out = '', j = 0;
    while (j < t.length) {
      let es = null;
      for (const a of aday) {
        if (!t.startsWith(a.v, j)) continue;
        const once = t[j - 1], once2 = t[j - 2], sonra = t[j + a.v.length];
        if (harf(a.v[0]) && (harf(once) || once === '\\')) continue;
        if (once === '_' || once === '^' || (once === '{' && (once2 === '_' || once2 === '^'))) continue;
        if (harf(a.v[a.v.length - 1]) && harf(sonra)) continue;
        if (sonra === '_' || sonra === "'") continue;
        es = a; break;
      }
      if (es) { out += `\\htmlClass{sv-t sv-t${es.i}${es.i === vurgu ? ' sv-t-on' : ''}}{${es.v}}`; j += es.v.length; continue; }
      if (t[j] === '\\') { const m = /^\\([A-Za-z]+|.)/.exec(t.slice(j)); out += m[0]; j += m[0].length; continue; }
      out += t[j]; j++;
    }
    return out;
  }
  function formulHtml(f, vurgu, hepsi) {
    const ham = String(f.tex || '');
    const sarili = terimSar(ham, f.terimler || [], vurgu, hepsi);
    if (window.katex) {
      try { return window.katex.renderToString(sarili, Object.assign({}, TEX_OPT, { displayMode: true, throwOnError: true })); } catch (e) { /* sarma bozdu: düz çiz */ }
    }
    return tex(ham, true);
  }
  function terimUst(q) {
    const f = FORM.get(q.formul); if (!f) return '';
    const ti = (f.terimler || []).findIndex((t) => t.s === q.terim);
    return `<div class="sv-tf"><p class="sv-etiket">${esc(f.ad || 'Formül')}</p><div class="sv-tf-f">${formulHtml(f, ti, false)}</div><p class="sv-tf-t">Odaktaki terim: <span class="sv-tf-s">${tex(q.terim)}</span> · <a href="#atlas/${encodeURIComponent(f.id)}/${encodeURIComponent(q.terim)}">Formül atlasında aç</a></p></div>`;
  }
  function terimKart(t) {
    if (!t) return '';
    const alt = (t.alternatif || []);
    return `<div class="sv-tk"><p class="sv-tk-s"><span class="sv-tk-sm">${tex(t.s)}</span><span class="sv-tk-ad">${esc(t.ad || '')}</span></p><dl class="sv-tk-dl"><div><dt>Birim</dt><dd>${metin(t.birim || '—')}</dd></div><div><dt>Ne?</dt><dd>${metin(t.ne || '')}</dd></div></dl><h3 class="sv-tk-h">Yerine ne konabilir?</h3>${alt.length ? `<ul class="sv-altl">${alt.map((a) => `<li><p class="sv-alt-ne">${metin(a.ne)}</p><p class="sv-alt-z"><span class="sv-soluk">Ne zaman:</span> ${metin(a.ne_zaman)}</p></li>`).join('')}</ul>` : '<p class="sv-soluk">Bu terimin yerine konan yaygın bir başka büyüklük yok.</p>'}</div>`;
  }

  // ---------- formül atlası
  function atlasAc(fid, terim) {
    clearInterval(denemeZaman);
    S.mod = 'atlas';
    const fl = B.formuller || [];
    if (fid && FORM.has(fid)) { if (fid !== S.atlas.f) S.atlas.t = null; S.atlas.f = fid; }
    else if (!S.atlas.f || !FORM.has(S.atlas.f)) S.atlas.f = fl[0] && fl[0].id;
    if (terim != null) S.atlas.t = terim;
    ustGuncelle(); atlasCiz();
  }
  function atlasCiz(terimOdak) {
    aktif = null;
    const fl = B.formuller || [];
    if (!fl.length) { ana.innerHTML = '<section class="sv-bosm"><h2>Formül atlası</h2><p>Bu derste henüz formül yok.</p></section>'; hashYaz('atlas'); return; }
    const f = FORM.get(S.atlas.f) || fl[0];
    const tl = f.terimler || [];
    let ti = tl.findIndex((t) => t.s === S.atlas.t); if (ti < 0) ti = 0;
    const gruplar = new Map();
    for (const x of fl) { const g = (KONU.get(x.konu) || {}).ad || 'Diğer'; if (!gruplar.has(g)) gruplar.set(g, []); gruplar.get(g).push(x); }
    const iliskili = B.sorular.filter((q) => q.kanal === 'terim' && q.formul === f.id);
    const konuSay = f.konu ? B.sorular.filter((q) => q.konu === f.konu).length : 0;
    ana.innerHTML = `<div class="sv-atlas">
<nav class="sv-a-l" aria-label="Formüller">${[...gruplar].map(([g, xs]) => `<p class="sv-a-g">${esc(g)}</p>${xs.map((x) => `<button type="button" class="sv-a-fb" data-f="${esc(x.id)}" aria-pressed="${x.id === f.id}">${esc(x.ad || x.id)}</button>`).join('')}`).join('')}</nav>
<div class="sv-a-sec"><label class="sv-etiket" for="sv-a-s">Formül (${fl.length})</label><select id="sv-a-s">${[...gruplar].map(([g, xs]) => `<optgroup label="${esc(g)}">${xs.map((x) => `<option value="${esc(x.id)}"${x.id === f.id ? ' selected' : ''}>${esc(x.ad || x.id)}</option>`).join('')}</optgroup>`).join('')}</select></div>
<section class="sv-a-d" aria-live="polite">
<h2 class="sv-a-h">${esc(f.ad || f.id)}</h2>
<div class="sv-a-f">${formulHtml(f, ti, true)}</div>
${f.birimler ? `<p class="sv-a-b"><span class="sv-etiket">Birimler</span> ${metin(f.birimler)}</p>` : ''}
<p class="sv-a-ip">Formüldeki bir terime ya da aşağıdaki simgelerden birine dokun.</p>
<div class="sv-a-t" role="group" aria-label="Terimler">${tl.map((t, i) => `<button type="button" class="sv-a-tb" data-t="${i}" aria-pressed="${i === ti}" title="${esc(t.ad || '')}">${tex(t.s)}</button>`).join('')}</div>
${terimKart(tl[ti])}
<div class="sv-a-alt">${kaynakHtml(f.kaynak)}${f.konu && KONU.has(f.konu) ? `<p class="sv-a-k"><button type="button" class="sv-dug sv-ikinci" data-e="konu-git" data-konu="${esc(f.konu)}">${esc(KONU.get(f.konu).ad)} · ${konuSay} soru${ikon('sag')}</button></p>` : ''}</div>
${iliskili.length ? `<div class="sv-a-q"><h3>Bu formülün terim soruları</h3><ul>${iliskili.map((q) => `<li><a href="#${esc(q.id)}">${tex(q.terim)}<span>${esc(String(q.soru || '').replace(/\$[^$]*\$/g, '…').slice(0, 90))}</span></a></li>`).join('')}</ul></div>` : ''}
</section></div>`;
    hashYaz('atlas/' + encodeURIComponent(f.id) + (S.atlas.t ? '/' + encodeURIComponent(S.atlas.t) : ''));
    if (terimOdak) { const b = ana.querySelector('.sv-a-tb[aria-pressed="true"]'); if (b) b.focus({ preventScroll: true }); }
  }

  // ---------- deneme sınavı
  function denemeAc() {
    S.mod = 'deneme'; ustGuncelle();
    denemeCiz();
  }
  function havuz() { return B.sorular.filter((q) => (S.konu === 'hepsi' || q.konu === S.konu) && (!S.zorluk || q.zorluk === S.zorluk)); }
  function denemeCiz() {
    const D = S.deneme;
    hashYaz('deneme');
    if (!D) return denemeAyar();
    if (D.bitti) return denemeSonuc();
    denemeSoru();
  }
  function denemeAyar() {
    const h = havuz();
    const nler = [10, 20, 30, 40].filter((n) => n < h.length).concat([h.length]).filter((v, i, a) => v > 0 && a.indexOf(v) === i);
    if (!nler.includes(S.ayar.n)) S.ayar.n = nler.includes(20) ? 20 : nler[nler.length - 1];
    const sureler = [0, 10, 20, 30, 45, 60];
    const kapsam = `${S.konu === 'hepsi' ? 'Tüm konular' : esc((KONU.get(S.konu) || {}).ad || S.konu)} · ${S.zorluk ? ZOR_AD[S.zorluk] : 'tüm zorluklar'}`;
    ana.innerHTML = `<section class="sv-deneme-a"><h2>Deneme sınavı</h2>
<ul class="sv-madde"><li>Sorular karışık kanallardan gelir; her kanaldan en az bir soru.</li><li>Cevaplar sınav bitince değerlendirilir; bilgi feneri ve çözümler sonda açılır.</li><li>Sonunda puan, konu bazında zayıf yönler ve yanlışlarına dönüş.</li></ul>
<div class="sv-ayar"><p class="sv-etiket" id="sv-n-e">Soru sayısı</p><div class="sv-segment" role="group" aria-labelledby="sv-n-e">${nler.map((n) => `<button type="button" class="sv-sg" data-e="d-n" data-v="${n}" aria-pressed="${S.ayar.n === n}">${n === h.length && n > 40 ? `Tümü (${n})` : n}</button>`).join('')}</div></div>
<div class="sv-ayar"><p class="sv-etiket" id="sv-s-e">Süre</p><div class="sv-segment" role="group" aria-labelledby="sv-s-e">${sureler.map((s) => `<button type="button" class="sv-sg" data-e="d-sure" data-v="${s}" aria-pressed="${S.ayar.sure === s}">${s ? s + ' dk' : 'Süresiz'}</button>`).join('')}</div></div>
<p class="sv-kapsam"><span class="sv-soluk">Kapsam:</span> ${kapsam} · havuzda ${h.length} soru <span class="sv-soluk">(üstteki Konu ve Zorluk seçicileriyle daralt)</span></p>
<p><button type="button" class="sv-dug sv-ana-dug sv-buyuk" data-e="basla"${h.length ? '' : ' disabled'}>${ikon('saat')}<span>Sınavı başlat</span></button></p></section>`;
  }
  function denemeSec(n) {
    const h = karistir(havuz().slice());
    const secilen = [], kullan = new Set();
    const kanallar = karistir(KANAL_SIRA.filter((k) => h.some((q) => q.kanal === k)));
    for (const k of kanallar) { if (secilen.length >= n) break; const q = h.find((x) => x.kanal === k); if (q) { secilen.push(q); kullan.add(q.id); } }
    for (const q of h) { if (secilen.length >= n) break; if (!kullan.has(q.id)) { secilen.push(q); kullan.add(q.id); } }
    return karistir(secilen);
  }
  function denemeEylem(k, b) {
    const D = S.deneme;
    if (k === 'd-n') { S.ayar.n = +b.dataset.v; depo.koy('ayar', S.ayar); return denemeAyar(); }
    if (k === 'd-sure') { S.ayar.sure = +b.dataset.v; depo.koy('ayar', S.ayar); return denemeAyar(); }
    if (k === 'basla') {
      const sorular = denemeSec(S.ayar.n);
      S.deneme = { sorular, deg: {}, cevap: {}, i: 0, bas: Date.now(), bitis: S.ayar.sure ? Date.now() + S.ayar.sure * 60000 : 0, bitti: false };
      sorular.forEach((q) => { if (q.kanal === 'sayisal') S.deneme.deg[q.id] = degerSec(q); });
      return denemeSoru();
    }
    if (!D) return;
    if (k === 'd-git') { denemeSakla(); D.i = +b.dataset.v; return denemeSoru(); }
    if (k === 'd-sonra') { denemeSakla(); if (D.i < D.sorular.length - 1) { D.i++; return denemeSoru(); } return bitirSor(); }
    if (k === 'd-once') { denemeSakla(); if (D.i > 0) D.i--; return denemeSoru(); }
    if (k === 'bitir') { denemeSakla(); return bitirSor(); }
    if (k === 'd-bitir-evet') return denemeBitir();
    if (k === 'd-bitir-hayir') { const u = ana.querySelector('.sv-onay'); if (u) u.hidden = true; return; }
    if (k === 'yeni-deneme') { S.deneme = null; return denemeCiz(); }
    if (k === 'yanlislara') { S.deneme = null; return modYanlis(); }
    if (k === 'incele') return denemeIncele(b.dataset.id);
    if (k === 'sonuca') return denemeSonuc();
  }
  function denemeSakla() { const D = S.deneme; if (D && aktif && aktif.q && !D.bitti) { const c = aktif.al(); if (c == null) delete D.cevap[aktif.q.id]; else D.cevap[aktif.q.id] = c; } }
  function sureYaz() {
    const D = S.deneme, el = ana.querySelector('.sv-d-sure'); if (!D || !el) return;
    if (!D.bitis) { const g = Math.floor((Date.now() - D.bas) / 1000); el.textContent = `${Math.floor(g / 60)}:${String(g % 60).padStart(2, '0')}`; return; }
    const k = Math.max(0, Math.ceil((D.bitis - Date.now()) / 1000));
    el.textContent = `${Math.floor(k / 60)}:${String(k % 60).padStart(2, '0')} kaldı`;
    el.classList.toggle('az', k <= 60);
    if (k <= 0) { denemeSakla(); denemeBitir(); }
  }
  function denemeSoru() {
    const D = S.deneme; aktif = null;
    const q = D.sorular[D.i], son = D.i === D.sorular.length - 1;
    const yanitli = (x) => D.cevap[x.id] != null;
    ana.innerHTML = `<section class="sv-deneme"><div class="sv-d-ust"><p class="sv-sira">Deneme · <b>${D.i + 1}</b> / ${D.sorular.length}</p><p class="sv-d-sure-k">${ikon('saat')}<span class="sv-d-sure" aria-live="off"></span></p><button type="button" class="sv-dug" data-e="bitir">${ikon('bayrak')}<span>Sınavı bitir</span></button></div>
<div class="sv-d-kart"></div>
<div class="sv-onay" role="alert" hidden></div>
<div class="sv-d-gez"><button type="button" class="sv-dug" data-e="d-once"${D.i ? '' : ' disabled'}>${ikon('sol')}<span>Önceki</span></button><button type="button" class="sv-dug sv-ana-dug" data-e="d-sonra"><span>${son ? 'Bitir ve puanla' : 'Sonraki'}</span>${ikon('sag')}</button></div>
<nav class="sv-d-harita" aria-label="Sınav soruları">${D.sorular.map((x, i) => `<button type="button" data-e="d-git" data-v="${i}" class="${yanitli(x) ? 'yanitli' : ''}" aria-current="${i === D.i}" aria-label="${i + 1}. soru${yanitli(x) ? ', cevaplandı' : ''}">${i + 1}</button>`).join('')}</nav></section>`;
    const k = kartKur(q, { mod: 'deneme', kap: ana.querySelector('.sv-d-kart'), deg: D.deg[q.id], cevap: D.cevap[q.id] });
    aktif = Object.assign(k, {
      enter: (t) => { if (t && t.matches && t.matches('.sv-sik[aria-pressed="false"], .sv-f-b[aria-pressed="false"]')) { t.click(); return; } denemeEylem('d-sonra'); },
      sonraki: () => denemeEylem('d-sonra'), onceki: () => denemeEylem('d-once'), fener: () => {},
    });
    sureYaz(); denemeZaman = setInterval(sureYaz, 1000);
    gorunurYap(false);
  }
  function bitirSor() {
    const D = S.deneme, bos = D.sorular.filter((q) => D.cevap[q.id] == null).length;
    if (!bos) return denemeBitir();
    const u = ana.querySelector('.sv-onay');
    u.innerHTML = `<p>${bos} soru boş. Yine de bitirip puanlansın mı?</p><p><button type="button" class="sv-dug sv-ana-dug" data-e="d-bitir-evet">Bitir ve puanla</button> <button type="button" class="sv-dug" data-e="d-bitir-hayir">Sınava dön</button></p>`;
    u.hidden = false; const b = u.querySelector('button'); if (b) b.focus();
  }
  function denemeBitir() {
    const D = S.deneme; if (!D || D.bitti) return;
    clearInterval(denemeZaman);
    D.bitti = true; D.sure = Math.round((Date.now() - D.bas) / 1000);
    // her soruyu gizli bir kartta notla
    const gecici = d.createElement('div'); gecici.hidden = true; d.body.appendChild(gecici);
    D.sonuc = D.sorular.map((q) => { const k = kartKur(q, { mod: 'deneme', kap: gecici, deg: D.deg[q.id], cevap: D.cevap[q.id] }); const s = D.cevap[q.id] == null ? { tam: false, puan: 0, bos: true } : k.notla(); return { q, s }; });
    gecici.remove();
    for (const { q, s } of D.sonuc) { if (!s.bos) izle(q, s.tam); else { YANLIS[q.id] = (YANLIS[q.id] || 0) + 1; } }
    depo.koy('yanlis', YANLIS); ustGuncelle();
    denemeSonuc();
  }
  function denemeSonuc() {
    const D = S.deneme; aktif = null; if (!D || !D.sonuc) return denemeCiz();
    const n = D.sonuc.length, dogru = D.sonuc.filter((x) => x.s.tam).length, bos = D.sonuc.filter((x) => x.s.bos).length;
    const yuzde = Math.round(100 * dogru / Math.max(1, n));
    const konu = new Map(), kanal = new Map();
    for (const { q, s } of D.sonuc) {
      const a = konu.get(q.konu) || { n: 0, d: 0 }; a.n++; if (s.tam) a.d++; konu.set(q.konu, a);
      const b = kanal.get(q.kanal) || { n: 0, d: 0 }; b.n++; if (s.tam) b.d++; kanal.set(q.kanal, b);
    }
    const konuL = [...konu].sort((x, y) => x[1].d / x[1].n - y[1].d / y[1].n);
    const zayif = konuL.filter(([, v]) => v.d / v.n < 0.6);
    const yanlis = D.sonuc.filter((x) => !x.s.tam);
    const dk = Math.floor(D.sure / 60), sn = D.sure % 60;
    ana.innerHTML = `<section class="sv-sonuc-d"><h2>Deneme sonucu</h2>
<p class="sv-puan"><b>${dogru}</b> / ${n} doğru <span class="sv-yuzde">%${yuzde}</span></p>
<p class="sv-cubuk sv-cubuk-b"><i style="width:${yuzde}%"></i></p>
<p class="sv-soluk">Süre ${dk} dk ${sn} sn · boş ${bos} · yanlış ${n - dogru - bos}</p>
${zayif.length ? `<h3>Zayıf yönler</h3><ul class="sv-zayif">${zayif.map(([k, v]) => { const ko = KONU.get(k) || { ad: k }; return `<li><p><b>${esc(ko.ad)}</b> <span class="sv-soluk">${v.d}/${v.n}</span></p>${(ko.bag || []).length ? `<ul class="sv-baglar">${ko.bag.map((b) => `<li><a href="${esc(b.url)}" target="_blank" rel="noopener">${ikon('bag')}<span>${esc(b.ad)}</span></a></li>`).join('')}</ul>` : ''}<p><button type="button" class="sv-dug sv-ikinci" data-e="konu-git" data-konu="${esc(k)}">Bu konuyu çalış${ikon('sag')}</button></p></li>`; }).join('')}</ul>` : `<p class="sv-not">${ikon('tik')}Zayıf konu yok: her konuda en az %60.</p>`}
<h3>Konu bazında</h3><ul class="sv-dagilim">${konuL.map(([k, v]) => `<li><span class="sv-dg-ad">${esc((KONU.get(k) || { ad: k }).ad)}</span><span class="sv-cubuk"><i style="width:${(100 * v.d / v.n).toFixed(0)}%"></i></span><span class="sv-dg-n">${v.d}/${v.n}</span></li>`).join('')}</ul>
<h3>Kanal bazında</h3><ul class="sv-dagilim">${[...kanal].map(([k, v]) => `<li><span class="sv-dg-ad">${KANAL_AD[k]}</span><span class="sv-cubuk"><i style="width:${(100 * v.d / v.n).toFixed(0)}%"></i></span><span class="sv-dg-n">${v.d}/${v.n}</span></li>`).join('')}</ul>
${yanlis.length ? `<h3>Yanlış ve boş sorular</h3><ol class="sv-y-l">${yanlis.map(({ q, s }) => `<li><button type="button" class="sv-y-b" data-e="incele" data-id="${esc(q.id)}"><span class="sv-y-k">${KANAL_AD[q.kanal]} · ${s.bos ? 'boş' : s.puan > 0 ? 'kısmen' : 'yanlış'}</span><span class="sv-y-m">${esc(ozet(q))}</span>${ikon('sag')}</button></li>`).join('')}</ol>` : ''}
<p class="sv-s-alt"><button type="button" class="sv-dug sv-ana-dug" data-e="yeni-deneme">${ikon('tekrar')}<span>Yeni deneme</span></button> ${yanlis.length ? `<button type="button" class="sv-dug" data-e="yanlislara">${ikon('yanlis')}<span>Yanlışlarımı çalış</span></button>` : ''}</p></section>`;
    hashYaz('deneme');
    gorunurYap(false);
  }
  function ozet(q) { const t = q.soru || q.ifade || q.metin || q.durum || (q.kavramlar || []).join(' / ') || (q.sol || []).join(' · ') || (q.adimlar || [])[0] || ''; return String(t).replace(/\$[^$]*\$/g, '…').replace(/\{=?[^{}]*\}/g, '…').replace(/_{3,}/g, '…').slice(0, 110); }
  function denemeIncele(id) {
    const D = S.deneme; const x = D.sonuc.find((r) => r.q.id === id); if (!x) return;
    const yl = D.sonuc.filter((r) => !r.s.tam), sira = yl.findIndex((r) => r.q.id === id);
    const sonraki = yl[sira + 1] ? yl[sira + 1].q.id : null;
    ana.innerHTML = `<section class="sv-deneme"><div class="sv-d-ust"><p class="sv-sira">İnceleme · ${sira + 1} / ${yl.length}</p></div><div class="sv-d-kart"></div></section>`;
    const k = kartKur(x.q, { mod: 'inceleme', kap: ana.querySelector('.sv-d-kart'), deg: D.deg[id], cevap: D.cevap[id], sonrakiYanlis: sonraki });
    k.incele(D.cevap[id]);
    aktif = Object.assign(k, { enter: () => {}, sonraki: () => { if (sonraki) denemeIncele(sonraki); }, onceki: () => {}, fener: () => {}, tus: () => false });
    gorunurYap(true);
  }

  // ---------- klavye
  function tus(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target;
    if (e.key === 'Escape') { const acik = kok.querySelector('.sv-dd[aria-expanded="true"]'); if (panelKapat()) { e.preventDefault(); if (acik) acik.focus(); } return; }
    if (t && t.closest && t.closest('.sv-panel')) return;
    const yazi = t && t.closest && t.closest('input,textarea,select');
    if (yazi) {
      if (e.key === 'Enter' && aktif && t.closest('.sv-kart') && t.tagName === 'INPUT') { e.preventDefault(); aktif.enter(t); }
      return;
    }
    if (!aktif) return;
    const k = e.key;
    if (k === 'Enter') {
      if (t && t.closest && t.closest('a, summary, .sv-ust button, [data-e], .sv-yuva, .sv-cip, [data-y], .sv-d-harita button, .sv-a-tb, .sv-isaret')) return;
      e.preventDefault(); aktif.enter(t); return;
    }
    if (k === 'ArrowRight') { e.preventDefault(); aktif.sonraki(); return; }
    if (k === 'ArrowLeft') { e.preventDefault(); aktif.onceki(); return; }
    if (k === 'f' || k === 'F') { e.preventDefault(); aktif.fener(); return; }
    if (aktif.tus && aktif.tus(k)) e.preventDefault();
  }
})();
