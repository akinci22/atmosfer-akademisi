/* MTO316 Hidrometeoroloji — kitaba özel çizimler ve animasyonlar. Yalnız bu kitabın ajanı düzenler.
   Sekil.m316_<ad>(kap, ayar) → kap'ın içini kurar · Anim.m316_<ad>(kap, ayar) → { dur() } döndürür.
   Renkler CSS değişkeniyle (açık/koyu tema), dış görsel yok; sayılar kitaptaki hesap_dogrula.py ile aynı. */
(function () {
  const Sekil = window.Sekil, Anim = window.Anim;
  if (!Sekil || !Anim) return;
  const NS = 'http://www.w3.org/2000/svg', F = 'Inter,sans-serif';
  const el = (ad, o = {}, ic) => { const e = document.createElementNS(NS, ad); for (const [a, v] of Object.entries(o)) if (v !== undefined && v !== null) e.setAttribute(a, v); if (ic != null) e.textContent = ic; return e; };
  const tr = (v, d = 1) => (Math.round(v * 10 ** d) / 10 ** d).toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const yaz = (g, x, y, s, o = {}) => { const t = el('text', { x, y, 'font-family': F, 'font-size': o.k || 14, fill: o.r || 'var(--yazi)', 'font-weight': o.b ? 700 : 500, 'text-anchor': o.h || 'start', opacity: o.op }, s); g.append(t); return t; };
  const svgYap = (kap, W, H, ad) => { const s = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': ad }); kap.append(s); return s; };
  const yol = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${(+p[0]).toFixed(1)},${(+p[1]).toFixed(1)}`).join('');
  const sinir = (v, a, b) => Math.max(a, Math.min(b, v));
  const svgNokta = (svg, ev) => { const m = svg.getScreenCTM(); if (!m) return null; const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(m.inverse()); };
  const UST = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
  const us10 = (v) => { const e = Math.round(Math.log10(v)); if (e === 0) return '1'; if (e === 1) return '10'; return '10' + (e < 0 ? '⁻' : '') + String(Math.abs(e)).split('').map((c) => UST[+c]).join(''); };

  /* eksen: o = {W,H,L,R,T,B, x:[a,b], y:[a,b], xlog, ylog, xt, yt, xf, yf, xad, yad} → ölçekler */
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
    if (o.yad) yaz(g, 8, T - 14, o.yad, { k: 14, b: true });
    return { x, y, ix, iy, g, L, R, T, B, W, H };
  }
  function imlec(svg, d, cb, oy = 0) {
    const f = (ev) => { const p = svgNokta(svg, ev); if (!p) return; const px = p.x, py = p.y - oy; if (px < d.L - 2 || px > d.W - d.R + 2 || py < d.T - 6 || py > d.H - d.B + 6) return; cb(d.ix(px), d.iy(py), px, py); };
    svg.addEventListener('pointermove', f); svg.addEventListener('pointerdown', f);
  }
  function okuma(kap, alanlar) {
    const o = document.createElement('div'); o.className = 'okuma'; o.setAttribute('aria-live', 'polite');
    o.innerHTML = alanlar.map((a, i) => `<span style="white-space:normal;overflow-wrap:anywhere">${a}: <i data-i="${i}">—</i></span>`).join('');
    kap.append(o);
    return (d) => { for (const [a, v] of Object.entries(d)) { const i = alanlar.indexOf(a); if (i >= 0) o.querySelector(`[data-i="${i}"]`).textContent = v; } };
  }
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
    const bs = adlar.map((a, i) => { const b = dugme(k, a, true); b.setAttribute('aria-pressed', String(i === secili)); b.addEventListener('click', () => { bs.forEach((x, j) => { x.setAttribute('aria-pressed', String(j === i)); x.style.fontWeight = j === i ? '700' : ''; x.style.borderColor = j === i ? 'var(--acc)' : ''; }); on(i); }); return b; });
    bs.forEach((x, j) => { x.style.fontWeight = j === secili ? '700' : ''; x.style.borderColor = j === secili ? 'var(--acc)' : ''; });
    return bs;
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
    gg.append(el('line', { x1, y1, x2: x2 - Math.cos(a) * u * 0.8, y2: y2 - Math.sin(a) * u * 0.8, stroke: renk, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-dasharray': kesik ? '6 5' : null }));
    gg.append(el('path', { d: `M${x2},${y2} L${x2 - u * Math.cos(a - 0.42)},${y2 - u * Math.sin(a - 0.42)} L${x2 - u * Math.cos(a + 0.42)},${y2 - u * Math.sin(a + 0.42)} Z`, fill: renk }));
    g.append(gg); return gg;
  }
  const nokta = (g, x, y, r = 5, renk = 'var(--yazi)') => { const c = el('circle', { cx: x, cy: y, r, fill: renk, stroke: 'var(--zemin)', 'stroke-width': 2 }); g.append(c); return c; };
  const rozet = (g, x, y, n, on, renk = 'var(--tur)') => { g.append(el('circle', { cx: x, cy: y, r: 11, fill: on ? renk : 'var(--zemin)', stroke: renk, 'stroke-width': 2 })); yaz(g, x, y + 5, String(n), { h: 'middle', k: 13, b: true, r: on ? '#fff' : renk }); };
  const kavramaGit = (id) => `${(location.hash || '#mto316').split('/k/')[0]}/k/${id}/tanim`;

  /* ================= A · SU BÜTÇESİ ================= */
  Sekil.m316_butce = function (kap) {
    const W = 560, H = 330, svg = svgYap(kap, W, H, 'Havza su bütçesi: yağış, buharlaşma-terleme, akış ve depo değişimi');
    const g = el('g'); svg.append(g);
    g.append(el('rect', { x: 26, y: 68, width: 478, height: 250, rx: 14, fill: 'none', stroke: 'var(--ikincil)', 'stroke-dasharray': '7 6' }));
    yaz(g, 38, 88, 'kontrol hacmi = havza', { k: 13, r: 'var(--ikincil)' });
    g.append(el('path', { d: 'M27,170 C90,120 160,112 230,148 S380,196 470,206 L503,208 L503,317 L27,317 Z', fill: 'var(--yuzey)', stroke: 'var(--yazi)', 'stroke-width': 2 }));
    const dy = 236, dh = 66;
    g.append(el('rect', { x: 100, y: dy, width: 300, height: dh, rx: 8, fill: 'var(--zemin)', stroke: 'var(--acc)', 'stroke-width': 1.5 }));
    const dolu = el('rect', { x: 101, width: 298, rx: 7, fill: 'var(--acc)', opacity: 0.28 }); g.append(dolu);
    yaz(g, 250, dy + 24, 'depo S: toprak nemi + yeraltı suyu', { h: 'middle', k: 13 });
    const dsY = yaz(g, 250, dy + 50, '', { h: 'middle', k: 16, b: true, r: 'var(--acc)' });
    ok(g, 506, 288, 552, 288, 'var(--ikincil)', 2, true); yaz(g, 528, 278, '±G', { h: 'middle', k: 13, r: 'var(--ikincil)' });
    const oklar = el('g'); g.append(oklar);
    const yazP = yaz(g, 180, 30, '', { k: 15, b: true, r: 'var(--acc)' }), yazE = yaz(g, 342, 30, '', { k: 15, b: true, r: 'var(--tur)' }), yazQ = yaz(g, 548, 186, '', { k: 15, b: true, r: 'var(--acc)', h: 'end' });
    const yazOku = okuma(kap, ['ΔS = P − ET − Q', 'yorum']);
    const k = kontrol(kap);
    const sP = surgu(k, 'P', 0, 1000, 0.1, 120, (v) => `${tr(v)} mm`), sE = surgu(k, 'ET', 0, 1000, 0.1, 45, (v) => `${tr(v)} mm`), sQ = surgu(k, 'Q', 0, 1000, 0.1, 38.9, (v) => `${tr(v)} mm`);
    const k2 = kontrol(kap);
    const ciz = () => {
      const P = sP.v, E = sE.v, Q = sQ.v, dS = P - E - Q, w = (v) => 1.5 + 9 * Math.sqrt(v / 1000);
      oklar.replaceChildren();
      ok(oklar, 170, 6, 170, 128, 'var(--acc)', w(P)); ok(oklar, 332, 160, 332, 12, 'var(--tur)', w(E)); ok(oklar, 470, 202, 556, 202, 'var(--acc)', w(Q));
      yazP.textContent = `P ${tr(P)} mm`; yazE.textContent = `ET ${tr(E)} mm`; yazQ.textContent = `Q ${tr(Q)} mm`;
      const fr = 0.5 + sinir(dS / 400, -0.48, 0.48);
      dolu.setAttribute('y', dy + dh - 1 - fr * (dh - 2)); dolu.setAttribute('height', fr * (dh - 2));
      dsY.textContent = `ΔS = ${dS >= 0 ? '+' : ''}${tr(dS)} mm`;
      yazOku({ 'ΔS = P − ET − Q': `${dS >= 0 ? '+' : ''}${tr(dS)} mm`, yorum: Math.abs(dS) < 0.5 ? 'depo sabit (uzun dönem kabulü)' : dS > 0 ? 'su birikti (toprak nemi, yeraltı suyu arttı)' : 'depo boşaldı' });
    };
    [sP, sE, sQ].forEach((s) => s.inp.addEventListener('input', ciz));
    dugme(k2, 'S1 · uzun dönem', true).addEventListener('click', () => { sP.set(720); sQ.set(236.5); sE.set(483.5); ciz(); });
    dugme(k2, 'S2 · 30 gün', true).addEventListener('click', () => { sP.set(120); sE.set(45); sQ.set(38.9); ciz(); });
    ciz();
  };

  Sekil.m316_suyolu = function (kap, ayar = {}) {
    const adim = ayar.adim ?? 6, W = 600, H = 340, svg = svgYap(kap, W, H, 'Yağış yere düştükten sonra suyun yolu');
    const g = el('g'); svg.append(g);
    g.append(el('path', { d: 'M0,330 L0,252 C120,246 250,232 342,206 L360,206 C370,204 380,202 392,200 L392,330 Z', fill: 'var(--acc)', opacity: 0.13 }));
    g.append(el('path', { d: 'M0,252 C120,246 250,232 342,206', fill: 'none', stroke: 'var(--acc)', 'stroke-dasharray': '6 5', 'stroke-width': 1.5 }));
    yaz(g, 8, 274, 'yeraltı su tablası', { k: 12, r: 'var(--acc)' }); yaz(g, 8, 316, 'akifer (doygun bölge)', { k: 12, r: 'var(--acc)' });
    yaz(g, 8, 196, 'toprak (doymamış)', { k: 12, r: 'var(--ikincil)' });
    g.append(el('path', { d: 'M0,140 C60,120 120,118 180,135 S280,170 330,184 L342,206 L360,206 L372,188 L392,184', fill: 'none', stroke: 'var(--yazi)', 'stroke-width': 2.5 }));
    g.append(el('path', { d: 'M343,205 L359,205 L356,197 L346,197 Z', fill: 'var(--acc)' }));
    yaz(g, 351, 224, 'dere', { h: 'middle', k: 12, r: 'var(--acc)' });
    g.append(el('ellipse', { cx: 110, cy: 32, rx: 72, ry: 20, fill: 'var(--cizgi)' }));
    for (let i = 0; i < 10; i++) g.append(el('line', { x1: 50 + i * 14, y1: 56, x2: 44 + i * 14, y2: 80, stroke: 'var(--acc)', 'stroke-width': 1.5, opacity: 0.7 }));
    g.append(el('rect', { x: 57, y: 106, width: 6, height: 22, fill: 'var(--ikincil)' }));
    g.append(el('circle', { cx: 60, cy: 98, r: 22, fill: 'var(--yesil)', opacity: 0.45 }));
    const og = [
      ['tutulma', 'interception', [[60, 62, 60, 80]], [94, 98]],
      ['çukur depolaması', 'depression storage', [], [206, 122]],
      ['sızma', 'infiltration → toprak nemi', [[140, 128, 140, 176]], [118, 156]],
      ['derine süzülme', 'percolation', [[140, 184, 140, 238]], [118, 214]],
      ['ara akış', 'interflow (hızlı, sığ)', [[196, 162, 326, 197]], [246, 200]],
      ['taban akışı', 'baseflow (yavaş)', [[200, 268, 344, 214]], [262, 262]],
      ['yüzey akışı', 'surface runoff · artan', [[226, 140, 328, 176]], [282, 146]],
    ];
    og.forEach(([tr_, en, oklar, [bx, by]], i) => {
      const lx = 412, ly = 28 + i * 44, sim = i === adim, gec = i < adim;
      g.append(el('circle', { cx: lx, cy: ly, r: 11, fill: sim ? 'var(--tur)' : 'var(--zemin)', stroke: i <= adim ? 'var(--tur)' : 'var(--cizgi)', 'stroke-width': 2 }));
      yaz(g, lx, ly + 5, String(i + 1), { h: 'middle', k: 13, b: true, r: sim ? '#fff' : i <= adim ? 'var(--tur)' : 'var(--ikincil)' });
      yaz(g, lx + 18, ly + 2, tr_, { k: 15, b: sim, op: i <= adim ? 1 : 0.4 });
      yaz(g, lx + 18, ly + 19, en, { k: 12, r: 'var(--ikincil)', op: i <= adim ? 1 : 0.4 });
      if (i > adim) return;
      const renk = sim ? 'var(--tur)' : 'var(--ikincil)';
      if (i === 1) g.append(el('ellipse', { cx: 206, cy: 143, rx: 20, ry: 4, fill: 'var(--acc)', opacity: sim ? 1 : 0.6 }));
      for (const [a, b, c, d] of oklar) ok(g, a, b, c, d, renk, sim ? 4 : 2.2);
      rozet(g, bx, by, i + 1, sim);
    });
  };

  Sekil.m316_dongu = function (kap) {
    const W = 560, H = 350, svg = svgYap(kap, W, H, 'Küresel su döngüsü akıları');
    const g = el('g'); svg.append(g);
    const kutu = (x, y, w, h, s1, s2) => { g.append(el('rect', { x, y, width: w, height: h, rx: 12, fill: 'var(--yuzey)', stroke: 'var(--yazi)', 'stroke-width': 1.5 })); yaz(g, x + w / 2, y + 25, s1, { h: 'middle', k: 16, b: true }); if (s2) yaz(g, x + w / 2, y + 46, s2, { h: 'middle', k: 13, r: 'var(--ikincil)' }); };
    kutu(30, 14, 500, 60, 'Atmosfer', 'depo W = 15,5 × 10³ km³ su'); kutu(30, 262, 210, 70, 'Kara', 'P − ET = 36 → akarsu'); kutu(320, 262, 210, 70, 'Okyanus', 'P + akarsu = E');
    const yazOku = okuma(kap, ['seçili akı', 'anlamı', 'kalış süresi τ = W / ΣP']);
    const akilar = [
      [96, 76, 96, 260, 107, 'var(--acc)', 'karaya yağış P = 107', 'Karaya düşen yağış (10³ km³/yıl).'],
      [176, 260, 176, 76, 71, 'var(--tur)', 'karadan ET = 71', 'Buharlaşma + terleme: karaya düşenin üçte ikisi geri döner.'],
      [384, 76, 384, 260, 398, 'var(--acc)', 'okyanusa yağış P = 398', 'Okyanusa düşen yağış.'],
      [466, 260, 466, 76, 434, 'var(--tur)', 'okyanustan E = 434', 'Okyanustan buharlaşma; 398 + 36 = 434 → bütçe kapanır.'],
      [244, 300, 316, 300, 36, 'var(--acc)', 'akarsu 36', 'Kara bütçesi (ΔS ≈ 0): 107 − 71 = 36 denize akar.'],
      [300, 124, 220, 124, 36, 'var(--ikincil)', 'nem taşınımı 36', 'Okyanus üstünde buharlaşan nemin 36 birimi rüzgârla karaya taşınır.'],
    ];
    for (const [a, b, c, d, v, renk, ad, an] of akilar) {
      const gg = el('g', { style: 'cursor:pointer' }); g.append(gg);
      ok(gg, a, b, c, d, renk, 1.6 + v / 40, renk === 'var(--ikincil)');
      gg.append(el('line', { x1: a, y1: b, x2: c, y2: d, stroke: 'transparent', 'stroke-width': 22 }));
      const yatay = b === d;
      yaz(gg, yatay ? (a + c) / 2 : a + 12, yatay ? b - 12 : (b + d) / 2 + 5, String(v), { h: yatay ? 'middle' : 'start', k: 16, b: true, r: renk });
      const sec = () => yazOku({ 'seçili akı': `${ad} (10³ km³/yıl)`, anlamı: an });
      gg.addEventListener('pointerenter', sec); gg.addEventListener('pointerdown', sec);
    }
    yazOku({ 'seçili akı': 'bir oka dokun', 'kalış süresi τ = W / ΣP': `15,5 / (107 + 398) = 0,0307 yıl ≈ ${tr(15.5 / 505 * 365)} gün` });
  };

  Sekil.m316_derinlik = function (kap) {
    const W = 560, H = 210, svg = svgYap(kap, W, H, 'Akış derinliği, hacim ve debi dönüşümü');
    const g = el('g'); svg.append(g);
    const kara = el('path', { fill: 'var(--yuzey)', stroke: 'var(--yazi)', 'stroke-width': 1.5 }), su = el('path', { fill: 'var(--acc)', opacity: 0.45 });
    g.append(kara, su);
    const yA = yaz(g, 150, 196, '', { h: 'middle', k: 14 }), yR = yaz(g, 14, 40, '', { k: 14, b: true, r: 'var(--acc)' });
    const okG = el('g'); g.append(okG); const yQ = yaz(g, 452, 84, '', { h: 'middle', k: 16, b: true, r: 'var(--acc)' });
    const yazOku = okuma(kap, ['V = R·A', 'Q̄ = V / Δt']);
    const k = kontrol(kap);
    const sA = surgu(k, 'A', 1, 3000, 1, 2400, (v) => `${v.toLocaleString('tr-TR')} km²`), sR = surgu(k, 'R', 0, 800, 0.1, 236.5, (v) => `${tr(v)} mm`);
    const k2 = kontrol(kap);
    const DT = [[36000, '10 saat'], [2592000, '30 gün'], [31536000, '1 yıl']];
    let dt = 2;
    const ciz = () => {
      const A = sA.v, R = sR.v, V = R / 1000 * A * 1e6, Q = V / DT[dt][0];
      const gen = 60 + 200 * Math.sqrt(A / 3000), h = 2 + 46 * R / 800, x0 = 150 - gen / 2, y0 = 168;
      kara.setAttribute('d', `M${x0},${y0} L${x0 + gen},${y0} L${x0 + gen + 40},${y0 - 40} L${x0 + 40},${y0 - 40} Z`);
      su.setAttribute('d', `M${x0},${y0} L${x0 + gen},${y0} L${x0 + gen + 40},${y0 - 40} L${x0 + gen + 40},${y0 - 40 - h} L${x0 + 40},${y0 - 40 - h} L${x0},${y0 - h} Z`);
      yA.textContent = `A = ${A.toLocaleString('tr-TR')} km² = ${(A * 1e6).toExponential(2).replace('.', ',').replace('e+', '×10^')} m²`;
      yR.textContent = `R = ${tr(R)} mm = ${tr(R / 1000, 4)} m (havzaya eşit yayılmış su)`;
      okG.replaceChildren(); ok(okG, 350, 120, 550, 120, 'var(--acc)', 2 + 8 * Math.sqrt(Math.min(Q, 200) / 200));
      yQ.textContent = `Q̄ = ${tr(Q, Q < 10 ? 2 : 1)} m³/s`;
      yazOku({ 'V = R·A': `${tr(R / 1000, 4)} m × ${(A * 1e6).toLocaleString('tr-TR')} m² = ${tr(V / 1e6, 3)}×10⁶ m³`, 'Q̄ = V / Δt': `${tr(V / 1e6, 3)}×10⁶ / ${DT[dt][0].toLocaleString('tr-TR')} s = ${tr(Q, 2)} m³/s (${DT[dt][1]})` });
    };
    secenek(k2, DT.map((d) => `Δt = ${d[1]}`), dt, (i) => { dt = i; ciz(); });
    const k3 = kontrol(kap);
    const hazir = (A, R, d) => { sA.set(A); sR.set(R); dt = d; k2.querySelectorAll('button').forEach((b, j) => { b.setAttribute('aria-pressed', String(j === d)); b.style.fontWeight = j === d ? '700' : ''; b.style.borderColor = j === d ? 'var(--acc)' : ''; }); ciz(); };
    dugme(k3, 'S1 (18 m³/s)', true).addEventListener('click', () => hazir(2400, 236.5, 2));
    dugme(k3, 'S2 (1,2 m³/s)', true).addEventListener('click', () => hazir(80, 38.9, 1));
    dugme(k3, 'S4 (50 m³/s)', true).addEventListener('click', () => hazir(150, 12, 0));
    [sA, sR].forEach((s) => s.inp.addEventListener('input', ciz));
    ciz();
  };

  /* ================= B · YAĞIŞ VE ÖLÇÜM ================= */
  Sekil.m316_siddet = function (kap) {
    const W = 560, H = 360, svg = svgYap(kap, W, H, 'Birikimli yağış eğrisi ve şiddet sınıfı');
    const d = eksen(svg, { W, H: 250, x: [0, 120], y: [0, 40], xt: [0, 20, 40, 60, 80, 100, 120], yt: [0, 10, 20, 30, 40], xad: 't (dk)', yad: 'birikimli yağış (mm)' });
    const cizgi = el('path', { fill: 'none', stroke: 'var(--acc)', 'stroke-width': 3.5 }); svg.append(cizgi);
    const uc = nokta(svg, 0, 0, 6, 'var(--acc)'), egimY = yaz(svg, 0, 0, '', { k: 14, b: true, r: 'var(--acc)' });
    const bx = (v) => 60 + v / 4 * 470, by = 296;
    for (const [a, b, ad, op] of [[0, 0.5, 'düşük', 0.15], [0.5, 2.5, 'orta', 0.32], [2.5, 4, 'yüksek', 0.55]]) { svg.append(el('rect', { x: bx(a), y: by, width: bx(b) - bx(a), height: 26, fill: 'var(--tur)', opacity: op })); yaz(svg, (bx(a) + bx(b)) / 2, by + 18, ad, { h: 'middle', k: 13, b: true }); }
    for (const v of [0, 0.5, 2.5, 4]) yaz(svg, bx(v), by + 46, tr(v, 1), { h: 'middle', k: 13, r: 'var(--ikincil)' });
    yaz(svg, 8, by - 8, 'şiddet sınıfı (cm/h):', { k: 13, b: true });
    const isaret = el('path', { fill: 'var(--yazi)' }); svg.append(isaret);
    const yazOku = okuma(kap, ['i = derinlik / süre', 'sınıf']);
    const k = kontrol(kap);
    const sD = surgu(k, 'derinlik', 1, 40, 0.5, 12, (v) => `${tr(v)} mm`), sT = surgu(k, 'süre', 5, 120, 1, 40, (v) => `${v} dk`);
    const ciz = () => {
      const D = sD.v, t = sT.v, i = D / (t / 60), icm = i / 10;
      cizgi.setAttribute('d', yol([[d.x(0), d.y(0)], [d.x(t), d.y(D)]]));
      uc.setAttribute('cx', d.x(t)); uc.setAttribute('cy', d.y(D));
      egimY.setAttribute('x', d.x(t) + 8); egimY.setAttribute('y', d.y(D) - 6); egimY.textContent = `eğim = ${tr(i)} mm/h`;
      if (d.x(t) > 430) { egimY.setAttribute('text-anchor', 'end'); egimY.setAttribute('x', d.x(t) - 8); } else egimY.setAttribute('text-anchor', 'start');
      const xm = bx(Math.min(icm, 4));
      isaret.setAttribute('d', `M${xm},${by - 2} l-7,-12 h14 Z`);
      yazOku({ 'i = derinlik / süre': `${tr(D)} mm / ${tr(t / 60, 3)} h = ${tr(i)} mm/h = ${tr(icm, 2)} cm/h`, sınıf: icm < 0.5 ? 'düşük (< 0,5 cm/h)' : icm <= 2.5 ? 'orta (0,5–2,5 cm/h)' : 'yüksek (> 2,5 cm/h)' });
    };
    [sD, sT].forEach((s) => s.inp.addEventListener('input', ciz)); ciz();
  };

  const RRz = (dbz) => 0.036 * 10 ** (0.0625 * dbz);
  Sekil.m316_zr = function (kap) {
    const W = 560, H = 380, svg = svgYap(kap, W, H, 'Radar yansıtıcılığı ile yağış şiddeti bağıntısı');
    const d = eksen(svg, { W, H, x: [10, 60], y: [0.1, 200], ylog: true, xt: [10, 20, 30, 40, 50, 60], yt: [0.1, 1, 10, 100], yf: (v) => v.toLocaleString('tr-TR'), xad: 'yansıtıcılık (dBZ)', yad: 'RR (mm/h, log)' });
    const pts = []; for (let z = 10; z <= 60.01; z += 0.5) pts.push([d.x(z), d.y(RRz(z))]);
    svg.append(el('path', { d: yol(pts), fill: 'none', stroke: 'var(--acc)', 'stroke-width': 3 }));
    for (const [z, ad] of [[35, '35 → 5,5'], [43, '43 → 17,5'], [50, '50 → 48,0']]) { nokta(svg, d.x(z), d.y(RRz(z))); yaz(svg, d.x(z) + 8, d.y(RRz(z)) + 18, ad, { k: 13, b: true }); }
    svg.append(el('path', { d: `M${d.x(10)},${d.y(10)} H${d.x(39.1)} V${d.y(0.1)}`, fill: 'none', stroke: 'var(--tur)', 'stroke-dasharray': '5 4', 'stroke-width': 1.8 }));
    yaz(svg, d.x(11), d.y(10) - 6, '10 mm/h → 39,1 dBZ', { k: 13, r: 'var(--tur)', b: true });
    ok(svg, d.x(24), d.y(RRz(24)) - 30, d.x(40), d.y(RRz(40)) - 30, 'var(--ikincil)', 1.5, true);
    yaz(svg, d.x(24), d.y(RRz(24)) - 40, '+16 dBZ = ×10 şiddet', { k: 13, r: 'var(--ikincil)' });
    const im = el('circle', { r: 7, fill: 'var(--tur)', stroke: '#fff', 'stroke-width': 2, visibility: 'hidden' }); svg.append(im);
    const yazOku = okuma(kap, ['dBZ', 'Z', 'RR']);
    imlec(svg, d, (z) => { z = sinir(z, 10, 60); im.setAttribute('cx', d.x(z)); im.setAttribute('cy', d.y(RRz(z))); im.setAttribute('visibility', 'visible'); yazOku({ dBZ: tr(z), Z: `10^(${tr(z / 10, 2)}) = ${Math.round(10 ** (z / 10)).toLocaleString('tr-TR')} mm⁶/m³`, RR: `${tr(RRz(z), 2)} mm/h` }); });
    yazOku({ dBZ: 'eğri üzerinde gezdir', Z: '—', RR: '—' });
  };

  function dsd(kap, anim) {
    const W = 560, H = 360, svg = svgYap(kap, W, H, 'Marshall–Palmer damla boyut dağılımı');
    const d = eksen(svg, { W, H, x: [0, 3], y: [1e-6, 1], ylog: true, xt: [0, 0.5, 1, 1.5, 2, 2.5, 3], yt: [1e-6, 1e-4, 1e-2, 1], yf: us10, xad: 'damla yarıçapı r (mm)', yad: 'N(r)/N₀ (log)' });
    const egri = (RR) => { const L = 8200 * RR ** -0.21 / 1000, p = []; for (let r = 0; r <= 3.001; r += 0.02) { const v = Math.exp(-L * r); if (v < 1e-6) break; p.push([d.x(r), d.y(v)]); } return yol(p); };
    for (const [RR, ad] of [[5, 'RR = 5'], [50, 'RR = 50']]) { svg.append(el('path', { d: egri(RR), fill: 'none', stroke: 'var(--ikincil)', 'stroke-width': 1.6, 'stroke-dasharray': '6 5' })); const L = 8200 * RR ** -0.21 / 1000, r = Math.min(2.3, Math.log(1e5) / L); yaz(svg, d.x(r) + 6, d.y(Math.exp(-L * r)) - 6, ad, { k: 13, r: 'var(--ikincil)' }); }
    svg.append(el('line', { x1: d.x(1), x2: d.x(1), y1: d.T, y2: d.H - d.B, stroke: 'var(--yazi)', 'stroke-dasharray': '3 4' }));
    yaz(svg, d.x(1) + 4, d.T + 14, 'r = 1 mm', { k: 13 });
    const ana = el('path', { fill: 'none', stroke: 'var(--tur)', 'stroke-width': 3.5 }); svg.append(ana);
    const m = nokta(svg, 0, 0, 6, 'var(--tur)');
    const yazOku = okuma(kap, ['RR', 'Λ = 8200·RR⁻⁰·²¹', 'N(1 mm)/N₀', 'ortalama r = 1/Λ']);
    const k = kontrol(kap);
    const btn = anim ? dugme(k, '▶ Oynat') : null;
    const s = surgu(k, 'RR', 0, 2.2, 0.01, Math.log10(anim ? 2 : 50), (v) => `${tr(10 ** v, 1)} mm/h`);
    const ciz = () => {
      const RR = 10 ** s.v, L = 8200 * RR ** -0.21;
      ana.setAttribute('d', egri(RR)); m.setAttribute('cx', d.x(1)); m.setAttribute('cy', d.y(Math.exp(-L / 1000)));
      yazOku({ RR: `${tr(RR)} mm/h`, 'Λ = 8200·RR⁻⁰·²¹': `${Math.round(L).toLocaleString('tr-TR')} m⁻¹`, 'N(1 mm)/N₀': tr(Math.exp(-L / 1000), 4), 'ortalama r = 1/Λ': `${tr(1000 / L, 3)} mm` });
    };
    s.inp.addEventListener('input', () => { if (oyn) oyn.dur(); ciz(); });
    let oyn = null, yon = 1;
    if (btn) oyn = dongu(btn, (dt) => { let v = s.v + yon * dt * 0.45; if (v >= 2.2) { v = 2.2; yon = -1; } if (v <= 0) { v = 0; yon = 1; } s.set(v); ciz(); });
    ciz();
    return { dur: () => oyn && oyn.dur() };
  }
  Sekil.m316_dsd = (kap) => { dsd(kap, false); };
  Anim.m316_dsd = (kap) => dsd(kap, true);

  Sekil.m316_pw = function (kap) {
    const W = 560, H = 380, svg = svgYap(kap, W, H, 'Yağışa geçebilir su: özgül nem profili');
    const d = eksen(svg, { W, H, x: [0, 20], y: [1000, 400], xt: [0, 5, 10, 15, 20], yt: [1000, 900, 800, 700, 600, 500, 400], xad: 'özgül nem q (g/kg)', yad: 'basınç p (hPa)' });
    const kg = el('g'); svg.append(kg);
    const yazOku = okuma(kap, ['katmanlar', 'W = Σ q·Δp / (ρ_w g)']);
    const k = kontrol(kap), k2 = kontrol(kap);
    const MOD = [[[1000, 600, 12]], [[1000, 850, 14], [850, 500, 6]]];
    let mod = 1, sl = [];
    const ciz = () => {
      kg.replaceChildren();
      const L = MOD[mod].map((l, i) => [l[0], l[1], sl[i] ? sl[i].v : l[2]]);
      let top = 0; const parca = [];
      L.forEach(([pb, pt, q], i) => {
        const w = q / 1000 * (pb - pt) * 100 / (1000 * 9.81) * 1000; top += w; parca.push(`${q} g/kg × ${(pb - pt) * 100} Pa → ${tr(w)} mm`);
        kg.append(el('rect', { x: d.x(0), y: d.y(pt), width: d.x(q) - d.x(0), height: d.y(pb) - d.y(pt), fill: 'var(--acc)', opacity: i ? 0.25 : 0.4, stroke: 'var(--acc)' }));
        yaz(kg, d.x(q) + 8, (d.y(pt) + d.y(pb)) / 2 + 5, `${tr(w)} mm`, { k: 15, b: true, r: 'var(--acc)' });
      });
      yaz(kg, d.x(19.5), d.T + 12, `W = ${tr(top)} mm`, { h: 'end', k: 18, b: true, r: 'var(--tur)' });
      yazOku({ katmanlar: parca.join(' · '), 'W = Σ q·Δp / (ρ_w g)': `${tr(top)} mm (= kg/m²)` });
    };
    const kur = () => { k2.replaceChildren(); sl = MOD[mod].map((l, i) => { const s = surgu(k2, `q${MOD[mod].length > 1 ? i + 1 : ''} (${l[0]}–${l[1]} hPa)`, 0, 20, 0.5, l[2], (v) => `${tr(v)} g/kg`); s.inp.addEventListener('input', ciz); return s; }); ciz(); };
    secenek(k, ['S8-a · tek katman', 'S8-b · iki katman'], mod, (i) => { mod = i; kur(); });
    kur();
  };

  /* --- Thiessen: dışbükey havza poligonu yarı-düzlemlerle kırpılır (Sutherland–Hodgman) --- */
  const HAVZA = [[1, 2], [3, 0.6], [6.5, 0.4], [9.2, 1.8], [9.6, 5.0], [8.0, 7.6], [5.0, 8.6], [2.2, 7.6], [0.6, 5.0]];
  const OLCER = { A: [2.6, 5.6], B: [4.6, 3.0], C: [7.4, 3.4], D: [6.4, 6.6], E: [10.6, 6.4] };
  const OP = { A: 42, B: 55, C: 68, D: 50, E: 80 }, OA = { A: 120, B: 180, C: 150, D: 90, E: 60 };
  const KOMSU = [['A', 'B'], ['A', 'D'], ['B', 'C'], ['B', 'D'], ['C', 'D'], ['C', 'E'], ['D', 'E']];
  function kirp(poly, a, b, c) { const out = []; for (let i = 0; i < poly.length; i++) { const P = poly[i], Q = poly[(i + 1) % poly.length]; const fp = a * P[0] + b * P[1] - c, fq = a * Q[0] + b * Q[1] - c; if (fp <= 1e-12) out.push(P); if ((fp < -1e-12 && fq > 1e-12) || (fp > 1e-12 && fq < -1e-12)) { const t = fp / (fp - fq); out.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])]); } } return out; }
  function hucre(ad, taban) { let p = taban; const [xi, yi] = OLCER[ad]; for (const [b, [xj, yj]] of Object.entries(OLCER)) { if (b === ad) continue; p = kirp(p, 2 * (xj - xi), 2 * (yj - yi), xj * xj + yj * yj - xi * xi - yi * yi); } return p; }
  Sekil.m316_thiessen = function (kap, ayar = {}) {
    const adim = ayar.adim ?? 5, W = 540, H = 470, X = (x) => 10 + x * 44, Y = (y) => 452 - (y + 1) * 44;
    const svg = svgYap(kap, W, H, 'Thiessen poligonları ile alansal ortalama yağış');
    const g = el('g'); svg.append(g);
    const pth = (p) => yol(p.map(([x, y]) => [X(x), Y(y)])) + 'Z';
    const kutu = [[0, -1], [11.8, -1], [11.8, 9.2], [0, 9.2]];
    const op = { A: 0.12, B: 0.3, C: 0.2, D: 0.4, E: 0.55 };
    const hucrePath = {};
    if (adim >= 4) for (const a of Object.keys(OLCER)) { const p = hucre(a, HAVZA); if (p.length < 3) continue; const e = el('path', { d: pth(p), fill: a === 'E' ? 'var(--tur)' : 'var(--acc)', opacity: op[a], stroke: 'none' }); hucrePath[a] = e; g.append(e); }
    g.append(el('path', { d: pth(HAVZA), fill: 'none', stroke: 'var(--yazi)', 'stroke-width': 4 }));
    if (adim >= 1) for (const [a, b] of KOMSU) g.append(el('line', { x1: X(OLCER[a][0]), y1: Y(OLCER[a][1]), x2: X(OLCER[b][0]), y2: Y(OLCER[b][1]), stroke: 'var(--ikincil)', 'stroke-width': adim === 1 ? 2.2 : 1, 'stroke-dasharray': '4 4', opacity: adim > 2 ? 0.5 : 1 }));
    /* iki komşu ölçerin ortak çokgen kenarı = orta dikmenin kutu içinde kalan parçası */
    const ortakKenar = (a, b) => {
      const ca = hucre(a, kutu), [xi, yi] = OLCER[a], [xj, yj] = OLCER[b], f = (p) => 2 * (xj - xi) * p[0] + 2 * (yj - yi) * p[1] - (xj * xj + yj * yj - xi * xi - yi * yi);
      const u = ca.filter((p) => Math.abs(f(p)) < 1e-6);
      return u.length >= 2 ? [u[0], u[1]] : null;
    };
    if (adim === 2) for (const [a, b] of KOMSU) {
      const s = ortakKenar(a, b), [xi, yi] = OLCER[a], [xj, yj] = OLCER[b];
      if (s) g.append(el('line', { x1: X(s[0][0]), y1: Y(s[0][1]), x2: X(s[1][0]), y2: Y(s[1][1]), stroke: 'var(--tur)', 'stroke-width': 2.5 }));
      g.append(el('circle', { cx: X((xi + xj) / 2), cy: Y((yi + yj) / 2), r: 3.5, fill: 'var(--tur)' }));
    }
    if (adim >= 3) { const adlar = Object.keys(OLCER); for (let i = 0; i < adlar.length; i++) for (let j = i + 1; j < adlar.length; j++) { const s = ortakKenar(adlar[i], adlar[j]); if (s) g.append(el('line', { x1: X(s[0][0]), y1: Y(s[0][1]), x2: X(s[1][0]), y2: Y(s[1][1]), stroke: 'var(--tur)', 'stroke-width': adim === 3 ? 2.5 : 1.6, 'stroke-dasharray': '7 5' })); } }
    const ETK = { A: [11, 14, 'start'], B: [11, 14, 'start'], C: [11, 14, 'start'], D: [-12, 26, 'end'], E: [26, 30, 'end'] };
    for (const [a, [x, y]] of Object.entries(OLCER)) {
      g.append(el('circle', { cx: X(x), cy: Y(y), r: 8, fill: a === 'E' ? 'var(--zemin)' : 'var(--yazi)', stroke: 'var(--yazi)', 'stroke-width': 2.5 }));
      yaz(g, X(x) + 11, Y(y) - 9, a, { k: 22, b: true });
      if (adim >= 5) { const [dx, dy, h] = ETK[a]; yaz(g, X(x) + dx, Y(y) + dy, `${OP[a]} mm · ${OA[a]} km²`, { k: 15, b: true, h, r: a === 'E' ? 'var(--tur)' : 'var(--yazi)' }); }
    }
    yaz(g, 528, Y(7.5), 'E havza dışında', { h: 'end', k: 14, r: 'var(--tur)', b: true });
    const not = ['ölçerler ve havza sınırı (kalın)', 'komşu ölçerler kesikli çizgiyle birleşir', 'her doğrunun orta dikmesi (turuncu)', 'orta dikmeler poligonları kapatır', 'poligonlar havza sınırıyla kesilir; E\'nin içeri düşen parçası turuncu', 'alan × yağış → P̄ = 34 440 / 600 = 57,4 mm'][adim];
    yaz(g, 12, 464, not, { k: 15, b: true, r: 'var(--ikincil)' });
    if (ayar.adim != null) return;
    yaz(g, 12, 18, 'çizim şematik; alanlar soru tablosundan', { k: 13, r: 'var(--ikincil)' });
    const yazOku = okuma(kap, ['ölçer', 'ağırlık Aᵢ/ΣA', 'Aᵢ·Pᵢ', 'sonuç']);
    for (const [a, e] of Object.entries(hucrePath)) {
      e.style.cursor = 'pointer';
      const sec = () => { Object.entries(hucrePath).forEach(([b, x]) => x.setAttribute('stroke', b === a ? 'var(--yazi)' : 'none')); e.setAttribute('stroke-width', 3); yazOku({ ölçer: `${a}: P = ${OP[a]} mm, A = ${OA[a]} km²`, 'ağırlık Aᵢ/ΣA': `${OA[a]} / 600 = ${tr(OA[a] / 600, 2)}`, 'Aᵢ·Pᵢ': (OA[a] * OP[a]).toLocaleString('tr-TR') }); };
      e.addEventListener('pointerenter', sec); e.addEventListener('pointerdown', sec);
    }
    yazOku({ ölçer: 'bir poligona dokun', sonuç: 'aritmetik (A–D) 53,75 mm · Thiessen 57,4 mm' });
  };

  Sekil.m316_izohiyet = function (kap, ayar = {}) {
    const adim = ayar.adim ?? 5, W = 560, H = 380, svg = svgYap(kap, W, H, 'İzohiyet yöntemi: eş yağış eğrileri arasındaki şeritler');
    const g = el('g'); svg.append(g);
    const E = [[270, 190, 230, 150, 10], [290, 180, 197, 128.5, 20], [315, 165, 132.8, 86.6, 30], [335, 152, 72.7, 47.4, 40]];
    const S = [[10, 20, 40, 15], [20, 30, 60, 25], [30, 40, 35, 35], [40, 48, 15, 44]];
    const elp = ([cx, cy, rx, ry]) => `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${2 * rx},0 a${rx},${ry} 0 1,0 ${-2 * rx},0 Z`;
    const seritler = [];
    S.forEach(([u, v, A, ort], i) => {
      const d = i < 3 ? elp(E[i]) + elp(E[i + 1]) : elp(E[3]);
      const p = el('path', { d, 'fill-rule': 'evenodd', fill: 'var(--acc)', opacity: adim > i ? [0.14, 0.27, 0.42, 0.6][i] : 0 });
      g.append(p); seritler.push(p);
    });
    E.forEach((e, i) => { g.append(el('path', { d: elp(e), fill: 'none', stroke: i ? 'var(--acc)' : 'var(--yazi)', 'stroke-width': i ? 2 : 4 })); yaz(g, e[0] - e[2] + 6, e[1] + 5, `${e[4]}`, { k: 15, b: true, r: i ? 'var(--acc)' : 'var(--yazi)' }); });
    nokta(g, 340, 150, 5, 'var(--tur)'); yaz(g, 348, 145, 'tepe 48', { k: 14, b: true, r: 'var(--tur)' });
    yaz(g, 40, 30, 'kalın: havza sınırı (≈ 10 mm eğrisi) · ince: izohiyetler (mm)', { k: 13, r: 'var(--ikincil)' });
    let top = 0; const satir = [];
    S.forEach(([u, v, A, ort], i) => { if (i < adim) { top += A * ort; satir.push(`${A}×${ort}`); } });
    if (adim >= 1) yaz(g, 20, 362, adim >= 4 ? `Σ A·P̄ = 3985 → P̄ = 3985 / 150 = ${tr(3985 / 150)} mm` : `Σ A·P̄ = ${satir.join(' + ')} = ${top.toLocaleString('tr-TR')}`, { k: 15, b: true, r: 'var(--tur)' });
    if (adim >= 1 && adim <= 4) { const [u, v, A, ort] = S[adim - 1]; yaz(g, 20, 340, `şerit ${u}–${v} mm: ortalama ${v === 48 ? '(40+48)/2' : `(${u}+${v})/2`} = ${ort} mm · alan ${A} km²`, { k: 14 }); }
    if (ayar.adim != null) return;
    const yazOku = okuma(kap, ['şerit', 'A·P̄']);
    const icinde = ([cx, cy, rx, ry], x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
    const sec = (ev) => { const p = svgNokta(svg, ev); if (!p) return; let i = -1; for (let j = 3; j >= 0; j--) if (icinde(E[j], p.x, p.y)) { i = j; break; } seritler.forEach((s, j) => s.setAttribute('stroke', j === i ? 'var(--yazi)' : 'none')); if (i < 0) return; const [u, v, A, ort] = S[i]; yazOku({ şerit: `${u}–${v} mm, ortalama ${ort} mm, alan ${A} km²`, 'A·P̄': `${A} × ${ort} = ${A * ort}` }); };
    svg.addEventListener('pointermove', sec); svg.addEventListener('pointerdown', sec);
    yazOku({ şerit: 'bir şeride dokun', 'A·P̄': 'Σ = 3985 → P̄ = 26,6 mm' });
  };

  Sekil.m316_olcer = function (kap) {
    const W = 560, H = 380, svg = svgYap(kap, W, H, 'Optimum ölçer sayısı: N = (Cv/ε)²');
    const d = eksen(svg, { W, H, x: [2, 20], y: [1, 1000], ylog: true, xt: [2, 5, 10, 15, 20], yt: [1, 10, 100, 1000], xad: 'kabul edilen hata ε (%)', yad: 'gereken ölçer N (log)' });
    const egri = (cv) => { const p = []; for (let e = 2; e <= 20.01; e += 0.25) { const N = (cv / e) ** 2; if (N <= 1000 && N >= 1) p.push([d.x(e), d.y(N)]); } return yol(p); };
    for (const [cv, ad, ex] of [[72.0, 'Cᵥ = %72 (S12)', 6], [22.04, 'Cᵥ = %22 (S13)', 3]]) { svg.append(el('path', { d: egri(cv), fill: 'none', stroke: 'var(--ikincil)', 'stroke-width': 1.8, 'stroke-dasharray': '6 4' })); yaz(svg, d.x(ex) + 6, d.y((cv / ex) ** 2) - 6, ad, { k: 13, r: 'var(--ikincil)' }); }
    for (const [e, N, ad] of [[10, 51.8, 'S12: 52'], [5, 19.4, 'S13: 20'], [10, 4.86, 'S13-c: 5']]) { nokta(svg, d.x(e), d.y(N)); yaz(svg, d.x(e) + 8, d.y(N) + 16, ad, { k: 13, b: true }); }
    const ana = el('path', { fill: 'none', stroke: 'var(--tur)', 'stroke-width': 3.2 }); svg.append(ana);
    const m = nokta(svg, 0, 0, 7, 'var(--tur)');
    const yazOku = okuma(kap, ['N = (Cᵥ/ε)²', 'toplam ölçer', 'ε yarıya inerse']);
    const k = kontrol(kap);
    const sC = surgu(k, 'Cᵥ', 5, 100, 0.1, 72, (v) => `%${tr(v)}`), sE = surgu(k, 'ε', 2, 20, 0.5, 10, (v) => `%${tr(v)}`);
    const ciz = () => { const cv = sC.v, e = sE.v, N = (cv / e) ** 2; ana.setAttribute('d', egri(cv)); m.setAttribute('cx', d.x(e)); m.setAttribute('cy', d.y(sinir(N, 1, 1000))); yazOku({ 'N = (Cᵥ/ε)²': `(${tr(cv)} / ${tr(e)})² = ${tr(N, 2)}`, 'toplam ölçer': `${Math.ceil(N - 1e-9)} (yukarı yuvarla)`, 'ε yarıya inerse': `N = ${tr((cv / (e / 2)) ** 2, 1)} (4 kat)` }); };
    [sC, sE].forEach((s) => s.inp.addEventListener('input', ciz)); ciz();
  };

  /* ================= C · VERİ KALİTESİ VE EKSTREMLER ================= */
  const KOM = [600, 640, 580, 620, 610, 590, 630, 600, 650, 620], XS = KOM.map((v, i) => (i < 5 ? 1.1 : 0.9) * v);
  function ciftKutle(kap, anim) {
    const W = 560, H = 400, svg = svgYap(kap, W, H, 'Çift kütle eğrisi: X istasyonu ve komşu ortalaması');
    const d = eksen(svg, { W, H, x: [0, 6500], y: [0, 6800], xt: [0, 1000, 2000, 3000, 4000, 5000, 6000], yt: [0, 2000, 4000, 6000], xad: 'komşu ort. birikimli (mm)', yad: 'X birikimli (mm)' });
    svg.append(el('line', { x1: d.x(0), y1: d.y(0), x2: d.x(6200), y2: d.y(6200), stroke: 'var(--ikincil)', 'stroke-dasharray': '2 5' })); yaz(svg, d.x(5600), d.y(5900), '1:1', { k: 13, r: 'var(--ikincil)' });
    const cx = [0], cy = [0]; KOM.forEach((v, i) => { cx.push(cx[i] + v); cy.push(cy[i] + XS[i]); });
    const cf = 0.9 / 1.1;
    const uzanti = el('line', { x1: d.x(cx[5]), y1: d.y(cy[5]), x2: d.x(cx[10]), y2: d.y(cy[5] + 1.1 * (cx[10] - cx[5])), stroke: 'var(--ikincil)', 'stroke-dasharray': '6 5' }); svg.append(uzanti);
    const hat = el('path', { fill: 'none', stroke: 'var(--acc)', 'stroke-width': 3 }), duz = el('path', { fill: 'none', stroke: 'var(--tur)', 'stroke-width': 3, 'stroke-dasharray': '8 5' });
    svg.append(hat, duz);
    const ng = el('g'); svg.append(ng);
    const kirY = yaz(svg, d.x(cx[5]) - 150, d.y(cy[5]) - 40, 'kırılma (2016)', { k: 15, b: true, r: 'var(--tur)' });
    const yazOku = okuma(kap, ['yıl', 'eğim (dönem)', 'düzeltme']);
    const k = kontrol(kap);
    const btn = anim ? dugme(k, '▶ Oynat') : null;
    let duzGoster = false;
    const tg = dugme(k, 'Düzeltilmiş seriyi göster', true);
    const ciz = (n, karis) => {
      const yy = cy.map((v, i) => (i <= 5 ? cy[i] * (1 - karis + karis * cf) : cy[5] * (1 - karis + karis * cf) + (cy[i] - cy[5])));
      hat.setAttribute('d', yol(cx.slice(0, n + 1).map((v, i) => [d.x(v), d.y(yy[i])])));
      ng.replaceChildren(); for (let i = 1; i <= n; i++) { const c = nokta(ng, d.x(cx[i]), d.y(yy[i]), 5, i <= 5 ? 'var(--acc)' : 'var(--yesil)'); c.dataset.i = i; }
      kirY.setAttribute('visibility', n >= 6 ? 'visible' : 'hidden'); uzanti.setAttribute('visibility', n >= 6 && karis === 0 ? 'visible' : 'hidden');
      const dz = []; let a = 0, b = 0; for (let i = 0; i < 10; i++) { const x = i < 5 ? XS[i] * cf : XS[i]; a += KOM[i]; b += x; dz.push([d.x(a), d.y(b)]); }
      duz.setAttribute('d', duzGoster ? yol([[d.x(0), d.y(0)], ...dz]) : '');
      const e = n <= 5 ? cy[n] / Math.max(cx[n], 1) : (cy[n] - cy[5]) / (cx[n] - cx[5]);
      yazOku({ yıl: n ? `2011–${2010 + n}` : '—', 'eğim (dönem)': n ? (n <= 5 ? `2011–${2010 + n}: ${tr(e, 2)}` : `2016–${2010 + n}: ${tr(e, 2)} (eski 1,10)`) : '—', düzeltme: karis > 0 || duzGoster ? 'c.f. = 0,90 / 1,10 = 0,818 → 660 → 540 …' : 'son dönem güvenilir → eski dönem × Mc/Ma' });
    };
    tg.addEventListener('click', () => { duzGoster = !duzGoster; tg.textContent = duzGoster ? 'Düzeltilmiş seriyi gizle' : 'Düzeltilmiş seriyi göster'; ciz(t >= 10 ? 10 : Math.floor(t), Math.max(0, t - 10.5) / 2 > 1 ? 1 : Math.max(0, (t - 10.5) / 2)); });
    let t = anim ? 0 : 10, oyn = null;
    if (btn) oyn = dongu(btn, (dt) => { t += dt * 1.6; if (t > 13.2) { t = 13.2; ciz(10, 1); return false; } ciz(Math.min(10, Math.floor(t)), sinir((t - 10.5) / 2, 0, 1)); });
    if (anim) { const b2 = dugme(k, 'Baştan', true); b2.addEventListener('click', () => { t = 0; ciz(0, 0); }); }
    ciz(anim ? 0 : 10, 0);
    if (!anim) imlec(svg, d, (xv) => { let i = 1; for (let j = 1; j <= 10; j++) if (Math.abs(cx[j] - xv) < Math.abs(cx[i] - xv)) i = j; yazOku({ yıl: `${2010 + i}: komşu Σ ${cx[i].toLocaleString('tr-TR')} · X Σ ${Math.round(cy[i]).toLocaleString('tr-TR')} mm`, 'eğim (dönem)': i <= 5 ? '2011–15: 3355/3050 = 1,10' : '2016–20: 2781/3090 = 0,90' }); });
    return { dur: () => oyn && oyn.dur() };
  }
  Sekil.m316_ciftkutle = (kap) => { ciftKutle(kap, false); };
  Anim.m316_ciftkutle = (kap) => ciftKutle(kap, true);

  Sekil.m316_idf = function (kap) {
    const W = 560, H = 390, svg = svgYap(kap, W, H, 'Şiddet–süre–sıklık (IDF) eğrileri');
    const d = eksen(svg, { W, H, x: [0, 120], y: [0, 200], xt: [0, 15, 30, 45, 60, 75, 90, 105, 120], yt: [0, 40, 80, 120, 160, 200], xad: 'süre t (dk)', yad: 'şiddet i (mm/h)' });
    const T = [[2400, 'T = 2 yıl', '2 5'], [3600, 'T = 10 yıl', ''], [5000, 'T = 100 yıl', '9 5']];
    for (const [a, ad, ks] of T) { const p = []; for (let t = 3; t <= 120; t += 1) p.push([d.x(t), d.y(a / (t + 20))]); svg.append(el('path', { d: yol(p), fill: 'none', stroke: a === 3600 ? 'var(--acc)' : 'var(--ikincil)', 'stroke-width': a === 3600 ? 3.2 : 2, 'stroke-dasharray': ks || null })); yaz(svg, d.x(92), d.y(a / 112) - 7, ad, { k: 13, b: a === 3600, r: a === 3600 ? 'var(--acc)' : 'var(--ikincil)' }); }
    for (const [t, i, ad] of [[10, 120, 'S16 (10; 120)'], [60, 45, 'S16 (60; 45)'], [25, 80, 'S32 Tc = 25 → 80']]) { nokta(svg, d.x(t), d.y(i)); yaz(svg, d.x(t) + 8, d.y(i) - 8, ad, { k: 13, b: true }); }
    const dik = el('line', { y1: d.T, y2: d.H - d.B, stroke: 'var(--tur)', 'stroke-width': 2 }); svg.append(dik);
    const yazOku = okuma(kap, ['t', 'i (2 / 10 / 100 yıl)', 'derinlik = i·t (10 yıl)']);
    const k = kontrol(kap);
    const s = surgu(k, 't', 5, 120, 1, 25, (v) => `${v} dk`);
    const ciz = () => { const t = s.v; dik.setAttribute('x1', d.x(t)); dik.setAttribute('x2', d.x(t)); const i = T.map(([a]) => a / (t + 20)); yazOku({ t: `${t} dk`, 'i (2 / 10 / 100 yıl)': i.map((v) => tr(v)).join(' / ') + ' mm/h', 'derinlik = i·t (10 yıl)': `${tr(i[1])} × ${tr(t / 60, 3)} h = ${tr(i[1] * t / 60)} mm` }); };
    s.inp.addEventListener('input', ciz); ciz();
  };

  const riskF = (T, n) => 1 - (1 - 1 / T) ** n;
  Sekil.m316_risk = function (kap) {
    const W = 560, H = 380, svg = svgYap(kap, W, H, 'Ömür boyunca en az bir aşılma olasılığı');
    const d = eksen(svg, { W, H, x: [0, 100], y: [0, 100], xt: [0, 20, 40, 60, 80, 100], yt: [0, 20, 40, 60, 80, 100], xad: 'ömür n (yıl)', yad: 'risk R (%)' });
    for (const T of [10, 25, 50, 100, 475]) { const p = []; for (let n = 0; n <= 100; n += 1) p.push([d.x(n), d.y(100 * riskF(T, n))]); svg.append(el('path', { d: yol(p), fill: 'none', stroke: 'var(--ikincil)', 'stroke-width': 1.6 })); const nn = T === 10 ? 12 : T === 25 ? 30 : 92; yaz(svg, d.x(nn) + 4, d.y(100 * riskF(T, nn)) - 6, `T = ${T}`, { k: 13, r: 'var(--ikincil)' }); }
    for (const [n, R, ad] of [[30, 26.0, 'S18-a'], [50, 63.6, 'S18-b'], [50, 10, 'S18-c (T = 475)']]) { nokta(svg, d.x(n), d.y(R)); yaz(svg, d.x(n) + 8, d.y(R) + 16, ad, { k: 13, b: true }); }
    const ana = el('path', { fill: 'none', stroke: 'var(--tur)', 'stroke-width': 3.2 }); svg.append(ana);
    const m = nokta(svg, 0, 0, 7, 'var(--tur)');
    const yazOku = okuma(kap, ['R = 1 − (1 − 1/T)ⁿ', 'hiç aşılmama', 'yıllık olasılık']);
    const k = kontrol(kap);
    const sT = surgu(k, 'T', 0.3, 3, 0.01, 2, (v) => `${Math.round(10 ** v)} yıl`), sN = surgu(k, 'n', 1, 100, 1, 30, (v) => `${v} yıl`);
    const ciz = () => { const T = Math.round(10 ** sT.v), n = sN.v, R = riskF(T, n); const p = []; for (let x = 0; x <= 100; x++) p.push([d.x(x), d.y(100 * riskF(T, x))]); ana.setAttribute('d', yol(p)); m.setAttribute('cx', d.x(n)); m.setAttribute('cy', d.y(100 * R)); yazOku({ 'R = 1 − (1 − 1/T)ⁿ': `%${tr(100 * R)}`, 'hiç aşılmama': `(1 − 1/${T})^${n} = %${tr(100 * (1 - R))}`, 'yıllık olasılık': `1/T = %${tr(100 / T, 2)}` }); };
    [sT, sN].forEach((s) => s.inp.addEventListener('input', ciz)); ciz();
  };

  Anim.m316_riskmc = function (kap) {
    const W = 560, H = 250, svg = svgYap(kap, W, H, '200 yapının ömür boyunca aşılma deneyi');
    const g = el('g'); svg.append(g);
    const NX = 25, NY = 8, cw = 20.8, ch = 22;
    const hucreler = []; for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) { const r = el('rect', { x: 20 + i * cw, y: 14 + j * ch, width: cw - 3, height: ch - 3, rx: 3, fill: 'var(--cizgi)' }); g.append(r); hucreler.push(r); }
    const bar = el('rect', { x: 20, y: 206, height: 14, fill: 'var(--tur)' }), cubuk = el('line', { y1: 200, y2: 226, stroke: 'var(--yazi)', 'stroke-width': 3 }); g.append(el('rect', { x: 20, y: 206, width: 520, height: 14, fill: 'var(--yuzey)', stroke: 'var(--cizgi)' }), bar, cubuk);
    const yB = yaz(g, 20, 244, '', { k: 13, b: true });
    const yazOku = okuma(kap, ['yıl', 'en az bir kez aşılan yapı', 'teori R(n)']);
    const k = kontrol(kap);
    const btn = dugme(k, '▶ Oynat'), b2 = dugme(k, 'Baştan', true);
    const k2 = kontrol(kap);
    const sT = surgu(k2, 'T', 0.3, 3, 0.01, 2, (v) => `${Math.round(10 ** v)} yıl`), sN = surgu(k2, 'n', 5, 100, 1, 30, (v) => `${v} yıl`);
    let tohum = 12345; const rnd = () => (tohum = (tohum * 16807) % 2147483647) / 2147483647;
    let yil = 0, asildi = new Array(NX * NY).fill(false), birikim = 0;
    const ciz = () => {
      const T = Math.round(10 ** sT.v), n = sN.v, sayi = asildi.filter(Boolean).length, R = riskF(T, yil);
      hucreler.forEach((h, i) => h.setAttribute('fill', asildi[i] ? 'var(--tur)' : 'var(--cizgi)'));
      bar.setAttribute('width', 520 * sayi / 200); cubuk.setAttribute('x1', 20 + 520 * R); cubuk.setAttribute('x2', 20 + 520 * R);
      yB.textContent = `deney: %${tr(100 * sayi / 200)} · siyah çizgi = teori %${tr(100 * R)}`;
      yazOku({ yıl: `${yil} / ${n}`, 'en az bir kez aşılan yapı': `${sayi} / 200 = %${tr(100 * sayi / 200)}`, 'teori R(n)': `1 − (1 − 1/${T})^${yil} = %${tr(100 * R)}` });
    };
    const bastan = () => { yil = 0; birikim = 0; tohum = 12345; asildi = asildi.map(() => false); ciz(); };
    const oyn = dongu(btn, (dt) => { const n = sN.v; if (yil >= n) bastan(); birikim += dt * 10; while (birikim >= 1 && yil < n) { birikim -= 1; yil++; const p = 1 / Math.round(10 ** sT.v); asildi = asildi.map((a) => a || rnd() < p); } ciz(); if (yil >= n) return false; });
    b2.addEventListener('click', () => { oyn.dur(); bastan(); });
    [sT, sN].forEach((s) => s.inp.addEventListener('input', () => { oyn.dur(); bastan(); }));
    ciz();
    return { dur: oyn.dur };
  };

  Sekil.m316_horton = function (kap) {
    const W = 560, H = 580, svg = svgYap(kap, W, H, 'Horton derinlik–alan bağıntısı ve doğrusallaştırılmış hâli');
    const ust = el('g'), alt = el('g', { transform: 'translate(0,290)' }); svg.append(ust, alt);
    const yazOku = okuma(kap, ['A', 'P = Pm·e^(−kAⁿ)', 'k, n']);
    const k = kontrol(kap), k2 = kontrol(kap);
    const VERI = [{ Pm: 54, p: [[500, 51], [5000, 39]], ek: [[1000, 48]], Amax: 6000, y: [30, 56], yt: [30, 35, 40, 45, 50, 55], ad: 'S19' }, { Pm: 30, p: [[100, 28], [2000, 20]], ek: [], Amax: 3000, y: [14, 31], yt: [15, 20, 25, 30], ad: 'S20' }];
    let v = 0, sA;
    const ciz = () => {
      const V = VERI[v], y1 = Math.log(Math.log(V.Pm / V.p[0][1])), y2 = Math.log(Math.log(V.Pm / V.p[1][1])), x1 = Math.log(V.p[0][0]), x2 = Math.log(V.p[1][0]);
      const n = (y2 - y1) / (x2 - x1), kk = Math.exp(y1 - n * x1), P = (A) => V.Pm * Math.exp(-kk * A ** n);
      ust.replaceChildren(); alt.replaceChildren();
      const d = eksen(ust, { W, H: 290, x: [0, V.Amax], y: V.y, xt: V.Amax === 6000 ? [0, 1000, 2000, 3000, 4000, 5000, 6000] : [0, 500, 1000, 1500, 2000, 2500, 3000], yt: V.yt, xad: 'alan A (km²)', yad: `ortalama derinlik P (cm) · Pm = ${V.Pm}` });
      const p = []; for (let A = 1; A <= V.Amax; A += V.Amax / 300) p.push([d.x(A), d.y(P(A))]); ust.append(el('path', { d: yol(p), fill: 'none', stroke: 'var(--acc)', 'stroke-width': 3 }));
      for (const [A, Pv] of V.p) nokta(ust, d.x(A), d.y(Pv), 6);
      for (const [A, Pv] of V.ek) { nokta(ust, d.x(A), d.y(Pv), 5, 'var(--ikincil)'); yaz(ust, d.x(A) + 8, d.y(Pv) + 16, 'tablo 48', { k: 12, r: 'var(--ikincil)' }); }
      const A = sA.v, m = nokta(ust, d.x(A), d.y(P(A)), 7, 'var(--tur)'); void m;
      const d2 = eksen(alt, { W, H: 290, x: [4, 9], y: [-3.5, 0], xt: [4, 5, 6, 7, 8, 9], yt: [-3, -2, -1, 0], yf: (q) => q.toLocaleString('tr-TR'), xad: 'x = ln A', yad: 'y = ln ln(Pm/P)' });
      alt.append(el('line', { x1: d2.x(4), y1: d2.y(Math.log(kk) + n * 4), x2: d2.x(9), y2: d2.y(Math.log(kk) + n * 9), stroke: 'var(--acc)', 'stroke-width': 3 }));
      for (const [Ap, Pv] of V.p) { const xx = Math.log(Ap), yy = Math.log(Math.log(V.Pm / Pv)); nokta(alt, d2.x(xx), d2.y(yy), 6); yaz(alt, d2.x(xx) + 8, d2.y(yy) + 18, `(${tr(xx, 3)}; ${tr(yy, 3)})`, { k: 13, b: true }); }
      yaz(alt, d2.x(4.1), d2.y(-0.3), `eğim n = ${tr(n, 3)} · kesişim ln k = ${tr(Math.log(kk), 3)}`, { k: 14, b: true, r: 'var(--tur)' });
      yazOku({ A: `${A.toLocaleString('tr-TR')} km²`, 'P = Pm·e^(−kAⁿ)': `${V.Pm} × e^(−${tr(kk * A ** n, 4)}) = ${tr(P(A))} cm`, 'k, n': `k = ${kk.toExponential(3).replace('.', ',')} · n = ${tr(n, 3)}` });
    };
    secenek(k, ['S19 · ders verisi', 'S20 · yeni havza'], 0, (i) => { v = i; sA.inp.max = VERI[i].Amax; sA.set(i ? 500 : 1000); ciz(); });
    sA = surgu(k2, 'A', 10, 6000, 10, 1000, (q) => `${q.toLocaleString('tr-TR')} km²`); sA.inp.addEventListener('input', ciz);
    ciz();
  };

  Sekil.m316_zarf = function (kap) {
    const W = 560, H = 380, svg = svgYap(kap, W, H, 'Dünya rekor yağışlarının zarf eğrisi');
    const d = eksen(svg, { W, H, x: [0.01, 1000], y: [1, 2000], xlog: true, ylog: true, xt: [0.01, 0.1, 1, 10, 100, 1000], yt: [1, 10, 100, 1000], xf: (v) => v.toLocaleString('tr-TR'), xad: 'süre D (saat, log)', yad: 'zarf derinliği R (cm, log)' });
    const Rz = (D) => 42.2 * D ** 0.475;
    svg.append(el('path', { d: yol([[d.x(0.01), d.y(Rz(0.01))], [d.x(1000), d.y(Rz(1000))]]), fill: 'none', stroke: 'var(--acc)', 'stroke-width': 3 }));
    yaz(svg, d.x(0.02), d.y(Rz(0.02)) - 14, 'R = 42,2 · D^0,475', { k: 15, b: true, r: 'var(--acc)' });
    for (const [D, R, ad] of [[3, 71.1, '3 h → 71,1 cm'], [0.5, 30.4, '30 dk → 30,4 cm'], [14.44, 150, '14,4 h → 150 cm']]) { nokta(svg, d.x(D), d.y(R)); yaz(svg, d.x(D) + 8, d.y(R) + 18, ad, { k: 13, b: true }); }
    const m = nokta(svg, 0, 0, 7, 'var(--tur)');
    const yazOku = okuma(kap, ['D', 'R', 'ortalama şiddet R/D']);
    const k = kontrol(kap);
    const s = surgu(k, 'D', -2, 3, 0.01, Math.log10(3), (v) => `${tr(10 ** v, v < 0 ? 2 : 1)} h`);
    const ciz = () => { const D = 10 ** s.v, R = Rz(D); m.setAttribute('cx', d.x(D)); m.setAttribute('cy', d.y(R)); yazOku({ D: `${tr(D, 2)} h = ${tr(D * 60, 0)} dk`, R: `${tr(R)} cm`, 'ortalama şiddet R/D': `${tr(R / D)} cm/h` }); };
    s.inp.addEventListener('input', ciz); ciz();
  };

  const HS = [62, 48, 75, 55, 90, 68, 52, 58, 210, 70, 64, 80];
  Sekil.m316_hershfield = function (kap, ayar = {}) {
    const adim = ayar.adim ?? 5, W = 560, H = 420, svg = svgYap(kap, W, H, 'Hershfield yöntemi: Km ve PMP');
    const kisa = HS.filter((v) => v !== 210), ort = (a) => a.reduce((s, v) => s + v, 0) / a.length, sp = (a) => Math.sqrt(a.reduce((s, v) => s + (v - ort(a)) ** 2, 0) / a.length);
    const m1 = ort(kisa), s1 = sp(kisa), Km = (210 - m1) / s1, m2 = ort(HS), s2 = sp(HS), PMP = m2 + Km * s2;
    // üst panel: mm ekseni, bütün seri
    const X = (v) => 40 + v / 620 * 500;
    const g = el('g'); svg.append(g);
    const eksenMm = (y, ad) => { g.append(el('line', { x1: X(0), x2: X(620), y1: y, y2: y, stroke: 'var(--ikincil)' })); for (let v = 0; v <= 600; v += 100) { g.append(el('line', { x1: X(v), x2: X(v), y1: y - 4, y2: y + 4, stroke: 'var(--ikincil)' })); yaz(g, X(v), y + 20, String(v), { h: 'middle', k: 12, r: 'var(--ikincil)' }); } yaz(g, X(620), y + 36, ad, { h: 'end', k: 13, b: true }); };
    eksenMm(120, 'yıllık 1 günlük maksimum (mm)');
    yaz(g, 40, 22, adim >= 4 ? 'tüm seri (n = 12): X̄ₙ, σₙ → PMP' : adim >= 1 ? 'Xm ayrılır; kalan 11 değer alt panelde' : '12 yıllık seri', { k: 14, b: true });
    const yigin = {}; HS.forEach((v) => { const kx = Math.round(X(v) / 9); yigin[kx] = (yigin[kx] || 0) + 1; nokta(g, X(v), 112 - (yigin[kx] - 1) * 11, 5, v === 210 && adim >= 1 ? 'var(--tur)' : 'var(--yazi)'); });
    if (adim >= 1) yaz(g, X(210), 92, 'Xm = 210', { h: 'middle', k: 13, b: true, r: 'var(--tur)' });
    if (adim >= 4) { g.append(el('rect', { x: X(m2 - s2), y: 52, width: X(m2 + s2) - X(m2 - s2), height: 70, fill: 'var(--acc)', opacity: 0.12 })); g.append(el('line', { x1: X(m2), x2: X(m2), y1: 48, y2: 124, stroke: 'var(--acc)', 'stroke-width': 2 })); yaz(g, X(m2) + 4, 46, `X̄ₙ = ${tr(m2, 2)} · σₙ = ${tr(s2, 2)}`, { k: 13, b: true, r: 'var(--acc)' }); }
    if (adim >= 5) { ok(g, X(m2), 70, X(PMP), 70, 'var(--tur)', 3); nokta(g, X(PMP), 70, 7, 'var(--tur)'); yaz(g, X(PMP), 58, `PMP ≈ ${Math.round(PMP)} mm`, { h: 'end', k: 15, b: true, r: 'var(--tur)' }); yaz(g, (X(m2) + X(PMP)) / 2, 88, `Km·σₙ = ${tr(Km, 2)} × ${tr(s2, 2)}`, { h: 'middle', k: 13, r: 'var(--tur)' }); }
    // alt panel: σₙ₋₁ biriminde uzaklık
    if (adim >= 2) {
      const Z = (z) => 50 + (z + 2) / 15 * 480, y0 = 330;
      g.append(el('line', { x1: Z(-2), x2: Z(13), y1: y0, y2: y0, stroke: 'var(--ikincil)' }));
      for (let z = -2; z <= 13; z += 1) { g.append(el('line', { x1: Z(z), x2: Z(z), y1: y0 - 4, y2: y0 + 4, stroke: 'var(--ikincil)' })); if (z % 2 === 0) yaz(g, Z(z), y0 + 20, String(z), { h: 'middle', k: 12, r: 'var(--ikincil)' }); }
      yaz(g, Z(13), y0 + 38, 'uzaklık: (X − X̄ₙ₋₁) / σₙ₋₁', { h: 'end', k: 13, b: true });
      yaz(g, 40, 180, `Xm'siz 11 değer: X̄ₙ₋₁ = ${tr(m1, 2)} mm · σₙ₋₁ = ${tr(s1, 2)} mm`, { k: 14, b: true });
      g.append(el('rect', { x: Z(-1), y: 270, width: Z(1) - Z(-1), height: 66, fill: 'var(--acc)', opacity: 0.15 }));
      const yg = {}; kisa.forEach((v) => { const z = (v - m1) / s1, kx = Math.round(Z(z) / 8); yg[kx] = (yg[kx] || 0) + 1; nokta(g, Z(z), y0 - 8 - (yg[kx] - 1) * 10, 4.5, 'var(--yazi)'); });
      yaz(g, Z(0), 262, '±1σ: sıradan yıllar', { h: 'middle', k: 12, r: 'var(--acc)' });
      if (adim >= 3) { nokta(g, Z(Km), y0 - 8, 7, 'var(--tur)'); ok(g, Z(0), 236, Z(Km), 236, 'var(--tur)', 3); yaz(g, (Z(0) + Z(Km)) / 2, 226, `Km = (210 − ${tr(m1, 2)}) / ${tr(s1, 2)} = ${tr(Km, 2)}`, { h: 'middle', k: 15, b: true, r: 'var(--tur)' }); yaz(g, Z(Km), y0 - 20, '210', { h: 'middle', k: 13, b: true, r: 'var(--tur)' }); }
    }
    const not = ['1. adım: serinin hepsi', '2. adım: en büyük değer (Xm) ayrılır', '3. adım: kalan serinin ortalaması ve σ\'sı', '4. adım: Km = Xm\'nin σₙ₋₁ biriminde uzaklığı', '5. adım: tüm serinin X̄ₙ ve σₙ\'si', '6. adım: PMP = X̄ₙ + Km σₙ'][adim];
    yaz(g, 40, 410, not + ' (popülasyon σ)', { k: 14, b: true, r: 'var(--ikincil)' });
  };

  Sekil.m316_gumbel = function (kap) {
    const W = 560, H = 380, svg = svgYap(kap, W, H, 'Gumbel frekans katsayısı K_T');
    const KT = (T) => -Math.sqrt(6) / Math.PI * (0.5772 + Math.log(Math.log(T / (T - 1))));
    const d = eksen(svg, { W, H, x: [1.05, 1000], y: [-1.5, 5.5], xlog: true, xt: [2, 5, 10, 20, 50, 100, 200, 500, 1000], yt: [-1, 0, 1, 2, 3, 4, 5], yf: (v) => v.toLocaleString('tr-TR'), xad: 'dönüş aralığı T (yıl, log)', yad: 'K_T' });
    const p = []; for (let u = Math.log10(1.05); u <= 3.0001; u += 0.01) p.push([d.x(10 ** u), d.y(KT(10 ** u))]);
    svg.append(el('path', { d: yol(p), fill: 'none', stroke: 'var(--acc)', 'stroke-width': 3 }));
    for (const [T, ad] of [[2.327, 'T ≈ 2,33 → K = 0 (ortalama)'], [50, 'K₅₀ = 2,592'], [100, 'K₁₀₀ = 3,137']]) { nokta(svg, d.x(T), d.y(KT(T))); yaz(svg, d.x(T) + (T > 60 ? -8 : 8), d.y(KT(T)) + (T > 60 ? -10 : 18), ad, { k: 13, b: true, h: T > 60 ? 'end' : 'start' }); }
    yaz(svg, d.x(1.2), d.y(5.1), 'Hershfield Km ≈ 9–15: bu eksenin çok üstünde', { k: 13, r: 'var(--tur)', b: true });
    const m = nokta(svg, 0, 0, 7, 'var(--tur)');
    const yazOku = okuma(kap, ['T', 'K_T', 'X_T = 62 + K_T·18']);
    const k = kontrol(kap);
    const s = surgu(k, 'T', 0.05, 3, 0.01, 2, (v) => `${tr(10 ** v, 10 ** v < 10 ? 2 : 0)} yıl`);
    const ciz = () => { const T = 10 ** s.v, K = KT(T); m.setAttribute('cx', d.x(T)); m.setAttribute('cy', d.y(sinir(K, -1.5, 5.5))); yazOku({ T: `${tr(T, T < 10 ? 2 : 0)} yıl`, K_T: tr(K, 3), 'X_T = 62 + K_T·18': `${tr(62 + K * 18)} mm` }); };
    s.inp.addEventListener('input', ciz); ciz();
  };

  /* ================= D · HAZNE VE BUHARLAŞMA ================= */
  const YIL = 31536000;
  Sekil.m316_hazne = function (kap) {
    const W = 560, H = 300, svg = svgYap(kap, W, H, 'Hazne su bütçesi');
    const g = el('g'); svg.append(g);
    g.append(el('path', { d: 'M20,120 C80,130 110,250 200,262 L420,262 L420,90 L470,90 L470,282 L20,282 Z', fill: 'var(--yuzey)', stroke: 'var(--yazi)', 'stroke-width': 2 }));
    yaz(g, 445, 112, 'baraj', { h: 'middle', k: 12, r: 'var(--ikincil)' });
    const su = el('path', { fill: 'var(--acc)', opacity: 0.3 }), seviye = el('line', { stroke: 'var(--acc)', 'stroke-width': 3 }); g.append(su, seviye);
    const oklar = el('g'); g.append(oklar);
    const yd = yaz(g, 300, 30, '', { h: 'middle', k: 18, b: true, r: 'var(--tur)' });
    const yazOku = okuma(kap, ['terimler (m/yıl)', 'dh/dt', '3 m yükselme', 'kararlı Qout']);
    const k = kontrol(kap);
    const sP = surgu(k, 'P', 0, 2, 0.01, 1.0, (v) => `${tr(v, 2)} m/yıl`), sE = surgu(k, 'E', 0, 8, 0.1, 1.1, (v) => `${tr(v)} mm/gün`), sI = surgu(k, 'Qin', 0, 6, 0.01, 1.75, (v) => `${tr(v, 2)} m³/s`), sO = surgu(k, 'Qout', 0, 6, 0.01, 0, (v) => `${tr(v, 2)} m³/s`);
    const A = 1e8;
    const ciz = () => {
      const P = sP.v, E = sE.v * 365 / 1000, I = sI.v * YIL / A, O = sO.v * YIL / A, dh = P - E + I - O;
      const yS = 175 - sinir(dh, -2, 2) * 25, xs = (yy) => 20 + (yy - 120) / 142 * 180 * 0.6;
      su.setAttribute('d', `M${xs(yS)},${yS} L420,${yS} L420,262 L200,262 C110,250 80,130 ${xs(yS)},${yS} Z`);
      seviye.setAttribute('x1', xs(yS)); seviye.setAttribute('x2', 420); seviye.setAttribute('y1', yS); seviye.setAttribute('y2', yS);
      oklar.replaceChildren(); const w = (v) => 1.5 + 4 * Math.min(Math.abs(v), 2);
      ok(oklar, 230, 40, 230, yS - 6, 'var(--acc)', w(P)); yaz(oklar, 238, 70, `P ${tr(P, 2)}`, { k: 13, b: true, r: 'var(--acc)' });
      ok(oklar, 330, yS - 6, 330, 50, 'var(--tur)', w(E)); yaz(oklar, 338, 80, `E ${tr(E, 4)}`, { k: 13, b: true, r: 'var(--tur)' });
      ok(oklar, 30, 212, 140, 240, 'var(--acc)', w(I)); yaz(oklar, 26, 200, `Qin/A ${tr(I, 3)}`, { k: 13, b: true, r: 'var(--acc)' });
      if (O > 0) { ok(oklar, 470, 250, 552, 250, 'var(--acc)', w(O)); yaz(oklar, 552, 238, `Qout/A ${tr(O, 3)}`, { h: 'end', k: 13, b: true, r: 'var(--acc)' }); }
      yd.textContent = `dh/dt = ${tr(dh, 3)} m/yıl`;
      const kar = (P - E + I) * A / YIL;
      yazOku({ 'terimler (m/yıl)': `P ${tr(P, 2)} − E ${tr(E, 4)} + Qin/A ${tr(I, 3)} − Qout/A ${tr(O, 3)}`, 'dh/dt': `${tr(dh, 3)} m/yıl`, '3 m yükselme': dh > 0 ? `${tr(3 / dh, 2)} yıl` : 'yükselmez', 'kararlı Qout': `${tr(sI.v, 2)} + (P − E)·A/yıl = ${tr(kar, 2)} m³/s` });
    };
    [sP, sE, sI, sO].forEach((s) => s.inp.addEventListener('input', ciz));
    const k2 = kontrol(kap);
    dugme(k2, 'S25 · slayt verisi', true).addEventListener('click', () => { sP.set(1); sE.set(1.1); sI.set(1.75); sO.set(0); ciz(); });
    dugme(k2, 'S25-c · kararlı bırakım', true).addEventListener('click', () => { sP.set(1); sE.set(1.1); sI.set(1.75); sO.set(3.65); ciz(); });
    ciz();
  };

  Anim.m316_hazne = function (kap) {
    const W = 560, H = 330, svg = svgYap(kap, W, H, 'Hazne seviyesinin zamanla yükselmesi');
    const d = eksen(svg, { W, H, L: 150, x: [0, 4], y: [0, 4], xt: [0, 1, 2, 3, 4], yt: [0, 1, 2, 3, 4], xad: 't (yıl)', yad: '' });
    yaz(svg, 150, 20, 'seviye artışı h (m)', { k: 14, b: true });
    svg.append(el('rect', { x: 30, y: d.y(4), width: 80, height: d.y(0) - d.y(4), fill: 'var(--yuzey)', stroke: 'var(--yazi)', 'stroke-width': 2 }));
    const tank = el('rect', { x: 31, width: 78, fill: 'var(--acc)', opacity: 0.4 }); svg.append(tank);
    svg.append(el('line', { x1: 24, x2: 116, y1: d.y(3), y2: d.y(3), stroke: 'var(--tur)', 'stroke-dasharray': '5 4' })); yaz(svg, 70, d.y(3) - 6, 'hedef 3 m', { h: 'middle', k: 12, b: true, r: 'var(--tur)' });
    svg.append(el('line', { x1: d.x(0), x2: d.x(4), y1: d.y(3), y2: d.y(3), stroke: 'var(--tur)', 'stroke-dasharray': '5 4' }));
    const slayt = el('path', { d: yol([[d.x(0), d.y(0)], [d.x(3 / 1.05), d.y(3)]]), fill: 'none', stroke: 'var(--ikincil)', 'stroke-dasharray': '6 5', 'stroke-width': 2 }); svg.append(slayt);
    yaz(svg, d.x(2.9), d.y(2.2), 'slayt toplamı 1,05 → 2,86 yıl', { k: 12, r: 'var(--ikincil)' });
    const egri = el('path', { fill: 'none', stroke: 'var(--acc)', 'stroke-width': 3.5 }); svg.append(egri);
    const m = nokta(svg, 0, 0, 7, 'var(--acc)');
    const yazOku = okuma(kap, ['t', 'h', 'Qout', 'dh/dt']);
    const k = kontrol(kap);
    const btn = dugme(k, '▶ Oynat'), b2 = dugme(k, 'Baştan', true);
    const dh = 1.0 - 1.1 * 365 / 1000 + 1.75 * YIL / 1e8, tH = 3 / dh;
    let t = 0;
    const h = (tt) => Math.min(3, dh * tt);
    const ciz = () => {
      const p = []; for (let u = 0; u <= t + 1e-9; u += 0.02) p.push([d.x(u), d.y(h(u))]); p.push([d.x(t), d.y(h(t))]);
      egri.setAttribute('d', yol(p)); m.setAttribute('cx', d.x(t)); m.setAttribute('cy', d.y(h(t)));
      tank.setAttribute('y', d.y(h(t))); tank.setAttribute('height', d.y(0) - d.y(h(t)));
      const dolu = t >= tH;
      yazOku({ t: `${tr(t, 2)} yıl`, h: `${tr(h(t), 2)} m`, Qout: dolu ? '3,65 m³/s (kararlı bırakım)' : '0', 'dh/dt': dolu ? '0 (seviye sabit)' : `${tr(dh, 3)} m/yıl → 3 m: ${tr(tH, 2)} yıl` });
    };
    const oyn = dongu(btn, (dt) => { t += dt * 0.7; if (t >= 4) { t = 4; ciz(); return false; } ciz(); });
    b2.addEventListener('click', () => { oyn.dur(); t = 0; ciz(); });
    ciz();
    return { dur: oyn.dur };
  };

  const esT = (T) => 6.112 * Math.exp(17.67 * T / (T + 243.5));
  Sekil.m316_dalton = function (kap) {
    const W = 560, H = 300, svg = svgYap(kap, W, H, 'Harbeck–Meyers buharlaşma: buhar basıncı farkı ve rüzgâr');
    const g = el('g'); svg.append(g);
    g.append(el('rect', { x: 20, y: 230, width: 520, height: 56, fill: 'var(--acc)', opacity: 0.3 })); yaz(g, 30, 272, 'göl yüzeyi (Ts)', { k: 13, b: true, r: 'var(--acc)' });
    g.append(el('line', { x1: 20, x2: 540, y1: 80, y2: 80, stroke: 'var(--ikincil)', 'stroke-dasharray': '5 5' })); yaz(g, 30, 72, '2 m seviyesi (Ta, bağıl nem)', { k: 13, r: 'var(--ikincil)' });
    const dg = el('g'); g.append(dg);
    const yazOku = okuma(kap, ['eₛ(Ts)', 'e₂ = BN·eₛ(Ta)', 'E = b·u₂·(eₛ − e₂)']);
    const k = kontrol(kap);
    const sTs = surgu(k, 'Ts', 5, 35, 0.5, 25, (v) => `${tr(v)} °C`), sTa = surgu(k, 'Ta', 5, 35, 0.5, 22, (v) => `${tr(v)} °C`), sRH = surgu(k, 'BN', 10, 100, 1, 60, (v) => `%${v}`), sU = surgu(k, 'u₂', 0, 10, 0.1, 3, (v) => `${tr(v)} m/s`);
    const ciz = () => {
      const es = esT(sTs.v), ea = esT(sTa.v), e2 = sRH.v / 100 * ea, de = es - e2, E = 0.0119 * sU.v * de * 10;
      dg.replaceChildren();
      const bar = (x, v, ad, renk) => { const h = v / 45 * 120; dg.append(el('rect', { x, y: 220 - h, width: 46, height: h, fill: renk, opacity: 0.75 })); yaz(dg, x + 23, 214 - h, `${tr(v)} mb`, { h: 'middle', k: 13, b: true }); yaz(dg, x + 23, 222 - h - 18, ad, { h: 'middle', k: 12, r: 'var(--ikincil)' }); };
      bar(70, es, 'yüzeyde eₛ', 'var(--acc)'); bar(140, e2, '2 m\'de e₂', 'var(--ikincil)');
      for (let i = 0; i < 3; i++) ok(dg, 250 + i * 40, 50 + i * 4, 250 + i * 40 + 20 + 14 * sU.v, 50 + i * 4, 'var(--ikincil)', 1.5 + sU.v / 4);
      yaz(dg, 250, 36, `rüzgâr u₂ = ${tr(sU.v)} m/s`, { k: 13, b: true });
      const w = 1.5 + Math.min(Math.abs(E), 15) * 0.9;
      if (E >= 0) ok(dg, 430, 226, 430, 96, 'var(--tur)', w); else ok(dg, 430, 96, 430, 226, 'var(--yesil)', w);
      yaz(dg, 445, 160, `E = ${tr(E, 2)} mm/gün`, { k: 15, b: true, r: E >= 0 ? 'var(--tur)' : 'var(--yesil)' });
      if (E < 0) yaz(dg, 445, 180, 'e₂ > eₛ → yoğuşma', { k: 12, r: 'var(--yesil)' });
      yazOku({ 'eₛ(Ts)': `${tr(es, 2)} mb (Tetens)`, 'e₂ = BN·eₛ(Ta)': `${tr(sRH.v / 100, 2)} × ${tr(ea, 2)} = ${tr(e2, 2)} mb`, 'E = b·u₂·(eₛ − e₂)': `0,0119 × ${tr(sU.v)} × ${tr(de, 2)} = ${tr(E / 10, 3)} cm/gün = ${tr(E, 2)} mm/gün` });
    };
    [sTs, sTa, sRH, sU].forEach((s) => s.inp.addEventListener('input', ciz)); ciz();
  };

  Sekil.m316_enerji = function (kap) {
    const W = 560, H = 230, svg = svgYap(kap, W, H, 'Buharlaşma derinliği ve gizli ısı akısı');
    const X = (v) => 140 + v / 700 * 400;
    const g = el('g'); svg.append(g);
    for (let v = 0; v <= 700; v += 100) { g.append(el('line', { x1: X(v), x2: X(v), y1: 20, y2: 196, stroke: 'var(--cizgi)' })); yaz(g, X(v), 214, String(v), { h: 'middle', k: 12, r: 'var(--ikincil)' }); }
    yaz(g, 540, 228, 'W/m²', { h: 'end', k: 13, b: true });
    const satir = (y, ad) => yaz(g, 132, y + 18, ad, { h: 'end', k: 13, b: true });
    satir(30, 'LE (senin E)'); satir(80, 'yaz öğlesi Rn'); satir(130, 'günlük ort. Rn');
    g.append(el('rect', { x: X(0), y: 80, width: X(600) - X(0), height: 26, fill: 'var(--tur)', opacity: 0.35 }));
    g.append(el('rect', { x: X(150), y: 130, width: X(220) - X(150), height: 26, fill: 'var(--tur)', opacity: 0.35 })); yaz(g, X(225), 148, '≈150–220', { k: 12, r: 'var(--ikincil)' });
    const cub = el('rect', { x: X(0), y: 30, height: 26, fill: 'var(--acc)' }); g.append(cub);
    const yv = yaz(g, 0, 48, '', { k: 13, b: true, r: 'var(--acc)' });
    const yazOku = okuma(kap, ['kütle', 'LE = E·Lᵥ / 86 400 s', 'enerji (1 gün)']);
    const k = kontrol(kap);
    const s = surgu(k, 'E', 0, 10, 0.1, 4, (v) => `${tr(v)} mm/gün`);
    const Lv = 580 * 4.186 * 1000;
    const ciz = () => { const E = s.v, LE = E * Lv / 86400; cub.setAttribute('width', X(Math.min(LE, 700)) - X(0)); yv.setAttribute('x', X(Math.min(LE, 700)) + 6); yv.textContent = `${Math.round(LE)} W/m²`; yazOku({ kütle: `${tr(E)} mm = ${tr(E)} kg/m²`, 'LE = E·Lᵥ / 86 400 s': `${tr(E)} × 2,428×10⁶ / 86 400 = ${Math.round(LE)} W/m²`, 'enerji (1 gün)': `${tr(E * Lv / 1e6, 2)} MJ/m²` }); };
    s.inp.addEventListener('input', ciz); ciz();
  };

  /* ================= E · AKIŞ VE HEC-HMS ================= */
  const Qh = (t) => (t < 2 ? 5 : t <= 9 ? 5 + 40 * Math.sin((t - 2) / 7 * Math.PI / 2) ** 2 : t <= 24 ? 5 + 40 * ((24 - t) / 15) ** 1.6 : 5);
  Sekil.m316_hidrograf = function (kap, ayar = {}) {
    const adim = ayar.adim ?? 4, W = 560, H = 420, svg = svgYap(kap, W, H, 'Hiyetograf ve hidrograf; taban akışı ayrımı');
    const d = eksen(svg, { W, H, T: 120, x: [0, 26], y: [0, 50], xt: [0, 3, 6, 9, 12, 15, 18, 21, 24], yt: [0, 10, 20, 30, 40, 50], xad: 'zaman (saat)', yad: '' });
    yaz(svg, 8, 112, 'debi Q (m³/s)', { k: 14, b: true });
    const ry = (v) => 22 + v / 15 * 70;
    yaz(svg, d.x(5), 30, 'yağış (mm/h)', { k: 13, b: true, r: 'var(--ikincil)' });
    for (const [h, v] of [[1, 8], [2, 14], [3, 6]]) { svg.append(el('rect', { x: d.x(h - 1), y: 22, width: d.x(h) - d.x(h - 1) - 1, height: ry(v) - 22, fill: 'var(--acc)', opacity: 0.55 })); yaz(svg, d.x(h - 0.5), ry(v) + 14, String(v), { h: 'middle', k: 12, b: true }); }
    const top = []; for (let t = 0; t <= 26.001; t += 0.1) top.push([d.x(t), d.y(Qh(t))]);
    if (adim >= 2) { const p = []; for (let t = 2; t <= 24.001; t += 0.1) p.push([d.x(t), d.y(Qh(t))]); for (let t = 24; t >= 2; t -= 0.5) p.push([d.x(t), d.y(5)]); svg.append(el('path', { d: yol(p) + 'Z', fill: 'var(--acc)', opacity: 0.18 })); yaz(svg, d.x(10.5), d.y(18), 'doğrudan akış', { k: 14, b: true, r: 'var(--acc)' }); }
    svg.append(el('path', { d: yol(top), fill: 'none', stroke: 'var(--yazi)', 'stroke-width': 3.2 }));
    if (adim >= 1) { svg.append(el('line', { x1: d.x(0), x2: d.x(26), y1: d.y(5), y2: d.y(5), stroke: 'var(--tur)', 'stroke-width': 2.2, 'stroke-dasharray': '7 5' })); yaz(svg, d.x(14), d.y(5) + 18, 'taban akışı 5 m³/s', { k: 13, b: true, r: 'var(--tur)' }); }
    if (adim === 0 || ayar.adim == null) for (const [ad, t, q] of [['1', 5, Qh(5)], ['2', 9, 45], ['3', 15, Qh(15)], ['4', 24.6, 5]]) { rozet(svg, d.x(t) + (ad === '1' ? -16 : 16), d.y(q) - 14, ad, false); }
    if (adim === 0) yaz(svg, d.x(11), d.y(47), '1 yükselme · 2 tepe · 3 çekilme · 4 tabana dönüş', { k: 13, b: true });
    if (adim >= 3) { svg.append(el('path', { d: yol([[d.x(2), d.y(5)], [d.x(9), d.y(45)], [d.x(24), d.y(5)]]) + 'Z', fill: 'none', stroke: 'var(--tur)', 'stroke-width': 2.4 })); yaz(svg, d.x(15.5), d.y(36), 'üçgen: V = ½ × 22 h × 3600 × 40', { k: 13, b: true, r: 'var(--tur)' }); yaz(svg, d.x(15.5), d.y(32), '= 1,58×10⁶ m³ → 13,2 mm', { k: 13, b: true, r: 'var(--tur)' }); }
    if (adim >= 4) { svg.append(el('line', { x1: d.x(1.43), x2: d.x(1.43), y1: 22, y2: d.y(0), stroke: 'var(--yesil)', 'stroke-width': 2, 'stroke-dasharray': '4 4' })); svg.append(el('line', { x1: d.x(9), x2: d.x(9), y1: d.y(45), y2: d.y(0), stroke: 'var(--yesil)', 'stroke-width': 2, 'stroke-dasharray': '4 4' })); ok(svg, d.x(1.43), d.y(2), d.x(9), d.y(2), 'var(--yesil)', 2.5); yaz(svg, d.x(5.2), d.y(2) - 8, 'gecikme 7,6 h', { h: 'middle', k: 13, b: true, r: 'var(--yesil)' }); }
    const not = ['toplam hidrograf ve kısımları', 'taban akışı çizgisi çekilir', 'çizginin üstü = doğrudan akış', 'üçgenle hacim', 'yağış ağırlık merkezi 1,43 h → tepe 9 h'][adim];
    if (ayar.adim != null) { yaz(svg, d.x(26), 14, not, { h: 'end', k: 13, b: true, r: 'var(--ikincil)' }); return; }
    const m = nokta(svg, 0, 0, 6, 'var(--tur)'); m.setAttribute('visibility', 'hidden');
    const yazOku = okuma(kap, ['t', 'Q', 'doğrudan akış']);
    imlec(svg, d, (t) => { t = sinir(t, 0, 26); m.setAttribute('visibility', 'visible'); m.setAttribute('cx', d.x(t)); m.setAttribute('cy', d.y(Qh(t))); yazOku({ t: `${tr(t)} h`, Q: `${tr(Qh(t))} m³/s`, 'doğrudan akış': `${tr(Qh(t) - 5)} m³/s` }); });
    yazOku({ t: 'eğri üzerinde gezdir', Q: 'tepe 45 m³/s (9 h)', 'doğrudan akış': 'tepe 40 m³/s' });
  };

  Anim.m316_sizma = function (kap) {
    const W = 560, H = 360, svg = svgYap(kap, W, H, 'Horton ve Dunne akış oluşumu');
    const d = eksen(svg, { W, H, L: 230, x: [0, 6], y: [0, 70], xt: [0, 1, 2, 3, 4, 5, 6], yt: [0, 20, 40, 60], xad: 't (saat)', yad: '' });
    yaz(svg, 230, 20, 'mm/h', { k: 14, b: true });
    const kolon = el('g'); svg.append(kolon);
    const cizgiI = el('path', { fill: 'none', stroke: 'var(--acc)', 'stroke-width': 3 }), cizgiF = el('path', { fill: 'none', stroke: 'var(--tur)', 'stroke-width': 3 }), akisA = el('path', { fill: 'var(--acc)', opacity: 0.3 }), imx = el('line', { y1: d.T, y2: d.H - d.B, stroke: 'var(--yazi)', 'stroke-dasharray': '3 4' });
    svg.append(akisA, cizgiI, cizgiF, imx);
    const eI = yaz(svg, 0, 0, 'i yağış', { k: 13, b: true, r: 'var(--acc)' }), eF = yaz(svg, 0, 0, 'f sızma kapasitesi', { k: 13, b: true, r: 'var(--tur)' });
    const yazOku = okuma(kap, ['t', 'i ↔ f', 'akış hızı', 'birikimli akış']);
    const k = kontrol(kap);
    const btn = dugme(k, '▶ Oynat'), b2 = dugme(k, 'Baştan', true);
    const k2 = kontrol(kap);
    let mod = 0, t = 0;
    const sI = surgu(k2, 'i', 2, 70, 1, 40, (v) => `${v} mm/h`);
    const f = (tt) => (mod === 0 ? 10 + 50 * Math.exp(-1.5 * tt) : (tt < 30 / sI.v ? 40 : 0));
    const ciz = () => {
      const i = sI.v, p = [], pa = [];
      for (let u = 0; u <= 6.0001; u += 0.05) p.push([d.x(u), d.y(Math.min(f(u), 70))]);
      cizgiF.setAttribute('d', yol(p)); cizgiI.setAttribute('d', yol([[d.x(0), d.y(i)], [d.x(6), d.y(i)]]));
      for (let u = 0; u <= t + 1e-9; u += 0.05) { const ff = mod === 0 ? f(u) : f(u); if (i > ff) pa.push([u, ff]); }
      let dA = ''; if (pa.length) { dA = yol([[d.x(pa[0][0]), d.y(i)], ...pa.map(([u]) => [d.x(u), d.y(i)])]) + yol([...pa].reverse().map(([u, ff]) => [d.x(u), d.y(ff)])).replace('M', 'L') + 'Z'; }
      akisA.setAttribute('d', dA);
      imx.setAttribute('x1', d.x(t)); imx.setAttribute('x2', d.x(t));
      eI.setAttribute('x', d.x(4.2)); eI.setAttribute('y', d.y(i) - 8); eF.setAttribute('x', d.x(mod ? 0.2 : 0.55)); eF.setAttribute('y', d.y(Math.min(f(mod ? 0.2 : 0.55), 66)) - 8);
      let F = 0, Q = 0; for (let u = 0; u < t; u += 0.01) { const ff = f(u), inf = Math.min(i, ff); F += inf * 0.01; Q += Math.max(i - ff, 0) * 0.01; }
      kolon.replaceChildren();
      const x0 = 30, y0 = 40, h = 280, w = 150;
      kolon.append(el('rect', { x: x0, y: y0, width: w, height: h, fill: 'var(--yuzey)', stroke: 'var(--yazi)', 'stroke-width': 2 }));
      yaz(kolon, x0 + w / 2, y0 - 10, mod ? 'Dunne: doygunluk fazlası' : 'Horton: sızma fazlası', { h: 'middle', k: 13, b: true });
      if (mod === 0) { const z = Math.min(h - 4, F / 0.3 * 1.4); kolon.append(el('rect', { x: x0 + 1, y: y0 + 1, width: w - 2, height: z, fill: 'var(--acc)', opacity: 0.3 })); yaz(kolon, x0 + w / 2, y0 + z + 16, 'ıslanma cephesi', { h: 'middle', k: 12, r: 'var(--acc)' }); }
      else { const doy = Math.min(1, F / 30), yz = y0 + h - 40 - doy * (h - 40); kolon.append(el('rect', { x: x0 + 1, y: yz, width: w - 2, height: y0 + h - yz - 1, fill: 'var(--acc)', opacity: 0.35 })); kolon.append(el('line', { x1: x0, x2: x0 + w, y1: yz, y2: yz, stroke: 'var(--acc)', 'stroke-width': 2, 'stroke-dasharray': '5 4' })); yaz(kolon, x0 + w / 2, yz - 6, 'su tablası', { h: 'middle', k: 12, b: true, r: 'var(--acc)' }); }
      const r = Math.max(i - f(t), 0);
      if (r > 0) ok(kolon, x0 + 20, y0 - 4, x0 + w + 40, y0 + 10, 'var(--acc)', 2 + r / 8);
      yazOku({ t: `${tr(t, 2)} h`, 'i ↔ f': `i = ${i} · f = ${tr(f(t))} mm/h`, 'akış hızı': r > 0 ? `${tr(r)} mm/h (${mod ? 'toprak doydu' : 'i > f'})` : '0 (hepsi sızıyor)', 'birikimli akış': `${tr(Q)} mm · sızan ${tr(F)} mm` });
    };
    const oyn = dongu(btn, (dt) => { t += dt * 0.9; if (t >= 6) { t = 6; ciz(); return false; } ciz(); });
    b2.addEventListener('click', () => { oyn.dur(); t = 0; ciz(); });
    secenek(k2, ['Horton', 'Dunne'], 0, (m) => { mod = m; oyn.dur(); t = 0; sI.set(m ? 8 : 40); ciz(); });
    sI.inp.addEventListener('input', ciz);
    ciz();
    return { dur: oyn.dur };
  };

  Anim.m316_rasyonel = function (kap) {
    const W = 560, H = 380, svg = svgYap(kap, W, H, 'Rasyonel yöntem: katkı veren alan ve tepe debisi');
    const g = el('g'); svg.append(g);
    const seritler = []; for (let j = 0; j < 5; j++) { const r = el('rect', { x: 20 + j * 52, y: 30, width: 50, height: 120, fill: 'var(--cizgi)', stroke: 'var(--zemin)' }); g.append(r); seritler.push(r); yaz(g, 45 + j * 52, 166, `${25 - j * 5} dk`, { h: 'middle', k: 12, r: 'var(--ikincil)' }); }
    yaz(g, 20, 20, 'havza: 40 ha · eş-zaman şeritleri (çıkışa varış)', { k: 13, b: true });
    ok(g, 282, 90, 330, 90, 'var(--acc)', 3); yaz(g, 300, 76, 'çıkış', { k: 12, b: true, r: 'var(--acc)' });
    const d = eksen(svg, { W, H, T: 196, L: 60, x: [0, 90], y: [0, 6], xt: [0, 15, 30, 45, 60, 75, 90], yt: [0, 2, 4, 6], xad: 't (dk)', yad: '' });
    yaz(svg, 8, 186, 'Q (m³/s)', { k: 13, b: true });
    const egri = el('path', { fill: 'none', stroke: 'var(--acc)', 'stroke-width': 3.2 }), m = nokta(svg, 0, 0, 6, 'var(--acc)'); svg.append(egri, m);
    const tavan = el('line', { stroke: 'var(--tur)', 'stroke-dasharray': '6 5', 'stroke-width': 1.5 }); svg.append(tavan);
    const yT = yaz(svg, 0, 0, '', { k: 13, b: true, r: 'var(--tur)' });
    const yazOku = okuma(kap, ['t', 'katkı veren alan', 'Q = C·I·A/360', 'bu yağış süresinde tepe']);
    const k = kontrol(kap);
    const btn = dugme(k, '▶ Oynat'), b2 = dugme(k, 'Baştan', true);
    const k2 = kontrol(kap);
    const sD = surgu(k2, 'yağış süresi D', 10, 60, 1, 40, (v) => `${v} dk`);
    const C = 0.525, Atop = 40, Tc = 25;
    let t = 0;
    const I = () => 3600 / (sD.v + 20);
    const Qt = (tt) => { const D = sD.v, oran = tt <= D ? Math.min(tt, Tc) / Tc : Math.max(0, Math.min(D, Tc) - (tt - D)) / Tc; return C * I() * Atop * oran / 360; };
    const ciz = () => {
      const D = sD.v, p = []; for (let u = 0; u <= t + 1e-9; u += 0.5) p.push([d.x(u), d.y(Qt(u))]);
      egri.setAttribute('d', p.length > 1 ? yol(p) : ''); m.setAttribute('cx', d.x(t)); m.setAttribute('cy', d.y(Qt(t)));
      const tepe = C * I() * Atop * Math.min(1, D / Tc) / 360;
      tavan.setAttribute('x1', d.x(0)); tavan.setAttribute('x2', d.x(90)); tavan.setAttribute('y1', d.y(tepe)); tavan.setAttribute('y2', d.y(tepe));
      yT.setAttribute('x', d.x(62)); yT.setAttribute('y', d.y(tepe) - 6); yT.textContent = `tepe ${tr(tepe, 2)} m³/s`;
      const yagiyor = t <= D;
      seritler.forEach((r, j) => { const tv = 25 - j * 5; const aktif = yagiyor ? tv - 5 < t : tv - 5 < Math.min(D, Tc) - (t - D) + 0 && t - D < tv; r.setAttribute('fill', aktif && Qt(t) > 0 ? 'var(--acc)' : 'var(--cizgi)'); r.setAttribute('opacity', aktif && Qt(t) > 0 ? 0.55 : 1); });
      yazOku({ t: `${Math.round(t)} dk ${yagiyor ? '(yağıyor)' : '(yağış bitti)'}`, 'katkı veren alan': `${tr(Atop * Qt(t) / (C * I() * Atop / 360), 1)} ha / 40 ha`, 'Q = C·I·A/360': `${tr(Qt(t), 2)} m³/s · I(D) = ${tr(I())} mm/h`, 'bu yağış süresinde tepe': `${tr(tepe, 2)} m³/s ${D === Tc ? '← en büyük (D = Tc)' : '(en büyüğü D = Tc = 25 dk: 4,67)'}` });
    };
    const oyn = dongu(btn, (dt) => { t += dt * 14; const son = sD.v + Tc + 5; if (t >= Math.min(90, son)) { t = Math.min(90, son); ciz(); return false; } ciz(); });
    b2.addEventListener('click', () => { oyn.dur(); t = 0; ciz(); });
    sD.inp.addEventListener('input', () => { oyn.dur(); t = 0; ciz(); });
    ciz();
    return { dur: oyn.dur };
  };

  const IC_P = [0.4, 0.7, 0.9, 0.5, 0.2];
  const icKayip = (Ia = 1, fc = 0.1) => { let cum = 0; return IC_P.map((v) => { const once = cum; cum += v; const ia = Math.max(0, Math.min(v, Ia - once)); const kal = v - ia; const f = Math.min(kal, fc); return { v, ia, f, ex: Math.round((kal - f) * 1000) / 1000, cum }; }); };
  Sekil.m316_ickayip = function (kap, ayar = {}) {
    const adim = ayar.adim ?? 6, W = 560, H = 360, svg = svgYap(kap, W, H, 'Initial and Constant kayıp yöntemi');
    const d = eksen(svg, { W, H, x: [0, 5], y: [0, 1], xt: [0, 1, 2, 3, 4, 5], yt: [0, 0.2, 0.4, 0.6, 0.8, 1], xad: 'saat', yad: 'yağış (in)' });
    const R = icKayip();
    R.forEach((r, i) => {
      if (i + 1 > adim) return;
      const x0 = d.x(i) + 8, w = d.x(i + 1) - d.x(i) - 16; let y = 0;
      for (const [v, renk, op] of [[r.ia, 'var(--ikincil)', 0.45], [r.f, 'var(--tur)', 0.8], [r.ex, 'var(--acc)', 0.85]]) { if (v <= 0) continue; svg.append(el('rect', { x: x0, y: d.y(y + v), width: w, height: d.y(y) - d.y(y + v), fill: renk, opacity: op, stroke: i + 1 === adim && ayar.adim != null ? 'var(--yazi)' : 'none', 'stroke-width': 2 })); y += v; }
      yaz(svg, x0 + w / 2, d.y(r.v) - 22, `P ${tr(r.v)}`, { h: 'middle', k: 13, b: true });
      yaz(svg, x0 + w / 2, d.y(r.v) - 6, `fazla ${tr(r.ex)}`, { h: 'middle', k: 13, b: true, r: 'var(--acc)' });
    });
    const cumY = [0, ...R.map((r) => r.cum)];
    yaz(svg, d.x(0) + 4, d.y(0.97), 'birikimli P: ' + R.slice(0, Math.min(adim, 5)).map((r) => tr(r.cum)).join(' → ') + (adim >= 2 ? '  (Ia = 1 in 2. saatte doldu)' : ''), { k: 13, b: true, r: 'var(--ikincil)' });
    void cumY;
    const lj = [['Ia (başlangıç kaybı)', 'var(--ikincil)'], ['fc·Δt (sabit kayıp)', 'var(--tur)'], ['fazla yağış', 'var(--acc)']];
    lj.forEach(([a, r], i) => { svg.append(el('rect', { x: 330, y: 44 + i * 20, width: 14, height: 14, fill: r, opacity: 0.8 })); yaz(svg, 350, 56 + i * 20, a, { k: 13 }); });
    if (adim >= 6) yaz(svg, d.x(1.7), d.y(0.72), 'Σ fazla = 1,3 in · kayıp = 1,4 in', { k: 15, b: true, r: 'var(--acc)' });
    if (ayar.adim != null) return;
    const yazOku = okuma(kap, ['saat', 'dağılım']);
    imlec(svg, d, (x) => { const i = sinir(Math.floor(x), 0, 4), r = R[i]; yazOku({ saat: `${i + 1}. saat: P = ${tr(r.v)} in (birikimli ${tr(r.cum)})`, dağılım: `Ia'ya ${tr(r.ia)} · sabit kayıp ${tr(r.f)} · fazla ${tr(r.ex)} in` }); });
    yazOku({ saat: 'bir çubuğa dokun', dağılım: 'fazla: 0 · 0 · 0,8 · 0,4 · 0,1' });
  };

  Anim.m316_clark = function (kap) {
    const W = 560, H = 380, svg = svgYap(kap, W, H, 'Clark doğrusal hazne ötelemesi');
    const d = eksen(svg, { W, H, L: 130, x: [0, 24], y: [0, 320], xt: [0, 4, 8, 12, 16, 20, 24], yt: [0, 100, 200, 300], xad: 't (saat)', yad: '' });
    yaz(svg, 130, 20, 'debi (m³/s)', { k: 14, b: true });
    const I = [0, 100, 300, 200, 50]; while (I.length < 25) I.push(0);
    I.forEach((v, t) => { if (v > 0) svg.append(el('rect', { x: d.x(t - 1) + 2, y: d.y(v), width: d.x(t) - d.x(t - 1) - 4, height: d.y(0) - d.y(v), fill: 'var(--ikincil)', opacity: 0.35 })); });
    yaz(svg, d.x(2.2), d.y(300) - 6, 'giriş I (zaman–alan)', { k: 13, r: 'var(--ikincil)', b: true });
    const egri = el('path', { fill: 'none', stroke: 'var(--acc)', 'stroke-width': 3.2 }), ng = el('g'); svg.append(egri, ng);
    svg.append(el('rect', { x: 26, y: 60, width: 70, height: 250, fill: 'var(--yuzey)', stroke: 'var(--yazi)', 'stroke-width': 2 }));
    yaz(svg, 61, 50, 'hazne S', { h: 'middle', k: 13, b: true });
    const su = el('rect', { x: 27, width: 68, fill: 'var(--acc)', opacity: 0.4 }); svg.append(su);
    const yS = yaz(svg, 61, 330, '', { h: 'middle', k: 12, b: true, r: 'var(--acc)' });
    const yazOku = okuma(kap, ['C_A, C_B', 't', 'Oₜ = C_A·Iₜ + C_B·Oₜ₋₁', 'tepe']);
    const k = kontrol(kap);
    const btn = dugme(k, '▶ Oynat'), b2 = dugme(k, 'Baştan', true);
    const k2 = kontrol(kap);
    const sR = surgu(k2, 'R', 1, 30, 0.5, 12, (v) => `${tr(v)} h`);
    let t = 0, faz = 0;
    const seri = () => { const CA = 1 / (sR.v + 0.5), O = [0]; for (let i = 1; i <= 24; i++) O.push(CA * I[i] + (1 - CA) * O[i - 1]); return { CA, O }; };
    const ciz = () => {
      const { CA, O } = seri(), n = Math.floor(t);
      egri.setAttribute('d', yol(O.slice(0, n + 1).map((v, i) => [d.x(i), d.y(v)])));
      ng.replaceChildren(); for (let i = 1; i <= n; i++) nokta(ng, d.x(i), d.y(O[i]), 4, 'var(--acc)');
      const S = sR.v * O[n] * 3600 / 1e6, hh = Math.min(248, S / 12 * 248);
      su.setAttribute('y', 309 - hh); su.setAttribute('height', hh); yS.textContent = `S = R·O = ${tr(S, 2)}×10⁶ m³`;
      let tp = 0; O.forEach((v, i) => { if (v > O[tp]) tp = i; });
      yazOku({ 'C_A, C_B': `C_A = 1/(${tr(sR.v)} + 0,5) = ${tr(CA, 3)} · C_B = ${tr(1 - CA, 3)}`, t: `${n} h`, 'Oₜ = C_A·Iₜ + C_B·Oₜ₋₁': n ? `${tr(CA, 3)}·${I[n]} + ${tr(1 - CA, 3)}·${tr(O[n - 1])} = ${tr(O[n])} m³/s` : 'O₀ = 0', tepe: `${tr(O[tp])} m³/s, t = ${tp} h (girişin tepesi 2 h'te)` });
    };
    const oyn = dongu(btn, (dt) => { faz += dt; if (faz >= 0.45) { faz = 0; t = Math.min(24, Math.floor(t) + 1); ciz(); if (t >= 24) return false; } });
    b2.addEventListener('click', () => { oyn.dur(); t = 0; ciz(); });
    sR.inp.addEventListener('input', () => { if (!oyn.acik() && t === 0) t = 24; ciz(); });
    ciz();
    return { dur: oyn.dur };
  };

  Sekil.m316_taban = function (kap) {
    const W = 560, H = 380, svg = svgYap(kap, W, H, 'Doğrusal hazne taban akışı çekilmesi');
    const icg = el('g'); svg.append(icg);
    const yazOku = okuma(kap, ['t', 'Q = Q₀·e^(−t/k)', 'Q/Q₀']);
    const k = kontrol(kap), k2 = kontrol(kap);
    const sK = surgu(k, 'k', 10, 200, 1, 70, (v) => `${v} h`), sT = surgu(k, 't', 0, 200, 1, 24, (v) => `${v} h`);
    let log = false;
    const ciz = () => {
      icg.replaceChildren();
      const d = eksen(icg, log ? { W, H, x: [0, 200], y: [1, 50], ylog: true, xt: [0, 50, 100, 150, 200], yt: [1, 2, 5, 10, 20, 50], xad: 't (saat)', yad: 'Q (m³/s, log)' } : { W, H, x: [0, 200], y: [0, 42], xt: [0, 50, 100, 150, 200], yt: [0, 10, 20, 30, 40], xad: 't (saat)', yad: 'Q (m³/s)' });
      const kk = sK.v, Q = (t) => 40 * Math.exp(-t / kk), iki = (t) => 20 * Math.exp(-t / 70) + 20 * Math.exp(-t / 100);
      const p = [], p2 = []; for (let t = 0; t <= 200; t += 1) { p.push([d.x(t), d.y(Math.max(Q(t), 1))]); p2.push([d.x(t), d.y(iki(t))]); }
      icg.append(el('path', { d: yol(p2), fill: 'none', stroke: 'var(--ikincil)', 'stroke-width': 2, 'stroke-dasharray': '6 5' }));
      yaz(icg, d.x(120), d.y(iki(120)) - 8, 'iki katman (70 h + 100 h)', { k: 12, r: 'var(--ikincil)' });
      icg.append(el('path', { d: yol(p), fill: 'none', stroke: 'var(--acc)', 'stroke-width': 3.2 }));
      if (kk === 70) for (const [t, q, ad] of [[24, 28.4, '24 h: 28,4'], [70, 14.7, 't = k: %36,8'], [97, 10, '97 h: 10']]) { nokta(icg, d.x(t), d.y(q)); yaz(icg, d.x(t) + 8, d.y(q) - 8, ad, { k: 13, b: true }); }
      const t = sT.v; nokta(icg, d.x(t), d.y(Math.max(Q(t), 1)), 7, 'var(--tur)');
      yazOku({ t: `${t} h`, 'Q = Q₀·e^(−t/k)': `40 × e^(−${t}/${kk}) = ${tr(Q(t), 2)} m³/s`, 'Q/Q₀': `%${tr(100 * Math.exp(-t / kk))}` });
    };
    [sK, sT].forEach((s) => s.inp.addEventListener('input', ciz));
    secenek(k2, ['doğrusal eksen', 'log eksen (düz çizgi olur)'], 0, (i) => { log = i === 1; ciz(); });
    ciz();
  };

  Anim.m316_oteleme = function (kap) {
    const W = 560, H = 380, svg = svgYap(kap, W, H, 'Kanal ötelemesi: Lag ve Muskingum');
    const d = eksen(svg, { W, H, T: 70, x: [0, 40], y: [0, 1600], xt: [0, 5, 10, 15, 20, 25, 30, 35, 40], yt: [0, 400, 800, 1200, 1600], xad: 't (saat)', yad: '' });
    yaz(svg, 8, 60, 'debi (cfs)', { k: 14, b: true });
    svg.append(el('line', { x1: 80, x2: 480, y1: 26, y2: 26, stroke: 'var(--acc)', 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.35 }));
    yaz(svg, 80, 16, 'Reach-1 girişi', { k: 12, b: true }); yaz(svg, 480, 16, 'çıkış (Lag 300 dk)', { h: 'end', k: 12, b: true });
    const dalga = el('circle', { cy: 26, r: 9, fill: 'var(--tur)' }); svg.append(dalga);
    const Ip = 1501.1, tp = 10, Ib = 60, Ifn = (t) => (t <= 0 ? Ib : Ib + (Ip - Ib) * ((t / tp) * Math.exp(1 - t / tp)) ** 4);
    const N = 40, I = [], OL = [], OM = [];
    for (let t = 0; t <= N; t++) I.push(Ifn(t));
    for (let t = 0; t <= N; t++) OL.push(Ifn(t - 5));
    OM.push(Ib); for (let t = 1; t <= N; t++) OM.push(0 * I[t] + 0.2 * I[t - 1] + 0.8 * OM[t - 1]);
    const gI = el('path', { fill: 'none', stroke: 'var(--ikincil)', 'stroke-width': 2.5 }), gL = el('path', { fill: 'none', stroke: 'var(--acc)', 'stroke-width': 3.2 }), gM = el('path', { fill: 'none', stroke: 'var(--tur)', 'stroke-width': 2.6, 'stroke-dasharray': '7 5' }), imx = el('line', { y1: d.T, y2: d.H - d.B, stroke: 'var(--yazi)', 'stroke-dasharray': '3 4' });
    svg.append(gI, gL, gM, imx);
    const lj = [['giriş I', 'var(--ikincil)'], ['Lag çıkışı (yalnız öteler)', 'var(--acc)'], ['Muskingum (K = 5 h, X = 0,1)', 'var(--tur)']];
    lj.forEach(([a, r], i) => { svg.append(el('rect', { x: 300, y: 84 + i * 20, width: 16, height: 5, fill: r })); yaz(svg, 322, 91 + i * 20, a, { k: 13 }); });
    const yazOku = okuma(kap, ['t', 'giriş', 'Lag çıkışı', 'Muskingum çıkışı']);
    const k = kontrol(kap);
    const btn = dugme(k, '▶ Oynat'), b2 = dugme(k, 'Baştan', true);
    let t = 0;
    const ciz = () => {
      const n = Math.floor(t), sl = (a) => yol(a.slice(0, n + 1).map((v, i) => [d.x(i), d.y(v)]));
      gI.setAttribute('d', sl(I)); gL.setAttribute('d', sl(OL)); gM.setAttribute('d', sl(OM));
      imx.setAttribute('x1', d.x(t)); imx.setAttribute('x2', d.x(t));
      const ilerle = sinir((t - tp) / 5, 0, 1); dalga.setAttribute('cx', 80 + 400 * ilerle); dalga.setAttribute('opacity', t >= tp - 2 && t <= tp + 7 ? 1 : 0.25);
      const tM = OM.indexOf(Math.max(...OM));
      yazOku({ t: `${n} h`, giriş: `${Math.round(I[n])} cfs (tepe 1501 @ ${tp} h)`, 'Lag çıkışı': `${Math.round(OL[n])} cfs (tepe 1501 @ ${tp + 5} h)`, 'Muskingum çıkışı': `${Math.round(OM[n])} cfs (tepe ${Math.round(Math.max(...OM))} @ ${tM} h)` });
    };
    const oyn = dongu(btn, (dt) => { t += dt * 6; if (t >= N) { t = N; ciz(); return false; } ciz(); });
    b2.addEventListener('click', () => { oyn.dur(); t = 0; ciz(); });
    ciz();
    return { dur: oyn.dur };
  };

  Sekil.m316_hms = function (kap) {
    const W = 560, H = 430, svg = svgYap(kap, W, H, 'HEC-HMS bileşenleri: hangi kutu hangi soruyu cevaplar');
    const g = el('g'); svg.append(g);
    const kutu = (x, y, w, h, b1, b2, id, renk = 'var(--acc)') => {
      const gg = el('g', id ? { 'data-git': kavramaGit(id), style: 'cursor:pointer', tabindex: 0, role: 'link', 'aria-label': `${b1} kavramına git` } : {});
      gg.append(el('rect', { x, y, width: w, height: h, rx: 10, fill: 'var(--zemin)', stroke: renk, 'stroke-width': 2 }));
      yaz(gg, x + w / 2, y + 22, b1, { h: 'middle', k: 14, b: true, r: renk }); if (b2) yaz(gg, x + w / 2, y + 40, b2, { h: 'middle', k: 12, r: 'var(--ikincil)' });
      if (id) gg.addEventListener('keydown', (e) => { if (e.key === 'Enter') location.hash = kavramaGit(id); });
      g.append(gg);
    };
    g.append(el('rect', { x: 10, y: 92, width: 540, height: 252, rx: 14, fill: 'var(--acc)', opacity: 0.06, stroke: 'var(--acc)', 'stroke-dasharray': '6 5' }));
    yaz(g, 22, 112, 'Basin model (nerede?) — havza elemanları', { k: 13, b: true, r: 'var(--acc)' });
    kutu(20, 14, 250, 52, 'Meteorologic model', 'ne kadar yağış? (ölçer ağırlığı)', 'thiessen', 'var(--tur)');
    kutu(290, 14, 250, 52, 'Control specifications', 'ne zaman? başlangıç, bitiş, Δt', 'hec-hms', 'var(--tur)');
    kutu(24, 126, 162, 56, 'Loss', 'ne kadarı akar?', 'ic-kayip');
    kutu(199, 126, 162, 56, 'Transform', 'ne zaman, hangi şekil?', 'clark');
    kutu(374, 126, 162, 56, 'Baseflow', 'ne kalır?', 'taban-akisi');
    kutu(24, 218, 162, 56, 'Reach · routing', 'kanalda ötele', 'oteleme');
    kutu(199, 218, 162, 56, 'Junction', 'kolları topla', 'hidrograf');
    kutu(374, 218, 162, 56, 'GIS', 'havzayı ayır', 'gis-havza');
    kutu(110, 290, 340, 46, 'Subbasin çıktısı = hidrograf', '', 'hidrograf', 'var(--yazi)');
    kutu(20, 362, 520, 56, 'Kalibrasyon: gözlenen akımla karşılaştır', 'NSE, PBIAS, tepe hatası → parametreyi ayarla', 'kalibrasyon', 'var(--yesil)');
    ok(g, 145, 66, 145, 124, 'var(--tur)', 2.5); ok(g, 186, 154, 197, 154, 'var(--ikincil)', 2); ok(g, 361, 154, 372, 154, 'var(--ikincil)', 2);
    ok(g, 280, 182, 280, 288, 'var(--ikincil)', 2); ok(g, 186, 246, 197, 246, 'var(--ikincil)', 2); ok(g, 280, 336, 280, 360, 'var(--yesil)', 2);
    const yazOku = okuma(kap, ['simülasyon']);
    yazOku({ simülasyon: 'Basin model + Meteorologic model + Control specifications · bir kutuya bas → o kavrama git' });
  };

  Sekil.m316_kalibrasyon = function (kap) {
    const W = 560, H = 360, svg = svgYap(kap, W, H, 'Gözlenen ve modellenen hidrograf: NSE ve PBIAS');
    const d = eksen(svg, { W, H, x: [0, 48], y: [0, 3500], xt: [0, 8, 16, 24, 32, 40, 48], yt: [0, 1000, 2000, 3000], xad: 't (saat)', yad: 'debi (cfs)' });
    const sek = (t, tp, Qp, w) => { const x = Math.max(t, 0) / tp; return 250 + (Qp - 250) * Math.pow(x * Math.exp(1 - x), 3 / w); };
    const ts = []; for (let t = 0; t <= 48; t += 0.25) ts.push(t);
    const Qo = ts.map((t) => sek(t, 17, 2942, 1));
    svg.append(el('path', { d: yol(ts.map((t, i) => [d.x(t), d.y(Qo[i])])), fill: 'none', stroke: 'var(--yazi)', 'stroke-width': 3 }));
    const gm = el('path', { fill: 'none', stroke: 'var(--acc)', 'stroke-width': 3, 'stroke-dasharray': '8 5' }); svg.append(gm);
    yaz(svg, d.x(30), d.y(3200), '— gözlenen  - - model', { k: 13, b: true });
    const yazOku = okuma(kap, ['tepe hatası', 'NSE', 'PBIAS (+ = model fazla)', 'zamanlama']);
    const k = kontrol(kap);
    const sS = surgu(k, 'zaman kayması', -3, 3, 0.25, 1.75, (v) => `${v > 0 ? '+' : ''}${tr(v, 2)} h`), sP = surgu(k, 'tepe', 2400, 3500, 1, 3083, (v) => `${v.toLocaleString('tr-TR')} cfs`), sW = surgu(k, 'yayvanlık', 0.7, 1.5, 0.01, 1, (v) => tr(v, 2));
    const ciz = () => {
      const Qm = ts.map((t) => sek(t - sS.v, 17, sP.v, sW.v));
      gm.setAttribute('d', yol(ts.map((t, i) => [d.x(t), d.y(Qm[i])])));
      const ort = Qo.reduce((a, b) => a + b, 0) / Qo.length; let pay = 0, payda = 0, so = 0, sm = 0;
      Qo.forEach((o, i) => { pay += (o - Qm[i]) ** 2; payda += (o - ort) ** 2; so += o; sm += Qm[i]; });
      const nse = 1 - pay / payda, pb = 100 * (sm - so) / so, ep = 100 * (sP.v - 2942) / 2942;
      yazOku({ 'tepe hatası': `(${sP.v} − 2942) / 2942 = %${ep >= 0 ? '+' : ''}${tr(ep)}`, NSE: `${tr(nse, 3)} ${nse > 0.9 ? '(çok iyi)' : nse > 0.75 ? '(iyi)' : nse > 0.5 ? '(orta)' : '(zayıf)'}`, 'PBIAS (+ = model fazla)': `%${tr(pb, 2)}`, zamanlama: sS.v > 0 ? `model ${tr(sS.v, 2)} h geç → Tc/lag küçült` : sS.v < 0 ? `model ${tr(-sS.v, 2)} h erken → Tc/lag büyüt` : 'zamanlama doğru' });
    };
    [sS, sP, sW].forEach((s) => s.inp.addEventListener('input', ciz));
    const k2 = kontrol(kap);
    dugme(k2, 'HW2 başlangıcı', true).addEventListener('click', () => { sS.set(1.75); sP.set(3083); sW.set(1); ciz(); });
    dugme(k2, 'Ayarlanmış', true).addEventListener('click', () => { sS.set(0); sP.set(2942); sW.set(1); ciz(); });
    ciz();
  };

  Sekil.m316_d8 = function (kap) {
    const W = 560, H = 360, svg = svgYap(kap, W, H, 'D8 akış yönü: en dik iniş');
    const z = [[46, 47, 46], [47, 50, 45], [49, 48, 43]], ad = [['KB', 'K', 'KD'], ['B', '', 'D'], ['GB', 'G', 'GD']];
    const c = 96, x0 = 30, y0 = 30, g = el('g'); svg.append(g);
    const egim = [];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      const mrk = i === 1 && j === 1, dd = (i !== 1 && j !== 1) ? 14.14 : 10, s = mrk ? null : (50 - z[i][j]) / dd;
      if (!mrk) egim.push([s, i, j]);
      g.append(el('rect', { x: x0 + j * c, y: y0 + i * c, width: c - 2, height: c - 2, fill: mrk ? 'var(--tur-zemin)' : 'var(--yuzey)', stroke: 'var(--cizgi)' }));
      yaz(g, x0 + j * c + c / 2, y0 + i * c + 40, `${z[i][j]} m`, { h: 'middle', k: 18, b: true });
      if (!mrk) { yaz(g, x0 + j * c + c / 2, y0 + i * c + 62, `${ad[i][j]} · ${tr(s, 3)}`, { h: 'middle', k: 13, r: 'var(--ikincil)' }); yaz(g, x0 + j * c + c / 2, y0 + i * c + 80, `${50 - z[i][j]}/${dd === 10 ? '10' : '14,14'}`, { h: 'middle', k: 12, r: 'var(--ikincil)' }); }
    }
    egim.sort((a, b) => b[0] - a[0]);
    const [, bi, bj] = egim[0];
    g.append(el('rect', { x: x0 + bj * c, y: y0 + bi * c, width: c - 2, height: c - 2, fill: 'none', stroke: 'var(--acc)', 'stroke-width': 4 }));
    ok(g, x0 + 1.5 * c, y0 + 1.5 * c - 20, x0 + (bj + 0.5) * c - 30, y0 + (bi + 0.5) * c - 20, 'var(--acc)', 4);
    const t = 340; yaz(g, t, 50, 'Merkez hücre 50 m', { k: 15, b: true });
    yaz(g, t, 76, 'eğim = düşüş / uzaklık', { k: 14 }); yaz(g, t, 98, 'yan komşu 10 m, çapraz 14,14 m', { k: 13, r: 'var(--ikincil)' });
    yaz(g, t, 132, `en dik: doğu ${tr(egim[0][0], 3)}`, { k: 15, b: true, r: 'var(--acc)' });
    yaz(g, t, 156, `ikinci: güneydoğu ${tr(egim[1][0], 3)}`, { k: 14 });
    yaz(g, t, 180, 'en alçak komşu (43) GD,', { k: 13, r: 'var(--ikincil)' }); yaz(g, t, 198, 'ama daha uzak → kazanamaz', { k: 13, r: 'var(--ikincil)' });
    yaz(g, t, 240, 'D8: 8 komşudan en dik', { k: 13, b: true }); yaz(g, t, 258, 'inişe giden tek yön', { k: 13, b: true });
  };

  /* küçük DEM üzerinde GIS adımları (kareler) */
  Sekil.m316_dem = function (kap, ayar = {}) {
    const adim = ayar.adim ?? 5, W = 560, H = 400, svg = svgYap(kap, W, H, 'Sayısal yükseklik modelinden alt havzaya');
    const Z0 = [[60, 58, 57, 56, 58, 61], [57, 54, 52, 51, 53, 57], [55, 46, 48, 47, 50, 54], [54, 50, 47, 44, 46, 52], [53, 49, 45, 42, 43, 50], [52, 48, 44, 40, 41, 47]];
    const n = 6, Z = Z0.map((r) => r.slice());
    if (adim >= 1) Z[2][1] = 47.1;
    const yon = [], acc = Z.map((r) => r.map(() => 1));
    for (let i = 0; i < n; i++) { yon.push([]); for (let j = 0; j < n; j++) { let en = 0, hedef = null; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { if (!a && !b) continue; const ii = i + a, jj = j + b; if (ii < 0 || jj < 0 || ii >= n || jj >= n) continue; const s = (Z[i][j] - Z[ii][jj]) / (a && b ? Math.SQRT2 : 1); if (s > en) { en = s; hedef = [ii, jj]; } } if (i === 5 && j === 3) hedef = [6, 3]; yon[i].push(hedef); } }
    const sira = []; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) sira.push([Z[i][j], i, j]); sira.sort((a, b) => b[0] - a[0]);
    for (const [, i, j] of sira) { const h = yon[i][j]; if (h && h[0] < n) acc[h[0]][h[1]] += acc[i][j]; }
    const c = 56, x0 = 16, y0 = 40, g = el('g'); svg.append(g);
    const zmin = 40, zmax = 61;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const x = x0 + j * c, y = y0 + i * c, akarsu = adim >= 4 && acc[i][j] >= (adim >= 5 ? 3 : 6);
      g.append(el('rect', { x, y, width: c - 2, height: c - 2, fill: akarsu ? 'var(--acc)' : 'var(--tur)', opacity: akarsu ? 0.55 : 0.1 + 0.5 * (zmax - Z[i][j]) / (zmax - zmin) * (adim >= 3 ? 0.4 : 1), stroke: i === 2 && j === 1 && adim <= 1 ? 'var(--yazi)' : 'none', 'stroke-width': 3 }));
      if (adim <= 1 || adim === 2) yaz(g, x + c / 2 - 1, y + c / 2 + 5, i === 2 && j === 1 && adim >= 1 ? '47,1' : String(Z[i][j]), { h: 'middle', k: 14, b: i === 2 && j === 1 });
      if (adim >= 3) yaz(g, x + c / 2 - 1, y + c / 2 + 5, String(acc[i][j]), { h: 'middle', k: 15, b: true, r: acc[i][j] >= 6 ? 'var(--yazi)' : 'var(--ikincil)' });
      if (adim >= 2 && yon[i][j]) { const [ii, jj] = yon[i][j], dx = jj - j, dy = ii - i, cx = x + c / 2 - 1, cy = y + c / 2 - 1; ok(g, cx - dx * 10 + (adim >= 3 ? 0 : 0), cy - dy * 10 + (adim === 2 ? 14 : 0), cx + dx * 18, cy + dy * 18 + (adim === 2 ? 14 : 0), 'var(--yazi)', 1.6); }
    }
    yaz(g, x0 + 3 * c + c / 2, y0 + n * c + 18, '↓ çıkış (40 m)', { h: 'middle', k: 13, b: true, r: 'var(--acc)' });
    const notlar = [['1 · Arazi (DEM)', 'her hücrede yükseklik (m)', '2. sıradaki 46 m hücre bir çukur:', 'bütün komşuları ondan yüksek'], ['2 · Preprocess Sinks', 'çukur en alçak komşusunun', 'hemen üstüne doldurulur (47,1)', 'yoksa su orada hapsolur'], ['3 · Preprocess Drainage', 'her hücreden en dik inişe', 'tek ok (D8 akış yönü)', ''], ['4 · Akış birikimi', 'her hücreden geçen', 'yukarı hücre sayısı', '(kendisi dahil)'], ['5 · Identify Streams', 'birikim ≥ 6 → akarsu', '(eşik büyük: az kol)', ''], ['6 · Eşiği düşür', 'birikim ≥ 3 → akarsu', 'daha çok kol → daha çok', 'kavşak ve alt havza']][adim];
    notlar.forEach((s, i) => yaz(g, 372, 70 + i * 24, s, { k: i ? 14 : 16, b: !i, r: i ? 'var(--yazi)' : 'var(--acc)' }));
  };

  /* ================= F · EK HESAPLAR ================= */
  const scsQ = (P, CN) => { const S = 25400 / CN - 254, Ia = 0.2 * S; return { S, Ia, Q: P > Ia ? (P - Ia) ** 2 / (P - Ia + S) : 0 }; };
  Sekil.m316_scs = function (kap) {
    const W = 560, H = 380, svg = svgYap(kap, W, H, 'SCS eğri numarası: yağış ve doğrudan akış');
    const d = eksen(svg, { W, H, x: [0, 250], y: [0, 250], xt: [0, 50, 100, 150, 200, 250], yt: [0, 50, 100, 150, 200, 250], xad: 'yağış P (mm)', yad: 'akış Q (mm)' });
    for (const CN of [60, 75, 90, 100]) { const p = []; for (let P = 0; P <= 250; P += 2) p.push([d.x(P), d.y(CN === 100 ? P : scsQ(P, CN).Q)]); svg.append(el('path', { d: yol(p), fill: 'none', stroke: 'var(--ikincil)', 'stroke-width': 1.6, 'stroke-dasharray': CN === 100 ? '3 4' : null })); const PP = 230; yaz(svg, d.x(PP) - 4, d.y(CN === 100 ? PP : scsQ(PP, CN).Q) - 6, `CN ${CN}`, { h: 'end', k: 13, r: 'var(--ikincil)' }); }
    for (const [CN, Q] of [[75, 26.9], [90, 53.9], [60, 9.9]]) { nokta(svg, d.x(80), d.y(Q)); }
    yaz(svg, d.x(80) + 8, d.y(53.9) - 6, 'S41 (P = 80)', { k: 13, b: true });
    const ana = el('path', { fill: 'none', stroke: 'var(--tur)', 'stroke-width': 3.2 }); svg.append(ana);
    const m = nokta(svg, 0, 0, 7, 'var(--tur)');
    const yazOku = okuma(kap, ['S = 25400/CN − 254', 'Ia = 0,2·S', 'Q', 'C = Q/P']);
    const k = kontrol(kap);
    const sC = surgu(k, 'CN', 40, 99, 1, 75, (v) => String(v)), sP = surgu(k, 'P', 0, 250, 1, 80, (v) => `${v} mm`);
    const ciz = () => { const CN = sC.v, P = sP.v, r = scsQ(P, CN), p = []; for (let x = 0; x <= 250; x += 2) p.push([d.x(x), d.y(scsQ(x, CN).Q)]); ana.setAttribute('d', yol(p)); m.setAttribute('cx', d.x(P)); m.setAttribute('cy', d.y(r.Q)); yazOku({ 'S = 25400/CN − 254': `${tr(r.S, 2)} mm`, 'Ia = 0,2·S': `${tr(r.Ia, 2)} mm`, Q: P <= r.Ia ? '0 (P ≤ Ia)' : `(${P} − ${tr(r.Ia, 2)})² / (${P} − ${tr(r.Ia, 2)} + ${tr(r.S, 2)}) = ${tr(r.Q)} mm`, 'C = Q/P': P ? tr(r.Q / P, 2) : '—' }); };
    [sC, sP].forEach((s) => s.inp.addEventListener('input', ciz)); ciz();
  };

  Sekil.m316_phi = function (kap) {
    const W = 560, H = 360, svg = svgYap(kap, W, H, 'φ-indeksi: sabit kayıp hızı');
    const Pv = [8, 22, 35, 18, 6];
    const d = eksen(svg, { W, H, x: [0, 5], y: [0, 40], xt: [0, 1, 2, 3, 4, 5], yt: [0, 10, 20, 30, 40], xad: 'saat', yad: 'şiddet (mm/h)' });
    const ust = el('g'); Pv.forEach((v, i) => { svg.append(el('rect', { x: d.x(i) + 6, y: d.y(v), width: d.x(1) - d.x(0) - 12, height: d.y(0) - d.y(v), fill: 'var(--ikincil)', opacity: 0.35 })); yaz(svg, d.x(i + 0.5), d.y(v) - 6, String(v), { h: 'middle', k: 14, b: true }); }); svg.append(ust);
    svg.append(el('line', { x1: d.x(0), x2: d.x(5), y1: d.y(11.6), y2: d.y(11.6), stroke: 'var(--ikincil)', 'stroke-dasharray': '3 4' })); yaz(svg, d.x(5) - 4, d.y(11.6) + 16, 'W-indeksi 11,6', { h: 'end', k: 12, r: 'var(--ikincil)' });
    const cz = el('line', { stroke: 'var(--tur)', 'stroke-width': 3 }); svg.append(cz);
    const yP = yaz(svg, 0, 0, '', { k: 14, b: true, r: 'var(--tur)' });
    const yazOku = okuma(kap, ['Σ(Pᵢ − φ)·Δt', 'hedef Q_d', 'giren saatler']);
    const k = kontrol(kap);
    const s = surgu(k, 'φ', 0, 35, 0.01, 13, (v) => `${tr(v, 2)} mm/h`);
    const ciz = () => {
      const f = s.v; ust.replaceChildren(); let top = 0; const gir = [];
      Pv.forEach((v, i) => { if (v > f) { top += v - f; gir.push(i + 1); ust.append(el('rect', { x: d.x(i) + 6, y: d.y(v), width: d.x(1) - d.x(0) - 12, height: d.y(f) - d.y(v), fill: 'var(--acc)', opacity: 0.6 })); } });
      cz.setAttribute('x1', d.x(0)); cz.setAttribute('x2', d.x(5)); cz.setAttribute('y1', d.y(f)); cz.setAttribute('y2', d.y(f));
      yP.setAttribute('x', d.x(0) + 4); yP.setAttribute('y', d.y(f) - 6); yP.textContent = `φ = ${tr(f, 2)}`;
      yazOku({ 'Σ(Pᵢ − φ)·Δt': `${tr(top, 2)} mm ${Math.abs(top - 31) < 0.05 ? '= 31 ✓' : top > 31 ? '> 31 → φ\'yi büyüt' : '< 31 → φ\'yi küçült'}`, 'hedef Q_d': '31 mm', 'giren saatler': gir.join(', ') || '—' });
    };
    s.inp.addEventListener('input', ciz);
    const k2 = kontrol(kap); dugme(k2, 'Çözüm φ = 14,67', true).addEventListener('click', () => { s.set(44 / 3); ciz(); });
    ciz();
  };

  Sekil.m316_bh = function (kap, ayar = {}) {
    const adim = ayar.adim ?? 3, W = 560, H = 360, svg = svgYap(kap, W, H, 'Birim hidrograf ile üst üste toplama');
    const U = [0, 5, 15, 10, 5, 0], A = [0, 10, 30, 20, 10, 0, 0], B = [0, 0, 5, 15, 10, 5, 0], S = A.map((v, i) => v + B[i]);
    const d = eksen(svg, { W, H, x: [-0.5, 6.5], y: [0, 40], xt: [0, 1, 2, 3, 4, 5, 6], yt: [0, 10, 20, 30, 40], xad: 't (saat)', yad: 'Q (m³/s)' });
    const bw = (d.x(1) - d.x(0)) * 0.7;
    for (let i = 0; i <= 6; i++) {
      const x = d.x(i) - bw / 2;
      if (adim === 0) { const v = U[i] || 0; if (v) svg.append(el('rect', { x, y: d.y(v), width: bw, height: d.y(0) - d.y(v), fill: 'var(--ikincil)', opacity: 0.6 })); if (v) yaz(svg, d.x(i), d.y(v) - 6, String(v), { h: 'middle', k: 13, b: true }); continue; }
      const a = A[i], b = adim >= 2 ? B[i] : 0;
      if (a) svg.append(el('rect', { x, y: d.y(a), width: bw, height: d.y(0) - d.y(a), fill: 'var(--acc)', opacity: 0.6 }));
      if (b) svg.append(el('rect', { x, y: d.y(a + b), width: bw, height: d.y(a) - d.y(a + b), fill: 'var(--tur)', opacity: 0.7 }));
      if (a + b) yaz(svg, d.x(i), d.y(a + b) - 6, adim >= 3 ? String(a + b) : adim === 2 ? `${a}+${b}` : String(a), { h: 'middle', k: 13, b: true });
    }
    const satir = [['BH: 10 mm fazla yağışın hidrografı', 'var(--ikincil)'], ['20 mm = 2 birim → 2 × BH (1. saat)', 'var(--acc)'], ['10 mm = 1 birim → 1 × BH, 1 h ötelenmiş', 'var(--tur)'], ['toplam: tepe 35 m³/s (2–3 h)', 'var(--yazi)']];
    satir.slice(adim === 0 ? 0 : 1, adim + 1).forEach(([s, r], i) => { svg.append(el('rect', { x: 250, y: 36 + i * 22, width: 14, height: 14, fill: r, opacity: 0.7 })); yaz(svg, 270, 48 + i * 22, s, { k: 13, b: i === adim - 1 || adim === 0 }); });
    if (ayar.adim != null) return;
    const yazOku = okuma(kap, ['t', 'Qₙ = Σ Pₘ·U']);
    imlec(svg, d, (x) => { const i = sinir(Math.round(x), 0, 6); yazOku({ t: `${i} h`, 'Qₙ = Σ Pₘ·U': `2 × ${U[i] || 0} + 1 × ${U[i - 1] || 0} = ${S[i]} m³/s` }); });
    yazOku({ t: 'bir sütuna dokun', 'Qₙ = Σ Pₘ·U': 'Σ hacim = 105 × 3600 = 378 000 m³ = 30 mm' });
  };

  Sekil.m316_normaloran = function (kap) {
    const W = 560, H = 320, svg = svgYap(kap, W, H, 'Normal oran yöntemi');
    const K = [['A', 48, 820], ['B', 62, 1050], ['C', 55, 930]], Nx = 900;
    const d = eksen(svg, { W, H, x: [0, 3], y: [0, 70], xt: [], yt: [0, 20, 40, 60], xad: '', yad: 'günlük yağış (mm)' });
    K.forEach(([ad, P, N], i) => {
      const x = d.x(i + 0.5), s = Nx / N * P;
      svg.append(el('rect', { x: x - 44, y: d.y(P), width: 40, height: d.y(0) - d.y(P), fill: 'var(--ikincil)', opacity: 0.45 }));
      svg.append(el('rect', { x: x + 4, y: d.y(s), width: 40, height: d.y(0) - d.y(s), fill: 'var(--acc)', opacity: 0.7 }));
      yaz(svg, x - 24, d.y(P) - 6, String(P), { h: 'middle', k: 13, b: true }); yaz(svg, x + 24, d.y(s) - 6, tr(s, 2), { h: 'middle', k: 13, b: true, r: 'var(--acc)' });
      yaz(svg, x, d.y(0) + 20, `${ad} · N = ${N}`, { h: 'middle', k: 13, b: true }); yaz(svg, x, d.y(0) + 37, `fark %${tr((N - Nx) / Nx * 100)}`, { h: 'middle', k: 12, r: Math.abs(N - Nx) / Nx > 0.1 ? 'var(--tur)' : 'var(--ikincil)' });
    });
    svg.append(el('line', { x1: d.x(0), x2: d.x(3), y1: d.y(53.0), y2: d.y(53.0), stroke: 'var(--acc)', 'stroke-width': 2 })); yaz(svg, d.x(3) - 4, d.y(53) + 16, 'Pₓ = 53,0 (normal oran)', { h: 'end', k: 13, b: true, r: 'var(--acc)' });
    svg.append(el('line', { x1: d.x(0), x2: d.x(3), y1: d.y(55.0), y2: d.y(55.0), stroke: 'var(--ikincil)', 'stroke-dasharray': '5 4' })); yaz(svg, d.x(0) + 4, d.y(55) - 6, 'aritmetik 55,0', { k: 12, r: 'var(--ikincil)' });
    yaz(svg, d.x(0) + 4, 24, 'gri: ölçülen Pᵢ · mavi: (Nₓ/Nᵢ)·Pᵢ, Nₓ = 900', { k: 13, b: true });
  };
})();
