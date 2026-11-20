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
    const basl = ['χ — karışım oranı (P, T ile değişmez)', 'n = P/(kT) — sayı yoğunluğu', 'C = χ·M/Vₘ — kütle derişimi', 'p = χ·P — kısmi basınç'];
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
    let chiX = null;
    for (const [ad, P, T, c, mi] of hazir) dugme(k3, ad, true).addEventListener('click', () => { sP.set(P); sT.set(T); sC.set(Math.log10(c)); chiX = c; sC.inp.nextElementSibling.textContent = chiT(c); M = MLER[mi][1]; sec.isaretle(mi); ciz(); });
    sC.inp.addEventListener('input', () => { chiX = null; });
    const ciz = () => {
      const P = sP.v * 100, T = sT.v, chi = chiX ?? 10 ** sC.v;
      const nh = P / (kB * T) / 1e6, nx = chi * 1e-9 * nh, Vm = RG * T / P * 1000, C = chi * M / Vm, p = chi * 1e-9 * P;
      satir[0].t.textContent = `${chiT(chi)} = ${bil(chi * 1e-9)} mol/mol`;
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
    let chiX = 1.92;
    secenek(k2, GAZ.map((g) => g[0]), 0, (i) => { gi = i; sX.set(Math.log10(GAZ[i][2])); chiX = GAZ[i][2]; sX.inp.nextElementSibling.textContent = `${tr(chiX, 2)} ppm`; ciz(); });
    sX.inp.nextElementSibling.textContent = '1,92 ppm';
    sX.inp.addEventListener('input', () => { chiX = null; });
    const ciz = () => {
      const A = 4 * Math.PI * 6.371e6 ** 2, m = 101325 * A / 9.81, mol = m / 0.02896, chi = (chiX ?? 10 ** sX.v) * 1e-6;
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
    const k2 = kontrol(kap); secenek(k2, KIP, 1, (i) => { kip = i; gecmis.length = 0; ciz(); });
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
    yaz(svg, cx - R - 14, cy - R - 8, 'kesit πR²', { h: 'middle', k: 12, r: 'var(--tur)', b: true });
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
      for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 1) * 0.45, w = 1 + Te / 90; ok(dg, cx + Math.cos(a) * (R + 6), cy + Math.sin(a) * (R + 6), cx + Math.cos(a) * (R + 50), cy + Math.sin(a) * (R + 50), 'var(--yesil)', w); }
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
    const d = eksen(svg, { W, H, L: 54, x: [200, 1200], y: [-2, 10], xt: [280, 420, 560, 840, 1120], yt: [-2, 0, 2, 4, 6, 8, 10], xad: 'C (ppm CO₂)', yad: 'ΔF (W/m²)' });
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
    const set = (C) => { C0 = C = sinir(C, 200, 1200); const dF = 5.35 * Math.log(C / 280); m.setAttribute('cx', d.x(C)); m.setAttribute('cy', d.y(dF)); o({ C: `${tr(C, 0)} ppm (${tr(C / 280, 2)} × sanayi öncesi)`, 'ΔF': `${tr(dF, 2)} W/m²`, 'ΔT = λΔF': `${tr(lam * dF, 2)} K` }); };
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

  /* ============================== B3 · AEROSOL ============================== */
  Sekil.m323_sinif = function (kap) {
    const W = 600, H = 330, svg = svgYap(kap, W, H, 'Aerosol sınıfları: birincil/ikincil, ince/iri ve karbon türleri');
    yaz(svg, 250, 24, 'birincil (doğrudan salınır)', { h: 'middle', k: 14, b: true });
    yaz(svg, 470, 24, 'ikincil (gazdan oluşur)', { h: 'middle', k: 14, b: true });
    for (const [y, a, b] of [[34, 'iri', 'D > 2,5 µm'], [124, 'ince', 'D < 2,5 µm']]) { yaz(svg, 14, y + 40, a, { k: 16, b: true }); yaz(svg, 14, y + 60, b, { k: 12, r: 'var(--ikincil)' }); }
    for (const [x, y] of [[140, 34], [360, 34], [140, 124], [360, 124]]) svg.append(el('rect', { x, y, width: 216, height: 86, rx: 8, fill: 'var(--yuzey)', stroke: 'var(--cizgi)' }));
    svg.append(el('rect', { x: 14, y: 222, width: 562, height: 98, rx: 8, fill: 'var(--zemin)', stroke: 'var(--cizgi)' }));
    yaz(svg, 26, 244, 'KARBON hangi sınıfta?', { k: 14, b: true });
    const o = okuma(kap, ['Seçilen']);
    const CIP = [[150, 50, 'deniz tuzu', 'Dalga köpüğündeki kabarcıklar patlar → tuz damlacığı. Mekanik → çoğu iri (bir kısmı mikron altı).'], [262, 50, 'çöl tozu', 'Rüzgâr toprağı aşındırır → mineral toz. Mekanik → iri.'], [150, 84, 'polen', 'Bitkiden doğrudan; büyük (10–100 µm) → hızla çöker.'],
      [150, 140, 'dizel isi', 'Yanmada doğrudan çıkan element karbon (is, kurum) → birincil ve ince; güneşi soğurur.'],
      [370, 140, 'sülfat', 'SO₂ + OH → H₂SO₄ → yoğuşur: gazdan oluştuğu için ikincil ve ince.'], [460, 140, 'SOA', 'İzopren gibi uçucu organikler oksitlenir → düşük uçuculu ürün yoğuşur: ikincil organik aerosol.'], [370, 174, 'amonyum nitrat', 'NH₃ + HNO₃ → NH₄NO₃: iki gazdan parçacık → ikincil, ince.'],
      [26, 262, 'element karbon', 'Yalnız C atomu: grafit, elmas, is (amorf). Allotrop = aynı element, farklı dizilim.'], [210, 262, 'organik karbon', 'C–H ve C–O bağları: glikoz, SOA. Doğrudan ya da yoğuşmayla oluşur.'], [394, 262, 'hiçbiri: CO₂', 'CO₂ inorganik karbondur ve gazdır → aerosol değil.']];
    for (const [x, y, ad, ac] of CIP) {
      const g = el('g', { tabindex: 0, role: 'button', style: 'cursor:pointer' }), w = 22 + ad.length * 8.2;
      g.append(el('rect', { x, y, width: w, height: 28, rx: 14, fill: 'var(--tur-zemin)', stroke: 'var(--tur)' }));
      yaz(g, x + w / 2, y + 19, ad, { h: 'middle', k: 14, b: true });
      const sec = () => o({ 'Seçilen': `${ad} — ${ac}` });
      g.addEventListener('click', sec); g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') sec(); });
      svg.append(g);
    }
    yaz(svg, 370, 66, 'gazdan büyüyen parçacık', { k: 12, r: 'var(--ikincil)' }); yaz(svg, 370, 84, 'iri moda pek ulaşmaz', { k: 12, r: 'var(--ikincil)' });
    yaz(svg, 26, 308, 'is güneşi soğurur (ısıtır) · organik çoğunlukla saçar', { k: 12, r: 'var(--ikincil)' });
    o({ 'Seçilen': 'Bir parçacığa dokun: neden o hücrede?' });
  };

  Sekil.m323_modlar = function (kap) {
    const W = 600, H = 320, svg = svgYap(kap, W, H, 'Aerosol boyut modları: sayı, kesit, hacim ve kütle payları');
    const d = eksen(svg, { W, H, L: 54, x: [0.003, 10], y: [0, 100], xlog: true, xt: [0.01, 0.1, 1, 10], yt: [0, 25, 50, 75, 100], xf: (v) => v.toLocaleString('tr-TR'), xad: 'yarıçap r (µm)', yad: 'pay (%)' });
    svg.append(el('line', { x1: d.x(1.25), x2: d.x(1.25), y1: d.T, y2: d.H - d.B, stroke: 'var(--tur)', 'stroke-dasharray': '5 4', 'stroke-width': 2 }));
    yaz(svg, d.x(1.25) + 4, d.T + 12, 'D = 2,5 µm', { k: 12, b: true, r: 'var(--tur)' });
    const MOD = [['çekirdek', 1e4, 0.01, 1.7], ['birikme', 1e3, 0.1, 1.7], ['iri', 1, 2, 2]];
    const AD = ['Sayı N (cm⁻³)', 'Kesit S = Nπr² (µm²/cm³)', 'Hacim V = N·(4/3)πr³ (µm³/cm³)', 'Kütle ρV (µg/m³)'];
    const deg = (i, m) => [m[1], m[1] * Math.PI * m[2] ** 2, m[1] * 4 / 3 * Math.PI * m[2] ** 3, m[1] * 4 / 3 * Math.PI * m[2] ** 3 * m[3]][i];
    const fmt = (v) => (v >= 100 ? Math.round(v).toLocaleString('tr-TR') : v >= 1 ? tr(v, 1) : tr(v, 3));
    const bg = el('g'); svg.append(bg);
    const o = okuma(kap, ['Gösterilen', 'Baskın mod']);
    const ciz = (i) => {
      const v = MOD.map((m) => deg(i, m)), top = v.reduce((a, b) => a + b, 0);
      bg.replaceChildren();
      MOD.forEach((m, j) => { const p = v[j] / top * 100, x = d.x(m[2]); bg.append(el('rect', { x: x - 22, y: d.y(p), width: 44, height: d.y(0) - d.y(p), fill: 'var(--acc)', opacity: 0.75 })); yaz(bg, x, d.y(p) - 22, `%${tr(p, 0)}`, { h: 'middle', k: 14, b: true }); yaz(bg, x, d.y(p) - 6, `${m[0]} · ${fmt(v[j])}`, { h: 'middle', k: 12, r: 'var(--ikincil)' }); });
      const b = v.indexOf(Math.max(...v));
      o({ 'Gösterilen': AD[i], 'Baskın mod': `${MOD[b][0]} (%${tr(v[b] / top * 100, 0)}) — ${['sayıyı en küçükler', 'ışığı (görüş, saçılma) birikme modu', 'hacmi iri mod', 'kütleyi (PM10) iri mod'][i]} yönetir` });
    };
    const k = kontrol(kap); secenek(k, ['Sayı', 'Kesit', 'Hacim', 'Kütle'], 0, ciz); ciz(0);
  };

  Sekil.m323_pm = function (kap) {
    const W = 600, H = 320, svg = svgYap(kap, W, H, 'PM ölçümleri, aynı ortalama süreli sınırla kıyaslanır');
    const d = eksen(svg, { W, H, L: 54, x: [0, 8.2], y: [0, 200], xt: [], yt: [0, 50, 100, 150, 200], yad: 'µg/m³' });
    const PM = [80, 120, 165, 140, 95];
    PM.forEach((v, i) => { const x = d.x(i + 1); svg.append(el('rect', { x: x - 20, y: d.y(v), width: 40, height: d.y(0) - d.y(v), fill: v > 150 ? 'var(--tur)' : 'var(--acc)', opacity: 0.8 })); yaz(svg, x, d.y(v) - 6, v, { h: 'middle', k: 13, b: true }); yaz(svg, x, d.y(0) + 18, `${i + 1}. gün`, { h: 'middle', k: 12, r: 'var(--ikincil)' }); });
    svg.append(el('line', { x1: d.x(0.4), x2: d.x(5.6), y1: d.y(150), y2: d.y(150), stroke: 'var(--tur)', 'stroke-width': 2.5, 'stroke-dasharray': '7 4' }));
    yaz(svg, d.x(0.4), d.y(150) - 8, 'PM10 24 saatlik sınır 150', { k: 12, b: true, r: 'var(--tur)' });
    svg.append(el('line', { x1: d.x(0.4), x2: d.x(5.6), y1: d.y(120), y2: d.y(120), stroke: 'var(--ikincil)', 'stroke-width': 1.5, 'stroke-dasharray': '2 4' }));
    yaz(svg, d.x(0.4), d.y(192), 'noktalı: 5 gün ort. 120 — sınırla kıyaslanmaz', { k: 12, r: 'var(--ikincil)' });
    svg.append(el('line', { x1: d.x(6.2), x2: d.x(6.2), y1: d.T, y2: d.H - d.B, stroke: 'var(--cizgi)', 'stroke-width': 2 }));
    const x7 = d.x(7.2); svg.append(el('rect', { x: x7 - 20, y: d.y(22), width: 40, height: d.y(0) - d.y(22), fill: 'var(--tur)', opacity: 0.8 }));
    svg.append(el('line', { x1: x7 - 34, x2: x7 + 34, y1: d.y(15), y2: d.y(15), stroke: 'var(--tur)', 'stroke-width': 2.5, 'stroke-dasharray': '7 4' }));
    yaz(svg, x7, d.y(22) - 8, '22 > 15', { h: 'middle', k: 13, b: true }); yaz(svg, x7, d.y(60), 'PM2.5', { h: 'middle', k: 13, b: true }); yaz(svg, x7, d.y(60) + 16, 'yıllık', { h: 'middle', k: 12, r: 'var(--ikincil)' });
  };

  Sekil.m323_solunum = function (kap, ayar = {}) {
    const W = 600, H = 320, svg = svgYap(kap, W, H, 'Solunum yolunda parçacık birikimi, şematik');
    const d = eksen(svg, { W, H, L: 30, x: [0.001, 100], y: [0, 1], xlog: true, xt: [0.001, 0.01, 0.1, 1, 10, 100], yt: [], xf: (v) => v.toLocaleString('tr-TR'), xad: 'çap D (µm)', yad: 'birikme payı (şematik)' });
    const G = (u, m, s) => Math.exp(-(((u - m) / s) ** 2));
    const E = [['burun–gırtlak', 'var(--tur)', (u) => 0.85 / (1 + Math.exp(-(u - 0.6) / 0.25)) + 0.45 * G(u, -2.8, 0.35), 30],
      ['bronşlar', 'var(--yesil)', (u) => 0.06 + 0.14 * G(u, -2.4, 0.4) + 0.1 * G(u, 0.6, 0.3), 0.004],
      ['pulmoner (alveol)', 'var(--acc)', (u) => 0.5 * G(u, -1.7, 0.45) + 0.12 * G(u, 0.4, 0.35), 0.02]];
    for (const [D, ad] of [[5, '5 µm'], [0.5, '0,5 µm'], [0.02, '0,02 µm']]) { svg.append(el('line', { x1: d.x(D), x2: d.x(D), y1: d.T, y2: d.H - d.B, stroke: 'var(--ikincil)', 'stroke-dasharray': '3 4' })); yaz(svg, d.x(D) + 3, d.H - d.B - 6, ad, { k: 12, r: 'var(--ikincil)' }); }
    const n = ayar.adim == null ? 3 : ayar.adim + 1;
    E.slice(0, n).forEach(([ad, renk, f, De], i) => { svg.append(el('path', { d: egri(d, (D) => f(Math.log10(D)), 0.001, 100, 220, true), fill: 'none', stroke: renk, 'stroke-width': i === n - 1 ? 4 : 2.5 })); yaz(svg, d.x(De), d.y(f(Math.log10(De))) - 10, ad, { h: 'middle', k: 13, b: true, r: renk }); });
    if (n === 3) { svg.append(el('path', { d: egri(d, (D) => E.reduce((a, e) => a + e[2](Math.log10(D)), 0), 0.001, 100, 220, true), fill: 'none', stroke: 'var(--yazi)', 'stroke-width': 1.5, 'stroke-dasharray': '6 4' })); yaz(svg, d.x(0.3), d.y(0.32), 'toplam: en az 0,1–1 µm', { h: 'middle', k: 12, r: 'var(--yazi)' }); }
  };

  const vSt = (D) => 2000 * 9.81 * D * D / (18 * 1.8e-5); // D (m) → m/s
  Sekil.m323_stokes = function (kap) {
    const W = 600, H = 320, svg = svgYap(kap, W, H, 'Stokes çökelme hızı çapın karesiyle artar');
    const d = eksen(svg, { W, H, L: 58, x: [0.1, 100], y: [1e-7, 1], xlog: true, ylog: true, xt: [0.1, 1, 10, 100], yt: [1e-7, 1e-5, 1e-3, 1e-1], xf: (v) => v.toLocaleString('tr-TR'), yf: us10, xad: 'çap D (µm)', yad: 'v (m/s)' });
    svg.append(el('rect', { x: d.x(63), y: d.T, width: d.x(100) - d.x(63), height: d.H - d.B - d.T, fill: 'var(--tur-zemin)' }));
    yaz(svg, d.x(63) - 4, d.T + 14, 'Re > 1 →', { h: 'end', k: 12, r: 'var(--tur)' });
    svg.append(el('path', { d: egri(d, (D) => vSt(D * 1e-6), 0.1, 100, 60, true), fill: 'none', stroke: 'var(--acc)', 'stroke-width': 3 }));
    for (const D of [1, 10, 50]) { nokta(svg, d.x(D), d.y(vSt(D * 1e-6)), 5, 'var(--tur)'); yaz(svg, d.x(D) + 8, d.y(vSt(D * 1e-6)) + 16, `${D} µm`, { k: 12, b: true }); }
    const m = nokta(svg, d.x(10), d.y(vSt(1e-5)), 7, 'var(--tur)');
    const o = okuma(kap, ['D', 'v = ρgD²/(18μ)', '1 km düşme', 'Re']);
    const set = (D) => { D = sinir(D, 0.1, 100); const v = vSt(D * 1e-6); m.setAttribute('cx', d.x(D)); m.setAttribute('cy', d.y(v)); o({ D: `${tr(D, D < 1 ? 2 : 1)} µm`, 'v = ρgD²/(18μ)': `${bil(v)} m/s`, '1 km düşme': sure(1000 / v), Re: tr(1.2 * v * D * 1e-6 / 1.8e-5, 4) }); };
    imlec(svg, d, (D) => set(D)); set(10);
  };

  Anim.m323_cokelme = function (kap) {
    const W = 600, H = 320, svg = svgYap(kap, W, H, 'Üç boyuttaki parçacığın 1 km düşmesi');
    const UST0 = 46, ALT = 290, P = [[20, 'var(--tur)', 130], [10, 'var(--acc)', 300], [1, 'var(--yesil)', 470]];
    svg.append(el('line', { x1: 20, x2: 580, y1: ALT, y2: ALT, stroke: 'var(--yesil)', 'stroke-width': 3 })); yaz(svg, 580, ALT + 22, 'yer (1 km aşağı)', { h: 'end', k: 12, r: 'var(--ikincil)' });
    const ps = P.map(([D, renk, x]) => { svg.append(el('line', { x1: x, x2: x, y1: UST0, y2: ALT, stroke: 'var(--cizgi)', 'stroke-dasharray': '4 4' })); yaz(svg, x, 18, `D = ${D} µm`, { h: 'middle', k: 14, b: true }); yaz(svg, x, 36, `v = ${bil(vSt(D * 1e-6))} m/s`, { h: 'middle', k: 12, r: 'var(--ikincil)' }); const c = el('circle', { cx: x, r: 3 + D / 3, fill: renk }); svg.append(c); const t = yaz(svg, x + 16, 0, '', { k: 12, b: true }); return { D, x, c, t }; });
    const o = okuma(kap, ['geçen süre', 'hız oranı 20:10:1 µm']);
    const k = kontrol(kap); const btn = dugme(k, '▶ Oynat'), b2 = dugme(k, 'Baştan', true);
    let t = 0;
    const ciz = () => { ps.forEach((p) => { const z = Math.min(1000, vSt(p.D * 1e-6) * t), y = UST0 + z / 1000 * (ALT - UST0); p.c.setAttribute('cy', y); p.t.setAttribute('y', Math.min(ALT - 4, y + 4)); p.t.textContent = z >= 1000 ? `yerde (${sure(1000 / vSt(p.D * 1e-6))})` : `${tr(z, z < 10 ? 1 : 0)} m`; }); o({ 'geçen süre': sure(Math.max(t, 1)), 'hız oranı 20:10:1 µm': '400 : 100 : 1 (D² ile)' }); };
    const oyn = dongu(btn, (dt) => { t += dt * 7200; if (t >= 432000) { t = 432000; ciz(); return false; } ciz(); });
    b2.addEventListener('click', () => { oyn.dur(); t = 0; ciz(); });
    ciz();
    return { dur: oyn.dur };
  };

  Sekil.m323_twomey = function (kap) {
    const W = 600, H = 300, svg = svgYap(kap, W, H, 'Twomey etkisi: aynı su, daha çok ve daha küçük damla');
    for (const [x, ad] of [[14, 'temiz bulut (N₀ damla)'], [310, 'kirli bulut (k·N₀ damla)']]) { svg.append(el('rect', { x, y: 40, width: 276, height: 212, rx: 10, fill: 'var(--yuzey)', stroke: 'var(--cizgi)' })); yaz(svg, x + 138, 28, ad, { h: 'middle', k: 14, b: true }); }
    const r0 = 22, yerles = (g, x0, N, r) => { const cols = Math.ceil(Math.sqrt(N * 276 / 212)), rows = Math.ceil(N / cols), cw = 276 / cols, ch = 212 / rows, rnd = tohum(N * 7 + 3); for (let i = 0; i < N; i++) { const c = i % cols, rr = Math.floor(i / cols), jx = (rnd() - 0.5) * Math.max(0, cw - 2 * r) * 0.6, jy = (rnd() - 0.5) * Math.max(0, ch - 2 * r) * 0.6; g.append(el('circle', { cx: x0 + cw * (c + 0.5) + jx, cy: 40 + ch * (rr + 0.5) + jy, r, fill: 'var(--acc)', opacity: 0.55, stroke: 'var(--acc)' })); } };
    const sol = el('g'); svg.append(sol); yerles(sol, 14, 6, r0);
    const sag = el('g'); svg.append(sag);
    yaz(svg, 300, 282, 'su kütlesi iki kutuda aynı: N·r³ sabit', { h: 'middle', k: 14, b: true, r: 'var(--tur)' });
    const o = okuma(kap, ['yarıçap r/r₀ = k^(−1/3)', 'toplam kesit N·r² → k^(1/3)', 'sonuç']);
    const k = kontrol(kap); const sK = surgu(k, 'k = N/N₀', 1, 8, 1, 8, (v) => `${v} kat`);
    const ciz = () => { const kk = sK.v, r = r0 / Math.cbrt(kk); sag.replaceChildren(); yerles(sag, 310, 6 * kk, r); o({ 'yarıçap r/r₀ = k^(−1/3)': tr(1 / Math.cbrt(kk), 2), 'toplam kesit N·r² → k^(1/3)': `${tr(Math.cbrt(kk), 2)} kat (optik derinlik de)`, 'sonuç': kk > 1 ? 'albedo ↑ (soğutma) · küçük damla zor büyür → yağış ↓, bulut ömrü ↑' : 'temiz bulutla aynı' }); };
    sK.inp.addEventListener('input', ciz); ciz();
  };

  Sekil.m323_gorus = function (kap) {
    const W = 600, H = 320, svg = svgYap(kap, W, H, 'Koschmieder: kontrast uzaklıkla üstel azalır, eşik yüzde 2');
    const d = eksen(svg, { W, H, L: 54, x: [0, 100], y: [0, 1], xt: [0, 20, 40, 60, 80, 100], yt: [0, 0.25, 0.5, 0.75, 1], yf: (v) => tr(v, 2), xad: 'uzaklık x (km)', yad: 'kontrast C/C₀' });
    svg.append(el('line', { x1: d.L, x2: d.W - d.R, y1: d.y(0.02), y2: d.y(0.02), stroke: 'var(--tur)', 'stroke-dasharray': '5 4', 'stroke-width': 2 }));
    yaz(svg, d.W - d.R, d.y(0.02) - 6, 'göz eşiği %2', { h: 'end', k: 12, b: true, r: 'var(--tur)' });
    const c = el('path', { fill: 'none', stroke: 'var(--acc)', 'stroke-width': 3 }); svg.append(c);
    const v = el('line', { stroke: 'var(--tur)', 'stroke-width': 2 }); svg.append(v); const vt = yaz(svg, 0, d.T + 14, '', { k: 13, b: true, r: 'var(--tur)' });
    const o = okuma(kap, ['K (yok olma katsayısı)', 'V = 3,912/K', 'x = 10 km kontrast']);
    const k = kontrol(kap); const sK = surgu(k, 'K', -2, 0.5, 0.01, Math.log10(0.05), (u) => `${tr(10 ** u, 2)} km⁻¹`);
    const k2 = kontrol(kap);
    for (const [ad, K] of [['temiz hava (0,05)', 0.05], ['pus (0,3)', 0.3], ['S23-b eşik (0,56)', 0.56]]) dugme(k2, ad, true).addEventListener('click', () => { sK.set(Math.log10(K)); ciz(); });
    const ciz = () => { const K = 10 ** sK.v, V = 3.912 / K; c.setAttribute('d', egri(d, (x) => Math.exp(-K * x), 0, 100, 200)); const xv = Math.min(V, 100); v.setAttribute('x1', d.x(xv)); v.setAttribute('x2', d.x(xv)); v.setAttribute('y1', d.T); v.setAttribute('y2', d.H - d.B); v.setAttribute('opacity', V <= 100 ? 1 : 0); vt.setAttribute('x', d.x(Math.min(xv, 80)) + 6); vt.textContent = V <= 100 ? `V = ${tr(V, 1)} km` : `V = ${tr(V, 0)} km (eksen dışı)`; o({ 'K (yok olma katsayısı)': `${tr(K, 3)} km⁻¹`, 'V = 3,912/K': `${tr(V, 1)} km`, 'x = 10 km kontrast': `%${tr(Math.exp(-K * 10) * 100, 1)}` }); };
    sK.inp.addEventListener('input', ciz); ciz();
  };

  Sekil.m323_beer = function (kap, ayar = {}) {
    const W = 600, H = 300, svg = svgYap(kap, W, H, 'Beer–Lambert: tabakadan geçen doğrudan ışın, saçılan ve soğrulan pay');
    const kat = el('rect', { x: 10, y: 110, width: 580, height: 80, fill: 'var(--ikincil)' }); svg.append(kat);
    const isi = el('rect', { x: 10, y: 110, width: 580, height: 80, fill: 'var(--tur)' }); svg.append(isi);
    yaz(svg, 18, 128, 'aerosol tabakası', { k: 13, b: true });
    svg.append(el('rect', { x: 10, y: 262, width: 580, height: 30, fill: 'var(--yesil-zemin)', stroke: 'var(--yesil)' }));
    const bg = el('g'); svg.append(bg);
    const o = okuma(kap, ['hava kütlesi 1/cos θ', 'eğik τ', 'doğrudan geçen I/I₀', 'saçılan ω(1−T)', 'soğrulan (1−ω)(1−T)']);
    const k = kontrol(kap);
    const sTau = surgu(k, 'τ (dikey)', 0, 2, 0.01, ayar.omega ? 0.45 : 0.3, (v) => tr(v, 2)), sTh = surgu(k, 'θ', 0, 85, 1, 0, (v) => `${v}°`), sW = surgu(k, 'ω', 0, 1, 0.01, ayar.omega ? 0.85 : 0.95, (v) => tr(v, 2));
    const k2 = kontrol(kap);
    for (const [ad, ta, th, w] of [['S24 · 60°', 0.3, 60, 0.95], ['S24 · 80°', 0.3, 80, 0.95], ['S25 · pus', 0.45, 0, 0.85]]) dugme(k2, ad, true).addEventListener('click', () => { sTau.set(ta); sTh.set(th); sW.set(w); ciz(); });
    const ciz = () => {
      const tau = sTau.v, th = sTh.v * Math.PI / 180, w = sW.v, m = 1 / Math.cos(th), T = Math.exp(-tau * m), sac = w * (1 - T), sog = (1 - w) * (1 - T);
      kat.setAttribute('opacity', 0.05 + Math.min(tau, 2) * 0.12); isi.setAttribute('opacity', Math.min(0.5, sog * 1.2));
      const tn = Math.min(Math.tan(th), 3), X = (y) => 300 + (y - 150) * tn;
      bg.replaceChildren();
      bg.append(el('line', { x1: X(10), y1: 10, x2: X(110), y2: 110, stroke: 'var(--tur)', 'stroke-width': 16, 'stroke-linecap': 'round' }));
      bg.append(el('path', { d: `M${X(110) - 8},110 L${X(110) + 8},110 L${X(190) + 8 * T},190 L${X(190) - 8 * T},190 Z`, fill: 'var(--tur)', opacity: 0.8 }));
      ok(bg, X(190), 190, X(258), 258, 'var(--tur)', Math.max(1, 16 * T));
      const rnd = tohum(5), ns = Math.round(sac * 14);
      for (let i = 0; i < ns; i++) { const y = 120 + rnd() * 60, a = rnd() * 2 * Math.PI; ok(bg, X(y), y, X(y) + Math.cos(a) * 46, y + Math.sin(a) * 46, 'var(--acc)', 1.6); }
      yaz(bg, 584, 240, `yere doğrudan %${tr(T * 100, 0)}`, { h: 'end', k: 13, b: true, r: 'var(--tur)' });
      o({ 'hava kütlesi 1/cos θ': tr(m, 2), 'eğik τ': tr(tau * m, 2), 'doğrudan geçen I/I₀': `${tr(T, 3)} (%${tr(T * 100, 0)})`, 'saçılan ω(1−T)': tr(sac, 3), 'soğrulan (1−ω)(1−T)': `${tr(sog, 3)} → tabakayı ısıtır` });
    };
    for (const s of [sTau, sTh, sW]) s.inp.addEventListener('input', ciz);
    ciz();
  };

  /* ============================== B4 · ASİT + PİNATUBO + ENSO ============================== */
  const KH = 3.4e-2, K1 = 4.3e-7, pHco2 = (ppm) => -Math.log10(Math.sqrt(KH * K1 * ppm * 1e-6));
  Sekil.m323_henry = function (kap) {
    const W = 600, H = 320, svg = svgYap(kap, W, H, 'Temiz yağmurun pH değeri havadaki CO₂ ile belirlenir');
    const d = eksen(svg, { W, H, L: 54, x: [100, 1000], y: [5.3, 6.0], xt: [100, 280, 420, 560, 800, 1000], yt: [5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 6.0], yf: (v) => tr(v, 1), xad: 'CO₂ (ppm)', yad: 'pH' });
    svg.append(el('path', { d: egri(d, pHco2, 100, 1000), fill: 'none', stroke: 'var(--acc)', 'stroke-width': 3 }));
    for (const [c, ad] of [[280, 'sanayi öncesi 5,69'], [420, 'bugün 5,61']]) { nokta(svg, d.x(c), d.y(pHco2(c)), 5, 'var(--tur)'); yaz(svg, d.x(c) + 8, d.y(pHco2(c)) - 8, ad, { k: 12, b: true }); }
    const ty = [['CO₂(g) ⇌ CO₂·H₂O', 'Kₕ = 3,4×10⁻²'], ['CO₂·H₂O ⇌ H⁺ + HCO₃⁻', 'K₁ = 4,3×10⁻⁷'], ['[H⁺] = [HCO₃⁻] → [H⁺]² = Kₕ K₁ p', '']];
    ty.forEach(([a, b], i) => { yaz(svg, d.x(470), d.y(5.95) + i * 20, a, { k: 13, b: true }); if (b) yaz(svg, d.W - d.R, d.y(5.95) + i * 20, b, { h: 'end', k: 12, r: 'var(--ikincil)' }); });
    const m = nokta(svg, d.x(420), d.y(pHco2(420)), 7, 'var(--tur)');
    const o = okuma(kap, ['CO₂', 'p (atm)', '[H⁺]', 'pH']);
    const set = (c) => { c = sinir(c, 100, 1000); const p = c * 1e-6, h = Math.sqrt(KH * K1 * p); m.setAttribute('cx', d.x(c)); m.setAttribute('cy', d.y(-Math.log10(h))); o({ 'CO₂': `${tr(c, 0)} ppm`, 'p (atm)': bil(p), '[H⁺]': `${bil(h)} mol/L`, pH: tr(-Math.log10(h), 2) }); };
    imlec(svg, d, (c) => set(c)); set(420);
  };

  Sekil.m323_ph = function (kap) {
    const W = 600, H = 250, svg = svgYap(kap, W, H, 'pH ölçeği: temiz yağmur, asit yağmuru ve hesaplanan değer');
    const X = (p) => 30 + p / 14 * 540;
    for (let i = 0; i < 14; i++) svg.append(el('rect', { x: X(i), y: 80, width: 540 / 14 + 0.5, height: 40, fill: i < 7 ? 'var(--tur)' : 'var(--acc)', opacity: 0.12 + Math.abs(7 - (i + 0.5)) / 7 * 0.7 }));
    for (let i = 0; i <= 14; i += 1) yaz(svg, X(i), 140, i, { h: 'middle', k: 12, r: 'var(--ikincil)' });
    svg.append(el('rect', { x: X(4), y: 62, width: X(4.4) - X(4), height: 18, fill: 'var(--tur)', opacity: 0.7 })); yaz(svg, X(4.4), 54, 'asit yağmuru 4–4,4', { h: 'end', k: 12, b: true, r: 'var(--tur)' });
    for (const [p, ad, y] of [[5.6, 'temiz yağmur 5,6', 30], [7, 'nötr 7', 54]]) { svg.append(el('line', { x1: X(p), x2: X(p), y1: y + 6, y2: 120, stroke: 'var(--yazi)', 'stroke-width': 2 })); yaz(svg, X(p) + (p === 7 ? 4 : 0), y, ad, { h: p === 7 ? 'start' : 'middle', k: 12, b: true }); }
    const ok3 = el('path', { fill: 'var(--yazi)' }); svg.append(ok3); const okt = yaz(svg, 0, 186, '', { h: 'middle', k: 15, b: true });
    yaz(svg, 300, 236, '1 pH birimi = 10 kat [H⁺]', { h: 'middle', k: 13, r: 'var(--ikincil)' });
    const o = okuma(kap, ['[H⁺] asitlerden', 'pH (CO₂ ihmal)', 'pH (CO₂ dahil, tam)', 'temize göre']);
    const k = kontrol(kap);
    const sN = surgu(k, 'HNO₃', 0, 60, 0.5, 30, (v) => `${tr(v)} µmol/L`), sS = surgu(k, 'H₂SO₄', 0, 30, 0.5, 10, (v) => `${tr(v)} µmol/L`);
    const ciz = () => {
      const a = (sN.v + 2 * sS.v) * 1e-6, Kc = KH * K1 * 420e-6, h = (a + Math.sqrt(a * a + 4 * Kc)) / 2, pt = -Math.log10(h);
      ok3.setAttribute('d', `M${X(pt)},124 l-9,20 h18 Z`); okt.setAttribute('x', X(pt)); okt.textContent = `pH ${tr(pt, 2)}`;
      o({ '[H⁺] asitlerden': `${bil(a)} mol/L (HNO₃ → 1 H⁺, H₂SO₄ → 2 H⁺)`, 'pH (CO₂ ihmal)': a > 0 ? tr(-Math.log10(a), 2) : '—', 'pH (CO₂ dahil, tam)': tr(pt, 2), 'temize göre': `10^(5,6 − pH) ≈ ${tr(10 ** (5.6 - pt), 1)} kat` });
    };
    for (const s of [sN, sS]) s.inp.addEventListener('input', ciz);
    ciz();
  };

  const ZINCIR = {
    asit: [['SO₂', 'yakıttaki S yanar', `Birincil kirletici: kömür ve petroldeki kükürt yanınca SO₂ olarak salınır.`],
      ['HSO₃', 'SO₂ + OH + M', `OH radikali saldırır; üçüncü cisim M (N₂, O₂) fazla enerjiyi alır, yoksa ürün yeniden ayrışır.`],
      ['SO₃ + HO₂', 'HSO₃ + O₂', `Oksijen bir H atomu koparır. HO₂ sonra NO ile OH'yi geri verir → OH tükenmez.`],
      ['H₂SO₄', 'SO₃ + H₂O', `Çok hızlı. Sülfürik asidin buhar basıncı çok düşük → hemen yoğuşur: sülfat aerosolü (ince mod).`],
      ['(NH₄)₂SO₄', 'H₂SO₄ + 2 NH₃', `Amonyak asidi nötrler; amonyum sülfat ince aerosolün ana bileşenidir (S28).`],
      ['asit yağış', 'bulut damlasında çözünür', `H₂SO₄ → 2H⁺ + SO₄²⁻: her mol asit 2 mol H⁺ verir (S27). Yağışla iner: ıslak çökelme.`]],
    azot: [['NO', 'yanma (yüksek T)', `Yüksek sıcaklıkta havanın N₂ ve O₂'si birleşir; egzozdan çoğunlukla NO çıkar.`],
      ['NO₂', 'NO + O₃ ya da NO + HO₂', `NO dakikalar içinde NO₂'ye döner; ikisine birlikte NOx denir.`],
      ['HNO₃', 'NO₂ + OH + M', `Gündüz OH ile nitrik asit oluşur; tepkime üç cisimlidir.`],
      ['yağış · NH₄NO₃', 'HNO₃ → 1 H⁺', `Nitrik asit yağışla iner (1 mol → 1 mol H⁺) ya da NH₃ ile amonyum nitrat aerosolü olur.`]],
    stok: [['S: 20 t', '1000 t × %2 = 6,24×10⁵ mol', `Kütleden mole: 20×10⁶ g / 32,06 g/mol. Bundan sonra her üründe 1 mol S var.`],
      ['SO₂: 40 t', '× 64,06 g/mol', `S + O₂ → SO₂: 1 mol S → 1 mol SO₂; kütle 64,06/32,06 ≈ 2 kat (oksijen eklendi).`],
      ['H₂SO₄: 61 t', '× 98,08 g/mol', `SO₂ → SO₃ → H₂SO₄: yine 1 mol S → 1 mol asit; 98,08/32,06 ≈ 3,06 kat.`],
      ['(NH₄)₂SO₄', '+ 2 NH₃ = 21 t', `H₂SO₄ + 2NH₃ → (NH₄)₂SO₄: 2 × 6,24×10⁵ mol × 17,03 g/mol ≈ 21 t NH₃.`]],
    muson: [['SO₂ stratosfere', '≈ 17 Mt, 20–25 km', `Patlama sütunu SO₂'yi tropopozun üstüne taşır; orada yağış yok, hava kararlı.`],
      ['sülfat aerosolü', '+ OH → H₂SO₄ ≈ 26 Mt', `SO₂ birkaç haftada H₂SO₄ damlacıklarına döner; bunlar ≈ 1 yıllık e-katlanma süresiyle azalır.`],
      ['güneş saçılır', 'albedo ↑', `Mikron altı damlacıklar görünür ışığı saçar → gezegen albedosu artar.`],
      ['yüzey soğur', '≈ −0,5 °C', `Yere daha az güneş ulaşır → yüzey ve troposfer soğur.`],
      ['deniz yüzeyi soğur', 'SST ↓', `Okyanus yüzeyi soğur — zincirin atlanmaması gereken halkası.`],
      ['buharlaşma ↓', 'eₛ düşer', `Soğuk yüzeyde doyma buhar basıncı düşük → buharlaşma azalır.`],
      ['Hadley zayıflar', 'tropik yükselme ↓', `Gizli ısı salımı azalır → tropikal yükselme ve konveksiyon zayıflar.`],
      ['muson yağışı ↓', '%10–20', `Güneydoğu Asya, Hint Okyanusu ve Sahel yağışı azalır.`]],
    psc: [['polar girdap', 'kutup kışı, yalıtılmış', `Kışın kutup çevresinde güçlü batı rüzgârları havayı yalıtır; güneş yok → hava çok soğur.`],
      ['T < −78 °C', '15–20 km', `Bu soğuklukta nitrik asit hidratları ve buz yoğuşur.`],
      ['PSC', 'kutup stratosfer bulutu', `Parçacık yüzeyleri heterojen tepkimelere sahne olur.`],
      ['Cl₂ + HNO₃', 'HCl + ClONO₂ (yüzeyde)', `İki zararsız rezervuar parçacık yüzeyinde aktif Cl₂'ye döner; HNO₃ parçacıkta kalır.`],
      ['2 Cl', 'ilkbahar: Cl₂ + hν', `Güneş döner dönmez Cl₂ fotolizle bölünür.`],
      ['ClO + O₂', 'Cl + O₃', `Katalitik döngü başlar; Cl geri kazanılır ve yeniden ozon bozar.`],
      ['ozon deliği', 'Antarktika ilkbaharı', `Birkaç haftada 15–20 km'deki ozonun büyük kısmı bozulur.`]],
  };
  Sekil.m323_zincir = function (kap, ayar = {}) {
    const Z = ZINCIR[ayar.ad] || ZINCIR.asit, n = Z.length, sat = Math.ceil(n / 3), W = 600, H = 20 + sat * 96, BW = 156, BH = 60, GX = 36;
    const svg = svgYap(kap, W, H, 'Tepkime ve etki zinciri');
    const pos = (i) => { const r = Math.floor(i / 3); let c = i % 3; if (r % 2) c = 2 - c; return [36 + c * (BW + GX), 14 + r * 96]; };
    const o = okuma(kap, ['Adım']);
    const gor = (i) => ayar.adim == null || i <= ayar.adim;
    Z.forEach((z, i) => {
      const [x, y] = pos(i), g = el('g', { tabindex: 0, role: 'button', style: 'cursor:pointer', opacity: gor(i) ? 1 : 0.15 });
      if (i > 0) { const [px, py] = pos(i - 1); const a = py === y ? ok(svg, x > px ? px + BW + 2 : px - 2, y + BH / 2, x > px ? x - 2 : x + BW + 2, y + BH / 2, 'var(--tur)', 2.5) : ok(svg, px + BW / 2, py + BH + 2, x + BW / 2, y - 2, 'var(--tur)', 2.5); a.setAttribute('opacity', gor(i) ? 1 : 0.15); }
      g.append(el('rect', { x, y, width: BW, height: BH, rx: 10, fill: i === ayar.adim ? 'var(--tur-zemin)' : 'var(--yuzey)', stroke: i === ayar.adim ? 'var(--tur)' : 'var(--cizgi)', 'stroke-width': 2 }));
      yaz(g, x + BW / 2, y + 26, z[0], { h: 'middle', k: 16, b: true }); yaz(g, x + BW / 2, y + 47, z[1], { h: 'middle', k: 11.5, r: 'var(--ikincil)' });
      const sec = () => o({ 'Adım': `${i + 1}. ${z[0]} — ${z[2]}` });
      g.addEventListener('click', sec); g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') sec(); });
      svg.append(g);
    });
    const a = ayar.adim == null ? 0 : Math.min(ayar.adim, n - 1); o({ 'Adım': `${a + 1}. ${Z[a][0]} — ${Z[a][2]}` });
  };

  Sekil.m323_volkan = function (kap) {
    const W = 600, H = 320, svg = svgYap(kap, W, H, 'Stratosferik sülfat: yüzeyi soğutur, stratosferi ısıtır');
    svg.append(el('rect', { x: 10, y: 290, width: 580, height: 24, fill: 'var(--yesil-zemin)', stroke: 'var(--yesil)' })); yaz(svg, 580, 307, 'yüzey −0,5 °C', { h: 'end', k: 13, b: true, r: 'var(--acc)' });
    svg.append(el('line', { x1: 10, x2: 590, y1: 170, y2: 170, stroke: 'var(--ikincil)', 'stroke-dasharray': '6 5' })); yaz(svg, 584, 164, 'tropopoz', { h: 'end', k: 12, r: 'var(--ikincil)' });
    svg.append(el('rect', { x: 10, y: 84, width: 580, height: 40, fill: 'var(--tur-zemin)' }));
    const rnd = tohum(3); for (let i = 0; i < 90; i++) svg.append(el('circle', { cx: 14 + rnd() * 572, cy: 88 + rnd() * 32, r: 2.2, fill: 'var(--ikincil)' }));
    yaz(svg, 584, 78, 'sülfat katmanı 20–25 km · stratosfer +2 °C', { h: 'end', k: 13, b: true, r: 'var(--tur)' });
    ok(svg, 60, 10, 110, 84, 'var(--tur)', 6); ok(svg, 110, 84, 170, 18, 'var(--acc)', 3); yaz(svg, 176, 30, 'güneş saçılır/yansır → albedo ↑', { k: 13, b: true, r: 'var(--acc)' });
    ok(svg, 110, 124, 150, 286, 'var(--tur)', 3.5); yaz(svg, 160, 240, 'yere daha az güneş', { k: 13, b: true, r: 'var(--tur)' });
    ok(svg, 300, 286, 300, 128, 'var(--yesil)', 4, true); yaz(svg, 310, 250, 'yer IR', { k: 13, b: true, r: 'var(--yesil)' });
    yaz(svg, 584, 204, 'katman IR ve yakın-IR soğurur → ısınır', { h: 'end', k: 12.5, r: 'var(--yazi)' }); yaz(svg, 584, 224, 'yağış yok → 2–3 yıl kalır', { h: 'end', k: 12.5, r: 'var(--yazi)' });
  };

  Sekil.m323_enso = function (kap, ayar = {}) {
    const W = 600, H = 320, svg = svgYap(kap, W, H, 'Tropikal Pasifik kesiti: Normal, El Niño ve La Niña');
    svg.append(el('rect', { x: 10, y: 170, width: 580, height: 140, fill: 'var(--acc)', opacity: 0.12 }));
    svg.append(el('line', { x1: 10, x2: 590, y1: 170, y2: 170, stroke: 'var(--acc)', 'stroke-width': 2 }));
    yaz(svg, 14, 306, 'batı: Endonezya–Avustralya', { k: 12, b: true }); yaz(svg, 586, 306, 'doğu: Peru', { h: 'end', k: 12, b: true });
    const dg = el('g'); svg.append(dg);
    const o = okuma(kap, ['ticaret rüzgârı', 'doğu Pasifik', 'Peru', 'Endonezya', 'Tahiti − Darwin']);
    const FAZ = [{ tc: [262, 196], sic: 320, yuk: 120, ruz: 3, a: ['güçlü (doğudan batıya)', 'soğuk su yükselir', 'kuru, balık bol', 'yağışlı', 'pozitif'] },
      { tc: [242, 232], sic: 520, yuk: 400, ruz: 1, a: ['zayıf, bazen ters', 'sıcak', 'sel, balık azalır', 'kurak', 'negatif (Güney Salınımı −)'] },
      { tc: [280, 184], sic: 240, yuk: 90, ruz: 4, a: ['daha güçlü', 'daha soğuk', 'daha kuru', 'daha yağışlı', 'daha pozitif'] }];
    const ciz = (i) => {
      const f = FAZ[i]; dg.replaceChildren();
      dg.append(el('path', { d: `M10,170 L${f.sic},170 L${f.sic},${f.tc[0] + (f.tc[1] - f.tc[0]) * (f.sic - 10) / 580} L10,${f.tc[0]} Z`, fill: 'var(--tur)', opacity: 0.35 }));
      dg.append(el('path', { d: `M10,${f.tc[0]} L590,${f.tc[1]}`, stroke: 'var(--yazi)', 'stroke-width': 2.5, 'stroke-dasharray': '8 5' }));
      yaz(dg, 300, (f.tc[0] + f.tc[1]) / 2 + 22, 'termoklin (sıcak/soğuk su sınırı)', { h: 'middle', k: 12, r: 'var(--ikincil)' });
      const x = f.yuk;
      dg.append(el('path', { d: `M${x},150 C${x},40 ${x + 40},40 ${x + 90},40 L540,40 C590,40 590,60 590,90 L590,150`, fill: 'none', stroke: 'var(--ikincil)', 'stroke-width': 2, opacity: i === 1 ? 0.35 : 0.9 }));
      ok(dg, x, 120, x, 70, 'var(--ikincil)', 2.5);
      for (const dx of [-26, 0, 26]) dg.append(el('ellipse', { cx: x + dx, cy: 34, rx: 26, ry: 13, fill: 'var(--yuzey)', stroke: 'var(--ikincil)' }));
      for (let j = 0; j < 5; j++) dg.append(el('line', { x1: x - 20 + j * 10, x2: x - 26 + j * 10, y1: 50, y2: 64, stroke: 'var(--acc)', 'stroke-width': 2 }));
      for (let j = 0; j < f.ruz; j++) ok(dg, 560 - j * 120, 158, 560 - j * 120 - (i === 1 ? 40 : 90), 158, 'var(--acc)', 3);
      yaz(dg, 20, 160, 'ticaret rüzgârı ←', { k: 12, b: true, r: 'var(--acc)' });
      o({ 'ticaret rüzgârı': f.a[0], 'doğu Pasifik': f.a[1], Peru: f.a[2], 'Endonezya': f.a[3], 'Tahiti − Darwin': f.a[4] });
    };
    const k = kontrol(kap); secenek(k, ['Normal', 'El Niño', 'La Niña'], ayar.faz || 0, ciz); ciz(ayar.faz || 0);
  };

  /* ============================== B5 · ÖMÜR + KİNETİK ============================== */
  Sekil.m323_ustel = function (kap, ayar = {}) {
    const tur = ayar.tur || 'buyume', W = 600, H = 320;
    const svg = svgYap(kap, W, H, tur === 'buyume' ? 'Üstel büyüme ve doğrusal büyümenin kıyası' : tur === 'sonum' ? 'Birinci mertebe üstel sönüm' : 'NO₂ fotolizi: birinci mertebe kayıp');
    const k = kontrol(kap);
    const p1 = el('path', { fill: 'none', stroke: 'var(--tur)', 'stroke-width': 3 }), p2 = el('path', { fill: 'none', stroke: 'var(--ikincil)', 'stroke-width': 2, 'stroke-dasharray': '6 5' }), m = el('g');
    if (tur === 'buyume') {
      const d = eksen(svg, { W, H, L: 50, x: [0, 20], y: [0, 8], xt: [0, 5, 10, 15, 20], yt: [0, 2, 4, 6, 8], xad: 't (yıl)', yad: 'N / N₀' });
      svg.append(el('line', { x1: d.L, x2: d.W - d.R, y1: d.y(2), y2: d.y(2), stroke: 'var(--acc)', 'stroke-dasharray': '4 4' })); yaz(svg, d.L + 6, d.y(2) - 6, 'iki katı', { k: 12, r: 'var(--acc)' });
      svg.append(p1, p2, m); yaz(svg, d.x(19.5), d.y(1.5), 'doğrusal 1 + r·t', { h: 'end', k: 12, r: 'var(--ikincil)' });
      const o = okuma(kap, ['ikiye katlanma ln2/ln(1+r)', '70/r kısayolu', '10 yılda']);
      const s = surgu(k, 'r', 1, 20, 0.5, 10, (v) => `%${tr(v)}/yıl`);
      const ciz = () => { const r = s.v / 100, t2 = Math.log(2) / Math.log(1 + r); p1.setAttribute('d', egri(d, (t) => { const v = (1 + r) ** t; return v > 8 ? NaN : v; }, 0, 20, 200)); p2.setAttribute('d', egri(d, (t) => 1 + r * t, 0, 20, 2)); m.replaceChildren(); if (t2 <= 20) nokta(m, d.x(t2), d.y(2), 6, 'var(--tur)'); o({ 'ikiye katlanma ln2/ln(1+r)': `${tr(t2, 1)} yıl`, '70/r kısayolu': `${tr(70 / s.v, 1)} yıl`, '10 yılda': `${tr((1 + r) ** 10, 2)} kat (doğrusal sanınca ${tr(1 + 10 * r, 2)})` }); };
      s.inp.addEventListener('input', ciz); ciz(); return;
    }
    if (tur === 'sonum') {
      const M0 = ayar.M0 ?? 26, d = eksen(svg, { W, H, L: 50, x: [0, 6], y: [0, 30], xt: [0, 1, 2, 3, 4, 5, 6], yt: [0, 10, 20, 30], xad: 't (yıl)', yad: 'M (Mt H₂SO₄)' });
      svg.append(p1, p2, m);
      const o = okuma(kap, ['t = τ anında kalan', '%1\'e iniş = τ·ln100', 'ilk yıl / ikinci yıl kayıp']);
      const s = surgu(k, 'τ', 0.5, 3, 0.05, 1, (v) => `${tr(v, 2)} yıl`);
      const ciz = () => { const tau = s.v; p1.setAttribute('d', egri(d, (t) => M0 * Math.exp(-t / tau), 0, 6, 200)); p2.setAttribute('d', yol([[d.L, d.y(M0 / Math.E)], [d.W - d.R, d.y(M0 / Math.E)]])); m.replaceChildren(); nokta(m, d.x(tau), d.y(M0 / Math.E), 6, 'var(--acc)'); yaz(m, d.x(tau) + 8, d.y(M0 / Math.E) - 8, 'M₀/e (%37)', { k: 12, b: true, r: 'var(--acc)' }); for (const t of [1, 2, 3]) nokta(m, d.x(t), d.y(M0 * Math.exp(-t / tau)), 4, 'var(--tur)'); const a1 = M0 * (1 - Math.exp(-1 / tau)), a2 = M0 * (Math.exp(-1 / tau) - Math.exp(-2 / tau)); o({ 't = τ anında kalan': `${tr(M0 / Math.E, 1)} Mt`, '%1\'e iniş = τ·ln100': `${tr(tau * Math.log(100), 1)} yıl`, 'ilk yıl / ikinci yıl kayıp': `${tr(a1, 1)} / ${tr(a2, 1)} Mt (doğrusal değil)` }); };
      s.inp.addEventListener('input', ciz); ciz(); return;
    }
    const d = eksen(svg, { W, H, L: 50, x: [0, 600], y: [0, 1], xt: [0, 120, 240, 360, 480, 600], yt: [0, 0.25, 0.5, 0.75, 1], yf: (v) => tr(v, 2), xad: 't (s)', yad: '[NO₂] / [NO₂]₀' });
    svg.append(p1, m);
    const o = okuma(kap, ['ömür τ = 1/J', 'yarı ömür ln2/J', '10 dakika sonra kalan']);
    const s = surgu(k, 'J', -3, -1.92, 0.001, Math.log10(8e-3), (u) => `${bil(10 ** u)} s⁻¹`);
    const ciz = () => { const J = 10 ** s.v; p1.setAttribute('d', egri(d, (t) => Math.exp(-J * t), 0, 600, 200)); m.replaceChildren(); if (1 / J <= 600) { nokta(m, d.x(1 / J), d.y(1 / Math.E), 6, 'var(--acc)'); yaz(m, d.x(1 / J) + 8, d.y(1 / Math.E) - 8, 't = 1/J', { k: 12, b: true, r: 'var(--acc)' }); } o({ 'ömür τ = 1/J': sure(1 / J), 'yarı ömür ln2/J': sure(Math.log(2) / J), '10 dakika sonra kalan': `%${tr(Math.exp(-J * 600) * 100, 2)}` }); };
    s.inp.addEventListener('input', ciz); ciz();
  };

  Anim.m323_kutu = function (kap, ayar = {}) {
    const E0 = ayar.E ?? 616, tau0 = ayar.tau ?? 10, M0 = ayar.M0 ?? 5600, bir = ayar.birim || 'Tg', tmax = ayar.tmax ?? 50, zb = ayar.zaman || 'yıl';
    const W = 600, H = 320, svg = svgYap(kap, W, H, 'Kutu modeli: kaynak ve kayıp dengesine üstel yaklaşma');
    const ymax = Math.max(M0, E0 * tau0, 1) * 1.6, st = tmax <= 10 ? 1 : tmax <= 60 ? 10 : 20;
    const d = eksen(svg, { W, H, L: 170, x: [0, tmax], y: [0, ymax], xt: Array.from({ length: Math.floor(tmax / st) + 1 }, (_, i) => i * st), yt: [0, ymax / 2, ymax].map((v) => +v.toPrecision(2)), xf: (v) => tr(v, v < 10 ? 1 : 0), yf: (v) => (v >= 1000 ? Math.round(v).toLocaleString('tr-TR') : tr(v, 0)), xad: `t (${zb})`, yad: '' });
    yaz(svg, 170, 20, `M (${bir})`, { k: 14, b: true });
    svg.append(el('rect', { x: 34, y: d.y(ymax), width: 76, height: d.y(0) - d.y(ymax), fill: 'var(--yuzey)', stroke: 'var(--yazi)', 'stroke-width': 2 }));
    const dol = el('rect', { x: 35, width: 74, fill: 'var(--acc)', opacity: 0.45 }); svg.append(dol);
    const eqL = el('line', { stroke: 'var(--tur)', 'stroke-dasharray': '6 4', 'stroke-width': 2 }); svg.append(eqL); const eqT = yaz(svg, 0, 0, '', { h: 'end', k: 12, b: true, r: 'var(--tur)' });
    const gir = el('g'); svg.append(gir);
    const egr = el('path', { fill: 'none', stroke: 'var(--acc)', 'stroke-width': 3.5 }); svg.append(egr); const mk = nokta(svg, 0, 0, 7, 'var(--acc)');
    const o = okuma(kap, ['t', 'M', 'kaynak E', 'kayıp M/τ', 'dM/dt', 'dengeye kalan fark']);
    const k = kontrol(kap); const btn = dugme(k, '▶ Oynat'), b2 = dugme(k, 'Baştan', true);
    const k2 = kontrol(kap);
    const sE = surgu(k2, 'E', 0, Math.max(1, E0 * 2), Math.max(0.01, E0 / 100), E0, (v) => `${tr(v, v < 10 ? 2 : 0)} ${bir}/${zb}`), sT = surgu(k2, 'τ', tau0 * 0.2, tau0 * 3, tau0 / 100, tau0, (v) => `${tr(v, v < 10 ? 2 : 1)} ${zb}`);
    let t = 0;
    const M = (tt) => { const Md = sE.v * sT.v; return Md + (M0 - Md) * Math.exp(-tt / sT.v); };
    const ciz = () => {
      const E = sE.v, tau = sT.v, Md = E * tau, Mt = M(t);
      const p = []; for (let u = 0; u <= t + 1e-9; u += tmax / 300) p.push([d.x(u), d.y(sinir(M(u), 0, ymax))]); p.push([d.x(t), d.y(sinir(Mt, 0, ymax))]);
      egr.setAttribute('d', yol(p)); mk.setAttribute('cx', d.x(t)); mk.setAttribute('cy', d.y(sinir(Mt, 0, ymax)));
      dol.setAttribute('y', d.y(sinir(Mt, 0, ymax))); dol.setAttribute('height', d.y(0) - d.y(sinir(Mt, 0, ymax)));
      const yd = d.y(sinir(Md, 0, ymax)); eqL.setAttribute('x1', 28); eqL.setAttribute('x2', d.W - d.R); eqL.setAttribute('y1', yd); eqL.setAttribute('y2', yd); eqT.setAttribute('x', d.W - d.R); eqT.setAttribute('y', yd - 6); eqT.textContent = `denge E·τ = ${tr(Md, Md < 100 ? 1 : 0)}`;
      gir.replaceChildren(); if (E > 0) { ok(gir, 4, d.y(ymax) + 20, 32, d.y(ymax) + 20, 'var(--tur)', 1 + 5 * E / Math.max(1, E0 * 2)); yaz(gir, 6, d.y(ymax) + 8, 'E', { k: 13, b: true, r: 'var(--tur)' }); }
      ok(gir, 112, d.y(0) - 20, 150, d.y(0) - 20, 'var(--acc)', 1 + 5 * Math.min(1, Mt / tau / Math.max(1e-9, E0 || M0 / tau0))); yaz(gir, 114, d.y(0) - 30, 'M/τ', { k: 13, b: true, r: 'var(--acc)' });
      const kay = Mt / tau, fark = Math.abs(Md - M0) > 1e-9 ? (Mt - Md) / (M0 - Md) * 100 : 0;
      o({ t: `${tr(t, 1)} ${zb}`, M: `${tr(Mt, Mt < 100 ? 1 : 0)} ${bir}`, 'kaynak E': `${tr(E, E < 10 ? 2 : 0)} ${bir}/${zb}`, 'kayıp M/τ': `${tr(kay, kay < 10 ? 2 : 0)} ${bir}/${zb}`, 'dM/dt': `${tr(E - kay, 2)} ${bir}/${zb}`, 'dengeye kalan fark': `%${tr(fark, 0)} (e^(−t/τ))` });
    };
    const oyn = dongu(btn, (dt) => { t += dt * tmax / 8; if (t >= tmax) { t = tmax; ciz(); return false; } ciz(); });
    b2.addEventListener('click', () => { oyn.dur(); t = 0; ciz(); });
    for (const s of [sE, sT]) s.inp.addEventListener('input', ciz);
    ciz();
    return { dur: oyn.dur };
  };

  Sekil.m323_kutu = function (kap) {
    const W = 600, H = 300, svg = svgYap(kap, W, H, 'Şehir kutusu: yüzey akısı, rüzgârla taşınım ve karışma yüksekliği');
    svg.append(el('rect', { x: 10, y: 250, width: 580, height: 20, fill: 'var(--yesil-zemin)', stroke: 'var(--yesil)' }));
    const bg = el('g'); svg.append(bg);
    const o = okuma(kap, ['C = E·L/(u·h)', 'kalış süresi L/u', 'giren (birim genişlik)', 'çıkan u·h·C']);
    const k = kontrol(kap);
    const sE = surgu(k, 'E', 1, 20, 0.5, 5, (v) => `${tr(v)} µg m⁻² s⁻¹`), sL = surgu(k, 'L', 5, 50, 1, 20, (v) => `${v} km`), sU = surgu(k, 'u', 0.5, 10, 0.5, 3, (v) => `${tr(v)} m/s`), sH = surgu(k, 'h', 100, 1500, 50, 500, (v) => `${v} m`);
    const k2 = kontrol(kap);
    for (const [ad, h, u] of [['S39-a (h 500, u 3)', 500, 3], ['h = 200 m', 200, 3], ['h = 200, u = 1', 200, 1]]) dugme(k2, ad, true).addEventListener('click', () => { sE.set(5); sL.set(20); sH.set(h); sU.set(u); ciz(); });
    const ciz = () => {
      const E = sE.v, L = sL.v * 1000, u = sU.v, h = sH.v, C = E * L / (u * h), hp = 30 + h / 1500 * 190, x0 = 140, x1 = 140 + 300 * sL.v / 50 + 40;
      bg.replaceChildren();
      bg.append(el('rect', { x: x0, y: 250 - hp, width: x1 - x0, height: hp, fill: 'var(--tur)', opacity: Math.min(0.75, 0.08 + C / 700), stroke: 'var(--yazi)', 'stroke-width': 2, 'stroke-dasharray': '6 4' }));
      yaz(bg, (x0 + x1) / 2, 244 - hp, `karışma yüksekliği h = ${h} m`, { h: 'middle', k: 12, b: true });
      yaz(bg, (x0 + x1) / 2, 288, `L = ${sL.v} km`, { h: 'middle', k: 12, b: true });
      for (let i = 0; i < 3; i++) ok(bg, x0 - 10 - 12 * u, 250 - hp * (0.25 + 0.25 * i), x0 - 6, 250 - hp * (0.25 + 0.25 * i), 'var(--acc)', 2.5);
      yaz(bg, 14, 250 - hp - 6, `temiz hava u = ${u} m/s`, { k: 12, b: true, r: 'var(--acc)' });
      for (let i = 0; i < 5; i++) ok(bg, x0 + (x1 - x0) * (i + 0.5) / 5, 248, x0 + (x1 - x0) * (i + 0.5) / 5, 248 - Math.min(hp - 8, 14 + E * 1.6), 'var(--tur)', 2);
      ok(bg, x1 + 4, 250 - hp / 2, Math.min(590, x1 + 24 + 6 * u), 250 - hp / 2, 'var(--tur)', 3);
      o({ 'C = E·L/(u·h)': `${tr(C, 0)} µg/m³`, 'kalış süresi L/u': sure(L / u), 'giren (birim genişlik)': `E·L = ${Math.round(E * L).toLocaleString('tr-TR')} µg m⁻¹ s⁻¹`, 'çıkan u·h·C': `${Math.round(u * h * C).toLocaleString('tr-TR')} µg m⁻¹ s⁻¹ (= giren)` });
    };
    for (const s of [sE, sL, sU, sH]) s.inp.addEventListener('input', ciz);
    ciz();
  };

  Sekil.m323_omur = function (kap) {
    const W = 600, H = 320, svg = svgYap(kap, W, H, 'Ömür ölçeği: kısa ömürlü türler değişken, uzun ömürlüler iyi karışmış');
    const AD = new Map([[1, '1 s'], [60, '1 dk'], [3600, '1 sa'], [86400, '1 gün'], [2.6e6, '1 ay'], [3.156e7, '1 yıl'], [3.156e9, '100 yıl']]);
    const d = eksen(svg, { W, H, L: 20, R: 24, x: [1e-2, 3.156e10], y: [0, 10], xlog: true, xt: [...AD.keys()], yt: [], xf: (v) => AD.get(v), xad: 'ömür τ (log ölçek)' });
    const KAR = [[3600, 86400 * 2, 'sınır tabakası'], [2.6e6, 7.9e6, 'yarımküre içi'], [2.4e7, 6.3e7, 'yarımküreler arası']];
    KAR.forEach(([a, b, ad], i) => { svg.append(el('rect', { x: d.x(a), y: d.T, width: d.x(b) - d.x(a), height: 26, fill: 'var(--acc)', opacity: 0.25 })); yaz(svg, i === 0 ? (d.x(a) + d.x(b)) / 2 : i === 1 ? d.x(a) - 4 : d.x(b) + 4, d.T + (i === 1 ? 40 : 17), ad, { h: i === 0 ? 'middle' : i === 1 ? 'end' : 'start', k: 11, b: true, r: 'var(--acc)' }); });
    yaz(svg, d.L, d.T - 8, 'mavi şeritler: karışma süreleri', { k: 12, r: 'var(--acc)' });
    const TUR = [['O atomu', 0.03, null, 7.6, 'S41: τ = 1/(k₂[O₂][M]) ≈ 0,03 s → doğar doğmaz O₃ olur.'], ['NO₂ (öğlen)', 125, null, 6.2, 'S40: fotoliz ömrü 1/J = 125 s ≈ 2 dk.'],
      ['troposferik aerosol', 86400 * 3, 86400 * 14, 2.4, 'S17: yağış yıkar → gün–hafta; kaynağa yakın birikir.'], ['CO', 4.2e6, null, 6.2, 'S38: 48 gün < yarımküreler arası karışma (~1 yıl) → değişken; kuzey > güney.'],
      ['stratosferik sülfat', 3.156e7, null, 4.6, 'S31: e-katlanma ≈ 1 yıl; stratosferde yağış yok.'], ['CH₄', 3.156e8, null, 7.6, 'S36: 10 yıl ≫ 1 yıl → iyi karışmış (her yerde ≈ 1,9 ppm).'], ['CO₂', 3.156e9, 3.156e10, 3.2, 'Tek bir ömrü yok: okyanus ve biyosfer alışverişi yüzyıllar sürer [EK].']];
    const o = okuma(kap, ['Seçilen']);
    for (const [ad, a, b, yy, ac] of TUR) {
      const g = el('g', { tabindex: 0, role: 'button', style: 'cursor:pointer' }), y = d.y(yy);
      if (b) g.append(el('rect', { x: d.x(a), y: y - 8, width: d.x(b) - d.x(a), height: 16, rx: 8, fill: 'var(--tur)', opacity: 0.8 }));
      else g.append(el('circle', { cx: d.x(a), cy: y, r: 8, fill: 'var(--tur)' }));
      const xm = b ? (d.x(a) + d.x(b)) / 2 : d.x(a);
      yaz(g, xm, y - 14, ad, { h: 'middle', k: 13, b: true });
      g.append(el('line', { x1: xm, x2: xm, y1: y + 8, y2: d.H - d.B, stroke: 'var(--tur)', 'stroke-dasharray': '2 4', opacity: 0.6 }));
      const sec = () => o({ 'Seçilen': `${ad} — ${ac}` });
      g.addEventListener('click', sec); g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') sec(); });
      svg.append(g);
    }
    o({ 'Seçilen': 'Kural: τ karışma süresinden çok uzunsa homojen, çok kısaysa kaynağın izini taşır. Bir türe dokun.' });
  };

  Sekil.m323_arrhenius = function (kap) {
    const W = 600, H = 320, svg = svgYap(kap, W, H, 'Arrhenius: hız sabiti sıcaklıkla üstel artar');
    const A = 2.45e-12, d = eksen(svg, { W, H, L: 62, x: [200, 320], y: [1e-17, 1e-12], ylog: true, xt: [200, 220, 240, 260, 272, 298, 320], yt: [1e-17, 1e-16, 1e-15, 1e-14, 1e-13, 1e-12], yf: us10, xad: 'T (K)', yad: 'k (cm³ molekül⁻¹ s⁻¹)' });
    const kf = (T, ER) => A * Math.exp(-ER / T), kes = (v) => (v < 1e-17 || v > 1e-12 ? NaN : v);
    svg.append(el('path', { d: egri(d, (T) => kes(kf(T, 1775)), 200, 320), fill: 'none', stroke: 'var(--ikincil)', 'stroke-width': 2, 'stroke-dasharray': '5 4' }));
    const p = el('path', { fill: 'none', stroke: 'var(--tur)', 'stroke-width': 3 }); svg.append(p);
    for (const T of [272, 298]) nokta(svg, d.x(T), d.y(kf(T, 1775)), 5, 'var(--acc)');
    yaz(svg, d.x(298) + 8, d.y(kf(298, 1775)) + 18, 'CH₄ + OH', { k: 12, b: true, r: 'var(--ikincil)' });
    const m = nokta(svg, d.x(298), d.y(kf(298, 1775)), 7, 'var(--tur)');
    const o = okuma(kap, ['T', 'k(T)', 'τ = 1/(k[OH]), [OH] = 10⁶', 'Eₐ = R·(Eₐ/R)']);
    const k = kontrol(kap); const s = surgu(k, 'Eₐ/R', 1000, 3000, 25, 1775, (v) => `${v} K`);
    let T0 = 298;
    const set = (T) => { T0 = T = sinir(T, 200, 320); const kk = kf(T, s.v); p.setAttribute('d', egri(d, (u) => kes(kf(u, s.v)), 200, 320)); m.setAttribute('cx', d.x(T)); m.setAttribute('cy', d.y(sinir(kk, 1e-17, 1e-12))); o({ T: `${tr(T, 0)} K`, 'k(T)': `${bil(kk)}`, 'τ = 1/(k[OH]), [OH] = 10⁶': sure(1 / (kk * 1e6)), 'Eₐ = R·(Eₐ/R)': `${tr(8.314 * s.v / 1000, 1)} kJ/mol` }); };
    s.inp.addEventListener('input', () => set(T0)); imlec(svg, d, (T) => set(T)); set(298);
  };

  /* ============================== B6 · OZON ============================== */
  const DONGU = {
    chapman: { n: { O2: [110, 190, 'O₂'], O: [300, 60, 'O'], O3: [490, 190, 'O₃'] }, e: [['O2', 'O', -12, 'R1', 'O₂ + hν → 2 O   (λ < 240 nm; yavaş, Oₓ üretir)'], ['O', 'O3', -12, 'R2', 'O + O₂ + M → O₃ + M   (hızlı, üç cisimli)'], ['O3', 'O', -12, 'R3', 'O₃ + hν → O₂ + O   (hızlı; UV soğurur, Oₓ korunur)'], ['O3', 'O2', 0, 'R4', 'O + O₃ → 2 O₂   (yavaş; Oₓ yok olur)']], net: 'R2 ⇄ R3 hızlı döner · Oₓ = O + O₃ yalnız R1 ile doğar, R4 ile ölür' },
    clox: { n: { Cl: [130, 190, 'Cl'], ClO: [470, 190, 'ClO'], R: [300, 50, 'HCl · ClONO₂'] }, e: [['Cl', 'ClO', -14, '1', 'Cl + O₃ → ClO + O₂'], ['ClO', 'Cl', -14, '2', 'ClO + O → Cl + O₂   (net: O₃ + O → 2 O₂)'], ['Cl', 'R', 0, '3', 'Cl + CH₄ → HCl + CH₃   (rezervuar: döngü durur)'], ['ClO', 'R', 0, '4', 'ClO + NO₂ + M → ClONO₂ + M   (rezervuar)']], net: 'Cl tükenmez (katalizör) → rezervuara bağlanana dek ~10⁵ O₃' },
    nox: { n: { NO2: [110, 190, 'NO₂'], NO: [490, 190, 'NO'], O3: [300, 60, 'O₃'] }, e: [['NO2', 'NO', -14, '1', 'NO₂ + hν → NO + O   (J ≈ 8×10⁻³ s⁻¹, öğlen)'], ['NO2', 'O3', 0, '2', 'O + O₂ + M → O₃ + M   (1. tepkimenin O atomu)'], ['NO', 'NO2', -14, '3', 'NO + O₃ → NO₂ + O₂   (titrasyon; O₃ harcanır)'], ['NO', 'NO2', -36, '4', 'NO + HO₂ (ya da RO₂) → NO₂ + OH   (VOC yolu; O₃ harcanmaz) [EK]']], net: 'gündüz denge: [O₃] = J[NO₂] / (k[NO])' },
  };
  Sekil.m323_dongu = function (kap, ayar = {}) {
    const D = DONGU[ayar.ad] || DONGU.chapman, W = 600, H = 250 + D.e.length * 20 + 26, svg = svgYap(kap, W, H, 'Tepkime döngüsü');
    const gor = (i) => ayar.adim == null || i < ayar.adim;
    D.e.forEach(([a, b, off, et], i) => {
      const [x1, y1] = D.n[a], [x2, y2] = D.n[b], L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, nx = -uy, ny = ux, r = 40;
      const ax = x1 + ux * r + nx * off, ay = y1 + uy * r + ny * off, bx = x2 - ux * r + nx * off, by = y2 - uy * r + ny * off;
      const g = ok(svg, ax, ay, bx, by, i === 3 && ayar.ad === 'nox' ? 'var(--yesil)' : 'var(--tur)', 3, i === 3 && ayar.ad === 'nox'); g.setAttribute('opacity', gor(i) ? 1 : 0.12);
      const lx = (ax + bx) / 2 + nx * (off < 0 ? -14 : 14), ly = (ay + by) / 2 + ny * (off < 0 ? -14 : 14) + 4;
      yaz(svg, lx, ly, et, { h: 'middle', k: 13, b: true, r: 'var(--tur)', op: gor(i) ? 1 : 0.15 });
    });
    for (const [x, y, ad] of Object.values(D.n)) { svg.append(el('circle', { cx: x, cy: y, r: ad.length > 4 ? 0 : 34, fill: 'var(--yuzey)', stroke: 'var(--yazi)', 'stroke-width': 2 })); if (ad.length > 4) svg.append(el('rect', { x: x - 70, y: y - 20, width: 140, height: 40, rx: 10, fill: 'var(--yuzey)', stroke: 'var(--yazi)', 'stroke-width': 2 })); yaz(svg, x, y + 7, ad, { h: 'middle', k: ad.length > 4 ? 15 : 20, b: true }); }
    D.e.forEach(([, , , et, t], i) => yaz(svg, 20, 262 + i * 20, `${et}: ${t}`, { k: 13, b: i === (ayar.adim ?? 0) - 1, op: gor(i) ? 1 : 0.3 }));
    yaz(svg, 20, 262 + D.e.length * 20 + 6, D.net, { k: 13, b: true, r: 'var(--acc)', op: ayar.adim == null || ayar.adim >= D.e.length ? 1 : 0.3 });
  };

  Anim.m323_katalitik = function (kap) {
    const W = 600, H = 300, svg = svgYap(kap, W, H, 'Klor katalitik döngüsü: tek Cl atomu çok sayıda ozonu bozar');
    const cx = 300, cy = 160, R = 100;
    svg.append(el('circle', { cx, cy, r: R, fill: 'none', stroke: 'var(--cizgi)', 'stroke-width': 3 }));
    for (const [x, ad] of [[cx - R, 'Cl'], [cx + R, 'ClO']]) { svg.append(el('circle', { cx: x, cy, r: 30, fill: 'var(--yuzey)', stroke: 'var(--yazi)', 'stroke-width': 2 })); yaz(svg, x, cy + 6, ad, { h: 'middle', k: 18, b: true }); }
    yaz(svg, cx, cy - R - 12, '+ O₃ → + O₂', { h: 'middle', k: 13, b: true, r: 'var(--tur)' }); yaz(svg, cx, cy + R + 22, '+ O → + O₂', { h: 'middle', k: 13, b: true, r: 'var(--acc)' });
    svg.append(el('rect', { x: 470, y: 14, width: 116, height: 40, rx: 8, fill: 'var(--yuzey)', stroke: 'var(--ikincil)', 'stroke-dasharray': '5 4' })); yaz(svg, 528, 40, 'HCl rezervuar', { h: 'middle', k: 13, b: true, r: 'var(--ikincil)' });
    const rnd = tohum(9), oz = Array.from({ length: 40 }, () => { const a = rnd() * 2 * Math.PI, rr = R + 34 + rnd() * 26; const c = el('circle', { cx: cx + Math.cos(a) * rr * 1.25, cy: cy + Math.sin(a) * rr * 0.62, r: 5, fill: 'var(--acc)', opacity: 0.8 }); svg.append(c); return c; });
    const at = el('circle', { r: 11, fill: 'var(--tur)', stroke: 'var(--zemin)', 'stroke-width': 2 }); svg.append(at);
    const say = yaz(svg, 20, 30, '', { k: 16, b: true });
    yaz(svg, 20, 52, 'gerçekte bir Cl ≈ 10⁵ tur atar (S42)', { k: 12, r: 'var(--ikincil)' });
    const k = kontrol(kap); const btn = dugme(k, '▶ Oynat'), b2 = dugme(k, 'Baştan', true);
    let faz = 0, n = 0, bitti = false;
    const SON = 30;
    const ciz = () => {
      if (bitti) { at.setAttribute('cx', 528); at.setAttribute('cy', 62); say.textContent = `bozulan O₃: ${n} → Cl rezervuara bağlandı, döngü durdu`; return; }
      const a = Math.PI + faz * Math.PI; at.setAttribute('cx', cx + Math.cos(a) * R); at.setAttribute('cy', cy + Math.sin(a) * R);
      say.textContent = `bozulan O₃: ${n}`; oz.forEach((c, i) => c.setAttribute('opacity', i < n ? 0.08 : 0.8));
    };
    const oyn = dongu(btn, (dt) => { faz += dt * 1.6; if (faz >= 2) { faz -= 2; n += 1; if (n >= SON) { bitti = true; ciz(); return false; } } ciz(); });
    b2.addEventListener('click', () => { oyn.dur(); faz = 0; n = 0; bitti = false; ciz(); });
    ciz();
    return { dur: oyn.dur };
  };

  Sekil.m323_ruzgaralti = function (kap) {
    const W = 600, H = 320, svg = svgYap(kap, W, H, 'Şehir merkezi ve rüzgâraltında ozon, şematik');
    const d = eksen(svg, { W, H, L: 50, x: [-20, 80], y: [0, 120], xt: [-20, 0, 20, 40, 60, 80], yt: [0, 40, 80, 120], xad: 'rüzgâr yönünde uzaklık (km)', yad: 'O₃ (ppb, şematik)' });
    svg.append(el('rect', { x: d.x(0), y: d.y(12), width: d.x(15) - d.x(0), height: d.y(0) - d.y(12), fill: 'var(--ikincil)', opacity: 0.35 })); yaz(svg, d.x(7.5), d.y(14), 'şehir (taze NO)', { h: 'middle', k: 12, b: true });
    ok(svg, d.x(30), d.T + 10, d.x(60), d.T + 10, 'var(--acc)', 3); yaz(svg, d.x(62), d.T + 14, 'rüzgâr', { k: 12, b: true, r: 'var(--acc)' });
    const G = (x, m, s) => Math.exp(-(((x - m) / s) ** 2)), sg = (x) => 1 / (1 + Math.exp(-(x - 12) / 4));
    const F = [(x) => 40 - 22 * G(x, 8, 7) + 55 * G(x, 40, 20) * sg(x), (x) => 30 - 28 * G(x, 8, 8), (x) => 40 - 8 * G(x, 8, 7) + 45 * G(x, 40, 20) * sg(x)];
    const AC = ['Gündüz: merkezde NO + O₃ titrasyonu ozonu düşürür; taşınırken NO₂ + hν ve VOC kimyası O₃ biriktirir → zirve rüzgâraltında.', 'Gece: fotoliz yok → yeni O₃ yok; titrasyon sürer → merkezde O₃ ≈ 0.', 'Hafta sonu: NO salımı az → titrasyon zayıf → merkezde O₃ daha yüksek kalabilir [EK].'];
    const p = el('path', { fill: 'none', stroke: 'var(--tur)', 'stroke-width': 3.5 }); svg.append(p);
    const o = okuma(kap, ['Durum']);
    const ciz = (i) => { p.setAttribute('d', egri(d, F[i], -20, 80, 200)); o({ 'Durum': AC[i] }); };
    const k = kontrol(kap); secenek(k, ['Gündüz', 'Gece', 'Hafta sonu'], 0, ciz); ciz(0);
  };

  Sekil.m323_leighton = function (kap) {
    const W = 600, H = 320, svg = svgYap(kap, W, H, 'Fotodurağan denge: ozon NO₂/NO oranıyla doğrusal artar');
    const kNO = 1.9e-14, nH = 2.46e19, d = eksen(svg, { W, H, L: 54, x: [0, 10], y: [0, 250], xt: [0, 2, 4, 6, 8, 10], yt: [0, 50, 100, 150, 200, 250], xad: 'NO₂ / NO', yad: 'O₃ (ppb)' });
    const p = el('path', { fill: 'none', stroke: 'var(--tur)', 'stroke-width': 3 }); svg.append(p);
    const mk = el('g'); svg.append(mk); const m = nokta(svg, d.x(2), d.y(34), 7, 'var(--tur)');
    const o = okuma(kap, ['NO₂/NO', '[O₃] = J[NO₂]/(k[NO])', 'ppb', 'NO₂ ömrü 1/J']);
    const k = kontrol(kap); const sJ = surgu(k, 'J(NO₂)', -3, -1.92, 0.001, Math.log10(8e-3), (u) => `${bil(10 ** u)} s⁻¹`);
    let r0 = 2;
    const set = (r) => { r0 = r = sinir(r, 0, 10); const J = 10 ** sJ.v, c = J * r / kNO, ppb = c / nH * 1e9; p.setAttribute('d', egri(d, (x) => { const v = J * x / kNO / nH * 1e9; return v > 250 ? NaN : v; }, 0, 10, 100)); mk.replaceChildren(); for (const x of [2, 5]) { const v = J * x / kNO / nH * 1e9; if (v <= 250) nokta(mk, d.x(x), d.y(v), 4.5, 'var(--acc)'); } m.setAttribute('cx', d.x(r)); m.setAttribute('cy', d.y(Math.min(250, ppb))); o({ 'NO₂/NO': tr(r, 1), '[O₃] = J[NO₂]/(k[NO])': `${bil(c)} cm⁻³`, ppb: `${tr(ppb, 0)} ppb`, 'NO₂ ömrü 1/J': sure(1 / J) }); };
    sJ.inp.addEventListener('input', () => set(r0)); imlec(svg, d, (r) => set(r)); set(2);
  };
})();
