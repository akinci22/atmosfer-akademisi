/* MTO303E kitabına özel çizimler — PARÇA B (KISIM C + D + E: K8–K14). Yalnız B ajanı düzenler.
   Sekil.<ad> = function (kap, ayar) {…};  Anim.<ad> = function (kap, ayar) { …; return { dur() {} }; };
   Adlar m303b_ önekiyle başlar (A parçası m303_ kullanır, src/sekil-mto303e.js).
   Renkler CSS değişkeniyle (açık/koyu tema), dış görsel yok. Sayılar kitabın hesap_dogrula.py çıktısıyla aynı
   (kitap ondalık NOKTA kullanıyor; burada da nokta). Sayısal şemalar tarayıcıda gerçekten koşar. */
(function () {
  const Sekil = window.Sekil, Anim = window.Anim;
  if (!Sekil || !Anim) return;
  const NS = 'http://www.w3.org/2000/svg', F = 'Inter,sans-serif';
  const el = (ad, o = {}, ic) => { const e = document.createElementNS(NS, ad); for (const [a, v] of Object.entries(o)) if (v !== undefined && v !== null) e.setAttribute(a, v); if (ic != null) e.textContent = ic; return e; };
  const sy = (v, d = 2) => { if (!isFinite(v)) return '∞'; const s = Math.abs(v).toFixed(d); return (v < 0 && +s !== 0 ? '−' : '') + s; };
  const kisa = (v, d = 3) => { if (!isFinite(v)) return '∞'; const a = Math.abs(v); if (a !== 0 && (a >= 1e5 || a < 1e-3)) { const e = Math.floor(Math.log10(a)); return `${v < 0 ? '−' : ''}${(a / 10 ** e).toFixed(2)}×${us10(e)}`; } return sy(v, d); };
  const yaz = (g, x, y, s, o = {}) => { const t = el('text', { x, y, 'font-family': F, 'font-size': o.k || 14, fill: o.r || 'var(--yazi)', 'font-weight': o.b ? 700 : 500, 'text-anchor': o.h || 'start', opacity: o.op, 'font-style': o.i ? 'italic' : null }, s); g.append(t); return t; };
  const svgYap = (kap, W, H, ad) => { const s = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': ad }); kap.append(s); return s; };
  const yol = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${(+p[0]).toFixed(1)},${(+p[1]).toFixed(1)}`).join('');
  const sinir = (v, a, b) => Math.max(a, Math.min(b, v));
  const svgNokta = (svg, ev) => { const m = svg.getScreenCTM(); if (!m) return null; const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(m.inverse()); };

  function eksen(kok, o) {
    const W = o.W, H = o.H, L = o.L ?? 56, R = o.R ?? 16, T = o.T ?? 26, B = o.B ?? 40;
    const fx = o.xlog ? Math.log10 : (v) => v, fy = o.ylog ? Math.log10 : (v) => v;
    const [x0, x1] = o.x.map(fx), [y0, y1] = o.y.map(fy);
    const x = (v) => (o.ox || 0) + L + (fx(v) - x0) / (x1 - x0) * (W - L - R);
    const y = (v) => (o.oy || 0) + H - B - (fy(v) - y0) / (y1 - y0) * (H - T - B);
    const g = el('g'); kok.append(g);
    const fmt = o.xf || ((v) => String(v)), fmy = o.yf || ((v) => String(v));
    for (const v of o.xt || []) { g.append(el('line', { x1: x(v), x2: x(v), y1: y(o.y[1]), y2: y(o.y[0]), stroke: 'var(--cizgi)' })); yaz(g, x(v), y(o.y[0]) + 18, fmt(v), { h: 'middle', k: 13, r: 'var(--ikincil)' }); }
    for (const v of o.yt || []) { g.append(el('line', { x1: x(o.x[0]), x2: x(o.x[1]), y1: y(v), y2: y(v), stroke: 'var(--cizgi)' })); yaz(g, x(o.x[0]) - 6, y(v) + 4.5, fmy(v), { h: 'end', k: 13, r: 'var(--ikincil)' }); }
    g.append(el('path', { d: `M${x(o.x[0])},${y(o.y[1])} V${y(o.y[0])} H${x(o.x[1])}`, fill: 'none', stroke: 'var(--ikincil)', 'stroke-width': 1.2 }));
    if (o.xad) yaz(g, x(o.x[1]), y(o.y[0]) + 34, o.xad, { h: 'end', k: 13, b: true });
    if (o.yad) yaz(g, x(o.x[0]) - 4, y(o.y[1]) - 9, o.yad, { k: 13, b: true });
    return { x, y, g };
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
    l.innerHTML = `<span style="white-space:nowrap">${ad}</span><input type="range" min="${min}" max="${max}" step="${adim}" value="${deger}" style="min-width:70px"><b style="min-width:5em;text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap"></b>`;
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
  function ok(g, x1, y1, x2, y2, renk = 'var(--acc)', w = 2.5, kesik) {
    const a = Math.atan2(y2 - y1, x2 - x1), u = 7 + w * 1.5;
    const gg = el('g');
    gg.append(el('line', { x1, y1, x2: x2 - Math.cos(a) * u * 0.8, y2: y2 - Math.sin(a) * u * 0.8, stroke: renk, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-dasharray': kesik ? '6 5' : null }));
    gg.append(el('path', { d: `M${x2},${y2} L${x2 - u * Math.cos(a - 0.42)},${y2 - u * Math.sin(a - 0.42)} L${x2 - u * Math.cos(a + 0.42)},${y2 - u * Math.sin(a + 0.42)} Z`, fill: renk }));
    g.append(gg); return gg;
  }
  const nokta = (g, x, y, r = 5, renk = 'var(--yazi)') => { const c = el('circle', { cx: x, cy: y, r, fill: renk, stroke: 'var(--zemin)', 'stroke-width': 1.5 }); g.append(c); return c; };
  const kutu = (g, x, y, w, h, o = {}) => { const r = el('rect', { x, y, width: w, height: h, rx: o.rx ?? 8, fill: o.f || 'var(--yuzey)', stroke: o.s || 'var(--cizgi)', 'stroke-width': o.w || 1.5, 'stroke-dasharray': o.d }); g.append(r); return r; };
  /* Thomas algoritması (üç köşegenli sistem): a alt, b köşegen, c üst, d sağ taraf → x (A parçasının «thomas» kavramı) */
  function thomas(a, b, c, d) {
    const n = b.length, f = b.slice(), r = d.slice(), e = a.slice();
    for (let k = 1; k < n; k++) { e[k] = a[k] / f[k - 1]; f[k] = b[k] - e[k] * c[k - 1]; r[k] = d[k] - e[k] * r[k - 1]; }
    const x = new Array(n); x[n - 1] = r[n - 1] / f[n - 1];
    for (let k = n - 2; k >= 0; k--) x[k] = (r[k] - c[k] * x[k + 1]) / f[k];
    return { x, f, r, e };
  }
  const UST = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
  const us10 = (e) => '10' + (e < 0 ? '⁻' : '') + String(Math.abs(e)).split('').map((c) => UST[+c]).join('');
  const rol = (u, k) => { const n = u.length; return u.map((_, i) => u[((i + k) % n + n) % n]); };

  /* ====================================================================== K8 · ISI DENKLEMİ ==== */
  /* çubuğun tam çözümü (Fourier serisi): T(0)=TA, T(L)=TB, içerisi başta 0 */
  function isiTam(x, t, k = 0.835, L = 10, TA = 100, TB = 50) {
    const a = TA, b = (TB - TA) / L, Ts = a + b * x;
    if (t <= 0) return x <= 1e-9 ? TA : x >= L - 1e-9 ? TB : 0;
    let s = 0;
    for (let n = 1; n <= 400; n++) {
      const sg = n % 2 ? -1 : 1, ip = a * L * (1 - sg) / (n * Math.PI) - b * L * L * sg / (n * Math.PI);
      const ex = Math.exp(-k * (n * Math.PI / L) ** 2 * t); if (ex < 1e-14) break;
      s += -(2 / L) * ip * Math.sin(n * Math.PI * x / L) * ex;
    }
    return Ts + s;
  }

  Sekil.m303b_cubuk = function (kap, ayar = {}) {
    const W = 640, H = 330, svg = svgYap(kap, W, H, 'Isıtılan çubuk: düğümler, sınır sıcaklıkları ve zamanla sıcaklık profili');
    const xs = [0, 2, 4, 6, 8, 10];
    const cx = (x) => 70 + x * 50;
    yaz(svg, 20, 22, 'Çubuk (L = 10 cm, Δx = 2 cm): uçlar sabit sıcaklıkta, içerisi başta 0 °C', { k: 14, b: true });
    const hucre = xs.slice(0, -1).map((x) => { const r = el('rect', { x: cx(x), y: 40, width: 100, height: 30, fill: 'var(--tur)', opacity: 0.1, stroke: 'var(--cizgi)' }); svg.append(r); return r; });
    svg.append(el('rect', { x: cx(0), y: 40, width: 500, height: 30, fill: 'none', stroke: 'var(--yazi)', 'stroke-width': 1.5, rx: 3 }));
    xs.forEach((x, i) => { nokta(svg, cx(x), 55, 6, i === 0 || i === 5 ? 'var(--tur)' : 'var(--acc)'); yaz(svg, cx(x), 90, `i = ${i}`, { h: 'middle', k: 12, r: 'var(--ikincil)' }); });
    yaz(svg, cx(0) - 12, 60, '100 °C', { h: 'end', k: 13, b: true, r: 'var(--tur)' });
    yaz(svg, cx(10) + 12, 60, '50 °C', { k: 13, b: true, r: 'var(--tur)' });
    const d = eksen(svg, { W: 640, H: 230, oy: 100, x: [0, 10], y: [0, 100], xt: [0, 2, 4, 6, 8, 10], yt: [0, 25, 50, 75, 100], L: 70, R: 70, xad: 'x (cm)', yad: 'T (°C)' });
    svg.append(el('path', { d: yol([[d.x(0), d.y(100)], [d.x(10), d.y(50)]]), stroke: 'var(--ikincil)', 'stroke-dasharray': '6 5', fill: 'none' }));
    yaz(svg, d.x(6.3), d.y(72) - 6, 'kararlı hâl: T = 100 − 5x', { k: 12, r: 'var(--ikincil)' });
    const egri = el('path', { fill: 'none', stroke: 'var(--tur)', 'stroke-width': 3 }); svg.append(egri);
    const okG = el('g'); svg.append(okG);
    const ng = el('g'); svg.append(ng);
    const k = kontrol(kap);
    const sT = surgu(k, 't', 0, 1, 0.001, ayar.t ?? 0.606, (u) => `${sy(tz(u), 2)} s`);
    function tz(u) { return u <= 0 ? 0 : 0.05 * Math.pow(10, u * 3.3); } // 0.05 s … ~100 s (logaritmik)
    const k2 = kontrol(kap);
    for (const [ad, t] of [['t = 0.1 s', 0.1], ['t = 0.2 s', 0.2], ['t = 5 s', 5], ['t = 30 s', 30], ['t = 100 s', 100]]) dugme(k2, ad, true).addEventListener('click', () => { sT.set(Math.log10(t / 0.05) / 3.3); ciz(); });
    const oku = okuma(kap, ['t', 'T₁ (x = 2)', 'T₂', 'T₃', 'T₄ (x = 8)']);
    function ciz() {
      const t = tz(sT.v), pts = [];
      for (let i = 0; i <= 200; i++) { const x = i / 20; pts.push([d.x(x), d.y(sinir(isiTam(x, t), -5, 105))]); }
      egri.setAttribute('d', yol(pts));
      ng.replaceChildren(); okG.replaceChildren();
      const T = xs.map((x) => isiTam(x, t));
      xs.forEach((x, i) => {
        nokta(ng, d.x(x), d.y(T[i]), 5, 'var(--yazi)');
        if (i < 5) hucre[i].setAttribute('opacity', (0.08 + 0.8 * (T[i] + T[i + 1]) / 200).toFixed(2));
        if (i > 0 && i < 5) {
          const egr = (T[i + 1] - 2 * T[i] + T[i - 1]) / 4; // ∂²T/∂x² (°C/cm²)
          const boy = sinir(egr * 1.8, -28, 28);
          if (Math.abs(boy) > 2) ok(okG, d.x(x) + 14, d.y(T[i]), d.x(x) + 14, d.y(T[i]) - boy, 'var(--acc)', 2.2);
        }
      });
      oku({ t: `${sy(t, 2)} s`, 'T₁ (x = 2)': `${sy(T[1], 4)} °C`, 'T₂': sy(T[2], 4), 'T₃': sy(T[3], 4), 'T₄ (x = 8)': sy(T[4], 4) });
    }
    yaz(svg, 640 - 70, 120, 'mavi ok = eğrilik ∂²T/∂x² (yukarı → ısınır)', { h: 'end', k: 12, r: 'var(--acc)' });
    sT.inp.addEventListener('input', ciz); ciz();
  };

  /* FTCS (ısı) zaman adımı animasyonu: λ sürgüsü; 0.4 kararlı, 0.6 zikzak + patlama */
  Anim.m303b_ftcs = function (kap, ayar = {}) {
    const W = 640, H = 330, svg = svgYap(kap, W, H, 'FTCS açık yöntem: λ sürgüsüyle zaman adımı, kararlı ve kararsız davranış');
    let mod = ayar.mod === 's26' ? 1 : 0;
    const d = eksen(svg, { W, H, x: [0, 10], y: [-40, 140], xt: [0, 2, 4, 6, 8, 10], yt: [-40, 0, 50, 100, 140], L: 56, R: 18, T: 46, xad: 'düğüm i', yad: 'T (°C)' });
    const kar = el('path', { fill: 'none', stroke: 'var(--ikincil)', 'stroke-dasharray': '6 5' }); svg.append(kar);
    const cizgi = el('path', { fill: 'none', stroke: 'var(--tur)', 'stroke-width': 3 }); svg.append(cizgi);
    const ng = el('g'); svg.append(ng);
    const bas = yaz(svg, 62, 16, '', { k: 14, b: true });
    const rozet = yaz(svg, W - 20, 34, '', { h: 'end', k: 15, b: true });
    const k = kontrol(kap); const btn = dugme(k, '▶ Oynat'); const tek = dugme(k, 'Tek adım', true); const sifir = dugme(k, '↺ Baştan', true);
    const sL = surgu(k, 'λ = kΔt/Δx²', 0.02, 0.7, 0.01, ayar.lambda ?? 0.4, (v) => sy(v, mod ? 6 : 2));
    const k2 = kontrol(kap);
    const hazir = secenek(k2, ['λ = 0.4 (kararlı)', 'λ = 0.6 (patlar)', 'S26: λ = 0.020875, 6 düğüm'], ayar.mod === 's26' ? 2 : (ayar.lambda ?? 0.4) > 0.5 ? 1 : 0, (i) => { mod = i === 2 ? 1 : 0; sL.inp.step = mod ? 0.000001 : 0.01; sL.set(i === 0 ? 0.4 : i === 1 ? 0.6 : 0.020875); kur(); });
    const oku = okuma(kap, ['adım n', 'G(θ = π) = 1 − 4λ', 'en büyük |T|', 'düğüm değerleri']);
    let T, n, birik = 0;
    const lam = () => sL.v;
    function kur() {
      n = 0;
      if (mod) { T = [100, 0, 0, 0, 0, 50]; } else { T = new Array(11).fill(0); T[0] = 100; }
      ciz();
    }
    function adim() {
      const l = lam(), Y = T.slice();
      for (let i = 1; i < T.length - 1; i++) Y[i] = T[i] + l * (T[i + 1] - 2 * T[i] + T[i - 1]);
      T = Y; n++; ciz();
    }
    function ciz() {
      const N = T.length - 1, xs = T.map((_, i) => i * 10 / N);
      kar.setAttribute('d', yol([[d.x(0), d.y(100)], [d.x(10), d.y(mod ? 50 : 0)]]));
      cizgi.setAttribute('d', yol(T.map((v, i) => [d.x(xs[i]), d.y(sinir(v, -40, 140))])));
      ng.replaceChildren();
      T.forEach((v, i) => {
        const tas = v > 140 || v < -40;
        nokta(ng, d.x(xs[i]), d.y(sinir(v, -40, 140)), tas ? 7 : 5, tas ? 'var(--tur)' : 'var(--yazi)');
        if (tas) yaz(ng, d.x(xs[i]), d.y(sinir(v, -40, 140)) + (v > 0 ? -10 : 20), kisa(v, 0), { h: 'middle', k: 12, b: true, r: 'var(--tur)' });
      });
      const l = lam(), G = 1 - 4 * l, mx = Math.max(...T.map(Math.abs));
      bas.textContent = mod ? `S26 çubuğu: Δx = 2 cm, Δt = 0.1 s → λ = ${sy(l, 6)}` : `11 düğümlü çubuk, sol uç 100 °C, sağ uç 0 °C, λ = ${sy(l, 2)}`;
      const kararli = l <= 0.5 + 1e-12;
      rozet.textContent = kararli ? 'λ ≤ ½ → kararlı' : 'λ > ½ → KARARSIZ';
      rozet.setAttribute('fill', kararli ? 'var(--yesil)' : 'var(--tur)');
      oku({ 'adım n': `${n}  (t = ${sy(n * (mod ? 0.1 : 1), 1)}${mod ? ' s' : ' Δt'})`, 'G(θ = π) = 1 − 4λ': `${sy(G, 3)} → |G| ${Math.abs(G) <= 1 + 1e-12 ? '≤' : '>'} 1`, 'en büyük |T|': kisa(mx, 1), 'düğüm değerleri': T.slice(1, -1).map((v) => kisa(v, mod ? 4 : 1)).join(' · ') });
    }
    const oyn = dongu(btn, (dt) => { birik += dt; if (birik > 0.28) { birik = 0; if (n >= (mod ? 40 : 60) || Math.max(...T.map(Math.abs)) > 1e7) return false; adim(); } });
    tek.addEventListener('click', () => { oyn.dur(); adim(); });
    sifir.addEventListener('click', () => { oyn.dur(); kur(); });
    sL.inp.addEventListener('input', () => { hazir.isaretle(-1); kur(); });
    kur();
    return { dur: oyn.dur };
  };

  /* FTCS / Laasonen / Crank–Nicolson aynı çubukta yan yana */
  Anim.m303b_isi3 = function (kap, ayar = {}) {
    const W = 640, H = 330, svg = svgYap(kap, W, H, 'Aynı çubukta açık, kapalı ve Crank–Nicolson yöntemlerinin karşılaştırması');
    const k0 = 0.835, L = 10, Dx = 2;
    const d = eksen(svg, { W, H, x: [0, 10], y: [-30, 110], xt: [0, 2, 4, 6, 8, 10], yt: [-30, 0, 25, 50, 75, 100], L: 56, R: 150, T: 44, xad: 'x (cm)', yad: 'T (°C)' });
    const RENK = { tam: 'var(--yazi)', ftcs: 'var(--tur)', las: 'var(--acc)', cn: 'var(--yesil)' };
    const ad = { tam: 'tam çözüm', ftcs: 'FTCS (açık)', las: 'Laasonen (kapalı)', cn: 'Crank–Nicolson' };
    const yollar = {};
    for (const s of ['tam', 'ftcs', 'las', 'cn']) { yollar[s] = el('path', { fill: 'none', stroke: RENK[s], 'stroke-width': s === 'tam' ? 2 : 3, 'stroke-dasharray': s === 'tam' ? '6 5' : null }); svg.append(yollar[s]); }
    ['tam', 'ftcs', 'las', 'cn'].forEach((s, i) => { svg.append(el('line', { x1: W - 140, x2: W - 116, y1: 46 + i * 24, y2: 46 + i * 24, stroke: RENK[s], 'stroke-width': 3, 'stroke-dasharray': s === 'tam' ? '6 5' : null })); yaz(svg, W - 110, 51 + i * 24, ad[s], { k: 12 }); });
    const ng = el('g'); svg.append(ng);
    const bas = yaz(svg, 62, 16, '', { k: 14, b: true });
    const k = kontrol(kap); const btn = dugme(k, '▶ Oynat'); const tek = dugme(k, 'Tek adım', true); const sifir = dugme(k, '↺ Baştan', true);
    const sL = surgu(k, 'λ', -1.7, 0.3, 0.01, Math.log10(ayar.lambda ?? 0.020875), (u) => sy(10 ** u, 10 ** u < 0.1 ? 6 : 3));
    const k2 = kontrol(kap);
    const hz = secenek(k2, ['λ = 0.020875 (S26–S29)', 'λ = 0.4', 'λ = 0.6', 'λ = 2'], 0, (i) => { lamOz = [0.020875, 0.4, 0.6, 2][i]; sL.set(Math.log10(lamOz)); sL.inp.nextElementSibling.textContent = sy(lamOz, lamOz < 0.1 ? 6 : 3); kur(); });
    const oku = okuma(kap, ['adım', 't', 'T₁: FTCS · Laasonen · CN · tam']);
    let S, n, birik = 0, lamOz = ayar.lambda ?? 0.020875;
    const lam = () => lamOz ?? 10 ** sL.v;
    function kur() { n = 0; const T0 = [100, 0, 0, 0, 0, 50]; S = { ftcs: T0.slice(), las: T0.slice(), cn: T0.slice() }; ciz(); }
    function adim() {
      const l = lam(), m = 4;
      const F = S.ftcs.slice(); for (let i = 1; i <= m; i++) F[i] = S.ftcs[i] + l * (S.ftcs[i + 1] - 2 * S.ftcs[i] + S.ftcs[i - 1]); S.ftcs = F;
      const a = [0, -l, -l, -l], c = [-l, -l, -l, 0];
      const rl = [S.las[1] + l * 100, S.las[2], S.las[3], S.las[4] + l * 50];
      const xl = thomas(a, [1 + 2 * l, 1 + 2 * l, 1 + 2 * l, 1 + 2 * l], c, rl).x; S.las = [100, ...xl, 50];
      const T = S.cn, rc = [1, 2, 3, 4].map((i) => l * T[i - 1] + 2 * (1 - l) * T[i] + l * T[i + 1]); rc[0] += l * 100; rc[3] += l * 50;
      const xc = thomas(a, [2 + 2 * l, 2 + 2 * l, 2 + 2 * l, 2 + 2 * l], c, rc).x; S.cn = [100, ...xc, 50];
      n++; ciz();
    }
    function ciz() {
      const l = lam(), dt = l * Dx * Dx / k0, t = n * dt, xs = [0, 2, 4, 6, 8, 10];
      const p = []; for (let i = 0; i <= 200; i++) { const x = i / 20; p.push([d.x(x), d.y(sinir(isiTam(x, t, k0, L), -30, 110))]); }
      yollar.tam.setAttribute('d', yol(p));
      ng.replaceChildren();
      for (const s of ['ftcs', 'las', 'cn']) {
        yollar[s].setAttribute('d', yol(S[s].map((v, i) => [d.x(xs[i]), d.y(sinir(v, -30, 110))])));
        S[s].forEach((v, i) => { if (i > 0 && i < 5) nokta(ng, d.x(xs[i]), d.y(sinir(v, -30, 110)), 4.5, RENK[s]); });
      }
      bas.textContent = `Δx = 2 cm, k = 0.835 cm²/s → Δt = λΔx²/k = ${kisa(dt, 3)} s`;
      oku({ adım: String(n), t: `${kisa(t, 3)} s`, 'T₁: FTCS · Laasonen · CN · tam': `${kisa(S.ftcs[1], 4)} · ${kisa(S.las[1], 4)} · ${kisa(S.cn[1], 4)} · ${kisa(isiTam(2, t, k0, L), 4)}` });
    }
    const oyn = dongu(btn, (dt) => { birik += dt; if (birik > 0.45) { birik = 0; if (n >= 40) return false; adim(); } });
    tek.addEventListener('click', () => { oyn.dur(); adim(); });
    sifir.addEventListener('click', () => { oyn.dur(); kur(); });
    sL.inp.addEventListener('input', () => { lamOz = null; hz.isaretle(-1); kur(); });
    kur();
    return { dur: oyn.dur };
  };

  /* ====================================================================== ŞABLONLAR (stencil) ==== */
  const SEMA = {
    'ftcs-isi': { ad: 'FTCS (ısı)', p: 'λ', p0: 0.4, tur: 'açık · 2 seviye', kosul: 'λ ≤ 1/2', mer: 'O(Δt, Δx²)', N: (p) => [[-1, 0, p], [0, 0, 1 - 2 * p], [1, 0, p]] },
    btcs: { ad: 'BTCS / Laasonen', p: 'λ', p0: 0.4, tur: 'kapalı · 2 seviye', kosul: 'koşulsuz kararlı', mer: 'O(Δt, Δx²)', N: () => [[0, 0, 1]], K: (p) => [[-1, -p], [0, 1 + 2 * p], [1, -p]] },
    cn: { ad: 'Crank–Nicolson', p: 'λ', p0: 0.4, tur: 'kapalı · 2 seviye', kosul: 'koşulsuz kararlı', mer: 'O(Δt², Δx²)', N: (p) => [[-1, 0, p], [0, 0, 2 * (1 - p)], [1, 0, p]], K: (p) => [[-1, -p], [0, 2 * (1 + p)], [1, -p]] },
    rich: { ad: 'Richardson (CTCS)', p: 'λ', p0: 0.4, tur: 'açık · 3 seviye', kosul: 'her λ\'da kararsız', mer: 'O(Δt², Δx²)', N: (p) => [[-1, 0, 2 * p], [0, 0, -4 * p], [1, 0, 2 * p], [0, -1, 1]] },
    duf: { ad: 'DuFort–Frankel', p: 'λ', p0: 0.4, tur: 'açık · 3 seviye', kosul: 'kararlı; tutarlılık için Δt/Δx → 0', mer: 'O(Δt², Δx², (Δt/Δx)²)', N: (p) => [[-1, 0, 2 * p / (1 + 2 * p)], [1, 0, 2 * p / (1 + 2 * p)], [0, -1, (1 - 2 * p) / (1 + 2 * p)]] },
    'ftcs-adv': { ad: 'FTCS (adveksiyon)', p: 'ν', p0: 0.5, tur: 'açık · 2 seviye', kosul: 'her ν\'de kararsız', mer: 'O(Δt, Δx²)', N: (p) => [[-1, 0, p / 2], [0, 0, 1], [1, 0, -p / 2]] },
    upwind: { ad: 'Upwind (c > 0)', p: 'ν', p0: 0.5, tur: 'açık · 2 seviye', kosul: '0 ≤ ν ≤ 1', mer: 'O(Δt, Δx)', N: (p) => [[-1, 0, p], [0, 0, 1 - p]] },
    lax: { ad: 'Lax', p: 'ν', p0: 0.5, tur: 'açık · 2 seviye', kosul: 'ν ≤ 1', mer: 'O(Δt, Δx²/Δt)', N: (p) => [[-1, 0, (1 + p) / 2], [1, 0, (1 - p) / 2]] },
    lw: { ad: 'Lax–Wendroff', p: 'ν', p0: 0.5, tur: 'açık · 2 seviye', kosul: 'ν ≤ 1', mer: 'O(Δt², Δx²)', N: (p) => [[-1, 0, p * (1 + p) / 2], [0, 0, 1 - p * p], [1, 0, -p * (1 - p) / 2]] },
    leap: { ad: 'Leapfrog', p: 'ν', p0: 0.5, tur: 'açık · 3 seviye', kosul: 'ν ≤ 1 (|G| = 1)', mer: 'O(Δt², Δx²)', N: (p) => [[-1, 0, p], [1, 0, -p], [0, -1, 1]] },
    'btcs-adv': { ad: 'BTCS (adveksiyon)', p: 'ν', p0: 0.5, tur: 'kapalı · 2 seviye', kosul: 'koşulsuz kararlı', mer: 'O(Δt, Δx²)', N: () => [[0, 0, 1]], K: (p) => [[-1, -p / 2], [0, 1], [1, p / 2]] },
    dalga: { ad: 'Dalga (açık)', p: 'ν', p0: 1, tur: 'açık · 3 seviye', kosul: 'ν ≤ 1', mer: 'O(Δt², Δx²)', N: (p) => [[-1, 0, p * p], [0, 0, 2 - 2 * p * p], [1, 0, p * p], [0, -1, -1]] },
  };
  Sekil.m303b_sablon = function (kap, ayar = {}) {
    const W = 640, H = 325, svg = svgYap(kap, W, H, 'Fark şemalarının şablonları: hangi noktalar, hangi katsayıyla kullanılıyor');
    const anah = Object.keys(SEMA);
    let s = anah.indexOf(ayar.sema); if (s < 0) s = 0;
    const gx = (i) => 80 + (i + 2) * 66, gy = (n) => 250 - (n + 1) * 85;
    const sabit = el('g'); svg.append(sabit);
    for (let n = -1; n <= 1; n++) { sabit.append(el('line', { x1: 44, x2: 384, y1: gy(n), y2: gy(n), stroke: 'var(--cizgi)', 'stroke-width': 1.5 })); yaz(sabit, 40, gy(n) + 5, n === -1 ? 'n − 1' : n === 0 ? 'n' : 'n + 1', { h: 'end', k: 14, b: true }); }
    for (let i = -2; i <= 2; i++) { sabit.append(el('line', { x1: gx(i), x2: gx(i), y1: gy(1) - 16, y2: gy(-1) + 16, stroke: 'var(--cizgi)', 'stroke-dasharray': '3 4' })); yaz(sabit, gx(i), 312, i === 0 ? 'i' : `i ${i > 0 ? '+' : '−'} ${Math.abs(i)}`, { h: 'middle', k: 13, r: 'var(--ikincil)' }); }
    yaz(sabit, 384, 312, 'x →', { k: 13, r: 'var(--ikincil)' }); yaz(sabit, 18, 36, 't ↑', { k: 13, r: 'var(--ikincil)' });
    const dg = el('g'); svg.append(dg);
    const bilgi = el('g'); svg.append(bilgi);
    const k = kontrol(kap);
    const sP = surgu(k, 'p', 0, 1.5, 0.01, ayar.p ?? SEMA[anah[s]].p0, (v) => sy(v, 2));
    const k2 = kontrol(kap);
    secenek(k2, anah.map((a) => SEMA[a].ad), s, (i) => { s = i; sP.set(SEMA[anah[s]].p0); ciz(); });
    function ciz() {
      const S = SEMA[anah[s]], p = sP.v;
      sP.inp.previousElementSibling.textContent = S.p;
      dg.replaceChildren(); bilgi.replaceChildren();
      const hedef = [gx(0), gy(1)];
      const exp = S.N(p), imp = S.K ? S.K(p) : null;
      for (const [di, dn, w] of exp) {
        const X = gx(di), Y = gy(dn);
        if (!imp) dg.append(el('line', { x1: X, y1: Y, x2: hedef[0], y2: hedef[1], stroke: 'var(--acc)', 'stroke-width': 1.6, opacity: 0.55 }));
        dg.append(el('circle', { cx: X, cy: Y, r: 13, fill: 'var(--acc)', stroke: 'var(--zemin)', 'stroke-width': 2 }));
        yaz(dg, X, Y + 34, sy(w, 3), { h: 'middle', k: 14, b: true, r: w < -1e-9 ? 'var(--tur)' : 'var(--yesil)' });
      }
      if (imp) {
        dg.append(el('line', { x1: gx(-1), x2: gx(1), y1: gy(1), y2: gy(1), stroke: 'var(--tur)', 'stroke-width': 4, opacity: 0.45 }));
        for (const [di, w] of imp) {
          dg.append(el('rect', { x: gx(di) - 13, y: gy(1) - 13, width: 26, height: 26, fill: di === 0 ? 'var(--tur)' : 'var(--zemin)', stroke: 'var(--tur)', 'stroke-width': 3 }));
          yaz(dg, gx(di), gy(1) - 22, sy(w, 3), { h: 'middle', k: 14, b: true, r: 'var(--tur)' });
        }
      } else dg.append(el('rect', { x: hedef[0] - 13, y: hedef[1] - 13, width: 26, height: 26, fill: 'var(--tur)', stroke: 'var(--zemin)', 'stroke-width': 2 }));
      const top = exp.reduce((a, b) => a + b[2], 0), negatif = exp.some((e) => e[2] < -1e-9);
      yaz(bilgi, 400, 40, S.ad, { k: 16, b: true });
      const sat = [S.tur, `koşul: ${S.kosul}`, `mertebe: ${S.mer}`, imp ? 'turuncu kare = YENİ seviyede bilinmeyen' : 'turuncu kare = hesaplanan nokta', imp ? '→ her adımda üç köşegenli sistem' : `bilinen katsayılar toplamı = ${sy(top, 3)}`, negatif ? 'negatif katsayı var (turuncu sayı)' : 'bütün katsayılar ≥ 0'];
      sat.forEach((t, i) => yaz(bilgi, 400, 66 + i * 22, t, { k: 12.5, r: i === 5 && negatif ? 'var(--tur)' : 'var(--yazi)' }));
      if (!imp && negatif && /ν/.test(S.p)) yaz(bilgi, 400, 66 + 6 * 22, '→ keskin cephede salınım', { k: 12.5, r: 'var(--tur)' });
    }
    sP.inp.addEventListener('input', ciz); ciz();
  };

  /* ====================================================================== KAPALI SİSTEM (Thomas) ==== */
  Sekil.m303b_matris = function (kap, ayar = {}) {
    const W = 640, H = 330, svg = svgYap(kap, W, H, 'Kapalı yöntemin üç köşegenli sistemi ve Thomas çözümü');
    const lam = 0.020875;
    let yon = ayar.yontem === 'cn' ? 1 : 0, ad = ayar.adim ?? 0;
    const g = el('g'); svg.append(g);
    const k = kontrol(kap);
    secenek(k, ['Laasonen (S28)', 'Crank–Nicolson (S29)'], yon, (i) => { yon = i; ciz(); });
    const k2 = kontrol(kap);
    const ads = secenek(k2, ['1 · sistemi kur', '2 · ileri eleme', '3 · geri koyma', '4 · karşılaştır'], ad, (i) => { ad = i; ciz(); });
    void ads;
    function ciz() {
      g.replaceChildren();
      const diag = yon ? 2 * (1 + lam) : 1 + 2 * lam;
      const a = [0, -lam, -lam, -lam], c = [-lam, -lam, -lam, 0];
      const r = yon ? [4.175, 0, 0, 2.0875] : [lam * 100, 0, 0, lam * 50];
      const sol = thomas(a, [diag, diag, diag, diag], c, r);
      const x0 = 30, y0 = 50, hc = 52, wc = 78;
      yaz(g, 20, 24, yon ? 'Crank–Nicolson: −λT₍ᵢ₋₁₎ + 2(1+λ)Tᵢ − λT₍ᵢ₊₁₎ = eski seviye + sınırlar' : 'Laasonen: −λT₍ᵢ₋₁₎ + (1+2λ)Tᵢ − λT₍ᵢ₊₁₎ = Tᵢ (eski) + sınır', { k: 14, b: true });
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
        const X = x0 + j * wc, Y = y0 + i * hc, band = Math.abs(i - j) <= 1;
        let v = i === j ? (ad >= 1 ? sol.f[i] : diag) : (j === i - 1 ? (ad >= 1 ? 0 : a[i]) : j === i + 1 ? c[i] : 0);
        const sil = ad >= 1 && j === i - 1;
        kutu(g, X, Y, wc - 6, hc - 8, { f: band && !sil ? (i === j ? 'var(--acc-zemin)' : 'var(--yuzey)') : 'var(--zemin)', s: band ? 'var(--acc)' : 'var(--cizgi)', rx: 4 });
        yaz(g, X + (wc - 6) / 2, Y + 28, band ? (sil ? '0' : sy(v, i === j ? 6 : 6)) : '0', { h: 'middle', k: 12.5, r: band && !sil ? 'var(--yazi)' : 'var(--ikincil)', b: i === j });
      }
      const xb = x0 + 4 * wc + 18;
      yaz(g, xb + 30, y0 - 8, 'T', { h: 'middle', k: 14, b: true });
      yaz(g, xb + 82, y0 + 2 * hc - 4, '=', { h: 'middle', k: 22, b: true });
      yaz(g, xb + 160, y0 - 8, ad >= 1 ? "r′ (elenmiş)" : 'r (sağ taraf)', { h: 'middle', k: 14, b: true });
      for (let i = 0; i < 4; i++) {
        const Y = y0 + i * hc;
        kutu(g, xb, Y, 62, hc - 8, { f: ad >= 2 ? 'var(--yesil-zemin)' : 'var(--zemin)', s: ad >= 2 ? 'var(--yesil)' : 'var(--cizgi)', rx: 4 });
        yaz(g, xb + 31, Y + 28, ad >= 2 ? sy(sol.x[i], 4) : `T${i + 1}`, { h: 'middle', k: 13, b: true });
        const sinirlik = i === 0 || i === 3;
        kutu(g, xb + 110, Y, 100, hc - 8, { f: sinirlik && ad === 0 ? 'var(--tur-zemin)' : 'var(--zemin)', s: sinirlik && ad === 0 ? 'var(--tur)' : 'var(--cizgi)', rx: 4 });
        yaz(g, xb + 160, Y + 28, sy(ad >= 1 ? sol.r[i] : r[i], 6), { h: 'middle', k: 13 });
      }
      const xn = 30, yn = y0 + 4 * hc + 8;
      const not = [
        [`Köşegen ${sy(diag, 5)}, komşular −λ = −0.020875.`, 'Turuncu: T₀ = 100 ve T₅ = 50 yeni seviyede de bilinir → sağ tarafa.', yon ? 'CN sağı = λT(eski komşu) + 2(1−λ)T(eski) + λT(eski komşu) + λ·sınır.' : 'Sağ taraf = eski Tᵢ (hepsi 0) + λ·sınır.'],
        ['İleri eleme: e′ₖ = eₖ/f′ₖ₋₁ · f′ₖ = fₖ − e′ₖgₖ₋₁ · r′ₖ = rₖ − e′ₖr′ₖ₋₁', `f′ = ${sol.f.map((v) => sy(v, 6)).join(', ')}`, 'alt köşegen sıfırlandı (gri).'],
        ['Geri koyma: T₄ = r′₄/f′₄, sonra Tₖ = (r′ₖ − gₖTₖ₊₁)/f′ₖ yukarı doğru.', `T = ${sol.x.map((v) => sy(v, 4)).join(' · ')} °C`, 'Toplam iş O(n): büyük çubukta da hızlı.'],
        ['T₁: açık 2.0875 · kapalı 2.0047 · CN 2.0450 (ortada).', 'T₂: açık 0 · kapalı 0.0406 · CN 0.0210.', 'Kapalıda bütün düğümler bağlı → bilgi tek adımda çubuğa yayılır.'],
      ][ad];
      not.forEach((s, i) => yaz(g, xn, yn + i * 19, s, { k: 12.5, r: i ? 'var(--ikincil)' : 'var(--yazi)' }));
      if (ad === 2) for (let i = 3; i > 0; i--) ok(g, xb + 70, y0 + i * hc + 10, xb + 70, y0 + (i - 1) * hc + 34, 'var(--yesil)', 2);
    }
    ciz();
  };

  /* ====================================================================== K9 · ADVEKSİYON ==== */
  const gauss = (x) => Math.exp(-200 * (x - 0.25) ** 2);
  Sekil.m303b_karakteristik = function (kap, ayar = {}) {
    const W = 640, H = 340, svg = svgYap(kap, W, H, 'Doğrusal adveksiyonun karakteristikleri: x − ct = sabit çizgileri boyunca u değişmez');
    const X1 = 1.5;
    const d = eksen(svg, { W, H, x: [0, X1], y: [0, 1], xt: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5], yt: [0, 0.25, 0.5, 0.75, 1], L: 52, R: 20, T: 34, B: 44, xad: 'x', yad: 't' });
    svg.append(el('line', { x1: d.x(1), x2: d.x(1), y1: d.y(0), y2: d.y(1), stroke: 'var(--ikincil)', 'stroke-dasharray': '4 4' }));
    yaz(svg, d.x(1) + 4, d.y(1) + 14, 'advection.m alanı x ≤ 1', { k: 12, r: 'var(--ikincil)' });
    const kg = el('g'); svg.append(kg);
    const tepeYol = el('path', { stroke: 'var(--tur)', 'stroke-width': 3, fill: 'none' }); svg.append(tepeYol);
    const p0 = el('path', { fill: 'var(--acc-zemin)', stroke: 'var(--acc)', 'stroke-width': 2 }); svg.append(p0);
    const pt = el('path', { fill: 'var(--tur-zemin)', stroke: 'var(--tur)', 'stroke-width': 2.5 }); svg.append(pt);
    const tl = el('line', { stroke: 'var(--tur)', 'stroke-dasharray': '5 4' }); svg.append(tl);
    const bas = yaz(svg, 70, 16, '', { k: 14, b: true });
    const k = kontrol(kap);
    const sc = surgu(k, 'c', -1, 1, 0.05, ayar.c ?? 1, (v) => `${sy(v, 2)} (birim/s)`);
    const st = surgu(k, 't', 0, 1, 0.01, ayar.t ?? 0.5, (v) => sy(v, 2));
    const oku = okuma(kap, ['tepe konumu x = 0.25 + c·t', 'karakteristik eğimi dx/dt', 'bilgi nereden gelir?']);
    function ciz() {
      const c = sc.v, t = st.v;
      kg.replaceChildren();
      for (let x0 = -1.5; x0 <= 1.5 + 1e-9; x0 += 0.1) {
        const pts = [];
        for (let s = 0; s <= 1.0001; s += 0.02) { const x = x0 + c * s; if (x >= 0 && x <= X1) pts.push([d.x(x), d.y(s)]); }
        if (pts.length > 1) kg.append(el('path', { d: yol(pts), stroke: 'var(--ikincil)', 'stroke-width': 1, opacity: 0.55, fill: 'none' }));
      }
      const tp = []; for (let s = 0; s <= 1.0001; s += 0.02) { const x = 0.25 + c * s; if (x >= 0 && x <= X1) tp.push([d.x(x), d.y(s)]); }
      tepeYol.setAttribute('d', yol(tp));
      const prof = (tt, h) => { const a = []; for (let i = 0; i <= 300; i++) { const x = i / 300 * X1; a.push([d.x(x), d.y(tt) - h * gauss(x - c * tt)]); } return `${yol(a)} L${d.x(X1)},${d.y(tt)} L${d.x(0)},${d.y(tt)} Z`; };
      p0.setAttribute('d', prof(0, 40)); pt.setAttribute('d', prof(t, 40));
      tl.setAttribute('x1', d.x(0)); tl.setAttribute('x2', d.x(X1)); tl.setAttribute('y1', d.y(t)); tl.setAttribute('y2', d.y(t));
      bas.textContent = `u(x, t) = u₀(x − ct): profil şeklini bozmadan c hızıyla kayar (c = ${sy(c, 2)})`;
      oku({ 'tepe konumu x = 0.25 + c·t': sy(0.25 + c * t, 3), 'karakteristik eğimi dx/dt': `c = ${sy(c, 2)}`, 'bilgi nereden gelir?': c > 0 ? 'soldan (upwind = sol komşu)' : c < 0 ? 'sağdan (upwind = sağ komşu)' : 'hiçbir yerden (durağan)' });
    }
    sc.inp.addEventListener('input', ciz); st.inp.addEventListener('input', ciz); ciz();
  };

  /* CFL: sayısal bağımlılık bölgesi ↔ fiziksel karakteristik */
  function cflKur(kap, ayar, oto) {
    const W = 640, H = 330, svg = svgYap(kap, W, H, 'CFL koşulu: fiziksel karakteristiğin ayağı sayısal bağımlılık bölgesinin içinde mi?');
    const K = 4, gx = (i) => 320 + i * 50, gy = (k) => 50 + k * 58; // k = 0 → n+1 (hedef), k = K → n+1−K
    const ust = el('g'); svg.append(ust);
    for (let k = 0; k <= K; k++) { ust.append(el('line', { x1: gx(-6), x2: gx(6), y1: gy(k), y2: gy(k), stroke: 'var(--cizgi)' })); yaz(ust, 18, gy(k) + 5, k === 0 ? 'n + 1' : `n − ${k - 1}`.replace('n − 0', 'n'), { k: 13, b: true }); }
    for (let i = -6; i <= 6; i += 1) { if (i % 2 === 0) yaz(ust, gx(i), gy(K) + 26, i === 0 ? 'i' : `i${i > 0 ? '+' : '−'}${Math.abs(i)}`, { h: 'middle', k: 12, r: 'var(--ikincil)' }); }
    const bolge = el('path', { fill: 'var(--acc-zemin)', stroke: 'var(--acc)', 'stroke-width': 2 }); svg.append(bolge);
    const ng = el('g'); svg.append(ng);
    const kar = el('line', { 'stroke-width': 3.5, 'stroke-linecap': 'round' }); svg.append(kar);
    const ayak = el('circle', { r: 8, stroke: 'var(--zemin)', 'stroke-width': 2 }); svg.append(ayak);
    svg.append(el('rect', { x: gx(0) - 10, y: gy(0) - 10, width: 20, height: 20, fill: 'var(--tur)' }));
    const durum = yaz(svg, 320, 22, '', { h: 'middle', k: 15, b: true });
    const k1 = kontrol(kap);
    let btn = null; if (oto) btn = dugme(k1, '▶ Oynat');
    const sN = surgu(k1, 'ν = |c|Δt/Δx', 0, 1.6, 0.01, ayar.nu ?? 0.9, (v) => sy(v, 2));
    const k2 = kontrol(kap);
    let sema = ayar.sema ?? 0;
    secenek(k2, ['upwind, c > 0 (sol komşu)', '3 noktalı (Lax, LW, FTCS)', 'c < 0 ama sol komşu (yanlış taraf)', 'c < 0, sağ komşu (doğru upwind)'], sema, (i) => { sema = i; ciz(); });
    const oku = okuma(kap, ['ayak noktası (K = 4 adım geri)', 'sayısal bölge (alt satır)', 'sonuç']);
    function ciz() {
      const nu = sN.v, isaret = sema >= 2 ? -1 : 1;
      const sol = (k) => (sema === 3 ? 0 : -k), sag = (k) => (sema === 1 ? k : sema === 3 ? k : 0);
      const ust2 = [], alt2 = [];
      for (let k = 0; k <= K; k++) { ust2.push([gx(sol(k)) - 14, gy(k)]); alt2.unshift([gx(sag(k)) + 14, gy(k)]); }
      bolge.setAttribute('d', yol([[gx(0) - 14, gy(0) - 14], ...ust2.slice(1), [gx(sol(K)) - 14, gy(K) + 14], [gx(sag(K)) + 14, gy(K) + 14], ...alt2.slice(0, -1), [gx(0) + 14, gy(0) - 14]]) + 'Z');
      ng.replaceChildren();
      for (let k = 1; k <= K; k++) for (let i = -6; i <= 6; i++) { const ic = i >= sol(k) && i <= sag(k); nokta(ng, gx(i), gy(k), ic ? 6 : 3.5, ic ? 'var(--acc)' : 'var(--ikincil)'); }
      const xa = -isaret * nu * K, icinde = xa >= sol(K) - 1e-9 && xa <= sag(K) + 1e-9;
      const xg = Math.max(-6.6, Math.min(6.6, xa));
      kar.setAttribute('x1', gx(0)); kar.setAttribute('y1', gy(0)); kar.setAttribute('x2', gx(xg)); kar.setAttribute('y2', gy(0) + (gy(K) - gy(0)) * (xa === 0 ? 1 : xg / xa));
      const renk = icinde ? 'var(--yesil)' : 'var(--tur)';
      kar.setAttribute('stroke', renk); ayak.setAttribute('fill', renk); ayak.setAttribute('cx', gx(xg)); ayak.setAttribute('cy', gy(0) + (gy(K) - gy(0)) * (xa === 0 ? 1 : xg / xa));
      durum.textContent = icinde ? 'Karakteristik bölgenin İÇİNDE → CFL sağlanıyor' : 'Karakteristik bölgenin DIŞINDA → kararsız';
      durum.setAttribute('fill', renk);
      oku({ 'ayak noktası (K = 4 adım geri)': `i ${xa <= 0 ? '−' : '+'} ${sy(Math.abs(xa), 2)}`, 'sayısal bölge (alt satır)': `[i${sol(K) ? ' − ' + -sol(K) : ''}, i${sag(K) ? ' + ' + sag(K) : ''}]`, sonuç: icinde ? 'ν ≤ 1 ve doğru taraf' : sema === 2 ? 'yanlış taraf: her ν > 0 kararsız' : 'ν > 1: bilgi bir adımda bir hücreden fazla gidiyor' });
    }
    sN.inp.addEventListener('input', ciz); ciz();
    if (!oto) return null;
    let t = 0;
    const oyn = dongu(btn, (dt) => { t += dt; sN.set(0.85 + 0.6 * Math.sin(t * 0.8)); ciz(); });
    return { dur: oyn.dur };
  }
  Sekil.m303b_cfl = function (kap, ayar = {}) { cflKur(kap, ayar, false); };
  Anim.m303b_cfl = function (kap, ayar = {}) { return cflKur(kap, ayar, true); };

  /* ====================================================================== K10 · VON NEUMANN ==== */
  const s2 = (t) => Math.sin(t / 2) ** 2;
  const GS = {
    'ftcs-isi': { ad: 'FTCS ısı', p: 'λ', p0: 0.4, pm: 1, f: (p, t) => [[1 - 4 * p * s2(t), 0]] },
    'btcs-isi': { ad: 'Laasonen', p: 'λ', p0: 0.6, pm: 2, f: (p, t) => [[1 / (1 + 4 * p * s2(t)), 0]] },
    'cn-isi': { ad: 'Crank–Nicolson', p: 'λ', p0: 2, pm: 4, f: (p, t) => [[(1 - 2 * p * s2(t)) / (1 + 2 * p * s2(t)), 0]] },
    'ftcs-adv': { ad: 'FTCS adveksiyon', p: 'ν', p0: 0.5, pm: 1.6, f: (p, t) => [[1, -p * Math.sin(t)]] },
    upwind: { ad: 'Upwind', p: 'ν', p0: 0.5, pm: 1.6, f: (p, t) => [[1 - p + p * Math.cos(t), -p * Math.sin(t)]] },
    lax: { ad: 'Lax', p: 'ν', p0: 0.5, pm: 1.6, f: (p, t) => [[Math.cos(t), -p * Math.sin(t)]] },
    lw: { ad: 'Lax–Wendroff', p: 'ν', p0: 0.5, pm: 1.6, f: (p, t) => [[1 - p * p * (1 - Math.cos(t)), -p * Math.sin(t)]] },
    leap: { ad: 'Leapfrog (2 kök)', p: 'ν', p0: 0.5, pm: 1.6, f: (p, t) => { const s = p * Math.sin(t); if (Math.abs(s) <= 1) { const q = Math.sqrt(1 - s * s); return [[q, -s], [-q, -s]]; } const r = Math.sqrt(s * s - 1); return [[0, -s + Math.sign(s) * r], [0, -s - Math.sign(s) * r]]; } },
    dalga: { ad: 'Dalga (2 kök)', p: 'ν', p0: 1, pm: 1.6, f: (p, t) => { const b = 1 - 2 * p * p * s2(t); if (Math.abs(b) <= 1) { const q = Math.sqrt(1 - b * b); return [[b, q], [b, -q]]; } const r = Math.sqrt(b * b - 1); return [[b + r, 0], [b - r, 0]]; } },
  };
  function gKur(kap, ayar, oto) {
    const W = 640, H = 330, svg = svgYap(kap, W, H, 'Von Neumann büyütme çarpanı G: karmaşık düzlemde birim çember ve |G|–θ grafiği');
    const cx = 160, cy = 172, R = 96;
    const ana = el('g'); svg.append(ana);
    ana.append(el('circle', { cx, cy, r: R, fill: 'var(--yesil-zemin)', stroke: 'var(--yesil)', 'stroke-width': 2 }));
    ana.append(el('line', { x1: cx - 1.55 * R, x2: cx + 1.55 * R, y1: cy, y2: cy, stroke: 'var(--ikincil)' }));
    ana.append(el('line', { x1: cx, x2: cx, y1: cy - 1.55 * R, y2: cy + 1.55 * R, stroke: 'var(--ikincil)' }));
    for (const v of [-1, 1]) { yaz(ana, cx + v * R, cy + 16, String(v).replace('-', '−'), { h: 'middle', k: 12, r: 'var(--ikincil)' }); yaz(ana, cx + 6, cy - v * R + 4, `${v > 0 ? '' : '−'}i`, { k: 12, r: 'var(--ikincil)' }); }
    yaz(ana, cx + 1.55 * R, cy - 6, 'Re G', { h: 'end', k: 12, b: true }); yaz(ana, cx + 8, 26, 'Im G', { k: 12, b: true });
    yaz(ana, cx - R + 6, cy + R + 22, 'yeşil daire: |G| ≤ 1 (kararlı bölge)', { k: 12, r: 'var(--yesil)' });
    const izler = [el('path', { fill: 'none', stroke: 'var(--acc)', 'stroke-width': 3 }), el('path', { fill: 'none', stroke: 'var(--tur)', 'stroke-width': 2.5, 'stroke-dasharray': '6 4' })];
    izler.forEach((p) => svg.append(p));
    const vek = el('line', { x1: cx, y1: cy, stroke: 'var(--yazi)', 'stroke-width': 2 }); svg.append(vek);
    const nk = [nokta(svg, 0, 0, 6, 'var(--acc)'), nokta(svg, 0, 0, 6, 'var(--tur)')];
    const d = eksen(svg, { W: 300, H: 300, ox: 330, oy: 10, x: [0, Math.PI], y: [0, 2], xt: [0, Math.PI / 2, Math.PI], yt: [0, 0.5, 1, 1.5, 2], L: 40, R: 10, T: 24, B: 40, xf: (v) => (v === 0 ? '0' : v < 2 ? 'π/2' : 'π'), yad: '|G|', xad: 'θ = kΔx' });
    svg.append(el('line', { x1: d.x(0), x2: d.x(Math.PI), y1: d.y(1), y2: d.y(1), stroke: 'var(--yesil)', 'stroke-width': 2 }));
    const mg = [el('path', { fill: 'none', stroke: 'var(--acc)', 'stroke-width': 3 }), el('path', { fill: 'none', stroke: 'var(--tur)', 'stroke-width': 2.5, 'stroke-dasharray': '6 4' })];
    mg.forEach((p) => svg.append(p));
    const tim = el('line', { stroke: 'var(--ikincil)', 'stroke-dasharray': '3 3' }); svg.append(tim);
    yaz(svg, d.x(Math.PI), d.y(0) + 50, 'θ = π: 2Δx dalgası', { h: 'end', k: 11.5, r: 'var(--ikincil)' });
    const k1 = kontrol(kap);
    let btn = null; if (oto) btn = dugme(k1, '▶ Oynat');
    const anah = Object.keys(GS); let s = Math.max(0, anah.indexOf(ayar.sema ?? 'upwind'));
    const sP = surgu(k1, 'p', 0, 1.6, 0.01, ayar.p ?? GS[anah[s]].p0, (v) => sy(v, 2));
    const sT = surgu(k1, 'θ', 0, Math.PI, 0.01, ayar.theta ?? Math.PI / 2, (v) => `${sy(v / Math.PI, 2)}π`);
    const k2 = kontrol(kap);
    secenek(k2, anah.map((a) => GS[a].ad), s, (i) => { s = i; const S = GS[anah[s]]; sP.inp.max = S.pm; sP.set(S.p0); ciz(); });
    const oku = okuma(kap, ['G(θ)', '|G(θ)|', 'en büyük |G| (bütün θ)', 'karar']);
    const P = (z) => [cx + z[0] * R, cy - z[1] * R];
    function ciz() {
      const S = GS[anah[s]], p = sP.v, th = sT.v;
      sP.inp.previousElementSibling.textContent = S.p;
      const kokS = S.f(p, 0).length;
      for (let r = 0; r < 2; r++) {
        if (r >= kokS) { izler[r].setAttribute('d', ''); mg[r].setAttribute('d', ''); nk[r].setAttribute('r', 0); continue; }
        const a = [], b = [];
        for (let j = 0; j <= 240; j++) { const t = -Math.PI + 2 * Math.PI * j / 240, z = S.f(p, t)[r]; const q = P(z); a.push([sinir(q[0], 0, 320), sinir(q[1], 0, 330)]); }
        for (let j = 0; j <= 120; j++) { const t = Math.PI * j / 120, z = S.f(p, t)[r]; b.push([d.x(t), d.y(sinir(Math.hypot(z[0], z[1]), 0, 2))]); }
        izler[r].setAttribute('d', yol(a)); mg[r].setAttribute('d', yol(b));
        const z = S.f(p, th)[r], q = P(z); nk[r].setAttribute('r', 6); nk[r].setAttribute('cx', sinir(q[0], 0, 320)); nk[r].setAttribute('cy', sinir(q[1], 0, 330));
      }
      const z0 = S.f(p, th)[0], q0 = P(z0); vek.setAttribute('x2', sinir(q0[0], 0, 320)); vek.setAttribute('y2', sinir(q0[1], 0, 330));
      tim.setAttribute('x1', d.x(th)); tim.setAttribute('x2', d.x(th)); tim.setAttribute('y1', d.y(0)); tim.setAttribute('y2', d.y(2));
      let mx = 0; for (let j = 0; j <= 360; j++) for (const z of S.f(p, Math.PI * j / 360)) mx = Math.max(mx, Math.hypot(z[0], z[1]));
      const gst = S.f(p, th).map((z) => `${sy(z[0], 3)} ${z[1] < 0 ? '−' : '+'} ${sy(Math.abs(z[1]), 3)}i`).join('  ·  ');
      oku({ 'G(θ)': gst, '|G(θ)|': S.f(p, th).map((z) => sy(Math.hypot(z[0], z[1]), 4)).join(' · '), 'en büyük |G| (bütün θ)': sy(mx, 4), karar: mx <= 1 + 1e-9 ? `kararlı (${S.p} = ${sy(p, 2)})` : `KARARSIZ: hata her adımda ×${sy(mx, 3)}` });
    }
    sP.inp.addEventListener('input', ciz); sT.inp.addEventListener('input', ciz); ciz();
    if (!oto) return null;
    let t = 0;
    const oyn = dongu(btn, (dt) => { t += dt; sT.set(Math.PI * (0.5 - 0.5 * Math.cos(t * 0.9))); ciz(); });
    return { dur: oyn.dur };
  }
  Sekil.m303b_gduzlem = function (kap, ayar = {}) { gKur(kap, ayar, false); };
  Anim.m303b_gduzlem = function (kap, ayar = {}) { return gKur(kap, ayar, true); };

  /* adveksiyon şemaları yan yana (periyodik alan, N = 100) */
  const ADV = {
    tam: { ad: 'tam', r: 'var(--yazi)', w: 2, d: '6 5' },
    upwind: { ad: 'upwind', r: 'var(--acc)', w: 3 },
    lax: { ad: 'Lax', r: 'var(--ikincil)', w: 2.5 },
    lw: { ad: 'Lax–Wendroff', r: 'var(--yesil)', w: 3 },
    ftcs: { ad: 'FTCS', r: 'var(--tur)', w: 2.5 },
    leap: { ad: 'leapfrog', r: 'var(--tur)', w: 3.5, d: '1 5' },
    mod: { ad: 'upwind modifiye denk.', r: 'var(--acc)', w: 2, d: '3 3' },
  };
  function advAdim(u, nu, s) {
    const up = rol(u, 1), um = rol(u, -1);
    if (s === 'upwind') return u.map((v, i) => v - nu * (v - um[i]));
    if (s === 'lax') return u.map((v, i) => 0.5 * (up[i] + um[i]) - nu / 2 * (up[i] - um[i]));
    if (s === 'lw') return u.map((v, i) => v - nu / 2 * (up[i] - um[i]) + nu * nu / 2 * (up[i] - 2 * v + um[i]));
    return u.map((v, i) => v - nu / 2 * (up[i] - um[i])); // ftcs
  }
  Anim.m303b_adveksiyon = function (kap, ayar = {}) {
    const W = 640, H = 330, svg = svgYap(kap, W, H, 'Adveksiyon şemaları yan yana: upwind yayar, Lax–Wendroff salınır, FTCS patlar, leapfrog hesaplama modu');
    const N = 100, dx = 1 / N, xs = Array.from({ length: N }, (_, i) => i * dx);
    const d = eksen(svg, { W, H, x: [0, 1], y: [-0.5, 1.5], xt: [0, 0.25, 0.5, 0.75, 1], yt: [-0.5, 0, 0.5, 1, 1.5], L: 50, R: 14, T: 46, B: 40, xad: 'x (periyodik)', yad: 'u' });
    const ac = new Set(ayar.semalar || ['tam', 'upwind', 'lw', 'lax']);
    const yollar = {}; for (const s of Object.keys(ADV)) { yollar[s] = el('path', { fill: 'none', stroke: ADV[s].r, 'stroke-width': ADV[s].w, 'stroke-dasharray': ADV[s].d, 'stroke-linecap': 'round' }); svg.append(yollar[s]); }
    const bas = yaz(svg, 52, 18, '', { k: 13.5, b: true });
    const lej = el('g'); svg.append(lej);
    const k1 = kontrol(kap); const btn = dugme(k1, '▶ Oynat'); const sifir = dugme(k1, '↺ Baştan', true);
    const sN = surgu(k1, 'ν', 0.1, 1.2, 0.01, ayar.nu ?? 0.5, (v) => sy(v, 2));
    const k2 = kontrol(kap);
    let prof = ayar.profil === 'kare' ? 1 : 0;
    secenek(k2, ['Gauss tepesi', 'kare dalga'], prof, (i) => { prof = i; kur(); });
    const k3 = kontrol(kap);
    const tg = {};
    for (const s of ['upwind', 'lax', 'lw', 'ftcs', 'leap', 'mod']) {
      const b = dugme(k3, ADV[s].ad, true); tg[s] = b;
      const isr = () => { b.setAttribute('aria-pressed', String(ac.has(s))); b.style.fontWeight = ac.has(s) ? '700' : ''; b.style.borderColor = ac.has(s) ? ADV[s].r : ''; };
      b.addEventListener('click', () => { if (ac.has(s)) ac.delete(s); else ac.add(s); isr(); ciz(); }); isr();
    }
    let asselin = !!ayar.asselin;
    const ab = dugme(k3, 'Asselin süzgeci', true);
    const aisr = () => { ab.setAttribute('aria-pressed', String(asselin)); ab.style.fontWeight = asselin ? '700' : ''; };
    ab.addEventListener('click', () => { asselin = !asselin; aisr(); kur(); }); aisr();
    const oku = okuma(kap, ['t (1 tur = 1)', 'en büyük u', 'en küçük u']);
    let U, n, u0, birik = 0;
    const f0 = (x) => (prof ? (x >= 0.15 && x <= 0.35 ? 1 : 0) : gauss(x));
    const per = (x) => ((x % 1) + 1) % 1;
    function kur() {
      n = 0; u0 = xs.map(f0); const nu = sN.v;
      U = { upwind: u0.slice(), lax: u0.slice(), lw: u0.slice(), ftcs: u0.slice(), leapEski: null, leap: u0.slice() };
      void nu; ciz();
    }
    function adim() {
      const nu = sN.v;
      for (const s of ['upwind', 'lax', 'lw', 'ftcs']) U[s] = advAdim(U[s], nu, s);
      if (!U.leapEski) { U.leapEski = U.leap; U.leap = advAdim(U.leap, nu, 'ftcs'); } else {
        const up = rol(U.leap, 1), um = rol(U.leap, -1);
        const yeni = U.leapEski.map((v, i) => v - nu * (up[i] - um[i]));
        const filt = asselin ? U.leap.map((v, i) => v + 0.1 * (yeni[i] - 2 * v + U.leapEski[i])) : U.leap;
        U.leapEski = filt; U.leap = yeni;
      }
      n++; ciz();
    }
    function ciz() {
      const nu = sN.v, t = n * nu * dx;
      const ek = (u) => yol(u.concat([u[0]]).map((v, i) => [d.x(i * dx), d.y(sinir(v, -0.5, 1.5))]));
      const tam = xs.map((x) => f0(per(x - t)));
      yollar.tam.setAttribute('d', ek(tam));
      for (const s of ['upwind', 'lax', 'lw', 'ftcs', 'leap']) yollar[s].setAttribute('d', ac.has(s) ? ek(U[s]) : '');
      if (ac.has('mod') && !prof) {
        const K = dx * (1 - nu) / 2, s02 = 1 / 400, s2t = s02 + 2 * K * t;
        yollar.mod.setAttribute('d', ek(xs.map((x) => { let v = 0; for (const m of [-1, 0, 1]) v += Math.sqrt(s02 / s2t) * Math.exp(-((x - 0.25 - t + m - Math.floor(t)) ** 2) / (2 * s2t)); return v; })));
      } else yollar.mod.setAttribute('d', '');
      lej.replaceChildren();
      let lx = 72;
      for (const s of ['tam', 'upwind', 'lax', 'lw', 'ftcs', 'leap', 'mod']) {
        if (s !== 'tam' && !ac.has(s)) continue;
        if (s === 'mod' && prof) continue;
        lej.append(el('line', { x1: lx, x2: lx + 20, y1: 36, y2: 36, stroke: ADV[s].r, 'stroke-width': ADV[s].w, 'stroke-dasharray': ADV[s].d }));
        const tt = yaz(lej, lx + 24, 40, ADV[s].ad, { k: 12 }); lx += 32 + ADV[s].ad.length * 6.6;
        void tt;
      }
      bas.textContent = `ν = ${sy(nu, 2)} · ${n} adım · ${nu > 1 ? 'ν > 1: CFL bozuk, hepsi patlar' : 'periyodik alan, N = 100 hücre'}`;
      const ozet = (f) => [...ac].filter((s) => U[s]).map((s) => `${ADV[s].ad} ${kisa(f(...U[s]), 2)}`).join(' · ');
      oku({ 't (1 tur = 1)': sy(t, 3), 'en büyük u': `tam ${sy(Math.max(...tam), 2)} · ${ozet(Math.max)}`, 'en küçük u': ozet(Math.min) });
    }
    const oyn = dongu(btn, (dt) => { birik += dt; let k = 0; while (birik > 0.03 && k < 4) { birik -= 0.03; k++; if (n * sN.v * dx >= 1 - 1e-9) return false; adim(); } });
    sifir.addEventListener('click', () => { oyn.dur(); kur(); });
    sN.inp.addEventListener('input', () => { oyn.dur(); kur(); });
    kur();
    return { dur: oyn.dur };
  };

  /* ====================================================================== K10 · LAX DENKLİK ==== */
  Sekil.m303b_lax = function (kap, ayar = {}) {
    const W = 640, H = 300, svg = svgYap(kap, W, H, 'Lax denklik teoremi: tutarlılık ve kararlılık birlikte yakınsaklık verir');
    const kut = [], ic = [];
    const tan = [['TUTARLILIK', 'kesme hatası → 0', '(Δt, Δx → 0)'], ['KARARLILIK', 'hata büyümez', '(|G| ≤ 1)'], ['YAKINSAKLIK', 'sayısal çözüm →', 'gerçek çözüm']];
    [[20, 50], [230, 50], [440, 50]].forEach(([x, y], i) => {
      kut.push(kutu(svg, x, y, 180, 110, { rx: 12, w: 2.5 }));
      yaz(svg, x + 90, y + 28, tan[i][0], { h: 'middle', k: 15, b: true });
      yaz(svg, x + 90, y + 52, tan[i][1], { h: 'middle', k: 13 }); yaz(svg, x + 90, y + 70, tan[i][2], { h: 'middle', k: 13, r: 'var(--ikincil)' });
      ic.push(yaz(svg, x + 90, y + 98, '', { h: 'middle', k: 15, b: true }));
    });
    yaz(svg, 215, 112, '+', { h: 'middle', k: 26, b: true }); yaz(svg, 425, 112, '⇔', { h: 'middle', k: 24, b: true });
    yaz(svg, 320, 30, 'Doğrusal, iyi konmuş problemde, TUTARLI bir şema için: kararlı ⇔ yakınsak', { h: 'middle', k: 14, b: true });
    const acik = [yaz(svg, 20, 200, '', { k: 13.5 }), yaz(svg, 20, 222, '', { k: 13.5, r: 'var(--ikincil)' }), yaz(svg, 20, 244, '', { k: 13.5, r: 'var(--ikincil)' })];
    const ORN = [
      ['Upwind, ν = 0.5', [1, 1, 1], 'Kesme hatası O(Δt, Δx) → 0 ve |G| ≤ 1 (0 ≤ ν ≤ 1).', 'Izgara incelince hata ≈ Δx ile azalır (1. mertebe).', 'Yakınsar ama yavaş: tepe yayılır (S31).'],
      ['Upwind, ν = 1.2', [1, 0, 0], 'Tutarlı ama ν > 1 → θ = π\'de |G| = 1.4 (S37: ν = 1.5 → 2).', 'Hata her adımda büyür; incelttikçe adım sayısı artar → daha kötü.', 'S34(d): dt = 0.012 → ν = 1.2 → patlar.'],
      ['FTCS adveksiyon', [1, 0, 0], 'Tutarlı: kesme hatası O(Δt, Δx²) → 0.', 'Ama |G|² = 1 + ν²sin²θ > 1: her ν\'de kararsız.', 'Lax teoremi: kararsız → YAKINSAMAZ (S39).'],
      ['Lax, ν = 0.5', [1, 1, 1], 'Kesme hatası O(Δt, Δx²/Δt): Δt ∝ Δx iken → 0.', '|G|² = cos²θ + ν²sin²θ ≤ 1 (ν ≤ 1).', 'Yakınsar ama çok yayar (tepe 0.50).'],
      ['DuFort–Frankel, Δt/Δx sabit', [0, 1, 0], 'Koşulsuz kararlı, ama kesme hatasında k(Δt/Δx)²·T_tt var.', 'Δt/Δx sabit kalırsa fark denklemi başka (hiperbolik) bir denkleme yaklaşır.', 'Isı denkleminin çözümüne yakınsamaz → tutarlılık şartı Δt/Δx → 0.'],
    ];
    const k = kontrol(kap);
    secenek(k, ORN.map((o) => o[0]), ayar.ornek ?? 2, (i) => goster(i));
    function goster(i) {
      const o = ORN[i];
      o[1].forEach((v, j) => { kut[j].setAttribute('fill', v ? 'var(--yesil-zemin)' : 'var(--tur-zemin)'); kut[j].setAttribute('stroke', v ? 'var(--yesil)' : 'var(--tur)'); ic[j].textContent = v ? 'EVET' : 'HAYIR'; ic[j].setAttribute('fill', v ? 'var(--yesil)' : 'var(--tur)'); });
      acik[0].textContent = `${o[0]}: ${o[2]}`; acik[1].textContent = o[3]; acik[2].textContent = o[4];
    }
    goster(ayar.ornek ?? 2);
  };

  /* hata – Δx (log–log): yakınsaklığı gözle gör */
  Sekil.m303b_yakinsama = function (kap, ayar = {}) {
    const W = 640, H = 330, svg = svgYap(kap, W, H, 'Izgara inceltme: upwind 1. mertebe, Lax–Wendroff 2. mertebe yakınsar, FTCS yakınsamaz');
    const NS_ = [25, 50, 100, 200, 400], nu = 0.5, tSon = 0.5;
    const hata = {};
    for (const s of ['upwind', 'lw', 'ftcs', 'lax']) hata[s] = NS_.map((N) => {
      const dx = 1 / N; let u = Array.from({ length: N }, (_, i) => gauss(i * dx));
      const adimS = Math.round(tSon / (nu * dx));
      for (let k = 0; k < adimS; k++) { u = advAdim(u, nu, s); if (!isFinite(u[0]) || Math.abs(u[0]) > 1e30) break; }
      let e = 0; u.forEach((v, i) => { const x = ((i * dx - tSon) % 1 + 1) % 1; e = Math.max(e, Math.abs(v - gauss(x))); });
      return isFinite(e) ? e : 1e30;
    });
    const d = eksen(svg, { W, H, xlog: true, ylog: true, x: [0.002, 0.05], y: [1e-4, 1e4], xt: [0.0025, 0.005, 0.01, 0.02, 0.04], yt: [1e-4, 1e-2, 1, 1e2, 1e4], L: 64, R: 150, T: 30, B: 44, xf: (v) => String(v), yf: (v) => (v === 1 ? '1' : us10(Math.round(Math.log10(v)))), xad: 'Δx (ızgara aralığı)', yad: 'en büyük hata' });
    const RENK = { upwind: 'var(--acc)', lw: 'var(--yesil)', ftcs: 'var(--tur)', lax: 'var(--ikincil)' }, AD = { upwind: 'upwind', lw: 'Lax–Wendroff', ftcs: 'FTCS', lax: 'Lax' };
    const g = el('g'); svg.append(g);
    const sira = ['upwind', 'lw', 'ftcs', 'lax'];
    const k = kontrol(kap);
    let gor = ayar.adim ?? 3;
    secenek(k, ['upwind', '+ Lax–Wendroff', '+ FTCS', '+ Lax'], gor, (i) => { gor = i; ciz(); });
    const oku = okuma(kap, ['gözlenen mertebe p (Δx: 0.005 → 0.0025)', 'ν = 0.5, t = 0.5']);
    function ciz() {
      g.replaceChildren();
      const ref = (e0, p, dx0) => [[d.x(0.0025), d.y(e0 * (0.0025 / dx0) ** p)], [d.x(0.04), d.y(e0 * (0.04 / dx0) ** p)]];
      g.append(el('path', { d: yol(ref(hata.upwind[2] * 0.5, 1, 0.01)), stroke: 'var(--ikincil)', 'stroke-dasharray': '4 4', fill: 'none' }));
      g.append(el('path', { d: yol(ref(hata.lw[2] * 0.4, 2, 0.01)), stroke: 'var(--ikincil)', 'stroke-dasharray': '4 4', fill: 'none' }));
      yaz(g, d.x(0.0025) + 4, d.y(hata.upwind[2] * 0.5 / 4) + 16, 'eğim 1', { k: 11.5, r: 'var(--ikincil)' });
      yaz(g, d.x(0.0025) + 4, d.y(hata.lw[2] * 0.4 / 16) + 16, 'eğim 2', { k: 11.5, r: 'var(--ikincil)' });
      const pler = [];
      sira.slice(0, gor + 1).forEach((s, j) => {
        const pts = NS_.map((N, i) => [d.x(1 / N), d.y(sinir(hata[s][i], 1e-4, 1e4))]);
        g.append(el('path', { d: yol(pts), stroke: RENK[s], 'stroke-width': 3, fill: 'none' }));
        pts.forEach((p, i) => { nokta(g, p[0], p[1], 5, RENK[s]); if (hata[s][i] > 1e4) yaz(g, p[0], p[1] + 16, `↑ ${kisa(hata[s][i], 1)}`, { h: 'middle', k: 11, r: RENK[s] }); });
        g.append(el('line', { x1: W - 140, x2: W - 116, y1: 50 + j * 24, y2: 50 + j * 24, stroke: RENK[s], 'stroke-width': 3 }));
        yaz(g, W - 110, 55 + j * 24, AD[s], { k: 12.5 });
        const p = Math.log2(hata[s][3] / hata[s][4]);
        pler.push(`${AD[s]} ${s === 'ftcs' ? 'hata büyüyor' : sy(p, 2)}`);
      });
      oku({ 'gözlenen mertebe p (Δx: 0.005 → 0.0025)': pler.join(' · '), 'ν = 0.5, t = 0.5': 'Gauss tepesi, periyodik alan' });
    }
    ciz();
  };

  /* ====================================================================== MODİFİYE DENKLEM ==== */
  Sekil.m303b_modifiye = function (kap, ayar = {}) {
    const W = 640, H = 300, svg = svgYap(kap, W, H, 'Modifiye denklem katsayıları: upwind ve Lax sayısal viskozitesi, Lax–Wendroff dispersiyonu');
    const d = eksen(svg, { W, H, x: [0, 1.2], y: [-0.2, 1], xt: [0, 0.25, 0.5, 0.75, 1, 1.2], yt: [-0.2, 0, 0.25, 0.5, 0.75, 1], L: 56, R: 180, T: 28, B: 42, xad: 'ν = cΔt/Δx', yad: 'katsayı / (cΔx)' });
    const egri = (f, a = 0.02, b = 1.2) => { const p = []; for (let i = 0; i <= 200; i++) { const v = a + (b - a) * i / 200, y = f(v); if (isFinite(y)) p.push([d.x(v), d.y(sinir(y, -0.2, 1))]); } return yol(p); };
    svg.append(el('line', { x1: d.x(0), x2: d.x(1.2), y1: d.y(0), y2: d.y(0), stroke: 'var(--ikincil)' }));
    svg.append(el('path', { d: egri((v) => (1 - v) / 2), stroke: 'var(--acc)', 'stroke-width': 3, fill: 'none' }));
    svg.append(el('path', { d: egri((v) => (1 - v * v) / (2 * v), 0.4), stroke: 'var(--ikincil)', 'stroke-width': 2.5, fill: 'none' }));
    svg.append(el('path', { d: egri((v) => -(1 - v * v) / 6), stroke: 'var(--yesil)', 'stroke-width': 2.5, 'stroke-dasharray': '6 4', fill: 'none' }));
    [['upwind: K = cΔx(1 − ν)/2', 'var(--acc)', ''], ['Lax: K = cΔx(1 − ν²)/(2ν)', 'var(--ikincil)', ''], ['LW: u_xxx katsayısı', 'var(--yesil)', '6 4'], ['  −cΔx²(1 − ν²)/6', 'var(--yesil)', null]].forEach(([s, r, ds], i) => { if (ds !== null) svg.append(el('line', { x1: W - 172, x2: W - 150, y1: 44 + i * 24, y2: 44 + i * 24, stroke: r, 'stroke-width': 3, 'stroke-dasharray': ds || null })); yaz(svg, W - 146, 48 + i * 24, s, { k: 11.5 }); });
    const isr = el('line', { stroke: 'var(--tur)', 'stroke-dasharray': '4 3', 'stroke-width': 2 }); svg.append(isr);
    const nk = nokta(svg, 0, 0, 6, 'var(--acc)');
    yaz(svg, W - 172, 160, 'ν = 1: üçü de sıfır →', { k: 11.5, r: 'var(--ikincil)' }); yaz(svg, W - 172, 176, 'profil tam bir hücre taşınır', { k: 11.5, r: 'var(--ikincil)' });
    const k = kontrol(kap);
    const sN = surgu(k, 'ν', 0.05, 1.2, 0.01, ayar.nu ?? 0.5, (v) => sy(v, 2));
    const sC = surgu(k, 'c', 1, 50, 1, ayar.c ?? 10, (v) => `${v} m/s`);
    const sX = surgu(k, 'Δx', 1, 50, 1, ayar.dx ?? 10, (v) => `${v} km`);
    const oku = okuma(kap, ['upwind sayısal viskozitesi K', 'moleküler viskoziteye oranı', '1 günde bulaşma √(2Kt)']);
    function ciz() {
      const nu = sN.v, K = sC.v * sX.v * 1000 * (1 - nu) / 2;
      isr.setAttribute('x1', d.x(Math.min(nu, 1.2))); isr.setAttribute('x2', d.x(Math.min(nu, 1.2))); isr.setAttribute('y1', d.y(-0.2)); isr.setAttribute('y2', d.y(1));
      nk.setAttribute('cx', d.x(nu)); nk.setAttribute('cy', d.y(sinir((1 - nu) / 2, -0.2, 1)));
      oku({ 'upwind sayısal viskozitesi K': `${kisa(K, 1)} m²/s`, 'moleküler viskoziteye oranı': K > 0 ? `≈ ${kisa(K / 1.5e-5, 2)} kat` : 'negatif K → anti-difüzyon (kararsız)', '1 günde bulaşma √(2Kt)': K > 0 ? `≈ ${sy(Math.sqrt(2 * K * 86400) / 1000, 1)} km` : '—' });
    }
    for (const s of [sN, sC, sX]) s.inp.addEventListener('input', ciz);
    ciz();
  };

  /* genlik ve faz hızı – dalga sayısı */
  Sekil.m303b_faz = function (kap, ayar = {}) {
    const W = 640, H = 300, svg = svgYap(kap, W, H, 'Şemaların genlik ve faz hızı hatası: kısa dalgalar söner ya da geride kalır');
    const xt = [0, Math.PI / 2, Math.PI], xf = (v) => (v === 0 ? '0' : v < 2 ? 'π/2' : 'π');
    const A = eksen(svg, { W: 310, H, x: [0, Math.PI], y: [0, 1.2], xt, yt: [0, 0.5, 1], L: 44, R: 8, T: 50, B: 40, xf, yad: '|G| (genlik/adım)', xad: 'θ' });
    const B = eksen(svg, { W: 310, H, ox: 320, x: [0, Math.PI], y: [0, 1.6], xt, yt: [0, 0.5, 1, 1.5], L: 44, R: 8, T: 50, B: 40, xf, yad: 'c_sayısal / c', xad: 'θ' });
    const RENK = { upwind: 'var(--acc)', lax: 'var(--ikincil)', lw: 'var(--yesil)', leap: 'var(--tur)' }, AD = { upwind: 'upwind', lax: 'Lax', lw: 'LW', leap: 'leapfrog' };
    const pa = {}, pb = {};
    for (const s of Object.keys(RENK)) { pa[s] = el('path', { fill: 'none', stroke: RENK[s], 'stroke-width': 2.8, 'stroke-dasharray': s === 'leap' ? '2 4' : null }); pb[s] = el('path', { fill: 'none', stroke: RENK[s], 'stroke-width': 2.8, 'stroke-dasharray': s === 'leap' ? '2 4' : null }); svg.append(pa[s], pb[s]); }
    let lx = 50; for (const s of Object.keys(RENK)) { svg.append(el('line', { x1: lx, x2: lx + 18, y1: 14, y2: 14, stroke: RENK[s], 'stroke-width': 3, 'stroke-dasharray': s === 'leap' ? '2 4' : null })); yaz(svg, lx + 22, 18, AD[s], { k: 12 }); lx += 40 + AD[s].length * 7; }
    const k = kontrol(kap);
    const sN = surgu(k, 'ν', 0.05, 1, 0.01, ayar.nu ?? 0.5, (v) => sy(v, 2));
    const G = { upwind: (p, t) => [1 - p + p * Math.cos(t), -p * Math.sin(t)], lax: (p, t) => [Math.cos(t), -p * Math.sin(t)], lw: (p, t) => [1 - p * p * (1 - Math.cos(t)), -p * Math.sin(t)], leap: (p, t) => [Math.sqrt(Math.max(0, 1 - (p * Math.sin(t)) ** 2)), -p * Math.sin(t)] };
    function ciz() {
      const p = sN.v;
      for (const s of Object.keys(RENK)) {
        const a = [], b = [];
        for (let j = 1; j <= 160; j++) { const t = Math.PI * j / 160, z = G[s](p, t); a.push([A.x(t), A.y(sinir(Math.hypot(z[0], z[1]), 0, 1.2))]); const ph = Math.atan2(-z[1], z[0]); b.push([B.x(t), B.y(sinir(ph / (p * t), 0, 1.6))]); }
        pa[s].setAttribute('d', yol(a)); pb[s].setAttribute('d', yol(b));
      }
    }
    sN.inp.addEventListener('input', ciz); ciz();
  };

  /* ====================================================================== K11 · DALGA DENKLEMİ ==== */
  Sekil.m303b_tel = function (kap, ayar = {}) {
    const W = 640, H = 300, svg = svgYap(kap, W, H, 'Gergin tel elemanı: iki uçtaki gerilme kuvvetlerinin düşey bileşenleri farkı = kütle × ivme');
    const g = el('g'); svg.append(g);
    const k = kontrol(kap);
    const sE = surgu(k, 'eğrilik ∂²u/∂x²', -1, 1, 0.01, ayar.egrilik ?? 0.6, (v) => sy(v, 2));
    const oku = okuma(kap, ['sol uç açısı θ(x)', 'sağ uç açısı θ(x+Δx)', 'net düşey kuvvet ∝ T·∂²u/∂x²·Δx']);
    function ciz() {
      g.replaceChildren();
      const a = sE.v, x0 = 150, x1 = 490, ym = 170, S = 140;
      const u = (s) => a * S * 0.9 * (s - 0.5) ** 2 + 0.25 * S * (s - 0.5); // s ∈ [0,1]
      const up = (s) => (2 * a * S * 0.9 * (s - 0.5) + 0.25 * S) / (x1 - x0);
      const pts = []; for (let i = -12; i <= 112; i++) { const s = i / 100; pts.push([x0 + s * (x1 - x0), ym - u(s)]); }
      g.append(el('path', { d: yol(pts), stroke: 'var(--ikincil)', 'stroke-width': 2, fill: 'none', 'stroke-dasharray': '5 4' }));
      const pi = []; for (let i = 0; i <= 100; i++) { const s = i / 100; pi.push([x0 + s * (x1 - x0), ym - u(s)]); }
      g.append(el('path', { d: yol(pi), stroke: 'var(--yazi)', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }));
      const ucu = (s, yon) => { const X = x0 + s * (x1 - x0), Y = ym - u(s), m = up(s), L = 105, c = 1 / Math.sqrt(1 + m * m); const dx = yon * L * c, dy = -yon * L * m * c; ok(g, X, Y, X + dx, Y + dy, 'var(--acc)', 3); yaz(g, X + dx + (yon > 0 ? 6 : -6), Y + dy - 6, 'T', { h: yon > 0 ? 'start' : 'end', k: 15, b: true, r: 'var(--acc)' }); ok(g, X + dx, Y, X + dx, Y + dy, 'var(--tur)', 2, true); return { X, Y, m, dy }; };
      const A = ucu(0, -1), B = ucu(1, 1);
      yaz(g, A.X - 4, A.Y + 24, 'x', { h: 'middle', k: 13, b: true }); yaz(g, B.X + 4, B.Y + 24, 'x + Δx', { h: 'middle', k: 13, b: true });
      const net = -(A.dy + B.dy);
      if (Math.abs(net) > 3) ok(g, 320, ym - u(0.5) + (net > 0 ? -12 : 12), 320, ym - u(0.5) + (net > 0 ? -12 : 12) - sinir(net, -70, 70), 'var(--yesil)', 4);
      yaz(g, 330, ym - u(0.5) + (net > 0 ? 34 : -24), 'μΔx · ∂²u/∂t²', { k: 14, b: true, r: 'var(--yesil)' });
      yaz(g, 20, 24, 'Düşey: T sin θ(x + Δx) − T sin θ(x) = μΔx ∂²u/∂t²', { k: 14, b: true });
      yaz(g, 20, 44, 'küçük açı: sin θ ≈ tan θ = ∂u/∂x → T ∂²u/∂x² = μ ∂²u/∂t²', { k: 13, r: 'var(--ikincil)' });
      yaz(g, 20, 286, 'mavi: gerilme T (teğet) · turuncu kesikli: düşey bileşen · yeşil: net kuvvet', { k: 12, r: 'var(--ikincil)' });
      const deg = (m) => `${sy(Math.atan(m) * 180 / Math.PI, 1)}°`;
      oku({ 'sol uç açısı θ(x)': deg(up(0)), 'sağ uç açısı θ(x+Δx)': deg(up(1)), 'net düşey kuvvet ∝ T·∂²u/∂x²·Δx': a > 0 ? 'yukarı (tel yukarı ivmelenir)' : a < 0 ? 'aşağı' : 'sıfır (düz tel)' });
    }
    sE.inp.addEventListener('input', ciz); ciz();
  };

  Anim.m303b_dalga = function (kap, ayar = {}) {
    const W = 640, H = 320, svg = svgYap(kap, W, H, 'Dalga denkleminin açık şeması: puls ikiye ayrılır, ν > 1 olunca patlar');
    let mod = ayar.mod === 'puls' ? 1 : 0;
    const g = el('g'); svg.append(g);
    const k1 = kontrol(kap); const btn = dugme(k1, '▶ Oynat'); const tek = dugme(k1, 'Tek adım', true); const sifir = dugme(k1, '↺ Baştan', true);
    const sN = surgu(k1, 'ν = cΔt/Δx', 0.1, 1.2, 0.01, ayar.nu ?? 1, (v) => sy(v, 2));
    const k2 = kontrol(kap);
    secenek(k2, ['S41: 7 düğüm, u⁰ = [0,0,0,4,0,0,0]', '81 düğümlü tel, Gauss puls'], mod, (i) => { mod = i; kur(); });
    let unut = false;
    const ub = dugme(k2, 'ilk adımda ½ çarpanını unut', true);
    ub.addEventListener('click', () => { unut = !unut; ub.setAttribute('aria-pressed', String(unut)); ub.style.fontWeight = unut ? '700' : ''; kur(); });
    const oku = okuma(kap, ['adım n', 'en büyük |u|', 'değerler']);
    let u0, u1, n, birik = 0;
    const f0 = (x) => Math.exp(-300 * (x - 0.5) ** 2);
    const tamU = (x, t) => { const F = (z) => { const m = ((z % 2) + 2) % 2; return m <= 1 ? f0(m) : -f0(2 - m); }; return 0.5 * (F(x - t) + F(x + t)); };
    function kur() {
      n = 0;
      u0 = mod ? Array.from({ length: 81 }, (_, i) => (i === 0 || i === 80 ? 0 : f0(i / 80))) : [0, 0, 0, 4, 0, 0, 0];
      u1 = null; ciz();
    }
    function adim() {
      const v2 = sN.v ** 2, m = u0.length;
      if (!u1) { u1 = u0.map((v, i) => (i === 0 || i === m - 1 ? 0 : v + (unut ? 1 : 0.5) * v2 * (u0[i + 1] - 2 * v + u0[i - 1]))); }
      else { const u2 = u1.map((v, i) => (i === 0 || i === m - 1 ? 0 : 2 * v - u0[i] + v2 * (u1[i + 1] - 2 * v + u1[i - 1]))); u0 = u1; u1 = u2; }
      n++; ciz();
    }
    function ciz() {
      g.replaceChildren();
      const u = u1 || u0, m = u.length, ymin = mod ? -1.2 : -5, ymax = mod ? 1.2 : 5;
      const d = eksen(g, { W, H, x: [0, mod ? 1 : 6], y: [ymin, ymax], xt: mod ? [0, 0.25, 0.5, 0.75, 1] : [0, 1, 2, 3, 4, 5, 6], yt: mod ? [-1, 0, 1] : [-4, -2, 0, 2, 4], L: 50, R: 16, T: 34, B: 40, xad: mod ? 'x' : 'düğüm i', yad: 'u', T: 46 });
      const X = (i) => d.x(mod ? i / 80 : i);
      if (mod) { const nu = sN.v, t = n * nu / 80, p = []; for (let i = 0; i <= 320; i++) { const x = i / 320; p.push([d.x(x), d.y(tamU(x, t))]); } g.append(el('path', { d: yol(p), stroke: 'var(--yazi)', 'stroke-dasharray': '6 5', fill: 'none', 'stroke-width': 2 })); }
      g.append(el('path', { d: yol(u.map((v, i) => [X(i), d.y(sinir(v, ymin, ymax))])), stroke: 'var(--acc)', 'stroke-width': 3, fill: 'none' }));
      if (!mod) u.forEach((v, i) => { nokta(g, X(i), d.y(sinir(v, ymin, ymax)), 6, 'var(--acc)'); yaz(g, X(i), d.y(sinir(v, ymin, ymax)) - 12, sy(v, Math.abs(v) < 100 ? 2 : 0), { h: 'middle', k: 12.5, b: true }); });
      const mx = Math.max(...u.map(Math.abs));
      yaz(g, 62, 16, `n = ${n} · ν = ${sy(sN.v, 2)}${unut ? ' · ½ unutuldu (yanlış başlangıç)' : ''}${mod ? ' · kesikli: d\'Alembert tam çözümü' : ''}`, { k: 13.5, b: true, r: unut ? 'var(--tur)' : 'var(--yazi)' });
      oku({ 'adım n': String(n), 'en büyük |u|': kisa(mx, 3), değerler: mod ? (sN.v > 1 ? 'ν > 1 → CFL bozuk' : 'puls ikiye ayrılıp duvardan ters dönerek yansır') : u.map((v) => sy(v, 2)).join(', ') });
    }
    const oyn = dongu(btn, (dt) => { birik += dt; const ad = mod ? 0.04 : 0.6; if (birik > ad) { birik = 0; if (n >= (mod ? 400 : 12) || Math.max(...(u1 || u0).map(Math.abs)) > 1e6) return false; adim(); } });
    tek.addEventListener('click', () => { oyn.dur(); adim(); });
    sifir.addEventListener('click', () => { oyn.dur(); kur(); });
    sN.inp.addEventListener('input', () => { oyn.dur(); kur(); });
    kur();
    return { dur: oyn.dur };
  };

  /* ====================================================================== K12 · BURGERS / MODEL DENKLEM ==== */
  const bu0 = (x) => 1 + 0.5 * Math.sin(2 * Math.PI * x);
  Sekil.m303b_burgers = function (kap, ayar = {}) {
    const W = 640, H = 330, svg = svgYap(kap, W, H, 'Viskozsuz Burgers: hızlı karakteristikler yavaşlara yetişir, kesiştikleri anda şok oluşur');
    const d = eksen(svg, { W, H, x: [0, 1.5], y: [0, 0.6], xt: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5], yt: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6], L: 52, R: 16, T: 96, B: 42, xad: 'x', yad: 't' });
    const tY = 1 / Math.PI;
    const g = el('g'); svg.append(g);
    for (let i = 0; i <= 40; i++) { const x0 = i / 40, u = bu0(x0), x1 = x0 + u * 0.6; g.append(el('line', { x1: d.x(x0), y1: d.y(0), x2: d.x(Math.min(x1, 1.5)), y2: d.y(Math.min(0.6, (Math.min(x1, 1.5) - x0) / u)), stroke: u > 1 ? 'var(--tur)' : 'var(--acc)', 'stroke-width': 1.4, opacity: 0.75 })); }
    svg.append(el('line', { x1: d.x(0), x2: d.x(1.5), y1: d.y(tY), y2: d.y(tY), stroke: 'var(--yazi)', 'stroke-width': 2, 'stroke-dasharray': '6 4' }));
    yaz(svg, d.x(1.5) - 4, d.y(tY) - 6, 't* = 1/π ≈ 0.318: ilk kesişme = şok', { h: 'end', k: 13, b: true });
    const p = []; for (let i = 0; i <= 200; i++) { const x = i / 200; p.push([d.x(x), d.y(0.6) - 26 - 22 * (bu0(x) - 1)]); }
    svg.append(el('path', { d: yol(p), stroke: 'var(--tur)', 'stroke-width': 3, fill: 'none' }));
    yaz(svg, d.x(1.02), d.y(0.6) - 12, 'u₀(x) = 1 + 0.5 sin 2πx', { k: 13, b: true, r: 'var(--tur)' });
    yaz(svg, 56, 18, 'Karakteristik: dx/dt = u₀(x₀) → büyük u (turuncu) hızlı, küçük u (mavi) yavaş', { k: 13.5, b: true });
    yaz(svg, 56, 36, 'Kesişme zamanı t* = −1 / min u₀′(x) = 1/(0.5·2π)', { k: 13, r: 'var(--ikincil)' });
  };

  function modelAdim(u, dx, dt, al, be, mu) {
    const n = u.length;
    const L = (v) => {
      const sl = v.map((_, i) => { const a = v[i] - v[(i - 1 + n) % n], b = v[(i + 1) % n] - v[i]; return a * b <= 0 ? 0 : Math.abs(a) < Math.abs(b) ? a : b; });
      const fl = new Array(n);
      for (let i = 0; i < n; i++) { const ip = (i + 1) % n, uL = v[i] + 0.5 * sl[i], uR = v[ip] - 0.5 * sl[ip]; const FL = al * uL + be * uL * uL / 2, FR = al * uR + be * uR * uR / 2, a = Math.max(Math.abs(al + be * uL), Math.abs(al + be * uR)); fl[i] = 0.5 * (FL + FR) - 0.5 * a * (uR - uL); }
      return v.map((_, i) => { const im = (i - 1 + n) % n, ip = (i + 1) % n; return -(fl[i] - fl[im]) / dx + mu * (v[ip] - 2 * v[i] + v[im]) / (dx * dx); });
    };
    const k1 = L(u), u1 = u.map((v, i) => v + dt * k1[i]), k2 = L(u1);
    return u.map((v, i) => 0.5 * v + 0.5 * (u1[i] + dt * k2[i]));
  }
  Anim.m303b_burgers = function (kap, ayar = {}) {
    const W = 640, H = 320, svg = svgYap(kap, W, H, 'Model denklem u_t + (α + βu)u_x = μu_xx: dört özel durum');
    const N = 200, dx = 1 / N, xs = Array.from({ length: N }, (_, i) => (i + 0.5) * dx);
    const d = eksen(svg, { W, H, x: [0, 1], y: [0.3, 1.7], xt: [0, 0.25, 0.5, 0.75, 1], yt: [0.5, 1, 1.5], L: 50, R: 14, T: 58, B: 40, xad: 'x (periyodik)', yad: 'u' });
    const p0 = el('path', { stroke: 'var(--ikincil)', 'stroke-dasharray': '4 4', fill: 'none' }); svg.append(p0);
    const pk = el('path', { stroke: 'var(--yazi)', 'stroke-dasharray': '6 5', 'stroke-width': 2, fill: 'none' }); svg.append(pk);
    const pu = el('path', { stroke: 'var(--tur)', 'stroke-width': 3.2, fill: 'none' }); svg.append(pu);
    const bas = yaz(svg, 54, 16, '', { k: 13.5, b: true });
    const alt = yaz(svg, 54, 33, '', { k: 12.5, r: 'var(--ikincil)' });
    const k1 = kontrol(kap); const btn = dugme(k1, '▶ Oynat'); const sifir = dugme(k1, '↺ Baştan', true);
    const sM = surgu(k1, 'μ', 0, 0.02, 0.0005, ayar.mu ?? 0.005, (v) => sy(v, 4));
    const k2 = kontrol(kap);
    const DUR = [['(a) doğrusal adveksiyon', 1, 0, 0], ['(b) difüzyon / ısı', 0, 0, 0.01], ['(c) viskoz Burgers', 0, 1, null], ['(d) viskozsuz Burgers', 0, 1, 0]];
    let dur = ayar.durum ?? 3;
    secenek(k2, DUR.map((x) => x[0]), dur, (i) => { dur = i; if (DUR[i][3] !== null) sM.set(DUR[i][3]); else if (sM.v === 0) sM.set(0.005); kur(); });
    const oku = okuma(kap, ['t', 'en dik eğim |∂u/∂x|', 'kütle ∫u dx']);
    let u, t, birik = 0;
    function kur() { u = xs.map(bu0); t = 0; p0.setAttribute('d', yol(xs.map((x, i) => [d.x(x), d.y(u[i])]))); ciz(); }
    function ilerle(T) {
      const [, al, be] = DUR[dur], mu = sM.v;
      while (t < T - 1e-12) {
        const amax = Math.max(...u.map((v) => Math.abs(al + be * v)), 1e-6);
        let dt = Math.min(0.4 * dx / amax, mu > 0 ? 0.4 * dx * dx / mu : 1, T - t);
        u = modelAdim(u, dx, dt, al, be, mu); t += dt;
      }
    }
    function ciz() {
      const [ad, al, be] = DUR[dur], mu = sM.v;
      pu.setAttribute('d', yol(xs.map((x, i) => [d.x(x), d.y(sinir(u[i], 0.3, 1.7))])));
      if (be === 1 && mu === 0 && t < 1 / Math.PI) {
        const ex = xs.map((x) => { let z = x; for (let j = 0; j < 40; j++) { const f = z + bu0(z) * t - x, fp = 1 + 2 * Math.PI * 0.5 * Math.cos(2 * Math.PI * z) * t; z -= f / fp; } return bu0(z); });
        pk.setAttribute('d', yol(xs.map((x, i) => [d.x(x), d.y(ex[i])])));
      } else if (be === 0 && mu === 0) pk.setAttribute('d', yol(xs.map((x) => [d.x(x), d.y(bu0(((x - al * t) % 1 + 1) % 1))])));
      else pk.setAttribute('d', '');
      bas.textContent = `${ad}: α = ${al}, β = ${be}, μ = ${sy(mu, 4)}`;
      alt.textContent = be === 1 ? (mu === 0 ? 'hız = u: tepe hızlı, çukur yavaş → cephe dikleşir → t* ≈ 0.318\'de şok' : 'viskozite dikleşmeyi yayar: sonlu kalınlıkta cephe') : al ? 'profil şeklini bozmadan kayar (kesikli: tam çözüm)' : 'eğrilik kadar söner, ortalamaya (u = 1) yaklaşır';
      let eg = 0; for (let i = 0; i < N; i++) eg = Math.max(eg, Math.abs(u[(i + 1) % N] - u[i]) / dx);
      oku({ t: sy(t, 3), 'en dik eğim |∂u/∂x|': sy(eg, 2), 'kütle ∫u dx': sy(u.reduce((a, b) => a + b, 0) * dx, 5) });
    }
    const oyn = dongu(btn, (dt) => { birik += dt; if (birik > 0.04) { birik = 0; if (t >= 1.2) return false; ilerle(t + 0.01); ciz(); } });
    sifir.addEventListener('click', () => { oyn.dur(); kur(); });
    sM.inp.addEventListener('input', () => { oyn.dur(); kur(); });
    kur();
    return { dur: oyn.dur };
  };

  /* adveksiyon–difüzyon FTCS kararlılık haritası (ν, d) */
  Sekil.m303b_advdif = function (kap, ayar = {}) {
    const W = 640, H = 330, svg = svgYap(kap, W, H, 'Adveksiyon–difüzyon FTCS: kararlılık bölgesi d ≤ 1/2 ve ν² ≤ 2d');
    const d = eksen(svg, { W, H, x: [0, 1.2], y: [0, 0.7], xt: [0, 0.25, 0.5, 0.75, 1, 1.2], yt: [0, 0.1, 0.25, 0.5, 0.7], L: 56, R: 200, T: 28, B: 42, xad: 'ν = cΔt/Δx', yad: 'd = μΔt/Δx²' });
    const kar = []; for (let i = 0; i <= 100; i++) { const v = i / 100; kar.push([d.x(v), d.y(v * v / 2)]); }
    svg.append(el('path', { d: `${yol(kar)} L${d.x(1)},${d.y(0.5)} L${d.x(0)},${d.y(0.5)} Z`, fill: 'var(--yesil-zemin)', stroke: 'var(--yesil)', 'stroke-width': 2 }));
    svg.append(el('path', { d: yol([[d.x(0), d.y(0)], [d.x(1), d.y(0.5)]]), stroke: 'var(--acc)', 'stroke-width': 2.5, 'stroke-dasharray': '7 4', fill: 'none' }));
    yaz(svg, d.x(0.08), d.y(0.42), 'kararlı bölge', { k: 13, b: true, r: 'var(--yesil)' });
    yaz(svg, d.x(0.62), d.y(0.2), 'kesikli: d = ν/2', { k: 12, r: 'var(--acc)' }); yaz(svg, d.x(0.62), d.y(0.2) + 15, '(hücre Pe = 2)', { k: 12, r: 'var(--acc)' });
    const nk = nokta(svg, 0, 0, 8, 'var(--tur)');
    const sag = el('g'); svg.append(sag);
    const k = kontrol(kap);
    let P = ayar.nokta || [0.5, 0.25];
    secenek(k, ['S43: ν = 0.5, d = 0.25', 'FTCS adveksiyon (d = 0)', 'ısı (ν = 0, d = 0.4)', 'd = 0.6', 'ν = 0.8, d = 0.2'], 0, (i) => { P = [[0.5, 0.25], [0.5, 0], [0, 0.4], [0.3, 0.6], [0.8, 0.2]][i]; ciz(); });
    svg.addEventListener('pointerdown', (ev) => { const q = svgNokta(svg, ev); if (!q) return; const nu = (q.x - d.x(0)) / (d.x(1.2) - d.x(0)) * 1.2, dd = (d.y(0) - q.y) / (d.y(0) - d.y(0.7)) * 0.7; if (nu >= 0 && nu <= 1.2 && dd >= 0 && dd <= 0.7) { P = [nu, dd]; ciz(); } });
    function ciz() {
      const [nu, dd] = P;
      nk.setAttribute('cx', d.x(nu)); nk.setAttribute('cy', d.y(dd));
      let mx = 0; for (let j = 0; j <= 360; j++) { const t = Math.PI * j / 360; mx = Math.max(mx, Math.hypot(1 - 2 * dd * (1 - Math.cos(t)), nu * Math.sin(t))); }
      const kat = [dd + nu / 2, 1 - 2 * dd, dd - nu / 2];
      sag.replaceChildren();
      const x0 = W - 190;
      const sat = [[`ν = ${sy(nu, 3)} · d = ${sy(dd, 3)}`, 'var(--yazi)', true], [`max |G| = ${sy(mx, 4)}`, mx <= 1 + 1e-9 ? 'var(--yesil)' : 'var(--tur)', true], [mx <= 1 + 1e-9 ? 'kararlı' : 'KARARSIZ', mx <= 1 + 1e-9 ? 'var(--yesil)' : 'var(--tur)', true], ['katsayılar:', 'var(--yazi)', false], [`uᵢ₋₁: d + ν/2 = ${sy(kat[0], 3)}`, 'var(--ikincil)', false], [`uᵢ:   1 − 2d = ${sy(kat[1], 3)}`, kat[1] < -1e-9 ? 'var(--tur)' : 'var(--ikincil)', false], [`uᵢ₊₁: d − ν/2 = ${sy(kat[2], 3)}`, kat[2] < -1e-9 ? 'var(--tur)' : 'var(--ikincil)', false], [`hücre Pe = ν/d = ${dd > 0 ? sy(nu / dd, 2) : '∞'}`, 'var(--yazi)', false], [kat[2] < -1e-9 ? 'Pe > 2: komşu katsayısı < 0' : kat[2] < 1e-9 && nu > 0 ? 'Pe = 2: tam upwind!' : 'Pe < 2: salınımsız', kat[2] < -1e-9 ? 'var(--tur)' : 'var(--yesil)', false]];
      sat.forEach(([s, r, b], i) => yaz(sag, x0, 44 + i * 25, s, { k: 13, r, b }));
    }
    ciz();
  };

  /* ====================================================================== K13 · FDM / FVM / FEM ==== */
  Sekil.m303b_yontemler = function (kap, ayar = {}) {
    const W = 640, H = 300, svg = svgYap(kap, W, H, 'Üç ayrıklaştırma yöntemi: sonlu fark, sonlu hacim, sonlu eleman');
    const pan = [el('g'), el('g'), el('g')]; pan.forEach((p) => svg.append(p));
    const bas = [['FDM · sonlu fark', 'türev ≈ nokta farkı (Taylor)', 'düzgün ızgara · WRF'], ['FVM · sonlu hacim', 'giren akı − çıkan akı = birikme', 'korunumlu · OpenFOAM'], ['FEM · sonlu eleman', 'eleman + şekil fonksiyonu', 'karmaşık geometri · yapı']];
    bas.forEach((b, i) => { kutu(pan[i], 8 + i * 210, 8, 200, 284, { rx: 12 }); yaz(pan[i], 108 + i * 210, 32, b[0], { h: 'middle', k: 14, b: true }); yaz(pan[i], 108 + i * 210, 252, b[1], { h: 'middle', k: 12 }); yaz(pan[i], 108 + i * 210, 272, b[2], { h: 'middle', k: 12, r: 'var(--ikincil)' }); });
    // FDM
    for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) nokta(pan[0], 38 + i * 35, 70 + j * 36, 4, 'var(--ikincil)');
    const fx = 38 + 2 * 35, fy = 70 + 2 * 36;
    for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { pan[0].append(el('line', { x1: fx, y1: fy, x2: fx + a * 35, y2: fy + b * 36, stroke: 'var(--acc)', 'stroke-width': 3 })); nokta(pan[0], fx + a * 35, fy + b * 36, 6, 'var(--acc)'); }
    nokta(pan[0], fx, fy, 7, 'var(--tur)'); yaz(pan[0], fx + 8, fy - 8, 'i, j', { k: 12, b: true });
    // FVM
    const vx = 268, vy = 80, s = 120;
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) if (Math.abs(i) + Math.abs(j) === 1) kutu(pan[1], vx + i * s / 2.2 + 10, vy + j * s / 2.2 + 10, s / 2.2 - 4, s / 2.2 - 4, { f: 'var(--zemin)', rx: 3 });
    kutu(pan[1], vx + 10, vy + 10, s / 2.2 - 4, s / 2.2 - 4, { f: 'var(--acc-zemin)', s: 'var(--acc)', rx: 3, w: 2.5 });
    const c0 = [vx + 10 + (s / 2.2 - 4) / 2, vy + 10 + (s / 2.2 - 4) / 2], hw = (s / 2.2 - 4) / 2;
    ok(pan[1], c0[0] - hw - 26, c0[1], c0[0] - hw + 6, c0[1], 'var(--tur)', 2.5); ok(pan[1], c0[0] + hw - 6, c0[1], c0[0] + hw + 26, c0[1], 'var(--tur)', 2.5);
    ok(pan[1], c0[0], c0[1] + hw + 26, c0[0], c0[1] + hw - 6, 'var(--tur)', 2.5); ok(pan[1], c0[0], c0[1] - hw + 6, c0[0], c0[1] - hw - 26, 'var(--tur)', 2.5);
    nokta(pan[1], c0[0], c0[1], 5, 'var(--acc)'); yaz(pan[1], 318, 228, 'turuncu: yüzey akıları', { h: 'middle', k: 11.5, r: 'var(--tur)' });
    // FEM
    const P = [[440, 70], [500, 60], [565, 80], [450, 130], [510, 120], [575, 140], [455, 190], [520, 180], [585, 205], [480, 225]];
    const T = [[0, 1, 4], [0, 4, 3], [1, 2, 5], [1, 5, 4], [3, 4, 7], [3, 7, 6], [4, 5, 8], [4, 8, 7], [6, 7, 9]];
    T.forEach((tr_) => { const sh = tr_.includes(4); pan[2].append(el('path', { d: yol(tr_.map((i) => P[i])) + 'Z', fill: sh ? 'var(--acc-zemin)' : 'var(--zemin)', stroke: 'var(--ikincil)', 'stroke-width': 1.3 })); });
    P.forEach((p, i) => nokta(pan[2], p[0], p[1], i === 4 ? 6.5 : 3.5, i === 4 ? 'var(--tur)' : 'var(--ikincil)'));
    pan[2].append(el('path', { d: 'M432,60 Q420,150 452,236', stroke: 'var(--yazi)', 'stroke-width': 3, fill: 'none' }));
    yaz(pan[2], 542, 228, 'mavi: düğümün şapka fonksiyonu', { h: 'middle', k: 10.5, r: 'var(--acc)' });
    const vurgu = (i) => pan.forEach((p, j) => p.setAttribute('opacity', i == null || i === j ? 1 : 0.3));
    const k = kontrol(kap);
    secenek(k, ['hepsi', 'FDM', 'FVM', 'FEM'], ayar.adim == null ? 0 : ayar.adim + 1, (i) => vurgu(i ? i - 1 : null));
    vurgu(ayar.adim ?? null);
  };

  /* ====================================================================== DNS · LES · RANS ==== */
  Sekil.m303b_tayf = function (kap, ayar = {}) {
    const W = 640, H = 330, svg = svgYap(kap, W, H, 'Türbülans enerji tayfı: DNS, LES ve RANS hangi ölçekleri çözer, hangilerini modeller');
    const d = eksen(svg, { W, H, xlog: true, ylog: true, x: [0.1, 1e7], y: [1e-12, 10], xt: [0.1, 10, 1e3, 1e5, 1e7], yt: [1e-12, 1e-8, 1e-4, 1], L: 58, R: 16, T: 70, B: 42, xf: (v) => (v === 0.1 ? '0.1' : us10(Math.round(Math.log10(v)))), yf: (v) => (v === 1 ? '1' : us10(Math.round(Math.log10(v)))), xad: 'dalga sayısı k (girdap boyu ∝ 1/k)', yad: 'E(k)' });
    const cozuk = el('path', { fill: 'var(--acc-zemin)', stroke: 'none' }), model = el('path', { fill: 'var(--tur-zemin)', stroke: 'none' });
    svg.append(cozuk, model);
    const eg = el('path', { fill: 'none', stroke: 'var(--yazi)', 'stroke-width': 3 }); svg.append(eg);
    const kesL = el('line', { stroke: 'var(--acc)', 'stroke-width': 2, 'stroke-dasharray': '6 4' }), kesE = el('line', { stroke: 'var(--tur)', 'stroke-width': 2, 'stroke-dasharray': '6 4' });
    svg.append(kesL, kesE);
    const e1 = yaz(svg, 0, 0, '', { k: 12, b: true, r: 'var(--acc)' }), e2 = yaz(svg, 0, 0, '', { k: 12, b: true, r: 'var(--tur)' });
    const bas = yaz(svg, 60, 18, '', { k: 14, b: true }), bas2 = yaz(svg, 60, 36, '', { k: 12.5, r: 'var(--ikincil)' });
    const k = kontrol(kap);
    const sR = surgu(k, 'Re', 3, 9, 0.1, ayar.logRe ?? 6, (v) => kisa(10 ** v, 1));
    const k2 = kontrol(kap);
    let yk = ['dns', 'les', 'rans'].indexOf(ayar.yaklasim ?? 'les'); if (yk < 0) yk = 1;
    secenek(k2, ['DNS', 'LES', 'RANS'], yk, (i) => { yk = i; ciz(); });
    const oku = okuma(kap, ['Kolmogorov ölçeği k_η ≈ Re^(3/4)', 'DNS nokta sayısı ≈ Re^(9/4)', 'yorum']);
    function ciz() {
      const Re = 10 ** sR.v, ke = Re ** 0.75, kD = 30;
      const E = (q) => (q ** 4 / (1 + q * q) ** (17 / 6)) * Math.exp(-1.5 * (q / ke) ** (4 / 3));
      const pts = []; for (let i = 0; i <= 300; i++) { const q = 10 ** (-1 + 8 * i / 300), v = E(q); if (v > 1e-12) pts.push([q, v]); }
      eg.setAttribute('d', yol(pts.map(([q, v]) => [d.x(q), d.y(v)])));
      const alan = (a, b) => { const p = pts.filter(([q]) => q >= a && q <= b); if (p.length < 2) return ''; return yol(p.map(([q, v]) => [d.x(q), d.y(v)])) + `L${d.x(p[p.length - 1][0])},${d.y(1e-12)} L${d.x(p[0][0])},${d.y(1e-12)} Z`; };
      const sinirK = yk === 0 ? 1e9 : yk === 1 ? kD : 0.1;
      cozuk.setAttribute('d', alan(0.1, sinirK)); model.setAttribute('d', alan(sinirK, 1e9));
      const hat = (l, x) => { l.setAttribute('x1', d.x(x)); l.setAttribute('x2', d.x(x)); l.setAttribute('y1', d.y(1e-12)); l.setAttribute('y2', d.y(10)); };
      hat(kesE, Math.min(ke, 1e7)); e2.setAttribute('x', d.x(Math.min(ke, 1e7)) - 4); e2.setAttribute('y', d.y(10) + 14); e2.setAttribute('text-anchor', 'end'); e2.textContent = 'k_η (Kolmogorov)';
      if (yk === 1) { hat(kesL, kD); e1.setAttribute('x', d.x(kD) + 4); e1.setAttribute('y', d.y(10) + 14); e1.textContent = 'LES süzgeci k_Δ'; } else { kesL.setAttribute('x1', -10); kesL.setAttribute('x2', -10); e1.textContent = ''; }
      bas.textContent = ['DNS: bütün ölçekler ÇÖZÜLÜR (mavi), model yok', 'LES: büyük girdaplar çözülür (mavi), küçükler alt-ızgara modeli (turuncu)', 'RANS: yalnız ortalama akış; bütün türbülans MODELLENİR (turuncu)'][yk];
      bas2.textContent = ['en pahalı · araştırma, düşük Re', 'orta maliyet · Smagorinsky: ν_t = (C_s Δ)² |S| · WRF-LES', 'en ucuz · kapanış problemi · WRF PBL şemaları'][yk];
      const nDNS = Re ** 2.25;
      oku({ 'Kolmogorov ölçeği k_η ≈ Re^(3/4)': kisa(ke, 0), 'DNS nokta sayısı ≈ Re^(9/4)': kisa(nDNS, 1), yorum: nDNS > 1e13 ? 'bugünkü en büyük bilgisayarların çok ötesi' : nDNS > 1e9 ? 'süper bilgisayar işi' : 'iş istasyonunda yapılabilir' });
    }
    sR.inp.addEventListener('input', ciz); ciz();
  };

  /* ====================================================================== SINIR KOŞULLARI ==== */
  Sekil.m303b_sinir = function (kap, ayar = {}) {
    const W = 640, H = 300, svg = svgYap(kap, W, H, 'Sınır koşulu türleri: Dirichlet, Neumann (hayali nokta), periyodik, kaymazlık, serbest çıkış');
    const g = el('g'); svg.append(g);
    const TUR = ['Dirichlet', 'Neumann (hayali nokta)', 'periyodik', 'kaymazlık (no-slip)', 'serbest çıkış'];
    let s = Math.max(0, ['dirichlet', 'neumann', 'periyodik', 'noslip', 'cikis'].indexOf(ayar.tur ?? 'dirichlet'));
    const k = kontrol(kap);
    secenek(k, TUR, s, (i) => { s = i; ciz(); });
    const sira = (x0, y0, n, ad, f) => { for (let i = 0; i < n; i++) { const X = x0 + i * 80; g.append(el('line', { x1: X, x2: X + 80, y1: y0, y2: y0, stroke: 'var(--cizgi)', 'stroke-width': i < n - 1 ? 2 : 0 })); const o = f(i); nokta(g, X, y0, o.r || 9, o.c || 'var(--acc)'); yaz(g, X, y0 + 30, ad(i), { h: 'middle', k: 13, r: 'var(--ikincil)' }); if (o.t) yaz(g, X + (o.dx || 0), y0 - (o.dy || 18), o.t, { h: 'middle', k: 13, b: true, r: o.c }); } };
    function ciz() {
      g.replaceChildren();
      if (s === 0) {
        g.append(el('rect', { x: 94, y: 110, width: 12, height: 60, fill: 'var(--tur)' }));
        sira(120, 140, 6, (i) => `i = ${i}`, (i) => (i === 0 ? { c: 'var(--tur)', t: 'T₀ = 100 (bilinen)', dy: 48, dx: 20 } : { c: 'var(--acc)', t: i < 5 ? `T${['₁', '₂', '₃', '₄'][i - 1]} ?` : '' }));
        yaz(g, 20, 30, 'Dirichlet: sınırda DEĞER verilir (sabit sıcaklık, duvarda u = 0)', { k: 15, b: true });
        yaz(g, 20, 240, 'Kapalı yöntemde i = 1 denklemi: (1 + 2λ)T₁ − λT₂ = T₁(eski) + λT₀  → bilinen T₀ sağ tarafa (S28)', { k: 12.5 });
        yaz(g, 20, 262, 'Örnek: levhanın 75 °C kenarı (S45a), cavity duvarı U = (0 0 0), kapak U = (1 0 0)', { k: 12.5, r: 'var(--ikincil)' });
      } else if (s === 1) {
        g.append(el('line', { x1: 200, x2: 200, y1: 70, y2: 210, stroke: 'var(--yazi)', 'stroke-width': 4 })); yaz(g, 206, 82, 'yalıtılmış kenar', { k: 12, r: 'var(--ikincil)' });
        sira(120, 150, 5, (i) => (i === 0 ? 'i = −1 (hayali)' : `i = ${i - 1}`), (i) => (i === 0 ? { c: 'var(--ikincil)', r: 8, t: 'T₋₁' } : i === 2 ? { c: 'var(--tur)', t: 'T₁' } : { c: 'var(--acc)', t: i === 1 ? 'T₀ ?' : '' }));
        g.append(el('path', { d: 'M280,118 Q200,80 120,118', stroke: 'var(--tur)', 'stroke-width': 2, fill: 'none', 'stroke-dasharray': '5 4' }));
        yaz(g, 20, 30, 'Neumann: sınırda TÜREV verilir (yalıtım ∂T/∂n = 0, çıkışta ∂u/∂x = 0)', { k: 15, b: true });
        yaz(g, 20, 240, 'Merkezi fark: (T₁ − T₋₁)/(2Δx) = 0 → T₋₁ = T₁ (ayna). T₀ artık bilinmeyen.', { k: 12.5 });
        yaz(g, 20, 262, 'Laplace (0, j)\'de: 2T₁,ⱼ + T₀,ⱼ₊₁ + T₀,ⱼ₋₁ − 4T₀,ⱼ = 0 (S23) · OpenFOAM: zeroGradient', { k: 12.5, r: 'var(--ikincil)' });
      } else if (s === 2) {
        const cx = 320, cy = 145, R = 78;
        g.append(el('circle', { cx, cy, r: R, fill: 'none', stroke: 'var(--cizgi)', 'stroke-width': 3 }));
        for (let i = 0; i < 12; i++) { const a = -Math.PI / 2 + i * Math.PI / 6; nokta(g, cx + R * Math.cos(a), cy + R * Math.sin(a), i === 0 ? 9 : 6, i === 0 ? 'var(--tur)' : 'var(--acc)'); }
        yaz(g, cx, cy - R - 16, 'u₀ = u_N  (0° = 360°)', { h: 'middle', k: 13, b: true, r: 'var(--tur)' });
        ok(g, cx + R + 26, cy - 30, cx + R + 26, cy + 30, 'var(--acc)', 2.5); yaz(g, cx + R + 34, cy + 4, 'sağdan çıkan soldan girer', { k: 12.5, r: 'var(--acc)' });
        yaz(g, 20, 30, 'Periyodik: alanın iki ucu aynı nokta', { k: 15, b: true });
        yaz(g, 20, 262, 'Örnek: Dünya çevresinde boylam yönü (S45e) · adveksiyon testlerinde puls tur atar', { k: 12.5, r: 'var(--ikincil)' });
      } else if (s === 3) {
        kutu(g, 200, 70, 240, 170, { f: 'var(--zemin)', s: 'var(--yazi)', w: 3, rx: 2 });
        ok(g, 230, 58, 410, 58, 'var(--tur)', 3); yaz(g, 320, 50, 'kapak: U = (1 0 0)', { h: 'middle', k: 13, b: true, r: 'var(--tur)' });
        for (let j = 0; j < 7; j++) { const y = 80 + j * 24, u = Math.max(-0.35, 1 - 2.4 * (j / 6) + 1.1 * (j / 6) ** 2) * (j === 0 ? 1 : 0.8); if (Math.abs(u) > 0.04) ok(g, 230, y, 230 + 150 * u, y, 'var(--acc)', 2); }
        yaz(g, 450, 120, 'duvarda akışkan hızı', { k: 12.5 }); yaz(g, 450, 138, '= duvarın hızı', { k: 12.5 });
        yaz(g, 20, 30, 'Kaymazlık (no-slip): duvara değen akışkan duvarla aynı hızda', { k: 15, b: true });
        yaz(g, 20, 262, 'Hız için Dirichlet; basınç için çoğunlukla zeroGradient (Neumann) · 2B: ön/arka «empty»', { k: 12.5, r: 'var(--ikincil)' });
      } else {
        sira(120, 150, 6, (i) => ['N', 'N+1', 'N+2 (x = 1)', 'N+3 (hayali)', '', ''][i] || '', (i) => (i > 3 ? { r: 0 } : i === 3 ? { c: 'var(--ikincil)', t: 'u(N+3)' } : i === 1 ? { c: 'var(--tur)', t: 'u(N+1)' } : { c: 'var(--acc)' }));
        g.append(el('path', { d: 'M200,118 Q280,80 360,118', stroke: 'var(--tur)', 'stroke-width': 2, fill: 'none', 'stroke-dasharray': '5 4' }));
        yaz(g, 20, 30, 'Serbest çıkış (advection.m): u(N+3) = u(N+1) → x = 1\'de eğim sıfır', { k: 15, b: true });
        yaz(g, 20, 240, 'Girişte de u(1) = u(3): x = 0\'da eğim sıfır. Hayali noktalar ızgaranın dışındadır.', { k: 12.5 });
        yaz(g, 20, 262, 'Puls dışarı çıkarken yansımasın diye türev koşulu (Neumann tipi) kullanılır (S34c, S45c)', { k: 12.5, r: 'var(--ikincil)' });
      }
    }
    ciz();
  };

  /* ====================================================================== K14 · OPENFOAM ==== */
  Sekil.m303b_foam = function (kap, ayar = {}) {
    const W = 640, H = 330, svg = svgYap(kap, W, H, 'OpenFOAM vaka klasörü: 0, constant, system ve komut sırası');
    const ACK = {
      '0/U': 'Başlangıç + sınır hız alanı: movingWall (1 0 0), fixedWalls noSlip, frontAndBack empty.',
      '0/p': 'Kinematik basınç p/ρ (m²/s²); duvarlarda zeroGradient.',
      transportProperties: 'Fiziksel sabit: nu = 0.01 m²/s (kinematik viskozite) → Re = UL/ν = 10.',
      'polyMesh/': 'blockMesh\'in ürettiği ağ: points, faces, owner, neighbour, boundary.',
      blockMeshDict: 'Ağ tarifi: köşe noktaları, blok (20 × 20 × 1), sınır yüzey adları.',
      controlDict: 'Zaman kontrolü: application, endTime 0.5, deltaT 0.005, writeInterval 20 (S47).',
      fvSchemes: 'Ayrıklaştırma: ddt Euler, grad Gauss linear, div Gauss linear, laplacian.',
      fvSolution: 'Doğrusal çözücüler: p → PCG, U → smoothSolver + symGaussSeidel; PISO nCorrectors 2.',
      '0.1/ … 0.5/': 'Çözücünün yazdığı zaman klasörleri: her birinde U, p, phi (5 klasör + başlangıç 0).',
    };
    const g = el('g'); svg.append(g);
    const satir = [['cavity/', 0, null], ['0/', 1, null], ['U', 2, '0/U'], ['p', 2, '0/p'], ['constant/', 1, null], ['transportProperties', 2, 'transportProperties'], ['polyMesh/', 2, 'polyMesh/'], ['system/', 1, null], ['blockMeshDict', 2, 'blockMeshDict'], ['controlDict', 2, 'controlDict'], ['fvSchemes', 2, 'fvSchemes'], ['fvSolution', 2, 'fvSolution'], ['0.1/ … 0.5/', 1, '0.1/ … 0.5/']];
    const ogeler = {};
    satir.forEach(([ad, d, a], i) => {
      const y = 26 + i * 21, x = 20 + d * 22;
      if (d) g.append(el('path', { d: `M${x - 14},${y - 14} V${y - 4} H${x - 4}`, stroke: 'var(--cizgi)', fill: 'none', 'stroke-width': 1.5 }));
      const t = yaz(g, x, y, ad, { k: 13.5, b: !a, r: a ? 'var(--acc)' : 'var(--yazi)' });
      if (a) { t.style.cursor = 'pointer'; t.setAttribute('tabindex', '0'); t.setAttribute('role', 'button'); t.addEventListener('click', () => sec(a)); t.addEventListener('keydown', (e) => { if (e.key === 'Enter') sec(a); }); ogeler[a] = t; }
    });
    const KOM = [['blockMesh', 'ağı kurar', 'blockMeshDict → polyMesh/'], ['icoFoam', 'çözer (PISO)', '0/, constant/, system/ → 0.1 … 0.5/'], ['paraFoam / foamToVTK', 'görselleştirir', 'zaman klasörleri → çizim']];
    const kut = KOM.map(([ad, ne, io], i) => { const y = 30 + i * 92; const r = kutu(g, 330, y, 290, 68, { rx: 10, w: 2 }); yaz(g, 345, y + 24, ad, { k: 15, b: true }); yaz(g, 345, y + 44, ne, { k: 12.5 }); yaz(g, 345, y + 60, io, { k: 12, r: 'var(--ikincil)' }); if (i < 2) ok(g, 475, y + 70, 475, y + 90, 'var(--acc)', 2.5); return r; });
    const oku = okuma(kap, ['seçilen dosya', 'ne işe yarar?']);
    function sec(a) { Object.entries(ogeler).forEach(([b, t]) => { t.setAttribute('font-weight', b === a ? 800 : 500); t.setAttribute('fill', b === a ? 'var(--tur)' : 'var(--acc)'); }); oku({ 'seçilen dosya': a, 'ne işe yarar?': ACK[a] }); }
    const ADIM = [[null, []], [0, ['blockMeshDict', 'polyMesh/']], [1, ['0/U', 'controlDict', 'fvSchemes', 'fvSolution', '0.1/ … 0.5/']], [2, ['0.1/ … 0.5/']]];
    const k = kontrol(kap);
    secenek(k, ['1 · vaka', '2 · blockMesh', '3 · icoFoam', '4 · paraFoam'], ayar.adim ?? 0, (i) => adim(i));
    function adim(i) {
      const [ki, dos] = ADIM[i];
      kut.forEach((r, j) => { r.setAttribute('stroke', j === ki ? 'var(--tur)' : 'var(--cizgi)'); r.setAttribute('fill', j === ki ? 'var(--tur-zemin)' : 'var(--yuzey)'); });
      Object.entries(ogeler).forEach(([b, t]) => t.setAttribute('opacity', !dos.length || dos.includes(b) ? 1 : 0.35));
      if (dos.length) sec(dos[0]); else sec('controlDict');
    }
    adim(ayar.adim ?? 0);
  };

  /* ====================================================================== LID-DRIVEN CAVITY (ψ–ω) ==== */
  function cavityKur(Re, N) {
    const h = 1 / (N - 1), nu = 1 / Re, dt = 0.9 * Math.min(0.25 * h * h / nu, h);
    const psi = new Float64Array(N * N), w = new Float64Array(N * N), I = (j, i) => j * N + i;
    function adim() {
      for (let i = 0; i < N; i++) { w[I(0, i)] = -2 * psi[I(1, i)] / (h * h); w[I(N - 1, i)] = -2 * psi[I(N - 2, i)] / (h * h) - 2 / h; }
      for (let j = 0; j < N; j++) { w[I(j, 0)] = -2 * psi[I(j, 1)] / (h * h); w[I(j, N - 1)] = -2 * psi[I(j, N - 2)] / (h * h); }
      const yeni = w.slice();
      for (let j = 1; j < N - 1; j++) for (let i = 1; i < N - 1; i++) {
        const u = (psi[I(j + 1, i)] - psi[I(j - 1, i)]) / (2 * h), v = -(psi[I(j, i + 1)] - psi[I(j, i - 1)]) / (2 * h);
        const wx = (w[I(j, i + 1)] - w[I(j, i - 1)]) / (2 * h), wy = (w[I(j + 1, i)] - w[I(j - 1, i)]) / (2 * h);
        const lap = (w[I(j, i + 1)] + w[I(j, i - 1)] + w[I(j + 1, i)] + w[I(j - 1, i)] - 4 * w[I(j, i)]) / (h * h);
        yeni[I(j, i)] = w[I(j, i)] + dt * (-u * wx - v * wy + nu * lap);
      }
      for (let j = 1; j < N - 1; j++) for (let i = 1; i < N - 1; i++) w[I(j, i)] = yeni[I(j, i)];
      for (let it = 0; it < 4; it++) for (let r = 0; r < 2; r++) for (let j = 1; j < N - 1; j++) for (let i = 1; i < N - 1; i++) {
        if ((i + j) % 2 !== r) continue;
        const gs = 0.25 * (psi[I(j, i + 1)] + psi[I(j, i - 1)] + psi[I(j + 1, i)] + psi[I(j - 1, i)] + h * h * w[I(j, i)]);
        psi[I(j, i)] += 1.7 * (gs - psi[I(j, i)]);
      }
    }
    const ozet = () => { let m = 0, im = 0; for (let q = 0; q < N * N; q++) if (psi[q] < m) { m = psi[q]; im = q; } return { min: m, x: (im % N) * h, y: Math.floor(im / N) * h }; };
    return { N, h, dt, psi, adim, ozet };
  }
  function kontur(f, N, seviye, X, Y) {
    let d = '';
    const v = (j, i) => f[j * N + i];
    for (let j = 0; j < N - 1; j++) for (let i = 0; i < N - 1; i++) {
      const a = v(j, i), b = v(j, i + 1), c = v(j + 1, i + 1), e = v(j + 1, i);
      const p = [];
      const kes = (p1, p2, f1, f2) => { if ((f1 - seviye) * (f2 - seviye) < 0) { const t = (seviye - f1) / (f2 - f1); p.push([p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])]); } };
      kes([i, j], [i + 1, j], a, b); kes([i + 1, j], [i + 1, j + 1], b, c); kes([i + 1, j + 1], [i, j + 1], c, e); kes([i, j + 1], [i, j], e, a);
      for (let q = 0; q + 1 < p.length; q += 2) d += `M${X(p[q][0]).toFixed(1)},${Y(p[q][1]).toFixed(1)}L${X(p[q + 1][0]).toFixed(1)},${Y(p[q + 1][1]).toFixed(1)}`;
    }
    return d;
  }
  function cavityCiz(kap, ayar, oto) {
    const W = 640, H = 330, svg = svgYap(kap, W, H, 'Kapağı kayan kutu (lid-driven cavity): tarayıcıda çözülen akım çizgileri');
    const x0 = 120, y0 = 50, S = 250;
    const kat = el('g'); svg.append(kat);
    kutu(svg, x0, y0, S, S, { f: 'none', s: 'var(--yazi)', w: 3, rx: 1 });
    ok(svg, x0 + 30, y0 - 16, x0 + S - 30, y0 - 16, 'var(--tur)', 3); yaz(svg, x0 + S / 2, y0 - 26, 'kapak U = 1 (kayar)', { h: 'middle', k: 13, b: true, r: 'var(--tur)' });
    yaz(svg, x0 - 8, y0 + S / 2, 'u = 0', { h: 'end', k: 12.5, r: 'var(--ikincil)' }); yaz(svg, x0 + S + 8, y0 + S - 12, 'u = 0', { k: 12.5, r: 'var(--ikincil)' }); yaz(svg, x0 + S / 2, y0 + S + 20, 'u = 0 (no-slip)', { h: 'middle', k: 12.5, r: 'var(--ikincil)' });
    const merkez = nokta(svg, -20, -20, 5, 'var(--tur)');
    const ghia = el('circle', { r: 7, fill: 'none', stroke: 'var(--yesil)', 'stroke-width': 2.5, cx: -20, cy: -20 }); svg.append(ghia);
    const sag = el('g'); svg.append(sag);
    const k1 = kontrol(kap);
    let btn = null; if (oto) btn = dugme(k1, '▶ Oynat');
    let reI = ayar.re === 100 ? 1 : 0;
    secenek(k1, ['Re = 10 (S46)', 'Re = 100 (Ghia ile kıyas)'], reI, (i) => { reI = i; kur(); });
    const oku = okuma(kap, ['ızgara / Δt', 'zaman t (U/L birimi)', 'ψ en küçük · girdap merkezi']);
    let C, n = 0, birik = 0, sonMin = 0, durgun = false;
    const X = (i) => x0 + i * S / (C.N - 1), Y = (j) => y0 + S - j * S / (C.N - 1);
    function kur() { const Re = reI ? 100 : 10; C = cavityKur(Re, reI ? 41 : 33); n = 0; durgun = false; if (!oto) { const m = reI ? 6000 : 3000; for (let q = 0; q < m; q++) C.adim(); n = m; } ciz(); }
    function ciz() {
      kat.replaceChildren();
      const o = C.ozet();
      const sev = [-0.1, -0.09, -0.07, -0.05, -0.03, -0.01, -0.003, -0.0005].filter((s) => s > o.min);
      sev.forEach((s, i) => kat.append(el('path', { d: kontur(C.psi, C.N, s, X, Y), stroke: 'var(--acc)', 'stroke-width': i === 0 ? 2.6 : 1.8, fill: 'none', opacity: 0.6 + 0.4 * (i / Math.max(1, sev.length - 1)) })));
      merkez.setAttribute('cx', X(o.x * (C.N - 1))); merkez.setAttribute('cy', Y(o.y * (C.N - 1)));
      if (reI) { ghia.setAttribute('cx', x0 + 0.6172 * S); ghia.setAttribute('cy', y0 + S - 0.7344 * S); } else { ghia.setAttribute('cx', -20); }
      sag.replaceChildren();
      const sat = [['akım çizgileri = ψ eş-çizgileri', 'var(--acc)'], ['ana girdap SAAT YÖNÜNDE döner', 'var(--yazi)'], ['turuncu nokta: ψ en küçük (merkez)', 'var(--tur)'], [reI ? 'yeşil halka: Ghia vd. (1982)' : 'Re = 10: girdap ortaya yakın,', reI ? 'var(--yesil)' : 'var(--ikincil)'], [reI ? 'Re = 100: merkez sağa-yukarı kayar' : 'neredeyse simetrik (viskoz)', 'var(--ikincil)'], [durgun || !oto ? 'durağan çözüm' : 'zamanla ilerliyor…', durgun || !oto ? 'var(--yesil)' : 'var(--tur)']];
      sat.forEach(([s, r], i) => yaz(sag, 392, 66 + i * 24, s, { k: 12.5, r, b: i === 5 }));
      oku({ 'ızgara / Δt': `${C.N} × ${C.N} · Δt = ${sy(C.dt, 4)}`, 'zaman t (U/L birimi)': sy(n * C.dt, 2), 'ψ en küçük · girdap merkezi': `${sy(o.min, 4)} · (${sy(o.x, 3)}, ${sy(o.y, 3)})${reI ? ' · Ghia: −0.1034 (0.617, 0.734)' : ''}` });
    }
    kur();
    if (!oto) return null;
    const oyn = dongu(btn, (dt) => { birik += dt; if (birik < 0.05) return; birik = 0; for (let q = 0; q < (reI ? 40 : 25); q++) { C.adim(); n++; } const m = C.ozet().min; if (Math.abs(m - sonMin) < 2e-6 && n > 300) durgun = true; sonMin = m; ciz(); if (durgun || n > (reI ? 8000 : 4000)) return false; });
    return { dur: oyn.dur };
  }
  Sekil.m303b_cavity = function (kap, ayar = {}) { cavityCiz(kap, ayar, false); };
  Anim.m303b_cavity = function (kap, ayar = {}) { return cavityCiz(kap, ayar, true); };

  /* ====================================================================== K14 · WRF ==== */
  Sekil.m303b_cgrid = function (kap, ayar = {}) {
    const W = 640, H = 320, svg = svgYap(kap, W, H, 'WRF ızgarası: Arakawa-C yatay yerleşim ve arazi izleyen düşey koordinat');
    const g = el('g'); svg.append(g);
    let gor = Math.max(0, ['c', 'eta', 'hibrit'].indexOf(ayar.gorunum ?? 'c'));
    const k = kontrol(kap);
    secenek(k, ['Arakawa-C (yatay)', 'η: arazi izleyen', 'hibrit η (WRF v4)'], gor, (i) => { gor = i; ciz(); });
    function ciz() {
      g.replaceChildren();
      if (gor === 0) {
        const x0 = 90, y0 = 50, s = 110;
        for (let i = 0; i <= 3; i++) { g.append(el('line', { x1: x0 + i * s, x2: x0 + i * s, y1: y0, y2: y0 + 2 * s, stroke: 'var(--cizgi)', 'stroke-width': 2 })); }
        for (let j = 0; j <= 2; j++) g.append(el('line', { x1: x0, x2: x0 + 3 * s, y1: y0 + j * s, y2: y0 + j * s, stroke: 'var(--cizgi)', 'stroke-width': 2 }));
        for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { const cx = x0 + (i + 0.5) * s, cy = y0 + (j + 0.5) * s; nokta(g, cx, cy, 8, 'var(--tur)'); if (i === 1 && j === 0) yaz(g, cx + 12, cy - 8, 'θ, p, q', { k: 13, b: true, r: 'var(--tur)' }); }
        for (let i = 0; i <= 3; i++) for (let j = 0; j < 2; j++) { const x = x0 + i * s, y = y0 + (j + 0.5) * s; ok(g, x - 16, y, x + 16, y, 'var(--acc)', 2.5); if (i === 1 && j === 1) yaz(g, x + 4, y + 22, 'u', { k: 14, b: true, r: 'var(--acc)' }); }
        for (let i = 0; i < 3; i++) for (let j = 0; j <= 2; j++) { const x = x0 + (i + 0.5) * s, y = y0 + j * s; ok(g, x, y + 16, x, y - 16, 'var(--yesil)', 2.5); if (i === 2 && j === 1) yaz(g, x + 8, y - 4, 'v', { k: 14, b: true, r: 'var(--yesil)' }); }
        yaz(g, 20, 24, 'Arakawa-C: kütle değişkenleri hücre MERKEZİNDE, hız bileşenleri YÜZEYLERDE', { k: 14, b: true });
        yaz(g, 20, 296, 'u yüzeyler arası merkezi fark → diverjans ∂u/∂x ve basınç gradyanı tek Δx ile, 2. mertebe', { k: 12.5, r: 'var(--ikincil)' });
        yaz(g, 440, 120, 'turuncu ●: θ, p, q', { k: 12.5, r: 'var(--tur)' }); yaz(g, 440, 142, 'mavi →: u (doğu–batı yüzü)', { k: 12.5, r: 'var(--acc)' }); yaz(g, 440, 164, 'yeşil ↑: v (kuzey–güney yüzü)', { k: 12.5, r: 'var(--yesil)' }); yaz(g, 440, 186, 'w: düşeyde yarım seviyede', { k: 12.5, r: 'var(--ikincil)' });
      } else {
        const x0 = 40, x1 = 600, yTop = 50, yS = 280;
        const zs = (x) => 120 * Math.exp(-(((x - 320) / 90) ** 2));
        const etaS = [1, 0.97, 0.92, 0.85, 0.75, 0.62, 0.48, 0.34, 0.2, 0.1, 0];
        const B = (e) => (gor === 1 ? e : e <= 0.2 ? 0 : ((e - 0.2) / 0.8) ** 2);
        g.append(el('path', { d: yol(Array.from({ length: 141 }, (_, i) => { const x = x0 + i * 4; return [x, yS - zs(x)]; })) + `L${x1},${yS} L${x0},${yS} Z`, fill: 'var(--yesil-zemin)', stroke: 'var(--yesil)', 'stroke-width': 2 }));
        for (const e of etaS) { const p = []; for (let i = 0; i <= 140; i++) { const x = x0 + i * 4, zb = yS - (1 - e) * (yS - yTop); p.push([x, zb - B(e) * zs(x)]); } g.append(el('path', { d: yol(p), stroke: e === 1 ? 'var(--yesil)' : e === 0 ? 'var(--yazi)' : 'var(--acc)', 'stroke-width': e === 0 || e === 1 ? 2.5 : 1.4, fill: 'none' })); }
        yaz(g, x1 - 4, yTop - 6, 'η = 0 (model tepesi, p_t)', { h: 'end', k: 12.5 });
        yaz(g, x0 + 4, yS + 18, 'η = 1 (yüzey)', { k: 12.5, r: 'var(--yesil)' });
        yaz(g, 20, 24, gor === 1 ? 'η = (p_h − p_ht)/(p_hs − p_ht): kuru hidrostatik basınca dayalı, araziyi izler' : 'Hibrit: alçakta araziyi izler, η ≈ 0.2 üstünde düz basınç yüzeyleri', { k: 13.5, b: true });
        yaz(g, 20, 314, gor === 1 ? 'Dağın üstünde de en üst seviyeye kadar eğik: yüksek seviyelerde gürültü üretebilir' : 'Üst seviyeler dağdan etkilenmez → yatay gradyan hatası azalır', { k: 12, r: 'var(--ikincil)' });
      }
    }
    ciz();
  };

  Sekil.m303b_rk3 = function (kap, ayar = {}) {
    const W = 640, H = 300, svg = svgYap(kap, W, H, 'WRF zaman ilerletme: RK3 büyük adımı ve ses dalgaları için küçük adımlar');
    const g = el('g'); svg.append(g);
    let a = ayar.adim ?? 3;
    const k = kontrol(kap);
    secenek(k, ['1 · aşama Δt/3', '2 · aşama Δt/2', '3 · aşama Δt', 'hepsi'], a === 3 ? 3 : a, (i) => { a = i; ciz(); });
    const X = (f) => 80 + f * 480;
    function ciz() {
      g.replaceChildren();
      g.append(el('line', { x1: X(0), x2: X(1), y1: 250, y2: 250, stroke: 'var(--yazi)', 'stroke-width': 2 }));
      [[0, 't'], [1 / 3, 't + Δt/3'], [0.5, 't + Δt/2'], [1, 't + Δt']].forEach(([f, s]) => { g.append(el('line', { x1: X(f), x2: X(f), y1: 244, y2: 256, stroke: 'var(--yazi)', 'stroke-width': 2 })); yaz(g, X(f), 274, s, { h: 'middle', k: 13, b: true }); });
      const AS = [[1 / 3, 1, 'φ* = φᵗ + (Δt/3) R(φᵗ)', 1], [0.5, 2, 'φ** = φᵗ + (Δt/2) R(φ*)', 2], [1, 4, 'φ(t+Δt) = φᵗ + Δt R(φ**)', 4]];
      AS.forEach(([f, ns, form], i) => {
        if (a !== 3 && a !== i) return;
        const y = 70 + i * 58;
        ok(g, X(0), y, X(f), y, ['var(--acc)', 'var(--yesil)', 'var(--tur)'][i], 3);
        yaz(g, X(0) - 8, y + 5, `${i + 1}.`, { h: 'end', k: 14, b: true });
        yaz(g, X(f) + 10, y + 5, form, { k: 13, b: true });
        const adimB = f / ns;
        for (let q = 1; q <= ns; q++) { g.append(el('path', { d: `M${X(adimB * (q - 1))},${y + 16} Q${X(adimB * (q - 0.5))},${y + 30} ${X(adimB * q)},${y + 16}`, stroke: 'var(--ikincil)', fill: 'none', 'stroke-width': 1.6 })); }
        yaz(g, X(0), y + 44, `${ns} küçük (akustik) adım${ns === 1 ? ' (uzunluğu Δt/3)' : ` (her biri Δτ = Δt/4)`}`, { k: 12, r: 'var(--ikincil)' });
      });
      yaz(g, 20, 24, 'RK3 (Wicker–Skamarock): her aşama φᵗ\'den başlar; R = yavaş terimler (adveksiyon, fizik)', { k: 13.5, b: true });
      yaz(g, 20, 44, 'Ses/çekim dalgası terimleri küçük adımlarla (time_step_sound = 4 örneğinde) ilerletilir', { k: 12.5, r: 'var(--ikincil)' });
    }
    ciz();
  };

  Sekil.m303b_altizgara = function (kap, ayar = {}) {
    const W = 640, H = 300, svg = svgYap(kap, W, H, 'Izgara aralığına göre çözülen ve parametrize edilen süreçler');
    const g = el('g'); svg.append(g);
    const k = kontrol(kap);
    const sD = surgu(k, 'Δx', 0, 1, 0.01, ayar.u ?? 0.62, (u) => `${sy(dxk(u), dxk(u) < 1 ? 2 : 1)} km`);
    function dxk(u) { return 0.1 * 10 ** (u * 2.4); } // 0.1 … 25 km
    const oku = okuma(kap, ['kümülüs', 'türbülans (PBL)', 'her zaman parametrize']);
    function ciz() {
      g.replaceChildren();
      const dx = dxk(sD.v), km = 560 / 30; // 30 km genişliğinde pencere
      for (let x = 0; x <= 30 + 1e-9; x += dx) { g.append(el('line', { x1: 40 + x * km, x2: 40 + x * km, y1: 60, y2: 250, stroke: 'var(--cizgi)', 'stroke-width': 1.2 })); }
      g.append(el('rect', { x: 40, y: 250, width: 560, height: 10, fill: 'var(--yesil-zemin)', stroke: 'var(--yesil)' }));
      const bulut = (cx, w, h) => { g.append(el('ellipse', { cx, cy: 250 - h / 2 - 20, rx: w / 2, ry: h / 2, fill: 'var(--yuzey)', stroke: 'var(--ikincil)', 'stroke-width': 2 })); };
      bulut(40 + 8 * km, 2 * km, 120); bulut(40 + 15 * km, 3 * km, 150); bulut(40 + 23 * km, 1.5 * km, 90);
      for (let i = 0; i < 9; i++) { const cx = 60 + i * 62, cy = 232; g.append(el('path', { d: `M${cx},${cy} a6,6 0 1,1 6,6 a10,10 0 1,1 -10,-10`, stroke: 'var(--acc)', fill: 'none', 'stroke-width': 1.5 })); }
      for (let i = 0; i < 4; i++) ok(g, 120 + i * 140, 40, 108 + i * 140, 70, 'var(--tur)', 2);
      yaz(g, 20, 24, `Izgara aralığı Δx = ${sy(dx, dx < 1 ? 2 : 1)} km (dikey çizgiler) · bulut genişliği 1.5–3 km`, { k: 13.5, b: true });
      yaz(g, 40, 284, 'mavi kıvrım: türbülans girdabı (yüzlerce metre) · turuncu ok: ışınım · gri: kümülüs', { k: 12, r: 'var(--ikincil)' });
      oku({ kümülüs: dx >= 10 ? 'ızgaradan küçük → PARAMETRİZE (cu_physics)' : dx > 3 ? 'gri bölge: kısmen çözülür, dikkat' : 'açıkça çözülür (cu_physics kapatılır)', 'türbülans (PBL)': dx > 0.5 ? 'parametrize: RANS tipi PBL (bl_pbl_physics)' : 'büyük girdaplar çözülür → LES', 'her zaman parametrize': 'mikrofizik (damla), ışınım, yüzey akıları' });
    }
    sD.inp.addEventListener('input', ciz); ciz();
  };

  Sekil.m303b_reolcek = function (kap, ayar = {}) {
    const W = 640, H = 230, svg = svgYap(kap, W, H, 'Reynolds sayısı ölçeği: laminerden türbülansa örnekler');
    const x = (lg) => 40 + lg / 10 * 560;
    svg.append(el('line', { x1: x(0), x2: x(10), y1: 120, y2: 120, stroke: 'var(--yazi)', 'stroke-width': 2 }));
    for (let e = 0; e <= 10; e += 2) { svg.append(el('line', { x1: x(e), x2: x(e), y1: 114, y2: 126, stroke: 'var(--yazi)' })); yaz(svg, x(e), 144, us10(e), { h: 'middle', k: 13 }); }
    svg.append(el('rect', { x: x(0), y: 96, width: x(3.36) - x(0), height: 10, fill: 'var(--acc-zemin)' }));
    svg.append(el('rect', { x: x(3.36), y: 96, width: x(10) - x(3.36), height: 10, fill: 'var(--tur-zemin)' }));
    yaz(svg, x(1.5), 90, 'viskozite baskın (laminer)', { h: 'middle', k: 12, r: 'var(--acc)' }); yaz(svg, x(6.6), 90, 'atalet baskın (türbülans)', { h: 'middle', k: 12, r: 'var(--tur)' });
    [[1, 'cavity S46b'], [2, 'S46e'], [3.36, 'boru geçişi ~2300'], [6, 'otomobil'], [8.5, 'atmosfer sınır tabakası']].forEach(([lg, s], i) => { nokta(svg, x(lg), 120, 6, 'var(--ikincil)'); yaz(svg, x(lg), 166 + (i % 2) * 18, s, { h: 'middle', k: 11.5, r: 'var(--ikincil)' }); });
    const nk = nokta(svg, 0, 120, 9, 'var(--tur)');
    const bas = yaz(svg, 20, 30, '', { k: 15, b: true });
    const k = kontrol(kap);
    const sU = surgu(k, 'U', 0.1, 10, 0.1, ayar.U ?? 1, (v) => `${sy(v, 1)} m/s`), sL = surgu(k, 'L', 0.01, 1, 0.01, ayar.L ?? 0.1, (v) => `${sy(v, 2)} m`);
    const sNu = surgu(k, 'ν', -6, -1, 0.1, Math.log10(ayar.nu ?? 0.01), (v) => `${kisa(10 ** v, 2)} m²/s`);
    const k2 = kontrol(kap);
    secenek(k2, ['S46b: ν = 0.01', 'S46e: ν = 0.001', 'hava ν = 1.5×10⁻⁵'], 0, (i) => { sU.set(1); sL.set(0.1); sNu.set(Math.log10([0.01, 0.001, 1.5e-5][i])); ciz(); });
    const oku = okuma(kap, ['Re = UL/ν', '20 × 20 ağda hücre Re = UΔx/ν']);
    function ciz() {
      const Re = sU.v * sL.v / 10 ** sNu.v;
      nk.setAttribute('cx', x(sinir(Math.log10(Re), 0, 10)));
      bas.textContent = `Re = UL/ν = ${sy(sU.v, 1)} × ${sy(sL.v, 2)} / ${kisa(10 ** sNu.v, 2)} = ${kisa(Re, 1)}`;
      oku({ 'Re = UL/ν': kisa(Re, 1), '20 × 20 ağda hücre Re = UΔx/ν': kisa(Re / 20, 2) });
    }
    for (const s of [sU, sL, sNu]) s.inp.addEventListener('input', ciz);
    ciz();
  };

})();
