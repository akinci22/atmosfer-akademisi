/* Atmosfer Akademisi — klavyeyle gezinme kipi (ETK5, 28 Kas 2026). ortak/ara-balon.js çift boşlukla tembel yükler
   (yeni <script> satırı gerekmez); tuşları ara-balon.js'in erken yakalama işleyicisi iletir (sayfanın ok tuşu işlerinden önce).
   Kip açıkken yön okları etkileşimli öğeler (bağ, düğme, sekme, girdi, özet …) arasında uzamsal gezer: yöndeki en yakın öğe
   (tablete klavye bağlanınca olduğu gibi). Enter ve kısa boşluk etkinleştirir; Esc kipten çıkar (girdi / sürgü / tuvaldeyken
   önce oradan çıkar). Odak işareti öğeden öğeye yumuşakça geçen yuvarlak vurgu (iPadOS odak işaretçisi gibi; düzeni bozmaz,
   işaretçi olaylarını almaz); öğe gerekirse yumuşakça görünür alana gelir (üstteki / alttaki sabit çubuklar hesaba katılır).
   Kapsam: açık modal → arama paneli (odak içindeyse) → Ders Kitaplığı çekmecesi (odak içindeyse) → sayfa; panelin altında kalan
   öğeler atlanır. Gömülü kitaplık iframe'inde de çalışır: panelden aşağı inince iframe'e girer, iframe'in kenarından çıkınca üst
   pencereye döner. Sürgüde yandaki oklar sürgünün, dik oklar gezinmenin; yazı alanı / tuval / video odaktayken oklar onların.
   Fare / dokunma kipi kapatmaz, yalnız vurguyu gizler; sonraki ok vurguyu yerinde geri getirir. Durum sessionStorage ab:kg. */
