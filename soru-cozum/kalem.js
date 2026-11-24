// Kalem: tam ekran okumada sayfanın üstüne not çizme (soru çözümleri + Ders Kitaplığı ortak dosyası).
// Asıl kopya: ereader-studio/tools/sc_qr/kalem.js → ders-kitapligi/src/kalem.js aynısı.
// Çizgiler içerik sütununa bağlı durur (sütun yer değiştirse de yazının üstünde kalır), sayfa / rota başına bellekte tutulur.
// Ev sahibi: window.__kalemKolon = () => öğe (içerik sütunu), window.__kalemAnahtar = () => 'rota' (isteğe bağlı).
// Arayüz: window.__kalem.goster(true|false) tam ekranla birlikte; cevir() / ac() / kapat(); 'kalem' olayı {acik}.
(() => {
  'use strict';
  const d = document, NS = 'http://www.w3.org/2000/svg';
  const FOSFOR = '#facc15';
  const RENK = [['#111827', 'Siyah kalem'], ['#1d4ed8', 'Mavi kalem'], ['#dc2626', 'Kırmızı kalem'], [FOSFOR, 'Fosforlu kalem']];
  const S = (p) => `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
  const IK = {
    silgi: S('<path d="m7 21-4.3-4.3a1 1 0 0 1 0-1.4l9.6-9.6a1 1 0 0 1 1.4 0l5.6 5.6a1 1 0 0 1 0 1.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>'),
    geri: S('<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>'),
    temizle: S('<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'),
    bitti: S('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  };
  const CSS = `.kalem-katman{position:absolute;left:0;top:0;z-index:28;pointer-events:none;overflow:visible}
.kalem-katman path{fill:none;stroke-linecap:round;stroke-linejoin:round}
html.kalem-acik .kalem-katman{pointer-events:auto;touch-action:none;cursor:crosshair}
html.kalem-acik.kalem-silgi .kalem-katman{cursor:cell}
.kalem-panel{position:fixed;z-index:45;left:50%;bottom:calc(14px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);display:flex;align-items:center;gap:2px;padding:4px 6px;border:1px solid var(--cizgi,#e2e7ee);border-radius:999px;background:color-mix(in srgb,var(--zemin,#fff) 92%,transparent);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);box-shadow:0 4px 18px rgb(0 0 0/.10);animation:kalemGir .2s ease-out}
.kalem-panel button{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;padding:0;border:1px solid transparent;border-radius:999px;background:none;color:var(--yazi,#111827);cursor:pointer}
.kalem-panel button:hover{border-color:var(--cizgi,#e2e7ee)}
.kalem-panel button[aria-pressed=true]{border-color:currentColor;background:color-mix(in srgb,var(--yazi,#111827) 8%,transparent)}
.kalem-panel i{display:block;width:18px;height:18px;border-radius:50%;background:var(--r);box-shadow:inset 0 0 0 1px rgb(0 0 0/.15)}
.kalem-panel svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.kalem-panel .ayrac{width:1px;height:22px;margin:0 4px;background:var(--cizgi,#e2e7ee)}
.kalem-panel button.onay{color:#dc2626;border-color:#dc2626}
@keyframes kalemGir{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}
@media (prefers-reduced-motion:reduce){.kalem-panel{animation:none}}
@media (max-width:420px){.kalem-panel button{width:36px;height:36px}}`;

  let svg = null, g = null, panel = null, acik = false, gorunur = false, silgi = false, renk = RENK[1][0];
  let cizgi = null, sabit = '', son = null, anahtar = '', onayZaman = 0, olcu = 0;
  const gruplar = new Map(), dokunus = new Map();
  let cekme = null; // iki parmakla sayfa yukarı/aşağı (çizim sürerken)
  const kolon = () => (window.__kalemKolon && window.__kalemKolon()) || d.querySelector('main') || d.body;
  const anahtarAl = () => location.pathname + '|' + (window.__kalemAnahtar ? window.__kalemAnahtar() : '');

  function kur() {
    if (svg) return;
    const st = d.createElement('style'); st.textContent = CSS; d.head.appendChild(st);
    svg = d.createElementNS(NS, 'svg'); svg.setAttribute('class', 'kalem-katman'); svg.setAttribute('aria-hidden', 'true');
    svg.style.display = 'none';
    d.body.appendChild(svg);
    panel = d.createElement('div'); panel.className = 'kalem-panel'; panel.hidden = true;
    panel.setAttribute('role', 'toolbar'); panel.setAttribute('aria-label', 'Kalem araçları');
    panel.innerHTML = RENK.map(([r, ad]) => `<button type="button" data-r="${r}" aria-label="${ad}" title="${ad}" style="--r:${r}"><i></i></button>`).join('')
      + '<span class="ayrac"></span>'
      + `<button type="button" data-p="silgi" aria-label="Silgi" title="Silgi (E)">${IK.silgi}</button>`
      + `<button type="button" data-p="geri" aria-label="Son çizgiyi geri al" title="Geri al (Ctrl+Z)">${IK.geri}</button>`
      + `<button type="button" data-p="temizle" aria-label="Bu sayfadaki çizgileri temizle" title="Temizle (iki kez dokun)">${IK.temizle}</button>`
      + `<button type="button" data-p="bitti" aria-label="Kalemi kapat" title="Kalemi kapat (P)">${IK.bitti}</button>`;
    d.body.appendChild(panel);
    panel.addEventListener('click', panelTik);
    svg.addEventListener('pointerdown', bas);
    svg.addEventListener('pointermove', surukle);
    svg.addEventListener('pointerup', birak);
    svg.addEventListener('pointercancel', birak);
    addEventListener('resize', yerlestir);
    if (window.ResizeObserver) new ResizeObserver(yerlestir).observe(d.body);
    addEventListener('hashchange', () => { if (gorunur) rota(); });
    addEventListener('keydown', tus, true);
  }

  // --- sayfa / rota başına çizgi grubu
  function rota() {
    const a = anahtarAl();
    if (a === anahtar && g) return;
    if (g) g.remove();
    anahtar = a;
    g = gruplar.get(a);
    if (!g) { g = d.createElementNS(NS, 'g'); gruplar.set(a, g); }
    svg.appendChild(g);
    yerlestir();
  }
  // --- katman boyu = belge boyu; grup sütunun sol üst köşesine taşınır
  function yerlestir() {
    if (!svg || !gorunur) return;
    cancelAnimationFrame(olcu);
    olcu = requestAnimationFrame(() => {
      svg.style.display = 'none';
      const de = d.documentElement, w = de.scrollWidth, h = Math.max(de.scrollHeight, d.body.scrollHeight);
      svg.style.display = '';
      svg.setAttribute('width', w); svg.setAttribute('height', h);
      svg.style.width = w + 'px'; svg.style.height = h + 'px';
      if (g) { const r = kolon().getBoundingClientRect(); g.setAttribute('transform', `translate(${(r.left + scrollX).toFixed(1)} ${(r.top + scrollY).toFixed(1)})`); }
    });
  }
  function nokta(e) { const r = kolon().getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  const n1 = (v) => Math.round(v * 10) / 10;

  // --- çizim
  function bas(e) {
    if (!acik || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    if (e.pointerType === 'touch') {
      dokunus.set(e.pointerId, e.clientY);
      if (dokunus.size === 2) { // ikinci parmak: kısa çizgiyi bırak, sayfayı parmakla çek
        if (cizgi && cizgi !== 'silgi' && cizgi.__n < 12) cizgi.remove();
        cizgi = null; cekme = { y: ortaY() };
        return;
      }
      if (dokunus.size > 2) return;
    }
    try { svg.setPointerCapture(e.pointerId); } catch (x) { /* yok */ }
    if (silgi) { cizgi = 'silgi'; sil(e); return; }
    const [x, y] = nokta(e);
    const p = e.pointerType === 'pen' && e.pressure > 0 ? e.pressure : 0.5;
    const fos = renk === FOSFOR;
    cizgi = d.createElementNS(NS, 'path');
    cizgi.setAttribute('stroke', renk);
    cizgi.setAttribute('stroke-width', fos ? '16' : (1.6 + 2.4 * p).toFixed(2));
    if (fos) cizgi.setAttribute('stroke-opacity', '.38');
    cizgi.__n = 1;
    son = [x, y]; sabit = `M${n1(x)} ${n1(y)}`;
    cizgi.setAttribute('d', sabit + 'l0 0');
    g.appendChild(cizgi);
  }
  function ortaY() { let t = 0; for (const v of dokunus.values()) t += v; return t / dokunus.size; }
  function surukle(e) {
    if (e.pointerType === 'touch' && dokunus.has(e.pointerId)) {
      dokunus.set(e.pointerId, e.clientY);
      if (cekme) { const y = ortaY(); scrollBy(0, cekme.y - y); cekme.y = y; return; }
    }
    if (!cizgi) return;
    if (cizgi === 'silgi') { sil(e); return; }
    const liste = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    for (const o of (liste.length ? liste : [e])) {
      const [x, y] = nokta(o);
      if (Math.abs(x - son[0]) + Math.abs(y - son[1]) < 1.2) continue;
      sabit += ` Q${n1(son[0])} ${n1(son[1])} ${n1((son[0] + x) / 2)} ${n1((son[1] + y) / 2)}`;
      son = [x, y]; cizgi.__n++;
    }
    cizgi.setAttribute('d', `${sabit} L${n1(son[0])} ${n1(son[1])}`);
  }
  function birak(e) {
    if (e.pointerType === 'touch') { dokunus.delete(e.pointerId); if (dokunus.size < 2) cekme = null; }
    cizgi = null;
  }
  function sil(e) {
    for (const [dx, dy] of [[0, 0], [6, 0], [-6, 0], [0, 6], [0, -6]]) {
      const el = d.elementFromPoint(e.clientX + dx, e.clientY + dy);
      if (el && g && el.parentNode === g) { el.remove(); return; }
    }
  }

  // --- araç çubuğu
  function panelYaz() {
    if (!panel) return;
    for (const b of panel.querySelectorAll('[data-r]')) b.setAttribute('aria-pressed', String(!silgi && b.dataset.r === renk));
    panel.querySelector('[data-p=silgi]').setAttribute('aria-pressed', String(silgi));
    d.documentElement.classList.toggle('kalem-silgi', silgi);
  }
  function panelTik(e) {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.r) { renk = b.dataset.r; silgi = false; }
    else if (b.dataset.p === 'silgi') silgi = !silgi;
    else if (b.dataset.p === 'geri') { if (g && g.lastElementChild) g.lastElementChild.remove(); }
    else if (b.dataset.p === 'temizle') {
      if (b.classList.contains('onay')) { if (g) g.replaceChildren(); b.classList.remove('onay'); clearTimeout(onayZaman); }
      else { b.classList.add('onay'); b.setAttribute('title', 'Emin misin? Bir kez daha dokun'); clearTimeout(onayZaman); onayZaman = setTimeout(() => { b.classList.remove('onay'); b.setAttribute('title', 'Temizle (iki kez dokun)'); }, 2600); }
    }
    else if (b.dataset.p === 'bitti') { kapat(); return; }
    panelYaz();
  }
  function tus(e) {
    if (!gorunur || e.altKey || e.metaKey) return;
    const t = e.target;
    if (t && t.closest && t.closest('input,textarea,select,[contenteditable="true"]')) return;
    const k = e.key;
    const dur = () => { e.preventDefault(); e.stopImmediatePropagation(); };
    if (e.ctrlKey) { if (acik && (k === 'z' || k === 'Z')) { dur(); if (g && g.lastElementChild) g.lastElementChild.remove(); } return; }
    if (k === 'p' || k === 'P') { dur(); cevir(); }
    else if (acik && k === 'Escape') { dur(); kapat(); }
    else if (acik && (k === 'e' || k === 'E')) { dur(); silgi = !silgi; panelYaz(); }
  }

  function bildir() { d.dispatchEvent(new CustomEvent('kalem', { detail: { acik } })); }
  function ac() {
    kur(); if (!gorunur) goster(true);
    acik = true; d.documentElement.classList.add('kalem-acik'); panel.hidden = false; panelYaz(); bildir();
  }
  function kapat() {
    if (!svg) return;
    acik = false; silgi = false; cizgi = null; cekme = null; dokunus.clear();
    d.documentElement.classList.remove('kalem-acik', 'kalem-silgi'); panel.hidden = true; bildir();
  }
  function cevir() { if (acik) kapat(); else ac(); }
  function goster(v) {
    kur(); gorunur = !!v;
    svg.style.display = gorunur ? '' : 'none';
    if (!gorunur) kapat(); else rota();
  }
  window.__kalem = { goster, ac, kapat, cevir, acikMi: () => acik, sayi: () => (g ? g.childElementCount : 0) };
})();
