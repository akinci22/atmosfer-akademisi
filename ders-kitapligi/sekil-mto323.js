/* MTO323 Atmosfer Kimyası — kitaba özel çizimler ve animasyonlar. Yalnız bu kitabın ajanı düzenler.
   Sekil.m323_<ad>(kap, ayar) → kap'ın içini kurar · Anim.m323_<ad>(kap, ayar) → { dur() } döndürür.
   Renkler CSS değişkeniyle (açık/koyu tema), dış görsel yok; sayılar kitabın hesap_dogrula.py'siyle aynı. */
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
  const ustY = (n) => (n < 0 ? '⁻' : '') + String(Math.abs(n)).split('').map((c) => UST[+c]).join('');
  const us10 = (v) => { const e = Math.round(Math.log10(v)); if (e === 0) return '1'; if (e === 1) return '10'; return '10' + ustY(e); };
  /* bilimsel gösterim: 8,2×10¹⁷ */
  const bil = (v, d = 2) => { if (!isFinite(v) || v === 0) return '0'; let e = Math.floor(Math.log10(Math.abs(v))); let m = v / 10 ** e; if (Math.abs(+m.toFixed(d - 1)) >= 10) { m /= 10; e += 1; } return e === 0 ? tr(m, d - 1) : `${tr(m, d - 1)}×10${ustY(e)}`; };
  const sure = (s) => (s < 120 ? `${tr(s, 0)} s` : s < 7200 ? `${tr(s / 60, 0)} dk` : s < 172800 ? `${tr(s / 3600, 1)} saat` : s < 6.3e7 ? `${tr(s / 86400, 0)} gün` : `${tr(s / 3.156e7, 1)} yıl`);

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
  function imlec(svg, d, cb) {
    const f = (ev) => { const p = svgNokta(svg, ev); if (!p) return; if (p.x < d.L - 2 || p.x > d.W - d.R + 2 || p.y < d.T - 6 || p.y > d.H - d.B + 6) return; cb(d.ix(p.x), d.iy(p.y), p.x, p.y); };
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
    gg.append(el('line', { x1, y1, x2: x2 - Math.cos(a) * u * 0.8, y2: y2 - Math.sin(a) * u * 0.8, stroke: renk, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-dasharray': kesik ? '6 5' : null }));
    gg.append(el('path', { d: `M${x2},${y2} L${x2 - u * Math.cos(a - 0.42)},${y2 - u * Math.sin(a - 0.42)} L${x2 - u * Math.cos(a + 0.42)},${y2 - u * Math.sin(a + 0.42)} Z`, fill: renk }));
    g.append(gg); return gg;
  }
  const nokta = (g, x, y, r = 5, renk = 'var(--yazi)') => { const c = el('circle', { cx: x, cy: y, r, fill: renk, stroke: 'var(--zemin)', 'stroke-width': 2 }); g.append(c); return c; };
  const tohum = (s) => () => (s = (s * 16807) % 2147483647) / 2147483647;
  const egri = (d, f, a, b, n = 160, log) => { const p = []; for (let i = 0; i <= n; i++) { const u = log ? 10 ** (Math.log10(a) + (Math.log10(b) - Math.log10(a)) * i / n) : a + (b - a) * i / n; const v = f(u); if (isFinite(v)) p.push([d.x(u), d.y(v)]); } return yol(p); };

  const kB = 1.381e-23, RG = 8.314, SIG = 5.67e-8, S0 = 1361;
  const TE = (S0 * 0.7 / (4 * SIG)) ** 0.25; // 254,6 K

  /* ============================== B1 · BİRİMLER ============================== */
  Sekil.m323_birim = function (kap, ayar = {}) {
    const W = 600, H = 300, svg = svgYap(kap, W, H, 'Karışım oranı, sayı yoğunluğu, kütle derişimi ve kısmi basınç arasındaki birim zinciri');
    svg.append(el('rect', { x: 18, y: 40, width: 204, height: 204, rx: 8, fill: 'var(--yuzey)', stroke: 'var(--yazi)', 'stroke-width': 1.5 }));
    yaz(svg, 120, 26, 'aynı hacimde hava (nokta ∝ n)', { h: 'middle', k: 13, b: true });
    yaz(svg, 120, 264, 'turuncu = X türü (pay abartılı)', { h: 'middle', k: 12, r: 'var(--ikincil)' });
    const rnd = tohum(11), yer = Array.from({ length: 170 }, () => [28 + rnd() * 184, 50 + rnd() * 184]);
    const ng = el('g'); svg.append(ng);
    const satir = [];
    const basl = ['χ — karışım oranı (mol payı)', 'n = P/(kT) — sayı yoğunluğu', 'C = χ·M/Vₘ — kütle derişimi', 'p = χ·P — kısmi basınç'];
    for (let i = 0; i < 4; i++) {
      const y0 = 30 + i * 66, r = el('rect', { x: 238, y: y0, width: 352, height: 58, rx: 8, fill: 'var(--zemin)', stroke: 'var(--cizgi)', 'stroke-width': 1.5 });
      svg.append(r); yaz(svg, 250, y0 + 22, basl[i], { k: 14, b: true });
      satir.push({ r, t: yaz(svg, 250, y0 + 45, '', { k: 14, r: 'var(--tur)', b: true }) });
    }
    const vur = { chi: [0, 3], n: [1], c: [2] }[ayar.vurgu] || [];
    vur.forEach((i) => { satir[i].r.setAttribute('stroke', 'var(--tur)'); satir[i].r.setAttribute('stroke-width', 3); });
    const k = kontrol(kap);
    const sP = surgu(k, 'P', 10, 1050, 1, 1013, (v) => `${v} hPa`), sT = surgu(k, 'T', 200, 320, 1, 288, (v) => `${v} K`);
    const chiT = (v) => (v >= 1000 ? `${tr(v / 1000, 2)} ppm` : `${tr(v, 1)} ppb`);
    const sC = surgu(k, 'χ', 0, 6, 0.01, Math.log10(40), (v) => chiT(10 ** v));
    const k2 = kontrol(kap);
    const MLER = [['O₃', 48.0], ['SO₂', 64.07], ['CO', 28.01], ['CO₂', 44.01], ['CH₄', 16.04]];
    let M = 48.0;
    const sec = secenek(k2, MLER.map((m) => `${m[0]} (M = ${tr(m[1], 2)})`), 0, (i) => { M = MLER[i][1]; ciz(); });
    const k3 = kontrol(kap);
    const hazir = [['S1 · 25 km', 25, 220, 8000, 0], ['S1 · yüzey', 1013, 288, 40, 0], ['S2 · SO₂ 25 °C', 1013, 298, 45.8, 1], ['S3 · CO₂ 0 °C', 1013, 273, 420000, 3]];
    for (const [ad, P, T, c, mi] of hazir) dugme(k3, ad, true).addEventListener('click', () => { sP.set(P); sT.set(T); sC.set(Math.log10(c)); M = MLER[mi][1]; sec.isaretle(mi); ciz(); });
    const ciz = () => {
      const P = sP.v * 100, T = sT.v, chi = 10 ** sC.v;
      const nh = P / (kB * T) / 1e6, nx = chi * 1e-9 * nh, Vm = RG * T / P * 1000, C = chi * M / Vm, p = chi * 1e-9 * P;
      satir[0].t.textContent = `${chiT(chi)} = ${bil(chi * 1e-9)} mol/mol (P ve T ile değişmez)`;
      satir[1].t.textContent = `hava ${bil(nh)} · X ${bil(nx)} molekül/cm³`;
      satir[2].t.textContent = `Vₘ = ${tr(Vm, 2)} L/mol → C = ${C >= 1000 ? tr(C / 1000, 1) + ' mg/m³' : tr(C, 1) + ' µg/m³'}`;
      satir[3].t.textContent = `${p < 0.01 ? bil(p) : tr(p, 2)} Pa`;
      ng.replaceChildren();
      const N = Math.round(sinir(170 * nh / 2.6e19, 1, 170));
      for (let i = 0; i < N; i++) ng.append(el('circle', { cx: yer[i][0], cy: yer[i][1], r: 3.4, fill: i % 8 === 0 ? 'var(--tur)' : 'var(--ikincil)', opacity: i % 8 === 0 ? 1 : 0.55 }));
    };
    for (const s of [sP, sT, sC]) s.inp.addEventListener('input', ciz);
    ciz();
  };

  Sekil.m323_sutun = function (kap) {
    const W = 600, H = 300, svg = svgYap(kap, W, H, 'Atmosferin kütlesi: yüzey basıncı, birim alandaki hava sütununun ağırlığıdır');
    svg.append(el('path', { d: 'M10,282 Q300,198 590,282 L590,300 L10,300 Z', fill: 'var(--yesil-zemin)', stroke: 'var(--yesil)', 'stroke-width': 2 }));
    svg.append(el('path', { d: 'M10,196 Q300,110 590,196', fill: 'none', stroke: 'var(--acc)', 'stroke-dasharray': '6 5' }));
    for (let i = 0; i < 9; i++) svg.append(el('rect', { x: 278, y: 152 + i * 10, width: 44, height: 10, fill: 'var(--acc)', opacity: 0.08 + i * 0.06 }));
    svg.append(el('rect', { x: 278, y: 152, width: 44, height: 90, fill: 'none', stroke: 'var(--yazi)', 'stroke-width': 1.5 }));
    ok(svg, 300, 170, 300, 236, 'var(--tur)', 3.5);
    yaz(svg, 334, 196, 'sütunun ağırlığı m·g', { k: 14, b: true, r: 'var(--tur)' });
    yaz(svg, 334, 216, 'taban alanına bölünür → P₀', { k: 13 });
    yaz(svg, 266, 236, 'A', { h: 'end', k: 14, b: true });
    yaz(svg, 300, 140, 'atmosfer tepesi (P → 0)', { h: 'middle', k: 12, r: 'var(--acc)' });
    yaz(svg, 20, 30, 'Bütün Dünya: m = P₀ · 4πR² / g', { k: 16, b: true });
    yaz(svg, 20, 52, 'yük (burden) = χ · (mol hava) · M(X)', { k: 14, r: 'var(--ikincil)' });
    const o = okuma(kap, ['A = 4πR²', 'm(atmosfer)', 'mol hava', 'X yükü']);
    const k = kontrol(kap);
    const GAZ = [['CH₄', 16.04, 1.92], ['CO₂', 44.01, 420], ['N₂O', 44.01, 0.33]];
    let gi = 0;
    const sX = surgu(k, 'χ', -1, 3, 0.01, Math.log10(1.92), (v) => `${tr(10 ** v, 2)} ppm`);
    const k2 = kontrol(kap);
    secenek(k2, GAZ.map((g) => g[0]), 0, (i) => { gi = i; sX.set(Math.log10(GAZ[i][2])); ciz(); });
    const ciz = () => {
      const A = 4 * Math.PI * 6.371e6 ** 2, m = 101325 * A / 9.81, mol = m / 0.02896, chi = 10 ** sX.v * 1e-6;
      const kg = chi * mol * GAZ[gi][1] * 1e-3;
      o({ 'A = 4πR²': `${bil(A, 3)} m²`, 'm(atmosfer)': `${bil(m, 3)} kg`, 'mol hava': `${bil(mol, 3)} mol`, 'X yükü': `${GAZ[gi][0]}: ${bil(kg, 3)} kg = ${kg / 1e9 >= 1e5 ? bil(kg / 1e9, 3) : tr(kg / 1e9, 0)} Tg` });
    };
    sX.inp.addEventListener('input', ciz); ciz();
  };

  /* ============================== B2 · SERA + BULUT ============================== */
  Sekil.m323_molekul = function (kap) {
    const W = 600, H = 300, svg = svgYap(kap, W, H, 'Hangi gaz kızılötesinde aktif: dokuz molekülün sınıflandırılması');
    const V = [['N₂', 'iki aynı atom', 0, 'Titreşimde iki özdeş atom simetrik kalır → dipol hep 0 → IR fotonu soğurulmaz.'],
      ['O₂', 'iki aynı atom', 0, 'N₂ gibi homonükleer: yük dağılımı hep simetrik, dipol değişmez.'],
      ['Ar', 'tek atom', 0, 'Bağ yok → titreşim yok → IR soğurması yok.'],
      ['CO₂', 'doğrusal O=C=O', 1, 'Kalıcı dipol 0, ama asimetrik gerilme (4,3 µm) ve bükülme (15 µm) dipolü salındırır → IR aktif.'],
      ['H₂O', 'bükük', 1, 'Bükük yapı → kalıcı dipol; titreşim ve dönme bantları çok geniş → en güçlü sera gazı.'],
      ['CH₄', 'dört yüzlü', 1, 'Simetrik görünür ama asimetrik titreşimleri dipol üretir (≈ 7,7 µm bandı).'],
      ['N₂O', 'doğrusal N=N=O', 1, 'İki ucu farklı atom → titreşimde dipol değişir.'],
      ['O₃', 'bükük', 1, 'Bükük üç oksijen; 9,6 µm bandı atmosferin "pencere" bölgesinde.'],
      ['CO', 'iki farklı atom', 1, 'Farklı atomlar → dipol var ve gerilmede değişir; derişimi küçük olduğundan doğrudan sera etkisi küçük.']];
    const o = okuma(kap, ['Seçilen']);
    V.forEach((m, i) => {
      const x = 14 + (i % 3) * 194, y = 14 + Math.floor(i / 3) * 96, g = el('g', { tabindex: 0, role: 'button', style: 'cursor:pointer' });
      g.append(el('rect', { x, y, width: 182, height: 84, rx: 10, fill: m[2] ? 'var(--tur-zemin)' : 'var(--yuzey)', stroke: m[2] ? 'var(--tur)' : 'var(--cizgi)', 'stroke-width': 2 }));
      yaz(g, x + 14, y + 34, m[0], { k: 24, b: true });
      yaz(g, x + 168, y + 34, m[2] ? '✓ IR aktif' : '✗ değil', { h: 'end', k: 14, b: true, r: m[2] ? 'var(--tur)' : 'var(--ikincil)' });
      yaz(g, x + 14, y + 64, m[1], { k: 13, r: 'var(--ikincil)' });
      const sec = () => o({ 'Seçilen': `${m[0]} — ${m[3]}` });
      g.addEventListener('click', sec); g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') sec(); });
      svg.append(g);
    });
    o({ 'Seçilen': 'Bir kutuya dokun: neden aktif ya da değil?' });
  };

  Anim.m323_titresim = function (kap) {
    const W = 600, H = 270, svg = svgYap(kap, W, H, 'CO₂ ve N₂ titreşim kipleri ve dipol momenti');
    const cx = 210, cy = 110, U = 70;
    const bag = el('path', { stroke: 'var(--ikincil)', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }); svg.append(bag);
    const at = [0, 1, 2].map(() => { const c = el('circle', { r: 22, stroke: 'var(--zemin)', 'stroke-width': 2 }); svg.append(c); return c; });
    const et = [0, 1, 2].map(() => { const t = yaz(svg, 0, 0, '', { h: 'middle', k: 15, b: true, r: '#fff' }); return t; });
    const dip = el('g'); svg.append(dip);
    yaz(svg, 430, 40, 'dipol momenti (zamanla)', { h: 'middle', k: 13, b: true });
    svg.append(el('rect', { x: 330, y: 50, width: 250, height: 140, fill: 'var(--yuzey)', stroke: 'var(--cizgi)' }));
    svg.append(el('line', { x1: 330, x2: 580, y1: 120, y2: 120, stroke: 'var(--cizgi)' }));
    const iz = el('path', { fill: 'none', stroke: 'var(--tur)', 'stroke-width': 2.5 }); svg.append(iz);
    const not = yaz(svg, 300, 252, '', { h: 'middle', k: 15, b: true });
    const k = kontrol(kap); const btn = dugme(k, '▶ Oynat');
    const KIP = ['simetrik gerilme', 'asimetrik gerilme', 'bükülme', 'N₂ gerilme'];
    let kip = 1, t = 0; const gecmis = [];
    const k2 = kontrol(kap); secenek(k2, KIP, 1, (i) => { kip = i; gecmis.length = 0; });
    const ciz = () => {
      const s = Math.sin(2 * Math.PI * 1.2 * t), a = 0.22;
      let P, q, ad;
      if (kip === 0) { P = [[-1 - a * s, 0], [0, 0], [1 + a * s, 0]]; }
      else if (kip === 1) { P = [[-1 + a * s, 0], [-0.75 * a * s, 0], [1 + a * s, 0]]; }
      else if (kip === 2) { P = [[-1, a * s], [0, -a * s], [1, a * s]]; }
      else { P = [[-0.55 - a * s, 0], null, [0.55 + a * s, 0]]; }
      q = kip === 3 ? [0, 0, 0] : [-1, 2, -1]; ad = kip === 3 ? ['N', '', 'N'] : ['O', 'C', 'O'];
      const pts = P.filter(Boolean).map((p) => [cx + p[0] * U, cy - p[1] * U]);
      bag.setAttribute('d', yol(pts));
      P.forEach((p, i) => { const g = at[i], tt = et[i]; if (!p) { g.setAttribute('r', 0); tt.textContent = ''; return; } g.setAttribute('r', i === 1 ? 18 : 22); g.setAttribute('cx', cx + p[0] * U); g.setAttribute('cy', cy - p[1] * U); g.setAttribute('fill', kip === 3 ? 'var(--acc)' : i === 1 ? 'var(--ikincil)' : 'var(--tur)'); tt.setAttribute('x', cx + p[0] * U); tt.setAttribute('y', cy - p[1] * U + 5); tt.textContent = ad[i]; });
      let dx = 0, dy = 0; P.forEach((p, i) => { if (p) { dx += q[i] * p[0]; dy += q[i] * p[1]; } });
      dip.replaceChildren();
      const mag = Math.hypot(dx, dy);
      if (mag > 0.02) ok(dip, cx, cy, cx + dx * 90, cy - dy * 90, 'var(--yesil)', 4);
      yaz(dip, cx, cy + 95, mag > 0.02 ? 'dipol oku (yeşil) salınıyor' : 'dipol = 0 (ok yok)', { h: 'middle', k: 13, r: 'var(--ikincil)' });
      gecmis.push(kip === 2 ? dy : dx); if (gecmis.length > 120) gecmis.shift();
      iz.setAttribute('d', yol(gecmis.map((v, i) => [330 + i * 250 / 120, 120 - v * 60])));
      not.textContent = kip === 0 ? 'Simetrik gerilme: dipol hep 0 → bu kip IR soğurmaz' : kip === 1 ? 'Asimetrik gerilme: dipol salınır → IR aktif (≈ 4,3 µm)' : kip === 2 ? 'Bükülme: dikey dipol salınır → IR aktif (≈ 15 µm, sera için en önemlisi)' : 'N₂: iki özdeş atom, yük yok → dipol hep 0 → IR aktif değil';
    };
    const oyn = dongu(btn, (dt) => { t += dt; ciz(); });
    ciz(); oyn.bas();
    return { dur: oyn.dur };
  };

  Sekil.m323_sb = function (kap) {
    const W = 600, H = 320, svg = svgYap(kap, W, H, 'Stefan–Boltzmann yasası: siyah cismin yaydığı akı sıcaklığın dördüncü kuvvetiyle artar');
    const d = eksen(svg, { W, H, L: 62, x: [150, 350], y: [0, 900], xt: [150, 200, 250, 300, 350], yt: [0, 200, 400, 600, 800], xad: 'T (K)', yad: 'F = σT⁴ (W/m²)' });
    svg.append(el('path', { d: egri(d, (T) => SIG * T ** 4, 150, 350), fill: 'none', stroke: 'var(--tur)', 'stroke-width': 3 }));
    for (const [T, ad, sag, dy] of [[220, 'sirrus tepesi 220 K → 133', 0, -12], [255, 'Tₑ 255 K → 240', 0, -12], [280, 'stratus 280 K → 349', 1, 18], [288, 'yüzey 288 K → 390', 1, 2]]) {
      nokta(svg, d.x(T), d.y(SIG * T ** 4), 5, 'var(--acc)');
      yaz(svg, d.x(T) + (sag ? 10 : -8), d.y(SIG * T ** 4) + dy, ad, { h: sag ? 'start' : 'end', k: 12 });
    }
    const m = nokta(svg, d.x(288), d.y(SIG * 288 ** 4), 7, 'var(--tur)');
    const o = okuma(kap, ['T', 'F = σT⁴', 'dF/dT = 4σT³', '%1 sıcaklık artışı']);
    const set = (T) => { T = sinir(T, 150, 350); const F = SIG * T ** 4; m.setAttribute('cx', d.x(T)); m.setAttribute('cy', d.y(F)); o({ T: `${tr(T, 0)} K (${tr(T - 273.15, 0)} °C)`, 'F = σT⁴': `${tr(F, 0)} W/m²`, 'dF/dT = 4σT³': `${tr(4 * SIG * T ** 3, 2)} W m⁻² K⁻¹`, '%1 sıcaklık artışı': `F %${tr((1.01 ** 4 - 1) * 100, 1)} artar` }); };
    imlec(svg, d, (T) => set(T)); set(288);
  };

  Sekil.m323_denge = function (kap) {
    const W = 600, H = 300, svg = svgYap(kap, W, H, 'Gezegenin ışınım dengesi: disk kadar güneş yakalar, küre olarak yayar');
    const cx = 330, cy = 150, R = 78;
    svg.append(el('circle', { cx, cy, r: R, fill: 'var(--acc-zemin)', stroke: 'var(--acc)', 'stroke-width': 2 }));
    svg.append(el('ellipse', { cx: cx - R - 2, cy, rx: 10, ry: R, fill: 'none', stroke: 'var(--tur)', 'stroke-width': 2, 'stroke-dasharray': '5 4' }));
    yaz(svg, cx - R - 14, cy - R - 8, 'kesit πR² güneşi yakalar', { h: 'middle', k: 12, r: 'var(--tur)', b: true });
    yaz(svg, cx, cy + 5, '4πR² yayar', { h: 'middle', k: 14, b: true });
    const dg = el('g'); svg.append(dg);
    const o = okuma(kap, ['soğurulan S(1−A)/4', 'Tₑ', 'σTₑ⁴']);
    const k = kontrol(kap);
    const sS = surgu(k, 'S', 300, 3000, 1, 1361, (v) => `${v} W/m²`), sA = surgu(k, 'A', 0, 0.9, 0.01, 0.3, (v) => tr(v, 2));
    const k2 = kontrol(kap);
    dugme(k2, 'Dünya (1361; 0,30)', true).addEventListener('click', () => { sS.set(1361); sA.set(0.3); ciz(); });
    dugme(k2, 'Venüs (2600; 0,70)', true).addEventListener('click', () => { sS.set(2600); sA.set(0.7); ciz(); });
    const ciz = () => {
      const S = sS.v, A = sA.v, Q = S * (1 - A) / 4, Te = (Q / SIG) ** 0.25;
      dg.replaceChildren();
      for (let i = -2; i <= 2; i++) ok(dg, 20, cy + i * 30, cx - R - 14, cy + i * 30, 'var(--tur)', 1.5 + S / 900);
      yaz(dg, 22, cy - 76, `güneş S = ${S} W/m²`, { k: 13, b: true, r: 'var(--tur)' });
      ok(dg, cx - R - 20, cy + 70, 40, cy + 112, 'var(--acc)', 1 + A * 8);
      yaz(dg, 40, cy + 134, `yansıyan A·S = %${tr(A * 100, 0)}`, { k: 12, r: 'var(--acc)' });
      for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.42, w = 1 + Te / 90; ok(dg, cx + Math.cos(a) * (R + 6), cy + Math.sin(a) * (R + 6), cx + Math.cos(a) * (R + 50), cy + Math.sin(a) * (R + 50), 'var(--yesil)', w); }
      yaz(dg, cx + R + 46, cy + 4, 'IR: σTₑ⁴', { k: 13, b: true, r: 'var(--yesil)' });
      o({ 'soğurulan S(1−A)/4': `${tr(Q, 0)} W/m²`, 'Tₑ': `${tr(Te, 0)} K (${tr(Te - 273.15, 0)} °C)`, 'σTₑ⁴': `${tr(SIG * Te ** 4, 0)} W/m² = soğurulan` });
    };
    for (const s of [sS, sA]) s.inp.addEventListener('input', ciz);
    ciz();
  };

  Sekil.m323_katman = function (kap, ayar = {}) {
    const W = 600, H = 330, svg = svgYap(kap, W, H, 'Tek katman sera modeli: yüzey, IR soğuran katman ve uzay');
    const Q = S0 * 0.7 / 4;
    yaz(svg, 300, 20, 'uzay', { h: 'middle', k: 13, r: 'var(--ikincil)' });
    const kat = el('rect', { x: 10, y: 118, width: 580, height: 44, fill: 'var(--acc)' }); svg.append(kat);
    const katY = yaz(svg, 584, 145, '', { h: 'end', k: 13, b: true });
    svg.append(el('rect', { x: 10, y: 278, width: 580, height: 40, fill: 'var(--yesil-zemin)', stroke: 'var(--yesil)' }));
    const yerY = yaz(svg, 584, 304, '', { h: 'end', k: 14, b: true });
    const dg = el('g'); svg.append(dg);
    const o = okuma(kap, ['Tₛ', 'T(katman)', 'uzaya giden', 'sera G = σTₛ⁴ − 238']);
    const k = kontrol(kap);
    const f0 = ayar.adim === 0 ? 0 : ayar.adim === 1 ? 1 : ayar.adim === 2 ? 0.77 : (ayar.f ?? 0.77);
    const sF = surgu(k, 'f (IR soğurma)', 0, 1, 0.01, f0, (v) => tr(v, 2));
    const ciz = () => {
      const f = sF.v, Ts = TE * (2 / (2 - f)) ** 0.25, Ta = Ts / 2 ** 0.25, Fs = SIG * Ts ** 4, Fa = f * SIG * Ta ** 4, gec = (1 - f) * Fs;
      kat.setAttribute('opacity', 0.06 + f * 0.4);
      katY.textContent = f > 0 ? `katman: soğurur f = ${tr(f, 2)}, T = ${tr(Ta, 0)} K` : 'atmosfer yok (f = 0)';
      yerY.textContent = `yüzey Tₛ = ${tr(Ts, 0)} K`;
      dg.replaceChildren();
      const w = (v) => 1 + v / 45;
      ok(dg, 70, 30, 70, 274, 'var(--tur)', w(Q)); yaz(dg, 80, 70, `güneş ${tr(Q, 0)}`, { k: 13, b: true, r: 'var(--tur)' });
      ok(dg, 210, 276, 210, f > 0 ? 166 : 30, 'var(--yesil)', w(Fs)); yaz(dg, 220, 250, `σTₛ⁴ = ${tr(Fs, 0)}`, { k: 13, b: true, r: 'var(--yesil)' });
      if (f > 0 && f < 1) { ok(dg, 210, 114, 210, 30, 'var(--yesil)', w(gec), true); yaz(dg, 220, 60, `geçen (1−f)σTₛ⁴ = ${tr(gec, 0)}`, { k: 12, r: 'var(--yesil)' }); }
      if (f > 0) { ok(dg, 400, 114, 400, 30, 'var(--acc)', w(Fa)); yaz(dg, 410, 60, `katman ↑ ${tr(Fa, 0)}`, { k: 13, b: true, r: 'var(--acc)' }); ok(dg, 470, 166, 470, 274, 'var(--acc)', w(Fa)); yaz(dg, 480, 220, `katman ↓ ${tr(Fa, 0)}`, { k: 13, b: true, r: 'var(--acc)' }); }
      o({ 'Tₛ': `${tr(Ts, 1)} K (${tr(Ts - 273.15, 1)} °C)`, 'T(katman)': f > 0 ? `${tr(Ta, 1)} K = Tₛ/∜2` : '—', 'uzaya giden': `${tr(gec + Fa, 0)} W/m² (= soğurulan güneş)`, 'sera G = σTₛ⁴ − 238': `${tr(Fs - Q, 0)} W/m²` });
    };
    sF.inp.addEventListener('input', ciz); ciz();
  };

  Sekil.m323_zorlama = function (kap) {
    const W = 600, H = 320, svg = svgYap(kap, W, H, 'CO₂ ışınımsal zorlaması: derişimle logaritmik artar');
    const d = eksen(svg, { W, H, L: 54, x: [200, 1200], y: [0, 10], xt: [280, 420, 560, 840, 1120], yt: [0, 2, 4, 6, 8, 10], xad: 'C (ppm CO₂)', yad: 'ΔF (W/m²)' });
    svg.append(el('path', { d: egri(d, (C) => 5.35 * Math.log(C / 280), 200, 1200), fill: 'none', stroke: 'var(--tur)', 'stroke-width': 3 }));
    svg.append(el('path', { d: egri(d, (C) => Math.max(0, 5.35 * Math.log10(C / 280)), 280, 1200), fill: 'none', stroke: 'var(--ikincil)', 'stroke-width': 2, 'stroke-dasharray': '6 5' }));
    yaz(svg, d.x(1190), d.y(5.35 * Math.log(1190 / 280)) - 10, '5,35 ln(C/280)', { h: 'end', k: 13, b: true, r: 'var(--tur)' });
    yaz(svg, d.x(1190), d.y(5.35 * Math.log10(1190 / 280)) + 18, 'log₁₀ ile (yanlış!)', { h: 'end', k: 12, r: 'var(--ikincil)' });
    for (const C of [420, 560, 1120]) nokta(svg, d.x(C), d.y(5.35 * Math.log(C / 280)), 5, 'var(--acc)');
    const m = nokta(svg, d.x(560), d.y(3.71), 7, 'var(--tur)');
    const o = okuma(kap, ['C', 'ΔF', 'ΔT = λΔF']);
    let lam = 0.8;
    const k = kontrol(kap); let C0 = 560;
    secenek(k, ['λ = 0,8 (geri beslemeli)', 'λ₀ = 0,27 (geri beslemesiz)'], 0, (i) => { lam = i ? 0.27 : 0.8; set(C0); });
    const set = (C) => { C0 = C = sinir(C, 200, 1200); const dF = 5.35 * Math.log(C / 280); m.setAttribute('cx', d.x(C)); m.setAttribute('cy', d.y(Math.max(0, dF))); o({ C: `${tr(C, 0)} ppm (${tr(C / 280, 2)} × sanayi öncesi)`, 'ΔF': `${tr(dF, 2)} W/m²`, 'ΔT = λΔF': `${tr(lam * dF, 2)} K` }); };
    imlec(svg, d, (C) => set(C)); set(560);
  };

  Sekil.m323_geri = function (kap) {
    const W = 600, H = 320, svg = svgYap(kap, W, H, 'İklim geri besleme döngüleri');
    const P = [[300, 58], [490, 160], [300, 262], [110, 160]];
    const kut = P.map(([x, y]) => { const r = el('rect', { x: x - 92, y: y - 24, width: 184, height: 48, rx: 12, fill: 'var(--yuzey)', stroke: 'var(--tur)', 'stroke-width': 2 }); svg.append(r); return yaz(svg, x, y + 5, '', { h: 'middle', k: 14, b: true }); });
    const yay = el('g'); svg.append(yay);
    ok(yay, 392, 70, 470, 132, 'var(--tur)', 3); ok(yay, 470, 188, 392, 252, 'var(--tur)', 3); ok(yay, 208, 252, 130, 188, 'var(--tur)', 3); ok(yay, 130, 132, 208, 70, 'var(--tur)', 3);
    const isr = yaz(svg, 300, 166, '', { h: 'middle', k: 30, b: true, r: 'var(--tur)' });
    yaz(svg, 18, 26, 'CO₂ ↑ → zorlama ΔF', { k: 13, b: true, r: 'var(--acc)' }); ok(svg, 150, 30, 205, 50, 'var(--acc)', 2.5);
    const o = okuma(kap, ['Döngü']);
    const D = [['ısınma ΔT', 'eₛ ↑ (%7/K)', 'su buharı ↑', 'sera etkisi ↑', '+', 'Su buharı: bağıl nem kabaca sabit kalır → buhar ısınmayla artar → en güçlü pozitif geri besleme.'],
      ['ısınma ΔT', 'kar/buz erir', 'albedo ↓', 'soğurulan güneş ↑', '+', 'Buz–albedo: parlak yüzey kaybolur → daha çok güneş soğurulur → pozitif.'],
      ['ısınma ΔT', 'bulut örtüsü değişir', 'alçak ↑ soğut · yüksek ↑ ısıt', 'net etki ?', '±', 'Bulut: hem işareti hem büyüklüğü belirsiz → iklim tahmininin en büyük belirsizliği.'],
      ['ısınma ΔT', 'buharlaşma ↑', 'su buharı ↑ (geri dönmez)', 'sera ↑↑', '∞', 'Venüs: yağış suyu yüzeye döndüremedi → geri besleme durdurulamadı (kaçak sera), yüzey ≈ 700 K.']];
    const k = kontrol(kap);
    const goster = (i) => { D[i].slice(0, 4).forEach((t, j) => { kut[j].textContent = t; }); isr.textContent = D[i][4]; o({ 'Döngü': `${D[i][5]} Toplam: λ ≈ 0,8 / λ₀ ≈ 0,27 → ısınma ≈ 3 kat büyür.` }); };
    secenek(k, ['Su buharı', 'Buz–albedo', 'Bulut', 'Venüs'], 0, goster); goster(0);
  };

  Sekil.m323_bulut = function (kap) {
    const W = 600, H = 320, svg = svgYap(kap, W, H, 'Bulutun ışınım etkisi: IR tutma ve güneş yansıtma');
    svg.append(el('rect', { x: 10, y: 290, width: 330, height: 24, fill: 'var(--yesil-zemin)', stroke: 'var(--yesil)' })); yaz(svg, 20, 307, 'yüzey 288 K → 390 W/m²', { k: 12, b: true });
    const bg = el('g'); svg.append(bg);
    const sifir = 180, olc = 0.5;
    svg.append(el('line', { x1: 360, x2: 590, y1: sifir, y2: sifir, stroke: 'var(--ikincil)' }));
    const cg = el('g'); svg.append(cg);
    const o = okuma(kap, ['bulut tepesi', 'IR tutma σ(Tₛ⁴ − T⁴)', 'ek yansıtma 340·ΔA', 'net']);
    const k = kontrol(kap);
    const sT = surgu(k, 'tepe T', 200, 288, 1, 220, (v) => `${v} K`), sA = surgu(k, 'ΔA', 0, 0.6, 0.01, 0.1, (v) => tr(v, 2));
    const k2 = kontrol(kap);
    dugme(k2, 'Sirrus (220 K; 0,1)', true).addEventListener('click', () => { sT.set(220); sA.set(0.1); ciz(); });
    dugme(k2, 'Stratus (280 K; 0,5)', true).addEventListener('click', () => { sT.set(280); sA.set(0.5); ciz(); });
    const ciz = () => {
      const T = sT.v, dA = sA.v, ir = SIG * (288 ** 4 - T ** 4), ya = 340 * dA, net = ir - ya, z = (288 - T) / 6.5, y = 282 - z * 18;
      bg.replaceChildren();
      for (const dx of [-40, 0, 40]) bg.append(el('ellipse', { cx: 175 + dx, cy: y - 6, rx: 44, ry: 14 + dA * 14, fill: 'var(--yuzey)', stroke: 'var(--ikincil)', 'stroke-width': 1.5 }));
      yaz(bg, 175, y - 30 - dA * 14, `z ≈ ${tr(z, 1)} km`, { h: 'middle', k: 12, r: 'var(--ikincil)' });
      ok(bg, 120, 286, 120, y + 10, 'var(--tur)', 4); ok(bg, 120, y - 26, 120, Math.max(16, y - 80), 'var(--tur)', 1 + SIG * T ** 4 / 60);
      yaz(bg, 28, Math.max(28, y - 60), `uzaya σT⁴ = ${tr(SIG * T ** 4, 0)}`, { k: 12, r: 'var(--tur)' });
      ok(bg, 250, 20, 230, y - 18, 'var(--acc)', 2.5); ok(bg, 236, y - 22, 300, Math.max(14, y - 90), 'var(--acc)', 1 + dA * 10);
      cg.replaceChildren();
      const bar = (x, v, renk, ad) => { const h = v * olc; cg.append(el('rect', { x, y: v >= 0 ? sifir - h : sifir, width: 56, height: Math.abs(h), fill: renk, opacity: 0.8 })); yaz(cg, x + 28, v >= 0 ? sifir - h - 6 : sifir - h + 16, tr(v, 0), { h: 'middle', k: 13, b: true }); yaz(cg, x + 28, 312, ad, { h: 'middle', k: 12, r: 'var(--ikincil)' }); };
      bar(370, ir, 'var(--tur)', 'IR tutma'); bar(445, -ya, 'var(--acc)', 'yansıtma'); bar(520, net, net >= 0 ? 'var(--tur)' : 'var(--acc)', 'net');
      o({ 'bulut tepesi': `${T} K`, 'IR tutma σ(Tₛ⁴ − T⁴)': `+${tr(ir, 0)} W/m²`, 'ek yansıtma 340·ΔA': `−${tr(ya, 0)} W/m²`, net: `${net >= 0 ? '+' : ''}${tr(net, 0)} W/m² → ${net >= 0 ? 'ısıtır' : 'soğutur'}` });
    };
    for (const s of [sT, sA]) s.inp.addEventListener('input', ciz);
    ciz();
  };

  Sekil.m323_lcl = function (kap) {
    const W = 600, H = 320, svg = svgYap(kap, W, H, 'Bulut tabanı: sıcaklık ve çiy noktası çizgilerinin kesiştiği yükseklik');
    const d = eksen(svg, { W, H, L: 54, x: [-10, 30], y: [0, 3], xt: [-10, 0, 10, 20, 30], yt: [0, 0.5, 1, 1.5, 2, 2.5, 3], yf: (v) => tr(v, 1), xad: 'sıcaklık (°C)', yad: 'z (km)' });
    const dg = el('g'); svg.append(dg);
    const o = okuma(kap, ['z(LCL) = 125 (T − Td)', 'tabanda T = Td', 'bulut türü']);
    const k = kontrol(kap);
    const sT = surgu(k, 'T', 0, 30, 0.5, 20, (v) => `${tr(v)} °C`), sD = surgu(k, 'Td', -10, 30, 0.5, 8, (v) => `${tr(v)} °C`);
    const ciz = () => {
      const T = sT.v, Td = Math.min(sD.v, T), z = (T - Td) / 8, Tz = T - 9.8 * z;
      dg.replaceChildren();
      const zT = Math.min(3, (T + 10) / 9.8), zD = Math.min(3, (Td + 10) / 1.8);
      dg.append(el('path', { d: yol([[d.x(T), d.y(0)], [d.x(T - 9.8 * zT), d.y(zT)]]), stroke: 'var(--tur)', 'stroke-width': 3, fill: 'none' }));
      dg.append(el('path', { d: yol([[d.x(Td), d.y(0)], [d.x(Td - 1.8 * zD), d.y(zD)]]), stroke: 'var(--acc)', 'stroke-width': 3, fill: 'none', 'stroke-dasharray': '7 5' }));
      yaz(dg, d.x(T) + 6, d.y(0.12), 'T (−9,8 K/km)', { k: 12, b: true, r: 'var(--tur)' });
      yaz(dg, d.x(Td) - 6, d.y(0.12), 'Td (−1,8 K/km)', { h: 'end', k: 12, b: true, r: 'var(--acc)' });
      if (z <= 3) {
        dg.append(el('line', { x1: d.L, x2: d.W - d.R, y1: d.y(z), y2: d.y(z), stroke: 'var(--ikincil)', 'stroke-dasharray': '4 4' }));
        for (const dx of [-30, 0, 30]) dg.append(el('ellipse', { cx: d.x(Tz) + 60 + dx, cy: d.y(z) - 14, rx: 30, ry: 12, fill: 'var(--yuzey)', stroke: 'var(--ikincil)' }));
        nokta(dg, d.x(Tz), d.y(z), 6, 'var(--yazi)');
      }
      o({ 'z(LCL) = 125 (T − Td)': `${tr(125 * (T - Td), 0)} m`, 'tabanda T = Td': `${tr(Tz, 1)} °C`, 'bulut türü': z < 2 ? 'alçak (< 2 km) → tepe ılık → net soğutma eğilimi' : 'orta seviye' });
    };
    for (const s of [sT, sD]) s.inp.addEventListener('input', ciz);
    ciz();
  };

  const esT = (T) => 6.112 * Math.exp(17.67 * T / (T + 243.5));
  Sekil.m323_magnus = function (kap) {
    const W = 600, H = 320, svg = svgYap(kap, W, H, 'Doyma buhar basıncı sıcaklıkla üstel artar (Clausius–Clapeyron, Magnus)');
    const d = eksen(svg, { W, H, L: 54, x: [-20, 40], y: [0, 75], xt: [-20, -10, 0, 10, 20, 30, 40], yt: [0, 15, 30, 45, 60, 75], xad: 'T (°C)', yad: 'eₛ (hPa)' });
    svg.append(el('path', { d: egri(d, esT, -20, 40), fill: 'none', stroke: 'var(--acc)', 'stroke-width': 3 }));
    for (const T of [15, 16, 18]) nokta(svg, d.x(T), d.y(esT(T)), 4.5, 'var(--tur)');
    yaz(svg, d.x(15) - 8, d.y(esT(15)) - 10, '15 → 16 °C: +%6,6', { h: 'end', k: 12, b: true, r: 'var(--tur)' });
    const m = nokta(svg, d.x(15), d.y(esT(15)), 7, 'var(--tur)');
    const o = okuma(kap, ['T', 'eₛ', '+1 K artış', 'L/(R_v T²)']);
    const set = (T) => { T = sinir(T, -20, 39); const e = esT(T); m.setAttribute('cx', d.x(T)); m.setAttribute('cy', d.y(e)); o({ T: `${tr(T, 1)} °C`, 'eₛ': `${tr(e, 2)} hPa`, '+1 K artış': `%${tr((esT(T + 1) / e - 1) * 100, 1)}`, 'L/(R_v T²)': `%${tr(2.5e6 / (461.5 * (T + 273.15) ** 2) * 100, 1)} /K` }); };
    imlec(svg, d, (T) => set(T)); set(15);
  };

  /* ============================== B3 · AEROSOL (devamı aşağıda) ============================== */
})();