(function () {
  'use strict';
  if (window.__klavyeGez) return;
  const doc = document, R = doc.documentElement;
  let UST = true; try { UST = window.self === window.top; } catch (e) { UST = false; }
  const SEC = 'a[href],area[href],button,input:not([type=hidden]),select,textarea,summary,iframe.ab-if,[tabindex]:not([tabindex="-1"]),[role=button],[role=link],[role=tab],[role=menuitem],[role=menuitemradio],[role=menuitemcheckbox],[role=option],[role=checkbox],[role=radio],[role=switch],[role=slider],[contenteditable=""],[contenteditable=true],video[controls],audio[controls],label:has(> input[type=checkbox]),label:has(> input[type=radio])';
  const YON = { ArrowUp: 'yukari', ArrowDown: 'asagi', ArrowLeft: 'sol', ArrowRight: 'sag' };
  const azH = () => (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || R.dataset.hareket === 'az';
  const BIZ = '.kg-im,.kg-hud,.ab-kalkan,.ab-ipucu';
  let acik = false, cur = null, gor = false, im = null, hud = null, canli = null, hudZ = 0, raf = 0, aniZ = 0, sonGirdi = 'tus', shiftT = 0;

  const CSS = `
.kg-im{position:fixed;left:0;top:0;width:10px;height:10px;z-index:2147483600;pointer-events:none;border-radius:12px;background:rgba(29,95,214,.06);box-shadow:0 0 0 2px rgba(29,95,214,.9),0 0 0 6px rgba(29,95,214,.15),0 10px 26px -8px rgba(29,95,214,.42);opacity:0;transform:translate3d(-40px,-40px,0);transition:transform .24s cubic-bezier(.22,.9,.3,1.06),width .24s cubic-bezier(.22,.9,.3,1.06),height .24s cubic-bezier(.22,.9,.3,1.06),border-radius .24s ease,opacity .16s ease;will-change:transform,width,height}
.kg-im.kg-gor{opacity:1}
.kg-im.kg-ani{transition:opacity .16s ease}
.kg-im.kg-bas{box-shadow:0 0 0 3px rgba(29,95,214,1),0 0 0 9px rgba(29,95,214,.2),0 6px 18px -8px rgba(29,95,214,.5)}
html.kg-az .kg-im{transition:opacity .12s ease}
html.kg-acik [data-kg-odak]:focus,html.kg-acik [data-kg-odak]:focus-visible{outline:none!important}
.kg-hud{position:fixed;left:50%;bottom:calc(22px + env(safe-area-inset-bottom,0px));z-index:2147483601;display:flex;align-items:center;gap:10px;padding:10px 16px;border-radius:14px;background:rgba(28,32,40,.8);color:#fff;font:500 14px/1.2 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-backdrop-filter:saturate(180%) blur(18px);backdrop-filter:saturate(180%) blur(18px);box-shadow:0 12px 36px -10px rgba(0,0,0,.45),inset 0 0 0 .5px rgba(255,255,255,.16);transform:translate3d(-50%,14px,0) scale(.98);opacity:0;pointer-events:none;transition:transform .26s cubic-bezier(.22,1.16,.36,1),opacity .2s ease;white-space:nowrap;max-width:calc(100vw - 32px);overflow:hidden}
.kg-hud.kg-gor{opacity:1;transform:translate3d(-50%,0,0) scale(1)}
.kg-hud svg{width:20px;height:20px;flex:none;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.kg-hud kbd{font:600 12px/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;padding:3px 6px;border-radius:6px;background:rgba(255,255,255,.16);box-shadow:inset 0 0 0 .5px rgba(255,255,255,.24)}
.kg-hud .kg-s{opacity:.7;font-weight:400}
.kg-canli{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;margin:-1px}
@media print{.kg-im,.kg-hud{display:none!important}}`;
  const KLAVYE = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M6.5 14h11"/></svg>';

  function kur() {
    if (im || !doc.body) return;
    const st = doc.createElement('style'); st.id = 'kg-stil'; st.textContent = CSS; (doc.head || R).appendChild(st);
    im = doc.createElement('div'); im.className = 'kg-im'; im.setAttribute('aria-hidden', 'true'); doc.body.appendChild(im);
    canli = doc.createElement('div'); canli.className = 'kg-canli'; canli.setAttribute('role', 'status'); canli.setAttribute('aria-live', 'polite'); doc.body.appendChild(canli);
    addEventListener('scroll', () => yerleIste(true), { capture: true, passive: true });
    addEventListener('resize', () => yerleIste(true), { passive: true });
    addEventListener('keydown', (e) => { sonGirdi = 'tus'; if (e.key === 'Shift') { if (!shiftT) shiftT = performance.now(); } }, true);
    addEventListener('keyup', (e) => { if (e.key === 'Shift') shiftT = 0; }, true);
    addEventListener('pointerdown', (e) => {
      sonGirdi = 'isaret'; if (!acik) return;
      gizle();
      const t = e.target && e.target.closest ? e.target.closest(SEC) : null;
      if (t && uygun(t)) isaretle(t);
    }, { capture: true, passive: true });
    doc.addEventListener('focusin', (e) => { // Tab ile gelen odak vurguyu taşır
      if (!acik || sonGirdi !== 'tus') return;
      const t = e.target; if (!t || t.nodeType !== 1 || t === doc.body || t === cur || t.matches(BIZ) || (t.tagName === 'IFRAME')) return;
      isaretle(t); goster();
    }, true);
    addEventListener('hashchange', () => { if (cur && !cur.isConnected) { cur = null; gizle(); } });
  }
  function isaretle(el) { if (cur && cur !== el) cur.removeAttribute('data-kg-odak'); cur = el; if (el) el.setAttribute('data-kg-odak', ''); }

  // ---------- aday öğeler ----------
  function uygun(el) {
    if (!el || el.nodeType !== 1 || el.disabled || el.matches(BIZ)) return false;
    if (el.tagName === 'INPUT' && (el.type === 'hidden')) return false;
    if (el.closest('[inert],[aria-hidden="true"],[hidden]')) return false;
    if (el.getAttribute('tabindex') === '-1' && !el.matches('[role=menuitem],[role=menuitemradio],[role=menuitemcheckbox],[role=option],[role=tab],[role=treeitem],[role=gridcell]')) return false; // Tab sırasından bilerek çıkarılmış (yinelenen kapak düğmesi gibi)
    const r = el.getBoundingClientRect(); if (r.width < 3 || r.height < 3) return false;
    if (el.checkVisibility && !el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false;
    return true;
  }
  function ortuler(sc) { // kapsamın dışında kalan, üstte yüzen paneller (altındaki öğeler atlanır)
    const L = [];
    if (!UST) return L;
    for (const s of ['.ab-pencere:not([hidden]):not(.ab-kapali)', '.ab-menu:not([hidden])']) { const x = doc.querySelector(s); if (x && !x.hasAttribute('aria-hidden') && !sc.contains(x) && !x.contains(sc)) L.push({ el: x, r: x.getBoundingClientRect() }); }
    const ck = doc.getElementById('cekmece');
    if (ck && !ck.hidden && doc.body.classList.contains('ck-acik') && !ck.contains(sc) && getComputedStyle(ck).position === 'fixed') L.push({ el: ck, r: ck.getBoundingClientRect() });
    return L;
  }
  function adaylar(sc) {
    const H = innerHeight, L = [], ort = ortuler(sc);
    for (const el of sc.querySelectorAll(SEC)) {
      if (!uygun(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.bottom < -4 * H || r.top > 5 * H) continue;
      const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
      if (ort.some((o) => !o.el.contains(el) && cx >= o.r.left && cx <= o.r.right && cy >= o.r.top && cy <= o.r.bottom)) continue;
      L.push({ el, r });
    }
    // öğe içeren genel kaplar ([tabindex] sarmalayıcı) atlanır; içindekiler kalır
    return L.filter((a) => !(a.el.matches('[tabindex]:not(a,button,input,select,textarea,summary,[role])') && L.some((b) => b !== a && a.el.contains(b.el))));
  }
  function kapsam() {
    const ae = doc.activeElement;
    const modal = [...doc.querySelectorAll('[aria-modal="true"],dialog[open]')].filter((x) => x.getClientRects().length && !x.closest('[hidden]') && !x.hasAttribute('aria-hidden')).pop();
    if (modal) return modal;
    if (UST) {
      const p = doc.querySelector('.ab-pencere:not([hidden]):not(.ab-kapali)');
      if (p && !p.hasAttribute('aria-hidden') && (p.contains(ae) || (cur && p.contains(cur)))) return p;
      const ck = doc.getElementById('cekmece');
      if (ck && !ck.hidden && doc.body.classList.contains('ck-acik') && (ck.contains(ae) || (cur && ck.contains(cur)))) return ck;
    }
    return doc.body;
  }
  // yöndeki aday puanı (küçük = iyi): ana eksendeki boşluk + yan kayma cezası; aynı sıra / sütun önde
  function puan(c, t, yon) {
    const cx = (c.left + c.right) / 2, cy = (c.top + c.bottom) / 2, tx = (t.left + t.right) / 2, ty = (t.top + t.bottom) / 2;
    let ana, ort, sap;
    if (yon === 'asagi') { if (ty <= cy + 1 || t.top < c.top + 1) return Infinity; ana = Math.max(0, t.top - c.bottom); ort = Math.min(c.right, t.right) - Math.max(c.left, t.left); sap = Math.abs(tx - cx); }
    else if (yon === 'yukari') { if (ty >= cy - 1 || t.bottom > c.bottom - 1) return Infinity; ana = Math.max(0, c.top - t.bottom); ort = Math.min(c.right, t.right) - Math.max(c.left, t.left); sap = Math.abs(tx - cx); }
    else if (yon === 'sag') { if (tx <= cx + 1 || t.left < c.left + 1) return Infinity; ana = Math.max(0, t.left - c.right); ort = Math.min(c.bottom, t.bottom) - Math.max(c.top, t.top); sap = Math.abs(ty - cy); }
    else { if (tx >= cx - 1 || t.right > c.right - 1) return Infinity; ana = Math.max(0, c.left - t.right); ort = Math.min(c.bottom, t.bottom) - Math.max(c.top, t.top); sap = Math.abs(ty - cy); }
    return ana + (ort >= 0 ? 0 : 24 - ort * 2) + sap * 0.05;
  }
  function enIyi(L, c, yon, haric) {
    let en = null, p = Infinity;
    for (const a of L) { if (a.el === haric || (haric && (a.el.contains(haric) || haric.contains(a.el)))) continue; const q = puan(c, a.r, yon); if (q < p) { p = q; en = a; } }
    return en;
  }
  function pay(alt) { // sabit / yapışkan üst ya da alt çubuğun kapladığı yükseklik
    const W = R.clientWidth, H = innerHeight; let y = 0;
    for (const x of [W * 0.2, W * 0.5, W * 0.8]) {
      let n = doc.elementFromPoint(x, alt ? H - 2 : 2);
      if (n && n.closest('.ab-pencere,.ab-balon,.ab-kulak,.ab-menu,.kg-im,.kg-hud')) continue;
      for (let i = 0; n && n !== doc.body && n !== R && i < 8; i++, n = n.parentElement) {
        const p = getComputedStyle(n).position;
        if (p === 'fixed' || p === 'sticky') { const r = n.getBoundingClientRect(); const v = alt ? H - r.top : r.bottom; if (v > 0 && v < H * 0.35) y = Math.max(y, v); break; }
      }
    }
    return y;
  }
  function baslangic(L, yon) {
    const ust = pay(false), alt = innerHeight - pay(true);
    const gorunen = L.filter((a) => a.r.bottom > ust + 2 && a.r.top < alt - 2);
    const K = gorunen.length ? gorunen : L;
    if (!K.length) return null;
    const sira = (a, b) => (Math.round(a.r.top / 8) - Math.round(b.r.top / 8)) || (a.r.left - b.r.left);
    const S = K.slice().sort(sira);
    return yon === 'yukari' || yon === 'sol' ? S[S.length - 1] : S[0];
  }

  // ---------- görünür alana getir + vurgu ----------
  function kabDisi(el, r) {
    for (let n = el.parentElement, i = 0; n && n !== doc.body && n !== R && i < 14; i++, n = n.parentElement) {
      if (n.scrollHeight > n.clientHeight + 2 || n.scrollWidth > n.clientWidth + 2) {
        const o = getComputedStyle(n); if (!/auto|scroll|overlay/.test(o.overflowY + o.overflowX)) continue;
        const p = n.getBoundingClientRect(); return r.top < p.top + 2 || r.bottom > p.bottom - 2 || r.left < p.left - 1 || r.right > p.right + 1;
      }
    }
    return false;
  }
  function gorunurYap(el) {
    const r = el.getBoundingClientRect(), H = innerHeight, W = R.clientWidth, ust = pay(false), alt = pay(true);
    if (!(r.top < ust + 6 || r.bottom > H - alt - 6 || r.left < 0 || r.right > W || kabDisi(el, r))) return;
    const s = el.style, t0 = s.scrollMarginTop, b0 = s.scrollMarginBottom;
    s.scrollMarginTop = Math.round(ust + 16) + 'px'; s.scrollMarginBottom = Math.round(alt + 16) + 'px';
    try { el.scrollIntoView({ block: r.height > H - ust - alt - 32 ? 'start' : 'nearest', inline: 'nearest', behavior: azH() ? 'auto' : 'smooth' }); } catch (e) { el.scrollIntoView(); }
    setTimeout(() => { s.scrollMarginTop = t0; s.scrollMarginBottom = b0; }, 800);
  }
  function yerle() {
    if (!im || !cur || !gor) return;
    if (!cur.isConnected) { cur = null; gizle(); return; }
    const r = cur.getBoundingClientRect();
    if (r.width < 1 && r.height < 1) { im.classList.remove('kg-gor'); return; }
    const p = r.width > 360 || r.height > 220 ? 2 : 4;
    let rad = 10; try { rad = Math.round(Math.min(22, Math.max(8, (parseFloat(getComputedStyle(cur).borderTopLeftRadius) || 0) + p))); } catch (e) { /* yok */ }
    im.style.width = Math.round(r.width + p * 2) + 'px'; im.style.height = Math.round(r.height + p * 2) + 'px';
    im.style.borderRadius = rad + 'px';
    im.style.transform = `translate3d(${Math.round(r.left - p)}px,${Math.round(r.top - p)}px,0)`;
    im.classList.add('kg-gor');
  }
  function yerleIste(ani) {
    if (!gor || !im) return;
    if (ani) { im.classList.add('kg-ani'); clearTimeout(aniZ); aniZ = setTimeout(() => im && im.classList.remove('kg-ani'), 140); }
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; yerle(); });
  }
  function goster() { kur(); gor = true; R.classList.toggle('kg-az', azH()); if (im) im.classList.remove('kg-ani'); yerle(); }
  function gizle() { gor = false; if (im) im.classList.remove('kg-gor'); }
  function itele(yon) { // kenar: vurgu yerinde küçük bir sekme yapar
    if (!im || !gor || azH()) return;
    const d = 7, dx = yon === 'sag' ? d : yon === 'sol' ? -d : 0, dy = yon === 'asagi' ? d : yon === 'yukari' ? -d : 0;
    const t = im.style.transform; im.style.transform = t.replace(/translate3d\(([-\d.]+)px,([-\d.]+)px/, (m, x, y) => `translate3d(${+x + dx}px,${+y + dy}px`);
    setTimeout(() => yerle(), 120);
  }
  function git(el, yon, kaynak) {
    if (el.tagName === 'IFRAME') return icerGir(el, yon, kaynak);
    isaretle(el);
    if (doc.activeElement !== el) { try { el.focus({ preventScroll: true, focusVisible: false }); } catch (e) { /* yok */ } }
    gorunurYap(el); goster();
    clearTimeout(el._kgZ1); clearTimeout(el._kgZ2); el._kgZ1 = setTimeout(yerle, 170); el._kgZ2 = setTimeout(yerle, 360); // odakla gelen geçişli büyüme / kayma bitince yeniden otur
    const ad = (el.getAttribute('aria-label') || el.textContent || el.value || el.title || '').replace(/\s+/g, ' ').trim().slice(0, 80);
    if (canli && ad) canli.textContent = ad;
  }

  // ---------- gezinme ----------
  function ilerle(yon) {
    kur();
    const sc = kapsam();
    let c = cur && cur.isConnected && sc.contains(cur) && uygun(cur) ? cur : null;
    if (c) { const r = c.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) c = null; } // fareyle uzağa gidilmiş: görünenden başla
    if (c && !gor) { goster(); gorunurYap(c); return; } // vurgu gizliydi: ilk basış yerinde gösterir
    const L = adaylar(sc);
    if (!c) { const a = baslangic(L, yon); if (a) git(a.el, yon); else bosIlerle(yon, sc); return; }
    const en = enIyi(L, c.getBoundingClientRect(), yon, c);
    if (en) { git(en.el, yon, c.getBoundingClientRect()); return; }
    if (!UST && disariCik(yon, c.getBoundingClientRect())) return;
    bosIlerle(yon, sc); itele(yon);
  }
  function bosIlerle(yon, sc) { // yönde öğe yok: dikeyde biraz ilerlet (metni okumak için)
    if (yon !== 'asagi' && yon !== 'yukari') return;
    const bas = cur && cur.isConnected ? cur : sc === doc.body ? null : sc;
    let n = bas, el = null;
    for (let i = 0; n && n.nodeType === 1 && n !== doc.body && n !== R && i < 30; i++, n = n.parentElement) { if (n.scrollHeight > n.clientHeight + 2 && /auto|scroll|overlay/.test(getComputedStyle(n).overflowY)) { el = n; break; } }
    const kok = !el, h = kok ? innerHeight : el.clientHeight, dy = (yon === 'asagi' ? 1 : -1) * Math.round(h * 0.4);
    (kok ? window : el).scrollBy({ top: dy, behavior: azH() ? 'auto' : 'smooth' });
  }
  // üst pencere → gömülü kitaplık
  function icerGir(ifr, yon, kaynak) {
    let w = null; try { w = ifr.contentWindow; } catch (e) { return; }
    if (!w) return;
    gizle(); isaretle(ifr);
    try { ifr.focus(); } catch (e) { /* yok */ }
    const fr = ifr.getBoundingClientRect(), x = kaynak ? (kaynak.left + kaynak.right) / 2 - fr.left : fr.width / 2;
    const bas = (K) => { K.ac(true); K.gir(yon, x); };
    if (w.__klavyeGez) bas(w.__klavyeGez); else if (w.__abKgYukle) w.__abKgYukle(bas);
  }
  // gömülü kitaplık → üst pencere
  function disariCik(yon, cr) {
    let P = null, fe = null; try { P = parent.__klavyeGez; fe = frameElement; } catch (e) { return false; }
    if (!P || !fe) return false;
    const f = fe.getBoundingClientRect(), r = { left: f.left + cr.left, right: f.left + cr.right, top: f.top + cr.top, bottom: f.top + cr.bottom };
    if (!P.disaridan(yon, r, fe)) return false;
    gizle(); return true;
  }
  function disaridan(yon, r, haric) {
    const sc = haric.closest('.ab-pencere') || doc.body;
    const en = enIyi(adaylar(sc).filter((a) => a.el !== haric), r, yon, haric);
    if (!en) return false;
    git(en.el, yon); return true;
  }
  function gir(yon, x) {
    kur();
    const L = adaylar(doc.body); if (!L.length) return;
    const ust = pay(false), alt = innerHeight - pay(true), G = L.filter((a) => a.r.bottom > ust && a.r.top < alt);
    const K = G.length ? G : L;
    const ana = (a) => (yon === 'yukari' ? -a.r.bottom : yon === 'sol' ? -a.r.right : yon === 'sag' ? a.r.left : a.r.top);
    const yan = (a) => Math.abs((a.r.left + a.r.right) / 2 - x);
    const S = K.slice().sort((a, b) => (Math.round(ana(a) / 12) - Math.round(ana(b) / 12)) || (yan(a) - yan(b)));
    git(S[0].el, yon);
  }

  // ---------- etkinleştir ----------
  const YAZI = /^(text|search|email|url|tel|password|number|date|time|datetime-local|month|week)$/;
  function etkinlestir(el) {
    el = el || cur; if (!el || !el.isConnected) return false;
    if (el.tagName === 'IFRAME') { icerGir(el, 'asagi'); return true; }
    const tip = (el.type || '').toLowerCase();
    if ((el.tagName === 'INPUT' && YAZI.test(tip)) || el.tagName === 'TEXTAREA' || el.isContentEditable) { el.focus(); return true; }
    if (el.tagName === 'SELECT') { el.focus(); try { if (el.showPicker) el.showPicker(); } catch (e) { /* yok */ } return true; }
    if (im && gor) { im.classList.add('kg-bas'); setTimeout(() => im && im.classList.remove('kg-bas'), 160); }
    el.click();
    return true;
  }
  // okları kendisi kullanan öğe (o tuşu ona bırak)
  function okSahibi(el, k) {
    if (!el || el === doc.body || el === R) return false;
    const yatay = k === 'ArrowLeft' || k === 'ArrowRight';
    if (el.isContentEditable || el.tagName === 'TEXTAREA' || el.tagName === 'CANVAS' || el.tagName === 'VIDEO' || el.tagName === 'AUDIO') return true;
    if (el.tagName === 'INPUT') { const t = (el.type || 'text').toLowerCase(); if (t === 'range') return yatay; if (t === 'number') return true; if (YAZI.test(t)) return yatay; return false; }
    if (el.tagName === 'SELECT') return !yatay;
    const rol = el.getAttribute('role');
    if (rol === 'slider' || rol === 'spinbutton' || rol === 'scrollbar') return (el.getAttribute('aria-orientation') === 'vertical') ? !yatay : yatay;
    if (rol === 'application' || el.closest('[role=application],[data-kg-birak]')) return true;
    return false;
  }

  function tus(e) {
    if (!acik || e.ctrlKey || e.metaKey || e.altKey) return false;
    const yon = YON[e.key], ae = doc.activeElement;
    if (yon) {
      if (e.shiftKey && shiftT && performance.now() - shiftT > 90) return false; // bilerek Shift + ok: sayfanın / uygulamanın
      if (okSahibi(ae, e.key)) return false;
      e.preventDefault(); e.stopImmediatePropagation();
      ilerle(yon); return true;
    }
    if (e.key === 'Enter') {
      if (!cur || !gor || !cur.isConnected) return false;
      if (ae === cur && ((ae.tagName === 'INPUT' && YAZI.test((ae.type || 'text').toLowerCase())) || ae.tagName === 'TEXTAREA' || ae.isContentEditable)) return false;
      e.preventDefault(); e.stopImmediatePropagation(); etkinlestir(cur); return true;
    }
    return false;
  }
  // Esc: önce odaktaki yazı alanından / sürgüden / tuvalden çık (vurgu üstünde kalır)
  function birakabilir(e) { const ae = doc.activeElement; return !!(ae && ae !== doc.body && ae !== R && (okSahibi(ae, 'ArrowLeft') || okSahibi(ae, 'ArrowUp')) && !(ae.classList && ae.classList.contains('ab-girdi')) && e.key === 'Escape'); }
  function birak() { const ae = doc.activeElement; if (ae && ae.blur) { isaretle(ae); ae.blur(); goster(); } }

  function duyur(on, kisa) {
    if (!UST || !doc.body) return;
    kur();
    if (!hud) { hud = doc.createElement('div'); hud.className = 'kg-hud'; hud.setAttribute('aria-hidden', 'true'); doc.body.appendChild(hud); }
    hud.innerHTML = on ? `${KLAVYE}<span>Klavyeyle gez</span>${kisa ? '' : '<span class="kg-s">oklar gezer</span><kbd>Enter</kbd><span class="kg-s">seçer</span><kbd>Esc</kbd><span class="kg-s">çıkar</span>'}` : `${KLAVYE}<span>Klavyeyle gez kapandı</span>`;
    canli.textContent = on ? 'Klavyeyle gezinme açık: yön okları öğeler arasında gezer, Enter seçer, Esc çıkar.' : 'Klavyeyle gezinme kapandı.';
    void hud.offsetWidth; hud.classList.add('kg-gor');
    clearTimeout(hudZ); hudZ = setTimeout(() => hud && hud.classList.remove('kg-gor'), on ? (kisa ? 1300 : 2600) : 1300);
  }
  function ac(sessiz) {
    kur();
    if (!acik) { acik = true; R.classList.add('kg-acik'); R.classList.toggle('kg-az', azH()); }
    if (sessiz !== true) duyur(true, sessiz === 'kisa');
  }
  function kapat(sessiz) {
    if (!acik) return;
    acik = false; gizle(); if (cur) cur.removeAttribute('data-kg-odak'); R.classList.remove('kg-acik');
    if (!sessiz) duyur(false);
  }
  window.__klavyeGez = {
    ac, kapat, acik: () => acik, tus, birakabilir, birak, gir, disaridan,
    varMi: () => !!(acik && cur && gor && cur.isConnected),
    bosluk: () => (acik && cur && gor && cur.isConnected ? etkinlestir(cur) : false),
    durum: () => ({ acik, gor, cur: cur ? `${cur.tagName}${cur.className && typeof cur.className === 'string' ? '.' + cur.className.split(' ')[0] : ''}` : null, ad: cur ? (cur.getAttribute('aria-label') || cur.textContent || '').trim().slice(0, 40) : null, im: im ? im.getBoundingClientRect().toJSON() : null }),
  };
})();
