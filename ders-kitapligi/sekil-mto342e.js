/* MTO342E kitabına özel çizimler ve animasyonlar (K2–K8). Yalnız bu kitabın ajanı düzenler.
   Sekil.m342_<ad>(kap, ayar) → kap'ın içini kurar · Anim.m342_<ad>(kap, ayar) → { dur() } döndürür.
   Sayılar kitabın hesap_dogrula.py sabitleriyle aynı: e₀ = 0,611 kPa, Lᵥ/ℜᵥ = 5423 K, L_d/ℜᵥ = 6139 K, ℜᵥ = 461,5, g = 9,8.
   Renkler yalnız CSS değişkeni (açık/koyu tema), dış görsel yok. */
(function () {
  const Sekil = window.Sekil, Anim = window.Anim;
  if (!Sekil || !Anim) return;
  const NS = 'http://www.w3.org/2000/svg', FONT = 'Inter,sans-serif';
  const el = (ad, o = {}, ic) => { const e = document.createElementNS(NS, ad); for (const [a, v] of Object.entries(o)) if (v != null) e.setAttribute(a, v); if (ic != null) e.textContent = ic; return e; };
  const sy = (v, d = 1) => (Math.abs(v) < 0.5 * 10 ** -d ? 0 : Number(v)).toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const UST = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const ustS = (n) => String(n).replace('-', '⁻').replace(/\d/g, (c) => UST[+c]);
  const bl = (v, d = 2) => { if (!isFinite(v)) return '—'; if (v === 0) return '0'; const u = Math.floor(Math.log10(Math.abs(v)) + 1e-12); const m = v / 10 ** u; return `${sy(m, d)}×10${ustS(u)}`; };
  const HALE = { stroke: 'var(--yuzey)', 'stroke-width': 4, 'paint-order': 'stroke', 'stroke-linejoin': 'round' };
  const e0 = 0.611, T0 = 273.15, LV = 5423, LD = 6139, RV = 461.5, G = 9.8, GD = 9.8;
  const esw = (T) => e0 * Math.exp(LV * (1 / T0 - 1 / T)); // T [K] → kPa
  const esi = (T) => e0 * Math.exp(LD * (1 / T0 - 1 / T));
  let kimlik = 0;

  /* ---------------- ortak yardımcılar ---------------- */
  function yazi(g, x, y, s, a = {}) { const t = el('text', { x, y, fill: 'var(--yazi)', 'font-size': 15, 'font-family': FONT, ...HALE, ...a }, s); g.append(t); return t; }
  function ok(g, x1, y1, x2, y2, renk = 'var(--yazi)', w = 2.5, bas = 11) {
    const a = Math.atan2(y2 - y1, x2 - x1);
    g.append(el('line', { x1, y1, x2: x2 - Math.cos(a) * bas * 0.8, y2: y2 - Math.sin(a) * bas * 0.8, stroke: renk, 'stroke-width': w, 'stroke-linecap': 'round' }));
    const p = [[x2, y2], [x2 - bas * Math.cos(a - 0.45), y2 - bas * Math.sin(a - 0.45)], [x2 - bas * Math.cos(a + 0.45), y2 - bas * Math.sin(a + 0.45)]];
    g.append(el('polygon', { points: p.map((q) => q.map((v) => v.toFixed(1)).join(',')).join(' '), fill: renk }));
  }
  function bulutCiz(g, cx, cy, s = 1, a = {}) {
    const k = el('g', { fill: 'var(--zemin)', stroke: 'var(--ikincil)', 'stroke-width': 1.6, ...a });
    for (const [dx, dy, r] of [[-22, 4, 14], [-6, -8, 18], [14, -2, 15], [26, 6, 11], [2, 8, 14]]) k.append(el('circle', { cx: cx + dx * s, cy: cy + dy * s, r: r * s }));
    k.append(el('rect', { x: cx - 30 * s, y: cy + 4 * s, width: 62 * s, height: 14 * s, rx: 7 * s, stroke: 'none' }));
    g.append(k); return k;
  }
  function okuma(kap, alanlar) {
    const o = document.createElement('div'); o.className = 'okuma'; o.setAttribute('aria-live', 'polite');
    o.innerHTML = alanlar.map((a) => `<span>${a}: <i data-o="${a}">—</i></span>`).join('');
    kap.append(o);
    return (d) => { for (const [a, v] of Object.entries(d)) { const e = o.querySelector(`[data-o="${a}"]`); if (e) e.textContent = v; } };
  }
  function kaydirici(kap, o, cb) {
    const k = document.createElement('div'); k.className = 'kontrol';
    const id = `m342i${++kimlik}`;
    k.innerHTML = `<label for="${id}" class="yok" style="min-width:8.5em">${o.ad}</label><input id="${id}" type="range" min="${o.min}" max="${o.max}" step="${o.adim}" value="${o.deger}"><b style="min-width:5.8em;text-align:right;font-variant-numeric:tabular-nums"></b>`;
    kap.append(k);
    const inp = k.querySelector('input'), out = k.querySelector('b');
    const guncel = (cagir = true) => { out.textContent = o.bicim ? o.bicim(+inp.value) : inp.value; if (cagir) cb(+inp.value); };
    inp.addEventListener('input', () => guncel());
    guncel(false);
    return { inp, ayarla(v) { inp.value = v; guncel(false); } };
  }
  function dugmeler(kap, liste, cb) {
    const k = document.createElement('div'); k.className = 'kontrol';
    for (const [ad, d] of liste) { const b = document.createElement('button'); b.type = 'button'; b.className = 'kucuk'; b.textContent = ad; b.addEventListener('click', () => cb(d, b)); k.append(b); }
    kap.append(k); return k;
  }
  /* zaman çizelgeli animasyon: ▶/⏸ + sürgü; ciz(t) her karede */
  function zamanli(kap, o, ciz) {
    const k = document.createElement('div'); k.className = 'kontrol';
    k.innerHTML = `<button type="button" class="dugme">▶ Oynat</button><input type="range" min="${o.t0}" max="${o.t1}" step="${o.adim || (o.t1 - o.t0) / 400}" value="${o.t0}" aria-label="${o.ad}"><span class="yok">${o.ad}</span>`;
    kap.append(k);
    const btn = k.querySelector('button'), kay = k.querySelector('input');
    let t = o.t0, oyn = null;
    const dur = () => { if (oyn) cancelAnimationFrame(oyn); oyn = null; btn.textContent = '▶ Oynat'; };
    btn.addEventListener('click', () => {
      if (oyn) return dur();
      if (t >= o.t1 - 1e-9) t = o.t0;
      btn.textContent = '⏸ Durdur';
      let son = performance.now();
      const f = (an) => { t = Math.min(o.t1, t + Math.min(0.1, (an - son) / 1000) * o.hiz); son = an; kay.value = t; ciz(t); if (t < o.t1) oyn = requestAnimationFrame(f); else dur(); };
      oyn = requestAnimationFrame(f);
    });
    kay.addEventListener('input', () => { dur(); t = +kay.value; ciz(t); });
    ciz(t);
    return { dur, git(v) { dur(); t = v; kay.value = v; ciz(v); } };
  }
  /* eksenli grafik: o = {x:[a,b], y:[a,b], xlog, ylog, xt:[], yt:[], xf, yf, xe, ye, ad, W, H, L, R, T, B} */
  function grafik(kap, o) {
    const W = o.W || 560, H = o.H || 390, L = o.L || 62, R = o.R || 16, T = o.T || 30, B = o.B || 46;
    const fx = (v) => (o.xlog ? Math.log10(v) : v), fy = (v) => (o.ylog ? Math.log10(v) : v);
    const X0 = fx(o.x[0]), X1 = fx(o.x[1]), Y0 = fy(o.y[0]), Y1 = fy(o.y[1]);
    const x = (v) => L + (fx(v) - X0) / (X1 - X0) * (W - L - R);
    const y = (v) => H - B - (fy(v) - Y0) / (Y1 - Y0) * (H - T - B);
    const ix = (p) => { const t = X0 + (p - L) / (W - L - R) * (X1 - X0); return o.xlog ? 10 ** t : t; };
    const iy = (p) => { const t = Y0 + (H - B - p) / (H - T - B) * (Y1 - Y0); return o.ylog ? 10 ** t : t; };
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': o.ad || 'grafik' });
    const id = `m342k${++kimlik}`;
    const defs = el('defs'), cp = el('clipPath', { id });
    cp.append(el('rect', { x: L, y: T, width: W - L - R, height: H - T - B })); defs.append(cp); svg.append(defs);
    const eks = el('g', { 'font-family': FONT, 'font-size': 14, fill: 'var(--ikincil)' }); svg.append(eks);
    const xf = o.xf || ((v) => sy(v, 0)), yf = o.yf || ((v) => sy(v, 0));
    for (const v of o.xt || []) { eks.append(el('line', { x1: x(v), x2: x(v), y1: T, y2: H - B, stroke: 'var(--cizgi)' })); eks.append(el('text', { x: x(v), y: H - B + 19, 'text-anchor': 'middle' }, xf(v))); }
    for (const v of o.yt || []) { eks.append(el('line', { x1: L, x2: W - R, y1: y(v), y2: y(v), stroke: 'var(--cizgi)' })); eks.append(el('text', { x: L - 7, y: y(v) + 5, 'text-anchor': 'end' }, yf(v))); }
    eks.append(el('rect', { x: L, y: T, width: W - L - R, height: H - T - B, fill: 'none', stroke: 'var(--ikincil)', 'stroke-opacity': 0.45 }));
    if (o.xe) eks.append(el('text', { x: W - R, y: H - 6, 'text-anchor': 'end', fill: 'var(--yazi)', 'font-weight': 600, 'font-size': 15 }, o.xe));
    if (o.ye) eks.append(el('text', { x: 6, y: T - 11, fill: 'var(--yazi)', 'font-weight': 600, 'font-size': 15 }, o.ye));
    const ic = el('g', { 'clip-path': `url(#${id})` }); svg.append(ic);
    const ust = el('g'); svg.append(ust);
    kap.append(svg);
    const yol = (pts) => pts.filter((p) => isFinite(p[0]) && isFinite(p[1])).map((p, i) => `${i ? 'L' : 'M'}${x(p[0]).toFixed(1)},${y(p[1]).toFixed(1)}`).join('');
    const ornek = (f, a, b, n = 200, log = false) => { const r = []; for (let i = 0; i <= n; i++) { const v = log ? 10 ** (Math.log10(a) + (Math.log10(b) - Math.log10(a)) * i / n) : a + (b - a) * i / n; r.push([v, f(v)]); } return r; };
    return {
      svg, ic, ust, x, y, ix, iy, W, H, L, R, T, B, yol, ornek,
      cizgi(pts, a = {}) { const p = el('path', { d: yol(pts), fill: 'none', stroke: 'var(--acc)', 'stroke-width': 2.6, 'stroke-linejoin': 'round', ...a }); ic.append(p); return p; },
      alan(pts, a = {}) { const p = el('path', { d: yol(pts) + 'Z', stroke: 'none', ...a }); ic.prepend(p); return p; },
      yazi(px, py, s, a = {}) { return yazi(ust, px, py, s, a); },
      nokta(px, py, a = {}) { const c = el('circle', { cx: px, cy: py, r: 5.5, fill: 'var(--yazi)', stroke: 'var(--yuzey)', 'stroke-width': 2, ...a }); ust.append(c); return c; },
      imlec(fn) {
        const im = el('line', { stroke: 'var(--ikincil)', 'stroke-dasharray': '3 3', visibility: 'hidden' }); ust.prepend(im);
        const f = (ev) => {
          const r = svg.getBoundingClientRect();
          const px = (ev.clientX - r.left) / r.width * W, py = (ev.clientY - r.top) / r.height * H;
          if (px < L || px > W - R || py < T || py > H - B) return;
          im.setAttribute('x1', px); im.setAttribute('x2', px); im.setAttribute('y1', T); im.setAttribute('y2', H - B); im.setAttribute('visibility', 'visible');
          fn(ix(px), iy(py), px, py);
        };
        svg.addEventListener('pointermove', f); svg.addEventListener('pointerdown', f);
      },
      lejant(px, py, satirlar) { // [[renk, kesik, metin]]
        satirlar.forEach(([renk, kesik, m], i) => {
          ust.append(el('line', { x1: px, x2: px + 26, y1: py + i * 21 - 5, y2: py + i * 21 - 5, stroke: renk, 'stroke-width': 3, 'stroke-dasharray': kesik || null }));
          yazi(ust, px + 32, py + i * 21, m, { 'font-size': 14 });
        });
      },
    };
  }
  const sahneKur = (kap) => { const s = document.createElement('div'); kap.append(s); return s; };

  /* ======================= K2 · Kaldırma kuvveti ve kararlılık ======================= */
  Sekil.m342_kaldirma = function (kap, ayar = {}) {
    const s = { Tp: ayar.Tp ?? 20, Te: ayar.Te ?? 15, nem: !!ayar.nem };
    const sahne = sahneKur(kap);
    function ciz() {
      sahne.innerHTML = '';
      const W = 560, H = 300;
      const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Çevre içinde parsel ve kaldırma ivmesi' });
      const rp = s.nem ? 0.015 : 0, re = s.nem ? 0.008 : 0;
      const Tvp = (s.Tp + 273.15) * (1 + 0.61 * rp), Tve = (s.Te + 273.15) * (1 + 0.61 * re);
      const B = G * (Tvp - Tve) / Tve;
      svg.append(el('rect', { x: 14, y: 14, width: 246, height: 272, rx: 14, fill: 'var(--acc-zemin)', stroke: 'var(--cizgi)' }));
      yazi(svg, 28, 40, `çevre: ${sy(s.Te)} °C${s.nem ? ', r = 8 g/kg' : ''}`, { fill: 'var(--acc)', 'font-weight': 600, stroke: 'var(--acc-zemin)' });
      const sicak = B > 0.0005, soguk = B < -0.0005;
      const cx = 137, cy = 178, r = 42;
      svg.append(el('circle', { cx, cy, r, fill: sicak ? 'var(--tur-zemin)' : 'var(--zemin)', stroke: sicak ? 'var(--tur)' : 'var(--acc)', 'stroke-width': 3 }));
      yazi(svg, cx, cy - 4, 'parsel', { 'text-anchor': 'middle', 'font-size': 14, stroke: 'none' });
      yazi(svg, cx, cy + 15, `${sy(s.Tp)} °C`, { 'text-anchor': 'middle', 'font-weight': 700, stroke: 'none' });
      if (sicak || soguk) {
        const Lk = Math.min(95, 18 + Math.abs(B) / 0.4 * 80), yon = sicak ? -1 : 1;
        ok(svg, cx, cy + yon * (r + 4), cx, cy + yon * (r + 4 + Lk), sicak ? 'var(--tur)' : 'var(--acc)', 4, 14);
      } else yazi(svg, cx, cy + r + 26, 'denge: ivme yok', { 'text-anchor': 'middle', fill: 'var(--ikincil)', stroke: 'var(--acc-zemin)' });
      const sat = [
        [`Tᵥ,p = ${sy(Tvp, 2)} K`, {}], [`Tᵥ,e = ${sy(Tve, 2)} K`, {}],
        ['F/m = g (Tᵥ,p − Tᵥ,e) / Tᵥ,e', { fill: 'var(--ikincil)', 'font-size': 14 }],
        [`= ${sy(B, 3)} m s⁻²`, { 'font-weight': 700, fill: sicak ? 'var(--tur)' : 'var(--acc)', 'font-size': 20 }],
        [sicak ? '↑ yukarı ivmelenir (hafif)' : soguk ? '↓ aşağı ivmelenir (ağır)' : '— nötr', { 'font-weight': 600 }],
      ];
      sat.forEach(([m, a], i) => yazi(svg, 282, 50 + i * 34, m, a));
      if (Math.abs(s.Te) > 0.4) yazi(svg, 282, 50 + 5 * 34 + 8, `yanlış: paydaya °C → ${sy(G * (Tvp - Tve) / s.Te, 2)}`, { fill: 'var(--ikincil)', 'font-size': 14 });
      sahne.append(svg);
    }
    const k1 = kaydirici(kap, { ad: 'Parsel T', min: -10, max: 40, adim: 0.5, deger: s.Tp, bicim: (v) => `${sy(v)} °C` }, (v) => { s.Tp = v; ciz(); });
    const k2 = kaydirici(kap, { ad: 'Çevre T', min: -10, max: 40, adim: 0.5, deger: s.Te, bicim: (v) => `${sy(v)} °C` }, (v) => { s.Te = v; ciz(); });
    dugmeler(kap, [['S5-a (kuru)', [20, 15, false]], ['S5-b (nemli)', [20, 15, true]], ['soğuk parsel', [10, 15, false]]], ([a, b, n]) => { s.Tp = a; s.Te = b; s.nem = n; k1.ayarla(a); k2.ayarla(b); ciz(); });
    ciz();
  };

  const kararSinif = (g) => {
    if (g < -0.05) return 'terselme: çok kararlı';
    if (g < 5.95) return 'mutlak kararlı';
    if (g <= 6.05) return 'kuru: kararlı · doymuş: nötr';
    if (g < 9.75) return 'koşullu kararsız';
    if (g <= 9.85) return 'kuru: nötr · doymuş: kararsız';
    return 'mutlak kararsız (süperadyabatik)';
  };
  Sekil.m342_kararlilik = function (kap, ayar = {}) {
    let Gm = ayar.gamma ?? 7;
    const sahne = sahneKur(kap);
    const yaz = okuma(kap, ['Γ', 'sınıf', 'N² (kuru)', 'kuru parsel']);
    function ciz() {
      sahne.innerHTML = '';
      const d = grafik(sahne, { x: [-25, 35], y: [0, 3], xt: [-20, -10, 0, 10, 20, 30], yt: [0, 1, 2, 3], xe: 'T (°C)', ye: 'z (km)', ad: 'Çevre azalma oranının kuru ve nemli adyabatla kıyası' });
      d.cizgi([[20, 0], [20 - GD * 3, 3]], { stroke: 'var(--tur)', 'stroke-dasharray': '9 6' });
      d.cizgi([[20, 0], [20 - 6 * 3, 3]], { stroke: 'var(--acc)', 'stroke-dasharray': '4 5' });
      d.cizgi([[20, 0], [20 - Gm * 3, 3]], { stroke: 'var(--yazi)', 'stroke-width': 4 });
      d.nokta(d.x(20), d.y(0));
      d.lejant(d.x(-23), d.y(0.72), [['var(--tur)', '9 6', 'kuru adyabat Γd = 9,8'], ['var(--acc)', '4 5', 'nemli adyabat Γs ≈ 6'], ['var(--yazi)', null, `çevre Γ = ${sy(Gm)} K/km`]]);
      d.yazi(d.W - d.R - 8, d.T + 22, kararSinif(Gm), { 'text-anchor': 'end', 'font-weight': 700, fill: Gm > 9.8 ? 'var(--tur)' : 'var(--acc)', 'font-size': 16 });
      const N2 = G / 285 * (GD - Gm) / 1000;
      yaz({ 'Γ': `${sy(Gm)} K/km`, 'sınıf': kararSinif(Gm), 'N² (kuru)': `${bl(N2)} s⁻²`, 'kuru parsel': N2 > 1e-7 ? `salınır, periyot ≈ ${sy(2 * Math.PI / Math.sqrt(N2) / 60)} dk` : N2 < -1e-7 ? 'üstel uzaklaşır' : 'yerinde kalır' });
    }
    kaydirici(kap, { ad: 'Çevre Γ', min: -4, max: 14, adim: 0.1, deger: Gm, bicim: (v) => `${sy(v)} K/km` }, (v) => { Gm = v; ciz(); });
    ciz();
  };

  Anim.m342_salinim = function (kap, ayar = {}) {
    let Gm = ayar.gamma ?? 6.5;
    const W = 560, H = 330, z0 = 200, Tm = 285, tMax = 1200;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Yukarı itilen parselin salınımı ya da uzaklaşması' });
    kap.append(svg);
    const yaz = okuma(kap, ['Γ', 'N²', 't', 'z′']);
    const zy = (z) => 165 - z / 700 * 140, tx = (t) => 200 + t / tMax * 340;
    svg.append(el('rect', { x: 20, y: 20, width: 150, height: 290, rx: 12, fill: 'var(--acc-zemin)', stroke: 'var(--cizgi)' }));
    for (const z of [-600, -300, 0, 300, 600]) {
      svg.append(el('line', { x1: 20, x2: 170, y1: zy(z), y2: zy(z), stroke: 'var(--cizgi)' }));
      svg.append(el('line', { x1: 200, x2: 540, y1: zy(z), y2: zy(z), stroke: 'var(--cizgi)', 'stroke-dasharray': z ? '3 4' : null }));
      yazi(svg, 196, zy(z) + 5, `${z > 0 ? '+' : ''}${z}`, { 'text-anchor': 'end', 'font-size': 13, fill: 'var(--ikincil)' });
    }
    yazi(svg, 30, 42, 'denge seviyesi', { 'font-size': 13, fill: 'var(--ikincil)', stroke: 'var(--acc-zemin)' });
    for (const t of [0, 5, 10, 15, 20]) yazi(svg, tx(t * 60), 326, `${t}`, { 'text-anchor': 'middle', 'font-size': 13, fill: 'var(--ikincil)' });
    yazi(svg, 540, 306, 't (dk)', { 'text-anchor': 'end', 'font-size': 14, 'font-weight': 600 });
    yazi(svg, 205, 16, 'z′ (m): dengeden sapma', { 'font-size': 14, 'font-weight': 600 });
    const tum = el('path', { fill: 'none', stroke: 'var(--ikincil)', 'stroke-width': 1.5, 'stroke-dasharray': '4 4', opacity: 0.7 });
    const iz = el('path', { fill: 'none', stroke: 'var(--tur)', 'stroke-width': 3.2 });
    const p = el('circle', { cx: 95, r: 16, fill: 'var(--tur-zemin)', stroke: 'var(--tur)', 'stroke-width': 3 });
    const durum = yazi(svg, 95, 300, '', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 600, stroke: 'var(--acc-zemin)' });
    svg.append(tum, iz, p);
    const N2f = () => G / Tm * (GD - Gm) / 1000;
    const zf = (t) => { const N2 = N2f(); if (N2 > 1e-9) return z0 * Math.cos(Math.sqrt(N2) * t); if (N2 < -1e-9) return z0 * Math.cosh(Math.sqrt(-N2) * t); return z0; };
    const yolf = (t1) => { let s = ''; for (let t = 0; t <= t1 + 1e-6; t += 6) { const z = Math.max(-700, Math.min(700, zf(t))); s += `${t ? 'L' : 'M'}${tx(t).toFixed(1)},${zy(z).toFixed(1)}`; if (Math.abs(zf(t)) > 700) break; } return s; };
    let simdi = 0;
    function ciz(t) {
      simdi = t;
      const z = zf(t), zc = Math.max(-700, Math.min(700, z)), N2 = N2f();
      p.setAttribute('cy', zy(zc)); tum.setAttribute('d', yolf(tMax)); iz.setAttribute('d', yolf(t));
      durum.textContent = N2 > 1e-9 ? 'geri döner, salınır' : N2 < -1e-9 ? (Math.abs(z) > 700 ? 'uzaklaştı!' : 'uzaklaşıyor') : 'yerinde kalır';
      yaz({ 'Γ': `${sy(Gm)} K/km`, 'N²': `${bl(N2)} s⁻²`, t: `${sy(t / 60)} dk`, 'z′': Math.abs(z) > 700 ? '> 700 m' : `${sy(z, 0)} m` });
    }
    kaydirici(kap, { ad: 'Çevre Γ', min: -3, max: 13, adim: 0.1, deger: Gm, bicim: (v) => `${sy(v)} K/km` }, (v) => { Gm = v; ciz(simdi); });
    const z = zamanli(kap, { t0: 0, t1: tMax, hiz: 110, ad: 'zaman' }, ciz);
    return { dur: z.dur };
  };

  Sekil.m342_sondaj = function (kap) {
    const zk = [0, 1, 2, 3, 4], Tk = [24, 14, 7, 9, 3];
    let Ts = 24;
    const sahne = sahneKur(kap);
    const yaz = okuma(kap, ['katman', 'Γ', 'sınıf', 'termik tepesi']);
    const Tc = (z) => { const i = Math.min(3, Math.floor(z)); return Tk[i] + (Tk[i + 1] - Tk[i]) * (z - zk[i]); };
    function termik() { for (let z = 0; z <= 4; z += 0.001) if (Ts - GD * z < Tc(z)) return z; return null; }
    function ciz() {
      sahne.innerHTML = '';
      const d = grafik(sahne, { x: [-12, 36], y: [0, 4], xt: [-10, 0, 10, 20, 30], yt: [0, 1, 2, 3, 4], xe: 'T (°C)', ye: 'z (km)', ad: 'S7 sondajı: katmanlar ve sınıfları' });
      const renk = ['var(--tur)', 'var(--acc)', 'var(--yazi)', 'var(--ikincil)'], kesik = [null, null, null, '6 4'];
      const ad = ['mutlak kararsız', 'koşullu kararsız', 'terselme', 'Γ = Γs'];
      for (let i = 0; i < 4; i++) {
        d.cizgi([[Tk[i], zk[i]], [Tk[i + 1], zk[i + 1]]], { stroke: renk[i], 'stroke-width': i === 2 ? 6 : 4, 'stroke-dasharray': kesik[i] });
        const G_ = -(Tk[i + 1] - Tk[i]);
        d.yazi(d.x(Math.max(Tk[i], Tk[i + 1])) + 12, d.y(zk[i] + 0.5) + 5, `Γ = ${G_} · ${ad[i]}`, { 'font-size': 14, fill: renk[i], 'font-weight': 600 });
      }
      zk.forEach((z, i) => d.nokta(d.x(Tk[i]), d.y(z)));
      const zt = termik();
      d.cizgi([[Ts, 0], [Ts - GD * 4, 4]], { stroke: 'var(--tur)', 'stroke-dasharray': '3 5', 'stroke-width': 2 });
      if (zt) { d.cizgi([[-12, zt], [36, zt]], { stroke: 'var(--ikincil)', 'stroke-dasharray': '2 4', 'stroke-width': 1.5 }); d.yazi(d.x(-11), d.y(zt) - 7, `termik tepesi ≈ ${sy(zt, 2)} km`, { 'font-size': 14, 'font-weight': 600 }); }
      d.yazi(d.x(Ts) + 6, d.y(0) - 8, `öğle yüzeyi ${sy(Ts)} °C`, { 'font-size': 13, fill: 'var(--tur)' });
      d.imlec((T, z) => { const i = Math.max(0, Math.min(3, Math.floor(z))); const G_ = -(Tk[i + 1] - Tk[i]); yaz({ katman: `${i}–${i + 1} km`, 'Γ': `${G_} K/km`, 'sınıf': kararSinif(G_), 'termik tepesi': zt ? `${sy(zt, 2)} km` : '—' }); });
      yaz({ katman: 'grafikte gezdir', 'Γ': '—', 'sınıf': '—', 'termik tepesi': zt ? `${sy(zt, 2)} km` : '—' });
    }
    kaydirici(kap, { ad: 'Yüzey ısınması', min: 24, max: 30, adim: 0.5, deger: Ts, bicim: (v) => `${sy(v)} °C` }, (v) => { Ts = v; ciz(); });
    ciz();
  };

  /* LCL–LFC–CAPE ortak hesap (S8 düzeni: Γs sabit 6 K/km, çiğ noktası 1,8 K/km azalır) */
  function lfcHesap(T, Td, Gm, Gs = 6) {
    const zL = 0.125 * (T - Td);
    const Tp = (z) => (z <= zL ? T - GD * z : T - GD * zL - Gs * (z - zL));
    const Te = (z) => T - Gm * z;
    let zF = null;
    if (Gm > Gs) zF = zL + Math.max(0, (Te(zL) - Tp(zL)) / (Gm - Gs));
    if (zF != null && zF > 5) zF = null;
    let cin = 0, cape = 0; const dz = 0.002;
    for (let z = dz / 2; z < 5; z += dz) { const b = G * (Tp(z) - Te(z)) / (Te(z) + 273.15) * dz * 1000; if (zF != null && z >= zF) cape += Math.max(0, b); else cin += Math.min(0, b); }
    return { zL, Tp, Te, zF, cin, cape, Td };
  }
  function lfcCiz(kap, s, katman = 9) {
    const h = lfcHesap(s.T, s.Td, s.Gm);
    const d = grafik(kap, { x: [-20, 36], y: [0, 5], xt: [-20, -10, 0, 10, 20, 30], yt: [0, 1, 2, 3, 4, 5], xe: 'T (°C)', ye: 'z (km)', ad: 'Parsel yöntemi: LCL, LFC, CIN ve CAPE' });
    const zs = []; for (let z = 0; z <= 5.0001; z += 0.02) zs.push(z);
    if (katman >= 3) {
      if (h.zF != null) {
        d.alan([...zs.filter((z) => z <= h.zF).map((z) => [h.Tp(z), z]), ...zs.filter((z) => z <= h.zF).reverse().map((z) => [h.Te(z), z])], { fill: 'var(--acc)', opacity: 0.22 });
        d.alan([...zs.filter((z) => z >= h.zF).map((z) => [h.Tp(z), z]), ...zs.filter((z) => z >= h.zF).reverse().map((z) => [h.Te(z), z])], { fill: 'var(--tur)', opacity: 0.25 });
      } else d.alan([...zs.map((z) => [h.Tp(z), z]), ...[...zs].reverse().map((z) => [h.Te(z), z])], { fill: 'var(--acc)', opacity: 0.22 });
    }
    if (katman >= 2) d.cizgi(zs.map((z) => [h.Te(z), z]), { stroke: 'var(--yazi)', 'stroke-width': 3 });
    if (katman >= 1) {
      d.cizgi(zs.filter((z) => z <= h.zL).map((z) => [h.Td - 1.8 * z, z]), { stroke: 'var(--acc)', 'stroke-dasharray': '6 5', 'stroke-width': 2.4 });
      d.cizgi(zs.filter((z) => z <= h.zL + 1e-9).concat([h.zL]).map((z) => [h.Tp(z), z]), { stroke: 'var(--tur)', 'stroke-width': 3.4 });
    }
    if (katman >= 2) d.cizgi(zs.filter((z) => z >= h.zL).map((z) => [h.Tp(z), z]), { stroke: 'var(--tur)', 'stroke-width': 3.4, 'stroke-dasharray': '10 4' });
    d.nokta(d.x(s.T), d.y(0), { fill: 'var(--tur)' }); d.nokta(d.x(s.Td), d.y(0), { fill: 'var(--acc)' });
    if (katman === 0) { d.yazi(d.x(s.T) + 8, d.y(0) - 10, `T = ${sy(s.T)} °C`, { fill: 'var(--tur)', 'font-weight': 600 }); d.yazi(d.x(s.Td) - 8, d.y(0) - 10, `T_d = ${sy(s.Td)} °C`, { 'text-anchor': 'end', fill: 'var(--acc)', 'font-weight': 600 }); }
    if (katman >= 1) {
      d.cizgi([[-20, h.zL], [36, h.zL]], { stroke: 'var(--ikincil)', 'stroke-dasharray': '2 4', 'stroke-width': 1.5 });
      d.nokta(d.x(h.Tp(h.zL)), d.y(h.zL), { fill: 'var(--tur)' });
      d.yazi(d.x(-19), d.y(h.zL) - 7, `LCL ${sy(h.zL, 2)} km · ${sy(h.Tp(h.zL), 2)} °C`, { 'font-size': 14, 'font-weight': 600 });
    }
    if (katman >= 3 && h.zF != null) {
      d.cizgi([[-20, h.zF], [36, h.zF]], { stroke: 'var(--ikincil)', 'stroke-dasharray': '2 4', 'stroke-width': 1.5 });
      d.nokta(d.x(h.Tp(h.zF)), d.y(h.zF), { fill: 'var(--yazi)' });
      d.yazi(d.W - d.R - 6, d.y(h.zF) - 7, `LFC ${sy(h.zF, 2)} km · ${sy(h.Tp(h.zF), 1)} °C`, { 'font-size': 14, 'font-weight': 600, 'text-anchor': 'end' });
    }
    const lj = [['var(--tur)', null, 'parsel (9,8 → 6 K/km)']];
    if (katman >= 1) lj.push(['var(--acc)', '6 5', 'çiğ noktası (1,8 K/km)']);
    if (katman >= 2) lj.push(['var(--yazi)', null, `çevre (Γ = ${sy(s.Gm)} K/km)`]);
    d.lejant(d.x(13.5), d.y(4.75), lj);
    if (katman >= 3) { d.ust.append(el('rect', { x: d.x(13.5), y: d.y(4.75) + 21 * lj.length - 14, width: 26, height: 12, fill: 'var(--tur)', opacity: 0.35 })); d.yazi(d.x(13.5) + 32, d.y(4.75) + 21 * lj.length, 'CAPE · mavi alan CIN', { 'font-size': 14 }); }
    return { d, h };
  }
  Sekil.m342_lfc = function (kap, ayar = {}) {
    const s = { T: 30, Td: 20, Gm: 8, ...ayar };
    const sahne = sahneKur(kap);
    const yaz = okuma(kap, ['z_LCL', 'z_LFC', 'CIN', 'CAPE (0–5 km)', 'z']);
    function ciz() {
      sahne.innerHTML = '';
      const { d, h } = lfcCiz(sahne, s);
      const ozet = { z_LCL: `${sy(h.zL, 2)} km`, z_LFC: h.zF != null ? `${sy(h.zF, 2)} km` : 'yok (parsel hep soğuk)', CIN: `${sy(h.cin, 0)} J/kg`, 'CAPE (0–5 km)': `${sy(h.cape, 0)} J/kg` };
      yaz({ ...ozet, z: 'grafikte gezdir' });
      d.imlec((T, z) => yaz({ ...ozet, z: `${sy(z, 2)} km: parsel ${sy(h.Tp(z))} °C, çevre ${sy(h.Te(z))} °C` }));
    }
    kaydirici(kap, { ad: 'Yüzey T', min: 15, max: 36, adim: 0.5, deger: s.T, bicim: (v) => `${sy(v)} °C` }, (v) => { s.T = v; if (s.Td > v) s.Td = v; ciz(); });
    kaydirici(kap, { ad: 'Çiğ noktası T_d', min: 0, max: 30, adim: 0.5, deger: s.Td, bicim: (v) => `${sy(v)} °C` }, (v) => { s.Td = Math.min(v, s.T); ciz(); });
    kaydirici(kap, { ad: 'Çevre Γ', min: 4, max: 9.8, adim: 0.1, deger: s.Gm, bicim: (v) => `${sy(v)} K/km` }, (v) => { s.Gm = v; ciz(); });
    ciz();
  };
  Sekil.m342_lclkatman = function (kap, ayar = {}) { lfcCiz(kap, { T: 30, Td: 20, Gm: 8 }, ayar.adim ?? 0); };
  Anim.m342_lfc = function (kap) {
    const s = { T: 30, Td: 20, Gm: 8 };
    const { d, h } = lfcCiz(kap, s);
    const p = el('circle', { r: 10, fill: 'var(--tur)', stroke: 'var(--yuzey)', 'stroke-width': 3 }); d.ust.append(p);
    const yaz = okuma(kap, ['z', 'parsel', 'çevre', 'B', 'durum']);
    const B = (z) => G * (h.Tp(z) - h.Te(z)) / (h.Te(z) + 273.15);
    const z = zamanli(kap, { t0: 0, t1: 5, hiz: 0.45, ad: 'yükseklik (km)' }, (zz) => {
      p.setAttribute('cx', d.x(h.Tp(zz))); p.setAttribute('cy', d.y(zz));
      let durum;
      if (h.zF == null || zz < h.zF) durum = zz < h.zL ? 'zorla kaldırılıyor (kuru, B < 0)' : 'doydu, hâlâ zorlanıyor (B < 0)';
      else { let e = 0; for (let q = h.zF; q < zz; q += 0.002) e += B(q + 0.001) * 2; durum = `serbest: w = √(2∫B dz) ≈ ${sy(Math.sqrt(2 * Math.max(0, e)))} m/s`; }
      yaz({ z: `${sy(zz, 2)} km`, parsel: `${sy(h.Tp(zz))} °C`, 'çevre': `${sy(h.Te(zz))} °C`, B: `${sy(B(zz), 3)} m s⁻²`, durum });
    });
    return { dur: z.dur };
  };

  Sekil.m342_adyabatlar = function (kap) {
    const Rd = 287, cp = 1004, Lv = 2.5e6, eps = 0.622;
    const Gs = (T, P) => { const es = esw(T), rs = eps * es / (P - es); return 1000 * G * (1 + Lv * rs / (Rd * T)) / (cp + Lv * Lv * rs * eps / (Rd * T * T)); };
    const dTdP = (T, P) => { const es = esw(T), rs = eps * es / (P - es); return (Rd * T + Lv * rs) / (P * (cp + Lv * Lv * rs * eps / (Rd * T * T))); };
    const d = grafik(kap, { x: [-45, 40], y: [100, 30], ylog: true, xt: [-40, -30, -20, -10, 0, 10, 20, 30, 40], yt: [100, 90, 80, 70, 60, 50, 40, 30], xe: 'T (°C)', ye: 'P (kPa)', ad: 'Kuru ve nemli adyabatlar' });
    for (let th = 260; th <= 380; th += 20) {
      const pts = []; for (let P = 100; P >= 30; P -= 0.5) pts.push([th * (P / 100) ** 0.28571 - 273.15, P]);
      d.cizgi(pts, { stroke: 'var(--tur)', 'stroke-dasharray': '7 5', 'stroke-width': 1.6, opacity: 0.8 });
      const tu = th * 0.3 ** 0.28571 - 273.15; if (tu > -44 && tu < 36) d.yazi(d.x(tu) + 3, d.y(30) + 15, `${th}`, { 'font-size': 12, fill: 'var(--tur)' });
    }
    for (const T0c of [-10, 0, 10, 20, 30]) {
      let T = T0c + 273.15; const pts = [[T0c, 100]];
      for (let P = 100; P > 30; P -= 0.25) { const k1 = dTdP(T, P), k2 = dTdP(T - 0.125 * k1, P - 0.125); T -= 0.25 * k2; pts.push([T - 273.15, P - 0.25]); }
      d.cizgi(pts, { stroke: 'var(--acc)', 'stroke-width': 2.6 });
      d.yazi(d.x(T0c) + 4, d.y(100) - 8, `${T0c}`, { 'font-size': 13, fill: 'var(--acc)', 'font-weight': 600 });
    }
    d.lejant(d.x(-43), d.y(96) - 6, [['var(--tur)', '7 5', 'kuru adyabat (üstte θ, K)'], ['var(--acc)', null, 'nemli adyabat (altta 100 kPa T, °C)']]);
    const yaz = okuma(kap, ['T', 'P', 'Γs', 'Γd']);
    d.imlec((Tc, P) => yaz({ T: `${sy(Tc)} °C`, P: `${sy(P)} kPa`, 'Γs': `${sy(Gs(Tc + 273.15, P))} K/km`, 'Γd': '9,8 K/km' }));
    yaz({ T: 'diyagramda gezdir', P: '—', 'Γs': '—', 'Γd': '9,8 K/km' });
  };

  /* ======================= K3 · Bulutlar ======================= */
  Sekil.m342_mekanizma = function (kap, ayar = {}) {
    const adim = ayar.adim || 0, W = 560, H = 320;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Kaldırma mekanizması çizimi' });
    const zemin = (yol) => svg.append(el('path', { d: yol, fill: 'var(--cizgi)', stroke: 'var(--ikincil)', 'stroke-width': 1.5 }));
    const baslik = ['1 · Orografik kaldırma', '2 · Cephesel kaldırma', '3 · Yakınsama', '4 · Konvektif kaldırma (termik)'][adim];
    if (adim === 0) {
      zemin('M0,290 L170,290 L300,120 L430,290 L560,290 L560,320 L0,320Z');
      ok(svg, 40, 270, 150, 270, 'var(--acc)', 3); ok(svg, 170, 262, 262, 150, 'var(--acc)', 3); ok(svg, 335, 150, 420, 255, 'var(--tur)', 3);
      bulutCiz(svg, 215, 150, 1.25); bulutCiz(svg, 262, 118, 1.05);
      for (let i = 0; i < 6; i++) svg.append(el('line', { x1: 196 + i * 12, y1: 176, x2: 190 + i * 12, y2: 214, stroke: 'var(--acc)', 'stroke-width': 1.6 }));
      yazi(svg, 24, 238, 'rüzgârüstü: yükselir, soğur', { 'font-size': 14, 'font-weight': 600 });
      yazi(svg, 24, 258, '→ bulut + yağış', { 'font-size': 14 });
      yazi(svg, 360, 204, 'rüzgâraltı: iner,', { 'font-size': 14, 'font-weight': 600, fill: 'var(--tur)' });
      yazi(svg, 360, 224, 'ısınır, kurur (föhn)', { 'font-size': 14, fill: 'var(--tur)' });
    } else if (adim === 1) {
      zemin('M0,290 L560,290 L560,320 L0,320Z');
      svg.append(el('path', { d: 'M0,290 L0,170 Q260,200 470,290Z', fill: 'var(--acc-zemin)', stroke: 'var(--acc)', 'stroke-width': 2 }));
      yazi(svg, 20, 262, 'soğuk hava (yoğun)', { fill: 'var(--acc)', 'font-weight': 600, stroke: 'var(--acc-zemin)' });
      ok(svg, 520, 275, 400, 250, 'var(--tur)', 3); ok(svg, 380, 238, 220, 165, 'var(--tur)', 3); ok(svg, 200, 152, 90, 112, 'var(--tur)', 3);
      yazi(svg, 330, 210, 'sıcak hava üstüne kayar', { fill: 'var(--tur)', 'font-weight': 600 });
      bulutCiz(svg, 150, 108, 1.1); bulutCiz(svg, 260, 160, 0.9); bulutCiz(svg, 70, 84, 1.0);
    } else if (adim === 2) {
      zemin('M0,290 L560,290 L560,320 L0,320Z');
      ok(svg, 40, 270, 230, 270, 'var(--acc)', 3); ok(svg, 520, 270, 330, 270, 'var(--acc)', 3);
      ok(svg, 280, 262, 280, 130, 'var(--tur)', 4, 15);
      bulutCiz(svg, 280, 100, 1.5);
      yazi(svg, 40, 252, 'yer yakınında hava', { 'font-size': 14 }); yazi(svg, 520, 252, 'bir bölgeye toplanır', { 'font-size': 14, 'text-anchor': 'end' });
      yazi(svg, 298, 210, 'gidecek yer yok → yükselir', { 'font-size': 14, fill: 'var(--tur)', 'font-weight': 600 });
    } else {
      zemin('M0,290 L560,290 L560,320 L0,320Z');
      svg.append(el('rect', { x: 210, y: 283, width: 140, height: 9, fill: 'var(--tur)', opacity: 0.7 }));
      svg.append(el('circle', { cx: 500, cy: 52, r: 22, fill: 'var(--tur)', opacity: 0.85 }));
      for (const [cx, cy, r] of [[280, 250, 16], [280, 205, 20], [280, 160, 24]]) svg.append(el('circle', { cx, cy, r, fill: 'var(--tur-zemin)', stroke: 'var(--tur)', 'stroke-width': 2, 'stroke-dasharray': '4 3' }));
      bulutCiz(svg, 280, 104, 1.5);
      svg.append(el('line', { x1: 60, x2: 520, y1: 128, y2: 128, stroke: 'var(--ikincil)', 'stroke-dasharray': '3 5' }));
      yazi(svg, 70, 122, 'LCL = bulut tabanı', { 'font-size': 14, fill: 'var(--ikincil)' });
      yazi(svg, 362, 275, 'güneşle ısınan yüzey', { 'font-size': 14, fill: 'var(--tur)', 'font-weight': 600 });
      yazi(svg, 312, 205, 'termik kabarcık yükselir', { 'font-size': 14 });
    }
    yazi(svg, 20, 32, baslik, { 'font-size': 18, 'font-weight': 700 });
    kap.append(svg);
  };

  const BULUTLAR = [
    // [kısa, ad, seviye, içerik, ipucu, x, y, tür]
    ['Ci', 'cirrus', 'yüksek', 'buz', 'ince lifler, saç gibi', 70, 10.8, 'lif'],
    ['Cs', 'cirrostratus', 'yüksek', 'buz', 'ince örtü, hale var, gölge düşer', 210, 9.6, 'ort'],
    ['Cc', 'cirrocumulus', 'yüksek', 'buz', 'küçük pullar (uskumru gök)', 350, 8.3, 'pul'],
    ['As', 'altostratus', 'orta', 'çoğu su', 'gri örtü, hale yok, gölge yok', 90, 4.6, 'ort'],
    ['Ac', 'altocumulus', 'orta', 'çoğu su', 'kabarık yığınlar, sıralar', 270, 3.6, 'pul'],
    ['Ns', 'nimbostratus', 'alçak (kalın)', 'su', 'koyu gri, sürekli yağış', 80, 1.4, 'kalin'],
    ['Sc', 'stratocumulus', 'alçak', 'su', 'topak topak katman', 250, 1.5, 'pul'],
    ['St', 'stratus', 'alçak', 'su', 'düz gri katman, çisenti', 345, 0.45, 'ort'],
    ['Cu', 'cumulus', 'dikey (taban alçak)', 'su', 'kabarık; tabanı LCL', 420, 1.6, 'cu'],
    ['Cb', 'cumulonimbus', 'dikey: tepe tropopozda', 'aşağı su, örs buz', 'örs, sağanak, dolu, şimşek', 500, 1.0, 'cb'],
  ];
  Sekil.m342_bulutkat = function (kap) {
    const W = 560, H = 420, L = 54, T = 14, B = 34;
    const y = (z) => H - B - z / 13 * (H - T - B);
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Bulut cinsleri ve yükseklik grupları' });
    const yaz = okuma(kap, ['bulut', 'seviye', 'içerik', 'ipucu']);
    for (const [a, b, ad, dolgu] of [[0, 2, 'ALÇAK < 2 km', 'var(--zemin)'], [2, 6, 'ORTA 2–6 km', 'var(--acc-zemin)'], [6, 13, 'YÜKSEK > 6 km', 'var(--zemin)']]) {
      svg.append(el('rect', { x: L, y: y(b), width: W - L - 8, height: y(a) - y(b), fill: dolgu, stroke: 'var(--cizgi)' }));
      yazi(svg, W - 14, y(b) + 20, ad, { 'text-anchor': 'end', 'font-size': 13, fill: 'var(--ikincil)', 'font-weight': 700, stroke: 'none' });
    }
    for (const z of [0, 2, 6, 13]) yazi(svg, L - 8, y(z) + 5, `${z}`, { 'text-anchor': 'end', 'font-size': 13, fill: 'var(--ikincil)', stroke: 'none' });
    yazi(svg, 6, 12, 'km', { 'font-size': 14, 'font-weight': 600, stroke: 'none' });
    const secim = (b, g) => { svg.querySelectorAll('.m342-bulut').forEach((q) => q.setAttribute('opacity', 0.75)); g.setAttribute('opacity', 1); yaz({ bulut: `${b[0]} · ${b[1]}`, seviye: b[2], 'içerik': b[3], ipucu: b[4] }); };
    for (const b of BULUTLAR) {
      const g = el('g', { class: 'm342-bulut', tabindex: 0, role: 'button', 'aria-label': `${b[1]}`, style: 'cursor:pointer', opacity: 0.75 });
      const cx = b[5] + 10, cy = y(b[6]);
      if (b[7] === 'lif') for (let i = 0; i < 4; i++) g.append(el('path', { d: `M${cx - 40 + i * 8},${cy + 8 - i * 4} q30,-18 70,-6`, fill: 'none', stroke: 'var(--ikincil)', 'stroke-width': 2 }));
      else if (b[7] === 'ort') g.append(el('rect', { x: cx - 50, y: cy - 7, width: 100, height: 14, rx: 7, fill: 'var(--zemin)', stroke: 'var(--ikincil)', 'stroke-width': 1.6 }));
      else if (b[7] === 'pul') for (let i = 0; i < 5; i++) g.append(el('circle', { cx: cx - 36 + i * 18, cy: cy + (i % 2) * 5, r: 8, fill: 'var(--zemin)', stroke: 'var(--ikincil)', 'stroke-width': 1.5 }));
      else if (b[7] === 'kalin') { g.append(el('rect', { x: cx - 52, y: y(3.2), width: 104, height: y(0.6) - y(3.2), rx: 10, fill: 'var(--cizgi)', stroke: 'var(--ikincil)', 'stroke-width': 1.6 })); for (let i = 0; i < 5; i++) g.append(el('line', { x1: cx - 36 + i * 18, x2: cx - 40 + i * 18, y1: y(0.6), y2: y(0.05), stroke: 'var(--acc)', 'stroke-width': 1.5 })); }
      else if (b[7] === 'cu') bulutCiz(g, cx, cy - 4, 0.75);
      else { g.append(el('path', { d: `M${cx - 22},${y(1)} L${cx - 26},${y(9)} Q${cx},${y(10.5)} ${cx + 26},${y(9)} L${cx + 22},${y(1)}Z`, fill: 'var(--zemin)', stroke: 'var(--ikincil)', 'stroke-width': 1.6 })); g.append(el('path', { d: `M${cx - 55},${y(11.2)} L${cx + 48},${y(11.2)} L${cx + 26},${y(9)} L${cx - 26},${y(9)}Z`, fill: 'var(--zemin)', stroke: 'var(--ikincil)', 'stroke-width': 1.6 })); }
      const ey = b[7] === 'cb' ? y(5.5) : b[7] === 'kalin' ? y(1.9) : cy + 4;
      g.append(el('text', { x: cx, y: ey + 1, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: 'var(--yazi)', 'font-family': FONT, ...HALE, stroke: 'var(--zemin)' }, b[0]));
      g.addEventListener('pointerenter', () => secim(b, g)); g.addEventListener('click', () => secim(b, g)); g.addEventListener('focus', () => secim(b, g));
      svg.append(g);
    }
    kap.append(svg);
    yaz({ bulut: 'bir buluta dokun', seviye: '—', 'içerik': '—', ipucu: 'hale → buz → yüksek bulut' });
  };

  Sekil.m342_ortu = function (kap, ayar = {}) {
    let n = ayar.onda ?? 4;
    const sahne = sahneKur(kap);
    const yaz = okuma(kap, ['örtü', 'okta', 'sınıf']);
    const sinif = (v) => (v < 1 ? 'clear (açık)' : v <= 5 ? 'scattered (parçalı)' : v < 6 ? 'scattered/broken sınırı' : v <= 9 ? 'broken (çok bulutlu)' : 'overcast (kapalı)');
    let tohum = 11; const rnd = () => (tohum = (tohum * 9301 + 49297) % 233280) / 233280;
    const yer = []; for (let i = 0; i < 20; i++) yer.push([rnd(), rnd()]);
    function ciz() {
      sahne.innerHTML = '';
      const W = 560, H = 290, cx = 280, cy = 230, R = 200;
      const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Gökyüzü kubbesi ve bulut örtüsü' });
      const id = `m342k${++kimlik}`;
      const cp = el('clipPath', { id }); cp.append(el('path', { d: `M${cx - R},${cy} A${R},${R} 0 0 1 ${cx + R},${cy}Z` })); svg.append(cp);
      svg.append(el('path', { d: `M${cx - R},${cy} A${R},${R} 0 0 1 ${cx + R},${cy}Z`, fill: 'var(--acc-zemin)', stroke: 'var(--acc)', 'stroke-width': 2 }));
      const g = el('g', { 'clip-path': `url(#${id})` }); svg.append(g);
      // 20 dilim: her dilim gökyüzünün %5'i; n/10 kadarını bulutla doldur
      const dilim = Math.round(n * 2);
      for (let i = 0; i < 20; i++) { const a0 = Math.PI * i / 20, a1 = Math.PI * (i + 1) / 20; if (i >= dilim) continue; const p = (a) => `${(cx - R * Math.cos(a)).toFixed(1)},${(cy - R * Math.sin(a)).toFixed(1)}`; g.append(el('path', { d: `M${cx},${cy} L${p(a0)} A${R},${R} 0 0 1 ${p(a1)}Z`, fill: 'var(--zemin)', stroke: 'var(--ikincil)', 'stroke-width': 0.8, opacity: 0.95 })); }
      svg.append(el('line', { x1: 40, x2: 520, y1: cy, y2: cy, stroke: 'var(--ikincil)', 'stroke-width': 2 }));
      // sınıf şeridi
      const sx = (v) => 60 + v / 10 * 440;
      for (const [a, b, ad] of [[0, 1, 'clear'], [1, 5, 'scattered'], [6, 9, 'broken'], [9, 10, 'overc.']]) { svg.append(el('rect', { x: sx(a), y: 250, width: sx(b) - sx(a), height: 16, fill: 'var(--cizgi)', stroke: 'var(--yuzey)' })); yazi(svg, (sx(a) + sx(b)) / 2, 284, ad, { 'text-anchor': 'middle', 'font-size': 13 }); }
      svg.append(el('polygon', { points: `${sx(n)},248 ${sx(n) - 7},238 ${sx(n) + 7},238`, fill: 'var(--tur)' }));
      yazi(svg, cx, 120, `${sy(n)}/10`, { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: 'var(--tur)' });
      yazi(svg, cx, 148, sinif(n), { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700 });
      sahne.append(svg);
      yaz({ 'örtü': `${sy(n)}/10 = %${sy(n * 10, 0)}`, okta: `${sy(n * 0.8)}/8`, sınıf: sinif(n) });
    }
    kaydirici(kap, { ad: 'Kapalılık', min: 0, max: 10, adim: 0.25, deger: n, bicim: (v) => `${sy(v, 2)}/10` }, (v) => { n = v; ciz(); });
    ciz();
  };

  Sekil.m342_lognormal = function (kap) {
    const s = { Lx: 1, Sx: 0.5 }, dX = 0.2;
    const f = (X) => dX / (Math.sqrt(2 * Math.PI) * s.Sx * X) * Math.exp(-0.5 * (Math.log(X / s.Lx) / s.Sx) ** 2);
    const sahne = sahneKur(kap);
    const yaz = okuma(kap, ['X', 'f(X)', 'mod', 'medyan', 'ortalama']);
    function ciz() {
      sahne.innerHTML = '';
      let mx = 0; for (let X = 0.01; X <= 4; X += 0.005) mx = Math.max(mx, f(X));
      const ust = Math.max(0.2, Math.ceil(mx * 1.25 * 20) / 20);
      const yt = []; for (let v = 0; v <= ust + 1e-9; v += ust / 4) yt.push(v);
      const d = grafik(sahne, { x: [0, 4], y: [0, ust], xt: [0, 1, 2, 3, 4], yt, yf: (v) => sy(v, 2), xe: 'bulut boyu X (km)', ye: 'f(X)', ad: 'Lognormal bulut boyu dağılımı' });
      d.alan([[0.01, 0], ...d.ornek(f, 0.01, 4, 300), [4, 0]], { fill: 'var(--acc)', opacity: 0.12 });
      d.cizgi(d.ornek(f, 0.01, 4, 300), { 'stroke-width': 3 });
      const mod = s.Lx * Math.exp(-(s.Sx ** 2)), ort = s.Lx * Math.exp(s.Sx ** 2 / 2);
      for (const [v, ad, renk, dy] of [[mod, 'mod', 'var(--tur)', 18], [s.Lx, 'medyan L_x', 'var(--yazi)', 38], [ort, 'ortalama', 'var(--ikincil)', 58]]) {
        d.cizgi([[v, 0], [v, ust]], { stroke: renk, 'stroke-dasharray': '4 4', 'stroke-width': 1.6 });
        d.yazi(d.x(v) + 5, d.T + dy, ad, { 'font-size': 13, fill: renk, 'font-weight': 600 });
      }
      if (s.Lx === 1 && s.Sx === 0.5) for (const X of [0.5, 1, 2]) { d.nokta(d.x(X), d.y(f(X)), { fill: 'var(--tur)' }); d.yazi(d.x(X) + 8, d.y(f(X)) - 8, sy(f(X), 3), { 'font-size': 13 }); }
      const oz = { mod: `${sy(mod, 2)} km`, medyan: `${sy(s.Lx, 2)} km`, ortalama: `${sy(ort, 2)} km` };
      yaz({ X: 'gezdir', 'f(X)': '—', ...oz });
      d.imlec((X) => yaz({ X: `${sy(X, 2)} km`, 'f(X)': sy(f(X), 3), ...oz }));
    }
    kaydirici(kap, { ad: 'L_x (medyan)', min: 0.5, max: 2, adim: 0.05, deger: 1, bicim: (v) => `${sy(v, 2)} km` }, (v) => { s.Lx = v; ciz(); });
    kaydirici(kap, { ad: 'S_x (yayılım)', min: 0.2, max: 1, adim: 0.05, deger: 0.5, bicim: (v) => sy(v, 2) }, (v) => { s.Sx = v; ciz(); });
    ciz();
  };

  /* Föhn: dağ kesiti */
  function fohnHesap(s) {
    const zL = Math.min(0.125 * (s.T - s.Td), s.H);
    const TL = s.T - GD * zL, Ttop = TL - 6 * (s.H - zL), Tlee = Ttop + GD * s.H;
    return { zL, TL, Ttop, Tlee, bulut: zL < s.H };
  }
  function fohnCiz(kap, s) {
    const W = 560, H = 340, L = 50, R = 14, T = 20, B = 30;
    const x = (u) => L + u / 10 * (W - L - R), y = (z) => H - B - z / 4.2 * (H - T - B);
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Föhn: dağı aşan havanın sıcaklığı' });
    const h = fohnHesap(s);
    const zemin = (u) => (u <= 5 ? s.H * u / 5 : s.H * (10 - u) / 5);
    for (let z = 0; z <= 4; z++) { svg.append(el('line', { x1: L, x2: W - R, y1: y(z), y2: y(z), stroke: 'var(--cizgi)' })); yazi(svg, L - 8, y(z) + 5, `${z}`, { 'text-anchor': 'end', 'font-size': 13, fill: 'var(--ikincil)', stroke: 'none' }); }
    yazi(svg, 6, 14, 'z (km)', { 'font-size': 14, 'font-weight': 600, stroke: 'none' });
    if (h.bulut) {
      const u1 = 5 * h.zL / s.H;
      svg.append(el('path', { d: `M${x(u1)},${y(h.zL)} L${x(5)},${y(s.H)} L${x(5)},${y(h.zL)}Z`, fill: 'var(--zemin)', stroke: 'var(--ikincil)', 'stroke-dasharray': '4 3' }));
      for (let i = 0; i < 7; i++) { const u = u1 + (5 - u1) * (i + 0.5) / 7; svg.append(el('line', { x1: x(u) - 8, x2: x(u) - 14, y1: y(zemin(u)) + 8, y2: y(zemin(u)) + 30, stroke: 'var(--acc)', 'stroke-width': 1.6, opacity: 0.9 })); }
      svg.append(el('line', { x1: x(0), x2: x(5), y1: y(h.zL), y2: y(h.zL), stroke: 'var(--ikincil)', 'stroke-dasharray': '2 4' }));
    }
    svg.append(el('path', { d: `M${x(0)},${y(0)} L${x(5)},${y(s.H)} L${x(10)},${y(0)} L${x(10)},${H - B + 10} L${x(0)},${H - B + 10}Z`, fill: 'var(--cizgi)', stroke: 'var(--ikincil)', 'stroke-width': 2 }));
    const et = (u, z, m, a = {}) => yazi(svg, x(u), y(z), m, { 'font-size': 14, 'font-weight': 600, ...a });
    et(0.1, 0.25, `${sy(s.T)} °C · T_d ${sy(s.Td)} °C`);
    if (h.bulut) et(0.1, h.zL + 0.15, `LCL ${sy(h.zL, 2)} km: ${sy(h.TL)} °C`, { fill: 'var(--acc)' });
    et(5, s.H + 0.18, `tepe: ${sy(h.Ttop)} °C`, { 'text-anchor': 'middle' });
    et(9.9, 0.25, `${sy(h.Tlee)} °C`, { 'text-anchor': 'end', fill: 'var(--tur)', 'font-size': 18, 'font-weight': 800 });
    et(9.9, 0.62, h.bulut ? `+${sy(h.Tlee - s.T)} K föhn` : 'bulut yok: fark yok', { 'text-anchor': 'end', fill: 'var(--tur)' });
    kap.append(svg);
    return { svg, x, y, h, zemin };
  }
  Sekil.m342_fohn = function (kap) {
    const s = { T: 20, Td: 12, H: 3 };
    const sahne = sahneKur(kap);
    const yaz = okuma(kap, ['z_LCL', 'tepe', 'rüzgâraltı', 'kazanç']);
    function ciz() { sahne.innerHTML = ''; const { h } = fohnCiz(sahne, s); yaz({ z_LCL: h.bulut ? `${sy(h.zL, 2)} km` : 'dağdan yüksek', tepe: `${sy(h.Ttop)} °C`, 'rüzgâraltı': `${sy(h.Tlee)} °C`, 'kazanç': `${sy(h.Tlee - s.T)} K = (9,8 − 6)·(H − z_LCL)` }); }
    kaydirici(kap, { ad: 'Deniz sev. T', min: 10, max: 30, adim: 0.5, deger: s.T, bicim: (v) => `${sy(v)} °C` }, (v) => { s.T = v; if (s.Td > v) s.Td = v; ciz(); });
    kaydirici(kap, { ad: 'Çiğ noktası', min: 0, max: 30, adim: 0.5, deger: s.Td, bicim: (v) => `${sy(v)} °C` }, (v) => { s.Td = Math.min(v, s.T); ciz(); });
    kaydirici(kap, { ad: 'Dağ yüksekliği', min: 1, max: 4, adim: 0.1, deger: s.H, bicim: (v) => `${sy(v)} km` }, (v) => { s.H = v; ciz(); });
    ciz();
  };
  Anim.m342_fohn = function (kap) {
    const s = { T: 20, Td: 12, H: 3 };
    const { svg, x, y, h, zemin } = fohnCiz(kap, s);
    const p = el('circle', { r: 11, fill: 'var(--tur)', stroke: 'var(--yuzey)', 'stroke-width': 3 }); svg.append(p);
    const yaz = okuma(kap, ['z', 'T', 'evre']);
    const z = zamanli(kap, { t0: 0, t1: 10, hiz: 1.1, ad: 'yol' }, (u) => {
      const zz = zemin(u);
      let T, evre;
      if (u <= 5 && zz <= h.zL) { T = s.T - GD * zz; evre = 'kuru yükseliş: 9,8 K/km soğur'; }
      else if (u <= 5) { T = h.TL - 6 * (zz - h.zL); evre = 'doymuş yükseliş + yağış: 6 K/km'; }
      else { T = h.Ttop + GD * (s.H - zz); evre = 'kuru iniş: 9,8 K/km ısınır'; }
      p.setAttribute('cx', x(u)); p.setAttribute('cy', y(zz) - 14);
      yaz({ z: `${sy(zz, 2)} km`, T: `${sy(T)} °C`, evre });
    });
    return { dur: z.dur };
  };

  /* ======================= K4 · Sis, karışma, çiy/don ======================= */
  Sekil.m342_sissaat = function (kap) {
    const s = { T: 12, Td: 8, a: 1.0, b: 0.2 };
    const sahne = sahneKur(kap);
    const yaz = okuma(kap, ['açık', 'yaklaşma', 'sis']);
    function ciz() {
      sahne.innerHTML = '';
      const d = grafik(sahne, { x: [0, 10], y: [0, 14], xt: [0, 2, 4, 6, 8, 10], yt: [0, 2, 4, 6, 8, 10, 12, 14], xe: 'gün batımından sonra (saat)', ye: 'sıcaklık (°C)', ad: 'Işınım sisi: T ile çiğ noktasının buluşması' });
      const yak = s.a - s.b, ts = yak > 0 ? (s.T - s.Td) / yak : Infinity;
      const Tt = (t) => (t < ts ? s.T - s.a * t : s.Td - s.b * t);
      const Tdt = (t) => s.Td - s.b * t;
      d.cizgi(d.ornek(Tt, 0, 10, 200), { stroke: 'var(--tur)', 'stroke-width': 3.2 });
      d.cizgi(d.ornek(Tdt, 0, 10, 50), { stroke: 'var(--acc)', 'stroke-width': 3, 'stroke-dasharray': '8 5' });
      if (ts <= 10) { d.alan([[ts, 0], [ts, 14], [10, 14], [10, 0]], { fill: 'var(--ikincil)', opacity: 0.13 }); d.nokta(d.x(ts), d.y(Tdt(ts)), { fill: 'var(--tur)' }); d.yazi(d.x(ts) + 8, d.y(13), `sis ≈ ${sy(ts)} saat`, { 'font-weight': 700 }); }
      d.lejant(d.x(5.2), d.y(10.5) + 40, [['var(--tur)', null, 'hava sıcaklığı T'], ['var(--acc)', '8 5', 'çiğ noktası T_d']]);
      yaz({ 'açık': `${sy(s.T - s.Td)} K`, yaklaşma: `${sy(yak, 2)} K/saat`, sis: isFinite(ts) ? `${sy(ts)} saat sonra` : 'oluşmaz (yaklaşma yok)' });
    }
    kaydirici(kap, { ad: 'T soğuma', min: 0.3, max: 2, adim: 0.1, deger: s.a, bicim: (v) => `${sy(v)} K/sa` }, (v) => { s.a = v; ciz(); });
    kaydirici(kap, { ad: 'T_d düşüşü (çiy)', min: 0, max: 0.6, adim: 0.05, deger: s.b, bicim: (v) => `${sy(v, 2)} K/sa` }, (v) => { s.b = v; ciz(); });
    ciz();
  };

  Sekil.m342_sistur = function (kap, ayar = {}) {
    const adim = ayar.adim || 0, W = 560, H = 300;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Sis türü çizimi' });
    const sis = (x, y, w, h) => { for (let i = 0; i < 3; i++) svg.append(el('rect', { x: x + i * 6, y: y + i * (h / 3), width: w - i * 12, height: h / 3 + 2, rx: 8, fill: 'var(--ikincil)', opacity: 0.18 + i * 0.06 })); };
    const zemin = (d, dolgu = 'var(--cizgi)') => svg.append(el('path', { d, fill: dolgu, stroke: 'var(--ikincil)', 'stroke-width': 1.5 }));
    const t = (x, y, m, a = {}) => yazi(svg, x, y, m, { 'font-size': 14, ...a });
    const ad = ['Işınım sisi', 'Adveksiyon sisi', 'Buhar sisi', 'Yamaç sisi', 'Cephe (yağış) sisi', 'Karışma sisi'][adim];
    const neden = ['SOĞUTMA: yer ışınımla soğur', 'SOĞUTMA: ılık nemli hava soğuk yüzeyde', 'NEM EKLEME: soğuk hava ılık suyun üstünde', 'SOĞUTMA: yükselen hava adyabatik soğur', 'NEM EKLEME: ılık yağmur soğuk havada buharlaşır', 'KARIŞMA: iki doymamış hava karışır'][adim];
    if (adim === 0) {
      zemin('M0,250 L150,250 Q280,300 410,250 L560,250 L560,300 L0,300Z');
      svg.append(el('circle', { cx: 480, cy: 60, r: 18, fill: 'var(--ikincil)', opacity: 0.6 }));
      for (const [x, y] of [[90, 70], [200, 50], [330, 80], [400, 40]]) svg.append(el('circle', { cx: x, cy: y, r: 2.5, fill: 'var(--ikincil)' }));
      for (const x of [60, 470, 520]) ok(svg, x, 240, x, 190, 'var(--tur)', 2, 9);
      sis(170, 238, 220, 40);
      t(30, 180, 'uzun dalga ışınım ↑', { fill: 'var(--tur)' });
      t(170, 230, 'vadide soğuk, ağır hava + sis', { 'font-weight': 600 });
    } else if (adim === 1) {
      zemin('M0,255 L560,255 L560,300 L0,300Z', 'var(--acc-zemin)');
      t(300, 285, 'soğuk deniz/kıyı suyu', { fill: 'var(--acc)', 'font-weight': 600, stroke: 'var(--acc-zemin)' });
      ok(svg, 30, 200, 210, 200, 'var(--tur)', 3); t(30, 190, 'ılık nemli hava', { fill: 'var(--tur)', 'font-weight': 600 });
      sis(230, 205, 310, 48);
      t(250, 196, 'alttan soğur → T = T_d', { 'font-weight': 600 });
    } else if (adim === 2) {
      zemin('M0,255 L120,255 L120,300 L0,300Z'); zemin('M440,255 L560,255 L560,300 L440,300Z');
      svg.append(el('rect', { x: 120, y: 255, width: 320, height: 45, fill: 'var(--tur-zemin)', stroke: 'var(--tur)' }));
      t(150, 285, 'ılık göl (15 °C)', { fill: 'var(--tur)', 'font-weight': 600, stroke: 'var(--tur-zemin)' });
      for (let i = 0; i < 7; i++) svg.append(el('path', { d: `M${150 + i * 42},250 q-10,-18 0,-34 q10,-16 0,-32`, fill: 'none', stroke: 'var(--ikincil)', 'stroke-width': 2, opacity: 0.7 }));
      ok(svg, 20, 140, 160, 140, 'var(--acc)', 3); t(20, 128, 'soğuk hava (0 °C)', { fill: 'var(--acc)', 'font-weight': 600 });
      t(300, 170, 'buhar yükselir, soğuk', { 'font-weight': 600 }); t(300, 190, 'havayla karışıp doyar', { 'font-weight': 600 });
    } else if (adim === 3) {
      zemin('M0,290 L560,120 L560,300 L0,300Z');
      ok(svg, 60, 250, 380, 150, 'var(--acc)', 3);
      sis(330, 118, 200, 46);
      t(40, 210, 'nemli hava yamaçtan yükselir', { 'font-weight': 600 });
      t(300, 100, 'genişler, soğur → yamaçta sis', { 'font-weight': 600 });
    } else if (adim === 4) {
      zemin('M0,270 L560,270 L560,300 L0,300Z');
      svg.append(el('path', { d: 'M0,270 L0,160 Q260,180 560,270Z', fill: 'var(--acc-zemin)', stroke: 'var(--acc)', 'stroke-width': 2 }));
      t(20, 255, 'soğuk hava', { fill: 'var(--acc)', 'font-weight': 600, stroke: 'var(--acc-zemin)' });
      bulutCiz(svg, 200, 80, 1.3); bulutCiz(svg, 330, 100, 1.1);
      t(300, 50, 'ılık hava (sıcak cephe üstü)', { fill: 'var(--tur)', 'font-weight': 600 });
      for (let i = 0; i < 10; i++) svg.append(el('line', { x1: 170 + i * 18, y1: 110, x2: 162 + i * 18, y2: 200 + (i % 3) * 14, stroke: 'var(--acc)', 'stroke-width': 1.8 }));
      sis(60, 205, 330, 40);
      t(400, 240, 'yağmur buharlaşır', { 'font-weight': 600 });
    } else {
      zemin('M0,270 L560,270 L560,300 L0,300Z');
      svg.append(el('circle', { cx: 160, cy: 160, r: 60, fill: 'var(--tur-zemin)', stroke: 'var(--tur)', 'stroke-width': 2 }));
      svg.append(el('circle', { cx: 400, cy: 160, r: 60, fill: 'var(--acc-zemin)', stroke: 'var(--acc)', 'stroke-width': 2 }));
      t(160, 156, 'sıcak, nemli', { 'text-anchor': 'middle', fill: 'var(--tur)', 'font-weight': 600, stroke: 'var(--tur-zemin)' }); t(160, 176, '(nefes)', { 'text-anchor': 'middle', fill: 'var(--tur)', stroke: 'var(--tur-zemin)' });
      t(400, 156, 'soğuk, kuru', { 'text-anchor': 'middle', fill: 'var(--acc)', 'font-weight': 600, stroke: 'var(--acc-zemin)' }); t(400, 176, '(kış havası)', { 'text-anchor': 'middle', fill: 'var(--acc)', stroke: 'var(--acc-zemin)' });
      ok(svg, 228, 160, 262, 160, 'var(--yazi)', 3); ok(svg, 332, 160, 298, 160, 'var(--yazi)', 3);
      sis(230, 205, 100, 40); t(280, 262, 'karışım doyar', { 'text-anchor': 'middle', 'font-weight': 600 });
    }
    yazi(svg, 20, 30, ad, { 'font-size': 18, 'font-weight': 700 });
    yazi(svg, 540, 30, neden, { 'font-size': 13, 'text-anchor': 'end', fill: 'var(--ikincil)', 'font-weight': 600 });
    kap.append(svg);
  };

  function karismaCiz(kap, s) {
    const d = grafik(kap, { x: [-10, 35], y: [0, 5], xt: [-10, 0, 10, 20, 30], yt: [0, 1, 2, 3, 4, 5], xe: 'T (°C)', ye: 'e (kPa)', ad: 'Karışma: doyma eğrisi ve karışım doğrusu' });
    const egri = d.ornek((t) => esw(t + 273.15), -10, 35, 200);
    d.alan([...egri, [35, 5], [-10, 5]], { fill: 'var(--acc)', opacity: 0.1 });
    d.cizgi(egri, { stroke: 'var(--acc)', 'stroke-width': 3 });
    d.yazi(d.x(-9), d.y(4.5), 'doymuş bölge (sis/bulut)', { 'font-size': 14, fill: 'var(--acc)', 'font-weight': 600 });
    d.yazi(d.x(20.5), d.y(1.0), 'eₛ(T) eğrisi', { 'font-size': 14, fill: 'var(--acc)' });
    d.cizgi([[s.B[0], s.B[1]], [s.C[0], s.C[1]]], { stroke: 'var(--ikincil)', 'stroke-dasharray': '6 5', 'stroke-width': 2 });
    for (const [p, ad, dx] of [[s.B, 'B', -22], [s.C, 'C', 10]]) { d.nokta(d.x(p[0]), d.y(p[1])); d.yazi(d.x(p[0]) + dx, d.y(p[1]) - 10, ad, { 'font-weight': 800, 'font-size': 17 }); }
    const X = d.nokta(0, 0, { fill: 'var(--tur)', r: 8 });
    const XE = d.yazi(0, 0, 'X', { 'font-weight': 800, 'font-size': 17, fill: 'var(--tur)' });
    const fark = el('line', { stroke: 'var(--tur)', 'stroke-width': 3 }); d.ust.append(fark);
    return (w) => {
      const T = w * s.B[0] + (1 - w) * s.C[0], e = w * s.B[1] + (1 - w) * s.C[1], es = esw(T + 273.15);
      X.setAttribute('cx', d.x(T)); X.setAttribute('cy', d.y(e)); XE.setAttribute('x', d.x(T) + 10); XE.setAttribute('y', d.y(e) + 22);
      fark.setAttribute('x1', d.x(T)); fark.setAttribute('x2', d.x(T)); fark.setAttribute('y1', d.y(e)); fark.setAttribute('y2', d.y(Math.min(e, es))); fark.setAttribute('visibility', e > es ? 'visible' : 'hidden');
      return { T, e, es, RH: e / es * 100 };
    };
  }
  const KARISIM = { S20: { B: [30, 3.4], C: [-4, 0.2], w: 0.5 }, S21: { B: [15, esw(288.15)], C: [0, 0.8 * esw(273.15)], w: 0.5 } };
  Sekil.m342_karisma = function (kap, ayar = {}) {
    let s = { ...KARISIM[ayar.ornek || 'S20'] };
    const sahne = sahneKur(kap);
    const yaz = okuma(kap, ['T_X', 'e_X', 'eₛ(T_X)', 'RH', 'sonuç']);
    let guncel, kay;
    function kur() { sahne.innerHTML = ''; guncel = karismaCiz(sahne, s); ciz(s.w); }
    function ciz(w) { s.w = w; const r = guncel(w); yaz({ T_X: `${sy(r.T)} °C`, e_X: `${sy(r.e, 3)} kPa`, 'eₛ(T_X)': `${sy(r.es, 3)} kPa`, RH: `%${sy(r.RH, 0)}`, 'sonuç': r.e > r.es ? `doymuş: ${sy(r.e - r.es, 2)} kPa fazla buhar yoğuşur` : 'doymamış' }); }
    kay = kaydirici(kap, { ad: 'B payı', min: 0, max: 1, adim: 0.01, deger: s.w, bicim: (v) => `%${sy(v * 100, 0)}` }, ciz);
    dugmeler(kap, [['S20: B 30 °C + C −4 °C', 'S20'], ['S21: göl + soğuk hava', 'S21']], (k) => { s = { ...KARISIM[k] }; kay.ayarla(s.w); kur(); });
    kur();
  };
  Anim.m342_karisma = function (kap) {
    const s = { ...KARISIM.S20 };
    const guncel = karismaCiz(kap, s);
    const yaz = okuma(kap, ['B payı', 'T_X', 'RH', 'durum']);
    const z = zamanli(kap, { t0: 0, t1: 1, hiz: 0.12, ad: 'B havasının payı' }, (w) => {
      const r = guncel(w);
      yaz({ 'B payı': `%${sy(w * 100, 0)}`, T_X: `${sy(r.T)} °C`, RH: `%${sy(r.RH, 0)}`, durum: r.e > r.es ? 'doğru eğrinin ÜSTÜNDE → sis' : 'eğrinin altında → doymamış' });
    });
    return { dur: z.dur };
  };

  Sekil.m342_es = function (kap) {
    const d = grafik(kap, { x: [-40, 40], y: [0, 7.5], xt: [-40, -30, -20, -10, 0, 10, 20, 30, 40], yt: [0, 1, 2, 3, 4, 5, 6, 7], xe: 'T (°C)', ye: 'eₛ (kPa)', ad: 'Doyma buhar basıncı: su ve buz üzerinde' });
    d.cizgi(d.ornek((t) => esw(t + 273.15), -40, 40, 240), { stroke: 'var(--acc)', 'stroke-width': 3 });
    d.cizgi(d.ornek((t) => esi(t + 273.15), -40, 0, 120), { stroke: 'var(--tur)', 'stroke-width': 3, 'stroke-dasharray': '7 4' });
    for (const t of [10, 20, 30]) { const v = esw(t + 273.15); d.nokta(d.x(t), d.y(v)); d.yazi(d.x(t) - 8, d.y(v) - 10, sy(v, 2), { 'font-size': 13, 'text-anchor': 'end' }); }
    d.lejant(d.x(-38), d.y(6.9), [['var(--acc)', null, 'su üzerinde (Lᵥ/ℜᵥ = 5423 K)'], ['var(--tur)', '7 4', 'buz üzerinde (L_d/ℜᵥ = 6139 K)']]);
    const yaz = okuma(kap, ['T', 'eₛ(su)', 'eₛ(buz)', 'artış']);
    d.imlec((t) => { const T = t + 273.15; yaz({ T: `${sy(t)} °C`, 'eₛ(su)': `${sy(esw(T), 3)} kPa`, 'eₛ(buz)': t < 0 ? `${sy(esi(T), 3)} kPa` : '—', 'artış': `%${sy(100 * LV / T / T)} / K` }); });
    yaz({ T: 'eğride gezdir', 'eₛ(su)': '—', 'eₛ(buz)': '—', 'artış': '—' });
  };

  Sekil.m342_ciydon = function (kap) {
    const s = { e: esw(269.15), Ty: -5 };
    const sahne = sahneKur(kap);
    const yaz = okuma(kap, ['e', 'T_d', 'T_f', 'yüzey']);
    function ciz() {
      sahne.innerHTML = '';
      const d = grafik(sahne, { x: [-10, 3], y: [0.25, 0.8], xt: [-10, -8, -6, -4, -2, 0, 2], yt: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8], yf: (v) => sy(v, 1), xe: 'T (°C)', ye: 'kPa', ad: 'Çiğ noktası ve don noktası' });
      d.cizgi(d.ornek((t) => esw(t + 273.15), -10, 3, 120), { stroke: 'var(--acc)', 'stroke-width': 3 });
      d.cizgi(d.ornek((t) => esi(t + 273.15), -10, 0, 120), { stroke: 'var(--tur)', 'stroke-width': 3, 'stroke-dasharray': '7 4' });
      const Td = 1 / (1 / T0 - Math.log(s.e / e0) / LV) - 273.15, Tf = 1 / (1 / T0 - Math.log(s.e / e0) / LD) - 273.15;
      d.cizgi([[-10, s.e], [3, s.e]], { stroke: 'var(--yazi)', 'stroke-width': 1.8, 'stroke-dasharray': '3 4' });
      d.nokta(d.x(Td), d.y(s.e), { fill: 'var(--acc)' }); d.nokta(d.x(Tf), d.y(s.e), { fill: 'var(--tur)' });
      d.yazi(d.x(Td) - 8, d.y(s.e) - 12, `T_d ${sy(Td)}`, { 'text-anchor': 'end', fill: 'var(--acc)', 'font-weight': 700, 'font-size': 14 });
      d.yazi(d.x(Tf) + 8, d.y(s.e) + 22, `T_f ${sy(Tf)}`, { fill: 'var(--tur)', 'font-weight': 700, 'font-size': 14 });
      d.cizgi([[s.Ty, 0.25], [s.Ty, 0.8]], { stroke: 'var(--yazi)', 'stroke-width': 2.4 });
      d.yazi(d.x(s.Ty) + 6, d.y(0.29), 'yüzey', { 'font-size': 13, 'font-weight': 600 });
      d.lejant(d.x(-9.6), d.y(0.75), [['var(--acc)', null, 'eₛ su üzerinde'], ['var(--tur)', '7 4', 'eₛ buz üzerinde']]);
      let sonuc;
      if (s.Ty < 0 && esi(s.Ty + 273.15) < s.e) sonuc = 'buz üzerinde aşırı doymuş → KIRAĞI';
      else if (s.Ty >= 0 && esw(s.Ty + 273.15) < s.e) sonuc = 'su üzerinde aşırı doymuş → ÇİY';
      else sonuc = 'yüzeyde doyma yok → hiçbir şey';
      yaz({ e: `${sy(s.e, 3)} kPa`, T_d: `${sy(Td)} °C`, T_f: `${sy(Tf)} °C`, 'yüzey': `${sy(s.Ty)} °C: ${sonuc}` });
    }
    kaydirici(kap, { ad: 'Buhar basıncı e', min: 0.3, max: 0.75, adim: 0.005, deger: s.e, bicim: (v) => `${sy(v, 3)} kPa` }, (v) => { s.e = v; ciz(); });
    kaydirici(kap, { ad: 'Yüzey sıcaklığı', min: -10, max: 3, adim: 0.1, deger: s.Ty, bicim: (v) => `${sy(v)} °C` }, (v) => { s.Ty = v; ciz(); });
    ciz();
  };

  /* ======================= K5 · Higroskopiklik ======================= */
  const TUZ = [['NH₄NO₃', 14.73], ['NH₄Cl + KNO₃', 16.92], ['NaNO₃', 17.68], ['üre', 18.39], ['NH₄Cl', 18.84], ['(NH₄)₂SO₄', 19.26], ['KCl', 20.20], ['NH₄H₂PO₄', 22.09], ['KNO₃', 22.22]];
  Sekil.m342_drh = function (kap) {
    let RH = 78;
    const sahne = sahneKur(kap);
    const yaz = okuma(kap, ['hava RH', 'e_hava', 'nem çekenler']);
    function ciz() {
      sahne.innerHTML = '';
      const W = 560, Hh = 46 + TUZ.length * 34, L = 150, R = 20;
      const x = (v) => L + (v - 50) / 50 * (W - L - R);
      const svg = el('svg', { viewBox: `0 0 ${W} ${Hh}`, role: 'img', 'aria-label': 'Tuzların kritik bağıl nemi' });
      for (const v of [50, 60, 70, 80, 90, 100]) { svg.append(el('line', { x1: x(v), x2: x(v), y1: 14, y2: Hh - 28, stroke: 'var(--cizgi)' })); yazi(svg, x(v), Hh - 8, `%${v}`, { 'text-anchor': 'middle', 'font-size': 13, fill: 'var(--ikincil)', stroke: 'none' }); }
      const ceken = [];
      TUZ.forEach(([ad, p], i) => {
        const drh = p / 23.76 * 100, c = drh < RH, yy = 20 + i * 34;
        if (c) ceken.push(ad);
        svg.append(el('rect', { x: L, y: yy, width: x(drh) - L, height: 22, rx: 5, fill: c ? 'var(--tur)' : 'var(--cizgi)', opacity: c ? 0.85 : 1 }));
        yazi(svg, L - 8, yy + 16, ad, { 'text-anchor': 'end', 'font-size': 14, 'font-weight': 600 });
        yazi(svg, x(drh) + 6, yy + 16, `%${sy(drh)}`, { 'font-size': 13 });
      });
      svg.append(el('line', { x1: x(RH), x2: x(RH), y1: 8, y2: Hh - 26, stroke: 'var(--acc)', 'stroke-width': 3 }));
      yazi(svg, x(RH) + (RH > 90 ? -6 : 6), 14, `hava %${sy(RH, 0)}`, { 'font-size': 13, fill: 'var(--acc)', 'font-weight': 700, 'text-anchor': RH > 90 ? 'end' : 'start' });
      sahne.append(svg);
      yaz({ 'hava RH': `%${sy(RH, 0)}`, e_hava: `${sy(RH / 100 * 23.76, 2)} mmHg (25 °C)`, 'nem çekenler': ceken.length ? ceken.join(', ') : 'hiçbiri' });
    }
    kaydirici(kap, { ad: 'Havanın RH', min: 50, max: 100, adim: 1, deger: RH, bicim: (v) => `%${v}` }, (v) => { RH = v; ciz(); });
    ciz();
  };

  Sekil.m342_cc2 = function (kap) {
    const P1 = 13.06, P2 = 23.46, T1 = 293.15, T2 = 303.15, QR = Math.log(P2 / P1) / (1 / T1 - 1 / T2);
    let Tt = 27;
    const Pf = (T) => P1 * Math.exp(QR * (1 / T1 - 1 / T));
    const Pw = (T) => 4.5815 * Math.exp(LV * (1 / T0 - 1 / T)); // saf su, mmHg (0,611 kPa = 4,58 mmHg)
    const sahne = sahneKur(kap);
    const yaz = okuma(kap, ['Q/R', 'Q', 'T', 'P(T)']);
    function ciz() {
      sahne.innerHTML = '';
      const d = grafik(sahne, { x: [3.25, 3.45], y: [2.3, 3.7], xt: [3.25, 3.3, 3.35, 3.4, 3.45], yt: [2.4, 2.8, 3.2, 3.6], xf: (v) => sy(v, 2), yf: (v) => sy(v, 1), xe: '1000/T (K⁻¹)', ye: 'ln P (P mmHg)', ad: 'Clausius–Clapeyron: ln P ile 1/T doğrusal' });
      const ux = (T) => 1000 / T;
      d.cizgi(d.ornek((u) => Math.log(Pf(1000 / u)), 3.25, 3.45, 40), { stroke: 'var(--tur)', 'stroke-width': 3 });
      d.cizgi(d.ornek((u) => Math.log(Pw(1000 / u)), 3.25, 3.45, 40), { stroke: 'var(--acc)', 'stroke-width': 2.4, 'stroke-dasharray': '7 5' });
      for (const [T, P, ad] of [[T1, P1, '20 °C'], [T2, P2, '30 °C']]) { d.nokta(d.x(ux(T)), d.y(Math.log(P)), { fill: 'var(--tur)' }); d.yazi(d.x(ux(T)) + 9, d.y(Math.log(P)) + 18, ad, { 'font-size': 13 }); }
      d.nokta(d.x(ux(300.15)), d.y(Math.log(19.81)), { fill: 'none', stroke: 'var(--yazi)', 'stroke-width': 2.5, r: 8 });
      const T = Tt + 273.15; d.nokta(d.x(ux(T)), d.y(Math.log(Pf(T))), { fill: 'var(--yazi)', r: 5 });
      d.lejant(d.x(3.335), d.y(3.62), [['var(--tur)', null, 'doygun NaNO₃ çözeltisi'], ['var(--acc)', '7 5', 'saf su (karşılaştırma)']]);
      d.yazi(d.x(3.4) - 120, d.y(2.42), 'eğim = −Q/R', { 'font-size': 14, 'font-weight': 600 });
      yaz({ 'Q/R': `${sy(QR, 0)} K`, Q: `${sy(QR * 8.314 / 1000)} kJ/mol`, T: `${sy(Tt)} °C`, 'P(T)': `${sy(Pf(T), 2)} mmHg${Tt === 27 ? ' (ölçülen 19,81)' : ''}` });
    }
    kaydirici(kap, { ad: 'Tahmin sıcaklığı', min: 17, max: 33, adim: 0.5, deger: Tt, bicim: (v) => `${sy(v)} °C` }, (v) => { Tt = v; ciz(); });
    ciz();
  };

  Sekil.m342_raoult = function (kap, ayar = {}) {
    const adim = ayar.adim || 0, W = 560, H = 300;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Çözünen etkisi: yüzeydeki su molekülleri' });
    const su = (x, y) => svg.append(el('circle', { cx: x, cy: y, r: 9, fill: 'var(--acc-zemin)', stroke: 'var(--acc)', 'stroke-width': 1.8 }));
    const iyon = (x, y) => svg.append(el('circle', { cx: x, cy: y, r: 10, fill: 'var(--tur)', opacity: 0.85 }));
    if (adim < 2) {
      svg.append(el('rect', { x: 30, y: 150, width: 500, height: 130, rx: 10, fill: 'var(--yuzey)', stroke: 'var(--ikincil)' }));
      for (let i = 0; i < 22; i++) for (let j = 0; j < 5; j++) { const x = 46 + i * 22.5 + (j % 2) * 8, y = 166 + j * 24; if (adim === 1 && (i * 7 + j * 3) % 5 === 0) iyon(x, y); else su(x, y); }
      const kacan = adim === 0 ? [70, 160, 250, 340, 430, 500] : [70, 250, 430];
      for (const x of kacan) { ok(svg, x, 140, x + 12, 92, 'var(--acc)', 2.2, 9); su(x + 16, 80); }
      yazi(svg, 30, 32, adim === 0 ? '1 · Saf su: yüzeyin hepsi su molekülü' : '2 · Çözelti: iyonlar yüzeyin bir kısmını tutar', { 'font-size': 17, 'font-weight': 700 });
      yazi(svg, 30, 56, adim === 0 ? 'kaçan molekül çok → buhar basıncı eₛ' : 'daha az molekül kaçar → e = x_w · eₛ  (Raoult)', { 'font-size': 15, fill: 'var(--ikincil)' });
    } else {
      const d = [[150, 170, 46], [400, 165, 96]];
      for (const [cx, cy, r] of d) svg.append(el('circle', { cx, cy, r, fill: 'var(--acc-zemin)', stroke: 'var(--acc)', 'stroke-width': 2 }));
      for (const [cx, cy] of d) { iyon(cx - 10, cy); iyon(cx + 12, cy + 8); }
      yazi(svg, 150, 245, 'küçük damla: iyon payı büyük', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 600 });
      yazi(svg, 400, 285, 'büyük damla: iyon payı küçük', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 600 });
      yazi(svg, 30, 32, '3 · Damlada: aynı tuz, farklı boy', { 'font-size': 17, 'font-weight': 700 });
      yazi(svg, 30, 56, 'su mol sayısı ∝ R³ → çözünen etkisi ∝ 1/R³', { 'font-size': 15, fill: 'var(--ikincil)' });
    }
    kap.append(svg);
  };

  /* ======================= K6 · Kelvin, Köhler, CCN ======================= */
  const C1 = 0.334e-6, C2 = 4.3e-6;
  Sekil.m342_kelvin = function (kap) {
    let Tk = 273;
    const sahne = sahneKur(kap);
    const yaz = okuma(kap, ['R', 'gereken RH', 'molekül']);
    function ciz() {
      sahne.innerHTML = '';
      const S = (Rum) => 100 * (Math.exp(0.334 / (Tk * Rum)) - 1);
      const d = grafik(sahne, { x: [0.001, 10], y: [0.01, 1000], xlog: true, ylog: true, xt: [0.001, 0.01, 0.1, 1, 10], yt: [0.01, 0.1, 1, 10, 100, 1000], xf: (v) => sy(v, v < 0.01 ? 3 : v < 0.1 ? 2 : v < 1 ? 1 : 0), yf: (v) => sy(v, v < 0.1 ? 2 : v < 1 ? 1 : 0), xe: 'damla yarıçapı R (µm)', ye: 'gereken aşırı doymuşluk (%)', ad: 'Kelvin etkisi' });
      d.alan([[0.001, 0.01], [10, 0.01], [10, 1], [0.001, 1]], { fill: 'var(--acc)', opacity: 0.1 });
      d.yazi(d.x(0.0013), d.y(0.4), 'atmosferde tipik S < %1', { 'font-size': 13, fill: 'var(--acc)', 'font-weight': 600 });
      d.cizgi(d.ornek(S, 0.001, 10, 200, true), { stroke: 'var(--tur)', 'stroke-width': 3 });
      for (const [R, ad] of [[0.001, 'S29'], [0.01, 'S29'], [0.03, 'S28'], [1, 'S28']]) { d.nokta(d.x(R), d.y(S(R))); d.yazi(d.x(R) + 8, d.y(S(R)) - 8, `${ad}: %${sy(100 + S(R), S(R) < 1 ? 2 : 0)}`, { 'font-size': 13 }); }
      d.imlec((R) => yaz({ R: `${sy(R, R < 0.01 ? 4 : 3)} µm`, 'gereken RH': `%${sy(100 + S(R), 2)}`, 'molekül': bl(3.34e28 * 4 / 3 * Math.PI * (R * 1e-6) ** 3, 1) }));
      yaz({ R: 'gezdir', 'gereken RH': '—', 'molekül': '—' });
    }
    kaydirici(kap, { ad: 'Sıcaklık T', min: 240, max: 300, adim: 1, deger: Tk, bicim: (v) => `${v} K` }, (v) => { Tk = v; ciz(); });
    ciz();
  };

  const TUZLAR = { NaCl: { i: 2, Ms: 0.05844 }, AS: { i: 3, Ms: 0.13214 } };
  function kohlerF(ms, tuz, T = 273) {
    const { i, Ms } = TUZLAR[tuz]; const a = C1 / T, b = C2 * i * ms / Ms;
    const S = (Rm) => 100 * (Math.exp(a / Rm - b / Rm ** 3) - 1);
    const Rs = Math.sqrt(3 * b / a), Ss = 100 * Math.sqrt(4 * a ** 3 / (27 * b));
    return { S, Rs, Ss, a, b };
  }
  function kohlerCiz(kap, s, kat = 3) {
    const k = kohlerF(s.ms, s.tuz);
    const ust = Math.max(0.8, Math.ceil(k.Ss * 1.35 * 10) / 10);
    const yt = []; for (let v = -1; v <= ust + 1e-9; v += ust > 1.5 ? 0.5 : 0.2) yt.push(Math.round(v * 10) / 10);
    const d = grafik(kap, { x: [0.03, 10], y: [-1, ust], xlog: true, xt: [0.03, 0.1, 0.3, 1, 3, 10], yt, xf: (v) => sy(v, v < 0.1 ? 2 : v < 1 ? 1 : 0), yf: (v) => sy(v, 1), xe: 'damla yarıçapı R (µm)', ye: 'aşırı doymuşluk S (%)', ad: 'Köhler eğrisi' });
    d.cizgi([[0.03, 0], [10, 0]], { stroke: 'var(--ikincil)', 'stroke-width': 1.5 });
    if (kat >= 1) d.cizgi(d.ornek((R) => 100 * (Math.exp(k.a / (R * 1e-6)) - 1), 0.03, 10, 200, true), { stroke: 'var(--ikincil)', 'stroke-dasharray': '7 5', 'stroke-width': 2 });
    if (kat >= 2) d.cizgi(d.ornek((R) => 100 * (Math.exp(-k.b / (R * 1e-6) ** 3) - 1), 0.03, 10, 200, true), { stroke: 'var(--acc)', 'stroke-dasharray': '2 4', 'stroke-width': 2.2 });
    if (kat >= 3) {
      d.cizgi(d.ornek((R) => k.S(R * 1e-6), 0.03, 10, 300, true), { stroke: 'var(--tur)', 'stroke-width': 3.4 });
      d.nokta(d.x(k.Rs * 1e6), d.y(k.Ss), { fill: 'var(--tur)', r: 7 });
      const sag = k.Rs * 1e6 < 1.5;
      d.yazi(d.x(k.Rs * 1e6) + (sag ? 12 : -12), d.y(k.Ss) - 12, `R* = ${sy(k.Rs * 1e6, 2)} µm · S* = %${sy(k.Ss, 2)}`, { 'font-size': 14, 'font-weight': 700, 'text-anchor': sag ? 'start' : 'end' });
    }
    d.lejant(d.x(0.034), d.y(-0.42), [['var(--ikincil)', '7 5', 'yalnız eğrilik (Kelvin)'], ['var(--acc)', '2 4', 'yalnız çözünen (Raoult)'], ['var(--tur)', null, 'Köhler = ikisi birlikte']].slice(0, Math.max(1, kat)));
    return { d, k };
  }
  Sekil.m342_kohler = function (kap, ayar = {}) {
    const s = { ms: 1e-19, tuz: 'NaCl', ...ayar };
    const sahne = sahneKur(kap);
    const yaz = okuma(kap, ['çekirdek', 'R*', 'S*', 'R', 'S(R)']);
    function ciz() {
      sahne.innerHTML = '';
      const { d, k } = kohlerCiz(sahne, s, ayar.kat ?? 3);
      const oz = { 'çekirdek': `${s.tuz === 'NaCl' ? 'NaCl' : '(NH₄)₂SO₄'} ${bl(s.ms, 0)} kg`, 'R*': `${sy(k.Rs * 1e6, 3)} µm`, 'S*': `%${sy(k.Ss, 3)}` };
      yaz({ ...oz, R: 'gezdir', 'S(R)': '—' });
      d.imlec((R) => yaz({ ...oz, R: `${sy(R, 3)} µm`, 'S(R)': `%${sy(k.S(R * 1e-6), 3)} (RH %${sy(100 + k.S(R * 1e-6), 2)})` }));
    }
    kaydirici(kap, { ad: 'Tuz kütlesi (log)', min: -20, max: -17, adim: 0.1, deger: Math.log10(s.ms), bicim: (v) => `${bl(10 ** v, 1)} kg` }, (v) => { s.ms = 10 ** v; ciz(); });
    dugmeler(kap, [['NaCl (i = 2)', 'NaCl'], ['(NH₄)₂SO₄ (i = 3)', 'AS']], (t) => { s.tuz = t; ciz(); });
    ciz();
  };
  Sekil.m342_kohlerkat = function (kap, ayar = {}) { kohlerCiz(kap, { ms: 1e-19, tuz: 'NaCl' }, ayar.kat ?? 1); };
  Anim.m342_aktivasyon = function (kap) {
    const s = { ms: 1e-19, tuz: 'NaCl' };
    let Sort = 0.6, R = 0.05e-6;
    const { d, k } = kohlerCiz(kap, s);
    const cizgi = el('line', { stroke: 'var(--acc)', 'stroke-width': 2.4 }); d.ust.append(cizgi);
    const damla = el('circle', { r: 9, fill: 'var(--acc)', stroke: 'var(--yuzey)', 'stroke-width': 3 }); d.ust.append(damla);
    const yaz = okuma(kap, ['ortam S', 'R', 'durum']);
    const Gk = 1e-10; // R dR/dt = Gk (S − S_eq), m²/s (birim aşırı doymuşluk başına)
    let t = 0;
    const kaydir = kaydirici(kap, { ad: 'Ortam aşırı doymuşluğu', min: -0.6, max: 0.8, adim: 0.01, deger: Sort, bicim: (v) => `%${sy(v, 2)}` }, (v) => { Sort = v; goster(); });
    void kaydir;
    function adimla(dtSn) {
      let kalan = dtSn;
      while (kalan > 0) {
        const f = Gk * (Sort - k.S(R)) / 100 / R; // dR/dt
        const dt = Math.min(kalan, Math.abs(f) > 0 ? 0.02 * R / Math.abs(f) : kalan);
        R = Math.min(10e-6, Math.max(0.031e-6, R + f * dt)); kalan -= dt; t += dt;
        if (Math.abs(f) * dt < 1e-15) { t += kalan; break; }
      }
    }
    function goster() {
      cizgi.setAttribute('x1', d.x(0.03)); cizgi.setAttribute('x2', d.x(10)); cizgi.setAttribute('y1', d.y(Sort)); cizgi.setAttribute('y2', d.y(Sort));
      damla.setAttribute('cx', d.x(R * 1e6)); damla.setAttribute('cy', d.y(Sort));
      const durum = R >= 9.9e-6 ? 'AKTİVE: tepeyi aştı, serbest büyüyor' : R > k.Rs ? 'R* aşıldı → serbest büyüme' : Sort > k.Ss ? 'büyüyor, tepeye yaklaşıyor' : 'denge: haze (pus) damlası';
      yaz({ 'ortam S': `%${sy(Sort, 2)}`, R: `${sy(R * 1e6, 3)} µm (t ≈ ${sy(t, 1)} s)`, durum });
    }
    let son = 0;
    const z = zamanli(kap, { t0: 0, t1: 30, hiz: 1, ad: 'zaman (s)' }, (tt) => {
      if (tt < son || tt === 0) { R = 0.05e-6; t = 0; son = 0; }
      adimla(tt - son); son = tt; goster();
    });
    return { dur: z.dur };
  };

  Sekil.m342_ccn = function (kap) {
    const s = { S: 0.5, LWC: 1 };
    const sahne = sahneKur(kap);
    const yaz = okuma(kap, ['S', 'kara', 'deniz', 'R (kara / deniz)']);
    const Nk = (S) => 6e8 * S ** 0.5, Nd = (S) => 1e8 * S ** 0.7;
    const Rd = (N) => Math.cbrt(3 * s.LWC * 1e-3 / N / (4 * Math.PI * 1000));
    function ciz() {
      sahne.innerHTML = '';
      const d = grafik(sahne, { x: [0.05, 2], y: [10, 2000], xlog: true, ylog: true, xt: [0.05, 0.1, 0.2, 0.5, 1, 2], yt: [10, 30, 100, 300, 1000], xf: (v) => sy(v, v < 0.1 ? 2 : v < 1 ? 1 : 0), xe: 'aşırı doymuşluk S (%)', ye: 'aktif CCN (cm⁻³)', ad: 'Aktif CCN sayısı' });
      d.cizgi(d.ornek((S) => Nk(S) / 1e6, 0.05, 2, 60, true), { stroke: 'var(--tur)', 'stroke-width': 3.2 });
      d.cizgi(d.ornek((S) => Nd(S) / 1e6, 0.05, 2, 60, true), { stroke: 'var(--acc)', 'stroke-width': 3.2, 'stroke-dasharray': '8 5' });
      d.cizgi([[s.S, 10], [s.S, 2000]], { stroke: 'var(--ikincil)', 'stroke-dasharray': '3 4', 'stroke-width': 1.6 });
      d.nokta(d.x(s.S), d.y(Nk(s.S) / 1e6), { fill: 'var(--tur)' }); d.nokta(d.x(s.S), d.y(Nd(s.S) / 1e6), { fill: 'var(--acc)' });
      d.lejant(d.x(0.055), d.y(1500), [['var(--tur)', null, 'kara: N = 6×10⁸ S^0,5 m⁻³'], ['var(--acc)', '8 5', 'deniz: N = 10⁸ S^0,7 m⁻³']]);
      const nk = Nk(s.S), nd = Nd(s.S);
      yaz({ S: `%${sy(s.S, 2)}`, kara: `${sy(nk / 1e6, 0)} cm⁻³ · aralık ${sy(1000 / Math.cbrt(nk), 2)} mm`, deniz: `${sy(nd / 1e6, 0)} cm⁻³ · aralık ${sy(1000 / Math.cbrt(nd), 2)} mm`, 'R (kara / deniz)': `${sy(Rd(nk) * 1e6)} / ${sy(Rd(nd) * 1e6)} µm` });
    }
    kaydirici(kap, { ad: 'Aşırı doymuşluk', min: 0.05, max: 2, adim: 0.05, deger: s.S, bicim: (v) => `%${sy(v, 2)}` }, (v) => { s.S = v; ciz(); });
    kaydirici(kap, { ad: 'LWC', min: 0.2, max: 2, adim: 0.1, deger: s.LWC, bicim: (v) => `${sy(v)} g/m³` }, (v) => { s.LWC = v; ciz(); });
    ciz();
  };
  Sekil.m342_damlapay = function (kap, ayar = {}) {
    const adim = ayar.adim || 0, W = 560, H = 300;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Aynı su miktarı: çok küçük damla ya da az iri damla' });
    let tohum = 5; const rnd = () => (tohum = (tohum * 9301 + 49297) % 233280) / 233280;
    const kutu = (x0, ad, n, r, renk) => {
      svg.append(el('rect', { x: x0, y: 50, width: 250, height: 200, rx: 12, fill: 'var(--zemin)', stroke: 'var(--ikincil)' }));
      for (let i = 0; i < n; i++) svg.append(el('circle', { cx: x0 + 14 + rnd() * 222, cy: 64 + rnd() * 172, r, fill: renk, opacity: 0.8 }));
      yazi(svg, x0 + 125, 276, ad, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 600 });
    };
    if (adim === 0) { kutu(20, 'kara: 424 cm⁻³ → R ≈ 8,3 µm', 90, 3.2, 'var(--tur)'); kutu(290, 'deniz: 62 cm⁻³ → R ≈ 15,7 µm', 14, 6.2, 'var(--acc)'); yazi(svg, 20, 32, '1 · Aynı su (1 g/m³), farklı CCN sayısı', { 'font-size': 17, 'font-weight': 700 }); }
    else {
      kutu(20, 'kara: damlalar benzer ve küçük', 90, 3.2, 'var(--tur)');
      svg.append(el('rect', { x: 290, y: 50, width: 250, height: 200, rx: 12, fill: 'var(--zemin)', stroke: 'var(--ikincil)' }));
      for (let i = 0; i < 12; i++) svg.append(el('circle', { cx: 304 + rnd() * 222, cy: 64 + rnd() * 172, r: 5.5, fill: 'var(--acc)', opacity: 0.8 }));
      svg.append(el('circle', { cx: 415, cy: 120, r: 16, fill: 'var(--acc)' })); ok(svg, 415, 140, 415, 200, 'var(--acc)', 3);
      yazi(svg, 415, 276, 'deniz: iri damla düşer, toplar', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 600 });
      yazi(svg, 20, 32, '2 · İri damla çarpışma-birleşmeyi erken başlatır', { 'font-size': 17, 'font-weight': 700 });
    }
    kap.append(svg);
  };

  /* ======================= K7 · Difüzyon ve buz ======================= */
  const Df = (P, T) => 2.11e-5 * (101.3 / P) * (T / 273.15) ** 1.94;
  Sekil.m342_D = function (kap) {
    const d = grafik(kap, { x: [-40, 30], y: [1, 5], xt: [-40, -30, -20, -10, 0, 10, 20, 30], yt: [1, 2, 3, 4, 5], xe: 'T (°C)', ye: 'D (10⁻⁵ m² s⁻¹)', ad: 'Su buharı difüzivitesi' });
    const Pler = [[100, 'var(--yazi)', null], [80, 'var(--acc)', '8 4'], [60, 'var(--tur)', null], [40, 'var(--ikincil)', '3 4']];
    for (const [P, renk, k] of Pler) { const pts = d.ornek((t) => Df(P, t + 273.15) * 1e5, -40, 30, 80); d.cizgi(pts, { stroke: renk, 'stroke-dasharray': k, 'stroke-width': 2.8 }); d.yazi(d.x(30) - 6, d.y(pts[pts.length - 1][1]) - 7, `${P} kPa`, { 'text-anchor': 'end', 'font-size': 13, fill: renk, 'font-weight': 600 }); }
    d.nokta(d.x(-10), d.y(Df(100, 263.15) * 1e5)); d.yazi(d.x(-10) + 8, d.y(Df(100, 263.15) * 1e5) + 20, 'S34 (100 kPa)', { 'font-size': 13 });
    d.nokta(d.x(-11), d.y(Df(62, 262.15) * 1e5)); d.yazi(d.x(-11) - 8, d.y(Df(62, 262.15) * 1e5) - 9, 'S34 (62 kPa)', { 'font-size': 13, 'text-anchor': 'end' });
    const yaz = okuma(kap, ['T', 'D(100 kPa)', 'D(60 kPa)']);
    d.imlec((t) => yaz({ T: `${sy(t)} °C`, 'D(100 kPa)': `${bl(Df(100, t + 273.15))} m²/s`, 'D(60 kPa)': `${bl(Df(60, t + 273.15))} m²/s` }));
    yaz({ T: 'gezdir', 'D(100 kPa)': '—', 'D(60 kPa)': '—' });
  };

  Sekil.m342_aki = function (kap) {
    let dS = 1;
    const sahne = sahneKur(kap);
    const yaz = okuma(kap, ['ΔS/Δx', 'Δr/Δx', 'F', 'F_din']);
    function ciz() {
      sahne.innerHTML = '';
      const W = 560, H = 270;
      const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Damla çevresinde buhar akısı' });
      svg.append(el('path', { d: 'M0,20 A120,120 0 0 1 0,260', fill: 'var(--acc-zemin)', stroke: 'var(--acc)', 'stroke-width': 3 }));
      yazi(svg, 12, 145, 'damla', { 'font-weight': 700, fill: 'var(--acc)', stroke: 'var(--acc-zemin)' });
      let tohum = 3; const rnd = () => (tohum = (tohum * 9301 + 49297) % 233280) / 233280;
      for (let i = 0; i < 120; i++) { const u = rnd(), x = 130 + u * 400; if (rnd() > 0.25 + 0.75 * u) continue; svg.append(el('circle', { cx: x, cy: 30 + rnd() * 200, r: 3, fill: 'var(--ikincil)', opacity: 0.7 })); }
      for (const yy of [80, 140, 200]) ok(svg, 470, yy, 150, yy, 'var(--tur)', 2 + dS, 12 + 2 * dS);
      yazi(svg, 300, 32, 'buhar azdır  ←  buhar çoktur', { 'text-anchor': 'middle', 'font-size': 14, fill: 'var(--ikincil)' });
      yazi(svg, 310, 258, 'F = −D Δr/Δx  (eksi: çoktan aza, damlaya doğru)', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 600 });
      sahne.append(svg);
      const g = dS / 100 / 2e-6, drdx = 0.0015 * g, F = -2e-5 * drdx;
      yaz({ 'ΔS/Δx': `${sy(g, 0)} m⁻¹`, 'Δr/Δx': `${sy(drdx, 2)} (kg/kg)/m`, F: `${bl(F)} (kg/kg)(m/s)`, F_din: `${bl(0.82 * F)} kg m⁻² s⁻¹` });
    }
    kaydirici(kap, { ad: 'ΔS (2 µm boyunca)', min: 0.2, max: 2, adim: 0.1, deger: dS, bicim: (v) => `%${sy(v)}` }, (v) => { dS = v; ciz(); });
    ciz();
  };

  /* R(t): difüzyon (S36 sabitleri) ve çarpışma-birleşme (E = 0,8, LWC = 1 g/m³, 20 µm'den) */
  function carpismaR(tSn, R0 = 20e-6, E = 0.8, LWC = 1e-3) {
    const a1 = E * LWC * 1.19e8 / 4000, a2 = E * LWC * 8e3 / 4000, a3 = E * LWC * 220 / 8000;
    let t = tSn;
    const t1 = (1 / R0 - 1 / 40e-6) / a1;
    if (t <= t1) return 1 / (1 / R0 - a1 * t);
    t -= t1; const t2 = Math.log(600 / 40) / a2;
    if (t <= t2) return 40e-6 * Math.exp(a2 * t);
    t -= t2; const r = Math.sqrt(0.6e-3) + a3 * t; return r * r;
  }
  const difK = (S) => 2 * Df(90, 283.15) * S * esw(283.15) * 1000 / (RV * 283.15) / 1000;
  Sekil.m342_buyume = function (kap) {
    let S = 0.5;
    const sahne = sahneKur(kap);
    const yaz = okuma(kap, ['t', 'difüzyon', 'çarpışma']);
    function ciz() {
      sahne.innerHTML = '';
      const k = difK(S / 100);
      const d = grafik(sahne, { x: [0, 60], y: [1, 2000], ylog: true, xt: [0, 10, 20, 30, 40, 50, 60], yt: [1, 10, 100, 1000], xe: 't (dk)', ye: 'R (µm)', ad: 'Difüzyonla ve çarpışmayla büyüme' });
      d.cizgi(d.ornek((tm) => Math.sqrt(1e-12 + k * tm * 60) * 1e6, 0, 60, 200), { stroke: 'var(--acc)', 'stroke-width': 3.2 });
      d.cizgi(d.ornek((tm) => carpismaR(tm * 60) * 1e6, 0, 60, 300), { stroke: 'var(--tur)', 'stroke-width': 3.2, 'stroke-dasharray': '9 5' });
      d.cizgi([[0, 1000], [60, 1000]], { stroke: 'var(--ikincil)', 'stroke-dasharray': '2 4', 'stroke-width': 1.4 });
      d.yazi(d.x(1), d.y(1000) - 7, 'yağmur damlası ≈ 1 mm', { 'font-size': 13, fill: 'var(--ikincil)' });
      d.lejant(d.x(26), d.y(4.5), [['var(--acc)', null, `difüzyon (S = %${sy(S, 1)}): R ∝ √t`], ['var(--tur)', '9 5', 'çarpışma-birleşme (20 µm\'den)']]);
      d.imlec((tm) => yaz({ t: `${sy(tm)} dk`, 'difüzyon': `${sy(Math.sqrt(1e-12 + k * tm * 60) * 1e6)} µm`, 'çarpışma': `${sy(carpismaR(tm * 60) * 1e6, 0)} µm` }));
      yaz({ t: 'gezdir', 'difüzyon': '—', 'çarpışma': '—' });
    }
    kaydirici(kap, { ad: 'Aşırı doymuşluk', min: 0.1, max: 1, adim: 0.05, deger: S, bicim: (v) => `%${sy(v, 2)}` }, (v) => { S = v; ciz(); });
    ciz();
  };
  Anim.m342_damla = function (kap) {
    const W = 560, H = 300, k = difK(0.005);
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Difüzyonla büyüyen damla' }); kap.append(svg);
    const olc = 9; // 1 µm = 9 px
    svg.append(el('line', { x1: 40, x2: 40 + 10 * olc, y1: 270, y2: 270, stroke: 'var(--yazi)', 'stroke-width': 3 }));
    yazi(svg, 40, 260, '10 µm', { 'font-size': 13 });
    const halka = el('circle', { cx: 170, cy: 140, fill: 'none', stroke: 'var(--ikincil)', 'stroke-dasharray': '4 4' });
    const dm = el('circle', { cx: 170, cy: 140, fill: 'var(--acc-zemin)', stroke: 'var(--acc)', 'stroke-width': 3 }); svg.append(halka, dm);
    for (const a of [0, 1, 2, 3, 4, 5, 6, 7]) { const x = 170 + Math.cos(a * Math.PI / 4) * 128, y = 140 + Math.sin(a * Math.PI / 4) * 118; ok(svg, x, y, 170 + Math.cos(a * Math.PI / 4) * 104, 140 + Math.sin(a * Math.PI / 4) * 96, 'var(--tur)', 2, 8); }
    const t1 = yazi(svg, 330, 70, '', { 'font-size': 18, 'font-weight': 700 }), t2 = yazi(svg, 330, 104, '', { 'font-size': 15 }), t3 = yazi(svg, 330, 134, '', { 'font-size': 15 });
    yazi(svg, 330, 190, 'R² = R₀² + (2DΔρᵥ/ρ_L)·t', { 'font-size': 15, fill: 'var(--acc)', 'font-weight': 600 });
    yazi(svg, 330, 218, 'büyüdükçe yavaşlar: dR/dt ∝ 1/R', { 'font-size': 14, fill: 'var(--ikincil)' });
    const z = zamanli(kap, { t0: 0, t1: 170, hiz: 12, ad: 'zaman (s)' }, (t) => {
      const R = Math.sqrt(1e-12 + k * t) * 1e6;
      dm.setAttribute('r', Math.max(2, R * olc / 2)); halka.setAttribute('r', 10 * olc / 2);
      t1.textContent = `t = ${sy(t, 0)} s → R = ${sy(R)} µm`;
      t2.textContent = `dR/dt = ${sy(k / 2 / (R * 1e-6) * 1e6, 3)} µm/s`;
      t3.textContent = R < 10 ? `10 µm'ye ${sy((1e-10 - 1e-12) / k, 0)} s` : '10 µm aşıldı (≈ 41 s)';
    });
    yazi(svg, 92, 240, 'kesikli halka = 10 µm', { 'font-size': 13, fill: 'var(--ikincil)' });
    return { dur: z.dur };
  };

  Sekil.m342_bergeron = function (kap) {
    const d = grafik(kap, { x: [-40, 0], y: [0, 32], xt: [-40, -30, -20, -10, 0], yt: [0, 10, 20, 30], xe: 'T (°C)', ye: 'eₛ(su) − eₛ(buz) (Pa)', ad: 'Bergeron: su ve buz üzerindeki doyma farkı' });
    const f = (t) => (esw(t + 273.15) - esi(t + 273.15)) * 1000;
    d.alan([[-16, 0], ...d.ornek(f, -16, -12, 20), [-12, 0]], { fill: 'var(--tur)', opacity: 0.18 });
    d.cizgi(d.ornek(f, -40, 0, 200), { stroke: 'var(--tur)', 'stroke-width': 3.2 });
    const tm = -12.34; d.nokta(d.x(tm), d.y(f(tm)), { fill: 'var(--tur)', r: 7 });
    d.yazi(d.x(tm) + 10, d.y(f(tm)) - 10, `en büyük ≈ −12,3 °C · ${sy(f(tm))} Pa`, { 'font-size': 14, 'font-weight': 700 });
    d.nokta(d.x(-14), d.y(f(-14))); d.yazi(d.x(-14) - 10, d.y(f(-14)) + 24, 'S37: −14 °C', { 'font-size': 13, 'text-anchor': 'end' });
    d.yazi(d.x(-15.5), d.y(3), 'dendrit bandı', { 'font-size': 13, fill: 'var(--tur)', 'text-anchor': 'middle' });
    const yaz = okuma(kap, ['T', 'eₛ(su)', 'eₛ(buz)', 'S_buz']);
    d.imlec((t) => { const T = t + 273.15; yaz({ T: `${sy(t)} °C`, 'eₛ(su)': `${sy(esw(T), 3)} kPa`, 'eₛ(buz)': `${sy(esi(T), 3)} kPa`, S_buz: `%${sy((esw(T) / esi(T) - 1) * 100)}` }); });
    yaz({ T: 'gezdir', 'eₛ(su)': '—', 'eₛ(buz)': '—', S_buz: '—' });
  };
  Anim.m342_bergeron = function (kap) {
    const W = 560, H = 320;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Buz kristali damlaların pahasına büyüyor' }); kap.append(svg);
    const cx = 280, cy = 165;
    const damla = [], ok_ = [];
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.39, x = cx + Math.cos(a) * 190, y = cy + Math.sin(a) * 118; damla.push(el('circle', { cx: x, cy: y, fill: 'var(--acc-zemin)', stroke: 'var(--acc)', 'stroke-width': 2.4 })); const o = el('g', {}); ok(o, cx + Math.cos(a) * 150, cy + Math.sin(a) * 92, cx + Math.cos(a) * 80, cy + Math.sin(a) * 50, 'var(--tur)', 2, 9); ok_.push(o); }
    svg.append(...ok_, ...damla);
    const kris = el('g', { stroke: 'var(--ikincil)', 'stroke-width': 3, 'stroke-linecap': 'round' }); svg.append(kris);
    const t1 = yazi(svg, 20, 30, '', { 'font-size': 15, 'font-weight': 700 });
    yazi(svg, 20, 306, 'su için RH %100 · buz için RH ≈ %115 (−14 °C)', { 'font-size': 14, fill: 'var(--ikincil)' });
    const z = zamanli(kap, { t0: 0, t1: 1, hiz: 0.1, ad: 'zaman' }, (t) => {
      damla.forEach((c) => c.setAttribute('r', 22 * Math.cbrt(Math.max(0.02, 1 - t))));
      ok_.forEach((o) => o.setAttribute('opacity', t < 0.98 ? 1 : 0.25));
      const L = 14 + 52 * Math.sqrt(t);
      kris.innerHTML = '';
      for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3, x2 = cx + Math.cos(a) * L, y2 = cy + Math.sin(a) * L; kris.append(el('line', { x1: cx, y1: cy, x2, y2 })); for (const f of [0.45, 0.75]) { const bx = cx + Math.cos(a) * L * f, by = cy + Math.sin(a) * L * f, l = L * 0.22; kris.append(el('line', { x1: bx, y1: by, x2: bx + Math.cos(a + 0.8) * l, y2: by + Math.sin(a + 0.8) * l })); kris.append(el('line', { x1: bx, y1: by, x2: bx + Math.cos(a - 0.8) * l, y2: by + Math.sin(a - 0.8) * l })); } }
      t1.textContent = t < 0.98 ? 'damlalar buharlaşıyor → buhar kristale akıyor' : 'damlalar bitti: kristal düşer → kar / soğuk yağmur';
    });
    return { dur: z.dur };
  };

  Sekil.m342_donma = function (kap) {
    const Tf = (R) => 235 + 3 * Math.log(R / 5) - 273.15;
    const d = grafik(kap, { x: [1, 3000], y: [-45, 5], xlog: true, xt: [1, 10, 100, 1000], yt: [-40, -30, -20, -10, 0], xe: 'damla yarıçapı R (µm)', ye: 'donma T (°C)', ad: 'Damla boyuna göre donma sıcaklığı' });
    d.cizgi([[1, 0], [3000, 0]], { stroke: 'var(--acc)', 'stroke-width': 1.6, 'stroke-dasharray': '6 4' });
    d.yazi(d.x(1.2), d.y(0) - 7, '0 °C (erime noktası)', { 'font-size': 13, fill: 'var(--acc)' });
    d.cizgi([[1, -38], [3000, -38]], { stroke: 'var(--ikincil)', 'stroke-width': 1.6, 'stroke-dasharray': '3 4' });
    d.yazi(d.x(150), d.y(-38) + 20, '≈ −38 °C: homojen donma, hepsi buz', { 'font-size': 13, fill: 'var(--ikincil)' });
    d.cizgi(d.ornek(Tf, 1, 3000, 120, true), { stroke: 'var(--tur)', 'stroke-width': 3.2 });
    for (const R of [5, 100, 1000]) { d.nokta(d.x(R), d.y(Tf(R))); d.yazi(d.x(R) - 8, d.y(Tf(R)) - 10, `${R} µm: ${sy(Tf(R), 0)} °C`, { 'font-size': 13, 'text-anchor': 'end' }); }
    const yaz = okuma(kap, ['R', 'yarısının donduğu T']);
    d.imlec((R) => yaz({ R: `${sy(R, R < 10 ? 1 : 0)} µm`, 'yarısının donduğu T': `${sy(Tf(R))} °C (${sy(Tf(R) + 273.15)} K)` }));
    yaz({ R: 'gezdir', 'yarısının donduğu T': '—' });
  };

  Sekil.m342_buzkutle = function (kap) {
    let Sb = 0.157;
    const sahne = sahneKur(kap);
    const yaz = okuma(kap, ['t', 'm (3-D)', 'm (2-D)', 'oran']);
    const rv = 200 / (461.5 * 259), ri = 916.8, Dd = 1.5e-5;
    const m3 = (t) => 11.85 * Math.sqrt(rv ** 3 / ri) * (Dd * Sb * t) ** 1.5, m2 = (t) => 5.09 / 15e-6 * (rv ** 2 / ri) * (Dd * Sb * t) ** 2;
    function ciz() {
      sahne.innerHTML = '';
      const d = grafik(sahne, { x: [0, 2], y: [1e-10, 1e-6], ylog: true, xt: [0, 0.5, 1, 1.5, 2], yt: [1e-10, 1e-9, 1e-8, 1e-7, 1e-6], xf: (v) => sy(v, 1), yf: (v) => `10${ustS(Math.round(Math.log10(v)))}`, xe: 't (saat)', ye: 'kristal kütlesi (kg)', ad: 'Buz kristali kütlesinin zamanla artışı' });
      d.cizgi(d.ornek((h) => m3(h * 3600), 0.02, 2, 120), { stroke: 'var(--acc)', 'stroke-width': 3.2 });
      d.cizgi(d.ornek((h) => m2(h * 3600), 0.02, 2, 120), { stroke: 'var(--tur)', 'stroke-width': 3.2, 'stroke-dasharray': '9 5' });
      for (const h of [1, 2]) { d.nokta(d.x(h), d.y(m3(h * 3600)), { fill: 'var(--acc)' }); d.nokta(d.x(h), d.y(m2(h * 3600)), { fill: 'var(--tur)' }); }
      d.lejant(d.x(0.85), d.y(2e-10), [['var(--acc)', null, '3-B kristal: m ∝ t^1,5'], ['var(--tur)', '9 5', '2-B levha (15 µm): m ∝ t²']]);
      const oz = (h) => ({ t: `${sy(h, 2)} sa`, 'm (3-D)': `${bl(m3(h * 3600))} kg`, 'm (2-D)': `${bl(m2(h * 3600))} kg`, oran: sy(m2(h * 3600) / m3(h * 3600), 2) });
      yaz(oz(1));
      d.imlec((h) => yaz(oz(Math.max(0.02, h))));
    }
    kaydirici(kap, { ad: 'S_buz', min: 0.05, max: 0.25, adim: 0.001, deger: Sb, bicim: (v) => sy(v, 3) }, (v) => { Sb = v; ciz(); });
    ciz();
  };

  /* ======================= K8 · Yağış ve radar ======================= */
  const wT = (R) => (R < 40e-6 ? 1.19e8 * R * R : R < 0.6e-3 ? 8e3 * R : 220 * Math.sqrt(R));
  Sekil.m342_limit = function (kap) {
    const d = grafik(kap, { x: [1, 3000], y: [1e-4, 20], xlog: true, ylog: true, xt: [1, 10, 100, 1000], yt: [1e-4, 1e-3, 0.01, 0.1, 1, 10], yf: (v) => (v < 0.01 ? `10${ustS(Math.round(Math.log10(v)))}` : sy(v, v < 1 ? (v < 0.1 ? 2 : 1) : 0)), xe: 'yarıçap R (µm)', ye: 'limit hız w_T (m/s)', ad: 'Limit hız: üç rejim' });
    d.alan([[40, 1e-4], [40, 20], [600, 20], [600, 1e-4]], { fill: 'var(--acc)', opacity: 0.08 });
    for (const R of [40, 600]) d.cizgi([[R, 1e-4], [R, 20]], { stroke: 'var(--ikincil)', 'stroke-dasharray': '3 4', 'stroke-width': 1.4 });
    d.cizgi(d.ornek((R) => wT(R * 1e-6), 1, 39.99, 60, true), { stroke: 'var(--tur)', 'stroke-width': 3.2 });
    d.cizgi(d.ornek((R) => wT(R * 1e-6), 40, 599.9, 60, true), { stroke: 'var(--tur)', 'stroke-width': 3.2 });
    d.cizgi(d.ornek((R) => wT(R * 1e-6), 600, 3000, 40, true), { stroke: 'var(--tur)', 'stroke-width': 3.2 });
    d.yazi(d.x(2), d.y(0.03), 'k₁R² (Stokes)', { 'font-size': 14, 'font-weight': 600 });
    d.yazi(d.x(60), d.y(5e-3), 'k₂R', { 'font-size': 14, 'font-weight': 600 });
    d.yazi(d.x(700), d.y(0.4), 'k₃√R', { 'font-size': 14, 'font-weight': 600 });
    for (const R of [10, 100, 1000]) { const w = wT(R * 1e-6); d.nokta(d.x(R), d.y(w)); d.yazi(d.x(R) + 9, d.y(w) + 18, `${sy(w, w < 0.1 ? 3 : 1)} m/s`, { 'font-size': 13 }); }
    const yaz = okuma(kap, ['R', 'w_T', '1 km düşüş']);
    const sure = (s) => (s > 7200 ? `${sy(s / 3600)} saat` : s > 120 ? `${sy(s / 60)} dk` : `${sy(s, 0)} s`);
    d.imlec((R) => { const w = wT(R * 1e-6); yaz({ R: `${sy(R, R < 10 ? 1 : 0)} µm`, w_T: `${sy(w, w < 0.1 ? 4 : 2)} m/s`, '1 km düşüş': sure(1000 / w) }); });
    yaz({ R: 'gezdir', w_T: '—', '1 km düşüş': '—' });
  };
  Anim.m342_dusus = function (kap) {
    const W = 560, H = 330, ust = 50, alt = 300;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Üç damlanın 1 km düşüş yarışı' }); kap.append(svg);
    svg.append(el('rect', { x: 20, y: 18, width: 520, height: ust - 18, rx: 8, fill: 'var(--zemin)', stroke: 'var(--ikincil)' }));
    yazi(svg, 30, 40, 'bulut tabanı (1 km)', { 'font-size': 13, fill: 'var(--ikincil)' });
    svg.append(el('rect', { x: 20, y: alt, width: 520, height: 14, fill: 'var(--cizgi)', stroke: 'var(--ikincil)' }));
    const dl = [[10e-6, 120, '10 µm'], [100e-6, 280, '100 µm'], [1e-3, 440, '1 mm']].map(([R, x, ad]) => { const c = el('circle', { cx: x, r: R > 5e-4 ? 10 : R > 5e-5 ? 6 : 3.5, fill: 'var(--acc)' }); const t = yazi(svg, x + 16, 0, '', { 'font-size': 13, 'font-weight': 600 }); yazi(svg, x, 328, ad, { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700 }); svg.append(c); return { R, c, t, w: wT(R) }; });
    const saat = yazi(svg, 540, 40, '', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' });
    const z = zamanli(kap, { t0: 0, t1: 1500, hiz: 120, ad: 'zaman (s)' }, (t) => {
      for (const o of dl) { const s = Math.min(1000, o.w * t), yy = ust + s / 1000 * (alt - ust - 10); o.c.setAttribute('cy', yy); o.t.setAttribute('y', yy + 5); o.t.textContent = s >= 1000 ? `yerde (${sy(1000 / o.w / 60)} dk)` : `${sy(s, 0)} m`; }
      saat.textContent = `t = ${sy(t / 60)} dk`;
    });
    return { dur: z.dur };
  };
  Anim.m342_toplayici = function (kap) {
    const W = 560, H = 330, a = 0.8e-3 * 8e3 / 4000;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Toplayıcı damla küçük damlaları toplayarak büyüyor' }); kap.append(svg);
    svg.append(el('rect', { x: 20, y: 14, width: 300, height: 302, rx: 12, fill: 'var(--zemin)', stroke: 'var(--ikincil)' }));
    let tohum = 9; const rnd = () => (tohum = (tohum * 9301 + 49297) % 233280) / 233280;
    const kucuk = []; for (let i = 0; i < 70; i++) { const c = el('circle', { r: 2.6, fill: 'var(--ikincil)' }); svg.append(c); kucuk.push({ c, x: 30 + rnd() * 280, y0: rnd() * 1 }); }
    const buyuk = el('circle', { cx: 170, cy: 230, fill: 'var(--acc)', stroke: 'var(--yuzey)', 'stroke-width': 2 }); svg.append(buyuk);
    const t1 = yazi(svg, 340, 60, '', { 'font-size': 17, 'font-weight': 700 }), t2 = yazi(svg, 340, 92, '', { 'font-size': 15 }), t3 = yazi(svg, 340, 122, '', { 'font-size': 15 });
    yazi(svg, 340, 180, 'dR/dt = E·LWC·w_T / (4ρ_L)', { 'font-size': 14, fill: 'var(--acc)', 'font-weight': 600 });
    yazi(svg, 340, 206, 'w_T = k₂R → üstel büyüme', { 'font-size': 14, fill: 'var(--ikincil)' });
    yazi(svg, 340, 232, 'E = 0,8 · LWC = 1 g/m³', { 'font-size': 14, fill: 'var(--ikincil)' });
    const z = zamanli(kap, { t0: 0, t1: 1120, hiz: 75, ad: 'zaman (s)' }, (t) => {
      const R = 100e-6 * Math.exp(a * t), rp = 6 + (R - 100e-6) / 500e-6 * 34;
      buyuk.setAttribute('r', rp);
      for (const k of kucuk) {
        const yy = 300 - ((k.y0 * 300 + t * 0.9) % 300);
        const ic = Math.abs(k.x - 170) < rp && yy > 230 - rp && yy < 300;
        k.c.setAttribute('cx', k.x); k.c.setAttribute('cy', yy + 14); k.c.setAttribute('opacity', ic && yy > 230 ? 0 : 0.8);
      }
      t1.textContent = `t = ${sy(t / 60)} dk`;
      t2.textContent = `R = ${sy(R * 1e6, 0)} µm`;
      t3.textContent = `w_T = k₂R = ${sy(8e3 * R, 2)} m/s`;
    });
    return { dur: z.dur };
  };

  Sekil.m342_dbz = function (kap) {
    let dbz = 43;
    const sahne = sahneKur(kap);
    const yaz = okuma(kap, ['dBZ', 'Z', 'RR', 'şiddet']);
    const RR = (d) => 0.036 * 10 ** (0.0625 * d);
    const siddet = (r, d) => (d >= 55 ? 'çok kuvvetli, dolu olası' : r > 7.6 ? 'kuvvetli' : r >= 2.5 ? 'orta' : 'hafif');
    function ciz() {
      sahne.innerHTML = '';
      const d = grafik(sahne, { x: [0, 65], y: [0.03, 1000], ylog: true, xt: [0, 10, 20, 30, 40, 50, 60], yt: [0.1, 1, 10, 100, 1000], yf: (v) => sy(v, v < 1 ? 1 : 0), xe: 'yansıma (dBZ)', ye: 'yağış hızı RR (mm/h)', ad: 'dBZ ile yağış hızı' });
      for (const [a, b, op] of [[0, 2.5, 0.05], [2.5, 7.6, 0.11], [7.6, 98.6, 0.18], [98.6, 1000, 0.28]]) d.alan([[0, a], [65, a], [65, b], [0, b]], { fill: 'var(--tur)', opacity: op });
      d.cizgi(d.ornek(RR, 0, 65, 100), { stroke: 'var(--acc)', 'stroke-width': 3.2 });
      for (const v of [30, 43, 55]) { d.nokta(d.x(v), d.y(RR(v))); d.yazi(d.x(v) - 8, d.y(RR(v)) - 10, `${v} dBZ: ${sy(RR(v), 1)}`, { 'font-size': 13, 'text-anchor': 'end' }); }
      d.nokta(d.x(dbz), d.y(RR(dbz)), { fill: 'var(--tur)', r: 8 });
      d.yazi(d.x(64), d.y(0.06), '+16 dBZ ≈ yağış × 10', { 'text-anchor': 'end', 'font-size': 14, 'font-weight': 600 });
      const r = RR(dbz);
      yaz({ dBZ: `${sy(dbz, 0)}`, Z: `${bl(10 ** (dbz / 10))} mm⁶ m⁻³`, RR: `${sy(r, r < 1 ? 2 : 1)} mm/h`, 'şiddet': siddet(r, dbz) });
    }
    kaydirici(kap, { ad: 'Yansıma', min: 0, max: 65, adim: 1, deger: dbz, bicim: (v) => `${v} dBZ` }, (v) => { dbz = v; ciz(); });
    ciz();
  };

  Sekil.m342_mp = function (kap) {
    let lr = 1;
    const sahne = sahneKur(kap);
    const yaz = okuma(kap, ['RR', 'Λ', 'N_T', 'D₀', 'Z']);
    const Lam = (r) => 4.1 * r ** -0.21;
    function ciz() {
      sahne.innerHTML = '';
      const rr = 10 ** lr, L = Lam(rr);
      const d = grafik(sahne, { x: [0, 6], y: [0.1, 1e4], ylog: true, xt: [0, 1, 2, 3, 4, 5, 6], yt: [0.1, 1, 10, 100, 1000, 10000], yf: (v) => sy(v, v < 1 ? 1 : 0), xe: 'damla çapı D (mm)', ye: 'N(D) (m⁻³ mm⁻¹)', ad: 'Marshall–Palmer damla boy dağılımı' });
      for (const [r, k] of [[1, '2 4'], [10, '6 4'], [50, '10 4']]) d.cizgi(d.ornek((D) => 8000 * Math.exp(-Lam(r) * D), 0, 6, 30), { stroke: 'var(--ikincil)', 'stroke-dasharray': k, 'stroke-width': 1.5, opacity: 0.8 });
      for (const [r, D] of [[1, 2.4], [10, 3.5], [50, 4.6]]) d.yazi(d.x(D) + 4, d.y(8000 * Math.exp(-Lam(r) * D)) - 6, `${r} mm/h`, { 'font-size': 12, fill: 'var(--ikincil)' });
      d.cizgi(d.ornek((D) => 8000 * Math.exp(-L * D), 0, 6, 60), { stroke: 'var(--tur)', 'stroke-width': 3.6 });
      const D0 = 3.67 / L;
      d.cizgi([[D0, 0.1], [D0, 1e4]], { stroke: 'var(--acc)', 'stroke-dasharray': '4 4', 'stroke-width': 2 });
      d.yazi(d.x(D0) + 6, d.y(0.25), `D₀ = ${sy(D0, 2)} mm`, { 'font-size': 14, fill: 'var(--acc)', 'font-weight': 700 });
      d.yazi(d.x(0.1), d.y(8000) + 22, 'N₀ = 8000 (hep aynı)', { 'font-size': 13 });
      const Z = 720 * 8000 / L ** 7;
      yaz({ RR: `${sy(rr, rr < 10 ? 1 : 0)} mm/h`, 'Λ': `${sy(L, 2)} mm⁻¹`, N_T: `${sy(8000 / L, 0)} m⁻³`, 'D₀': `${sy(D0, 2)} mm`, Z: `${sy(10 * Math.log10(Z), 1)} dBZ (6!·N₀/Λ⁷)` });
    }
    kaydirici(kap, { ad: 'Yağış hızı (log)', min: 0, max: 2, adim: 0.02, deger: lr, bicim: (v) => `${sy(10 ** v, 10 ** v < 10 ? 1 : 0)} mm/h` }, (v) => { lr = v; ciz(); });
    ciz();
  };

  Sekil.m342_subutce = function (kap) {
    const s = { u: 0.7, a: 0.5 };
    const sahne = sahneKur(kap);
    const yaz = okuma(kap, ['ΔP_r', 'Δr_T/Δt', 'yorum']);
    function ciz() {
      sahne.innerHTML = '';
      const W = 560, H = 290;
      const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Katmanın su bütçesi' });
      svg.append(el('rect', { x: 120, y: 80, width: 320, height: 140, fill: 'var(--acc-zemin)', stroke: 'var(--acc)', 'stroke-width': 2 }));
      yazi(svg, 280, 145, 'katman Δz = 250 m', { 'text-anchor': 'middle', 'font-weight': 600, stroke: 'var(--acc-zemin)' });
      yazi(svg, 280, 168, 'ρ_d = 1 kg/m³', { 'text-anchor': 'middle', 'font-size': 14, fill: 'var(--ikincil)', stroke: 'var(--acc-zemin)' });
      bulutCiz(svg, 280, 40, 1.2);
      ok(svg, 280, 56, 280, 78, 'var(--acc)', 3 + 4 * s.u, 12 + 4 * s.u); yazi(svg, 300, 72, `P_üst = ${sy(s.u, 2)} cm/h`, { 'font-weight': 700, fill: 'var(--acc)' });
      ok(svg, 280, 222, 280, 268, 'var(--acc)', 3 + 4 * s.a, 12 + 4 * s.a); yazi(svg, 300, 262, `P_alt = ${sy(s.a, 2)} cm/h`, { 'font-weight': 700, fill: 'var(--acc)' });
      sahne.append(svg);
      const dP = (s.u - s.a) / 100 / 3600, r = 1000 * dP / 250;
      yaz({ 'ΔP_r': `${bl(dP)} m/s`, 'Δr_T/Δt': `${sy(r * 1000 * 3600, 2)} g kg⁻¹ h⁻¹`, yorum: r > 0 ? 'giren > çıkan: yağmur katmanda buharlaşıyor (nemlenir, soğur)' : r < 0 ? 'çıkan > giren: katman suyunu yağışa veriyor' : 'denge' });
    }
    kaydirici(kap, { ad: 'Üstten giren', min: 0, max: 2, adim: 0.05, deger: s.u, bicim: (v) => `${sy(v, 2)} cm/h` }, (v) => { s.u = v; ciz(); });
    kaydirici(kap, { ad: 'Alttan çıkan', min: 0, max: 2, adim: 0.05, deger: s.a, bicim: (v) => `${sy(v, 2)} cm/h` }, (v) => { s.a = v; ciz(); });
    ciz();
  };

  Sekil.m342_yagis = function (kap, ayar = {}) {
    const adim = ayar.adim || 0, W = 560, H = 340;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Sıcak ve soğuk yağmur süreçleri' });
    const y0 = 150; // 0 °C seviyesi
    svg.append(el('path', { d: 'M60,300 L60,120 Q90,40 170,60 Q230,10 300,50 Q380,20 420,80 Q500,90 500,150 L500,300', fill: 'var(--zemin)', stroke: 'var(--ikincil)', 'stroke-width': 2 }));
    svg.append(el('line', { x1: 40, x2: 520, y1: y0, y2: y0, stroke: 'var(--acc)', 'stroke-dasharray': '6 5', 'stroke-width': 1.8 }));
    yazi(svg, 515, y0 - 7, '0 °C', { 'font-size': 13, fill: 'var(--acc)', 'text-anchor': 'end', 'font-weight': 700 });
    svg.append(el('rect', { x: 30, y: 318, width: 500, height: 12, fill: 'var(--cizgi)' }));
    let tohum = 4; const rnd = () => (tohum = (tohum * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 40; i++) svg.append(el('circle', { cx: 75 + rnd() * 410, cy: 165 + rnd() * 125, r: 2.2, fill: 'var(--acc)', opacity: 0.7 }));
    const yildiz = (x, y, L) => { const g = el('g', { stroke: 'var(--ikincil)', 'stroke-width': 2.4, 'stroke-linecap': 'round' }); for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; g.append(el('line', { x1: x - Math.cos(a) * L, y1: y - Math.sin(a) * L, x2: x + Math.cos(a) * L, y2: y + Math.sin(a) * L })); } svg.append(g); };
    const not = (i, m) => yazi(svg, 20, 28 + i * 0, m, { 'font-size': 16, 'font-weight': 700 });
    if (adim === 0) not(0, '1 · CCN üstünde milyonlarca bulut damlası (≈ 10 µm)');
    if (adim >= 1) { svg.append(el('circle', { cx: 150, cy: 230, r: 9, fill: 'var(--acc)' })); ok(svg, 150, 243, 150, 312, 'var(--acc)', 3); yazi(svg, 70, 214, 'sıcak yol: çarpışma-birleşme', { 'font-size': 14, 'font-weight': 600, fill: 'var(--acc)' }); if (adim === 1) not(0, '2 · Sıcak yağmur: iri damla düşer, küçükleri toplar'); }
    if (adim >= 2) { for (const [x, y] of [[330, 95], [380, 120], [300, 125]]) yildiz(x, y, 10); for (let i = 0; i < 6; i++) svg.append(el('circle', { cx: 290 + i * 22, cy: 72 + (i % 2) * 12, r: 2.2, fill: 'var(--acc)', opacity: 0.7 })); yazi(svg, 320, 70, 'Bergeron: buz büyür', { 'font-size': 14, 'font-weight': 600, fill: 'var(--tur)' }); if (adim === 2) not(0, '3 · Soğuk bulut: kristal damlaların pahasına büyür'); }
    if (adim >= 3) { yildiz(380, 175, 14); ok(svg, 380, 195, 380, 250, 'var(--tur)', 3); svg.append(el('circle', { cx: 380, cy: 268, r: 8, fill: 'var(--acc)' })); ok(svg, 380, 280, 380, 312, 'var(--acc)', 3); yazi(svg, 395, 230, 'kar düşer, erir', { 'font-size': 14, 'font-weight': 600 }); yazi(svg, 395, 250, '→ soğuk yağmur', { 'font-size': 14, 'font-weight': 600 }); not(0, '4 · Kar tanesi 0 °C altına inince erir: yağmur'); }
    kap.append(svg);
  };
})();
