/* Ders Kitaplığı — kendi çizimlerimiz (SVG). Her çizici: Sekil.<ad>(kap, ayar) → kap'ın içini kurar.
   Animasyonlar: Anim.<ad>(kap, ayar) → { dur() } döndürür (çekmece kapanınca durdurulur).
   Yeni çizici eklerken: renkler CSS değişkeniyle (var(--yazi) …), koyu temada da okunsun; dış görsel yok. */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (ad, o = {}, ic) => { const e = document.createElementNS(NS, ad); for (const [a, v] of Object.entries(o)) e.setAttribute(a, v); if (ic != null) e.textContent = ic; return e; };
  const KAPPA = 287 / 1004;
  const tamC = (v, d = 1) => (Math.round(v * 10 ** d) / 10 ** d).toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d });

  /* ---------------- T–lnP diyagramı (kuru adyabatlar = θ eş-çizgileri) ---------------- */
  function tlnpCiz(kap, ayar = {}) {
    const W = 640, H = 510, L = 54, R = 20, T = 30, B = 44;
    const Tmin = -40, Tmax = 40, Pmax = 100, Pmin = 40;
    const x = (t) => L + (t - Tmin) / (Tmax - Tmin) * (W - L - R);
    const y = (p) => T + (Math.log(p) - Math.log(Pmin)) / (Math.log(Pmax) - Math.log(Pmin)) * (H - T - B); // 40 kPa üstte, 100 kPa altta
    const tx = (px) => Tmin + (px - L) / (W - L - R) * (Tmax - Tmin);
    const py = (py_) => Math.exp(Math.log(Pmin) + (py_ - T) / (H - T - B) * (Math.log(Pmax) - Math.log(Pmin)));
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Sıcaklık–logaritmik basınç diyagramı, kuru adyabatlar' });
    const g = el('g', { 'font-family': 'Inter,sans-serif', 'font-size': 13, fill: 'var(--ikincil)' });
    svg.append(g);
    // izobarlar
    for (const p of [100, 90, 80, 70, 60, 50, 40]) {
      g.append(el('line', { x1: L, x2: W - R, y1: y(p), y2: y(p), stroke: 'var(--cizgi)' }));
      g.append(el('text', { x: L - 8, y: y(p) + 4, 'text-anchor': 'end' }, `${p}`));
    }
    g.append(el('text', { x: L - 8, y: 12, 'text-anchor': 'end', fill: 'var(--yazi)', 'font-weight': 600 }, 'P (kPa)'));
    // izotermler
    for (let t = Tmin; t <= Tmax; t += 10) {
      g.append(el('line', { x1: x(t), x2: x(t), y1: T, y2: H - B, stroke: 'var(--cizgi)', 'stroke-dasharray': t === 0 ? '' : '3 4' }));
      g.append(el('text', { x: x(t), y: H - B + 18, 'text-anchor': 'middle' }, `${t}`));
    }
    g.append(el('text', { x: W - R, y: H - 6, 'text-anchor': 'end', fill: 'var(--yazi)', 'font-weight': 600 }, 'T (°C)'));
    // kuru adyabatlar
    const ady = {};
    for (let th = 240; th <= 360; th += 10) {
      let d = '', ilk = true;
      for (let p = Pmax; p >= Pmin - 0.01; p -= 0.5) {
        const t = th * (p / 100) ** KAPPA - 273.15;
        if (t < Tmin - 0.01 || t > Tmax + 0.01) { ilk = true; continue; }
        d += `${ilk ? 'M' : 'L'}${x(t).toFixed(1)},${y(p).toFixed(1)}`; ilk = false;
      }
      if (!d) continue;
      const yol = el('path', { d, fill: 'none', stroke: 'var(--tur)', 'stroke-width': 1.3, opacity: 0.55 });
      ady[th] = yol; svg.append(yol);
      const tUst = th * (Pmin / 100) ** KAPPA - 273.15;
      if (tUst >= Tmin && tUst <= Tmax) svg.append(el('text', { x: x(tUst) + 3, y: y(Pmin) + 14, fill: 'var(--tur)', 'font-size': 12, 'font-family': 'Inter,sans-serif' }, `${th}`));
    }
    svg.append(el('text', { x: L, y: H - 6, fill: 'var(--tur)', 'font-size': 13, 'font-weight': 600, 'font-family': 'Inter,sans-serif' }, 'turuncu çizgi = kuru adyabat (üstteki sayı θ, K)'));
    kap.append(svg);
    return { svg, x, y, tx, py, ady, L, R, T, B, W, H, Pmin, Pmax, Tmin, Tmax };
  }

  function okumaKur(kap, alanlar) {
    const o = document.createElement('div'); o.className = 'okuma'; o.setAttribute('aria-live', 'polite');
    o.innerHTML = alanlar.map((a) => `<span>${a}: <i data-o="${a}">—</i></span>`).join('');
    kap.append(o);
    return (degerler) => { for (const [a, v] of Object.entries(degerler)) { const e = o.querySelector(`[data-o="${a}"]`); if (e) e.textContent = v; } };
  }

  const Sekil = {};
  Sekil.tlnp = function (kap, ayar = {}) {
    const d = tlnpCiz(kap, ayar);
    const yaz = okumaKur(kap, ['T', 'P', 'θ']);
    const imle = el('circle', { r: 6, fill: 'var(--acc)', stroke: '#fff', 'stroke-width': 2, visibility: 'hidden' });
    d.svg.append(imle);
    let yanan = null;
    const goster = (ev) => {
      const r = d.svg.getBoundingClientRect();
      const px = (ev.clientX - r.left) / r.width * d.W, pyv = (ev.clientY - r.top) / r.height * d.H;
      if (px < d.L || px > d.W - d.R || pyv < d.T || pyv > d.H - d.B) return;
      const t = d.tx(px), p = d.py(pyv), th = (t + 273.15) * (100 / p) ** KAPPA;
      imle.setAttribute('cx', px); imle.setAttribute('cy', pyv); imle.setAttribute('visibility', 'visible');
      yaz({ T: `${tamC(t)} °C`, P: `${tamC(p)} kPa`, 'θ': `${tamC(th)} K (${tamC(th - 273.15)} °C)` });
      const en = Math.round(th / 10) * 10;
      if (yanan && yanan !== d.ady[en]) { yanan.setAttribute('opacity', 0.55); yanan.setAttribute('stroke-width', 1.3); }
      yanan = d.ady[en]; if (yanan) { yanan.setAttribute('opacity', 1); yanan.setAttribute('stroke-width', 3); }
    };
    d.svg.addEventListener('pointermove', goster);
    d.svg.addEventListener('pointerdown', goster);
    // örnek noktalar (ör. S1: 80 kPa 10 °C → θ = 301,8 K)
    for (const [t, p, ad] of (ayar.noktalar || [[10, 80, 'S1'], [25, 100, 'yüzey']])) {
      d.svg.append(el('circle', { cx: d.x(t), cy: d.y(p), r: 5, fill: 'var(--yazi)' }));
      d.svg.append(el('text', { x: d.x(t) + 8, y: d.y(p) - 6, fill: 'var(--yazi)', 'font-size': 13, 'font-family': 'Inter,sans-serif', 'font-weight': 600 }, ad));
    }
    yaz({ T: 'diyagramda gezdir', P: '—', 'θ': '—' });
  };

  /* ---------------- Tᵥ − T eğrisi ---------------- */
  Sekil.tvr = function (kap) {
    const W = 600, H = 380, L = 56, R = 20, T = 20, B = 46;
    const x = (r) => L + r / 20 * (W - L - R), y = (d) => H - B - d / 4 * (H - T - B);
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Sanal sıcaklık düzeltmesi, karışma oranına göre' });
    const g = el('g', { 'font-family': 'Inter,sans-serif', 'font-size': 13, fill: 'var(--ikincil)' }); svg.append(g);
    for (let r = 0; r <= 20; r += 5) { g.append(el('line', { x1: x(r), x2: x(r), y1: T, y2: H - B, stroke: 'var(--cizgi)' })); g.append(el('text', { x: x(r), y: H - B + 18, 'text-anchor': 'middle' }, r)); }
    for (let d = 0; d <= 4; d++) { g.append(el('line', { x1: L, x2: W - R, y1: y(d), y2: y(d), stroke: 'var(--cizgi)' })); g.append(el('text', { x: L - 8, y: y(d) + 4, 'text-anchor': 'end' }, d)); }
    g.append(el('text', { x: W - R, y: H - 8, 'text-anchor': 'end', fill: 'var(--yazi)', 'font-weight': 600 }, 'r (g/kg)'));
    g.append(el('text', { x: 10, y: T + 4, fill: 'var(--yazi)', 'font-weight': 600 }, 'Tᵥ−T (K)'));
    const cizgi = (T0, rL, renk, kesik) => { let d = ''; for (let r = 0; r <= 20; r += 0.5) { const dv = T0 * (0.61 * r / 1000 - rL / 1000); d += `${r ? 'L' : 'M'}${x(r).toFixed(1)},${y(Math.max(-0.2, dv)).toFixed(1)}`; } svg.append(el('path', { d, fill: 'none', stroke: renk, 'stroke-width': 2.5, 'stroke-dasharray': kesik ? '7 5' : '' })); };
    cizgi(300, 0, 'var(--tur)'); cizgi(280, 0, 'var(--acc)'); cizgi(283, 2, 'var(--acc)', true);
    const et = (t, r, renk) => svg.append(el('text', { x: x(r) - 4, y: y(t * 0.61 * r / 1000) - 8, 'text-anchor': 'end', fill: renk, 'font-size': 13, 'font-family': 'Inter,sans-serif', 'font-weight': 600 }, `T = ${t} K`));
    et(300, 19, 'var(--tur)'); et(280, 19, 'var(--acc)');
    svg.append(el('text', { x: x(13), y: y(0.9), fill: 'var(--acc)', 'font-size': 13, 'font-family': 'Inter,sans-serif' }, 'bulutta, r_L = 2 g/kg'));
    // S2 noktaları
    for (const [r, d, ad] of [[12, 2.18, 'S2-a'], [7.7, 0.76, 'S2-b']]) { svg.append(el('circle', { cx: x(r), cy: y(d), r: 5, fill: 'var(--yazi)' })); svg.append(el('text', { x: x(r) + 8, y: y(d) + 16, fill: 'var(--yazi)', 'font-size': 13, 'font-weight': 600, 'font-family': 'Inter,sans-serif' }, ad)); }
    kap.append(svg);
  };

  /* ---------------- Tᵥ kutusu (sıralı görsel) ---------------- */
  Sekil.tvkutu = function (kap, ayar = {}) {
    const adim = ayar.adim || 0, W = 520, H = 330;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Hava kutusu: kuru hava, buhar, bulut suyu' });
    svg.append(el('rect', { x: 20, y: 20, width: 300, height: 290, rx: 14, fill: 'var(--zemin)', stroke: 'var(--yazi)', 'stroke-width': 2 }));
    let tohum = 7; const rnd = () => (tohum = (tohum * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 42; i++) {
      const cx = 40 + rnd() * 260, cy = 40 + rnd() * 250, buhar = adim >= 1 && i % 5 === 0;
      svg.append(el('circle', { cx, cy, r: buhar ? 6 : 8, fill: buhar ? 'var(--acc)' : 'var(--ikincil)', opacity: buhar ? 1 : 0.7 }));
    }
    if (adim >= 2) for (let i = 0; i < 9; i++) svg.append(el('circle', { cx: 50 + rnd() * 240, cy: 50 + rnd() * 230, r: 13, fill: 'var(--acc)', opacity: 0.35, stroke: 'var(--acc)' }));
    const t = (yy, s, renk = 'var(--yazi)', k = 15) => svg.append(el('text', { x: 340, y: yy, fill: renk, 'font-size': k, 'font-family': 'Inter,sans-serif', 'font-weight': 600 }, s));
    t(50, '● N₂/O₂  ≈ 29 g/mol', 'var(--ikincil)');
    if (adim >= 1) t(78, '● H₂O buhar 18 g/mol', 'var(--acc)');
    if (adim >= 2) t(106, '◯ bulut damlası (kütle)', 'var(--acc)');
    const yogun = ['ρ = ρ_kuru', 'ρ azaldı → Tᵥ > T', 'ρ yeniden arttı'][adim];
    const tv = ['Tᵥ = T', 'Tᵥ = T(1 + 0,61 r)', 'Tᵥ = T(1 + 0,61 r − r_L)'][adim];
    t(170, yogun, 'var(--tur)', 17); t(200, tv, 'var(--yazi)', 16);
    kap.append(svg);
  };

  /* ---------------- Animasyon: kuru adyabatik yükselen parsel ---------------- */
  const Anim = {};
  Anim.parsel = function (kap, ayar = {}) {
    const th0 = ayar.theta || 300;
    const d = tlnpCiz(kap);
    if (d.ady[th0]) { d.ady[th0].setAttribute('opacity', 1); d.ady[th0].setAttribute('stroke-width', 3.2); }
    const parsel = el('circle', { r: 11, fill: 'var(--acc)', stroke: '#fff', 'stroke-width': 3 });
    const iz = el('path', { fill: 'none', stroke: 'var(--acc)', 'stroke-width': 4, 'stroke-linecap': 'round' });
    d.svg.append(iz, parsel);
    const yaz = okumaKur(kap, ['P', 'z ≈', 'T', 'θ']);
    const k = document.createElement('div'); k.className = 'kontrol';
    k.innerHTML = '<button type="button" class="dugme">▶ Oynat</button><input type="range" min="45" max="100" step="0.5" value="100" aria-label="Parselin basıncı (kPa)"><span class="yok">basınç</span>';
    kap.append(k);
    const [btn, kay] = [k.querySelector('button'), k.querySelector('input')];
    const T0 = th0 - 273.15;
    function ciz(p) {
      const t = th0 * (p / 100) ** KAPPA - 273.15;
      parsel.setAttribute('cx', d.x(t)); parsel.setAttribute('cy', d.y(p));
      let s = ''; for (let q = 100; q >= p; q -= 0.5) { const tq = th0 * (q / 100) ** KAPPA - 273.15; s += `${q === 100 ? 'M' : 'L'}${d.x(tq).toFixed(1)},${d.y(q).toFixed(1)}`; }
      iz.setAttribute('d', s);
      const z = (T0 - t) / 9.8; // km, kuru adyabat: dT = −Γd dz
      yaz({ P: `${tamC(p)} kPa`, 'z ≈': `${tamC(z, 2)} km`, T: `${tamC(t)} °C`, 'θ': `${th0} K (sabit)` });
      kay.value = p;
    }
    let p = 100, oyn = null;
    const dur = () => { if (oyn) cancelAnimationFrame(oyn); oyn = null; btn.textContent = '▶ Oynat'; };
    btn.addEventListener('click', () => {
      if (oyn) return dur();
      if (p <= 45.5) p = 100;
      btn.textContent = '⏸ Durdur';
      let son = performance.now();
      const adim = (an) => { p = Math.max(45, p - (an - son) / 1000 * 9); son = an; ciz(p); if (p > 45) oyn = requestAnimationFrame(adim); else dur(); };
      oyn = requestAnimationFrame(adim);
    });
    kay.addEventListener('input', () => { dur(); p = +kay.value; ciz(p); });
    ciz(100);
    return { dur };
  };

  window.Sekil = Sekil;
  window.Anim = Anim;
})();
