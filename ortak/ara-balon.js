/* Atmosfer Akademisi — site geneli yüzen arama balonu (ETK4 BALON, 27 Kas 2026).
   Her sayfaya tek satır: <script src="<köke göre>/ortak/ara-balon.js" defer></script> (tools/ortak_enjekte.mjs ekler).
   Bağımlılıksız; stil bu dosyada (tek istek). Ders Kitaplığı'nın arama / çekmece motorunu (arama, kavram, terim kartı, sözlük,
   mercekler, pusula) gömülü kipte iframe'de açar: ders-kitapligi/?gomulu=1#<kitap>/k/<görünüm>. Ders Kitaplığı'nın kendi
   sayfasında iframe yok: yerel çekmece açılır.
   Tetikler: balona dokun · masada boşluğa art arda iki kez (yazı alanında değilken; ilk boşluğun sayfa ilerlemesi geri alınır) ·
   teknik sözcük seçimi (fare) / telefonda sözcüğe basılı tutup seçme → bilinen terim / kavram ise doğrudan kartı, değilse
   seçimin yanında küçük «Ara» düğmesi. Seçim silinmez, odak çalınmaz (kopyalama bozulmaz).
   Kip: yüzen pencere (varsayılan) ↔ bölünmüş (masada yan panel, telefonda alt panel). Balon sürüklenir, bırakınca en yakın
   kenara yapışır (kenara çok yakın bırakılırsa yarı gizli sekme olur); dokununca pencere balonun yerinden büyüyerek açılır.
   Depo (localStorage, hepsi try/catch): ab:durum {kenar, yo, gizli, kip, p}, ab:kitap, ab:cift ('0' = çift boşluk kapalı),
   ab:secim ('0' = seçimle arama kapalı), ab:gizli ('1' = balon gizli). Hareket: prefers-reduced-motion ve html[data-hareket=az]. */
