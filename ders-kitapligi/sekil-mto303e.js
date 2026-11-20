/* MTO303E (CFD) — PARÇA A çizimleri (KISIM A + B: K1–K7). Yalnız A parçasının ajanı düzenler; B parçası src/sekil-mto303e-b.js (m303b_).
   Sekil.m303_<ad>(kap, ayar) → kap'ın içini kurar · Anim.m303_<ad>(kap, ayar) → { dur() } döndürür.
   Renkler CSS değişkeniyle (açık/koyu tema), dış görsel yok; sayılar kitabın hesap_dogrula.py'siyle aynı.
   Kaynak: kavram/_taslak/mto303e_js_1.js + _2.js → py -X utf8 kavram/_taslak/birlestir_mto303e_js.py */
(function () {
  const Sekil = window.Sekil, Anim = window.Anim;
  if (!Sekil || !Anim) return;
  const NS = 'http://www.w3.org/2000/svg', F = 'Inter,sans-serif';
  const el = (ad, o = {}, ic) => { const e = document.createElementNS(NS, ad); for (const [a, v] of Object.entries(o)) if (v !== undefined && v !== null) e.setAttribute(a, v); if (ic != null) e.textContent = ic; return e; };
  const tr = (v, d = 1) => { const r = Math.round(v * 10 ** d) / 10 ** d; return (r === 0 ? 0 : r).toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d }); };
  const yaz = (g, x, y, s, o = {}) => { const t = el('text', { x, y, 'font-family': F, 'font-size': o.k || 14, fill: o.r || 'var(--yazi)', 'font-weight': o.b ? 700 : 500, 'text-anchor': o.h || 'start', opacity: o.op, 'font-style': o.i ? 'italic' : null, stroke: o.hale ? 'var(--zemin)' : null, 'stroke-width': o.hale ? 4 : null, 'paint-order': o.hale ? 'stroke' : null, 'stroke-linejoin': o.hale ? 'round' : null }, s); g.append(t); return t; };
  const svgYap = (kap, W, H, ad) => { const s = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': ad }); kap.append(s); return s; };
  const yol = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${(+p[0]).toFixed(1)},${(+p[1]).toFixed(1)}`).join('');
  const sinir = (v, a, b) => Math.max(a, Math.min(b, v));
  const svgNokta = (svg, ev) => { const m = svg.getScreenCTM(); if (!m) return null; const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(m.inverse()); };
  const UST = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
  const ustY = (n) => (n < 0 ? '⁻' : '') + String(Math.abs(n)).split('').map((c) => UST[+c]).join('');
  const us10 = (v) => { const e = Math.round(Math.log10(v)); return e === 0 ? '1' : e === 1 ? '10' : '10' + ustY(e); };
  const bil = (v, d = 2) => { if (!isFinite(v) || v === 0) return '0'; let e = Math.floor(Math.log10(Math.abs(v))); let m = v / 10 ** e; if (Math.abs(+m.toFixed(d - 1)) >= 10) { m /= 10; e += 1; } return e === 0 ? tr(m, d - 1) : `${tr(m, d - 1)}×10${ustY(e)}`; };
  const guzelAdim = (aralik, hedef = 6) => { const k = aralik / hedef, p = 10 ** Math.floor(Math.log10(k)), r = k / p; return (r < 1.5 ? 1 : r < 3.5 ? 2 : r < 7.5 ? 5 : 10) * p; };
  const tikler = (a, b, n = 6) => { const s = guzelAdim(b - a, n), t = []; for (let v = Math.ceil(a / s - 1e-9) * s; v <= b + 1e-9; v += s) t.push(+v.toFixed(10)); return t; };

  function eksen(kok, o) {
    const W = o.W, H = o.H, L = o.L ?? 60, R = o.R ?? 20, T = o.T ?? 34, B = o.B ?? 46;
    const fx = o.xlog ? Math.log10 : (v) => v, fy = o.ylog ? Math.log10 : (v) => v;
    const gx = o.xlog ? (u) => 10 ** u : (u) => u, gy = o.ylog ? (u) => 10 ** u : (u) => u;
    const [x0, x1] = o.x.map(fx), [y0, y1] = o.y.map(fy);
    const x = (v) => L + (fx(v) - x0) / (x1 - x0) * (W - L - R);
    const y = (v) => H - B - (fy(v) - y0) / (y1 - y0) * (H - T - B);
    const ix = (px) => gx(x0 + (px - L) / (W - L - R) * (x1 - x0));
    const iy = (py) => gy(y0 + (H - B - py) / (H - T - B) * (y1 - y0));
    const g = el('g'); kok.append(g);
    const fmt = (v) => (typeof v === 'number' ? v.toLocaleString('tr-TR') : v);
    for (const v of o.xt || []) { g.append(el('line', { x1: x(v), x2: x(v), y1: T, y2: H - B, stroke: 'var(--cizgi)' })); yaz(g, x(v), H - B + 19, (o.xf || fmt)(v), { h: 'middle', k: 13, r: 'var(--ikincil)' }); }
    for (const v of o.yt || []) { g.append(el('line', { x1: L, x2: W - R, y1: y(v), y2: y(v), stroke: 'var(--cizgi)' })); yaz(g, L - 7, y(v) + 4.5, (o.yf || fmt)(v), { h: 'end', k: 13, r: 'var(--ikincil)' }); }
    g.append(el('path', { d: `M${L},${T} V${H - B} H${W - R}`, fill: 'none', stroke: 'var(--ikincil)', 'stroke-width': 1.2 }));
    if (o.xad) yaz(g, W - R, H - 8, o.xad, { h: 'end', k: 14, b: true });
    if (o.yad) yaz(g, L, T - 12, o.yad, { k: 14, b: true });
    return { x, y, ix, iy, g, L, R, T, B, W, H };
  }
  function okuma(kap, alanlar) {
    const o = document.createElement('div'); o.className = 'okuma'; o.setAttribute('aria-live', 'polite');
    o.innerHTML = alanlar.map((a, i) => `<span style="white-space:normal;overflow-wrap:anywhere">${a}: <i data-i="${i}">—</i></span>`).join('');
    kap.append(o);
    return (d) => { for (const [a, v] of Object.entries(d)) { const i = alanlar.indexOf(a); if (i >= 0) o.querySelector(`[data-i="${i}"]`).textContent = v; } };
  }
  function satirKutu(kap) { const d = document.createElement('div'); d.className = 'okuma'; d.style.cssText = 'display:block;white-space:normal;overflow-wrap:anywhere;font-weight:500'; d.setAttribute('aria-live', 'polite'); kap.append(d); return (s) => { d.textContent = s; }; }
  function kontrol(kap) { const k = document.createElement('div'); k.className = 'kontrol'; kap.append(k); return k; }
  function surgu(k, ad, min, max, adim, deger, bicim) {
    const l = document.createElement('label');
    l.style.cssText = 'display:flex;align-items:center;gap:8px;flex:1 1 230px;min-width:0;font-size:15px';
    l.innerHTML = `<span style="white-space:nowrap">${ad}</span><input type="range" min="${min}" max="${max}" step="${adim}" value="${deger}" style="min-width:70px"><b style="min-width:5.4em;text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap"></b>`;
    k.append(l);
    const inp = l.querySelector('input'), b = l.querySelector('b');
    inp.setAttribute('aria-label', ad);
    const s = { inp, get v() { return +inp.value; }, set(v) { inp.value = v; s.goster(); }, goster() { b.textContent = bicim ? bicim(+inp.value) : inp.value; } };
    s.goster(); inp.addEventListener('input', () => s.goster());
    return s;
  }
  function dugme(k, metin, ikincil) { const b = document.createElement('button'); b.type = 'button'; b.className = ikincil ? 'kucuk' : 'dugme'; b.textContent = metin; k.append(b); return b; }
  function secenek(k, adlar, secili, on) {
    const isaretle = (i) => bs.forEach((x, j) => { x.setAttribute('aria-pressed', String(j === i)); x.style.fontWeight = j === i ? '700' : ''; x.style.borderColor = j === i ? 'var(--acc)' : ''; });
    const bs = adlar.map((a, i) => { const b = dugme(k, a, true); b.addEventListener('click', () => { isaretle(i); on(i); }); return b; });
    isaretle(secili);
    return { bs, isaretle };
  }
  function dongu(btn, adim) {
    let id = null, son = 0;
    const dur = () => { if (id) cancelAnimationFrame(id); id = null; btn.textContent = '▶ Oynat'; };
    const bas = () => { if (id) return; btn.textContent = '⏸ Durdur'; son = performance.now(); const f = (an) => { const dt = Math.min(0.1, (an - son) / 1000); son = an; if (adim(dt) === false) { id = null; btn.textContent = '▶ Oynat'; return; } id = requestAnimationFrame(f); }; id = requestAnimationFrame(f); };
    btn.textContent = '▶ Oynat';
    btn.addEventListener('click', () => (id ? dur() : bas()));
    return { dur, bas, acik: () => id !== null };
  }
  function ok(g, x1, y1, x2, y2, renk = 'var(--acc)', w = 3, kesik) {
    const a = Math.atan2(y2 - y1, x2 - x1), u = 7 + w * 1.5;
    const gg = el('g');
    if (Math.hypot(x2 - x1, y2 - y1) < 2) { g.append(gg); return gg; }
    gg.append(el('line', { x1, y1, x2: x2 - Math.cos(a) * u * 0.8, y2: y2 - Math.sin(a) * u * 0.8, stroke: renk, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-dasharray': kesik ? '6 5' : null }));
    gg.append(el('path', { d: `M${x2},${y2} L${x2 - u * Math.cos(a - 0.42)},${y2 - u * Math.sin(a - 0.42)} L${x2 - u * Math.cos(a + 0.42)},${y2 - u * Math.sin(a + 0.42)} Z`, fill: renk }));
    g.append(gg); return gg;
  }
  const nokta = (g, x, y, r = 5, renk = 'var(--yazi)') => { const c = el('circle', { cx: x, cy: y, r, fill: renk, stroke: 'var(--zemin)', 'stroke-width': 2 }); g.append(c); return c; };
  const egri = (d, f, a, b, n = 160, log) => { const p = []; for (let i = 0; i <= n; i++) { const u = log ? 10 ** (Math.log10(a) + (Math.log10(b) - Math.log10(a)) * i / n) : a + (b - a) * i / n; const v = f(u); if (isFinite(v)) p.push([d.x(u), d.y(v)]); } return yol(p); };
  const cizgi = (g, x1, y1, x2, y2, renk = 'var(--yazi)', w = 1.5, kesik) => { const l = el('line', { x1, y1, x2, y2, stroke: renk, 'stroke-width': w, 'stroke-dasharray': kesik || null, 'stroke-linecap': 'round' }); g.append(l); return l; };
  const kutu = (g, x, y, w, h, o = {}) => { const r = el('rect', { x, y, width: w, height: h, rx: o.rx ?? 8, fill: o.f || 'var(--zemin)', stroke: o.s || 'var(--cizgi)', 'stroke-width': o.sw || 1.5, 'stroke-dasharray': o.d || null, opacity: o.op }); g.append(r); return r; };
  /* sıcaklık rengi: soğuk mavi → sıcak turuncu, iki katman (koyu temada da okunur) */
  const isiKutu = (g, x, y, w, h, t01, rx = 4) => { kutu(g, x, y, w, h, { f: 'var(--zemin)', s: 'none', rx }); g.append(el('rect', { x, y, width: w, height: h, rx, fill: 'var(--acc)', opacity: (0.45 * (1 - t01)).toFixed(3) })); g.append(el('rect', { x, y, width: w, height: h, rx, fill: 'var(--tur)', opacity: (0.55 * t01).toFixed(3) })); };

  /* ---------------- ortak sayısal çekirdek (hesap_dogrula.py ile aynı) ---------------- */
  const G9 = 9.8, MK = 68.1, CS = 12.5, CM = CS / MK, VT = G9 * MK / CS;
  const vAn = (t) => VT * (1 - Math.exp(-CM * t));
  const f10 = (x, y) => 4 * Math.exp(0.8 * x) - 0.5 * y;
  const y10 = (x) => 4 / 1.3 * (Math.exp(0.8 * x) - Math.exp(-0.5 * x)) + 2 * Math.exp(-0.5 * x);
  const ODE = {
    parasut: { f: (t, v) => G9 - CM * v, y0: 0, gercek: vAn, tad: 't', tbirim: 's', yad: 'v (m/s)', tmax: 20, hmin: 0.5, hmax: 14, hadim: 0.5, ad: 'Paraşütçü: dv/dt = 9,8 − 0,18355 v' },
    s10: { f: f10, y0: 2, gercek: y10, tad: 'x', tbirim: '', yad: 'y', tmax: 4, hmin: 0.1, hmax: 1, hadim: 0.05, ad: 'S10–S11: dy/dx = 4e^(0,8x) − 0,5y' },
  };
  const ADIM = {
    euler: (f, t, y, h) => y + h * f(t, y),
    heun: (f, t, y, h) => { const k1 = f(t, y), k2 = f(t + h, y + h * k1); return y + h * (k1 + k2) / 2; },
    rk3: (f, t, y, h) => { const a = y + h / 3 * f(t, y), b = y + h / 2 * f(t + h / 3, a); return y + h * f(t + h / 2, b); },
    rk4: (f, t, y, h) => { const k1 = f(t, y), k2 = f(t + h / 2, y + h * k1 / 2), k3 = f(t + h / 2, y + h * k2 / 2), k4 = f(t + h, y + h * k3); return y + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4); },
  };
  const YRENK = { euler: 'var(--tur)', heun: 'var(--acc)', rk3: 'var(--ikincil)', rk4: 'var(--yesil)' };
  const YAD = { euler: 'Euler', heun: 'Heun', rk3: 'RK3', rk4: 'RK4' };

  /* ============================== K1 · TOPLAM TÜREV, ADVEKSİYON, DİVERJANS, N–S ============================== */
  Sekil.m303_lagrange = function (kap) {
    const W = 640, H = 300, svg = svgYap(kap, W, H, 'Euler bakışı: sabit istasyon; Lagrange bakışı: parseli izleyen gözlemci');
    for (const [x0, bas, alt] of [[10, 'Euler bakışı · ∂T/∂t', 'termometre yerinde'], [330, 'Lagrange bakışı · dT/dt', 'termometre parselle gider']]) {
      const g = el('g'); svg.append(g);
      for (let i = 0; i < 6; i++) isiKutu(g, x0 + i * 50, 50, 50, 170, i / 5);
      for (let i = 0; i <= 5; i++) yaz(g, x0 + 25 + i * 50, 236, `${8 + 2 * i}°`, { h: 'middle', k: 12, r: 'var(--ikincil)' });
      yaz(g, x0 + 150, 28, bas, { h: 'middle', k: 16, b: true });
      yaz(g, x0 + 150, 262, alt, { h: 'middle', k: 13, r: 'var(--ikincil)' });
      ok(g, x0 + 18, 70, x0 + 90, 70, 'var(--acc)', 3); yaz(g, x0 + 96, 75, 'rüzgâr u', { k: 13, b: true, r: 'var(--acc)' });
    }
    // Euler: sabit istasyon
    const e = el('g'); svg.append(e);
    kutu(e, 10 + 175 - 12, 135 - 12, 24, 24, { f: 'var(--acc)', s: 'var(--zemin)', rx: 3 });
    yaz(e, 185, 175, 'istasyon', { h: 'middle', k: 13, b: true });
    yaz(e, 160, 290, 'soğuk hava gelir → T düşer', { h: 'middle', k: 13, b: true, r: 'var(--acc)' });
    // Lagrange: parsel yolu
    const l = el('g'); svg.append(l);
    for (const [px, op] of [[370, 0.25], [430, 0.45], [490, 0.7], [550, 1]]) l.append(el('circle', { cx: px, cy: 140, r: 13, fill: 'var(--tur)', opacity: op, stroke: 'var(--zemin)', 'stroke-width': 2 }));
    ok(l, 375, 165, 545, 165, 'var(--tur)', 2, true);
    yaz(l, 460, 190, 'parsel 18 °C kalır', { h: 'middle', k: 13, b: true, r: 'var(--tur)' });
    yaz(l, 480, 290, 'ısı alışverişi yok → dT/dt = 0', { h: 'middle', k: 13, b: true, r: 'var(--tur)' });
    yaz(svg, 320, 140, '≠', { h: 'middle', k: 30, b: true, r: 'var(--ikincil)' });
  };

  Anim.m303_toplam = function (kap) {
    const W = 640, H = 290, svg = svgYap(kap, W, H, 'Rüzgârla kayan sıcaklık deseni: istasyon soğuyor, parsel sabit');
    const X0 = -600, X1 = 600, px = (xkm) => 30 + (xkm - X0) / (X1 - X0) * 580, G = 10 / 500;  // K/km
    const alan = el('g'); svg.append(alan);
    const ist = el('g'); svg.append(ist);
    kutu(ist, px(0) - 11, 120, 22, 22, { f: 'var(--acc)', s: 'var(--zemin)', rx: 3 }); yaz(ist, px(0), 160, 'istasyon', { h: 'middle', k: 13, b: true });
    const parsel = el('circle', { r: 12, cy: 196, fill: 'var(--tur)', stroke: 'var(--zemin)', 'stroke-width': 3 }); svg.append(parsel);
    const pyaz = yaz(svg, 0, 228, 'parsel', { h: 'middle', k: 13, b: true, r: 'var(--tur)' });
    yaz(svg, 30, 22, 'izotermler (°C) rüzgârla doğuya kayıyor', { k: 14, b: true });
    yaz(svg, 30, 280, 'batı', { k: 12, r: 'var(--ikincil)' }); yaz(svg, 610, 280, 'doğu', { k: 12, r: 'var(--ikincil)', h: 'end' });
    const o = okuma(kap, ['süre', 'T istasyon', 'T parsel', '∂T/∂t = −u ∂T/∂x']);
    const k = kontrol(kap); const btn = dugme(k, '▶ Oynat'), b2 = dugme(k, 'Baştan', true);
    const sU = surgu(kontrol(kap), 'u', 0, 20, 1, 10, (v) => `${v} m/s`);
    let t = 0, xp = 0, kay = 0;   // t saat, xp parsel konumu (km), kay desenin toplam kayması (km)
    const T = (xkm) => 18 + G * (xkm - kay);
    const ciz = () => {
      alan.replaceChildren();
      for (let xk = X0; xk < X1; xk += 25) { const tt = (T(xk + 12.5) - 4) / 20; isiKutu(alan, px(xk), 50, 580 / 48 + 0.6, 200, sinir(tt, 0, 1), 0); }
      for (let Ti = -12; Ti <= 34; Ti += 2) { const xk = (Ti - 18) / G + kay; if (xk < X0 || xk > X1) continue; alan.append(el('line', { x1: px(xk), x2: px(xk), y1: 50, y2: 250, stroke: 'var(--yazi)', 'stroke-width': 1, opacity: 0.45 })); yaz(alan, px(xk), 46, `${Ti}`, { h: 'middle', k: 12, r: 'var(--ikincil)' }); }
      ok(alan, 40, 80, 120, 80, 'var(--acc)', 3); yaz(alan, 126, 85, `u = ${sU.v} m/s`, { k: 13, b: true, r: 'var(--acc)' });
      parsel.setAttribute('cx', px(xp)); pyaz.setAttribute('x', px(xp));
      o({ süre: `${tr(t, 1)} saat`, 'T istasyon': `${tr(T(0), 2)} °C`, 'T parsel': `${tr(T(xp), 2)} °C (sabit)`, '∂T/∂t = −u ∂T/∂x': `${tr(-sU.v * G / 1000 * 3600, 2)} K/h` });
    };
    const oyn = dongu(btn, (dt) => { const dh = dt * 1.5; t += dh; kay += sU.v * 3.6 * dh; xp += sU.v * 3.6 * dh; if (xp > X1 - 20) { t = 0; kay = 0; xp = 0; } ciz(); });
    b2.addEventListener('click', () => { oyn.dur(); t = 0; kay = 0; xp = 0; ciz(); });
    sU.inp.addEventListener('input', ciz);
    ciz();
    return { dur: oyn.dur };
  };

  Sekil.m303_adveksiyon = function (kap, ayar = {}) {
    const W = 640, H = 330, svg = svgYap(kap, W, H, 'Sıcaklık adveksiyonu: rüzgâr yönü ve izotermler');
    const cx = 250, cy = 170, olc = 0.36;   // px/km
    const g = el('g'); svg.append(g);
    for (let i = 0; i < 20; i++) isiKutu(g, 20 + i * 23, 40, 23.5, 260, i / 19, 0);
    for (let Ti = 8; Ti <= 28; Ti += 2) { const x = cx + (Ti - 18) / (10 / 500) * olc; if (x < 20 || x > 480) continue; cizgi(g, x, 40, x, 300, 'var(--yazi)', 1, '4 4'); yaz(g, x, 34, `${Ti}°`, { h: 'middle', k: 12, r: 'var(--ikincil)' }); }
    const bat = cx - 500 * olc; nokta(g, bat, cy, 6, 'var(--acc)'); yaz(g, bat + 8, cy + 22, '8 °C (500 km batı)', { k: 12, b: true, r: 'var(--acc)', hale: true });
    kutu(g, cx - 10, cy - 10, 20, 20, { f: 'var(--yazi)', s: 'var(--zemin)', rx: 3 }); yaz(g, cx + 14, cy + 30, 'istasyon 18 °C', { k: 13, b: true, hale: true });
    ok(g, 360, 280, 460, 280, 'var(--tur)', 3); yaz(g, 360, 272, '∇T (sıcağa doğru)', { k: 12, b: true, r: 'var(--tur)', hale: true });
    const dyn = el('g'); svg.append(dyn);
    const o = okuma(kap, ['rüzgâr', 'u, v', '−V·∇T', 'yorum']);
    let sY = { v: ayar.yon ?? 270 }, sH = { v: ayar.hiz ?? 10 };
    if (!ayar.kilit) { const k = kontrol(kap); sY = surgu(k, 'geldiği yön', 0, 355, 5, ayar.yon ?? 270, (v) => `${v}°`); sH = surgu(k, 'hız', 0, 20, 1, ayar.hiz ?? 10, (v) => `${v} m/s`); }
    const ciz = () => {
      dyn.replaceChildren();
      const a = sY.v * Math.PI / 180, hz = sH.v, u = -hz * Math.sin(a), v = -hz * Math.cos(a), adv = -(u * 2e-5) * 3600;   // K/h
      const L = 9 * hz;
      ok(dyn, cx - u / Math.max(hz, 1e-9) * L * 0.5, cy + v / Math.max(hz, 1e-9) * L * 0.5 - 0, cx + u / Math.max(hz, 1e-9) * L * 0.5, cy - v / Math.max(hz, 1e-9) * L * 0.5, 'var(--acc)', 5);
      // pusula
      const pg = el('g'); dyn.append(pg); const pX = 560, pY = 120, r = 60;
      pg.append(el('circle', { cx: pX, cy: pY, r, fill: 'var(--zemin)', stroke: 'var(--cizgi)', 'stroke-width': 2 }));
      for (const [s, ax, ay] of [['K', 0, -1], ['D', 1, 0], ['G', 0, 1], ['B', -1, 0]]) yaz(pg, pX + ax * (r + 12), pY + ay * (r + 12) + 5, s, { h: 'middle', k: 13, b: true, r: 'var(--ikincil)' });
      if (hz > 0) ok(pg, pX + Math.sin(a) * r * 0.85, pY - Math.cos(a) * r * 0.85, pX - Math.sin(a) * r * 0.5, pY + Math.cos(a) * r * 0.5, 'var(--acc)', 4);
      yaz(pg, pX, pY + r + 34, `${sY.v}° yönünden`, { h: 'middle', k: 13, b: true, r: 'var(--acc)' });
      const yor = Math.abs(adv) < 0.005 ? 'adveksiyon yok (izotermlere paralel)' : adv < 0 ? 'soğuk adveksiyon' : 'sıcak adveksiyon', kisa = Math.abs(adv) < 0.005 ? 'adveksiyon yok' : yor;
      yaz(dyn, 500, 260, `${adv < -0.005 ? '' : adv > 0.005 ? '+' : ''}${tr(adv, 2)} K/h`, { k: 22, b: true, r: adv < -0.005 ? 'var(--acc)' : adv > 0.005 ? 'var(--tur)' : 'var(--ikincil)' });
      yaz(dyn, 500, 284, kisa, { k: 13, b: true });
      o({ rüzgâr: `${sY.v}°, ${hz} m/s`, 'u, v': `${tr(u, 1)}, ${tr(v, 1)} m/s`, '−V·∇T': `${tr(adv / 3600 * 1e4, 2)}×10⁻⁴ K/s = ${tr(adv, 2)} K/h`, yorum: yor });
    };
    if (sY.inp) for (const s of [sY, sH]) s.inp.addEventListener('input', ciz);
    ciz();
  };

  function diverjansKur(kap, ayar, oynat) {
    const W = 640, H = 340, svg = svgYap(kap, W, H, 'Diverjans: u = a x, v = b y alanında hava yamasının şekil değiştirmesi');
    const cx = 210, cy = 188, R = 140;   // alan [-1,1]² → ±140 px
    yaz(svg, 70, 22, 'u = a·x, v = b·y  (x, y: 100 km birim)', { k: 14, b: true });
    const ok_g = el('g'), yama = el('g'); svg.append(ok_g, yama);
    const o = okuma(kap, ['a = ∂u/∂x', 'b = ∂v/∂y', '∇·V = a + b', 'alan oranı', 'yorum']);
    const k = kontrol(kap); let btn = null, b2 = null;
    if (oynat) { btn = dugme(k, '▶ Oynat'); b2 = dugme(k, 'Baştan', true); }
    const sA = surgu(k, 'a (×10⁻⁵ s⁻¹)', -5, 5, 0.5, ayar.a ?? 3, (v) => tr(v, 1)), sB = surgu(k, 'b (×10⁻⁵ s⁻¹)', -5, 5, 0.5, ayar.b ?? -1, (v) => tr(v, 1));
    let t = oynat ? 0 : 6;   // saat
    const ciz = () => {
      ok_g.replaceChildren(); yama.replaceChildren();
      ok_g.append(el('rect', { x: cx - R, y: cy - R, width: 2 * R, height: 2 * R, fill: 'var(--zemin)', stroke: 'var(--cizgi)' }));
      const a = sA.v, b = sB.v, mx = Math.max(Math.abs(a), Math.abs(b), 0.5);
      for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) {
        const x = i / 3, y = j / 3, u = a * x, v = b * y, s = 22 / mx;
        if (Math.hypot(u, v) < 0.05) { nokta(ok_g, cx + x * R, cy - y * R, 2, 'var(--ikincil)'); continue; }
        ok(ok_g, cx + x * R, cy - y * R, cx + x * R + u * s, cy - y * R - v * s, 'var(--ikincil)', 1.6);
      }
      const ex = Math.exp(a * 1e-5 * t * 3600), ey = Math.exp(b * 1e-5 * t * 3600), s0 = 0.32;
      yama.append(el('rect', { x: cx - s0 * R, y: cy - s0 * R, width: 2 * s0 * R, height: 2 * s0 * R, fill: 'none', stroke: 'var(--yazi)', 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }));
      const wx = sinir(s0 * ex, 0.01, 1), wy = sinir(s0 * ey, 0.01, 1);
      yama.append(el('rect', { x: cx - wx * R, y: cy - wy * R, width: 2 * wx * R, height: 2 * wy * R, fill: a + b >= 0 ? 'var(--tur)' : 'var(--acc)', opacity: 0.35, stroke: a + b >= 0 ? 'var(--tur)' : 'var(--acc)', 'stroke-width': 3 }));
      const div = a + b, oran = ex * ey;
      const sag = el('g'); yama.append(sag); const TX = 405;
      yaz(sag, TX, 70, `t = ${tr(t, 1)} saat`, { k: 15, b: true });
      yaz(sag, TX, 100, 'kesikli: başlangıç yaması', { k: 13, r: 'var(--ikincil)' });
      yaz(sag, TX, 140, `∇·V = ${div > 0 ? '+' : ''}${tr(div, 1)}×10⁻⁵ s⁻¹`, { k: 17, b: true, r: div >= 0 ? 'var(--tur)' : 'var(--acc)' });
      yaz(sag, TX, 170, `alan × ${tr(oran, 2)}  (= e^(∇·V·t))`, { k: 14, b: true });
      yaz(sag, TX, 210, div > 0.01 ? 'diverjans → yüzeyde çökme,' : div < -0.01 ? 'konverjans → yükselme,' : 'sıkıştırılamaz (alan sabit)', { k: 14, b: true });
      yaz(sag, TX, 232, div > 0.01 ? 'yüksek basınç, açık hava' : div < -0.01 ? 'bulut, yağış' : '', { k: 14, b: true });
      yaz(sag, TX, 272, `w(1 km) ≈ ${tr(-div * 1e-5 * 1000 * 100, 1)} cm/s`, { k: 14, r: 'var(--ikincil)' });
      o({ 'a = ∂u/∂x': `${tr(a, 1)}×10⁻⁵`, 'b = ∂v/∂y': `${tr(b, 1)}×10⁻⁵`, '∇·V = a + b': `${tr(div, 1)}×10⁻⁵ s⁻¹`, 'alan oranı': `${tr(oran, 3)} (${tr(t, 1)} saatte)`, yorum: div > 0.01 ? 'yayılma (divergence)' : div < -0.01 ? 'toplanma (convergence)' : 'diverjans yok' });
    };
    for (const s of [sA, sB]) s.inp.addEventListener('input', ciz);
    let oyn = null;
    if (oynat) {
      oyn = dongu(btn, (dt) => { t += dt * 6; if (t >= 24) { t = 24; ciz(); return false; } ciz(); });
      b2.addEventListener('click', () => { oyn.dur(); t = 0; ciz(); });
    }
    ciz();
    return { dur: oyn ? oyn.dur : () => {} };
  }
  Sekil.m303_diverjans = function (kap, ayar = {}) { diverjansKur(kap, ayar, false); };
  Anim.m303_diverjans = function (kap, ayar = {}) { return diverjansKur(kap, ayar, true); };

  const NS_TERIM = [
    ['① ∂V/∂t', 'yerel ivme', 'Sabit noktada hızın değişimi; modelin ilerlettiği büyüklük. ≈ 10⁻⁴ m/s²', 'sol'],
    ['② (V·∇)V', 'adveksiyon', 'Hız kendini taşır: u·∂u/∂x — DOĞRUSAL DEĞİL, analitik çözümü engeller. ≈ U²/L = 10⁻⁴ m/s²', 'sol'],
    ['③ −∇p/ρ', 'basınç gradyanı', 'Yüksekten alçak basınca iter; rüzgârı başlatır. ≈ 10⁻³ m/s²', 'sag'],
    ['④ g', 'yerçekimi', 'Düşey; basıncın düşey gradyanıyla dengede (hidrostatik). 9,81 m/s²', 'sag'],
    ['⑤ ν∇²V', 'viskoz', 'Sürtünme; ν = μ/ρ ≈ 1,5×10⁻⁵ m²/s. Serbest atmosferde ≈ 10⁻¹⁶ m/s² — önemsiz, sınır tabakasında önemli', 'sag'],
    ['⑥ −2Ω×V', 'Coriolis', 'Dönen Dünya: hareket KYK\'de sağa sapar. fU ≈ 10⁻³ m/s²', 'sag'],
  ];
  Sekil.m303_ns = function (kap, ayar = {}) {
    const W = 640, H = 250, svg = svgYap(kap, W, H, 'Navier–Stokes denkleminin altı terimi');
    const g = el('g'); svg.append(g);
    const yer = [[12, 46], [108, 46], [250, 46], [346, 46], [442, 46], [538, 46]];
    yaz(svg, 102, 26, 'İVME (sol taraf)', { h: 'middle', k: 13, b: true, r: 'var(--acc)' });
    yaz(svg, 434, 26, 'KUVVETLER / kütle (sağ taraf)', { h: 'middle', k: 13, b: true, r: 'var(--tur)' });
    yaz(svg, 220, 92, '=', { h: 'middle', k: 30, b: true });
    for (const x of [102, 340, 436, 532]) yaz(svg, x, 90, '+', { h: 'middle', k: 20, b: true, r: 'var(--ikincil)' });
    const kutular = [];
    const bilgi = satirKutu(kap);
    const sec = (i) => {
      kutular.forEach((b, j) => { b.r.setAttribute('stroke-width', j === i ? 4 : 1.5); b.r.setAttribute('opacity', i == null || j === i ? 1 : 0.55); });
      const T = NS_TERIM[i]; if (T) bilgi(`${T[0]} — ${T[1]}: ${T[2]}`);
    };
    NS_TERIM.forEach((T, i) => {
      const [x, y] = yer[i], w = 84, h = 74, sol = T[3] === 'sol';
      const gg = el('g', { style: 'cursor:pointer', tabindex: 0, role: 'button', 'aria-label': `${T[0]} ${T[1]}` }); g.append(gg);
      const r = kutu(gg, x, y, w, h, { f: sol ? 'var(--acc-zemin)' : 'var(--tur-zemin)', s: sol ? 'var(--acc)' : 'var(--tur)' });
      yaz(gg, x + w / 2, y + 30, T[0], { h: 'middle', k: 15, b: true });
      yaz(gg, x + w / 2, y + 54, T[1], { h: 'middle', k: 11 });
      if (i === 1) yaz(gg, x + w / 2, y + h + 18, 'doğrusal değil!', { h: 'middle', k: 12, b: true, r: 'var(--tur)' });
      kutular.push({ r });
      gg.addEventListener('click', () => sec(i)); gg.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sec(i); } });
    });
    yaz(svg, 320, 172, '+ süreklilik ∇·V = 0  →  4 denklem, 4 bilinmeyen (u, v, w, p)', { h: 'middle', k: 14, b: true });
    yaz(svg, 320, 200, 'sinoptik ölçek: ③ ≈ ⑥ (jeostrofik) · ⑤ ≈ 0 · Re ≈ 10¹¹', { h: 'middle', k: 13, r: 'var(--ikincil)' });
    yaz(svg, 320, 232, 'bir kutuya bas →', { h: 'middle', k: 12, r: 'var(--ikincil)' });
    if (ayar.vurgu != null) sec(ayar.vurgu); else bilgi('Bir terime bas: anlamı ve tipik büyüklüğü burada.');
  };

  /* ============================== K2 · PARAŞÜTÇÜ, EULER, HATA, KARARLILIK, DÖNGÜ ============================== */
  Sekil.m303_parasut = function (kap) {
    const W = 640, H = 330, svg = svgYap(kap, W, H, 'Paraşütçü: serbest cisim diyagramı ve eğim alanı');
    // serbest cisim
    const s = el('g'); svg.append(s);
    s.append(el('circle', { cx: 75, cy: 120, r: 13, fill: 'var(--yazi)' }));
    s.append(el('rect', { x: 62, y: 136, width: 26, height: 46, rx: 8, fill: 'var(--yazi)' }));
    s.append(el('path', { d: 'M40,70 Q75,30 110,70', fill: 'none', stroke: 'var(--ikincil)', 'stroke-width': 3 }));
    ok(s, 75, 186, 75, 268, 'var(--tur)', 4); yaz(s, 84, 250, 'mg', { k: 15, b: true, r: 'var(--tur)' });
    ok(s, 120, 170, 120, 110, 'var(--acc)', 4); yaz(s, 128, 140, 'c·v', { k: 15, b: true, r: 'var(--acc)' });
    yaz(s, 75, 300, 'm dv/dt = mg − cv', { h: 'middle', k: 13, b: true });
    // eğim alanı
    const d = eksen(svg, { W, H, L: 230, R: 16, T: 30, B: 44, x: [0, 30], y: [0, 70], xt: [0, 5, 10, 15, 20, 25, 30], yt: [0, 10, 20, 30, 40, 50, 60, 70], xad: 't (s)', yad: 'v (m/s)' });
    for (let t = 1.25; t < 30; t += 2.5) for (let v = 3.5; v < 70; v += 7) {
      const m = G9 - CM * v, sx = (d.x(30) - d.x(0)) / 30, sy = (d.y(0) - d.y(70)) / 70, dx = 1, dy = m * sy / sx, n = Math.hypot(dx, dy), L = 9;
      cizgi(svg, d.x(t) - dx / n * L, d.y(v) + dy / n * L, d.x(t) + dx / n * L, d.y(v) - dy / n * L, 'var(--ikincil)', 1.4);
    }
    cizgi(svg, d.x(0), d.y(VT), d.x(30), d.y(VT), 'var(--yesil)', 2, '7 5');
    yaz(svg, d.x(30) - 4, d.y(VT) - 7, `son hız gm/c = ${tr(VT, 2)} m/s`, { h: 'end', k: 13, b: true, r: 'var(--yesil)' });
    const eg = el('g'); svg.append(eg);
    const ciz = (t0, v0) => {
      eg.replaceChildren();
      eg.append(el('path', { d: egri(d, (t) => (t < t0 ? NaN : VT + (v0 - VT) * Math.exp(-CM * (t - t0))), t0, 30, 160), fill: 'none', stroke: 'var(--tur)', 'stroke-width': 3 }));
      nokta(eg, d.x(t0), d.y(v0), 6, 'var(--tur)');
    };
    eg.append(el('path', { d: egri(d, vAn, 0, 30), fill: 'none', stroke: 'var(--yazi)', 'stroke-width': 3 }));
    const o = okuma(kap, ['başlangıç', 'eğim dv/dt', 'v(t → ∞)']);
    const f = (ev) => { const p = svgNokta(svg, ev); if (!p || p.x < d.L || p.x > d.W - d.R || p.y < d.T || p.y > d.H - d.B) return; const t0 = d.ix(p.x), v0 = d.iy(p.y); ciz(t0, v0); o({ başlangıç: `t = ${tr(t0, 1)} s, v = ${tr(v0, 1)} m/s`, 'eğim dv/dt': `${tr(G9 - CM * v0, 2)} m/s²`, 'v(t → ∞)': `${tr(VT, 2)} m/s` }); };
    svg.addEventListener('pointerdown', f);
    o({ başlangıç: 'grafiğe bas', 'eğim dv/dt': 't = 0, v = 0 → 9,8 m/s²', 'v(t → ∞)': `${tr(VT, 2)} m/s` });
  };

  Sekil.m303_eulergeo = function (kap, ayar = {}) {
    const W = 640, H = 340, yerel = ayar.mod === 'yerel';
    const svg = svgYap(kap, W, H, yerel ? 'Yerel hatalar adım adım birikiyor' : 'Euler adımının geometrisi: teğet doğru ve yerel hata');
    const kat = el('g'); svg.append(kat);
    const o = okuma(kap, yerel ? ['adım', 'yerel hatalar', 'toplam hata'] : ['h', 'Euler y(h)', 'gerçek y(h)', 'yerel hata', 'hata / h²']);
    let sH = { v: 1 };
    if (!yerel) sH = surgu(kontrol(kap), 'h', 0.1, 1.2, 0.05, ayar.h ?? 1, (v) => tr(v, 2));
    const ciz = () => {
      kat.replaceChildren();
      if (!yerel) {
        const h = sH.v, d = eksen(kat, { W, H, L: 54, x: [0, 1.3], y: [1, 8.5], xt: [0, 0.25, 0.5, 0.75, 1, 1.25], yt: [2, 4, 6, 8], xf: (v) => tr(v, 2), xad: 'x', yad: 'y' });
        kat.append(el('path', { d: egri(d, y10, 0, 1.3), fill: 'none', stroke: 'var(--yazi)', 'stroke-width': 3 }));
        const k1 = f10(0, 2), y1 = 2 + k1 * h, yg = y10(h), xe = Math.min(1.3, h * 1.18);
        cizgi(kat, d.x(0), d.y(2), d.x(xe), d.y(2 + k1 * xe), 'var(--tur)', 3);
        cizgi(kat, d.x(h), d.y(1), d.x(h), d.y(8.5), 'var(--cizgi)', 1, '4 4');
        cizgi(kat, d.x(h), d.y(y1), d.x(h), d.y(yg), 'var(--tur)', 5);
        nokta(kat, d.x(0), d.y(2), 6); nokta(kat, d.x(h), d.y(y1), 6, 'var(--tur)'); nokta(kat, d.x(h), d.y(yg), 5);
        yaz(kat, d.x(0) + 10, d.y(2) + 20, '(xᵢ, yᵢ) = (0, 2)', { k: 13, b: true });
        yaz(kat, d.x(h) + 10, d.y(y1) + 5, `yᵢ₊₁ = 2 + 3h = ${tr(y1, 2)}`, { k: 13, b: true, r: 'var(--tur)' });
        yaz(kat, d.x(h) - 10, d.y((y1 + yg) / 2) + 5, 'yerel hata', { h: 'end', k: 13, b: true, r: 'var(--tur)', hale: true });
        yaz(kat, d.x(0.05), d.y(8), 'turuncu: teğet, eğim k₁ = f(0, 2) = 3', { k: 13, b: true, r: 'var(--tur)' });
        o({ h: tr(h, 2), 'Euler y(h)': tr(y1, 4), 'gerçek y(h)': tr(yg, 4), 'yerel hata': tr(yg - y1, 4), 'hata / h²': `${tr((yg - y1) / h / h, 3)} (h → 0: y″(0)/2 = 0,85)` });
      } else {
        const h = 0.5, n = sinir(ayar.adim || 1, 1, 4), d = eksen(kat, { W, H, L: 54, x: [0, 2.2], y: [0, 16], xt: [0, 0.5, 1, 1.5, 2], yt: [0, 4, 8, 12, 16], xf: (v) => tr(v, 1), xad: 'x', yad: 'y' });
        kat.append(el('path', { d: egri(d, y10, 0, 2.2), fill: 'none', stroke: 'var(--yazi)', 'stroke-width': 3 }));
        let x = 0, y = 2; const yh = [];
        for (let i = 0; i < n; i++) {
          const C = (y - 4 / 1.3 * Math.exp(0.8 * x)) * Math.exp(0.5 * x), ince = (u) => 4 / 1.3 * Math.exp(0.8 * u) + C * Math.exp(-0.5 * u);
          if (i > 0) kat.append(el('path', { d: egri(d, ince, x, x + h, 40), fill: 'none', stroke: 'var(--ikincil)', 'stroke-width': 1.6, 'stroke-dasharray': '5 4' }));
          const yn = y + h * f10(x, y), yi = ince(x + h);
          cizgi(kat, d.x(x), d.y(y), d.x(x + h), d.y(yn), 'var(--tur)', 3);
          cizgi(kat, d.x(x + h) - 4, d.y(yi), d.x(x + h) - 4, d.y(yn), 'var(--tur)', 4, '3 2');
          nokta(kat, d.x(x), d.y(y), 5, 'var(--tur)');
          yh.push(yi - yn); x += h; y = yn;
        }
        nokta(kat, d.x(x), d.y(y), 6, 'var(--tur)');
        cizgi(kat, d.x(x) + 5, d.y(y), d.x(x) + 5, d.y(y10(x)), 'var(--acc)', 5);
        yaz(kat, x > 1.6 ? d.x(x) - 10 : d.x(x) + 12, d.y((y + y10(x)) / 2), `toplam hata ${tr(y10(x) - y, 2)}`, { h: x > 1.6 ? 'end' : 'start', k: 13, b: true, r: 'var(--acc)', hale: true });
        yaz(kat, 70, 40, 'kesikli ince eğri: o adımın başından geçen gerçek çözüm', { k: 12, r: 'var(--ikincil)' });
        o({ adım: `${n} (h = 0,5)`, 'yerel hatalar': yh.map((v) => tr(v, 2)).join(' + '), 'toplam hata': `${tr(y10(x) - y, 2)} (yerel toplamı ${tr(yh.reduce((a, b) => a + b, 0), 2)}; fark: hatanın yayılması)` });
      }
    };
    if (sH.inp) sH.inp.addEventListener('input', ciz);
    ciz();
  };

  Sekil.m303_hata = function (kap) {
    const W = 640, H = 360, svg = svgYap(kap, W, H, 'Adım boyuna göre toplam hata, log–log: eğim = mertebe');
    const hs = [2, 1, 0.5, 0.25, 0.125, 0.0625], f = ODE.parasut.f, gercek = vAn(4);
    const E = {};
    for (const y of ['euler', 'heun', 'rk4']) E[y] = hs.map((h) => { let t = 0, v = 0; for (let i = 0; i < Math.round(4 / h); i++) { v = ADIM[y](f, t, v, h); t += h; } return Math.abs(v - gercek); });
    const tum = Object.values(E).flat().filter((v) => v > 0), e0 = Math.floor(Math.log10(Math.min(...tum))), e1 = Math.ceil(Math.log10(Math.max(...tum)));
    const yt = []; for (let e = e0; e <= e1; e += (e1 - e0 > 8 ? 2 : 1)) yt.push(10 ** e);
    const d = eksen(svg, { W, H, L: 66, x: [0.05, 3], y: [10 ** e0, 10 ** e1], xlog: true, ylog: true, xt: hs, yt, xf: (v) => { const s = tr(v, v < 0.1 ? 4 : v < 1 ? 3 : 0); return s.includes(',') ? s.replace(/0+$/, '').replace(/,$/, '') : s; }, yf: us10, xad: 'Δt (s)', yad: '|hata| v(4)' });
    const nk = [];
    for (const [y, p] of [['euler', 1], ['heun', 2], ['rk4', 4]]) {
      const pts = hs.map((h, i) => [d.x(h), d.y(E[y][i])]);
      svg.append(el('path', { d: yol(pts), fill: 'none', stroke: YRENK[y], 'stroke-width': 3 }));
      pts.forEach(([px, py], i) => { nk.push([px, py, y, hs[i], E[y][i]]); nokta(svg, px, py, 4.5, YRENK[y]); });
      yaz(svg, pts[5][0] + 4, pts[5][1] + (y === 'rk4' ? -12 : 20), `${YAD[y]} · eğim ${p}`, { k: 13, b: true, r: YRENK[y], hale: true });
    }
    hs.slice(0, 4).forEach((h, i) => { nokta(svg, d.x(h), d.y(E.euler[i]), 6.5, 'var(--yazi)'); yaz(svg, d.x(h) - 6, d.y(E.euler[i]) - 10, tr(E.euler[i], 3), { h: 'end', k: 12, b: true }); });
    yaz(svg, W - 24, H - 62, 'siyah noktalar: S7 (4,235 · 1,898 · 0,904 · 0,441)', { h: 'end', k: 12, b: true });
    const o = okuma(kap, ['yöntem', 'Δt', '|hata|', 'Δt yarıya → hata']);
    const imle = nokta(svg, -10, -10, 8, 'none'); imle.setAttribute('stroke', 'var(--yazi)'); imle.setAttribute('stroke-width', 2);
    const f2 = (ev) => { const p = svgNokta(svg, ev); if (!p) return; let en = null, de = 1e9; for (const q of nk) { const dd = Math.hypot(q[0] - p.x, q[1] - p.y); if (dd < de) { de = dd; en = q; } } if (!en || de > 40) return; imle.setAttribute('cx', en[0]); imle.setAttribute('cy', en[1]); o({ yöntem: YAD[en[2]], Δt: `${tr(en[3], 4)} s`, '|hata|': bil(en[4], 3), 'Δt yarıya → hata': `÷ ${{ euler: 2, heun: 4, rk4: 16 }[en[2]]}` }); };
    svg.addEventListener('pointermove', f2); svg.addEventListener('pointerdown', f2);
    o({ yöntem: 'noktanın üzerine gel', Δt: '—', '|hata|': '—', 'Δt yarıya → hata': 'Euler ÷2 · Heun ÷4 · RK4 ÷16' });
  };

  Sekil.m303_kararlilik = function (kap, ayar = {}) {
    const W = 640, H = 420, svg = svgYap(kap, W, H, 'Euler büyüme çarpanı G ve sapmanın adım adım değişimi');
    const ust = el('g'), alt = el('g'); svg.append(ust, alt);
    const d = eksen(ust, { W, H: 230, L: 56, T: 30, B: 40, x: [0, 14], y: [-1.8, 1.2], xt: [0, 2, 4, 6, 8, 10, 12, 14], yt: [-1.5, -1, -0.5, 0, 0.5, 1], xf: (v) => v, yf: (v) => tr(v, 1), xad: 'Δt (s)', yad: 'G = 1 − (c/m)Δt' });
    const dk = 2 / CM, ds = 1 / CM;
    ust.insertBefore(el('rect', { x: d.x(0), y: d.y(1), width: d.x(dk) - d.x(0), height: d.y(-1) - d.y(1), fill: 'var(--yesil-zemin)' }), ust.firstChild);
    ust.append(el('rect', { x: d.x(ds), y: d.y(0), width: d.x(dk) - d.x(ds), height: d.y(-1) - d.y(0), fill: 'var(--yesil)', opacity: 0.12 }));
    for (const g of [1, -1]) cizgi(ust, d.x(0), d.y(g), d.x(14), d.y(g), 'var(--yesil)', 1.5, '6 4');
    ust.append(el('path', { d: yol([[d.x(0), d.y(1)], [d.x(14), d.y(1 - CM * 14)]]), stroke: 'var(--yazi)', 'stroke-width': 3, fill: 'none' }));
    yaz(ust, d.x(dk) - 4, d.y(-1.55), `2m/c = ${tr(dk, 2)} s`, { h: 'end', k: 12, b: true, r: 'var(--yesil)' });
    cizgi(ust, d.x(dk), d.y(1.2), d.x(dk), d.y(-1.8), 'var(--yesil)', 1.5);
    yaz(ust, d.x(ds) + 4, d.y(-0.5) + 4, 'salınımlı', { k: 12, r: 'var(--yesil)' });
    yaz(ust, d.x(0.4), d.y(-0.6), 'tekdüze söner', { k: 12, r: 'var(--yesil)' });
    yaz(ust, d.x(11.2), d.y(0.6), 'G < −1: patlar', { k: 13, b: true, r: 'var(--tur)' });
    const mk = el('g'); ust.append(mk);
    const o = okuma(kap, ['Δt', 'G', 'durum', 'v dizisi']);
    let sD = { v: ayar.dt ?? 12 };
    sD = surgu(kontrol(kap), 'Δt', 0.5, 14, 0.1, ayar.dt ?? 12, (v) => `${tr(v, 1)} s`);
    const ciz = () => {
      const dt = sD.v, G = 1 - CM * dt; mk.replaceChildren(); alt.replaceChildren();
      cizgi(mk, d.x(dt), d.y(1.2), d.x(dt), d.y(-1.8), 'var(--tur)', 2); nokta(mk, d.x(dt), d.y(sinir(G, -1.8, 1.2)), 7, 'var(--tur)');
      const e = [], v = []; let ee = -VT, vv = 0; for (let i = 0; i <= 8; i++) { e.push(ee); v.push(vv); ee *= G; vv = vv + (G9 - CM * vv) * dt; }
      const mx = Math.max(...e.map(Math.abs)), y0 = 330, bh = 70;
      cizgi(alt, 50, y0, 620, y0, 'var(--ikincil)', 1.2);
      yaz(alt, 50, 252, 'sapma eᵢ = v − 53,39 (her adımda ×G)', { k: 13, b: true });
      e.forEach((x, i) => { const hh = x / mx * bh, bx = 70 + i * 62; alt.append(el('rect', { x: bx, y: hh < 0 ? y0 : y0 - hh, width: 34, height: Math.abs(hh) || 1, fill: Math.abs(G) > 1 ? 'var(--tur)' : 'var(--acc)', opacity: 0.8 })); yaz(alt, bx + 17, y0 + (hh < 0 ? -6 : 16), `e${['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈'][i]}`, { h: 'middle', k: 11, r: 'var(--ikincil)' }); });
      yaz(alt, 50, 414, `ölçek: en büyük |e| = ${tr(mx, 1)} m/s`, { k: 12, r: 'var(--ikincil)' });
      const durum = Math.abs(G) > 1 ? 'KARARSIZ: salınarak büyür' : G < 0 ? 'kararlı, salınarak söner' : 'kararlı, tekdüze söner';
      o({ Δt: `${tr(dt, 1)} s`, G: tr(G, 3), durum, 'v dizisi': v.slice(1, 5).map((x) => tr(x, 1)).join(' · ') + ' …' });
    };
    sD.inp.addEventListener('input', ciz);
    ciz();
  };

  Anim.m303_ode = function (kap, ayar = {}) {
    const O = ODE[ayar.ode] || ODE.parasut, ys = ayar.yontemler || ['euler'], tmax = ayar.tmax || O.tmax, tek = ys.length === 1;
    const W = 640, H = 340, sv = document.createElement('div'); kap.append(sv);
    const alan = [O.tad, ...ys.map((y) => YAD[y]), ...(tek ? ['eğim'] : []), 'gerçek'];
    const o = okuma(kap, alan);
    const k = kontrol(kap); const bO = dugme(k, '▶ Oynat'), bA = dugme(k, 'Adım ›', true), bB = dugme(k, 'Baştan', true);
    const sH = surgu(kontrol(kap), 'h', O.hmin, O.hmax, O.hadim, ayar.h ?? 1, (v) => `${tr(v, v < 1 ? 2 : 1)}${O.tbirim ? ' ' + O.tbirim : ''}`);
    let n = 0, N = 0, seri = {}, kz = 0;
    const hesap = () => {
      const h = sH.v; N = Math.max(1, Math.floor(tmax / h + 1e-9)); seri = {};
      for (const y of ys) { const p = [[0, O.y0, null]]; let t = 0, v = O.y0; for (let i = 0; i < N; i++) { const s = O.f(t, v); v = ADIM[y](O.f, t, v, h); t += h; p.push([t, v, s]); if (!isFinite(v) || Math.abs(v) > 1e5) break; } seri[y] = p; }
    };
    const ciz = () => {
      sv.replaceChildren();
      const svg = svgYap(sv, W, H, `${O.ad} — sayısal yöntemler ve gerçek çözüm`);
      let lo = Math.min(0, O.y0), hi = O.gercek(tmax);
      for (const y of ys) for (const p of seri[y]) { lo = Math.min(lo, p[1]); hi = Math.max(hi, p[1]); }
      lo = Math.max(lo, -300); hi = Math.min(hi, 400); const pad = (hi - lo) * 0.08; lo -= lo < 0 ? pad : 0; hi += pad;
      const d = eksen(svg, { W, H, L: 58, x: [0, tmax * 1.02], y: [lo, hi], xt: tikler(0, tmax), yt: tikler(lo, hi, 5), xf: (v) => tr(v, v % 1 ? 1 : 0), yf: (v) => tr(v, 0), xad: `${O.tad}${O.tbirim ? ' (' + O.tbirim + ')' : ''}`, yad: O.yad });
      svg.append(el('path', { d: egri(d, O.gercek, 0, tmax * 1.02, 200), fill: 'none', stroke: 'var(--yazi)', 'stroke-width': 2.4, 'stroke-dasharray': '7 5' }));
      if (lo < 0) cizgi(svg, d.L, d.y(0), d.W - d.R, d.y(0), 'var(--ikincil)', 1);
      ys.forEach((y, j) => {
        const p = seri[y].slice(0, n + 1).map((q) => [d.x(q[0]), d.y(sinir(q[1], lo, hi))]);
        if (p.length > 1) svg.append(el('path', { d: yol(p), fill: 'none', stroke: YRENK[y], 'stroke-width': tek ? 2.5 : 2.2 }));
        p.forEach(([px, py]) => nokta(svg, px, py, 4.5, YRENK[y]));
        if (tek && n > 0 && n <= seri[y].length - 1) { const a = seri[y][n - 1], b = seri[y][n]; cizgi(svg, d.x(a[0]), d.y(sinir(a[1], lo, hi)), d.x(b[0]), d.y(sinir(b[1], lo, hi)), 'var(--tur)', 5); }
        yaz(svg, 150 + j * 100, 22, `● ${YAD[y]}`, { k: 13, b: true, r: YRENK[y] });
      });
      yaz(svg, 150 + ys.length * 100, 22, '- - gerçek', { k: 13, b: true });
      const t = n * sH.v, gv = O.gercek(t), deg = { [O.tad]: `${tr(t, 2)}${O.tbirim ? ' ' + O.tbirim : ''} (adım ${n}/${N})`, gerçek: tr(gv, 3) };
      for (const y of ys) { const q = seri[y][n]; deg[YAD[y]] = q ? `${tr(q[1], 3)} (${Math.abs(gv) > 1e-9 ? tr((gv - q[1]) / gv * 100, 3) + ' %' : '—'})` : 'patladı'; }
      if (tek) { const q = seri[ys[0]][n]; deg['eğim'] = q && q[2] != null ? tr(q[2], 4) : '—'; }
      o(deg);
    };
    const oyn = dongu(bO, (dt) => { kz += dt; if (kz < 0.7) return; kz = 0; if (n >= N) return false; n++; ciz(); if (n >= N) return false; });
    bA.addEventListener('click', () => { oyn.dur(); if (n < N) { n++; ciz(); } });
    bB.addEventListener('click', () => { oyn.dur(); n = 0; ciz(); });
    sH.inp.addEventListener('input', () => { hesap(); n = Math.min(n, N); ciz(); });
    hesap(); ciz();
    return { dur: oyn.dur };
  };

  Sekil.m303_dongu = function (kap, ayar = {}) {
    const W = 640, H = 330, adim = sinir(ayar.adim ?? 4, 0, 4), svg = svgYap(kap, W, H, 'Hatalı ve düzeltilmiş zaman döngüsü: zaman eksenleri');
    yaz(svg, 20, 26, 'Hatalı: t(k) = k', { k: 15, b: true, r: 'var(--tur)' });
    const x1 = (t) => 40 + t / 6 * 560;
    cizgi(svg, 40, 70, 600, 70, 'var(--ikincil)', 1.5);
    for (let t = 0; t <= 6; t++) { cizgi(svg, x1(t), 64, x1(t), 76, 'var(--ikincil)', 1); yaz(svg, x1(t), 92, `${t}`, { h: 'middle', k: 12, r: 'var(--ikincil)' }); }
    const tH = [0, 2, 3, 4, 5], vH = [0, 19.6, 25.8023, 30.8662, 35.0006];
    for (let i = 0; i <= Math.min(adim, 4); i++) {
      nokta(svg, x1(tH[i]), 70, 7, 'var(--tur)');
      if (i > 0) { svg.append(el('path', { d: `M${x1(tH[i - 1])},62 Q${(x1(tH[i - 1]) + x1(tH[i])) / 2},${40} ${x1(tH[i])},62`, fill: 'none', stroke: 'var(--tur)', 'stroke-width': 2 })); yaz(svg, (x1(tH[i - 1]) + x1(tH[i])) / 2, 42, `Δt = ${tH[i] - tH[i - 1]} s`, { h: 'middle', k: 12, b: true, r: 'var(--tur)' }); }
    }
    yaz(svg, 600, 110, 't (s)', { h: 'end', k: 12, r: 'var(--ikincil)' });
    // tablo
    const tb = el('g'); svg.append(tb);
    const kol = [40, 120, 230, 380];
    ['k', 't(k)', 'Δt = t(k) − t(k−1)', 'v(k) (m/s)'].forEach((s, i) => yaz(tb, kol[i], 134, s, { k: 13, b: true }));
    for (let i = 1; i <= Math.min(adim, 4); i++) { const yy = 134 + i * 22; [`${i + 1}`, `${tH[i]}`, `${tH[i] - tH[i - 1]}`, tr(vH[i], 2)].forEach((s, j) => yaz(tb, kol[j], yy, s, { k: 13, r: i === adim ? 'var(--tur)' : 'var(--yazi)', b: i === adim })); }
    yaz(tb, 380, 134 + 5 * 22, 'dt = 0.1 hiç kullanılmadı', { k: 12, b: true, r: 'var(--tur)' });
    // düzeltilmiş eksen
    const y2 = 290, x2 = (t) => 40 + t / 2 * 560;
    yaz(svg, 20, 262, 'Düzeltilmiş: t(k) = t(k−1) + dt, N = (tf − ti)/dt = 20', { k: 15, b: true, r: adim >= 4 ? 'var(--yesil)' : 'var(--ikincil)' });
    cizgi(svg, 40, y2, 600, y2, 'var(--ikincil)', 1.5);
    for (let i = 0; i <= 20; i++) { cizgi(svg, x2(i * 0.1), y2 - 5, x2(i * 0.1), y2 + 5, adim >= 4 ? 'var(--yesil)' : 'var(--ikincil)', i % 5 ? 1 : 2); if (i % 5 === 0) yaz(svg, x2(i * 0.1), y2 + 22, tr(i * 0.1, 1), { h: 'middle', k: 12, r: 'var(--ikincil)' }); }
    if (adim >= 4) yaz(svg, 600, y2 - 12, 'v(2) = 16,53 (analitik 16,41)', { h: 'end', k: 12, b: true, r: 'var(--yesil)' });
  };

  /* ============================== K3 · RUNGE–KUTTA GEOMETRİSİ ============================== */
  function egimCiz(g, d, x, y, m, L = 0.06, renk = 'var(--acc)', w = 3.5) { cizgi(g, d.x(x - L), d.y(y - m * L), d.x(x + L), d.y(y + m * L), renk, w); }
  const lejant = (svg, x, y, satirlar) => satirlar.forEach(([t, r, b], i) => yaz(svg, x, y + i * 19, t, { k: 13, b: b !== false, r, hale: true }));
  Sekil.m303_heun = function (kap, ayar = {}) {
    const W = 640, H = 340, a = sinir(ayar.adim ?? 3, 0, 3), svg = svgYap(kap, W, H, 'Heun yönteminin bir adımı (S10)');
    const d = eksen(svg, { W, H, L: 54, x: [0, 1.45], y: [1.5, 7.5], xt: [0, 0.25, 0.5, 0.75, 1, 1.25], yt: [2, 3, 4, 5, 6, 7], xf: (v) => tr(v, 2), xad: 'x', yad: 'y' });
    svg.append(el('path', { d: egri(d, y10, 0, 1.45), fill: 'none', stroke: 'var(--yazi)', 'stroke-width': 2.6 }));
    nokta(svg, d.x(0), d.y(2), 6);
    nokta(svg, d.x(1), d.y(y10(1)), 5); yaz(svg, d.x(1) + 10, d.y(y10(1)) + 16, `gerçek ${tr(y10(1), 3)}`, { k: 13, b: true, hale: true });
    const k1 = 3, yp = 5, k2 = f10(1, 5), y1 = 2 + (k1 + k2) / 2;
    const sat = [['başlangıç (0, 2) · hedef y(1)', 'var(--yazi)']];
    if (a >= 1) { cizgi(svg, d.x(0), d.y(2), d.x(1), d.y(yp), 'var(--tur)', 3, '7 5'); egimCiz(svg, d, 0, 2, k1, 0.08, 'var(--tur)', 5); nokta(svg, d.x(1), d.y(yp), 6, 'var(--tur)'); yaz(svg, d.x(1) + 10, d.y(yp) + 18, 'y⁰ = 5', { k: 13, b: true, r: 'var(--tur)', hale: true }); sat.push(['① k₁ = f(0, 2) = 3 → tahmin y⁰ = 5', 'var(--tur)']); }
    if (a >= 2) { egimCiz(svg, d, 1, yp, k2, 0.08, 'var(--acc)', 5); yaz(svg, d.x(1.09), d.y(5.6), 'k₂', { k: 14, b: true, r: 'var(--acc)', hale: true }); sat.push([`② k₂ = f(1, 5) = ${tr(k2, 6)}`, 'var(--acc)']); }
    if (a >= 3) { cizgi(svg, d.x(0), d.y(2), d.x(1), d.y(y1), 'var(--yesil)', 4); nokta(svg, d.x(1), d.y(y1), 7, 'var(--yesil)'); yaz(svg, d.x(1) + 10, d.y(y1) - 6, `y(1) = ${tr(y1, 3)}`, { k: 14, b: true, r: 'var(--yesil)', hale: true }); sat.push([`③ ortalama (3 + ${tr(k2, 3)})/2 = ${tr((k1 + k2) / 2, 3)} → y(1) = ${tr(y1, 6)}`, 'var(--yesil)']); }
    lejant(svg, 70, 40, sat);
  };
  Sekil.m303_rk4 = function (kap, ayar = {}) {
    const W = 640, H = 350, a = sinir(ayar.adim ?? 4, 0, 4), svg = svgYap(kap, W, H, 'RK4 tek adımı: dört eğim (S11)');
    const d = eksen(svg, { W, H, L: 60, T: 30, x: [0, 0.56], y: [1.9, 5.2], xt: [0, 0.125, 0.25, 0.375, 0.5], yt: [2, 2.5, 3, 3.5, 4], xf: (v) => tr(v, 3), yf: (v) => tr(v, 1), xad: 'x', yad: 'y' });
    svg.append(el('path', { d: egri(d, y10, 0, 0.56), fill: 'none', stroke: 'var(--yazi)', 'stroke-width': 2.4, 'stroke-dasharray': '7 5' }));
    const h = 0.5, k1 = f10(0, 2), p2 = 2 + k1 * h / 2, k2 = f10(0.25, p2), p3 = 2 + k2 * h / 2, k3 = f10(0.25, p3), p4 = 2 + k3 * h, k4 = f10(0.5, p4), y = 2 + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4);
    nokta(svg, d.x(0), d.y(2), 6);
    const R = ['var(--tur)', 'var(--acc)', 'var(--ikincil)', 'var(--yesil)'], sat = [['siyah kesikli: gerçek çözüm · başlangıç (0, 2), h = 0,5', 'var(--yazi)', false]];
    if (a >= 1) { egimCiz(svg, d, 0, 2, k1, 0.035, R[0], 5); cizgi(svg, d.x(0), d.y(2), d.x(0.25), d.y(p2), R[0], 2, '6 4'); nokta(svg, d.x(0.25), d.y(p2), 5, R[0]); sat.push([`① k₁ = f(0; 2) = ${tr(k1, 6)} → (0,25; ${tr(p2, 4)})`, R[0]]); }
    if (a >= 2) { egimCiz(svg, d, 0.25, p2, k2, 0.035, R[1], 5); cizgi(svg, d.x(0), d.y(2), d.x(0.25), d.y(p3), R[1], 2, '6 4'); nokta(svg, d.x(0.25), d.y(p3), 5, R[1]); yaz(svg, d.x(0.25) + 30, d.y(p2) + 14, '②', { k: 14, b: true, r: R[1], hale: true }); sat.push([`② k₂ = f(0,25; 2,75) = ${tr(k2, 6)} → (0,25; ${tr(p3, 4)})`, R[1]]); }
    if (a >= 3) { egimCiz(svg, d, 0.25, p3, k3, 0.035, R[2], 5); cizgi(svg, d.x(0), d.y(2), d.x(0.5), d.y(p4), R[2], 2, '6 4'); nokta(svg, d.x(0.5), d.y(p4), 5, R[2]); yaz(svg, d.x(0.25) - 30, d.y(p3) - 8, '③', { h: 'end', k: 14, b: true, r: R[2], hale: true }); sat.push([`③ k₃ = f(0,25; ${tr(p3, 4)}) = ${tr(k3, 6)} → (0,5; ${tr(p4, 4)})`, R[2]]); }
    if (a >= 4) { egimCiz(svg, d, 0.5, p4, k4, 0.035, R[3], 5); yaz(svg, d.x(0.5) + 26, d.y(p4) + 20, '④', { k: 14, b: true, r: R[3], hale: true }); cizgi(svg, d.x(0), d.y(2), d.x(0.5), d.y(y), 'var(--yesil)', 4); nokta(svg, d.x(0.5), d.y(y), 7, 'var(--yesil)'); sat.push([`④ k₄ = f(0,5; ${tr(p4, 4)}) = ${tr(k4, 6)}`, R[3]]); sat.push([`φ = (k₁ + 2k₂ + 2k₃ + k₄)/6 = ${tr((k1 + 2 * k2 + 2 * k3 + k4) / 6, 6)} → y(0,5) = ${tr(y, 6)} (gerçek ${tr(y10(0.5), 6)})`, 'var(--yesil)']); }
    lejant(svg, 70, 36, sat);
  };
  Sekil.m303_rk3 = function (kap, ayar = {}) {
    const W = 640, H = 340, a = sinir(ayar.adim ?? 3, 0, 3), svg = svgYap(kap, W, H, 'WRF RK3: üç aşama da eski değerden başlar (S12)');
    const d = eksen(svg, { W, H, L: 54, T: 30, x: [0, 2.3], y: [0, 29], xt: [0, 2 / 3, 1, 2], yt: [0, 5, 10, 15, 20], xf: (v) => (Math.abs(v - 2 / 3) < 1e-9 ? '2/3' : tr(v, 0)), xad: 't (s)', yad: 'v (m/s)' });
    svg.append(el('path', { d: egri(d, vAn, 0, 2.3), fill: 'none', stroke: 'var(--yazi)', 'stroke-width': 2.4, 'stroke-dasharray': '7 5' }));
    nokta(svg, d.x(0), d.y(0), 6);
    nokta(svg, d.x(2), d.y(19.6), 4, 'var(--ikincil)'); yaz(svg, d.x(2) + 8, d.y(19.6) + 4, 'Euler 19,6', { k: 12, r: 'var(--ikincil)', hale: true });
    const R = (v) => G9 - CM * v, v1 = 2 / 3 * R(0), v2 = 1 * R(v1), v3 = 2 * R(v2);
    const C = ['var(--tur)', 'var(--acc)', 'var(--yesil)'], sat = [['siyah kesikli: analitik · hepsi φᵗ = 0 noktasından', 'var(--yazi)', false]];
    if (a >= 1) { ok(svg, d.x(0), d.y(0), d.x(2 / 3), d.y(v1), C[0], 3); nokta(svg, d.x(2 / 3), d.y(v1), 5, C[0]); yaz(svg, d.x(2 / 3) - 8, d.y(v1) - 8, '①', { h: 'end', k: 14, b: true, r: C[0], hale: true }); sat.push([`① φ′ = 0 + (2/3)·9,8 = ${tr(v1, 4)}`, C[0]]); }
    if (a >= 2) { ok(svg, d.x(0), d.y(0), d.x(1), d.y(v2), C[1], 3); nokta(svg, d.x(1), d.y(v2), 5, C[1]); yaz(svg, d.x(1) - 4, d.y(v2) - 12, '②', { h: 'end', k: 14, b: true, r: C[1], hale: true }); sat.push([`② R(φ′) = ${tr(R(v1), 4)} → φ″ = 0 + 1·${tr(R(v1), 4)} = ${tr(v2, 4)}`, C[1]]); }
    if (a >= 3) { ok(svg, d.x(0), d.y(0), d.x(2), d.y(v3), C[2], 4); nokta(svg, d.x(2), d.y(v3), 6, C[2]); yaz(svg, d.x(2) + 10, d.y(v3) + 18, '③', { k: 14, b: true, r: C[2], hale: true }); sat.push([`③ R(φ″) = ${tr(R(v2), 4)} → φ(t+Δt) = 2·${tr(R(v2), 4)} = ${tr(v3, 3)} (analitik ${tr(vAn(2), 3)})`, C[2]]); }
    lejant(svg, 70, 40, sat);
  };
  Sekil.m303_rkaile = function (kap) {
    const W = 640, H = 330, svg = svgYap(kap, W, H, 'Runge–Kutta ailesi: eğimin hesaplandığı noktalar ve ağırlıklar');
    const satir = [['Euler (RK1)', [[0, '1']], 'var(--tur)'], ['Heun (RK2)', [[0, '½'], [1, '½']], 'var(--acc)'], ['WRF RK3', [[0, '0'], [1 / 3, '0'], [1 / 2, '1']], 'var(--ikincil)'], ['RK4', [[0, '1/6'], [0.5, '2/6 + 2/6'], [1, '1/6']], 'var(--yesil)']];
    const x = (c) => 200 + c * 400;
    yaz(svg, x(0), 26, 'tᵢ', { h: 'middle', k: 14, b: true }); yaz(svg, x(1), 26, 'tᵢ + h', { h: 'middle', k: 14, b: true });
    satir.forEach(([ad, pts, renk], i) => {
      const y = 70 + i * 66;
      yaz(svg, 20, y + 5, ad, { k: 15, b: true, r: renk });
      cizgi(svg, x(0), y, x(1), y, 'var(--ikincil)', 2);
      pts.forEach(([c, w]) => { nokta(svg, x(c), y, 8, renk); yaz(svg, x(c), y + 26, w, { h: 'middle', k: 13, b: true, r: renk }); });
      if (ad === 'RK4') yaz(svg, x(0.5) + 14, y - 12, 'k₂ ve k₃ (iki kez)', { k: 12, r: renk });
      if (ad === 'WRF RK3') yaz(svg, x(0.5) + 14, y - 12, 'sonuç yalnız son eğimle', { k: 12, r: renk });
      if (ad === 'WRF RK3') yaz(svg, x(1 / 3), y - 12, '1/3', { h: 'middle', k: 12, r: renk });
    });
    yaz(svg, 20, 322, 'nokta = eğimin hesaplandığı yer · altındaki sayı = ağırlık (toplam 1)', { k: 12, r: 'var(--ikincil)' });
  };

  /* ============================== K4 · TAYLOR, FARK ŞEMALARI, ŞABLONLAR ============================== */
  const P4 = (x) => -0.1 * x ** 4 - 0.15 * x ** 3 - 0.5 * x ** 2 - 0.25 * x + 1.2;
  const P4d = [1.2, -0.25, -1, -0.9, -2.4];   // x = 0'da f, f', f'', f''', f''''
  const fakt = (n) => (n < 2 ? 1 : n * fakt(n - 1));
  const taylorN = (n, x) => { let s = 0; for (let k = 0; k <= n; k++) s += P4d[k] * x ** k / fakt(k); return s; };

  Sekil.m303_taylor = function (kap, ayar = {}) {
    const W = 640, H = 340, svg = svgYap(kap, W, H, 'Taylor yaklaşımı: mertebe arttıkça gerçek eğriye yaklaşır');
    const kat = el('g'); svg.append(kat);
    const o = okuma(kap, ['n', 'tahmin f(h)', 'gerçek', 'kesme hatası', 'atılan ilk terim']);
    let sN = { v: ayar.n ?? 2 }, sH = { v: ayar.h ?? 1 };
    if (!ayar.kilit) { const k = kontrol(kap); sN = surgu(k, 'n (mertebe)', 0, 4, 1, ayar.n ?? 2, (v) => `${v}`); sH = surgu(k, 'h', 0.1, 1.3, 0.05, ayar.h ?? 1, (v) => tr(v, 2)); }
    const RN = ['var(--ikincil)', 'var(--tur)', 'var(--acc)', 'var(--yesil)', 'var(--yazi)'];
    const ciz = () => {
      kat.replaceChildren();
      const n = sN.v, h = sH.v, d = eksen(kat, { W, H, L: 54, x: [-0.2, 1.35], y: [-0.8, 1.45], xt: [0, 0.25, 0.5, 0.75, 1, 1.25], yt: [-0.5, 0, 0.5, 1], xf: (v) => tr(v, 2), yf: (v) => tr(v, 1), xad: 'x', yad: 'f(x)' });
      cizgi(kat, d.x(-0.2), d.y(0), d.x(1.35), d.y(0), 'var(--ikincil)', 1);
      kat.append(el('path', { d: egri(d, P4, -0.2, 1.35), fill: 'none', stroke: 'var(--yazi)', 'stroke-width': 3 }));
      kat.append(el('path', { d: egri(d, (x) => sinir(taylorN(n, x), -0.8, 1.45), -0.2, 1.35), fill: 'none', stroke: RN[n], 'stroke-width': 3, 'stroke-dasharray': n === 4 ? '8 6' : null }));
      const tah = taylorN(n, h), ger = P4(h);
      nokta(kat, d.x(0), d.y(1.2), 6); yaz(kat, d.x(0) + 8, d.y(1.2) - 10, 'xᵢ = 0', { k: 13, b: true });
      cizgi(kat, d.x(h), d.y(sinir(tah, -0.8, 1.45)), d.x(h), d.y(ger), 'var(--tur)', 4);
      nokta(kat, d.x(h), d.y(ger), 5); nokta(kat, d.x(h), d.y(sinir(tah, -0.8, 1.45)), 6, RN[n]);
      yaz(kat, d.x(h) + 8, d.y((sinir(tah, -0.8, 1.45) + ger) / 2), 'Rₙ', { k: 14, b: true, r: 'var(--tur)' });
      yaz(kat, 70, 36, `${['0. mertebe: sabit', '1. mertebe: teğet doğru', '2. mertebe: parabol', '3. mertebe: kübik', '4. mertebe: polinomun kendisi (kesin)'][n]}`, { k: 14, b: true, r: RN[n] });
      const atilan = n < 4 ? P4d[n + 1] * h ** (n + 1) / fakt(n + 1) : 0;
      o({ n: `${n}`, 'tahmin f(h)': tr(tah, 4), gerçek: tr(ger, 4), 'kesme hatası': tr(ger - tah, 4), 'atılan ilk terim': n < 4 ? `${tr(atilan, 4)} (f⁽ⁿ⁺¹⁾hⁿ⁺¹/(n+1)!)` : 'yok (4. derece polinom)' });
    };
    if (sN.inp) for (const s of [sN, sH]) s.inp.addEventListener('input', ciz);
    ciz();
  };

  function farkKur(kap, ayar, anim) {
    const iki = ayar.mod === 'iki', W = 640, H = 470, x0 = 0.5, gercek = iki ? -1.75 : -0.9125;
    const svg = svgYap(kap, W, H, iki ? 'İkinci türevin merkezi farkı: üç noktadan geçen parabol ve hata' : 'İleri, geri ve merkezi fark kirişleri ile hata–adım grafiği');
    const ust = el('g'), alt = el('g'), iz = []; svg.append(ust, alt);
    const o = okuma(kap, iki ? ['h', 'f″ ≈ (1, −2, 1)/h²', 'gerçek', 'hata', 'hata / h²'] : ['h', 'ileri', 'geri', 'merkezi', 'gerçek']);
    const k = kontrol(kap); let btn = null, b2 = null;
    if (anim) { btn = dugme(k, '▶ Oynat'); b2 = dugme(k, 'Baştan', true); }
    const sH = surgu(k, 'h', 0.02, 0.5, 0.01, ayar.h ?? 0.5, (v) => tr(v, 2));
    const hata = (h) => { const a = P4(x0 - h), b = P4(x0), c = P4(x0 + h); return iki ? [Math.abs((c - 2 * b + a) / h / h - gercek)] : [Math.abs((c - b) / h - gercek), Math.abs((b - a) / h - gercek), Math.abs((c - a) / 2 / h - gercek)]; };
    const RE = iki ? ['var(--tur)'] : ['var(--tur)', 'var(--acc)', 'var(--yesil)'], AD = iki ? ['ikinci fark (eğim 2)'] : ['ileri (eğim 1)', 'geri (eğim 1)', 'merkezi (eğim 2)'];
    const ciz = () => {
      ust.replaceChildren(); alt.replaceChildren();
      const h = sH.v, d = eksen(ust, { W, H: 270, L: 54, T: 28, B: 36, x: [-0.05, 1.05], y: [0, 1.35], xt: [0, 0.25, 0.5, 0.75, 1], yt: [0, 0.4, 0.8, 1.2], xf: (v) => tr(v, 2), yf: (v) => tr(v, 1), xad: 'x', yad: 'f(x)' });
      ust.append(el('path', { d: egri(d, P4, -0.05, 1.05), fill: 'none', stroke: 'var(--yazi)', 'stroke-width': 3 }));
      const a = P4(x0 - h), b = P4(x0), c = P4(x0 + h);
      const dogru = (xa, ya, xb, yb, renk, w = 3) => { const m = (yb - ya) / (xb - xa), u0 = Math.max(-0.05, xa - 0.08), u1 = Math.min(1.05, xb + 0.08); cizgi(ust, d.x(u0), d.y(ya + m * (u0 - xa)), d.x(u1), d.y(ya + m * (u1 - xa)), renk, w); };
      if (!iki) {
        cizgi(ust, d.x(0.15), d.y(b - 0.9125 * -0.35), d.x(0.85), d.y(b - 0.9125 * 0.35), 'var(--yazi)', 2, '7 5');
        dogru(x0, b, x0 + h, c, 'var(--tur)'); dogru(x0 - h, a, x0, b, 'var(--acc)'); dogru(x0 - h, a, x0 + h, c, 'var(--yesil)', 3.5);
        yaz(ust, 300, 40, 'kesikli: gerçek teğet (eğim −0,9125)', { k: 13, b: true });
      } else {
        const m1 = (c - a) / 2 / h, m2 = (c - 2 * b + a) / h / h, q = (x) => b + m1 * (x - x0) + m2 / 2 * (x - x0) ** 2;
        ust.append(el('path', { d: egri(d, (x) => sinir(q(x), 0, 1.35), Math.max(-0.05, x0 - h - 0.15), Math.min(1.05, x0 + h + 0.15), 80), fill: 'none', stroke: 'var(--tur)', 'stroke-width': 3, 'stroke-dasharray': '8 5' }));
        yaz(ust, 300, 40, `turuncu: 3 noktadan geçen parabol, q″ = ${tr(m2, 4)}`, { k: 13, b: true, r: 'var(--tur)' });
      }
      for (const [xx, yy] of [[x0 - h, a], [x0, b], [x0 + h, c]]) nokta(ust, d.x(xx), d.y(yy), 6);
      // log–log hata paneli
      const e = eksen(alt, { W, H, L: 66, T: 300, B: 40, x: [0.015, 0.6], y: [1e-5, 1], xlog: true, ylog: true, xt: [0.02, 0.05, 0.1, 0.2, 0.5], yt: [1e-5, 1e-4, 1e-3, 1e-2, 1e-1, 1], xf: (v) => tr(v, v < 0.1 ? 2 : 1), yf: us10, xad: 'h', yad: '' });
      yaz(alt, 66, 292, '|hata| (log)', { k: 13, b: true });
      RE.forEach((r, i) => {
        alt.append(el('path', { d: egri(e, (u) => sinir(hata(u)[i], 1e-5, 1), 0.015, 0.6, 120, true), fill: 'none', stroke: r, 'stroke-width': 2.5, opacity: 0.85 }));
        nokta(alt, e.x(h), e.y(sinir(hata(h)[i], 1e-5, 1)), 6, r);
        yaz(alt, W - 24, 318 + i * 18, AD[i], { h: 'end', k: 12, b: true, r });
      });
      for (const [hh, ee] of iz) nokta(alt, e.x(hh), e.y(sinir(ee, 1e-5, 1)), 2.5, 'var(--ikincil)');
      if (iki) { const v = (c - 2 * b + a) / h / h; o({ h: tr(h, 3), 'f″ ≈ (1, −2, 1)/h²': tr(v, 5), gerçek: '−1,75', hata: tr(v - gercek, 5), 'hata / h²': `${tr((v - gercek) / h / h, 3)} (= f⁗/12 = −0,2)` }); }
      else { const pc = (v) => `${tr(v, 4)} (${tr(Math.abs((v - gercek) / gercek) * 100, 1)} %)`; o({ h: tr(h, 3), ileri: pc((c - b) / h), geri: pc((b - a) / h), merkezi: pc((c - a) / 2 / h), gerçek: '−0,9125' }); }
    };
    sH.inp.addEventListener('input', ciz);
    let oyn = null;
    if (anim) {
      oyn = dongu(btn, (dt) => { const h = sH.v * Math.exp(-0.9 * dt); if (h <= 0.02) { sH.set(0.02); ciz(); return false; } sH.set(+h.toFixed(4)); iz.push([h, hata(h)[iki ? 0 : 2]]); if (iz.length > 400) iz.shift(); ciz(); });
      b2.addEventListener('click', () => { oyn.dur(); iz.length = 0; sH.set(0.5); ciz(); });
    }
    ciz();
    return { dur: oyn ? oyn.dur : () => {} };
  }
  Sekil.m303_fark = function (kap, ayar = {}) { farkKur(kap, ayar, false); };
  Anim.m303_fark = function (kap, ayar = {}) { return farkKur(kap, ayar, true); };

  Sekil.m303_sablon = function (kap, ayar = {}) {
    const tip = ayar.tip || '1b', W = 640, H = tip === '1b' ? 330 : 340, svg = svgYap(kap, W, H, tip === '1b' ? '1B ikinci fark şablonu 1, −2, 1' : tip === '5n' ? '5 noktalı Laplace şablonu' : 'Yalıtımlı kenar: hayalet düğüm');
    const dugum = (x, y, w, renk = 'var(--acc)', etiket, alt, o = {}) => {
      svg.append(el('circle', { cx: x, cy: y, r: o.r || 26, fill: o.bos ? 'var(--zemin)' : renk, opacity: o.op ?? (o.bos ? 1 : 0.9), stroke: renk, 'stroke-width': 3, 'stroke-dasharray': o.kesik ? '6 4' : null }));
      if (w != null) yaz(svg, x, y + 6, w, { h: 'middle', k: 18, b: true, r: o.bos ? renk : 'var(--zemin)' });
      if (etiket) yaz(svg, x, y + (o.ust ? -36 : 46), etiket, { h: 'middle', k: 13, b: true, r: o.er || 'var(--yazi)' });
      void alt;
    };
    if (tip === '1b') {
      cizgi(svg, 120, 80, 520, 80, 'var(--ikincil)', 2);
      dugum(170, 80, '+1', 'var(--acc)', 'fᵢ₋₁'); dugum(320, 80, '−2', 'var(--tur)', 'fᵢ'); dugum(470, 80, '+1', 'var(--acc)', 'fᵢ₊₁');
      yaz(svg, 245, 70, 'h', { h: 'middle', k: 14, b: true, r: 'var(--ikincil)' }); yaz(svg, 395, 70, 'h', { h: 'middle', k: 14, b: true, r: 'var(--ikincil)' });
      yaz(svg, 560, 86, '÷ h²', { k: 18, b: true });
      // alt: üç noktadan parabol
      const d = eksen(svg, { W, H, L: 120, R: 200, T: 170, B: 30, x: [-0.05, 1.05], y: [0, 1.35], xt: [0, 0.5, 1], yt: [0, 0.6, 1.2], xf: (v) => tr(v, 1), yf: (v) => tr(v, 1) });
      svg.append(el('path', { d: egri(d, P4, -0.05, 1.05), fill: 'none', stroke: 'var(--yazi)', 'stroke-width': 2.5 }));
      const a = 1.2, b = 0.925, c = 0.2, m1 = (c - a), m2 = (c - 2 * b + a) / 0.25;
      svg.append(el('path', { d: egri(d, (x) => b + m1 * (x - 0.5) + m2 / 2 * (x - 0.5) ** 2, -0.05, 1.05), fill: 'none', stroke: 'var(--tur)', 'stroke-width': 2.5, 'stroke-dasharray': '7 5' }));
      for (const [x, y] of [[0, a], [0.5, b], [1, c]]) nokta(svg, d.x(x), d.y(y), 5.5);
      yaz(svg, 455, 230, 'parabolün ikinci türevi', { k: 13, b: true, r: 'var(--tur)' });
      yaz(svg, 455, 250, '(0,2 − 1,85 + 1,2)/0,25', { k: 12, r: 'var(--tur)' });
      yaz(svg, 455, 272, '= −1,80', { k: 15, b: true, r: 'var(--tur)' });
      yaz(svg, 455, 294, 'gerçek −1,75', { k: 12, r: 'var(--ikincil)' });
      return;
    }
    if (tip === '5n') {
      const cx = 250, cy = 170, s = 110;
      for (let i = -2; i <= 2; i++) { cizgi(svg, cx + i * s, 30, cx + i * s, 310, 'var(--cizgi)', 1); cizgi(svg, 30, cy + i * s * 0.6, 470, cy + i * s * 0.6, 'var(--cizgi)', 1); }
      const sy = s * 0.6 > 70 ? s * 0.6 : 70;
      cizgi(svg, cx - s, cy, cx + s, cy, 'var(--ikincil)', 3); cizgi(svg, cx, cy - sy, cx, cy + sy, 'var(--ikincil)', 3);
      dugum(cx, cy, '−4', 'var(--tur)', null, null, { r: 30 }); yaz(svg, cx + 36, cy + 42, 'T(i, j)', { k: 13, b: true });
      dugum(cx - s, cy, '+1', 'var(--acc)', 'T(i−1, j)', null, { r: 24 }); dugum(cx + s, cy, '+1', 'var(--acc)', 'T(i+1, j)', null, { r: 24 });
      dugum(cx, cy - sy, '+1', 'var(--acc)', null, null, { r: 24 }); yaz(svg, cx + 32, cy - sy + 6, 'T(i, j+1)', { k: 13, b: true });
      dugum(cx, cy + sy, '+1', 'var(--acc)', null, null, { r: 24 }); yaz(svg, cx + 32, cy + sy + 6, 'T(i, j−1)', { k: 13, b: true });
      yaz(svg, 480, 120, '÷ Δx²  (Δx = Δy)', { k: 16, b: true });
      yaz(svg, 480, 160, '= 0  (Laplace)', { k: 16, b: true });
      yaz(svg, 480, 200, 'x yönü: 1, −2, 1', { k: 13, r: 'var(--ikincil)' });
      yaz(svg, 480, 222, '+ y yönü: 1, −2, 1', { k: 13, r: 'var(--ikincil)' });
      yaz(svg, 480, 244, '= 4 komşu, merkez −4', { k: 13, b: true, r: 'var(--tur)' });
      yaz(svg, 480, 290, 'T(i,j) = komşu ortalaması', { k: 13, b: true });
      return;
    }
    // hayalet düğüm
    const a = sinir(ayar.adim ?? 2, 0, 2), X = [150, 280, 410, 540], Y = [80, 175, 270];
    for (let y = 40; y < 310; y += 14) cizgi(svg, 280 - 14, y + 14, 280, y, 'var(--ikincil)', 1.2);
    cizgi(svg, 280, 36, 280, 312, 'var(--yazi)', 5);
    yaz(svg, 272, 28, 'yalıtım: ∂T/∂x = 0', { h: 'end', k: 13, b: true });
    yaz(svg, 410, 28, 'levha', { h: 'middle', k: 13, b: true, r: 'var(--ikincil)' });
    for (const y of Y) for (const x of X.slice(1)) svg.append(el('circle', { cx: x, cy: y, r: 7, fill: 'var(--ikincil)', opacity: 0.6 }));
    const cy = Y[1], e = X[1];
    cizgi(svg, e, Y[0], e, Y[2], 'var(--acc)', 3); cizgi(svg, e, cy, X[2], cy, 'var(--acc)', a === 2 ? 7 : 3);
    cizgi(svg, X[0], cy, e, cy, a === 0 ? 'var(--tur)' : 'var(--ikincil)', 3, '7 5');
    dugum(e, cy, '−4', 'var(--tur)', null, null, { r: 26 }); yaz(svg, e - 8, cy + 46, 'T(0, j)', { h: 'end', k: 13, b: true });
    dugum(e, Y[0], '+1', 'var(--acc)', null, null, { r: 20 }); yaz(svg, e + 26, Y[0] - 8, 'T(0, j+1)', { k: 13, b: true });
    dugum(e, Y[2], '+1', 'var(--acc)', null, null, { r: 20 }); yaz(svg, e + 26, Y[2] + 22, 'T(0, j−1)', { k: 13, b: true });
    dugum(X[2], cy, a === 2 ? '+2' : '+1', 'var(--acc)', null, null, { r: 22 }); yaz(svg, X[2], cy + 44, 'T(1, j)', { h: 'middle', k: 13, b: true });
    if (a === 0) { yaz(svg, X[0], cy + 7, '?', { h: 'middle', k: 30, b: true, r: 'var(--tur)' }); yaz(svg, X[0], cy + 46, 'levhanın dışı', { h: 'middle', k: 13, b: true, r: 'var(--tur)' }); }
    if (a >= 1) {
      dugum(X[0], cy, a === 1 ? '+1' : null, 'var(--tur)', 'T(−1, j)', null, { r: 22, bos: true, kesik: true, op: a === 2 ? 0.35 : 1, er: 'var(--tur)' });
      const ya = cy - 50, gg2 = el('g', { opacity: a === 2 ? 0.45 : 1 }); svg.append(gg2);
      ok(gg2, X[2] - 10, ya, X[0] + 10, ya, 'var(--tur)', 2.5, true); ok(gg2, X[0] + 30, ya, X[2] - 4, ya, 'var(--tur)', 0.01);
      yaz(svg, 30, 112, 'ayna: T(−1, j) = T(1, j)', { k: 13, b: true, r: 'var(--tur)', hale: true });
    }
    if (a === 2) yaz(svg, 330, 330, '2T(1, j) + T(0, j+1) + T(0, j−1) − 4T(0, j) = 0', { h: 'middle', k: 15, b: true });
    else if (a === 1) yaz(svg, 330, 330, '(T(1, j) − T(−1, j)) / 2Δx = 0  →  T(−1, j) = T(1, j)', { h: 'middle', k: 14, b: true });
    else yaz(svg, 330, 330, 'kenar düğümü bilinmiyor; batı komşu levhanın dışında', { h: 'middle', k: 14, b: true });
  };

  /* ============================== K5 · PDE SINIFI, KARAKTERİSTİK ============================== */
  const PDE_ORNEK = { a: ['(a) T_xx + T_yy = 0', 1, 0, 1, 'Laplace'], b: ['(b) k·T_xx − T_t = 0   (x, t)', 1, 0, 0, 'ısı'], c: ['(c) u_tt − 4u_xx = 0   (x, t)', -4, 0, 1, 'dalga, c = 2'], d: ['(d) u_xx + 4u_xy + 4u_yy = 0', 1, 4, 4, ''], e: ['(e) u_xx + 2u_xy − 3u_yy = 0', 1, 2, -3, ''], f: ['(f) T_xx + T_yy = −f   (Poisson)', 1, 0, 1, 'kaynak D\'de'] };
  Sekil.m303_pde = function (kap, ayar = {}) {
    const W = 640, H = 340, svg = svgYap(kap, W, H, 'PDE sınıflandırma: B² − 4AC ve karakteristik yönler');
    const kat = el('g'); svg.append(kat);
    const clip = el('clipPath', { id: `m303pde${Math.random().toString(36).slice(2, 7)}` }); clip.append(el('rect', { x: 330, y: 40, width: 290, height: 270 })); svg.append(clip);
    const o = okuma(kap, ['A, B, C', 'B² − 4AC', 'tip', 'karakteristik dy/dx']);
    let mod = ayar.ornek || 'a', sA = null, sB = null, sC = null;
    const deg = { A: 1, B: 0, C: 1 };
    if (!ayar.kilit) {
      const k = kontrol(kap);
      secenek(k, ['a', 'b', 'c', 'd', 'e', 'f', 'y-bölge'], Math.max(0, 'abcdef'.indexOf(mod)) + (mod === 'bolge' ? 6 : 0), (i) => { mod = i === 6 ? 'bolge' : 'abcdef'[i]; if (mod !== 'bolge') { const p = PDE_ORNEK[mod]; sA.set(p[1]); sB.set(p[2]); sC.set(p[3]); } ciz(); });
      const k2 = kontrol(kap);
      sA = surgu(k2, 'A', -4, 4, 0.5, 1, (v) => tr(v, 1)); sB = surgu(k2, 'B', -4, 4, 0.5, 0, (v) => tr(v, 1)); sC = surgu(k2, 'C', -4, 4, 0.5, 1, (v) => tr(v, 1));
      for (const s of [sA, sB, sC]) s.inp.addEventListener('input', () => { mod = 'serbest'; ciz(); });
      if (mod !== 'bolge') { const p = PDE_ORNEK[mod]; sA.set(p[1]); sB.set(p[2]); sC.set(p[3]); }
    }
    const ciz = () => {
      kat.replaceChildren();
      kat.append(el('rect', { x: 330, y: 40, width: 290, height: 270, fill: 'var(--zemin)', stroke: 'var(--cizgi)', 'stroke-width': 1.5 }));
      if (mod === 'bolge') {
        const cx = 475, cy = 175, s = 65;   // 1 birim = 65 px
        kat.append(el('rect', { x: 330, y: 40, width: 290, height: cy - 40, fill: 'var(--acc-zemin)' }));
        kat.append(el('rect', { x: 330, y: cy, width: 290, height: 310 - cy, fill: 'var(--tur-zemin)' }));
        cizgi(kat, 330, cy, 620, cy, 'var(--yazi)', 3);
        const g = el('g', { 'clip-path': `url(#${clip.id})` }); kat.append(g);
        for (let x0 = -2.5; x0 <= 2.5; x0 += 0.5) for (const sg of [1, -1]) { const p = []; for (let yy = 0; yy >= -2.2; yy -= 0.05) p.push([cx + (x0 + sg * 2 / 3 * (-yy) ** 1.5) * s, cy - yy * s]); g.append(el('path', { d: yol(p), fill: 'none', stroke: 'var(--tur)', 'stroke-width': 1.5 })); }
        yaz(kat, 340, 64, 'y > 0: eliptik', { k: 14, b: true, r: 'var(--acc)' });
        yaz(kat, 610, cy - 8, 'y = 0: parabolik', { h: 'end', k: 13, b: true });
        yaz(kat, 330, 330, 'y < 0: hiperbolik (turuncu: karakteristikler)', { k: 13, b: true, r: 'var(--tur)' });
        yaz(kat, 20, 60, 'S18:  y·u_xx + u_yy = 0', { k: 17, b: true });
        yaz(kat, 20, 100, 'A = y,  B = 0,  C = 1', { k: 15 });
        yaz(kat, 20, 140, 'B² − 4AC = −4y', { k: 20, b: true, r: 'var(--tur)' });
        yaz(kat, 20, 180, 'tip bir NOKTANIN özelliği:', { k: 14 });
        yaz(kat, 20, 202, 'aynı denklemde üç bölge', { k: 14 });
        yaz(kat, 20, 250, 'y < 0: dx/dy = ±√(−y)', { k: 13, r: 'var(--ikincil)' });
        o({ 'A, B, C': 'y, 0, 1', 'B² − 4AC': '−4y', tip: 'y > 0 eliptik · y = 0 parabolik · y < 0 hiperbolik', 'karakteristik dy/dx': '±1/√(−y) (yalnız y < 0)' });
        return;
      }
      if (sA) { deg.A = sA.v; deg.B = sB.v; deg.C = sC.v; } else { const p = PDE_ORNEK[mod] || PDE_ORNEK.a; deg.A = p[1]; deg.B = p[2]; deg.C = p[3]; }
      const { A, B, C } = deg, D = B * B - 4 * A * C, eps = 1e-9;
      const tip = D < -eps ? 'eliptik' : D > eps ? 'hiperbolik' : 'parabolik', renk = tip === 'eliptik' ? 'var(--acc)' : tip === 'parabolik' ? 'var(--yesil)' : 'var(--tur)';
      const p = PDE_ORNEK[mod];
      yaz(kat, 20, 52, p ? p[0] : 'serbest: A·u_xx + B·u_xy + C·u_yy', { k: 15, b: true });
      if (p && p[4]) yaz(kat, 20, 76, p[4], { k: 13, r: 'var(--ikincil)' });
      yaz(kat, 20, 118, `A = ${tr(A, 1)} · B = ${tr(B, 1)} · C = ${tr(C, 1)}`, { k: 16, b: true });
      yaz(kat, 20, 160, `B² − 4AC = ${tr(B * B, 2)} − 4(${tr(A, 1)})(${tr(C, 1)})`, { k: 15 });
      yaz(kat, 20, 200, `= ${tr(D, 2)}`, { k: 26, b: true, r: renk });
      yaz(kat, 20, 244, tip.toLocaleUpperCase('tr-TR'), { k: 26, b: true, r: renk });
      yaz(kat, 20, 280, { eliptik: 'kararlı hal → iterasyon', parabolik: 'yayılma → zamanda ilerlet', hiperbolik: 'dalga → karakteristikler, CFL' }[tip], { k: 14 });
      // karakteristik yönler: A m² − B m + C = 0, m = dy/dx
      const yon = [];
      if (Math.abs(A) > eps) { if (D >= -eps) { const r = Math.sqrt(Math.max(D, 0)); for (const m of new Set([(B + r) / (2 * A), (B - r) / (2 * A)].map((v) => +v.toFixed(6)))) yon.push([1, m]); } }
      else if (Math.abs(B) > eps) { yon.push([1, C / B]); yon.push([0, 1]); }
      else if (Math.abs(C) > eps) yon.push([0, 1]);
      const g = el('g', { 'clip-path': `url(#${clip.id})` }); kat.append(g);
      const cx = 475, cy = 175;
      if (!yon.length) {
        for (const r of [30, 60, 90, 120]) g.append(el('circle', { cx, cy, r, fill: 'none', stroke: 'var(--acc)', 'stroke-width': 1.5, 'stroke-dasharray': '5 5' }));
        nokta(g, cx, cy, 6, 'var(--acc)');
        yaz(kat, 475, 330, 'gerçek karakteristik yok: etki her yöne', { h: 'middle', k: 13, b: true, r: 'var(--acc)' });
      } else {
        yon.forEach(([dx, dy], j) => {
          const n = Math.hypot(dx, dy), ux = dx / n, uy = -dy / n, nx = -uy, ny = ux;
          for (let s = -8; s <= 8; s++) { const ox = cx + nx * s * 26, oy = cy + ny * s * 26; cizgi(g, ox - ux * 400, oy - uy * 400, ox + ux * 400, oy + uy * 400, j ? 'var(--acc)' : 'var(--tur)', s ? 1.5 : 3); }
        });
        yaz(kat, 475, 330, yon.length === 2 ? 'iki karakteristik ailesi' : 'tek karakteristik ailesi', { h: 'middle', k: 13, b: true, r: renk });
      }
      yaz(kat, 620, 32, 'x →', { h: 'end', k: 12, r: 'var(--ikincil)' }); yaz(kat, 330, 32, '↑ y (ya da t)', { k: 12, r: 'var(--ikincil)' });
      o({ 'A, B, C': `${tr(A, 1)}, ${tr(B, 1)}, ${tr(C, 1)}`, 'B² − 4AC': tr(D, 2), tip, 'karakteristik dy/dx': yon.length ? yon.map(([dx, dy]) => (dx ? tr(dy, 2) : '∞ (düşey)')).join(' ve ') : 'yok' });
    };
    ciz();
  };

  function karKur(kap, ayar, anim) {
    const W = 640, H = 410, svg = svgYap(kap, W, H, 'Karakteristikler: x − ct = sabit boyunca profil değişmeden kayar');
    const kat = el('g'); svg.append(kat);
    const X0 = -0.6, X1 = 1.6, px = (x) => 50 + (x - X0) / (X1 - X0) * 560, u0 = (x) => Math.exp(-(((x - 0.25) / 0.08) ** 2));
    const yU = (u) => 150 - u * 105, yT = (t) => 380 - t * 180;
    let dalga = !!ayar.dalga;
    const o = okuma(kap, ['t', 'tepe x', 'kural']);
    const k = kontrol(kap); let btn = null, b2 = null;
    if (anim) { btn = dugme(k, '▶ Oynat'); b2 = dugme(k, 'Baştan', true); }
    const bD = dugme(k, dalga ? 'Adveksiyon (tek c)' : 'Dalga (±c)', true);
    const sT = surgu(kontrol(kap), 't', 0, 1, 0.01, anim ? 0 : 0.5, (v) => tr(v, 2));
    const ciz = () => {
      kat.replaceChildren();
      const t = sT.v, c = 1, u = (x) => (dalga ? 0.5 * (u0(x - c * t) + u0(x + c * t)) : u0(x - c * t));
      // üst panel
      cizgi(kat, 50, 150, 610, 150, 'var(--ikincil)', 1.2);
      for (let x = -0.5; x <= 1.51; x += 0.25) { cizgi(kat, px(x), 150, px(x), 156, 'var(--ikincil)', 1); yaz(kat, px(x), 172, tr(x, 2), { h: 'middle', k: 11, r: 'var(--ikincil)' }); }
      const p0 = [], p1 = []; for (let i = 0; i <= 300; i++) { const x = X0 + (X1 - X0) * i / 300; p0.push([px(x), yU(u0(x))]); p1.push([px(x), yU(u(x))]); }
      kat.append(el('path', { d: yol(p0), fill: 'none', stroke: 'var(--ikincil)', 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }));
      kat.append(el('path', { d: yol(p1), fill: 'none', stroke: 'var(--tur)', 'stroke-width': 3.5 }));
      yaz(kat, 56, 30, `u(x, t = ${tr(t, 2)}) · kesikli: t = 0`, { k: 13, b: true });
      // alt panel x–t
      kat.append(el('rect', { x: 50, y: yT(1), width: 560, height: yT(0) - yT(1), fill: 'var(--zemin)', stroke: 'var(--cizgi)' }));
      const cl = el('g'); kat.append(cl);
      for (let x0 = -1.5; x0 <= 1.6; x0 += 0.25) for (const sg of dalga ? [1, -1] : [1]) {
        const xa = x0, xb = x0 + sg * c; // t: 0 → 1
        const kes = (x) => sinir(x, X0, X1);
        let ta = 0, tb = 1; if (xb !== xa) { const tl = (X0 - xa) / (xb - xa), tr2 = (X1 - xa) / (xb - xa); ta = Math.max(0, Math.min(tl, tr2)); tb = Math.min(1, Math.max(tl, tr2)); }
        if (ta >= tb) continue;
        const ana = Math.abs(x0 - 0.25) < 1e-9;
        cizgi(cl, px(kes(xa + (xb - xa) * ta)), yT(ta), px(kes(xa + (xb - xa) * tb)), yT(tb), ana ? (sg > 0 ? 'var(--tur)' : 'var(--acc)') : 'var(--ikincil)', ana ? 3.5 : 1.2);
      }
      cizgi(kat, 50, yT(t), 610, yT(t), 'var(--yesil)', 2, '6 4');
      const tepeler = dalga ? [0.25 + t, 0.25 - t] : [0.25 + t];
      for (const xp of tepeler) if (xp >= X0 && xp <= X1) { nokta(kat, px(xp), yT(t), 7, 'var(--tur)'); cizgi(kat, px(xp), yU(dalga ? 0.5 : 1), px(xp), 150, 'var(--tur)', 1.5, '3 3'); }
      yaz(kat, 56, yT(1) - 8, dalga ? 'x–t düzlemi: dx/dt = ±c (iki aile)' : 'x–t düzlemi: dx/dt = c, x − ct = sabit', { k: 13, b: true });
      yaz(kat, 44, yT(0) + 4, '0', { h: 'end', k: 11, r: 'var(--ikincil)' }); yaz(kat, 44, yT(1) + 4, '1', { h: 'end', k: 11, r: 'var(--ikincil)' }); yaz(kat, 30, yT(0.5), 't', { k: 13, b: true });
      o({ t: tr(t, 2), 'tepe x': tepeler.map((v) => tr(v, 2)).join(' ve '), kural: dalga ? 'u = ½[u₀(x − ct) + u₀(x + ct)]' : 'u(x, t) = u₀(x − ct): şekil korunur' });
    };
    bD.addEventListener('click', () => { dalga = !dalga; bD.textContent = dalga ? 'Adveksiyon (tek c)' : 'Dalga (±c)'; ciz(); });
    sT.inp.addEventListener('input', ciz);
    let oyn = null;
    if (anim) {
      oyn = dongu(btn, (dt) => { const t = sT.v + dt * 0.25; if (t >= 1) { sT.set(1); ciz(); return false; } sT.set(+t.toFixed(3)); ciz(); });
      b2.addEventListener('click', () => { oyn.dur(); sT.set(0); ciz(); });
    }
    ciz();
    return { dur: oyn ? oyn.dur : () => {} };
  }
  Sekil.m303_karakteristik = function (kap, ayar = {}) { karKur(kap, ayar, false); };
  Anim.m303_karakteristik = function (kap, ayar = {}) { return karKur(kap, ayar, true); };

  /* ============================== K6 · FOURIER, ELEMAN, LEVHA, LIEBMANN ============================== */
  Sekil.m303_fourier = function (kap, ayar = {}) {
    const W = 640, H = 310, svg = svgYap(kap, W, H, 'Fourier yasası: çubukta sıcaklık profili ve ısı akısı');
    const kat = el('g'); svg.append(kat);
    const DUR = [[100, 0], [0, 100], [50, 50]][ayar.durum ?? 0] || [100, 0];
    const o = okuma(kap, ['T sol / sağ', 'dT/dx', 'q = −k′ dT/dx', 'yön']);
    let sL = { v: DUR[0] }, sR = { v: DUR[1] };
    if (!ayar.kilit) { const k = kontrol(kap); sL = surgu(k, 'T sol', 0, 100, 5, DUR[0], (v) => `${v} °C`); sR = surgu(k, 'T sağ', 0, 100, 5, DUR[1], (v) => `${v} °C`); }
    const X = (x) => 80 + x / 10 * 480, Yt = (T) => 170 - T * 1.25;
    const ciz = () => {
      kat.replaceChildren();
      const TL = sL.v, TR = sR.v, g = (TR - TL) / 10, q = -0.49 * g;
      cizgi(kat, X(0), 170, X(10), 170, 'var(--ikincil)', 1.2); cizgi(kat, X(0), 40, X(0), 170, 'var(--ikincil)', 1.2);
      for (const T of [0, 50, 100]) { yaz(kat, X(0) - 8, Yt(T) + 4, `${T}`, { h: 'end', k: 12, r: 'var(--ikincil)' }); cizgi(kat, X(0), Yt(T), X(10), Yt(T), 'var(--cizgi)', 1); }
      yaz(kat, X(0), 30, 'T (°C)', { k: 13, b: true });
      cizgi(kat, X(0), Yt(TL), X(10), Yt(TR), 'var(--yazi)', 3.5);
      for (let i = 0; i < 20; i++) { const T = TL + (TR - TL) * (i + 0.5) / 20; isiKutu(kat, X(i * 0.5), 190, 480 / 20 + 0.5, 34, T / 100); }
      kutu(kat, X(0), 190, 480, 34, { f: 'none', s: 'var(--yazi)', rx: 6, sw: 2 });
      yaz(kat, X(0) - 10, 212, `${TL}°`, { h: 'end', k: 14, b: true }); yaz(kat, X(10) + 10, 212, `${TR}°`, { k: 14, b: true });
      for (let x = 0; x <= 10; x += 2.5) yaz(kat, X(x), 240, `${tr(x, x % 1 ? 1 : 0)} cm`, { h: 'middle', k: 11, r: 'var(--ikincil)' });
      const L = Math.min(70, Math.abs(q) / 4.9 * 70);
      if (L > 2) for (const x of [1.5, 5, 8.5]) { const xm = X(x), sg = Math.sign(q); ok(kat, xm - sg * L / 2, 272, xm + sg * L / 2, 272, 'var(--tur)', 4); }
      else yaz(kat, 320, 278, 'akı yok (gradyan sıfır)', { h: 'middle', k: 14, b: true, r: 'var(--ikincil)' });
      yaz(kat, X(10), 300, 'oklar: ısı akısı q (sıcaktan soğuğa)', { h: 'end', k: 12, b: true, r: 'var(--tur)' });
      o({ 'T sol / sağ': `${TL} / ${TR} °C`, 'dT/dx': `${tr(g, 1)} °C/cm`, 'q = −k′ dT/dx': `${tr(q, 2)} cal/(cm²·s)  (k′ = 0,49)`, yön: Math.abs(q) < 1e-9 ? 'akı yok' : q > 0 ? '+x (sağa)' : '−x (sola)' });
    };
    if (sL.inp) for (const s of [sL, sR]) s.inp.addEventListener('input', ciz);
    ciz();
  };

  Sekil.m303_eleman = function (kap, ayar = {}) {
    const W = 640, H = 330, a = sinir(ayar.adim ?? 3, 0, 3), svg = svgYap(kap, W, H, 'Levha elemanı üzerinde ısı dengesi');
    const x0 = 230, y0 = 110, w = 180, h = 120, dz = 26;
    svg.append(el('path', { d: `M${x0},${y0} L${x0 + dz},${y0 - dz} L${x0 + w + dz},${y0 - dz} L${x0 + w},${y0} Z`, fill: 'var(--yuzey)', stroke: 'var(--ikincil)', 'stroke-width': 1.5 }));
    svg.append(el('path', { d: `M${x0 + w},${y0} L${x0 + w + dz},${y0 - dz} L${x0 + w + dz},${y0 + h - dz} L${x0 + w},${y0 + h} Z`, fill: 'var(--yuzey)', stroke: 'var(--ikincil)', 'stroke-width': 1.5 }));
    kutu(svg, x0, y0, w, h, { f: 'var(--acc-zemin)', s: 'var(--acc)', rx: 2, sw: 2 });
    yaz(svg, x0 + w / 2, y0 + h + 22, 'Δx', { h: 'middle', k: 15, b: true }); yaz(svg, x0 - 10, y0 + 24, 'Δy', { h: 'end', k: 15, b: true }); yaz(svg, x0 + w + dz + 6, y0 - dz + 12, 'Δz', { k: 15, b: true });
    yaz(svg, x0 + w / 2, y0 + h / 2 - 4, a >= 3 ? 'T_xx + T_yy = 0' : 'depolama = 0', { h: 'middle', k: a >= 3 ? 17 : 15, b: true, r: a >= 3 ? 'var(--tur)' : 'var(--acc)' });
    yaz(svg, x0 + w / 2, y0 + h / 2 + 18, '(kararlı hal)', { h: 'middle', k: 12, r: 'var(--ikincil)' });
    if (a >= 1) { ok(svg, 90, y0 + h / 2, x0 - 4, y0 + h / 2, 'var(--tur)', 4); yaz(svg, 92, y0 + h / 2 - 12, 'qₓ(x)', { k: 14, b: true, r: 'var(--tur)' }); ok(svg, x0 + w + 6, y0 + h / 2 + 14, x0 + w + 140, y0 + h / 2 + 14, 'var(--tur)', 4); yaz(svg, x0 + w + 40, y0 + h / 2 + 36, 'qₓ(x + Δx)', { k: 14, b: true, r: 'var(--tur)' }); }
    if (a >= 2) { ok(svg, x0 + w / 2, 310, x0 + w / 2, y0 + h + 30, 'var(--yesil)', 4); yaz(svg, x0 + w / 2 + 10, 300, 'q_y(y)', { k: 14, b: true, r: 'var(--yesil)' }); ok(svg, x0 + w / 2 - 30, y0 - dz - 4, x0 + w / 2 - 30, 18, 'var(--yesil)', 4); yaz(svg, x0 + w / 2 - 20, 34, 'q_y(y + Δy)', { k: 14, b: true, r: 'var(--yesil)' }); }
    const t = [['giren − çıkan = 0', 'qₓ(x) − qₓ(x+Δx)'], ['−∂qₓ/∂x − ∂q_y/∂y = 0', 'ΔxΔyΔzΔt ile böl'], ['q = −k′∇T koy', '→ T_xx + T_yy = 0']];
    for (let i = 0; i < a; i++) { yaz(svg, 12, 30 + i * 40, t[i][0], { k: 14, b: true, r: i === a - 1 ? 'var(--yazi)' : 'var(--ikincil)' }); yaz(svg, 12, 47 + i * 40, t[i][1], { k: 12, r: 'var(--ikincil)' }); }
  };

  /* S20 levhası: T[i][j], i = 0..4 (soldan), j = 0..4 (alttan); köşeler kullanılmaz */
  const LEV_SINIR = { sol: 75, sag: 50, alt: 0, ust: 100 };
  const LEV_COZUM = [[null, 75, 75, 75, null], [0, 42.8571, 63.1696, 78.5714, 100], [0, 33.2589, 56.25, 76.1161, 100], [0, 33.9286, 52.4554, 69.6429, 100], [null, 50, 50, 50, null]];
  const levhaBos = () => { const T = [0, 1, 2, 3, 4].map(() => [0, 0, 0, 0, 0]); for (let j = 1; j <= 3; j++) { T[0][j] = LEV_SINIR.sol; T[4][j] = LEV_SINIR.sag; } for (let i = 1; i <= 3; i++) { T[i][0] = LEV_SINIR.alt; T[i][4] = LEV_SINIR.ust; } return T; };
  function levhaCiz(g, T, o = {}) {
    const s = o.s || 78, x0 = o.x0 ?? 60, y0 = o.y0 ?? 360, X = (i) => x0 + i * s, Y = (j) => y0 - j * s, kh = s * 0.72;
    const hucre = [];
    for (let i = 0; i <= 4; i++) for (let j = 0; j <= 4; j++) {
      const sinirda = i === 0 || i === 4 || j === 0 || j === 4; if (sinirda && (i === 0 || i === 4) && (j === 0 || j === 4)) continue;
      const v = T[i][j], gg = el('g'); g.append(gg);
      if (sinirda) { kutu(gg, X(i) - kh * 0.42, Y(j) - kh * 0.32, kh * 0.84, kh * 0.64, { f: 'var(--yuzey)', s: 'var(--ikincil)', rx: 6 }); yaz(gg, X(i), Y(j) + 5, `${v}`, { h: 'middle', k: 13, b: true, r: 'var(--ikincil)' }); }
      else { isiKutu(gg, X(i) - kh / 2, Y(j) - kh / 2, kh, kh, sinir(v / 100, 0, 1)); yaz(gg, X(i), Y(j) + (o.yukari ? -kh / 2 + 15 : 5), v == null ? '' : tr(v, o.d ?? 2), { h: 'middle', k: o.yukari ? 12 : o.k || 14, b: true }); }
      hucre.push({ i, j, gg, X: X(i), Y: Y(j), sinirda });
    }
    return { X, Y, kh, hucre };
  }
  Sekil.m303_levha = function (kap, ayar = {}) {
    const W = 640, H = 400, aki = ayar.aki || 'yok', svg = svgYap(kap, W, H, aki === 'yok' ? 'S20 levhası: 9 iç düğüm ve sınır değerleri' : 'S20 levhasında sayısal ısı akısı vektörleri');
    const kat = el('g'), ust = el('g'); svg.append(kat, ust);
    const L = levhaCiz(kat, LEV_COZUM, { yukari: aki !== 'yok' });
    yaz(svg, L.X(2), 18, 'üst kenar 100 °C', { h: 'middle', k: 13, b: true }); yaz(svg, L.X(2), 396, 'alt kenar 0 °C', { h: 'middle', k: 13, b: true });
    const bilgi = satirKutu(kap);
    const T = LEV_COZUM, kp = 0.49, dx = 10;
    const q = (i, j) => { const qx = -kp * (T[i + 1][j] - T[i - 1][j]) / (2 * dx), qy = -kp * (T[i][j + 1] - T[i][j - 1]) / (2 * dx); return [qx, qy, Math.hypot(qx, qy), Math.atan2(qy, qx) * 180 / Math.PI]; };
    const yanKutu = el('g'); svg.append(yanKutu);
    yaz(yanKutu, 450, 70, 'sol 75 °C', { k: 13, b: true }); yaz(yanKutu, 450, 90, 'sağ 50 °C', { k: 13, b: true });
    yaz(yanKutu, 450, 130, aki === 'yok' ? 'bir düğüme bas:' : 'oklar: q = −k′∇T', { k: 13, r: 'var(--ikincil)' });
    yaz(yanKutu, 450, 150, aki === 'yok' ? 'fark denklemi altta' : 'k′ = 0,49 · Δx = 10 cm', { k: 13, r: 'var(--ikincil)' });
    const isaret = (i, j, komsu) => { ust.replaceChildren(); kutu(ust, L.X(i) - L.kh / 2 - 3, L.Y(j) - L.kh / 2 - 3, L.kh + 6, L.kh + 6, { f: 'none', s: 'var(--yazi)', sw: 3.5, rx: 6 }); for (const [a, b] of komsu) kutu(ust, L.X(a) - L.kh / 2 + 2, L.Y(b) - L.kh / 2 + 2, L.kh - 4, L.kh - 4, { f: 'none', s: 'var(--tur)', sw: 2.5, rx: 6, d: '5 3' }); };
    const denklem = (i, j) => {
      const kom = [[i - 1, j], [i + 1, j], [i, j - 1], [i, j + 1]], sag = [], sol = [];
      for (const [a, b] of kom) { const sn = a === 0 || a === 4 || b === 0 || b === 4; if (sn) sag.push(T[a][b]); else sol.push(`T${a}${b}`); }
      const ort = kom.reduce((s, [a, b]) => s + T[a][b], 0) / 4;
      bilgi(`(${i},${j}): 4T${i}${j}${sol.map((t) => ' − ' + t).join('')} = ${sag.length ? sag.join(' + ') + ' = ' + sag.reduce((a, b) => a + b, 0) : '0'}  ·  kontrol: komşu ortalaması (${kom.map(([a, b]) => tr(T[a][b], 2)).join(' + ')})/4 = ${tr(ort, 2)} = T${i}${j}`);
      isaret(i, j, kom);
    };
    const akiCiz = (i, j, parca) => {
      const [qx, qy] = q(i, j), sk = 44 / 1.9, x = L.X(i), y = L.Y(j) + 8;
      if (parca.includes('x')) ok(ust, x, y, x + qx * sk, y, 'var(--tur)', 3);
      if (parca.includes('y')) ok(ust, x, y, x, y - qy * sk, 'var(--acc)', 3);
      if (parca.includes('q')) ok(ust, x, y, x + qx * sk, y - qy * sk, 'var(--yazi)', 3.5);
    };
    if (aki === 'tum') {
      const tumunu = () => { ust.replaceChildren(); for (let i = 1; i <= 3; i++) for (let j = 1; j <= 3; j++) akiCiz(i, j, 'q'); };
      tumunu();
      L.hucre.filter((h) => !h.sinirda).forEach((h) => { h.gg.style.cursor = 'pointer'; h.gg.addEventListener('click', () => { tumunu(); kutu(ust, h.X - L.kh / 2 - 3, h.Y - L.kh / 2 - 3, L.kh + 6, L.kh + 6, { f: 'none', s: 'var(--yazi)', sw: 3, rx: 6 }); const [qx, qy, qq, th] = q(h.i, h.j); bilgi(`(${h.i},${h.j}): qₓ = −0,49(${tr(T[h.i + 1][h.j], 2)} − ${tr(T[h.i - 1][h.j], 2)})/20 = ${tr(qx, 3)} · q_y = −0,49(${tr(T[h.i][h.j + 1], 2)} − ${tr(T[h.i][h.j - 1], 2)})/20 = ${tr(qy, 3)} · |q| = ${tr(qq, 3)} cal/(cm²·s) · θ = ${tr(th, 1)}°`); }); });
      bilgi('Bir düğüme bas: qₓ, q_y, büyüklük ve yön. (1,1) = S22.');
    } else if (aki === 'dugum') {
      const a = sinir(ayar.adim ?? 2, 0, 2), [qx, qy, qq, th] = q(1, 1);
      if (a === 0) { isaret(1, 1, [[0, 1], [2, 1]]); akiCiz(1, 1, 'x'); bilgi(`qₓ = −0,49 (T21 − T01)/(2·10) = −0,49 (33,26 − 75)/20 = +${tr(qx, 3)} → sağa`); }
      else if (a === 1) { isaret(1, 1, [[1, 0], [1, 2]]); akiCiz(1, 1, 'xy'); bilgi(`q_y = −0,49 (T12 − T10)/20 = −0,49 (63,17 − 0)/20 = ${tr(qy, 3)} → aşağı`); }
      else { isaret(1, 1, []); akiCiz(1, 1, 'xyq'); bilgi(`|q| = √(${tr(qx, 3)}² + ${tr(Math.abs(qy), 3)}²) = ${tr(qq, 3)} cal/(cm²·s) · θ = atan2(${tr(qy, 3)}; ${tr(qx, 3)}) = ${tr(th, 1)}° (sağa-aşağı)`); }
    } else {
      L.hucre.filter((h) => !h.sinirda).forEach((h) => { h.gg.style.cursor = 'pointer'; h.gg.setAttribute('tabindex', 0); h.gg.addEventListener('click', () => denklem(h.i, h.j)); h.gg.addEventListener('keydown', (e) => { if (e.key === 'Enter') denklem(h.i, h.j); }); });
      denklem(1, 1);
    }
  };

  Anim.m303_liebmann = function (kap, ayar = {}) {
    const W = 640, H = 380, svg = svgYap(kap, W, H, 'Liebmann (Gauss–Seidel / SOR) yinelemesi, düğüm düğüm');
    const kat = el('g'), grf = el('g'); svg.append(kat, grf);
    const bilgi = satirKutu(kap);
    const k = kontrol(kap); const bO = dugme(k, '▶ Oynat'), bD = dugme(k, 'Düğüm ›', true), bT = dugme(k, 'Tur »', true), bB = dugme(k, 'Baştan', true);
    const k2 = kontrol(kap);
    let yontem = ayar.yontem || 'sor';
    const sec = secenek(k2, ['Jacobi', 'Gauss–Seidel', 'SOR'], ['jacobi', 'gs', 'sor'].indexOf(yontem), (i) => { yontem = ['jacobi', 'gs', 'sor'][i]; bas(); });
    void sec;
    const sL = surgu(kontrol(kap), 'λ (SOR)', 1, 1.95, 0.05, ayar.lam ?? 1.5, (v) => tr(v, 2));
    let T, eski, sira, tur, eaTur, gecmis, bitti, son;
    const SIRA = []; for (let j = 1; j <= 3; j++) for (let i = 1; i <= 3; i++) SIRA.push([i, j]);
    const lam = () => (yontem === 'sor' ? sL.v : 1);
    function bas() { T = levhaBos(); eski = null; sira = 0; tur = 1; eaTur = 0; gecmis = []; bitti = false; son = null; ciz(); bilgi(`Başlangıç: iç düğümler 0 °C. Yöntem ${{ jacobi: 'Jacobi', gs: 'Gauss–Seidel', sor: 'SOR' }[yontem]}, λ = ${tr(lam(), 2)}. Tarama sırası T11, T21, T31, T12, …`); }
    function dugumAdim() {
      if (bitti) return false;
      if (sira === 0 && yontem === 'jacobi') eski = T.map((r) => r.slice());
      const [i, j] = SIRA[sira], src = yontem === 'jacobi' ? eski : T, l = lam();
      const kom = [src[i - 1][j], src[i + 1][j], src[i][j - 1], src[i][j + 1]], gs = kom.reduce((a, b) => a + b, 0) / 4, old = T[i][j], yeni = l * gs + (1 - l) * old;
      T[i][j] = yeni; const ea = yeni !== 0 ? Math.abs((yeni - old) / yeni) * 100 : 0; eaTur = Math.max(eaTur, ea);
      son = [i, j];
      bilgi(`Tur ${tur} · T${i}${j}: ${yontem === 'jacobi' ? 'eski' : 'en yeni'} komşular (${kom.map((v) => tr(v, 3)).join(' + ')})/4 = ${tr(gs, 3)}${l !== 1 ? ` → ${tr(l, 2)}·${tr(gs, 3)} ${1 - l < 0 ? '−' : '+'} ${tr(Math.abs(1 - l), 2)}·${tr(old, 3)} = ${tr(yeni, 3)}` : ''} · ε_a = %${tr(ea, 1)}`);
      sira++;
      if (sira === 9) {
        gecmis.push(eaTur);
        if (eaTur < 1) { bitti = true; bilgi(`Yakınsadı: ${tur}. turda en büyük ε_a = %${tr(eaTur, 2)} < %1. T22 = ${tr(T[2][2], 3)} (kesin 56,25).`); }
        else if (tur >= 200) bitti = true;
        sira = 0; tur++; eaTur = 0;
      }
      return true;
    }
    function ciz() {
      kat.replaceChildren(); grf.replaceChildren();
      const L = levhaCiz(kat, T, { s: 64, x0: 40, y0: 330, k: 12, d: 2 });
      if (son && !bitti) { const [i, j] = son; kutu(kat, L.X(i) - L.kh / 2 - 3, L.Y(j) - L.kh / 2 - 3, L.kh + 6, L.kh + 6, { f: 'none', s: 'var(--yazi)', sw: 3.5, rx: 6 }); }
      yaz(kat, 168, 24, `tur ${Math.min(tur, 999)} · düğüm ${sira}/9`, { h: 'middle', k: 13, b: true });
      // yakınsama grafiği
      const n = Math.max(10, gecmis.length + 1);
      const d = eksen(grf, { W, H, L: 380, R: 16, T: 40, B: 44, x: [0, n], y: [0.01, 200], ylog: true, xt: tikler(0, n, 5), yt: [0.01, 0.1, 1, 10, 100], xf: (v) => `${v}`, yf: (v) => (v >= 1 ? `${v}` : tr(v, v < 0.1 ? 2 : 1)), xad: 'tur', yad: 'en büyük ε_a (%)' });
      cizgi(grf, d.x(0), d.y(1), d.x(n), d.y(1), 'var(--yesil)', 2, '6 4'); yaz(grf, d.x(n) - 4, d.y(1) - 6, 'ε_s = %1', { h: 'end', k: 12, b: true, r: 'var(--yesil)' });
      if (gecmis.length) { const p = gecmis.map((v, i) => [d.x(i + 1), d.y(sinir(v, 0.01, 200))]); grf.append(el('path', { d: yol(p), fill: 'none', stroke: 'var(--tur)', 'stroke-width': 2.5 })); p.forEach(([x, y]) => nokta(grf, x, y, 4, 'var(--tur)')); }
    }
    const oyn = dongu(bO, (() => { let kz = 0; return (dt) => { kz += dt; if (kz < 0.16) return; kz = 0; const ok2 = dugumAdim(); ciz(); if (!ok2 || bitti) return false; }; })());
    bD.addEventListener('click', () => { oyn.dur(); dugumAdim(); ciz(); });
    bT.addEventListener('click', () => { oyn.dur(); const t0 = tur; while (!bitti && tur === t0) dugumAdim(); ciz(); });
    bB.addEventListener('click', () => { oyn.dur(); bas(); });
    sL.inp.addEventListener('input', () => { oyn.dur(); bas(); });
    bas();
    return { dur: oyn.dur };
  };

  Sekil.m303_yaris = function (kap) {
    const W = 640, H = 340, svg = svgYap(kap, W, H, 'Jacobi, Gauss–Seidel ve SOR yakınsama hızı; λ\'ya göre tur sayısı');
    const sol = el('g'), sag = el('g'); svg.append(sol, sag);
    const o = okuma(kap, ['λ', 'ε_s = %1 için tur', 'hata < 0,01 için tur']);
    const sL = surgu(kontrol(kap), 'λ', 1, 1.95, 0.01, 1.5, (v) => tr(v, 2));
    const KES = levhaBos(); for (let it = 0; it < 400; it++) for (let j = 1; j <= 3; j++) for (let i = 1; i <= 3; i++) KES[i][j] = (KES[i - 1][j] + KES[i + 1][j] + KES[i][j - 1] + KES[i][j + 1]) / 4;
    const kosu = (y, l, N = 40) => {
      const T = levhaBos(), hata = [], ea = []; let erken = null, hErken = null;
      for (let it = 1; it <= N; it++) {
        const src = y === 'jacobi' ? T.map((r) => r.slice()) : T; let em = 0;
        for (let j = 1; j <= 3; j++) for (let i = 1; i <= 3; i++) { const old = T[i][j], g = (src[i - 1][j] + src[i + 1][j] + src[i][j - 1] + src[i][j + 1]) / 4, nw = l * g + (1 - l) * old; T[i][j] = nw; if (nw) em = Math.max(em, Math.abs((nw - old) / nw) * 100); }
        let hm = 0; for (let j = 1; j <= 3; j++) for (let i = 1; i <= 3; i++) hm = Math.max(hm, Math.abs(T[i][j] - KES[i][j]));
        hata.push(hm); ea.push(em); if (erken == null && em < 1) erken = it; if (hErken == null && hm < 0.01) hErken = it;
      }
      return { hata, erken, hErken };
    };
    const egriler = [['jacobi', 1, 'Jacobi', 'var(--ikincil)'], ['gs', 1, 'Gauss–Seidel (λ = 1)', 'var(--acc)'], ['gs', 1.17, 'SOR λ = 1,17 (optimum)', 'var(--yesil)']].map(([y, l, ad, r]) => ({ ad, r, ...kosu(y, l, 30) }));
    const lamlar = []; for (let l = 1; l <= 1.951; l += 0.01) lamlar.push([+l.toFixed(2), kosu('gs', l, 300).erken]);
    const ciz = () => {
      sol.replaceChildren(); sag.replaceChildren();
      const l = sL.v, ben = kosu('gs', l, 300);
      const d = eksen(sol, { W: 330, H, L: 56, R: 10, T: 40, B: 44, x: [0, 30], y: [1e-6, 100], ylog: true, xt: [0, 10, 20, 30], yt: [1e-6, 1e-4, 1e-2, 1, 100], yf: us10, xad: 'tur', yad: 'en büyük |T − T*|' });
      for (const e of [...egriler, { ad: `SOR λ = ${tr(l, 2)}`, r: 'var(--tur)', hata: ben.hata.slice(0, 30) }]) sol.append(el('path', { d: yol(e.hata.slice(0, 30).map((v, i) => [d.x(i + 1), d.y(sinir(v, 1e-6, 100))])), fill: 'none', stroke: e.r, 'stroke-width': 2.5 }));
      [...egriler, { ad: `SOR λ = ${tr(l, 2)}`, r: 'var(--tur)' }].forEach((e, i) => yaz(sol, 330, 40 + i * 17, e.ad, { h: 'end', k: 11, b: true, r: e.r }));
      const e2 = eksen(sag, { W, H, L: 400, R: 16, T: 40, B: 44, x: [1, 1.95], y: [0, 60], xt: [1, 1.2, 1.4, 1.6, 1.8], yt: [0, 20, 40, 60], xf: (v) => tr(v, 1), xad: 'λ', yad: 'tur (ε_s = %1)' });
      sag.append(el('path', { d: yol(lamlar.map(([lm, n]) => [e2.x(lm), e2.y(sinir(n ?? 60, 0, 60))])), fill: 'none', stroke: 'var(--yazi)', 'stroke-width': 2.5 }));
      nokta(sag, e2.x(1.17), e2.y(kosu('gs', 1.17, 300).erken), 5, 'var(--yesil)');
      nokta(sag, e2.x(l), e2.y(sinir(ben.erken ?? 60, 0, 60)), 7, 'var(--tur)');
      yaz(sag, e2.x(1.17), e2.y(kosu('gs', 1.17, 300).erken) + 22, 'λ_opt ≈ 1,17', { h: 'middle', k: 12, b: true, r: 'var(--yesil)' });
      o({ λ: tr(l, 2), 'ε_s = %1 için tur': `${ben.erken ?? '> 300'}`, 'hata < 0,01 için tur': `${ben.hErken ?? '> 300'}` });
    };
    sL.inp.addEventListener('input', ciz);
    ciz();
  };

  /* ============================== K7 · THOMAS, JACOBI–GS ============================== */
  Sekil.m303_matris = function (kap, ayar = {}) {
    const tip = ayar.tip || 'thomas', W = 640, H = tip === 'thomas' ? 320 : 330, svg = svgYap(kap, W, tip === 'thomas' ? 345 : H, tip === 'thomas' ? 'Üç köşegenli matris ve işlem sayısı' : 'Laplace 9 × 9 seyrek matrisi');
    if (tip === 'thomas') {
      const s = 52, x0 = 24, y0 = 60;
      yaz(svg, x0, 36, 'S24 matrisi', { k: 14, b: true });
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        const d = c - r, renk = d === 0 ? 'var(--tur)' : d === -1 ? 'var(--acc)' : d === 1 ? 'var(--yesil)' : null;
        kutu(svg, x0 + c * s, y0 + r * s, s - 4, s - 4, { f: renk ? 'var(--zemin)' : 'var(--yuzey)', s: renk || 'var(--cizgi)', sw: renk ? 2.5 : 1, rx: 6 });
        yaz(svg, x0 + c * s + s / 2 - 2, y0 + r * s + s / 2 + 3, d === 0 ? '2,04' : Math.abs(d) === 1 ? '−1' : '0', { h: 'middle', k: 14, b: !!renk, r: renk || 'var(--ikincil)' });
      }
      const xv = x0 + 4 * s + 12;
      ['T₁', 'T₂', 'T₃', 'T₄'].forEach((t, i) => { kutu(svg, xv, y0 + i * s, 40, s - 4, { rx: 6 }); yaz(svg, xv + 20, y0 + i * s + s / 2 + 3, t, { h: 'middle', k: 14, b: true }); });
      yaz(svg, xv + 56, y0 + 2 * s, '=', { h: 'middle', k: 20, b: true });
      ['40,8', '0,8', '0,8', '200,8'].forEach((t, i) => { kutu(svg, xv + 72, y0 + i * s, 58, s - 4, { rx: 6 }); yaz(svg, xv + 101, y0 + i * s + s / 2 + 3, t, { h: 'middle', k: 13, b: true }); });
      yaz(svg, x0, y0 + 4 * s + 20, '■ e alt', { k: 13, b: true, r: 'var(--acc)' }); yaz(svg, x0 + 70, y0 + 4 * s + 20, '■ f ana', { k: 13, b: true, r: 'var(--tur)' }); yaz(svg, x0 + 140, y0 + 4 * s + 20, '■ g üst', { k: 13, b: true, r: 'var(--yesil)' });
      yaz(svg, x0, y0 + 4 * s + 42, 'gerisi 0 → yalnız 3 vektör saklanır', { k: 12, r: 'var(--ikincil)' });
      const d = eksen(svg, { W, H, L: 440, R: 12, T: 40, B: 44, x: [10, 10000], y: [10, 1e12], xlog: true, ylog: true, xt: [10, 100, 1000, 10000], yt: [10, 1e4, 1e8, 1e12], xf: us10, yf: us10, xad: 'n', yad: 'işlem sayısı' });
      svg.append(el('path', { d: egri(d, (n) => 8 * n, 10, 10000, 60, true), fill: 'none', stroke: 'var(--yesil)', 'stroke-width': 3 }));
      svg.append(el('path', { d: egri(d, (n) => 2 * n ** 3 / 3, 10, 10000, 60, true), fill: 'none', stroke: 'var(--tur)', 'stroke-width': 3 }));
      yaz(svg, d.x(300), d.y(8 * 300) + 22, 'Thomas ≈ 8n', { k: 12, b: true, r: 'var(--yesil)' });
      yaz(svg, d.x(150) - 6, d.y(2 * 150 ** 3 / 3) - 6, 'Gauss ≈ 2n³/3', { h: 'end', k: 12, b: true, r: 'var(--tur)', hale: true });
      nokta(svg, d.x(1000), d.y(8000), 5, 'var(--yesil)'); nokta(svg, d.x(1000), d.y(2e9 / 3), 5, 'var(--tur)');
      yaz(svg, x0, y0 + 4 * s + 66, 'n = 1000: Gauss/Thomas ≈ 83 000 kat', { k: 13, b: true });
      return;
    }
    const s = 26, x0 = 30, y0 = 50, ad = ['T11', 'T21', 'T31', 'T12', 'T22', 'T32', 'T13', 'T23', 'T33'], b = [75, 0, 50, 75, 0, 50, 175, 100, 150];
    const kom = (r, c) => { const [i1, j1] = [r % 3, Math.floor(r / 3)], [i2, j2] = [c % 3, Math.floor(c / 3)]; return Math.abs(i1 - i2) + Math.abs(j1 - j2) === 1; };
    yaz(svg, x0, 30, 'S20: 9 × 9 katsayı matrisi', { k: 14, b: true });
    let dolu = 0;
    for (let r = 0; r < 9; r++) {
      yaz(svg, x0 + 9 * s + 8, y0 + r * s + 17, '', {});
      for (let c = 0; c < 9; c++) {
        const v = r === c ? 4 : kom(r, c) ? -1 : 0; if (v) dolu++;
        kutu(svg, x0 + c * s, y0 + r * s, s - 2, s - 2, { f: v === 4 ? 'var(--tur-zemin)' : v ? 'var(--acc-zemin)' : 'var(--zemin)', s: v ? (v === 4 ? 'var(--tur)' : 'var(--acc)') : 'var(--cizgi)', sw: 1, rx: 3 });
        if (v) yaz(svg, x0 + c * s + s / 2 - 1, y0 + r * s + 17, v === 4 ? '4' : '−1', { h: 'middle', k: 11, b: true, r: v === 4 ? 'var(--tur)' : 'var(--acc)' });
      }
      kutu(svg, x0 + 9 * s + 30, y0 + r * s, 44, s - 2, { rx: 3 }); yaz(svg, x0 + 9 * s + 52, y0 + r * s + 17, `${b[r]}`, { h: 'middle', k: 12, b: true });
      yaz(svg, x0 - 4, y0 + r * s + 17, '', {});
    }
    ad.forEach((t, c) => yaz(svg, x0 + c * s + s / 2 - 1, y0 - 6, t, { h: 'middle', k: 9, r: 'var(--ikincil)' }));
    yaz(svg, x0 + 9 * s + 52, y0 - 6, 'b', { h: 'middle', k: 12, b: true });
    const tx = 360;
    yaz(svg, tx, 80, `seyrek: 81 elemandan ${dolu}'ü dolu`, { k: 14, b: true });
    yaz(svg, tx, 108, 'bantlı: köşegen ±1 ve ±3', { k: 14 });
    yaz(svg, tx, 136, 'satır başına en çok 5 eleman', { k: 14 });
    yaz(svg, tx, 176, 'köşegen baskın: |4| ≥ komşu sayısı', { k: 14, b: true, r: 'var(--tur)' });
    yaz(svg, tx, 198, '(T22 satırında eşit: zayıf baskın; yine', { k: 12, r: 'var(--ikincil)' });
    yaz(svg, tx, 216, 'de Jacobi/GS yakınsar)', { k: 12, r: 'var(--ikincil)' });
    yaz(svg, tx, 256, 'b = sınır değerleri (köşede iki sınır)', { k: 13 });
    yaz(svg, tx, 290, 'büyük ızgara → Liebmann', { k: 14, b: true, r: 'var(--yesil)' });
  };

  Anim.m303_thomas = function (kap) {
    const W = 640, H = 300, sv = document.createElement('div'); kap.append(sv);
    const bilgi = satirKutu(kap);
    const k = kontrol(kap); const bO = dugme(k, '▶ Oynat'), bG = dugme(k, '‹ Önceki', true), bS = dugme(k, 'Sonraki ›', true), bB = dugme(k, 'Baştan', true);
    // durumlar: 0 başlangıç · 1–3 ileri eleme (k = 2..4) · 4–7 geri koyma (T4..T1)
    const D = []; let e = [null, -1, -1, -1], f = [2.04, 2.04, 2.04, 2.04], g = [-1, -1, -1, null], r = [40.8, 0.8, 0.8, 200.8], x = [null, null, null, null];
    const kopya = (o) => ({ e: e.slice(), f: f.slice(), g: g.slice(), r: r.slice(), x: x.slice(), ...o });
    D.push(kopya({ akt: null, kul: null, deg: [], yazi: 'Başlangıç: e = (−, −1, −1, −1) · f = 2,04 · g = (−1, −1, −1, −) · r = (40,8; 0,8; 0,8; 200,8). Önce İLERİ ELEME (k = 2 → 4).' }));
    for (let kk = 1; kk <= 3; kk++) {
      const e0 = e[kk], f0 = f[kk], r0 = r[kk];
      e[kk] = e0 / f[kk - 1]; f[kk] = f0 - e[kk] * g[kk - 1]; r[kk] = r0 - e[kk] * r[kk - 1];
      D.push(kopya({ akt: kk, kul: kk - 1, deg: ['e', 'f', 'r'], yazi: `k = ${kk + 1}: çarpan e = ${tr(e0, 0)}/${tr(f[kk - 1], 6)} = ${tr(e[kk], 6)} · f = ${tr(f0, 2)} − (${tr(e[kk], 6)})(${tr(g[kk - 1], 0)}) = ${tr(f[kk], 6)} · r = ${tr(r0, 1)} − (${tr(e[kk], 6)})(${tr(r[kk - 1], 6)}) = ${tr(r[kk], 6)}` }));
    }
    x[3] = r[3] / f[3];
    D.push(kopya({ akt: 3, kul: null, deg: ['x'], yazi: `GERİ YERİNE KOYMA: T₄ = r₄/f₄ = ${tr(r[3], 6)}/${tr(f[3], 6)} = ${tr(x[3], 3)}` }));
    for (let kk = 2; kk >= 0; kk--) { x[kk] = (r[kk] - g[kk] * x[kk + 1]) / f[kk]; D.push(kopya({ akt: kk, kul: kk + 1, deg: ['x'], yazi: `T${'₁₂₃₄'[kk]} = (r − g·T${'₁₂₃₄'[kk + 1]})/f = (${tr(r[kk], 6)} − (${tr(g[kk], 0)})(${tr(x[kk + 1], 3)}))/${tr(f[kk], 6)} = ${tr(x[kk], 3)}${kk === 0 ? ' · kontrol: 2,04·65,970 − 93,778 = 40,8 ✓' : ''}` })); }
    let s = 0;
    const ciz = () => {
      sv.replaceChildren();
      const svg = svgYap(sv, W, H, 'Thomas algoritması adım adım (S24)'), st = D[s];
      const kol = ['k', 'e (alt)', 'f (ana)', 'g (üst)', 'r (sağ)', 'T (çözüm)'], cx = [20, 80, 190, 300, 380, 500], cw = [52, 104, 104, 72, 112, 120];
      kol.forEach((t, i) => yaz(svg, cx[i] + cw[i] / 2, 34, t, { h: 'middle', k: 13, b: true, r: ['var(--yazi)', 'var(--acc)', 'var(--tur)', 'var(--yesil)', 'var(--yazi)', 'var(--yazi)'][i] }));
      for (let row = 0; row < 4; row++) {
        const y = 48 + row * 52, akt = st.akt === row, kul = st.kul === row;
        kutu(svg, 14, y, 618, 46, { f: akt ? 'var(--tur-zemin)' : kul ? 'var(--acc-zemin)' : 'var(--zemin)', s: akt ? 'var(--tur)' : kul ? 'var(--acc)' : 'var(--cizgi)', sw: akt || kul ? 2 : 1 });
        const isl = row > 0 && s >= row;   // bu satır ileri elemeden geçti mi?
        const hucre = [`${row + 1}`, st.e[row] == null ? '—' : tr(st.e[row], isl ? 6 : 0), tr(st.f[row], isl ? 6 : 2), st.g[row] == null ? '—' : tr(st.g[row], 0), tr(st.r[row], isl ? 6 : 1), st.x[row] == null ? '?' : tr(st.x[row], 3)];
        hucre.forEach((t, i) => { const degisti = akt && ((i === 1 && st.deg.includes('e')) || (i === 2 && st.deg.includes('f')) || (i === 4 && st.deg.includes('r')) || (i === 5 && st.deg.includes('x'))); yaz(svg, cx[i] + cw[i] / 2, y + 29, t, { h: 'middle', k: degisti ? 16 : 14, b: degisti || i === 0, r: degisti ? 'var(--tur)' : 'var(--yazi)' }); });
        if (isl) yaz(svg, cx[1] + cw[1] / 2, y + 43, 'çarpan', { h: 'middle', k: 9, r: 'var(--ikincil)' });
      }
      const faz = s === 0 ? 'başlangıç' : s <= 3 ? `İLERİ ELEME · ${s}/3` : `GERİ YERİNE KOYMA · ${s - 3}/4`;
      yaz(svg, 20, 280, faz, { k: 14, b: true, r: s <= 3 ? 'var(--tur)' : 'var(--yesil)' });
      yaz(svg, 620, 280, 'turuncu: işlenen satır · mavi: kullanılan satır', { h: 'end', k: 12, r: 'var(--ikincil)' });
      bilgi(st.yazi);
      bG.disabled = s === 0; bS.disabled = s === D.length - 1;
    };
    const oyn = dongu(bO, (() => { let kz = 0; return (dt) => { kz += dt; if (kz < 1.4) return; kz = 0; if (s >= D.length - 1) return false; s++; ciz(); if (s >= D.length - 1) return false; }; })());
    bS.addEventListener('click', () => { oyn.dur(); if (s < D.length - 1) { s++; ciz(); } });
    bG.addEventListener('click', () => { oyn.dur(); if (s > 0) { s--; ciz(); } });
    bB.addEventListener('click', () => { oyn.dur(); s = 0; ciz(); });
    ciz();
    return { dur: oyn.dur };
  };

  Sekil.m303_jacobi = function (kap) {
    const W = 640, H = 400, svg = svgYap(kap, W, H, 'Jacobi ile Gauss–Seidel arasındaki veri akışı');
    const panel = (y0, ad, gs) => {
      yaz(svg, 20, y0, ad, { k: 15, b: true, r: gs ? 'var(--tur)' : 'var(--acc)' });
      const X = [220, 360, 500], ye = y0 + 14, yy = y0 + 84;
      yaz(svg, 20, ye + 24, 'eski tur (k)', { k: 13, b: true, r: 'var(--ikincil)' }); yaz(svg, 20, yy + 24, 'yeni tur (k+1)', { k: 13, b: true });
      X.forEach((x, i) => { kutu(svg, x - 32, ye, 64, 36, { f: 'var(--yuzey)' }); yaz(svg, x, ye + 24, `x${'₁₂₃'[i]}`, { h: 'middle', k: 15, b: true, r: 'var(--ikincil)' }); kutu(svg, x - 32, yy, 64, 36, { f: 'var(--zemin)', s: 'var(--yazi)' }); yaz(svg, x, yy + 24, `x${'₁₂₃'[i]}`, { h: 'middle', k: 15, b: true }); });
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
        if (i === j) continue;
        if (gs && j < i) {
          const x1 = X[j] + 8, x2 = X[i] - 8, yb = yy + 38, kx = (x1 + x2) / 2, ky = yb + 26 + 10 * (i - j);
          svg.append(el('path', { d: `M${x1},${yb} Q${kx},${ky} ${x2},${yb + 2}`, fill: 'none', stroke: 'var(--tur)', 'stroke-width': 2.5 }));
          ok(svg, x2 - (x2 - kx) * 0.12, yb + 2 + (ky - yb) * 0.12, x2, yb + 2, 'var(--tur)', 2.5);
        } else ok(svg, X[j] + (i > j ? 14 : -14), ye + 38, X[i] + (i > j ? -10 : 10), yy - 2, gs ? 'var(--ikincil)' : 'var(--acc)', 2);
      }
    };
    panel(26, 'Jacobi: yeni değerlerin hepsi ESKİ turdan', false);
    panel(206, 'Gauss–Seidel: önceki bilinmeyenin YENİSİ hemen kullanılır', true);
    yaz(svg, 620, 392, 'turuncu eğri: bu turda az önce hesaplanmış değer', { h: 'end', k: 12, b: true, r: 'var(--tur)' });
  };

  Anim.m303_jacobi = function (kap) {
    const A = [[3, -0.1, -0.2], [0.1, 7, -0.3], [0.3, -0.2, 10]], bb = [7.85, -19.3, 71.4], XG = [3, -2.5, 7];
    const J = [[0, 0, 0]], GS = [[0, 0, 0]];
    for (let t = 1; t <= 3; t++) { const jo = J[t - 1], jn = [0, 1, 2].map((i) => (bb[i] - A[i].reduce((s, a, j) => s + (j !== i ? a * jo[j] : 0), 0)) / A[i][i]); J.push(jn); const gn = GS[t - 1].slice(); for (let i = 0; i < 3; i++) gn[i] = (bb[i] - A[i].reduce((s, a, j) => s + (j !== i ? a * gn[j] : 0), 0)) / A[i][i]; GS.push(gn); }
    const W = 640, H = 360, sv = document.createElement('div'); kap.append(sv);
    const bilgi = satirKutu(kap);
    const k = kontrol(kap); const bO = dugme(k, '▶ Oynat'), bS = dugme(k, 'Sonraki ›', true), bB = dugme(k, 'Baştan', true);
    let s = 0;   // 0..9: hesaplanmış eleman sayısı
    const ciz = () => {
      sv.replaceChildren();
      const svg = svgYap(sv, W, H, 'Jacobi ve Gauss–Seidel yarışı (S25)');
      const tur = Math.ceil(s / 3), i = (s - 1) % 3;
      const tablo = (x0, ad, M, gs) => {
        yaz(svg, x0, 26, ad, { k: 15, b: true, r: gs ? 'var(--tur)' : 'var(--acc)' });
        ['tur', 'x₁', 'x₂', 'x₃'].forEach((t, c) => yaz(svg, x0 + (c ? 40 + c * 82 - 41 : 14), 50, t, { h: 'middle', k: 13, b: true, r: 'var(--ikincil)' }));
        for (let r = 0; r <= 3; r++) {
          yaz(svg, x0 + 14, 82 + r * 34, `${r}`, { h: 'middle', k: 13, b: true });
          for (let c = 0; c < 3; c++) {
            const bilinir = r === 0 || (r - 1) * 3 + c < s, akt = s > 0 && r === tur && c === i;
            const kul = s > 0 && !akt && ((gs && ((r === tur && c < i) || (r === tur - 1 && c > i))) || (!gs && r === tur - 1 && c !== i));
            kutu(svg, x0 + 40 + c * 82, 62 + r * 34, 78, 30, { f: akt ? 'var(--tur-zemin)' : kul ? 'var(--acc-zemin)' : 'var(--zemin)', s: akt ? 'var(--tur)' : kul ? 'var(--acc)' : 'var(--cizgi)', sw: akt || kul ? 2.5 : 1, rx: 5 });
            if (bilinir) yaz(svg, x0 + 79 + c * 82, 82 + r * 34, tr(M[r][c], 6), { h: 'middle', k: 12, b: akt });
          }
        }
      };
      tablo(10, 'Jacobi', J, false); tablo(330, 'Gauss–Seidel', GS, true);
      // hata çubukları
      const d = eksen(svg, { W, H, L: 70, R: 20, T: 220, B: 40, x: [0.5, 3.5], y: [1e-5, 1], ylog: true, xt: [1, 2, 3], yt: [1e-5, 1e-3, 1e-1], xf: (v) => `tur ${v}`, yf: us10 });
      yaz(svg, 70, 212, 'en büyük |x − gerçek| (gerçek: 3; −2,5; 7)', { k: 12, b: true });
      for (let t = 1; t <= Math.floor(s / 3); t++) for (const [M, dx, r] of [[J, -26, 'var(--acc)'], [GS, 4, 'var(--tur)']]) { const e = Math.max(...M[t].map((v, j) => Math.abs(v - XG[j]))), y = d.y(sinir(e, 1e-5, 1)); svg.append(el('rect', { x: d.x(t) + dx, y, width: 22, height: d.y(1e-5) - y, fill: r, opacity: 0.8 })); yaz(svg, d.x(t) + dx + (dx < 0 ? 22 : 0), y - 4, bil(e, 2), { h: dx < 0 ? 'end' : 'start', k: 10, b: true, r, hale: true }); }
      if (s === 0) { bilgi('İkisi de x = (0, 0, 0) ile başlar. Sonraki: x₁.'); return; }
      const satir = (M, gs) => { const kaynak = (j) => (gs && j < i ? M[tur][j] : M[tur - 1][j]); const terim = [0, 1, 2].filter((j) => j !== i).map((j) => { const v = kaynak(j); return `${A[i][j] < 0 ? '+' : '−'} ${tr(Math.abs(A[i][j]), 1)}·${v < 0 ? '(' + tr(v, 6) + ')' : tr(v, 6)}`; }).join(' '); return `x${'₁₂₃'[i]} = (${tr(bb[i], 2)} ${terim})/${A[i][i]} = ${tr(M[tur][i], 6)}`; };
      bilgi(`Tur ${tur} · Jacobi ${satir(J, false)}  |  GS ${satir(GS, true)}`);
    };
    const oyn = dongu(bO, (() => { let kz = 0; return (dt) => { kz += dt; if (kz < 1.1) return; kz = 0; if (s >= 9) return false; s++; ciz(); if (s >= 9) return false; }; })());
    bS.addEventListener('click', () => { oyn.dur(); if (s < 9) { s++; ciz(); } });
    bB.addEventListener('click', () => { oyn.dur(); s = 0; ciz(); });
    ciz();
    return { dur: oyn.dur };
  };
})();
