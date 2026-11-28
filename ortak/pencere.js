/* ortak/pencere.js — ETK6 AYRI PENCERE (28 Kas 2026): küçük, ayrı yüzen pencereler (masa + telefon).
   window.AbPencere.ac({ anahtar, baslik, ciz(kap) → { dur() }? | url, w, h }) → pencere; .liste() · .odakla(anahtar) · .kapat(anahtar) · .hepsiniKapat()
   En temiz HUD: ince yarı saydam başlık şeridi (sürükle) · «⋯» (ortak menü: kenara gizle sağ / sol, boyu sıfırla, hepsini kapat) · ×;
   kenar ve köşe boyut tutamakları; en çok 4 pencere (beşincide en eski kapanır); odaklanan öne gelir; konum / boy anahtar başına hatırlanır
   (localStorage abp:<anahtar>); Esc odaktaki pencereyi kapatır. Ortak menü ve kenar hapı ara-balon.js'in window.__abOrtak'ından (yoksa yalnız ×). */
(function () {
  'use strict';
  if (window.AbPencere) return;
  const ENCOK = 4, Z0 = 2147481950, KISA = 32;
  const L = []; let Z = Z0, sira = 0;
  const AO = () => window.__abOrtak || null;
  const sinir = (v, a, b) => Math.max(a, Math.min(b, v));
  const oku = (a) => { try { return JSON.parse(localStorage.getItem(a) || 'null'); } catch (e) { return null; } };
  const yaz = (a, v) => { try { localStorage.setItem(a, JSON.stringify(v)); } catch (e) { /* depolama kapalı */ } };
  const tel = () => matchMedia('(max-width: 640px)').matches;
  const W = () => document.documentElement.clientWidth || innerWidth, H = () => (window.visualViewport ? visualViewport.height : innerHeight);
  const IK = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  function stil() {
    if (document.getElementById('abp-stil')) return;
    const s = document.createElement('style'); s.id = 'abp-stil';
    s.textContent = `
.abp{position:fixed;left:0;top:0;display:flex;flex-direction:column;min-width:200px;min-height:140px;background:var(--zemin,#fff);color:var(--yazi,#16181d);border:1px solid var(--cizgi,#d6dbe1);border-radius:14px;box-shadow:0 18px 48px rgba(10,20,40,.22),0 2px 8px rgba(10,20,40,.08);overflow:hidden;font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;contain:layout;outline:none}
.abp.abp-on{box-shadow:0 22px 60px rgba(10,20,40,.28),0 2px 10px rgba(10,20,40,.1);border-color:color-mix(in srgb,var(--acc,#1d5fd6) 45%,var(--cizgi,#d6dbe1))}
.abp-bas{flex:none;display:flex;align-items:center;gap:2px;height:${KISA}px;padding:0 2px 0 12px;background:color-mix(in srgb,var(--zemin,#fff) 72%,transparent);border-bottom:1px solid color-mix(in srgb,var(--cizgi,#d6dbe1) 70%,transparent);cursor:move;touch-action:none;user-select:none;-webkit-user-select:none;backdrop-filter:blur(6px)}
.abp-ad{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:600;color:var(--ikincil,#5b6472)}
.abp-dug{flex:none;display:inline-flex;align-items:center;justify-content:center;width:30px;height:28px;padding:0;border:0;border-radius:8px;background:transparent;color:var(--ikincil,#5b6472);cursor:pointer}
.abp-dug:hover,.abp-dug:focus-visible{background:color-mix(in srgb,var(--acc,#1d5fd6) 12%,transparent);color:var(--yazi,#16181d)}
.abp-dug svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}
.abp-ic{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;padding:10px 12px}
.abp-ic.abp-cerceve{padding:0;overflow:hidden}
.abp-ic iframe{display:block;width:100%;height:100%;border:0;background:var(--zemin,#fff)}
.abp-t{position:absolute;z-index:2;touch-action:none}
.abp-t[data-k=l]{left:0;top:${KISA}px;bottom:14px;width:8px;cursor:ew-resize}.abp-t[data-k=r]{right:0;top:${KISA}px;bottom:14px;width:8px;cursor:ew-resize}
.abp-t[data-k=b]{left:14px;right:14px;bottom:0;height:8px;cursor:ns-resize}
.abp-t[data-k=bl]{left:0;bottom:0;width:18px;height:18px;cursor:nesw-resize}.abp-t[data-k=br]{right:0;bottom:0;width:18px;height:18px;cursor:nwse-resize}
.abp-t[data-k=br]::after{content:"";position:absolute;right:4px;bottom:4px;width:8px;height:8px;border-right:2px solid var(--cizgi,#c3c9d1);border-bottom:2px solid var(--cizgi,#c3c9d1);border-radius:0 0 3px 0}
.abp-surukle,.abp-surukle *{user-select:none!important;-webkit-user-select:none!important}
.abp-surukle iframe{pointer-events:none}
@media (pointer:coarse){.abp-bas{height:40px}.abp-dug{width:40px;height:38px}.abp-t[data-k=l],.abp-t[data-k=r]{width:14px}.abp-t[data-k=b]{height:14px}.abp-t[data-k=bl],.abp-t[data-k=br]{width:26px;height:26px}}
@media (prefers-reduced-motion:no-preference){.abp{transition:box-shadow .15s,border-color .15s}}`;
    document.head.appendChild(s);
  }
  function oneGetir(p) { if (p.el.style.zIndex !== String(Z)) p.el.style.zIndex = String(++Z); L.forEach((x) => x.el.classList.toggle('abp-on', x === p)); }
  function yerlestir(p, x, y, w, h, kalici) {
    const vw = W(), vh = H(), kb = matchMedia('(pointer:coarse)').matches ? 40 : KISA;
    w = sinir(w, Math.min(200, vw - 16), vw - 8); h = sinir(h, Math.min(140, vh - 16), vh - 8);
    x = sinir(x, 64 - w, vw - 64); y = sinir(y, 0, vh - kb); // başlık şeridi ekranda kalır
    Object.assign(p.g, { x, y, w, h });
    Object.assign(p.el.style, { left: `${Math.round(x)}px`, top: `${Math.round(y)}px`, width: `${Math.round(w)}px`, height: `${Math.round(h)}px` });
    if (kalici) yaz(`abp:${p.anahtar}`, p.g);
  }
  function ilkYer(o) {
    const k = oku(`abp:${o.anahtar}`); if (k && k.w) return k;
    const vw = W(), vh = H(), n = L.length;
    if (tel()) { const y = 8 + n * 30; return { x: 8, y, w: vw - 16, h: Math.max(200, Math.round(vh * 0.45) - y - 8) }; } // telefonda üstte, ekranın üst %45'inde (alttaki panel ve araç satırı açık kalır)
    const w = o.w || Math.min(560, vw * 0.42), h = o.h || Math.min(480, vh * 0.62);
    return { x: o.yer === 'sol' ? 24 + n * 30 : Math.max(16, vw - w - 40 - n * 30), y: 80 + n * 30, w, h }; // yer: 'sol' → yan paneli örtmez
  }
  function kapat(p) {
    const i = L.indexOf(p); if (i < 0) return;
    L.splice(i, 1);
    try { if (p.tutucu && p.tutucu.dur) p.tutucu.dur(); } catch (e) { /* */ }
    if (p.kb) { try { p.kb.getir(true); const k = p.kb.hap(); if (k) k.remove(); } catch (e) { /* */ } }
    p.el.remove();
    const s = L[L.length - 1]; if (s) oneGetir(s);
    document.dispatchEvent(new CustomEvent('abpencere', { detail: { tur: 'kapat', anahtar: p.anahtar } }));
  }
  function kenarKur(p) {
    const A = AO(); if (!A || !A.kenar || p.kb) return p.kb;
    p.kb = A.kenar({ el: () => p.el, tx: (y) => (y === 'sag' ? W() - p.g.x + 12 : -(p.g.x + p.g.w) - 12), yer: () => ({ top: p.g.y, h: p.g.h }), getir: () => { p.kb.getir(false); p.gizli = null; oneGetir(p); }, ad: `Pencereyi geri getir: ${p.baslik}`, title: `${p.baslik} · dokun ya da içeri sürükle` });
    return p.kb;
  }
  function menuAc(p, btn, klavye) {
    const A = AO(); if (!A) return;
    if (A.menuAcik()) { A.menuKapat(false); return; }
    const I = A.IK || {};
    const og = [{ id: 'gizSag', ad: 'Sağa gizle', ik: I.gizSag || '' }, { id: 'gizSol', ad: 'Sola gizle', ik: I.gizSol || '' }, '-', { id: 'sifir', ad: 'Boyu ve yeri sıfırla', ik: '' }];
    if (L.length > 1) og.push({ id: 'hepsi', ad: `Bütün pencereleri kapat (${L.length})`, ik: '' });
    og.push('-', { id: 'kapat', ad: 'Kapat', ik: I.x || '', kisa: 'Esc' });
    A.menu(btn, og, (id) => {
      A.menuKapat(false);
      if (id === 'kapat') kapat(p);
      else if (id === 'hepsi') [...L].forEach(kapat);
      else if (id === 'sifir') { try { localStorage.removeItem(`abp:${p.anahtar}`); } catch (e) { /* */ } const g = ilkYer({ anahtar: '' }); yerlestir(p, g.x, g.y, g.w, g.h, false); }
      else if (id === 'gizSag' || id === 'gizSol') { const kb = kenarKur(p); if (kb) { p.gizli = id === 'gizSag' ? 'sag' : 'sol'; kb.gizle(p.gizli); } }
    }, klavye, { ad: 'Pencere seçenekleri' });
  }
  function surukleKur(p) {
    let s = null;
    const bas = (e, k) => {
      if (e.button) return;
      s = { k, x0: e.clientX, y0: e.clientY, g: { ...p.g }, id: e.pointerId };
      e.currentTarget.setPointerCapture(e.pointerId); document.documentElement.classList.add('abp-surukle'); e.preventDefault();
    };
    const tasi = (e) => {
      if (!s || e.pointerId !== s.id) return;
      const dx = e.clientX - s.x0, dy = e.clientY - s.y0, g = s.g; let { x, y, w, h } = g;
      if (s.k === 'tasi') { x += dx; y += dy; }
      else { if (s.k.includes('r')) w += dx; if (s.k.includes('l')) { w -= dx; x += dx; } if (s.k.includes('b')) h += dy; if (s.k === 'l' || s.k === 'bl') { const mw = Math.min(200, W() - 16); if (w < mw) { x -= mw - w; w = mw; } } }
      yerlestir(p, x, y, w, h, false);
    };
    const bit = (e) => { if (!s || (e.pointerId !== undefined && e.pointerId !== s.id)) return; s = null; document.documentElement.classList.remove('abp-surukle'); yaz(`abp:${p.anahtar}`, p.g); };
    const bs = p.el.querySelector('.abp-bas');
    bs.addEventListener('pointerdown', (e) => { if (!e.target.closest('button')) bas(e, 'tasi'); });
    bs.addEventListener('dblclick', (e) => { if (!e.target.closest('button')) { try { localStorage.removeItem(`abp:${p.anahtar}`); } catch (x) { /* */ } const g = ilkYer({ anahtar: '' }); yerlestir(p, g.x, g.y, g.w, g.h, false); } });
    p.el.querySelectorAll('.abp-t').forEach((t) => t.addEventListener('pointerdown', (e) => bas(e, t.dataset.k)));
    [bs, ...p.el.querySelectorAll('.abp-t')].forEach((t) => { t.addEventListener('pointermove', tasi); t.addEventListener('pointerup', bit); t.addEventListener('pointercancel', bit); });
  }
  function ac(o) {
    stil();
    const anahtar = String(o.anahtar || `p${++sira}`);
    const var0 = L.find((x) => x.anahtar === anahtar);
    if (var0) { if (var0.kb && var0.gizli) var0.kb.getir(false), var0.gizli = null; oneGetir(var0); var0.el.focus({ preventScroll: true }); return var0; }
    while (L.length >= ENCOK) kapat(L[0]);
    const el = document.createElement('section');
    el.className = 'abp'; el.tabIndex = -1; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', o.baslik || 'Pencere');
    el.innerHTML = `<div class="abp-bas" title="Sürükle: taşı · çift tık: yerine"><span class="abp-ad"></span><button type="button" class="abp-dug abp-men" aria-label="Pencere seçenekleri" title="Seçenekler">${IK('<circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/>')}</button><button type="button" class="abp-dug abp-x" aria-label="Kapat (Esc)" title="Kapat (Esc)">${IK('<path d="M6 6l12 12M18 6 6 18"/>')}</button></div><div class="abp-ic"></div><div class="abp-t" data-k="l"></div><div class="abp-t" data-k="r"></div><div class="abp-t" data-k="b"></div><div class="abp-t" data-k="bl"></div><div class="abp-t" data-k="br"></div>`;
    el.querySelector('.abp-ad').textContent = o.baslik || '';
    const p = { anahtar, baslik: o.baslik || '', el, g: {}, tutucu: null, kb: null, gizli: null, url: o.url || null };
    if (!AO()) el.querySelector('.abp-men').hidden = true;
    document.body.appendChild(el); L.push(p);
    const g = ilkYer({ ...o, anahtar }); yerlestir(p, g.x, g.y, g.w, g.h, false); oneGetir(p);
    const ic = el.querySelector('.abp-ic');
    if (o.url) { ic.classList.add('abp-cerceve'); const f = document.createElement('iframe'); f.src = o.url; f.title = o.baslik || 'Pencere'; ic.appendChild(f); }
    else if (o.ciz) { try { p.tutucu = o.ciz(ic, p) || null; } catch (e) { ic.textContent = 'Bu bölüm pencerede çizilemedi.'; } }
    el.addEventListener('pointerdown', () => oneGetir(p), true);
    el.addEventListener('focusin', () => oneGetir(p));
    el.querySelector('.abp-x').addEventListener('click', () => kapat(p));
    el.querySelector('.abp-men').addEventListener('click', (e) => menuAc(p, e.currentTarget, e.detail === 0));
    el.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !e.defaultPrevented && !(AO() && AO().menuAcik())) { e.preventDefault(); e.stopPropagation(); kapat(p); } });
    surukleKur(p);
    el.focus({ preventScroll: true });
    document.dispatchEvent(new CustomEvent('abpencere', { detail: { tur: 'ac', anahtar } }));
    return p;
  }
  addEventListener('resize', () => L.forEach((p) => yerlestir(p, p.g.x, p.g.y, p.g.w, p.g.h, false)));
  window.AbPencere = {
    ac,
    liste: () => L.map((p) => ({ anahtar: p.anahtar, baslik: p.baslik, gizli: !!p.gizli })),
    odakla: (a) => { const p = L.find((x) => x.anahtar === a); if (!p) return false; if (p.kb && p.gizli) { p.kb.getir(false); p.gizli = null; } oneGetir(p); p.el.focus({ preventScroll: true }); return true; },
    kapat: (a) => { const p = L.find((x) => x.anahtar === a); if (p) kapat(p); return !!p; },
    hepsiniKapat: () => [...L].forEach(kapat),
    ENCOK,
  };
})();