(function () {
  'use strict';
  if (window.__araBalon) return;
  try { if (window.self !== window.top) return; } catch (e) { return; } // iframe içinde (gömülü kitaplık dahil) kurulmaz
  window.__araBalon = true;
  const BETIK = document.currentScript;
  const KOK = new URL('..', BETIK && BETIK.src ? BETIK.src : location.href).href;
  const DK_YEREL = !!document.getElementById('cekmece') && !!document.getElementById('ck-ara'); // Ders Kitaplığı'nın kendi sayfası (yerel çekmece)
  const oku = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const yaz = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* özel pencere */ } };
  const okuJ = (k) => { try { const x = JSON.parse(oku(k) || 'null'); return x && typeof x === 'object' ? x : {}; } catch (e) { return {}; } };
  const D = Object.assign({ kenar: 'sag', yo: 0.74, gizli: false, kip: 'yuzen', p: null }, okuJ('ab:durum'));
  const sakla = () => yaz('ab:durum', JSON.stringify(D));
  const azHareket = () => (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || document.documentElement.dataset.hareket === 'az';
  const dar = () => innerWidth < 700;
  const kalemAcik = () => !!document.querySelector('.t9kalem-yas, .t9kalem-ortu') || document.documentElement.classList.contains('kalem-acik');
  const yaziAlani = (el) => !!(el && el.closest && el.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]'));
  const etkilesimli = (el) => !!(el && el.closest && el.closest('button, a[href], summary, select, [role=button], [role=tab], [role=slider], [role=switch], [role=checkbox], [tabindex]:not([tabindex="-1"]), input, textarea, video, audio'));

  // ---------- kitap ipucu (hangi kitabın araması açılsın) ----------
  const YOL = { 'harita-okulu': 'mto302e', 'sinoptik-brifing': 'mto302e', 'hava-analizi-proje-rehberi': 'mto302e', 'hec-hms': 'mto316', 'hidrometeoroloji-quiz': 'mto316', 'cfd-temelleri': 'mto303e', 'bulut-fizigi-rehberi': 'mto342e' };
  const DERS = { 'mto-351': 'mto316', 'mto-316': 'mto316', 'mto-302': 'mto302e', 'mto-229': 'mto342e', 'mto-303': 'mto303e', 'mto-323': 'mto323' };
  function kitapIpucu() {
    const m = document.querySelector('meta[name="ara-kitap"]'); if (m && m.content) return m.content;
    const r = /(mto(?:302e|303e|316|323|342e))/i.exec(location.pathname + ' ' + location.hash); if (r) return r[1].toLowerCase();
    const s = /#\/ders\/(mto-\d+)/.exec(location.hash); if (s && DERS[s[1]]) return DERS[s[1]];
    const y = Object.keys(YOL).find((d) => location.pathname.includes('/' + d + '/')); if (y) return YOL[y]; // alt sitenin dersi
    return oku('ab:kitap') || 'mto316';
  }

  // ---------- stil ----------
  const CSS = `
.ab-balon{position:fixed;left:0;top:0;z-index:2147482000;width:var(--ab-b,54px);height:var(--ab-b,54px);border-radius:50%;border:0;margin:0;padding:0;display:grid;place-items:center;background:#1d5fd6;color:#fff;box-shadow:0 6px 20px #0f2a5c55,0 1px 3px #0003;cursor:pointer;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;will-change:transform;opacity:.96}
.ab-balon:hover{opacity:1}.ab-balon:focus-visible{outline:3px solid #f59e0b;outline-offset:3px}
.ab-balon svg{width:46%;height:46%;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;pointer-events:none}
.ab-balon.ab-tasiniyor{opacity:1;box-shadow:0 12px 32px #0f2a5c66}
.ab-balon.ab-gizle{opacity:0;pointer-events:none}
.ab-pencere{position:fixed;z-index:2147482001;left:0;top:0;display:flex;flex-direction:column;background:#fff;color:#111827;border:1px solid #d5dce6;border-radius:16px;box-shadow:0 18px 60px #0f172a40,0 2px 8px #0f172a1f;overflow:hidden;transform-origin:50% 50%;transition:transform .26s cubic-bezier(.2,.8,.2,1),opacity .2s ease;will-change:transform,opacity;font:16px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;contain:layout paint}
.ab-pencere[hidden]{display:none!important}
.ab-pencere.ab-kapali{transform:scale(.06);opacity:0;pointer-events:none}
.ab-ust{display:flex;align-items:center;gap:6px;padding:8px 8px 8px 10px;border-bottom:1px solid #e2e7ee;background:#f7f9fc;touch-action:none;cursor:move}
.ab-girdi{flex:1;min-width:0;height:44px;border:1px solid #cfd8e3;border-radius:12px;padding:0 12px;font:inherit;font-size:17px;color:inherit;background:#fff;cursor:text;touch-action:manipulation}
.ab-girdi:focus{outline:2px solid #1d5fd6;outline-offset:0;border-color:#1d5fd6}
.ab-d{flex:none;width:44px;height:44px;border:0;border-radius:12px;background:transparent;color:#374151;display:grid;place-items:center;cursor:pointer;padding:0;text-decoration:none}
.ab-d:hover{background:#e8eef7}.ab-d:focus-visible{outline:2px solid #1d5fd6}
.ab-d svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.ab-govde{position:relative;flex:1;min-height:0;background:#fff}
.ab-if{position:absolute;inset:0;width:100%;height:100%;border:0;background:#fff}
.ab-kalkan{position:absolute;inset:0;display:none;cursor:move}
.ab-pencere.ab-tutuldu .ab-kalkan{display:block}
.ab-yuk{position:absolute;inset:auto 0 0 0;top:40%;text-align:center;color:#6b7280;margin:0;font-size:15px}
.ab-kose{position:absolute;right:0;bottom:0;width:26px;height:26px;cursor:nwse-resize;touch-action:none;background:linear-gradient(135deg,transparent 55%,#9aa7b8 55%,#9aa7b8 62%,transparent 62%,transparent 72%,#9aa7b8 72%,#9aa7b8 79%,transparent 79%)}
html.ab-bol .ab-kose{display:none}
html.ab-bol .ab-pencere{border-radius:0;box-shadow:-10px 0 40px #0f172a2a}
html.ab-bol.ab-dar .ab-pencere{border-radius:18px 18px 0 0;box-shadow:0 -10px 40px #0f172a33}
@media (min-width:1100px){html.ab-bol.ab-acik:not(.ab-dar) body{margin-right:var(--ab-gen,420px)!important}}
.ab-cip{position:fixed;z-index:2147482002;left:0;top:0;display:flex;align-items:center;gap:6px;min-height:40px;padding:0 14px;border:1px solid #cfd8e3;border-radius:999px;background:#fff;color:#1d5fd6;font:600 15px/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;box-shadow:0 6px 20px #0f172a2a;cursor:pointer;transition:opacity .16s;max-width:min(80vw,360px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ab-cip[hidden]{display:none}
.ab-cip svg{width:18px;height:18px;flex:none;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round}
:root[data-theme=dark] .ab-pencere,:root[data-theme=dark] .ab-govde,:root[data-theme=dark] .ab-if{background:#0e131b;color:#e8edf4;border-color:#283244}
:root[data-theme=dark] .ab-ust{background:#161d28;border-color:#283244}
:root[data-theme=dark] .ab-girdi{background:#0e131b;border-color:#3a475c;color:#e8edf4}
:root[data-theme=dark] .ab-d{color:#c9d3e1}:root[data-theme=dark] .ab-d:hover{background:#223047}
:root[data-theme=dark] .ab-cip{background:#161d28;border-color:#3a475c;color:#6ea2ff}
.ab-az .ab-pencere,.ab-az .ab-balon,.ab-az .ab-cip{transition:none!important}
@media print{.ab-balon,.ab-pencere,.ab-cip{display:none!important}}`;
  const IK = {
    ara: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.6-4.6"/></svg>',
    geri: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    bol: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M14 4v16"/></svg>',
    yuz: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2.5"/><rect x="11" y="10" width="8" height="7" rx="1.2"/></svg>',
    ac: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  };

  let balon = null, pencere = null, girdi = null, ifr = null, cip = null, acBag = null, kipDug = null, yukNot = null;
  let acik = false, ifHazir = false, bekleyen = null, sonDurum = null;
  const gom = () => { try { return ifr && ifr.contentWindow && ifr.contentWindow.__dkGomulu; } catch (e) { return null; } };

  function kur() {
    if (balon) return;
    const st = document.createElement('style'); st.id = 'ab-stil'; st.textContent = CSS; document.head.appendChild(st);
    balon = document.createElement('button');
    balon.type = 'button'; balon.className = 'ab-balon'; balon.innerHTML = IK.ara;
    balon.setAttribute('aria-label', 'Sitede ara (masada boşluğa iki kez bas)'); balon.title = 'Ara · masada boşluğa iki kez bas';
    if (oku('ab:gizli') === '1') balon.hidden = true;
    document.body.appendChild(balon);
    balonOlay(); balonYerle(false);
    if (DK_YEREL) { // Ders Kitaplığı: çekmece açıkken balon gizlenir (çekmece zaten arama paneli; içeriği örtmesin)
      const g = () => balon.classList.toggle('ab-gizle', document.body.classList.contains('ck-acik'));
      new MutationObserver(g).observe(document.body, { attributes: true, attributeFilter: ['class'] }); g();
    }
    addEventListener('resize', () => { balonYerle(false); if (acik) pencereYerle(); }, { passive: true });
    if (window.visualViewport) visualViewport.addEventListener('resize', () => { if (acik) pencereYerle(); }, { passive: true });
  }

  // ---------- balon: sürükle → kenara yapış; dokun → aç ----------
  const bBoy = () => (dar() ? 56 : 52);
  function balonYerle(anim) {
    if (!balon) return;
    const B = bBoy(), W = document.documentElement.clientWidth || innerWidth, H = innerHeight;
    balon.style.setProperty('--ab-b', B + 'px');
    const y = Math.round(Math.max(64, Math.min(H - B - 12, D.yo * H)));
    const pay = D.gizli ? -Math.round(B * 0.42) : 12;
    const x = D.kenar === 'sol' ? pay : W - B - pay;
    balon.style.transition = anim && !azHareket() ? 'transform .24s cubic-bezier(.2,.8,.2,1),opacity .2s' : 'opacity .2s';
    balon.style.transform = `translate3d(${x}px,${y}px,0)`;
    balon.dataset.kenar = D.kenar; balon.classList.toggle('ab-yari', !!D.gizli);
  }
  function balonOlay() {
    let s = null, raf = 0, sonSurukle = 0;
    balon.addEventListener('click', (e) => { e.preventDefault(); if (Date.now() - sonSurukle < 400) return; ac({ odak: true }); });
    balon.addEventListener('pointerdown', (e) => {
      if (e.button) return;
      const r = balon.getBoundingClientRect();
      s = { x0: e.clientX, y0: e.clientY, dx: e.clientX - r.left, dy: e.clientY - r.top, oyn: false, id: e.pointerId, x: r.left, y: r.top };
      try { balon.setPointerCapture(e.pointerId); } catch (x) { /* yok */ }
    });
    balon.addEventListener('pointermove', (e) => {
      if (!s) return;
      if (!s.oyn && Math.hypot(e.clientX - s.x0, e.clientY - s.y0) < 7) return;
      s.oyn = true; balon.classList.add('ab-tasiniyor'); s.x = e.clientX - s.dx; s.y = e.clientY - s.dy;
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (s) { balon.style.transition = 'none'; balon.style.transform = `translate3d(${s.x}px,${s.y}px,0)`; } });
    });
    const birak = (e, iptal) => {
      if (!s) return; const t = s; s = null; balon.classList.remove('ab-tasiniyor');
      if (!t.oyn) return; // dokunuş: «click»te açılır (hayalet tık alttaki bağa düşmesin, odak klavyeyi açsın)
      sonSurukle = Date.now();
      const W = document.documentElement.clientWidth || innerWidth, B = bBoy(), cx = t.x + B / 2;
      D.kenar = cx < W / 2 ? 'sol' : 'sag';
      D.gizli = D.kenar === 'sol' ? e.clientX < 26 : e.clientX > W - 26;
      D.yo = Math.max(0.08, Math.min(0.92, t.y / innerHeight));
      sakla(); balonYerle(true);
    };
    balon.addEventListener('pointerup', (e) => birak(e, false));
    balon.addEventListener('pointercancel', (e) => birak(e, true));
    balon.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  // ---------- pencere ----------
  function pencereKur() {
    if (pencere) return;
    pencere = document.createElement('div');
    pencere.className = 'ab-pencere ab-kapali'; pencere.hidden = true;
    pencere.setAttribute('role', 'dialog'); pencere.setAttribute('aria-label', 'Sitede ara');
    pencere.innerHTML = `<div class="ab-ust"><button type="button" class="ab-d ab-geri" aria-label="Geri" title="Geri">${IK.geri}</button><input class="ab-girdi" type="search" enterkeyhint="search" autocomplete="off" spellcheck="false" placeholder="Ara: kavram, terim, formül, soru" aria-label="Ara: kavram, terim, formül, soru"><button type="button" class="ab-d ab-kip" aria-label="Bölünmüş görünüm" title="Yüzen ↔ bölünmüş">${IK.bol}</button><a class="ab-d ab-ac" href="${KOK}ders-kitapligi/" aria-label="Ders Kitaplığı'nda aç" title="Ders Kitaplığı'nda aç">${IK.ac}</a><button type="button" class="ab-d ab-kapat" aria-label="Kapat" title="Kapat (Esc)">${IK.x}</button></div><div class="ab-govde"><p class="ab-yuk">Yükleniyor…</p><iframe class="ab-if" title="Ders Kitaplığı: arama ve kavramlar" referrerpolicy="same-origin"></iframe><div class="ab-kalkan"></div></div><div class="ab-kose" aria-hidden="true"></div>`;
    document.body.appendChild(pencere);
    girdi = pencere.querySelector('.ab-girdi'); ifr = pencere.querySelector('.ab-if'); acBag = pencere.querySelector('.ab-ac'); kipDug = pencere.querySelector('.ab-kip'); yukNot = pencere.querySelector('.ab-yuk');
    ifr.addEventListener('load', () => { const G = gom(); if (!G) return; ifHazir = true; yukNot.hidden = true; if (bekleyen) { const b = bekleyen; bekleyen = null; if (b.ck) G.git(b.kitap, b.ck); else G.ara(b.q || ''); } });
    let zm = 0;
    girdi.addEventListener('input', () => { clearTimeout(zm); zm = setTimeout(() => ara(girdi.value.trim()), 110); });
    girdi.addEventListener('keydown', (e) => {
      const G = gom();
      if (e.key === 'Enter') { e.preventDefault(); clearTimeout(zm); ara(girdi.value.trim()); setTimeout(() => { const g = gom(); if (g) g.ilk(); }, 160); }
      else if (e.key === 'ArrowDown' && G) { e.preventDefault(); ifr.focus(); G.odak(); }
      else if (e.key === 'Escape') { e.preventDefault(); kapat(); }
    });
    pencere.querySelector('.ab-kapat').addEventListener('click', () => kapat());
    pencere.querySelector('.ab-geri').addEventListener('click', () => { const G = gom(); if (G) G.geri(); });
    kipDug.addEventListener('click', () => { D.kip = D.kip === 'bol' ? 'yuzen' : 'bol'; sakla(); kipYaz(); pencereYerle(); });
    acBag.addEventListener('click', () => kapat(true));
    tasiOlay(); kipYaz();
  }
  function kipYaz() {
    const bol = D.kip === 'bol', h = document.documentElement;
    h.classList.toggle('ab-bol', bol); h.classList.toggle('ab-dar', dar()); h.classList.toggle('ab-az', azHareket());
    kipDug.innerHTML = bol ? IK.yuz : IK.bol; kipDug.setAttribute('aria-label', bol ? 'Yüzen pencere' : 'Bölünmüş görünüm');
  }
  // yüzen: D.p {x,y,w,h} ekrana sığdırılır; bölünmüş: masada sağda tam boy, telefonda altta
  function pencereYerle() {
    if (!pencere) return;
    const vv = window.visualViewport, W = document.documentElement.clientWidth || innerWidth, H = vv ? Math.min(innerHeight, vv.height) : innerHeight;
    document.documentElement.classList.toggle('ab-dar', dar());
    let x, y, w, h;
    if (D.kip === 'bol') {
      if (dar()) { w = W; h = Math.round(H * 0.6); x = 0; y = H - h; }
      else { w = Math.round(Math.max(360, Math.min(520, W * 0.32))); h = innerHeight; x = W - w; y = 0; document.documentElement.style.setProperty('--ab-gen', w + 'px'); }
    } else {
      const P = D.p || {};
      if (dar()) { w = W - 16; h = Math.round(Math.min(H - 24, P.h || H * 0.8)); x = 8; y = Math.round(Math.max(8, Math.min(H - h - 8, P.y != null ? P.y : H * 0.08))); }
      else {
        w = Math.round(Math.max(320, Math.min(W - 24, P.w || 440))); h = Math.round(Math.max(280, Math.min(H - 24, P.h || Math.min(720, H - 96))));
        x = P.x != null ? P.x : (D.kenar === 'sol' ? 16 : W - w - 16); y = P.y != null ? P.y : Math.max(12, Math.round((H - h) / 2));
        x = Math.round(Math.max(8, Math.min(W - w - 8, x))); y = Math.round(Math.max(8, Math.min(H - h - 8, y)));
      }
    }
    Object.assign(pencere.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
  }
  function tasiOlay() {
    const ust = pencere.querySelector('.ab-ust'), kose = pencere.querySelector('.ab-kose');
    let s = null;
    const bas = (e, tur) => {
      if (e.button || D.kip === 'bol' || (tur === 'tasi' && e.target.closest('input, button, a'))) return;
      const r = pencere.getBoundingClientRect();
      s = { tur, x0: e.clientX, y0: e.clientY, r, oyn: false };
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch (x) { /* yok */ }
    };
    const git = (e) => {
      if (!s) return;
      const dx = e.clientX - s.x0, dy = e.clientY - s.y0;
      if (!s.oyn && Math.hypot(dx, dy) < 5) return;
      if (!s.oyn) { s.oyn = true; pencere.classList.add('ab-tutuldu'); pencere.style.transition = 'none'; }
      const W = document.documentElement.clientWidth || innerWidth, H = innerHeight;
      if (s.tur === 'tasi') { pencere.style.left = Math.round(Math.max(8 - s.r.width + 120, Math.min(W - 120, s.r.left + dx))) + 'px'; pencere.style.top = Math.round(Math.max(0, Math.min(H - 60, s.r.top + dy))) + 'px'; }
      else { pencere.style.width = Math.round(Math.max(300, Math.min(W - s.r.left - 4, s.r.width + dx))) + 'px'; pencere.style.height = Math.round(Math.max(240, Math.min(H - s.r.top - 4, s.r.height + dy))) + 'px'; }
    };
    const bit = () => {
      if (!s) return; const t = s; s = null; pencere.classList.remove('ab-tutuldu'); pencere.style.transition = '';
      if (!t.oyn) return;
      const r = pencere.getBoundingClientRect(); D.p = { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; sakla(); pencereYerle();
    };
    ust.addEventListener('pointerdown', (e) => bas(e, 'tasi')); ust.addEventListener('pointermove', git); ust.addEventListener('pointerup', bit); ust.addEventListener('pointercancel', bit);
    kose.addEventListener('pointerdown', (e) => bas(e, 'boy')); kose.addEventListener('pointermove', git); kose.addEventListener('pointerup', bit); kose.addEventListener('pointercancel', bit);
    ust.addEventListener('dblclick', (e) => { if (!e.target.closest('input, button, a')) { D.p = null; sakla(); pencereYerle(); } });
  }
  function ara(q) {
    if (DK_YEREL) return;
    const G = gom();
    if (G && ifHazir) G.ara(q); else bekleyen = { q };
  }
  // aç: {q, kitap, ck (çekmece görünümü), odak}
  function ac(o = {}) {
    if (DK_YEREL) return dkYerel(o);
    kur(); pencereKur();
    const kitap = o.kitap || kitapIpucu();
    if (typeof o.q === 'string') girdi.value = o.q;
    if (!ifr.getAttribute('src')) { bekleyen = null; const u = `${KOK}ders-kitapligi/?gomulu=1#${kitap}/k/${o.ck || '_ara' + (o.q ? '/' + o.q : '')}`; ifr.setAttribute('src', 'about:blank'); setTimeout(() => { ifr.src = u; }, acik || azHareket() ? 0 : 290); } // açılış animasyonu ana iş parçacığı boşken akar
    else { const G = gom(); if (G && ifHazir) { if (o.ck) G.git(kitap, o.ck); else if (typeof o.q === 'string') G.ara(o.q); } else bekleyen = o.ck ? { kitap, ck: o.ck } : { q: o.q || '' }; }
    if (!acik) {
      acik = true; kipYaz(); pencereYerle();
      document.documentElement.classList.add('ab-acik');
      pencere.hidden = false;
      const b = balon.getBoundingClientRect(), p = pencere.getBoundingClientRect();
      pencere.style.transformOrigin = `${Math.round(b.left + b.width / 2 - p.left)}px ${Math.round(b.top + b.height / 2 - p.top)}px`;
      pencere.classList.add('ab-kapali');
      void pencere.offsetWidth; // başlangıç karesi
      requestAnimationFrame(() => pencere.classList.remove('ab-kapali'));
      balon.classList.add('ab-gizle');
    }
    if (o.odak) { girdi.focus({ preventScroll: true }); if (o.sec !== false) girdi.select(); }
  }
  function kapat(hemen) {
    if (!acik || !pencere) return;
    acik = false;
    const icinde = pencere.contains(document.activeElement) || document.activeElement === ifr;
    document.documentElement.classList.remove('ab-acik');
    balon.classList.remove('ab-gizle'); balonYerle(false);
    const b = balon.getBoundingClientRect(), p = pencere.getBoundingClientRect();
    pencere.style.transformOrigin = `${Math.round(b.left + b.width / 2 - p.left)}px ${Math.round(b.top + b.height / 2 - p.top)}px`;
    pencere.classList.add('ab-kapali');
    const gizle = () => { if (!acik) pencere.hidden = true; };
    if (hemen || azHareket()) gizle(); else setTimeout(gizle, 280);
    if (icinde) balon.focus({ preventScroll: true });
  }
  // Ders Kitaplığı'nın kendi sayfası: yerel çekmece (iframe yok)
  function dkYerel(o) {
    let h = location.hash.slice(1); try { h = decodeURIComponent(h); } catch (e) { /* bozuk */ }
    const on = h.split('/k/')[0] || o.kitap || kitapIpucu(), kid = on.split('/')[0];
    const kp = o.ck || '_ara' + (o.q ? '/' + o.q : '');
    location.hash = o.ck && o.kitap && o.kitap !== kid ? `#${o.kitap}/k/${kp}` : `#${on}/k/${kp}`;
    if (o.odak) setTimeout(() => { const i = document.getElementById('ck-ara'); if (i) { i.focus(); i.select(); } }, 120);
  }
  window.addEventListener('message', (e) => {
    if (e.origin !== location.origin || !e.data || !e.data.ab || !ifr || e.source !== ifr.contentWindow) return;
    const d = e.data;
    if (d.ab === 'git') { if (d.yeni) window.open(d.url, '_blank', 'noopener'); else { kapat(true); location.href = d.url; } }
    else if (d.ab === 'durum') { sonDurum = d; if (d.kitap) yaz('ab:kitap', d.kitap); acBag.href = `${KOK}ders-kitapligi/#${d.kitap}/k/${d.kp}`; }
    else if (d.ab === 'kapat') kapat();
    else if (d.ab === 'odak') { girdi.focus(); girdi.select(); }
  });

  // ---------- tetik: boşluğa iki kez ----------
  let bos1 = 0, bosY = 0;
  // ilk boşluğun (tarayıcının yumuşak) sayfa ilerlemesini geri al: ~0,6 sn boyunca her karede eski yere
  const geriAl = (y) => { const t0 = performance.now(); const f = () => { if (Math.abs(window.scrollY - y) > 1) window.scrollTo({ top: y, behavior: 'instant' }); if (performance.now() - t0 < 650) requestAnimationFrame(f); }; f(); };
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && acik && !yaziAlani(e.target)) { kapat(); return; }
    if (e.key !== ' ' || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || e.repeat) return;
    if (yaziAlani(e.target) || etkilesimli(e.target) || oku('ab:cift') === '0' || kalemAcik() || (pencere && pencere.contains(e.target))) { bos1 = 0; return; }
    const t = performance.now();
    if (t - bos1 < 420) {
      e.preventDefault(); bos1 = 0;
      geriAl(bosY); ac({ odak: true }); return;
    }
    bos1 = t; bosY = window.scrollY;
  }, true);

  // ---------- tetik: seçim (fare) / basılı tutup seçme (dokunma) ----------
  let TERIM = null, sonSecim = '', dokunuyor = false, stz = 0;
  const HARF = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'â': 'a', 'î': 'i', 'û': 'u' };
  const normal = (s) => String(s || '').toLocaleLowerCase('tr').replace(/[çğıöşüâîû]/g, (c) => HARF[c]).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const EK = ['larinin', 'lerinin', 'larini', 'lerini', 'lardan', 'lerden', 'larin', 'lerin', 'lari', 'leri', 'nin', 'nun', 'dan', 'den', 'tan', 'ten', 'lar', 'ler', 'in', 'un', 'da', 'de', 'ta', 'te', 'yi', 'yu', 'ya', 'ye', 'si', 'su', 'i', 'u', 'a', 'e', 's'];
  function terimler() {
    if (TERIM) return TERIM;
    TERIM = fetch(`${KOK}ortak/ara-terim.json`, { cache: 'force-cache' }).then((r) => (r.ok ? r.json() : null)).then((j) => { const M = new Map(); const KI = (j && j.k) || [], gor = (c) => { const t = c.slice(0, 1), id = c.slice(2); return t === 'k' ? `${id}/tanim` : t === 't' ? `_terim/${id}` : `_sozluk/${id}`; }; for (const [a, i, c, alt] of (j && j.t) || []) { if (M.has(a)) continue; const L = [{ k: KI[i], c: gor(c) }, ...(alt || []).map(([i2, c2]) => ({ k: KI[i2], c: gor(c2) }))]; M.set(a, L); } return M; }).catch(() => new Map());
    return TERIM;
  }
  function bul(M, t) {
    const n = normal(t); let L = M.get(n);
    if (!L && n.length >= 5) for (const e of EK) if (n.endsWith(e) && n.length - e.length >= 4 && M.has(n.slice(0, -e.length))) { L = M.get(n.slice(0, -e.length)); break; }
    if (!L) return null;
    const k = kitapIpucu(); return L.find((x) => x.k === k) || L[0]; // sayfanın kitabındaki kart öne
  }
  async function secimBak() {
    if (oku('ab:secim') === '0' || kalemAcik()) return;
    const s = window.getSelection(); if (!s || s.isCollapsed || !s.rangeCount) { cipGizle(); return; }
    const n = s.anchorNode && (s.anchorNode.nodeType === 1 ? s.anchorNode : s.anchorNode.parentElement);
    if (!n || yaziAlani(n) || n.closest('.ab-pencere, .ab-cip, .ab-balon, #cekmece')) return;
    const t = s.toString().replace(/\s+/g, ' ').trim();
    if (t.length < 2 || t.length > 60 || t.split(' ').length > 6 || !/\p{L}/u.test(t)) { cipGizle(); return; }
    if (t === sonSecim && acik) return;
    sonSecim = t;
    const M = await terimler(), h = bul(M, t);
    let r = null; try { r = s.getRangeAt(0).getBoundingClientRect(); } catch (e) { /* yok */ }
    if (h) { cipGizle(); ac({ kitap: h.k, ck: h.c, q: t, odak: false }); return; }
    cipGoster(t, r);
  }
  function cipGoster(t, r) {
    kur();
    if (!cip) {
      cip = document.createElement('button'); cip.type = 'button'; cip.className = 'ab-cip'; cip.hidden = true;
      cip.addEventListener('mousedown', (e) => e.preventDefault()); // seçim silinmesin
      cip.addEventListener('click', () => { const q = cip.dataset.q; cipGizle(); ac({ q, odak: false }); });
      document.body.appendChild(cip);
    }
    cip.dataset.q = t; cip.innerHTML = `${IK.ara}<span></span>`; cip.lastChild.textContent = `Ara: ${t.length > 32 ? t.slice(0, 31) + '…' : t}`;
    cip.hidden = false;
    const W = document.documentElement.clientWidth || innerWidth, cw = Math.min(cip.offsetWidth || 200, W - 16);
    const x = r ? Math.max(8, Math.min(W - cw - 8, r.left + r.width / 2 - cw / 2)) : W / 2 - cw / 2;
    const yA = r ? r.bottom + 10 : innerHeight / 2, y = r && r.bottom + 54 > innerHeight ? Math.max(8, r.top - 50) : yA;
    cip.style.transform = `translate3d(${Math.round(x)}px,${Math.round(dar() ? y + 34 : y)}px,0)`;
    clearTimeout(cip._z); cip._z = setTimeout(cipGizle, 6000);
  }
  function cipGizle() { if (cip) cip.hidden = true; }
  document.addEventListener('mouseup', (e) => { if (e.button === 0 && !dokunuyor) setTimeout(secimBak, 20); }, { passive: true });
  document.addEventListener('touchstart', () => { dokunuyor = true; }, { passive: true, capture: true });
  document.addEventListener('touchend', () => { dokunuyor = false; clearTimeout(stz); stz = setTimeout(secimBak, 420); }, { passive: true, capture: true });
  document.addEventListener('selectionchange', () => { if (dokunuyor) return; clearTimeout(stz); stz = setTimeout(() => { const s = window.getSelection(); if (!s || s.isCollapsed) cipGizle(); }, 200); });
  addEventListener('scroll', () => { if (cip && !cip.hidden) cipGizle(); }, { passive: true });

  // ---------- dış kanca (Akademi menüsü, ana sayfa arama kutusu, sınama) ----------
  window.AraBalon = { ac: (o) => ac(o || { odak: true }), kapat: () => kapat(), ara: (q) => ac({ q, odak: true }), acik: () => acik, durum: () => ({ D: { ...D }, son: sonDurum, ifHazir }) };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', kur, { once: true }); else kur();
})();
