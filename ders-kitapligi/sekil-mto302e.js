/* MTO302E (harita analizi + SYNOP) kitabına özel çizimler ve animasyonlar. Yalnız bu kitabın ajanı düzenler.
   Sekil.m302_<ad>(kap, ayar) → kap'ın içini kurar · Anim.m302_<ad>(kap, ayar) → { dur() } döndürür.
   Renkler CSS değişkeniyle (açık/koyu tema), dış görsel yok, Kuzey Yarımküre; harita çizimlerinde kuzey oku.
   Sayılar kitabın hesap_dogrula.py'siyle aynı (S1 ızgarası, S5 tablosu, S6, S8 alanı T = 18 − x − 2y, S10). */
(function () {
  const Sekil = window.Sekil, Anim = window.Anim;
  if (!Sekil || !Anim) return;
  const NS = 'http://www.w3.org/2000/svg', F = 'Inter,sans-serif';
  const el = (ad, o = {}, ic) => { const e = document.createElementNS(NS, ad); for (const [a, v] of Object.entries(o)) if (v !== undefined && v !== null) e.setAttribute(a, v); if (ic != null) e.textContent = ic; return e; };
  const tr = (v, d = 1) => (Math.round(v * 10 ** d) / 10 ** d).toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: false });
  const yaz = (g, x, y, s, o = {}) => { const t = el('text', { x, y, 'font-family': F, 'font-size': o.k || 14, fill: o.r || 'var(--yazi)', 'font-weight': o.b ? 700 : 500, 'text-anchor': o.h || 'start', opacity: o.op }, s); g.append(t); return t; };
  const svgYap = (kap, W, H, ad) => { const s = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': ad }); kap.append(s); return s; };
  const yol = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${(+p[0]).toFixed(1)},${(+p[1]).toFixed(1)}`).join('');
  const sinir = (v, a, b) => Math.max(a, Math.min(b, v));
  const svgNokta = (svg, ev) => { const m = svg.getScreenCTM(); if (!m) return null; const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(m.inverse()); };
  const R2D = 180 / Math.PI;
  function okuma(kap, alanlar) {
    const o = document.createElement('div'); o.className = 'okuma'; o.setAttribute('aria-live', 'polite');
    o.innerHTML = alanlar.map((a, i) => `<span style="white-space:normal;overflow-wrap:anywhere">${a}: <i data-i="${i}">—</i></span>`).join('');
    kap.append(o);
    return (d) => { for (const [a, v] of Object.entries(d)) { const i = alanlar.indexOf(a); if (i >= 0) o.querySelector(`[data-i="${i}"]`).textContent = v; } };
  }
  function notKutu(kap) { const d = document.createElement('div'); d.className = 'okuma'; d.style.cssText = 'display:block;font-weight:500;min-height:2.8em'; d.setAttribute('aria-live', 'polite'); kap.append(d); return d; }
  function kontrol(kap) { const k = document.createElement('div'); k.className = 'kontrol'; kap.append(k); return k; }
  function surgu(k, ad, min, max, adim, deger, bicim) {
    const l = document.createElement('label');
    l.style.cssText = 'display:flex;align-items:center;gap:8px;flex:1 1 230px;min-width:0;font-size:15px';
    l.innerHTML = `<span style="white-space:nowrap">${ad}</span><input type="range" min="${min}" max="${max}" step="${adim}" value="${deger}" style="min-width:70px;flex:1"><b style="min-width:5.4em;text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap"></b>`;
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
    const a = Math.atan2(y2 - y1, x2 - x1), u = 7 + w * 1.5, L = Math.hypot(x2 - x1, y2 - y1);
    const gg = el('g');
    if (L < 2) { g.append(gg); return gg; }
    const k = Math.min(u * 0.8, L * 0.6);
    gg.append(el('line', { x1, y1, x2: x2 - Math.cos(a) * k, y2: y2 - Math.sin(a) * k, stroke: renk, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-dasharray': kesik ? '6 5' : null }));
    const uu = Math.min(u, L * 0.9);
    gg.append(el('path', { d: `M${x2},${y2} L${x2 - uu * Math.cos(a - 0.42)},${y2 - uu * Math.sin(a - 0.42)} L${x2 - uu * Math.cos(a + 0.42)},${y2 - uu * Math.sin(a + 0.42)} Z`, fill: renk }));
    g.append(gg); return gg;
  }
  const nokta = (g, x, y, r = 5, renk = 'var(--yazi)') => { const c = el('circle', { cx: x, cy: y, r, fill: renk, stroke: 'var(--zemin)', 'stroke-width': 2 }); g.append(c); return c; };
  function kuzey(g, x, y) { const gg = el('g'); ok(gg, x, y + 26, x, y, 'var(--ikincil)', 2.2); yaz(gg, x, y + 42, 'K', { h: 'middle', k: 13, r: 'var(--ikincil)', b: true }); g.append(gg); return gg; }
  const hale = (t) => { t.setAttribute('paint-order', 'stroke'); t.setAttribute('stroke', 'var(--yuzey)'); t.setAttribute('stroke-width', 5); t.setAttribute('stroke-linejoin', 'round'); return t; };
  const harf = (g, x, y, s, renk, k = 26) => yaz(g, x, y, s, { h: 'middle', k, b: true, r: renk });
  const HR = (s) => (s === 'L' ? 'var(--acc)' : s === 'H' ? 'var(--tur)' : 'var(--ikincil)');
  /* pusula yönü (bearing, ° kuzeyden saat yönünde) → SVG birim vektör */
  const yv = (b) => [Math.sin(b / R2D), -Math.cos(b / R2D)];
  const YONAD = ['kuzey', 'kuzeydoğu', 'doğu', 'güneydoğu', 'güney', 'güneybatı', 'batı', 'kuzeybatı'];
  const yonAdi = (b) => YONAD[Math.round((((b % 360) + 360) % 360) / 45) % 8];
  const RUZAD = ['kuzeyli', 'kuzeydoğulu', 'doğulu', 'güneydoğulu', 'güneyli', 'güneybatılı', 'batılı', 'kuzeybatılı'];
  const bulunma = (ad) => ad + (/ey$/.test(ad) ? 'de' : 'da');
  const ruzAdi = (dd) => RUZAD[Math.round((((dd % 360) + 360) % 360) / 45) % 8];

  /* ---- eş değer çizgisi: ızgara + çift doğrusal (bilinear) ince örnekleme + yürüyen kareler ---- */
  function esCizgi(Z, lev, X, Y, n = 8) {
    const R = Z.length, C = Z[0].length, seg = [];
    const bil = (r, c) => { const r0 = Math.min(R - 2, Math.floor(r)), c0 = Math.min(C - 2, Math.floor(c)), fr = r - r0, fc = c - c0; return Z[r0][c0] * (1 - fr) * (1 - fc) + Z[r0][c0 + 1] * (1 - fr) * fc + Z[r0 + 1][c0] * fr * (1 - fc) + Z[r0 + 1][c0 + 1] * fr * fc; };
    const NR = (R - 1) * n, NC = (C - 1) * n;
    const v = []; for (let i = 0; i <= NR; i++) { v.push([]); for (let j = 0; j <= NC; j++) v[i].push(bil(i / n, j / n) - lev + 1e-9); }
    const kes = (a, b) => a / (a - b);
    for (let i = 0; i < NR; i++) for (let j = 0; j < NC; j++) {
      const a = v[i][j], b = v[i][j + 1], c = v[i + 1][j + 1], d = v[i + 1][j];
      const p = [];
      if ((a > 0) !== (b > 0)) p.push([i, j + kes(a, b)]);
      if ((b > 0) !== (c > 0)) p.push([i + kes(b, c), j + 1]);
      if ((c > 0) !== (d > 0)) p.push([i + 1, j + 1 - kes(c, d)]);
      if ((d > 0) !== (a > 0)) p.push([i + 1 - kes(d, a), j]);
      for (let q = 0; q + 1 < p.length; q += 2) seg.push([p[q], p[q + 1]]);
    }
    return seg.map(([p, q]) => `M${X(p[1] / n).toFixed(1)},${Y(p[0] / n).toFixed(1)}L${X(q[1] / n).toFixed(1)},${Y(q[0] / n).toFixed(1)}`).join('');
  }

  /* ============================== İZOBAR ANALİZİ (S1) ============================== */
  const S1P = [[1009.0, 1018.0, 1021.0, 1018.0, 1009.0], [1013.5, 1022.5, 1025.5, 1022.5, 1013.5], [1015.0, 1024.0, 1027.0, 1024.0, 1015.0], [1013.5, 1022.5, 1025.5, 1022.5, 1013.5], [1009.0, 1018.0, 1021.0, 1018.0, 1009.0]];
  Sekil.m302_izobar = function (kap, ayar = {}) {
    const adim = ayar.adim ?? 4, W = 640, H = 500, d = 96, X0 = 128, Y0 = 52;
    const X = (c) => X0 + c * d, Y = (r) => Y0 + r * d;
    const svg = svgYap(kap, W, H, 'S1: 5×5 istasyon ağında izobar analizi');
    const kat = el('g'), cizgi = el('g'), ust = el('g'); svg.append(kat, cizgi, ust);
    kuzey(ust, 40, 30);
    // sık bölge bandı
    if (adim >= 3) for (const c of [0, 3]) kat.append(el('rect', { x: X(c) + 4, y: Y(0) - 18, width: d - 8, height: 4 * d + 36, rx: 10, fill: 'var(--tur-zemin)' }));
    if (adim >= 3) yaz(kat, X(0) + d / 2, Y(4) + 40, 'sık (9 hPa)', { h: 'middle', k: 13, r: 'var(--tur)', b: true });
    if (adim >= 3) yaz(kat, X(3) + d / 2, Y(4) + 40, 'sık (9 hPa)', { h: 'middle', k: 13, r: 'var(--tur)', b: true });
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
      nokta(ust, X(c), Y(r), 4.5, 'var(--ikincil)');
      yaz(ust, X(c), Y(r) - 9, tr(S1P[r][c], 1), { h: 'middle', k: 13.5, b: r === 2 && c === 2 });
    }
    const seviyeler = adim >= 3 ? [1016, 1020, 1024] : adim >= 1 ? [1024] : [];
    const kesisler = (lev) => {
      const p = [];
      for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) { const a = S1P[r][c], b = S1P[r][c + 1]; if ((a - lev) * (b - lev) <= 0 && a !== b) { const t = (lev - a) / (b - a); if (t > 0 && t < 1) p.push([X(c + t), Y(r)]); } }
      for (let c = 0; c < 5; c++) for (let r = 0; r < 4; r++) { const a = S1P[r][c], b = S1P[r + 1][c]; if ((a - lev) * (b - lev) <= 0 && a !== b) { const t = (lev - a) / (b - a); if (t > 0 && t < 1) p.push([X(c), Y(r + t)]); } }
      for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) if (S1P[r][c] === lev) p.push([X(c), Y(r)]);
      return p;
    };
    const RENK = { 1016: 'var(--acc)', 1020: 'var(--yesil)', 1024: 'var(--tur)' };
    function ciz(secili) {
      cizgi.innerHTML = '';
      for (const lev of seviyeler) {
        if (secili && secili !== lev) continue;
        if (adim >= 2) cizgi.append(el('path', { d: esCizgi(S1P, lev, X, Y), fill: 'none', stroke: RENK[lev], 'stroke-width': 2.8, 'stroke-linecap': 'round' }));
        for (const [x, y] of kesisler(lev)) { const g = el('g', { stroke: RENK[lev], 'stroke-width': 2.4 }); g.append(el('line', { x1: x - 6, y1: y - 6, x2: x + 6, y2: y + 6 }), el('line', { x1: x - 6, y1: y + 6, x2: x + 6, y2: y - 6 })); cizgi.append(g); }
        if (adim >= 2) { const lx = lev === 1024 ? X(1.5) : lev === 1020 ? X(1.667) : X(0.778); const ly = lev === 1024 ? Y(1) - 14 : Y(4) + 24; const t = yaz(cizgi, lx, ly, String(lev), { h: 'middle', k: 13, b: true, r: RENK[lev] }); t.setAttribute('paint-order', 'stroke'); t.setAttribute('stroke', 'var(--yuzey)'); t.setAttribute('stroke-width', 4); }
      }
      if (adim >= 3) harf(cizgi, X(2) + 26, Y(2) + 30, 'H', 'var(--tur)', 28);
    }
    ciz(null);
    if (adim >= 4) {
      const k = kontrol(kap);
      const sec = [null, 1016, 1020, 1024];
      let bilgiLev = 1020;
      secenek(k, ['Hepsi', '1016', '1020', '1024'], 0, (i) => { ciz(sec[i]); bilgiLev = sec[i] || 1020; });
      const not = notKutu(kap);
      not.textContent = 'Fareyi iki istasyonun arasına getir: o çift için basit orantı hesabı burada yazar.';
      svg.addEventListener('pointermove', (ev) => {
        const p = svgNokta(svg, ev); if (!p) return;
        const c = sinir(Math.floor((p.x - X0) / d), 0, 3), r = sinir(Math.round((p.y - Y0) / d), 0, 4);
        const a = S1P[r][c], b = S1P[r][c + 1], lev = bilgiLev;
        if ((a - lev) * (b - lev) > 0 || a === b) { not.textContent = `${r + 1}. satır, ${c + 1}–${c + 2}. istasyon: ${tr(a)} → ${tr(b)} hPa. ${lev} bu çiftin arasında değil, izobar buradan geçmez.`; return; }
        const t = (lev - a) / (b - a);
        not.textContent = `${r + 1}. satır: x = (${lev} − ${tr(a)}) / (${tr(b)} − ${tr(a)}) = ${tr(t, 2)} aralık (${c + 1}. istasyondan doğuya).`;
      });
    }
  };

  /* ============================== H VE L MERKEZİ (S2) ============================== */
  Sekil.m302_merkez = function (kap, ayar = {}) {
    const W = 640, H = 330;
    const svg = svgYap(kap, W, H, 'Yüksek ve alçak basınç merkezi, kapalı izobarlar ve rüzgâr okları');
    const g = el('g'); svg.append(g);
    let mod = ayar.mod === 'yer' ? 1 : 0;
    function ciz() {
      g.innerHTML = '';
      kuzey(g, 32, 24);
      const sis = [{ cx: 175, cy: 172, ad: 'H', deg: [1036, 1028, 1020], don: -1 }, { cx: 470, cy: 172, ad: 'L', deg: [996, 1004, 1012], don: 1 }];
      for (const s of sis) {
        [40, 80, 120].forEach((r, i) => {
          g.append(el('ellipse', { cx: s.cx, cy: s.cy, rx: r * 1.05, ry: r * 0.95, fill: 'none', stroke: 'var(--ikincil)', 'stroke-width': 1.6 }));
          const t = yaz(g, s.cx, s.cy - r * 0.95 + 5, String(s.deg[i]), { h: 'middle', k: 12.5, r: 'var(--ikincil)' }); t.setAttribute('paint-order', 'stroke'); t.setAttribute('stroke', 'var(--yuzey)'); t.setAttribute('stroke-width', 5);
        });
        harf(g, s.cx, s.cy + 9, s.ad, HR(s.ad), 28);
        const alfa = mod ? 28 / R2D : 0;
        for (let i = 0; i < 8; i++) {
          const th = (i + 0.5) * Math.PI / 4, r = 100;
          const x = s.cx + r * 1.05 * Math.cos(th), y = s.cy - r * 0.95 * Math.sin(th);
          // harita ekseninde teğet: L saat yönünün tersi (−sin, cos), H saat yönü
          let vx = -Math.sin(th) * s.don, vy = Math.cos(th) * s.don;
          const ca = Math.cos(alfa), sa = Math.sin(alfa);          // sürtünme: alçağa doğru (sola) α kadar dön
          [vx, vy] = [vx * ca - vy * sa, vx * sa + vy * ca];
          const L = mod ? 26 : 30;
          ok(g, x - vx * L / 2, y + vy * L / 2, x + vx * L / 2, y - vy * L / 2, 'var(--yazi)', 2.6);
        }
        const alt = s.ad === 'H' ? (mod ? 'saat yönünde, dışa · DIV · çökme ↓' : 'saat yönünde · antisiklonik') : (mod ? 'saat yönünün tersine, içe · CONV · yükselme ↑' : 'saat yönünün tersine · siklonik');
        yaz(g, s.cx, H - 12, alt, { h: 'middle', k: 13.5, b: true, r: HR(s.ad) });
      }
      yaz(g, W - 12, 24, mod ? 'yer: sürtünme var, oklar izobarı keser' : 'üst seviye: oklar izobara paralel', { h: 'end', k: 13, r: 'var(--ikincil)' });
    }
    ciz();
    if (!ayar.sabit) { const k = kontrol(kap); secenek(k, ['Üst seviye (sürtünmesiz)', 'Yer (sürtünmeli)'], mod, (i) => { mod = i; ciz(); }); }
  };

  /* ============================== BASINÇ GRADYANI ============================== */
  Sekil.m302_gradyan = function (kap) {
    const W = 640, H = 300, cx = 330, cy = 150;
    const svg = svgYap(kap, W, H, 'Paralel izobarlar, basınç gradyan kuvveti ve jeostrofik rüzgâr');
    const g = el('g'); svg.append(g);
    const k = kontrol(kap);
    const sDn = surgu(k, 'İzobar aralığı', 100, 600, 10, 200, (v) => `${v} km`);
    const sF = surgu(k, 'Enlem', 20, 70, 1, 45, (v) => `${v}° K`);
    const oku = okuma(kap, ['|∇p|', 'BGK', 'V_g']);
    function ciz() {
      g.innerHTML = '';
      kuzey(g, 30, 22);
      const dn = sDn.v, px = dn * 0.3, phi = sF.v, f = 2 * 7.292e-5 * Math.sin(phi / R2D);
      for (let i = -3; i <= 3; i++) {
        const y = cy + i * px; if (y < 14 || y > H - 14) continue;
        g.append(el('line', { x1: 70, x2: W - 62, y1: y, y2: y, stroke: 'var(--ikincil)', 'stroke-width': 1.6 }));
        yaz(g, 66, y + 4, String(1012 + 4 * i), { h: 'end', k: 12.5, r: 'var(--ikincil)' });
      }
      harf(g, W - 32, 34, 'L', 'var(--acc)', 22); harf(g, W - 32, H - 12, 'H', 'var(--tur)', 22);
      const Fp = 400 / (1.2 * dn * 1e3), Vg = Fp / f;
      const lF = sinir(Fp / 1.67e-3 * 70, 14, 140), lV = sinir(Vg / 16 * 90, 14, 230);
      ok(g, cx, cy, cx, cy - lF, 'var(--tur)', 3.4); hale(yaz(g, cx + 10, cy - lF + 10, 'BGK (alçağa)', { k: 13, r: 'var(--tur)', b: true }));
      ok(g, cx, cy, cx + lV, cy, 'var(--acc)', 3.4); hale(yaz(g, cx + lV - 4, cy + 22, 'V_g (izobara paralel)', { h: 'end', k: 13, r: 'var(--acc)', b: true }));
      nokta(g, cx, cy, 5);
      oku({ '|∇p|': `${tr(400 / dn, 2)} hPa / 100 km`, 'BGK': `${tr(Fp * 1e3, 2)}×10⁻³ m/s²`, 'V_g': `${tr(Vg, 1)} m/s` });
    }
    sDn.inp.addEventListener('input', ciz); sF.inp.addEventListener('input', ciz); ciz();
  };

  /* ============================== CORIOLIS ============================== */
  Sekil.m302_coriolis = function (kap) {
    const W = 640, H = 300, L = 60, R = 250, T = 30, B = 46;
    const svg = svgYap(kap, W, H, 'Coriolis parametresinin enlemle değişimi ve sağa sapma');
    const gA = el('g'), g = el('g'); svg.append(gA, g);
    const x = (p) => L + p / 90 * (W - L - R), y = (f) => H - B - f / 1.5e-4 * (H - T - B);
    for (const p of [0, 30, 60, 90]) { gA.append(el('line', { x1: x(p), x2: x(p), y1: T, y2: H - B, stroke: 'var(--cizgi)' })); yaz(gA, x(p), H - B + 18, `${p}°`, { h: 'middle', k: 13, r: 'var(--ikincil)' }); }
    for (const f of [0, 0.5e-4, 1e-4, 1.5e-4]) { gA.append(el('line', { x1: L, x2: W - R, y1: y(f), y2: y(f), stroke: 'var(--cizgi)' })); yaz(gA, L - 6, y(f) + 4, tr(f * 1e4, 1), { h: 'end', k: 13, r: 'var(--ikincil)' }); }
    yaz(gA, 8, T - 12, 'f (10⁻⁴ s⁻¹)', { k: 13.5, b: true }); yaz(gA, W - R, H - 8, 'enlem φ', { h: 'end', k: 13.5, b: true });
    const pts = []; for (let p = 0; p <= 90; p += 1) pts.push([x(p), y(2 * 7.292e-5 * Math.sin(p / R2D))]);
    gA.append(el('path', { d: yol(pts), fill: 'none', stroke: 'var(--acc)', 'stroke-width': 2.8 }));
    // sağ: eylemsizlik çemberi
    const ox = W - 125, oy = 150;
    kuzey(gA, W - 30, 24);
    const k = kontrol(kap);
    const s = surgu(k, 'Enlem φ', 0, 90, 1, 41, (v) => `${v}°`);
    const oku = okuma(kap, ['f', 'eylemsizlik süresi 2π/f', '10 m/s için yarıçap V/f']);
    function ciz() {
      g.innerHTML = '';
      const p = s.v, f = 2 * 7.292e-5 * Math.sin(p / R2D);
      g.append(el('line', { x1: x(p), x2: x(p), y1: T, y2: H - B, stroke: 'var(--tur)', 'stroke-dasharray': '5 4' }));
      nokta(g, x(p), y(f), 6, 'var(--tur)');
      const r = f > 1e-6 ? sinir(10 / f / 1000 / 100 * 34, 12, 95) : 95;
      if (f > 1e-6) {
        g.append(el('circle', { cx: ox, cy: oy, r, fill: 'none', stroke: 'var(--yesil)', 'stroke-width': 2.4, 'stroke-dasharray': '6 5' }));
        ok(g, ox - r, oy + 2, ox - r + 0.3, oy - 8, 'var(--yesil)', 2.4);
        ok(g, ox, oy + r, ox - 34, oy + r - 3, 'var(--yazi)', 2.6);
        yaz(g, ox, oy - r - 10, 'saat yönünde döner', { h: 'middle', k: 13, r: 'var(--yesil)', b: true });
        yaz(g, ox, H - 10, 'KY: hareket hep sağa sapar', { h: 'middle', k: 13, b: true });
      } else yaz(g, ox, oy, 'ekvatorda f = 0: sapma yok', { h: 'middle', k: 13, b: true });
      oku({ 'f': `${tr(f * 1e4, 3)}×10⁻⁴ s⁻¹`, 'eylemsizlik süresi 2π/f': f > 1e-6 ? `${tr(2 * Math.PI / f / 3600, 1)} saat` : 'sonsuz', '10 m/s için yarıçap V/f': f > 1e-6 ? `${tr(10 / f / 1000, 0)} km` : 'sonsuz' });
    }
    s.inp.addEventListener('input', ciz); ciz();
  };

  /* ============================== KUVVET DENGESİ (jeostrofik / sürtünmeli) ============================== */
  Sekil.m302_kuvvet = function (kap, ayar = {}) {
    const W = 640, H = 330, cx = 300, cy = 190, P = 105, f = 1.031e-4;
    const svg = svgYap(kap, W, H, 'Basınç gradyan kuvveti, Coriolis ve sürtünme dengesi');
    const g = el('g'); svg.append(g);
    const surt = ayar.tur === 'surt';
    let s = null, oku = null;
    if (surt) { const k = kontrol(kap); s = surgu(k, 'Sürtünme k', 0, 120, 1, 60, (v) => `${tr(v / 100, 2)}×10⁻⁴ s⁻¹`); oku = okuma(kap, ['kesme açısı α', 'V / V_g', 'yüzey']); s.inp.addEventListener('input', () => ciz()); }
    function ciz() {
      g.innerHTML = '';
      kuzey(g, 30, 22);
      for (const [yy, d] of [[60, '1000 hPa'], [H - 30, '1004 hPa']]) { g.append(el('line', { x1: 60, x2: W - 20, y1: yy, y2: yy, stroke: 'var(--ikincil)', 'stroke-width': 1.8 })); yaz(g, W - 22, yy - 8, d, { h: 'end', k: 13, r: 'var(--ikincil)' }); }
      harf(g, 90, 50, 'L', 'var(--acc)', 20); harf(g, 90, H - 10, 'H', 'var(--tur)', 20);
      const kk = surt ? s.v * 1e-6 : 0, a = Math.atan(kk / f), ca = Math.cos(a), sa = Math.sin(a);
      // rüzgâr: doğudan α kadar kuzeye (alçağa) dönük; SVG'de y aşağı
      const vx = Math.cos(a), vy = -Math.sin(a), LV = 150;
      if (surt) ok(g, cx, cy, cx + LV, cy, 'var(--ikincil)', 2, true);
      if (surt) yaz(g, cx + LV + 4, cy + 16, 'V_g', { k: 13, r: 'var(--ikincil)' });
      ok(g, cx, cy, cx + vx * LV * ca, cy + vy * LV * ca, 'var(--yazi)', 3.8);
      yaz(g, cx + vx * LV * ca + 6, cy + vy * LV * ca - 8, 'rüzgâr V', { k: 14, b: true });
      ok(g, cx, cy, cx, cy - P, 'var(--tur)', 3.2); yaz(g, cx - 8, cy - P + 6, 'BGK', { h: 'end', k: 14, b: true, r: 'var(--tur)' });
      // Coriolis: V'nin sağına (saat yönünde 90°), büyüklük P cos α
      const cxv = -vy, cyv = vx; // SVG'de sağa dik: (vx,vy) → (−vy, vx)
      ok(g, cx, cy, cx + cxv * P * ca, cy + cyv * P * ca, 'var(--acc)', 3.2); hale(yaz(g, cx + cxv * P * ca * 0.6 + 10, cy + cyv * P * ca * 0.6 + 4, 'Coriolis', { k: 14, b: true, r: 'var(--acc)' }));
      if (surt && sa > 0.01) { ok(g, cx, cy, cx - vx * P * sa, cy - vy * P * sa, 'var(--yesil)', 3.2); yaz(g, cx - vx * P * sa - 8, cy - vy * P * sa + 16, 'sürtünme', { h: 'end', k: 14, b: true, r: 'var(--yesil)' }); }
      nokta(g, cx, cy, 5);
      if (surt && a > 0.01) { const r = 46; g.append(el('path', { d: `M${cx + r},${cy} A${r},${r} 0 0 0 ${cx + r * Math.cos(a)},${cy - r * Math.sin(a)}`, fill: 'none', stroke: 'var(--yazi)', 'stroke-width': 1.5 })); yaz(g, cx + r + 6, cy - 8, 'α', { k: 15, b: true }); }
      yaz(g, W - 22, H - 6, surt ? 'BGK + Coriolis + sürtünme = 0' : 'BGK + Coriolis = 0 → rüzgâr izobara paralel', { h: 'end', k: 13.5, r: 'var(--ikincil)' });
      if (surt) oku({ 'kesme açısı α': `${tr(a * R2D, 1)}°`, 'V / V_g': tr(ca, 2), 'yüzey': a * R2D < 3 ? 'serbest atmosfer' : a * R2D < 21 ? 'deniz' : a * R2D < 36 ? 'kara' : 'pürüzlü kara / şehir' });
    }
    ciz();
  };

  /* ============================== BUYS-BALLOT ============================== */
  Sekil.m302_bb = function (kap) {
    const W = 640, H = 330, cx = 320, cy = 170;
    const svg = svgYap(kap, W, H, 'Buys-Ballot kuralı: sırtını rüzgâra ver, alçak solunda');
    const g = el('g'); svg.append(g);
    const k = kontrol(kap);
    const s = surgu(k, 'Rüzgârın geldiği yön', 0, 355, 5, 270, (v) => `${v}°`);
    const oku = okuma(kap, ['rüzgâr', 'alçak (L)', 'yüksek (H)']);
    function ciz() {
      g.innerHTML = '';
      kuzey(g, 30, 22);
      g.append(el('circle', { cx, cy, r: 130, fill: 'none', stroke: 'var(--cizgi)', 'stroke-width': 1.5 }));
      for (const [b, t] of [[0, 'K'], [90, 'D'], [180, 'G'], [270, 'B']]) { const [ux, uy] = yv(b); yaz(g, cx + ux * 146, cy + uy * 146 + 5, t, { h: 'middle', k: 13, r: 'var(--ikincil)', b: true }); }
      const dd = s.v, [fx, fy] = yv(dd), [tx, ty] = yv(dd + 180);
      ok(g, cx + fx * 120, cy + fy * 120, cx + tx * 40, cy + ty * 40, 'var(--yazi)', 4);
      yaz(g, cx + fx * 100 + 8, cy + fy * 100 - 8, 'rüzgâr', { k: 13, b: true });
      // gözlemci: sırtı rüzgâra
      g.append(el('circle', { cx, cy, r: 13, fill: 'var(--yuzey)', stroke: 'var(--yazi)', 'stroke-width': 2.4 }));
      ok(g, cx, cy, cx + tx * 26, cy + ty * 26, 'var(--yazi)', 2);
      const [lx, ly] = yv(dd + 90), [hx, hy] = yv(dd - 90);
      harf(g, cx + lx * 92, cy + ly * 92 + 9, 'L', 'var(--acc)', 30); harf(g, cx + hx * 92, cy + hy * 92 + 9, 'H', 'var(--tur)', 30);
      yaz(g, cx + lx * 92, cy + ly * 92 + 28, 'solunda', { h: 'middle', k: 12.5, r: 'var(--acc)' });
      yaz(g, cx + hx * 92, cy + hy * 92 + 28, 'sağında', { h: 'middle', k: 12.5, r: 'var(--tur)' });
      oku({ 'rüzgâr': `${ruzAdi(dd)} (${dd}°'den)`, 'alçak (L)': bulunma(yonAdi(dd + 90)), 'yüksek (H)': bulunma(yonAdi(dd - 90)) });
    }
    s.inp.addEventListener('input', ciz); ciz();
  };

  /* ============================== GRADYAN RÜZGÂRI ============================== */
  Sekil.m302_gradR = function (kap) {
    const W = 640, H = 320, f = 1e-4;
    const svg = svgYap(kap, W, H, 'Gradyan rüzgârı: basınç gradyanı, Coriolis ve merkezkaç dengesi');
    const g = el('g'); svg.append(g);
    const k = kontrol(kap);
    let tur = 0;
    secenek(k, ['L çevresi (siklonik)', 'H çevresi (antisiklonik)'], 0, (i) => { tur = i; ciz(); });
    const sR = surgu(k, 'Yarıçap |R|', 300, 3000, 50, 1000, (v) => `${v} km`);
    const sV = surgu(k, 'V_g', 5, 40, 1, 20, (v) => `${v} m/s`);
    const oku = okuma(kap, ['V_gr', 'V_g', 'durum']);
    function ciz() {
      g.innerHTML = '';
      kuzey(g, 30, 22);
      const R = sR.v * 1e3 * (tur ? -1 : 1), Vg = sV.v;
      const disk = f * f * R * R / 4 + f * R * Vg;
      const V = disk < 0 ? NaN : (R > 0 ? -f * R / 2 + Math.sqrt(disk) : -f * R / 2 - Math.sqrt(disk));
      const C = [170, 165], rp = 125, Px = C[0] + rp, Py = C[1];
      g.append(el('circle', { cx: C[0], cy: C[1], r: rp, fill: 'none', stroke: 'var(--ikincil)', 'stroke-width': 1.6, 'stroke-dasharray': '7 5' }));
      harf(g, C[0], C[1] + 9, tur ? 'H' : 'L', tur ? 'var(--tur)' : 'var(--acc)', 28);
      // akış yönü: L'de doğu noktasında kuzeye (yukarı), H'de güneye (aşağı)
      ok(g, Px, Py + (tur ? -30 : 30), Px, Py + (tur ? 30 : -30), 'var(--yazi)', 3.6);
      yaz(g, Px + 8, Py + (tur ? 46 : -36), 'akış', { k: 13, b: true });
      if (isNaN(V)) { yaz(g, 450, 160, 'Bu gradyan H çevresinde', { h: 'middle', k: 15, b: true, r: 'var(--tur)' }); yaz(g, 450, 182, 'dengelenemez (V_g > f|R|/4)', { h: 'middle', k: 15, b: true, r: 'var(--tur)' }); oku({ 'V_gr': '—', 'V_g': `${Vg} m/s`, 'durum': `kök yok: en büyük V_g = ${tr(f * Math.abs(R) / 4, 1)} m/s` }); return; }
      const BGK = f * Vg, CO = f * V, MK = V * V / Math.abs(R), en = Math.max(BGK, CO, MK), sc = 150 / en;
      const satir = [[-70, tur ? 1 : -1, BGK, 'BGK', 'var(--tur)'], [-10, tur ? -1 : 1, CO, 'Coriolis', 'var(--acc)'], [50, 1, MK, 'merkezkaç', 'var(--yesil)']];
      const x0 = 475, sc2 = 135 / en;
      g.append(el('line', { x1: x0, x2: x0, y1: Py - 100, y2: Py + 70, stroke: 'var(--cizgi)', 'stroke-width': 2 }));
      for (const [dy, yon, buy, ad, r] of satir) { const y0 = Py + dy; ok(g, x0, y0, x0 + yon * buy * sc2, y0, r, 3.4); yaz(g, x0, y0 - 11, `${ad}: ${tr(buy * 1e3, 2)}×10⁻³ m/s²`, { k: 13, b: true, r, h: 'middle' }); }
      yaz(g, x0, Py + 100, '← merkeze · dışa →', { h: 'middle', k: 12.5, r: 'var(--ikincil)' });
      void sc;
      oku({ 'V_gr': `${tr(V, 1)} m/s`, 'V_g': `${Vg} m/s`, 'durum': V < Vg - 0.05 ? 'alt-jeostrofik (yavaş)' : V > Vg + 0.05 ? 'üst-jeostrofik (hızlı)' : '≈ jeostrofik' });
    }
    sR.inp.addEventListener('input', ciz); sV.inp.addEventListener('input', ciz); ciz();
  };

  /* ============================== DÜŞEY KESİT: CONV/DIV → düşey hareket ============================== */
  Sekil.m302_kesit = function (kap, ayar = {}) {
    const W = 640, H = 330, Y0 = 290, YT = 50, YN = 168, cx = 320;
    const svg = svgYap(kap, W, H, 'Alçak ve yüksek üstünde düşey dolaşım (Dines)');
    const g = el('g'); svg.append(g);
    let tur = ayar.tur === 'H' ? 1 : 0;
    const adim = ayar.adim ?? 3;
    function ciz() {
      g.innerHTML = '';
      g.append(el('rect', { x: 20, y: Y0, width: W - 40, height: 12, fill: 'var(--cizgi)' }));
      g.append(el('line', { x1: 20, x2: W - 20, y1: YT, y2: YT, stroke: 'var(--ikincil)', 'stroke-dasharray': '8 6' }));
      yaz(g, W - 24, YT - 8, 'tropopoz', { h: 'end', k: 12.5, r: 'var(--ikincil)' });
      if (adim >= 3) { g.append(el('line', { x1: 20, x2: W - 20, y1: YN, y2: YN, stroke: 'var(--ikincil)', 'stroke-dasharray': '3 5' })); yaz(g, 24, YN - 8, 'ıraksamasız seviye (≈ 500–600 hPa)', { k: 12.5, r: 'var(--ikincil)' }); }
      const L = !tur, r1 = L ? 'var(--acc)' : 'var(--tur)';
      harf(g, cx, Y0 + 40 - 14, L ? 'L' : 'H', r1, 24);
      // yer akışı
      const yer = Y0 - 18;
      if (L) { ok(g, 90, yer, 250, yer, 'var(--yazi)', 3); ok(g, W - 90, yer, W - 250, yer, 'var(--yazi)', 3); yaz(g, 170, yer - 10, 'CONV', { h: 'middle', k: 14, b: true, r: r1 }); }
      else { ok(g, 250, yer, 90, yer, 'var(--yazi)', 3); ok(g, W - 250, yer, W - 90, yer, 'var(--yazi)', 3); yaz(g, 170, yer - 10, 'DIV', { h: 'middle', k: 14, b: true, r: r1 }); }
      if (adim >= 2) {
        if (L) for (const [ex, ey, rx] of [[cx - 30, YT + 64, 40], [cx + 18, YT + 54, 46], [cx + 2, YT + 80, 52]]) g.append(el('ellipse', { cx: ex, cy: ey, rx, ry: 18, fill: 'var(--yuzey)', stroke: 'var(--ikincil)', 'stroke-width': 1.5 }));
        for (const dx of [-26, 0, 26]) { if (L) ok(g, cx + dx, Y0 - 40, cx + dx, YT + 50, 'var(--acc)', 3); else ok(g, cx + dx, YT + 50, cx + dx, Y0 - 40, 'var(--tur)', 3); }
        yaz(g, cx + 46, (Y0 + YT) / 2 + 30, L ? 'yükselme ↑: soğur, bulut' : 'çökme ↓: ısınır, kurur', { k: 14, b: true, r: r1 });
        if (!L) yaz(g, cx, YT + 30, 'açık hava', { h: 'middle', k: 13.5, r: 'var(--ikincil)' });
      }
      if (adim >= 3) {
        const yu = YT + 22;
        if (L) { ok(g, 250, yu, 90, yu, 'var(--yazi)', 3); ok(g, W - 250, yu, W - 90, yu, 'var(--yazi)', 3); yaz(g, 170, yu + 22, 'DIV', { h: 'middle', k: 14, b: true, r: r1 }); }
        else { ok(g, 90, yu, 250, yu, 'var(--yazi)', 3); ok(g, W - 90, yu, W - 250, yu, 'var(--yazi)', 3); yaz(g, 170, yu + 22, 'CONV', { h: 'middle', k: 14, b: true, r: r1 }); }
      }
      yaz(g, 24, H - 6, 'batı', { k: 12.5, r: 'var(--ikincil)' }); yaz(g, W - 24, H - 6, 'doğu', { h: 'end', k: 12.5, r: 'var(--ikincil)' });
    }
    ciz();
    if (ayar.adim == null) { const k = kontrol(kap); secenek(k, ['L üstü', 'H üstü'], tur, (i) => { tur = i; ciz(); }); }
  };

  /* ============================== RÜZGÂR YÖNÜ ============================== */
  Sekil.m302_ruzgar = function (kap) {
    const W = 640, H = 320, cx = 230, cy = 160, R = 125;
    const svg = svgYap(kap, W, H, 'Rüzgâr yönü: dd geldiği yönü gösterir');
    const g = el('g'); svg.append(g);
    const k = kontrol(kap);
    const sd = surgu(k, 'dd (geldiği yön)', 0, 355, 5, 45, (v) => `${v}°`);
    const sf = surgu(k, 'ff', 1, 30, 1, 10, (v) => `${v} m/s`);
    const oku = okuma(kap, ['ad', 'u (doğu)', 'v (kuzey)', 'gittiği yön']);
    function ciz() {
      g.innerHTML = '';
      g.append(el('circle', { cx, cy, r: R, fill: 'none', stroke: 'var(--ikincil)', 'stroke-width': 1.6 }));
      for (let b = 0; b < 360; b += 45) { const [ux, uy] = yv(b); g.append(el('line', { x1: cx + ux * (R - 8), y1: cy + uy * (R - 8), x2: cx + ux * R, y2: cy + uy * R, stroke: 'var(--ikincil)', 'stroke-width': 2 })); }
      for (const [b, t] of [[0, 'K 360°'], [90, 'D 90°'], [180, 'G 180°'], [270, 'B 270°']]) { const [ux, uy] = yv(b); yaz(g, cx + ux * (R + 26), cy + uy * (R + 22) + 5, t, { h: 'middle', k: 13, b: true, r: 'var(--ikincil)' }); }
      const dd = sd.v, ff = sf.v, [fx, fy] = yv(dd);
      ok(g, cx + fx * (R - 6), cy + fy * (R - 6), cx - fx * (R - 20), cy - fy * (R - 20), 'var(--yazi)', 4);
      nokta(g, cx + fx * (R - 6), cy + fy * (R - 6), 8, 'var(--tur)');
      yaz(g, cx + fx * (R + 6) + (fx > 0 ? 10 : -10), cy + fy * (R + 6) + 4, 'geldiği yön', { h: fx > 0 ? 'start' : 'end', k: 13, b: true, r: 'var(--tur)' });
      const u = -ff * Math.sin(dd / R2D), v = -ff * Math.cos(dd / R2D);
      // sağda bileşen kutusu
      const ox = 500, oy = 160, sc = 6;
      g.append(el('line', { x1: ox - 100, x2: ox + 100, y1: oy, y2: oy, stroke: 'var(--cizgi)' })); g.append(el('line', { x1: ox, x2: ox, y1: oy - 100, y2: oy + 100, stroke: 'var(--cizgi)' }));
      ok(g, ox, oy, ox + u * sc, oy, 'var(--acc)', 3); ok(g, ox, oy, ox, oy - v * sc, 'var(--yesil)', 3); ok(g, ox, oy, ox + u * sc, oy - v * sc, 'var(--yazi)', 2.4);
      yaz(g, ox, oy - 112, 'bileşenler', { h: 'middle', k: 13, b: true, r: 'var(--ikincil)' });
      oku({ 'ad': `${ruzAdi(dd)}`, 'u (doğu)': `${tr(u, 2)} m/s`, 'v (kuzey)': `${tr(v, 2)} m/s`, 'gittiği yön': `${yonAdi(dd + 180)}` });
    }
    sd.inp.addEventListener('input', ciz); sf.inp.addEventListener('input', ciz); ciz();
  };

  /* ============================== JEOPOTANSİYEL: yüzey iniyor = L ============================== */
  Sekil.m302_jeopot = function (kap, ayar = {}) {
    const W = 640, H = 420;
    const svg = svgYap(kap, W, H, 'Basınç yüzeyinin düşey kesiti ve aynı alanın kontur haritası');
    const g = el('g'); svg.append(g);
    let tur = ayar.tur === 'H' ? 1 : 0;
    function ciz() {
      g.innerHTML = '';
      const L = !tur, cx = 320, sg = 110;
      // kesit (üst panel)
      const yK = (dz) => 120 - dz * 0.45;            // dz: m, kenara göre
      const prof = (x) => (L ? -120 : 120) * Math.exp(-(((x - cx) / sg) ** 2));
      g.append(el('rect', { x: 20, y: 18, width: W - 40, height: 170, rx: 10, fill: 'none', stroke: 'var(--cizgi)' }));
      yaz(g, 30, 38, 'düşey kesit', { k: 13, b: true, r: 'var(--ikincil)' });
      const pts = []; for (let x = 40; x <= W - 40; x += 5) pts.push([x, yK(prof(x))]);
      g.append(el('path', { d: yol(pts), fill: 'none', stroke: L ? 'var(--acc)' : 'var(--tur)', 'stroke-width': 3 }));
      yaz(g, W - 44, yK(0) - 10, '500 hPa yüzeyi', { h: 'end', k: 13, b: true, r: L ? 'var(--acc)' : 'var(--tur)' });
      g.append(el('line', { x1: 40, x2: W - 40, y1: yK(0), y2: yK(0), stroke: 'var(--ikincil)', 'stroke-dasharray': '6 5' }));
      yaz(g, 44, yK(0) - 8, 'kenarın yüksekliği (558 dam)', { k: 12.5, r: 'var(--ikincil)' });
      nokta(g, cx, yK(0), 6, 'var(--yazi)');
      yaz(g, cx + 10, yK(0) + (L ? -10 : 22), L ? 'burada p < 500 hPa → L' : 'burada p > 500 hPa → H', { k: 13.5, b: true });
      yaz(g, cx + (L ? -70 : 0), yK(prof(cx)) + (L ? -4 : -10), L ? '546 dam' : '570 dam', { h: 'middle', k: 13, r: 'var(--ikincil)' });
      // harita (alt panel)
      const my = 305;
      g.append(el('rect', { x: 20, y: 200, width: W - 40, height: 210, rx: 10, fill: 'none', stroke: 'var(--cizgi)' }));
      yaz(g, 30, 220, 'harita (500 hPa)', { k: 13, b: true, r: 'var(--ikincil)' });
      kuzey(g, W - 44, 212);
      const deg = L ? [546, 552, 558] : [570, 564, 558];
      [34, 66, 98].forEach((r, i) => { g.append(el('ellipse', { cx, cy: my, rx: r * 2, ry: r, fill: 'none', stroke: 'var(--ikincil)', 'stroke-width': 1.7 })); const t = yaz(g, cx + r * 2 - 4, my + 5, String(deg[i]), { h: 'middle', k: 12.5, r: 'var(--ikincil)' }); t.setAttribute('paint-order', 'stroke'); t.setAttribute('stroke', 'var(--zemin)'); t.setAttribute('stroke-width', 5); });
      harf(g, cx, my + 9, L ? 'L' : 'H', L ? 'var(--acc)' : 'var(--tur)', 26);
    }
    ciz();
    if (!ayar.sabit) { const k = kontrol(kap); secenek(k, ['Yüzey iniyor (L)', 'Yüzey kabarıyor (H)'], tur, (i) => { tur = i; ciz(); }); }
  };
  /* ============================== 500 hPa DALGASI: trof ve sırt (S3) ============================== */
  const DX0 = 170, DLAM = 560, DK = 2 * Math.PI / DLAM;
  Sekil.m302_dalga = function (kap, ayar = {}) {
    const adim = ayar.adim ?? 4, W = 640, H = 370, ytop = 98, sp = 44;
    const svg = svgYap(kap, W, H, '500 hPa konturları, trof ve sırt eksenleri, P ve Q noktalarında rüzgâr');
    const g = el('g'); svg.append(g);
    const Zs = [534, 540, 546, 552, 558];
    let A = 40, eg = 0, sA = null, sE = null;
    const yc = (i, x) => ytop + i * sp - A * Math.cos(DK * (x - DX0 - eg * (i - 2)));
    const dy = (i, x) => A * DK * Math.sin(DK * (x - DX0 - eg * (i - 2)));
    function ciz() {
      if (sA) { A = sA.v; eg = sE.v; }
      g.innerHTML = '';
      kuzey(g, W - 26, 8);
      for (let i = 0; i < 5; i++) {
        const pts = []; for (let x = 44; x <= W - 14; x += 4) pts.push([x, yc(i, x)]);
        g.append(el('path', { d: yol(pts), fill: 'none', stroke: 'var(--yazi)', 'stroke-width': 2 }));
        const t = yaz(g, 40, yc(i, 44) + 5, String(Zs[i]), { h: 'end', k: 13, b: true, r: 'var(--ikincil)' }); void t;
      }
      yaz(g, 12, 22, 'dam', { k: 12.5, r: 'var(--ikincil)' });
      const eksen = (x0, renk, desen, ad) => {
        const p = []; for (let i = 0; i < 5; i++) { const x = x0 + eg * (i - 2); p.push([x, yc(i, x)]); }
        g.append(el('path', { d: yol(p), fill: 'none', stroke: renk, 'stroke-width': 3.2, 'stroke-dasharray': desen, 'stroke-linecap': 'round' }));
        for (const [x, y] of p) nokta(g, x, y, 4.5, renk);
        yaz(g, p[0][0], p[0][1] - 14, ad, { h: 'middle', k: 14, b: true, r: renk });
      };
      if (adim >= 1) eksen(DX0, 'var(--tur)', '1 7', 'SIRT');
      if (adim >= 2) eksen(DX0 + DLAM / 2, 'var(--acc)', '12 7', 'TROF');
      if (adim >= 3) {
        const xt = DX0 + DLAM / 2 + eg;
        for (const [ad, x, not] of [['P', xt - 110, 'trof arkası'], ['Q', xt + 75, 'trof önü: yağış']]) {
          const y = yc(3, x), d = dy(3, x), n = Math.hypot(1, d), ux = 1 / n, uy = d / n, L = 34;
          ok(g, x - ux * L, y - uy * L, x + ux * L, y + uy * L, 'var(--yesil)', 3.4);
          nokta(g, x, y, 5.5, 'var(--yazi)');
          hale(yaz(g, x - 4, y + 26, ad, { h: 'end', k: 16, b: true }));
          hale(yaz(g, x + 4, y + 26, not, { k: 12.5, r: 'var(--ikincil)' }));
        }
      }
      if (adim >= 3) yaz(g, W - 14, H - 8, 'akış batıdan doğuya, konturlara paralel', { h: 'end', k: 12.5, r: 'var(--ikincil)' });
    }
    if (adim >= 4) {
      const k = kontrol(kap);
      sA = surgu(k, 'Genlik', 0, 60, 2, 40, (v) => `${v * 10} km`);
      sE = surgu(k, 'Eksen eğimi', -30, 30, 2, 0, (v) => (v === 0 ? 'K–G (düz)' : v > 0 ? 'KB–GD' : 'KD–GB'));
      sA.inp.addEventListener('input', ciz); sE.inp.addEventListener('input', ciz);
    }
    ciz();
  };

  /* ============================== TROF ÖNÜ: hız, DIV/CONV ve kesit ============================== */
  Sekil.m302_trofonu = function (kap) {
    const W = 640, H = 430;
    const svg = svgYap(kap, W, H, 'Trofun önünde ıraksama ve yükselme, arkasında yakınsama ve çökme');
    const g = el('g'); svg.append(g);
    kuzey(g, 24, 6);
    const yc = (i, x) => 70 + i * 48 - 40 * Math.cos(DK * (x - DX0));
    const hiz = (x) => 1 + 0.4 * Math.cos(DK * (x - DX0));
    for (let i = 0; i < 3; i++) for (let x = 40; x < W - 20; x += 8) {
      const v = hiz(x + 4);
      g.append(el('line', { x1: x, y1: yc(i, x), x2: x + 8, y2: yc(i, x + 8), stroke: 'var(--yazi)', 'stroke-width': 1 + 3.2 * (v - 0.6), 'stroke-linecap': 'round' }));
    }
    for (const [x, r, d, ad] of [[DX0, 'var(--tur)', '1 7', 'sırt: hızlı'], [DX0 + DLAM / 2, 'var(--acc)', '12 7', 'trof: yavaş']]) {
      g.append(el('line', { x1: x, x2: x, y1: 16, y2: 205, stroke: r, 'stroke-width': 3, 'stroke-dasharray': d, 'stroke-linecap': 'round' }));
      yaz(g, x, 222, ad, { h: 'middle', k: 13, b: true, r });
    }
    for (const [x, ad, r] of [[310, 'CONV (arkası)', 'var(--tur)'], [545, 'DIV (önü)', 'var(--acc)'], [92, 'DIV', 'var(--acc)']]) { const t = yaz(g, x, 34, ad, { h: 'middle', k: 14, b: true, r }); t.setAttribute('paint-order', 'stroke'); t.setAttribute('stroke', 'var(--yuzey)'); t.setAttribute('stroke-width', 5); }
    // kesit
    const Y0 = 412, YT = 252;
    g.append(el('rect', { x: 20, y: Y0, width: W - 40, height: 8, fill: 'var(--cizgi)' }));
    g.append(el('line', { x1: 20, x2: W - 20, y1: 240, y2: 240, stroke: 'var(--cizgi)' }));
    yaz(g, 24, 258, 'düşey kesit', { k: 12.5, b: true, r: 'var(--ikincil)' });
    yaz(g, W - 24, 258, 'üstte çizgi kalınlığı = akış hızı', { h: 'end', k: 12, r: 'var(--ikincil)' });
    for (const dx of [-20, 20]) ok(g, 310 + dx, YT + 26, 310 + dx, Y0 - 34, 'var(--tur)', 3);
    for (const [ex, ey, rx] of [[528, YT + 42, 40], [566, YT + 34, 36], [548, YT + 58, 46]]) g.append(el('ellipse', { cx: ex, cy: ey, rx, ry: 15, fill: 'var(--yuzey)', stroke: 'var(--ikincil)', 'stroke-width': 1.4 }));
    for (const dx of [-20, 20]) ok(g, 545 + dx, Y0 - 34, 545 + dx, YT + 70, 'var(--acc)', 3);
    harf(g, 310, Y0 - 8, 'H', 'var(--tur)', 20); harf(g, 545, Y0 - 8, 'L', 'var(--acc)', 20);
    yaz(g, 282, Y0 - 60, 'çökme: açık hava', { h: 'end', k: 13, b: true, r: 'var(--tur)' });
    yaz(g, 515, Y0 - 60, 'yükselme: bulut, yağış', { h: 'end', k: 13, b: true, r: 'var(--acc)' });
  };

  /* ============================== SICAKLIK ADVEKSİYONU (S6) ============================== */
  const PANEL = { A: 270, B: 90, C: 180, D: 225 };
  Sekil.m302_adveksiyon = function (kap, ayar = {}) {
    const W = 640, H = 340, Px = 320, Py = 185, s = 0.75; // px/km
    const svg = svgYap(kap, W, H, '850 hPa izotermleri, rüzgâr ve okun kuyruğundaki S noktası');
    const g = el('g'); svg.append(g);
    let dd = PANEL[ayar.panel] ?? 270, V = 10;
    const sabit = ayar.panel != null;
    let sd = null, sv = null;
    const oku = okuma(kap, ['rüzgâr', 'θ (V ile ∇T)', '−V·∇T', '6 saatte ΔT']);
    function ciz() {
      if (sd) { dd = sd.v; V = sv.v; }
      g.innerHTML = '';
      kuzey(g, 26, 8);
      for (const [x, t] of [[170, 0], [320, 4], [470, 8]]) { g.append(el('line', { x1: x, x2: x, y1: 40, y2: H - 30, stroke: t === 0 ? 'var(--acc)' : t === 8 ? 'var(--tur)' : 'var(--ikincil)', 'stroke-width': 2, 'stroke-dasharray': '9 6' })); yaz(g, x, 32, `${t} °C`, { h: 'middle', k: 14, b: true }); }
      yaz(g, 60, H - 10, '← soğuk', { k: 13, b: true, r: 'var(--acc)' }); yaz(g, W - 60, H - 10, 'sıcak →', { h: 'end', k: 13, b: true, r: 'var(--tur)' });
      g.append(el('line', { x1: 170, x2: 320, y1: H - 22, y2: H - 22, stroke: 'var(--ikincil)' })); yaz(g, 245, H - 26, '200 km', { h: 'middle', k: 12, r: 'var(--ikincil)' });
      const [ux, uy] = yv(dd + 180), Lk = V * 21.6 * s;
      const Sx = Px - ux * Lk, Sy = Py - uy * Lk;
      if (V > 0) { ok(g, Sx, Sy, Px, Py, 'var(--yazi)', 3.6); nokta(g, Sx, Sy, 7, 'var(--yesil)'); hale(yaz(g, Sx + 10, Sy - 10, 'S', { k: 16, b: true, r: 'var(--yesil)' })); }
      nokta(g, Px, Py, 7, 'var(--yazi)'); yaz(g, Px + 10, Py + 22, 'P', { k: 16, b: true });
      const TS = 4 + (Sx - Px) / (150) * 4;
      if (V > 0) hale(yaz(g, Sx + 10, Sy + 14, `${tr(TS, 1)} °C`, { k: 13, r: 'var(--yesil)', b: true }));
      const th = Math.abs(((dd + 180 - 90 + 540) % 360) - 180);
      const a = -V * (4 / 200e3) * Math.cos(th / R2D), d6 = a * 21600;
      const sinif = Math.abs(d6) < 0.05 ? '0' : d6 > 0 ? 'W (sıcak)' : 'C (soğuk)';
      oku({ 'rüzgâr': `${ruzAdi(dd)} ${V} m/s`, 'θ (V ile ∇T)': `${tr(th, 0)}°`, '−V·∇T': `${(a * 1e4).toLocaleString('tr-TR', { maximumFractionDigits: 2 })}×10⁻⁴ °C/s`, '6 saatte ΔT': `${tr(d6, 2)} °C → ${sinif}` });
    }
    if (!sabit) {
      const k = kontrol(kap);
      sd = surgu(k, 'Geldiği yön', 0, 355, 5, dd, (v) => `${v}°`);
      sv = surgu(k, 'Hız', 0, 20, 1, V, (v) => `${v} m/s`);
      const k2 = kontrol(kap);
      for (const p of ['A', 'B', 'C', 'D']) dugme(k2, `S6-${p}`, true).addEventListener('click', () => { sd.set(PANEL[p]); sv.set(10); ciz(); });
      sd.inp.addEventListener('input', ciz); sv.inp.addEventListener('input', ciz);
    }
    ciz();
  };

  /* ============================== İZOTERMLERİ TAŞIMA (S8) ============================== */
  function tasimaKur(kap, ad) {
    const W = 640, H = 380, s = 48, ox = 70, oy = 340;
    const X = (x) => ox + s * x, Y = (y) => oy - s * y;
    const svg = svgYap(kap, W, H, ad);
    const g = el('g'); svg.append(g);
    const oku = okuma(kap, ['t / Δt', 'P\'de sıcaklık', 'taşınan hava']);
    const izo = (c, t) => { const K = 18 - c - 3 * t, xa = Math.max(0, K - 12), xb = Math.min(6, K); if (xb <= xa) return null; return [[xa, (K - xa) / 2], [xb, (K - xb) / 2]]; };
    function ciz(t) {
      g.innerHTML = '';
      for (let i = 0; i <= 6; i++) { g.append(el('line', { x1: X(i), x2: X(i), y1: Y(0), y2: Y(6), stroke: 'var(--cizgi)' })); g.append(el('line', { x1: X(0), x2: X(6), y1: Y(i), y2: Y(i), stroke: 'var(--cizgi)' })); yaz(g, X(i), Y(0) + 18, String(i), { h: 'middle', k: 12.5, r: 'var(--ikincil)' }); yaz(g, X(0) - 10, Y(i) + 4, String(i), { h: 'end', k: 12.5, r: 'var(--ikincil)' }); }
      yaz(g, X(6) + 6, Y(0) + 18, 'x (doğu)', { k: 12.5, r: 'var(--ikincil)' }); yaz(g, X(0) - 8, Y(6) - 16, 'y (kuzey)', { h: 'end', k: 12.5, r: 'var(--ikincil)' });
      for (const c of [14, 10, 6]) {
        const p = izo(c, 0); if (p) { g.append(el('line', { x1: X(p[0][0]), y1: Y(p[0][1]), x2: X(p[1][0]), y2: Y(p[1][1]), stroke: 'var(--yazi)', 'stroke-width': 2.4 })); yaz(g, X(p[0][0]) + 4, Y(p[0][1]) - 6, `${c} °C`, { k: 13, b: true }); }
        if (t > 0.001) { const q = izo(c, t); if (q) { g.append(el('line', { x1: X(q[0][0]), y1: Y(q[0][1]), x2: X(q[1][0]), y2: Y(q[1][1]), stroke: 'var(--tur)', 'stroke-width': 2.4, 'stroke-dasharray': '8 6' })); hale(yaz(g, X(q[0][0]) + 6, Y(q[0][1]) - 6, `${c} °C`, { k: 12.5, b: true, r: 'var(--tur)' })); } }
      }
      const hx = 4 - t, hy = 3 - t;
      g.append(el('line', { x1: X(4), y1: Y(3), x2: X(hx), y2: Y(hy), stroke: 'var(--yesil)', 'stroke-width': 3, 'stroke-dasharray': '4 4' }));
      nokta(g, X(3), Y(2), 7, 'var(--yazi)'); yaz(g, X(3) - 10, Y(2) + 22, 'P', { h: 'end', k: 16, b: true });
      nokta(g, X(4), Y(3), 6, 'var(--ikincil)'); yaz(g, X(4) + 10, Y(3) - 8, 'S', { k: 16, b: true, r: 'var(--ikincil)' });
      nokta(g, X(hx), Y(hy), 7.5, 'var(--yesil)');
      // sağ açıklama
      const rx = 400;
      kuzey(g, W - 30, 8);
      yaz(g, rx, 70, 'kuzeydoğulu rüzgâr', { k: 14, b: true });
      ok(g, rx + 120, 92, rx + 60, 132, 'var(--yazi)', 3.4);
      yaz(g, rx, 160, 'Δt: 1 kare batı + 1 kare güney', { k: 13, r: 'var(--ikincil)' });
      yaz(g, rx, 190, 'alan: T = 18 − x − 2y', { k: 13.5, b: true });
      yaz(g, rx, 214, 'düz: şimdi · kesik: t anında', { k: 13, r: 'var(--ikincil)' });
      yaz(g, rx, 250, `P'de: ${tr(11 - 3 * t, 1)} °C`, { k: 18, b: true, r: 'var(--tur)' });
      yaz(g, rx, 278, 'yeşil nokta: S\'den kalkan hava', { k: 13, r: 'var(--yesil)' });
      oku({ 't / Δt': tr(t, 2), 'P\'de sıcaklık': `${tr(11 - 3 * t, 1)} °C (ΔT = ${tr(-3 * t + 0, 1)})`, 'taşınan hava': '8 °C (sıcaklığını korur)' });
    }
    return { ciz };
  }
  Sekil.m302_tasima = function (kap, ayar = {}) {
    const T = tasimaKur(kap, 'S8: izotermleri rüzgârla taşıma');
    const k = kontrol(kap);
    const s = surgu(k, 'Zaman t / Δt', 0, 1, 0.05, ayar.t ?? 1, (v) => tr(v, 2));
    s.inp.addEventListener('input', () => T.ciz(s.v));
    T.ciz(s.v);
  };
  Anim.m302_tasimaAnim = function (kap) {
    const T = tasimaKur(kap, 'S8: izotermlerin Δt boyunca taşınması (animasyon)');
    const k = kontrol(kap);
    const b = dugme(k, '▶ Oynat');
    let t = 0, bek = 0;
    T.ciz(0);
    const d = dongu(b, (dt) => { if (bek > 0) { bek -= dt; if (bek <= 0) t = 0; T.ciz(Math.min(1, t)); return true; } t += dt / 4; if (t >= 1) { t = 1; bek = 1.2; } T.ciz(t); return true; });
    d.bas();
    return { dur: () => d.dur() };
  };

  /* ============================== KALINLIK ve ÇEKİRDEK (S5) ============================== */
  const C85 = 287 / 9.81 * Math.log(850 / 500), F700 = Math.log(850 / 700) / Math.log(850 / 500);
  const T5 = { S1: [1560, 1500, 5280, 5460, 'Sibirya yükseği'], S2: [1440, 1500, 5900, 5820, 'Basra alçağı'], S3: [1260, 1500, 5160, 5520, 'İzlanda alçağı'], S4: [1620, 1500, 5980, 5820, 'Azor yükseği'] };
  Sekil.m302_kalinlik = function (kap, ayar = {}) {
    const W = 640, H = 360, cx = 330, ex = 92, sc = 0.17;
    const svg = svgYap(kap, W, H, 'Düşey kesit: 850, 700 ve 500 hPa yüzeyleri, merkezde ve kenarda kalınlık');
    const g = el('g'); svg.append(g);
    const serbest = ayar.sistem == null && ayar.dT == null && ayar.dZ == null;
    let st = { z8k: 1500, dZk: 4036, dZ8: ayar.dZ ?? -60, dT: ayar.dT ?? 9, ad: '' };
    const kur = (sis) => { const [z8m, z8k, z5m, z5k, ad] = T5[sis]; st = { z8k, dZk: z5k - z8k, dZ8: z8m - z8k, dT: ((z5m - z8m) - (z5k - z8k)) / C85, ad: `${sis} · ${ad}` }; };
    if (ayar.sistem) kur(ayar.sistem);
    const oku = okuma(kap, ['kalınlık merkez / kenar', 'T̄ merkez / kenar', 'çekirdek', '850 / 500 merkez']);
    let sT = null, sZ = null;
    const gs = (x) => Math.exp(-(((x - cx) / 125) ** 2));
    function ciz(oku_ = true) {
      if (sT && serbest && oku_) { st.dT = sT.v; st.dZ8 = sZ.v; }
      g.innerHTML = '';
      const dTh = st.dT * C85;
      const del = { 850: (x) => st.dZ8 * gs(x), 700: (x) => (st.dZ8 + F700 * dTh) * gs(x), 500: (x) => (st.dZ8 + dTh) * gs(x) };
      const taban = { 850: 300, 700: 214, 500: 100 };
      const yy = (p, x) => taban[p] - del[p](x) * sc;
      const xs = []; for (let x = 60; x <= W - 30; x += 6) xs.push(x);
      const ust = xs.map((x) => [x, yy(500, x)]), alt = xs.map((x) => [x, yy(850, x)]).reverse();
      g.append(el('path', { d: yol(ust.concat(alt)) + 'Z', fill: st.dT > 0.5 ? 'var(--tur-zemin)' : st.dT < -0.5 ? 'var(--acc-zemin)' : 'none' }));
      for (const p of [850, 700, 500]) {
        g.append(el('path', { d: yol(xs.map((x) => [x, yy(p, x)])), fill: 'none', stroke: 'var(--yazi)', 'stroke-width': 2.6 }));
        yaz(g, 8, taban[p] + 4, `${p} hPa`, { k: 13, b: true, r: 'var(--ikincil)' });
        const dc = del[p](cx), hh = dc < -8 ? 'L' : dc > 8 ? 'H' : '—';
        harf(g, cx + 46, yy(p, cx) - 8, hh, HR(hh), 20);
      }
      const ok2 = (x, ad) => { const y1 = yy(850, x), y2 = yy(500, x); ok(g, x, (y1 + y2) / 2, x, y2 + 2, 'var(--ikincil)', 2); ok(g, x, (y1 + y2) / 2, x, y1 - 2, 'var(--ikincil)', 2); const t = yaz(g, x + 8, (y1 + y2) / 2 + 30, ad, { k: 13, b: true }); t.setAttribute('paint-order', 'stroke'); t.setAttribute('stroke', 'var(--yuzey)'); t.setAttribute('stroke-width', 4); };
      const km = st.dZk + dTh, kk = st.dZk;
      ok2(cx, `merkez ${tr(km, 0)} m`); ok2(ex, `kenar ${tr(kk, 0)} m`);
      const cek = st.dT > 0.3 ? 'W · sıcak çekirdek' : st.dT < -0.3 ? 'C · soğuk çekirdek' : 'fark yok';
      yaz(g, W - 12, 26, cek, { h: 'end', k: 15, b: true, r: st.dT > 0.3 ? 'var(--tur)' : st.dT < -0.3 ? 'var(--acc)' : 'var(--ikincil)' });
      if (st.ad) yaz(g, W - 12, 46, st.ad, { h: 'end', k: 13, r: 'var(--ikincil)' });
      yaz(g, W - 12, H - 8, 'yükseklik farkları abartılı ölçekte', { h: 'end', k: 12, r: 'var(--ikincil)' });
      const Tm = (km / C85) - 273.15, Tk = (kk / C85) - 273.15;
      const h8 = st.dZ8 < -8 ? 'L' : st.dZ8 > 8 ? 'H' : '—', d5 = st.dZ8 + dTh, h5 = d5 < -8 ? 'L' : d5 > 8 ? 'H' : '—';
      oku({ 'kalınlık merkez / kenar': `${tr(km, 0)} / ${tr(kk, 0)} m`, 'T̄ merkez / kenar': `${tr(Tm, 1)} / ${tr(Tk, 1)} °C`, 'çekirdek': cek, '850 / 500 merkez': `${h8} / ${h5}` });
    }
    if (serbest) {
      const k = kontrol(kap);
      sT = surgu(k, 'δT̄', -16, 16, 0.5, st.dT, (v) => `${v > 0 ? '+' : ''}${tr(v, 1)} K`);
      sZ = surgu(k, 'δZ850', -240, 120, 10, st.dZ8, (v) => `${v > 0 ? '+' : ''}${v} m`);
      const k2 = kontrol(kap);
      for (const sis of ['S1', 'S2', 'S3', 'S4']) dugme(k2, sis, true).addEventListener('click', () => { kur(sis); sT.set(Math.round(st.dT * 2) / 2); sZ.set(st.dZ8); ciz(false); });
      sT.inp.addEventListener('input', () => { st.ad = ''; ciz(); }); sZ.inp.addEventListener('input', () => { st.ad = ''; ciz(); });
    }
    ciz();
  };
  Sekil.m302_cekirdek = function (kap) {
    const W = 640, H = 440;
    const svg = svgYap(kap, W, H, 'Dört sistem: sıcak ve soğuk çekirdekli alçak ve yüksek');
    const g = el('g'); svg.append(g);
    const vakalar = [['Sıcak çekirdekli alçak', 'Basra (yaz) · sığ', -60, 6], ['Soğuk çekirdekli yüksek', 'Sibirya (kış) · sığ', 60, -6], ['Soğuk çekirdekli alçak', 'İzlanda · derin', -60, -6], ['Sıcak çekirdekli yüksek', 'Azor · derin', 60, 6]];
    const pp = [[1000, 'yer'], [850, '850'], [700, '700'], [500, '500']];
    vakalar.forEach(([ad, alt, d0, dT], i) => {
      const x0 = 12 + (i % 2) * 318, y0 = 10 + Math.floor(i / 2) * 215, w = 300, cx = x0 + w / 2 + 20;
      g.append(el('rect', { x: x0, y: y0, width: w, height: 205, rx: 12, fill: dT > 0 ? 'var(--tur-zemin)' : 'var(--acc-zemin)', stroke: 'var(--cizgi)' }));
      yaz(g, x0 + 10, y0 + 20, ad, { k: 14, b: true, r: dT > 0 ? 'var(--tur)' : 'var(--acc)' });
      yaz(g, x0 + 10, y0 + 38, alt, { k: 12.5, r: 'var(--ikincil)' });
      pp.forEach(([p, et], j) => {
        const dz = d0 + 287 / 9.81 * Math.log(1000 / p) * dT, yb = y0 + 182 - j * 40;
        const pts = []; for (let x = x0 + 50; x <= x0 + w - 12; x += 5) pts.push([x, yb - dz * 0.17 * Math.exp(-(((x - cx) / 55) ** 2))]);
        g.append(el('path', { d: yol(pts), fill: 'none', stroke: 'var(--yazi)', 'stroke-width': 2 }));
        yaz(g, x0 + 10, yb + 4, et, { k: 12, r: 'var(--ikincil)' });
        const hh = dz < -10 ? 'L' : dz > 10 ? 'H' : '·';
        harf(g, cx + 42, yb - dz * 0.17 + 2, hh, HR(hh), 15);
      });
    });
  };

  /* ============================== TERMAL RÜZGÂR ============================== */
  Sekil.m302_termal = function (kap, ayar = {}) {
    const W = 640, H = 340, ox = 300, oy = 190, sc = 7;
    const svg = svgYap(kap, W, H, 'Termal rüzgâr: alt ve üst seviye rüzgârının vektör farkı');
    const g = el('g'); svg.append(g);
    const adim = ayar.adim ?? 3, serbest = ayar.adim == null;
    let dd = ayar.dd ?? 200, sd = null;
    const oku = okuma(kap, ['850 hPa', '500 hPa', 'yükseklikle', 'adveksiyon']);
    function ciz() {
      if (sd) dd = sd.v;
      g.innerHTML = '';
      kuzey(g, 24, 8);
      [3900, 3960, 4020, 4080, 4140].forEach((v, i) => { const y = 60 + i * 60; g.append(el('line', { x1: 60, x2: W - 70, y1: y, y2: y, stroke: 'var(--ikincil)', 'stroke-width': 1.4, 'stroke-dasharray': '10 6' })); yaz(g, W - 64, y + 4, `${v} m`, { k: 12.5, r: 'var(--ikincil)' }); });
      yaz(g, 60, 48, 'soğuk (ince tabaka)', { k: 13, b: true, r: 'var(--acc)' }); yaz(g, 60, H - 14, 'sıcak (kalın tabaka)', { k: 13, b: true, r: 'var(--tur)' });
      const b1 = dd + 180, V1 = [12 * Math.sin(b1 / R2D), 12 * Math.cos(b1 / R2D)], VT = [15, 0], V2 = [V1[0] + VT[0], V1[1] + VT[1]];
      const P = (v) => [ox + v[0] * sc, oy - v[1] * sc];
      const p1 = P(V1), p2 = P(V2);
      ok(g, ox, oy, p1[0], p1[1], 'var(--acc)', 3.6); hale(yaz(g, p1[0] - 10, p1[1] + (V1[1] >= 0 ? 4 : 18), '850 hPa', { k: 13.5, b: true, r: 'var(--acc)', h: 'end' }));
      if (adim >= 2) { ok(g, p1[0], p1[1], p2[0], p2[1], 'var(--yesil)', 3.2, true); hale(yaz(g, (p1[0] + p2[0]) / 2 + 10, p1[1] - 12, 'termal rüzgâr', { h: 'middle', k: 13, b: true, r: 'var(--yesil)' })); }
      const cr = V1[0] * V2[1] - V1[1] * V2[0];
      if (adim >= 3) {
        ok(g, ox, oy, p2[0], p2[1], 'var(--tur)', 3.8); hale(yaz(g, p2[0] + 8, p2[1] + (V2[1] >= 0 ? 14 : 18), '500 hPa', { k: 13.5, b: true, r: 'var(--tur)' }));
        const a1 = Math.atan2(-V1[1], V1[0]), a2 = Math.atan2(-V2[1], V2[0]), r = 40;
        let da = a2 - a1; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
        if (Math.abs(da) > 0.03) g.append(el('path', { d: `M${ox + r * Math.cos(a1)},${oy + r * Math.sin(a1)} A${r},${r} 0 0 ${da > 0 ? 1 : 0} ${ox + r * Math.cos(a2)},${oy + r * Math.sin(a2)}`, fill: 'none', stroke: 'var(--yazi)', 'stroke-width': 2 }));
      }
      nokta(g, ox, oy, 5);
      const dd2 = ((Math.atan2(-V2[0], -V2[1]) * R2D) % 360 + 360) % 360;
      const don = Math.abs(cr) < 1 ? 'dönmüyor (yalnız hızlanıyor)' : cr < 0 ? 'saat yönünde: veering' : 'saat yönünün tersine: backing';
      const adv = V1[1] > 0.3 ? 'sıcak (W)' : V1[1] < -0.3 ? 'soğuk (C)' : 'yok (0)';
      oku({ '850 hPa': `${ruzAdi(dd)} (${dd}°'den)`, '500 hPa': adim >= 3 ? `${ruzAdi(dd2)} (${tr(dd2, 0)}°'den)` : '—', 'yükseklikle': adim >= 3 ? don : '—', 'adveksiyon': adim >= 3 ? adv : '—' });
    }
    if (serbest) { const k = kontrol(kap); sd = surgu(k, '850 hPa yönü', 0, 355, 5, dd, (v) => `${v}°`); sd.inp.addEventListener('input', ciz); }
    ciz();
  };

  /* ============================== BAROTROPİK / BAROKLİNİK (S9) ============================== */
  Sekil.m302_baro = function (kap, ayar = {}) {
    const W = 640, H = 360, cx = 320, cy = 185;
    const svg = svgYap(kap, W, H, 'Kapalı alçak, konturlar ve izotermler: baroklinik ya da eşdeğer barotropik');
    const g = el('g'); svg.append(g);
    const TUR = ['baroklinik', 'esdeger', 'barotrop'];
    let tur = Math.max(0, TUR.indexOf(ayar.tur || 'baroklinik'));
    function ciz() {
      g.innerHTML = '';
      kuzey(g, 26, 8);
      [[50, 540], [105, 546], [160, 552]].forEach(([r, v]) => { g.append(el('circle', { cx, cy, r, fill: 'none', stroke: 'var(--yazi)', 'stroke-width': 2 })); const t = yaz(g, cx, cy - r + 5, String(v), { h: 'middle', k: 12.5, b: true }); t.setAttribute('paint-order', 'stroke'); t.setAttribute('stroke', 'var(--yuzey)'); t.setAttribute('stroke-width', 5); });
      harf(g, cx, cy + 9, 'L', 'var(--acc)', 26);
      const iz = { stroke: 'var(--yesil)', 'stroke-width': 2, 'stroke-dasharray': '9 6', fill: 'none' };
      let sonuc = ['0', '0'];
      if (tur === 0) { [[85, '−24 °C'], [185, '−18 °C'], [285, '−12 °C']].forEach(([y, t]) => { g.append(el('line', { x1: 40, x2: W - 70, y1: y, y2: y, ...iz })); yaz(g, W - 66, y + 4, t, { k: 12.5, b: true, r: 'var(--yesil)' }); }); sonuc = ['C (kuzeyden soğuk)', 'W (güneyden ılık)']; }
      if (tur === 1) { [[78, '−30'], [133, '−24']].forEach(([r, t]) => { g.append(el('circle', { cx, cy, r, ...iz })); yaz(g, cx + r * 0.72 + 4, cy + r * 0.72 + 4, `${t} °C`, { k: 12.5, b: true, r: 'var(--yesil)' }); }); yaz(g, W - 16, H - 30, 'dışarısı −18 °C', { h: 'end', k: 12.5, b: true, r: 'var(--yesil)' }); }
      if (tur === 2) yaz(g, W - 16, H - 30, '500 hPa yüzeyinde T her yerde aynı', { h: 'end', k: 12.5, b: true, r: 'var(--yesil)' });
      for (const [ad, x, yon, i] of [['W', cx - 160, 1, 0], ['E', cx + 160, -1, 1]]) {
        ok(g, x, cy - yon * 32, x, cy + yon * 32, 'var(--tur)', 3.4);
        nokta(g, x, cy, 5.5, 'var(--yazi)');
        yaz(g, x + (i ? 12 : -12), cy - 40, ad, { h: i ? 'start' : 'end', k: 16, b: true });
        const t = yaz(g, x, cy + 58, sonuc[i], { h: 'middle', k: 13.5, b: true, r: sonuc[i].startsWith('C') ? 'var(--acc)' : sonuc[i].startsWith('W') ? 'var(--tur)' : 'var(--ikincil)' }); t.setAttribute('paint-order', 'stroke'); t.setAttribute('stroke', 'var(--yuzey)'); t.setAttribute('stroke-width', 5);
      }
      yaz(g, W - 16, 26, ['baroklinik: kontur izotermi kesiyor', 'eşdeğer barotropik: paralel', 'barotropik (ideal)'][tur], { h: 'end', k: 14, b: true });
      yaz(g, 16, H - 10, 'düz = kontur (dam) · kesik = izoterm', { k: 12.5, r: 'var(--ikincil)' });
    }
    ciz();
    if (!ayar.sabit) { const k = kontrol(kap); secenek(k, ['Baroklinik (S9-A)', 'Eşdeğer barotropik (S9-B)', 'Barotropik'], tur, (i) => { tur = i; ciz(); }); }
  };

  /* ============================== DÜŞEY EKSEN (S10) ============================== */
  const S10 = { A: { 500: [528, 540, 552], 850: [147, 141, 147], yer: [1012, 1008, 996] }, B: { 500: [546, 534, 546], 850: [153, 144, 153], yer: [1010, 998, 1010] } };
  Sekil.m302_egim = function (kap, ayar = {}) {
    const W = 640, H = 340;
    const svg = svgYap(kap, W, H, 'Batı-doğu kesitinde her seviyenin merkezi ve sistemin düşey ekseni');
    const g = el('g'); svg.append(g);
    const serbest = ayar.adim == null;
    let sis = ayar.sistem === 'B' ? 'B' : ayar.sistem === 'M' ? 'M' : 'A', adim = ayar.adim ?? 3, sS = null, k2 = null;
    const satir = [['500', '500 hPa (dam)', 80], ['850', '850 hPa (dam)', 170], ['yer', 'yer (hPa)', 260]], kol = [200, 350, 500];
    function cizTablo() {
      const D = S10[sis];
      ['batı (W)', 'orta', 'doğu (E)'].forEach((t, j) => yaz(g, kol[j], 34, t, { h: 'middle', k: 13.5, b: true, r: 'var(--ikincil)' }));
      const m = {};
      for (const [k, ad, y] of satir) {
        yaz(g, 12, y + 5, ad, { k: 13, b: true, r: 'var(--ikincil)' });
        const v = D[k], j = v.indexOf(Math.min(...v)); m[k] = [kol[j], y];
        v.forEach((x, i) => yaz(g, kol[i], y + 6, String(x), { h: 'middle', k: 17, b: true }));
        if (adim >= 2) { g.append(el('circle', { cx: kol[j], cy: y, r: 26, fill: 'none', stroke: 'var(--acc)', 'stroke-width': 2.6 })); yaz(g, kol[j] + 32, y - 12, 'L', { k: 15, b: true, r: 'var(--acc)' }); }
      }
      if (adim >= 3) {
        const a = m.yer, b = m['850'], c = m['500'];
        const kis = (p, q) => { const L = Math.hypot(q[0] - p[0], q[1] - p[1]), ux = (q[0] - p[0]) / L, uy = (q[1] - p[1]) / L; return [p[0] + ux * 28, p[1] + uy * 28, q[0] - ux * 28, q[1] - uy * 28]; };
        const s1 = kis(a, b), s2 = kis(b, c);
        g.append(el('line', { x1: s1[0], y1: s1[1], x2: s1[2], y2: s1[3], stroke: 'var(--tur)', 'stroke-width': 3 }));
        ok(g, s2[0], s2[1], s2[2], s2[3], 'var(--tur)', 3);
        const kal = D['500'].map((v, i) => v * 10 - D['850'][i] * 10);
        yaz(g, 12, 318, `kalınlık (m): ${kal.join(' · ')}`, { k: 13.5, b: true });
        yaz(g, W - 12, 318, c[0] < a[0] ? 'eksen batıya eğik: baroklinik, gelişen' : 'eksen düşey: eşdeğer barotropik, olgun', { h: 'end', k: 13.5, b: true, r: 'var(--tur)' });
      }
    }
    function cizModel() {
      const s = sS ? sS.v : 0.5, a = 0.004, x0 = 420, cc = [0, 0.163, 0.693];
      const yb = [262, 172, 82];
      const pts = [];
      ['yer', '850 hPa', '500 hPa'].forEach((ad, i) => {
        const f = (x) => a * (x - x0) ** 2 + s * cc[i] * (x - 330) * 0.9;
        const xm = x0 - s * cc[i] * 0.9 / (2 * a), fm = f(xm);
        const p = []; for (let x = 70; x <= W - 30; x += 5) p.push([x, yb[i] - Math.min(60, (f(x) - fm) * 0.35)]);
        g.append(el('path', { d: yol(p), fill: 'none', stroke: 'var(--yazi)', 'stroke-width': 2.2 }));
        yaz(g, 12, yb[i] - 20, ad, { k: 13, b: true, r: 'var(--ikincil)' });
        nokta(g, xm, yb[i], 6, 'var(--acc)'); yaz(g, xm + 10, yb[i] + 20, 'L', { k: 14, b: true, r: 'var(--acc)' });
        pts.push([xm, yb[i]]);
      });
      g.append(el('path', { d: yol(pts), fill: 'none', stroke: 'var(--tur)', 'stroke-width': 3 }));
      yaz(g, 12, 318, `500 hPa merkezi yerdekinden ${tr((pts[0][0] - pts[2][0]) * 10, 0)} km batıda`, { k: 13.5, b: true, r: 'var(--tur)' });
      yaz(g, W - 12, 318, 'batı soğuk ←  → doğu sıcak', { h: 'end', k: 13, r: 'var(--ikincil)' });
    }
    function ciz() { g.innerHTML = ''; if (sis === 'M') cizModel(); else cizTablo(); if (k2) k2.style.display = sis === 'M' ? '' : 'none'; }
    if (serbest) {
      const k = kontrol(kap);
      secenek(k, ['S10-A', 'S10-B', 'Model'], ['A', 'B', 'M'].indexOf(sis), (i) => { sis = ['A', 'B', 'M'][i]; ciz(); });
      k2 = kontrol(kap); sS = surgu(k2, 'Batı-doğu sıcaklık farkı', 0, 1, 0.05, 0.5, (v) => (v === 0 ? 'yok' : tr(v, 2)));
      sS.inp.addEventListener('input', ciz);
    }
    ciz();
  };

  /* ============================== SYNOP ============================== */
  const SYN = [
    [['AAXX', 0, 'Kara istasyonu SYNOP mesajı (gemiden gelirse BBXX).'], ['09124', 0, 'YY = 09 → ayın 9\'u · GG = 12 → 12 UTC · iw = 4 → rüzgâr knot, anemometreyle ölçülmüş.'], ['17064', 0, 'II = 17 Türkiye bloğu · iii = 064 istasyon numarası (İstanbul/Kartal).']],
    [['12960', 1, 'iR = 1 yağış grubu Kısım 1\'de · ix = 2 insanlı, önemli hava yok (7 grubu yok) · h = 9 en alçak bulut ≥ 2500 m ya da bulut yok · VV = 60 → 60 − 50 = 10 km.'], ['32002', 1, 'N = 3 okta · dd = 20 → 200°\'den (güney-güneybatı) · ff = 02 → 2 knot.'], ['10139', 1, '1 sıcaklık · sn = 0 artı · 139 → +13,9 °C.'], ['21003', 1, '2 çiy noktası · sn = 1 eksi · 003 → −0,3 °C. T − Td = 14,2 °C: hava çok kuru.']],
    [['30246', 1, '3 istasyon basıncı · 0246 → 1024,6 hPa.'], ['40268', 1, '4 deniz seviyesi basıncı · 0268 → 1026,8 hPa. Haritaya bu girer; modelde «268».'], ['57020', 1, '5 basınç eğilimi · a = 7 düşüş · ppp = 020 → son 3 saatte 2,0 hPa düştü (modelde «−20»).'], ['60001', 1, '6 yağış · RRR = 000 → yağış yok (ulusal kod tablosu) · tR = 1 → son 6 saat.']],
    [['80004', 1, '8 bulut · Nh = 0 alçak ve orta bulut yok · CL = 0 · CM = 0 · CH = 4: sirrus gökyüzünü giderek kaplıyor.'], ['333', 3, 'Kısım 3 başlıyor: bölgesel ve ek gruplar.'], ['83070', 3, '8 bulut katı · Ns = 3 okta · C = 0 sirrus · hshs = 70 → (70 − 50) × 300 = 6000 m.'], ['90760', 3, '907tt · tt = 60 → 60 × 6 dk = 6 saat: bir sonraki grubun dönemi.'], ['91106', 3, '911ff · o 6 saatte en büyük hamle 06 knot.']],
  ];
  Sekil.m302_synop = function (kap) {
    const W = 640, H = 250;
    const svg = svgYap(kap, W, H, 'Örnek SYNOP mesajı grup grup; bir gruba bas');
    const g = el('g'); svg.append(g);
    const not = notKutu(kap);
    const RK = { 0: 'var(--acc)', 1: 'var(--yazi)', 3: 'var(--tur)' };
    const kutular = [];
    const sec = (i) => { kutular.forEach((k, j) => { k.r.setAttribute('stroke-width', j === i ? 3.4 : 1.6); k.r.setAttribute('fill', j === i ? 'var(--acc-zemin)' : 'var(--yuzey)'); }); const k = kutular[i]; not.innerHTML = `<b>${k.kod}</b> · ${k.ad}`; };
    SYN.forEach((sat, r) => {
      let x = 14; const y = 18 + r * 56;
      for (const [kod, ks, ad] of sat) {
        const w = 15.5 * kod.length + 26, gg = el('g', { tabindex: 0, role: 'button', 'aria-label': `${kod}: ${ad}`, style: 'cursor:pointer' });
        const rct = el('rect', { x, y, width: w, height: 42, rx: 8, fill: 'var(--yuzey)', stroke: RK[ks], 'stroke-width': 1.6 });
        gg.append(rct);
        gg.append(el('text', { x: x + w / 2, y: y + 29, 'text-anchor': 'middle', 'font-family': 'ui-monospace,Consolas,Menlo,monospace', 'font-size': 23, 'font-weight': 700, fill: RK[ks] }, kod));
        const i = kutular.length; kutular.push({ r: rct, kod, ad });
        gg.addEventListener('click', () => sec(i)); gg.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sec(i); } });
        g.append(gg); x += w + 12;
      }
    });
    yaz(g, W - 12, H - 6, 'mavi: kimlik (Kısım 0) · siyah: Kısım 1 · turuncu: Kısım 3', { h: 'end', k: 12.5, r: 'var(--ikincil)' });
    sec(3);
  };

  /* ============================== İSTASYON MODELİ ============================== */
  Sekil.m302_model = function (kap, ayar = {}) {
    const W = 640, H = 360, cx = 300, cy = 170, r = 22, adim = ayar.adim ?? 9;
    const svg = svgYap(kap, W, H, 'Örnek mesajın istasyon modeli');
    const g = el('g'); svg.append(g);
    kuzey(g, 26, 8);
    const not = adim >= 9 ? notKutu(kap) : null;
    if (not) not.textContent = 'Bir değerin üstüne gel ya da dokun: hangi gruptan geldiği burada yazar.';
    const parca = (acik, ...els) => { const gg = el('g', { style: 'cursor:help' }); els.forEach((e) => gg.append(e)); if (not) { const f = () => { not.textContent = acik; }; gg.addEventListener('pointerenter', f); gg.addEventListener('click', f); } g.append(gg); return gg; };
    const T = (x, y, s, o = {}) => el('text', { x, y, 'font-family': F, 'font-size': o.k || 26, 'font-weight': 700, fill: o.r || 'var(--yazi)', 'text-anchor': o.h || 'start' }, s);
    if (adim >= 1) parca('Daire: toplam bulut N = 3 okta (32002 grubunun ilk hanesi). Dörtte bir dolu + bir çizgi.', el('circle', { cx, cy, r, fill: 'var(--yuzey)', stroke: 'var(--yazi)', 'stroke-width': 2.6 }), el('path', { d: `M${cx},${cy} L${cx},${cy - r} A${r},${r} 0 0 1 ${cx + r},${cy} Z`, fill: 'var(--yazi)' }), el('line', { x1: cx, y1: cy, x2: cx, y2: cy + r, stroke: 'var(--yazi)', 'stroke-width': 2.6 }));
    if (adim >= 2) { const [ux, uy] = yv(200); parca('Rüzgâr çubuğu: 200°\'den (güney-güneybatı) 2 knot (32002). 5 knot altı: tüysüz yalnız çubuk; çubuk rüzgârın geldiği yöne uzanır.', el('line', { x1: cx + ux * r, y1: cy + uy * r, x2: cx + ux * 140, y2: cy + uy * 140, stroke: 'var(--yazi)', 'stroke-width': 2.8 })); }
    if (adim >= 3) { parca('Sol üst: sıcaklık 14 °C (10139 → +13,9 °C, tam sayıya yuvarlanır).', T(cx - 38, cy - 12, '14', { h: 'end' })); parca('Sol alt: çiy noktası 0 °C (21003 → −0,3 °C). T − Td = 14,2 °C: çok kuru.', T(cx - 38, cy + 40, '0', { h: 'end' })); }
    if (adim >= 4) parca('Sağ üst: deniz seviyesi basıncı 1026,8 hPa (40268) → son üç hane «268».', T(cx + 34, cy - 12, '268'));
    if (adim >= 5) parca('Sağ: 3 saatlik eğilim −2,0 hPa (57020) → «−20»; çizgi düşüşü gösterir (a = 7).', T(cx + 40, cy + 22, '−20', { k: 24 }), el('line', { x1: cx + 104, y1: cy + 4, x2: cx + 122, y2: cy + 22, stroke: 'var(--yazi)', 'stroke-width': 2.8 }));
    if (adim >= 6) {
      parca('Sol: görüş kodu VV = 60 → 10 km (12960).', T(cx - 92, cy + 12, '60', { h: 'end', k: 22, r: 'var(--ikincil)' }));
      parca('Üst: yüksek bulut CH = 4 (80004): sirrus gökyüzünü giderek kaplıyor.', el('path', { d: `M${cx - 18},${cy - 58} L${cx + 8},${cy - 58} L${cx + 18},${cy - 72}`, fill: 'none', stroke: 'var(--yazi)', 'stroke-width': 2.6 }), T(cx + 28, cy - 60, 'CH = 4', { k: 15, r: 'var(--ikincil)' }));
      parca('Alt: en alçak bulut tabanı h = 9 (≥ 2500 m ya da bulut yok).', T(cx + 44, cy + 82, 'h = 9', { k: 15, r: 'var(--ikincil)' }));
    }
    yaz(g, W - 14, H - 10, 'AAXX 09124 17064 12960 32002 10139 21003 30246 40268 57020 …', { h: 'end', k: 12.5, r: 'var(--ikincil)' });
  };

  /* ============================== ANİMASYON: jeostrofik uyum ============================== */
  Anim.m302_jeoayar = function (kap) {
    const W = 640, H = 340, mx0 = 30, mx1 = 400, mcy = 175, S = 40, hx = 520, hy = 175, hs = 55;
    const svg = svgYap(kap, W, H, 'Durgun parselin basınç alanına uyumu: eylemsizlik salınımı ve jeostrofik denge');
    const zem = el('g'), g = el('g'); svg.append(zem, g);
    kuzey(zem, 14, 6);
    for (let j = -2; j <= 2; j++) { const y = mcy - j * S; zem.append(el('line', { x1: mx0, x2: mx1, y1: y, y2: y, stroke: 'var(--ikincil)', 'stroke-width': 1.3 })); yaz(zem, mx1 + 4, y + 4, String(1008 - 4 * j), { k: 12, r: 'var(--ikincil)' }); }
    harf(zem, mx0 + 30, 30, 'L', 'var(--acc)', 18);
    zem.append(el('line', { x1: hx - 100, x2: hx + 105, y1: hy, y2: hy, stroke: 'var(--cizgi)' })); zem.append(el('line', { x1: hx, x2: hx, y1: hy - 140, y2: hy + 140, stroke: 'var(--cizgi)' }));
    yaz(zem, hx, 22, 'hız uzayı (u, v)', { h: 'middle', k: 13, b: true, r: 'var(--ikincil)' });
    nokta(zem, hx + hs, hy, 6, 'var(--tur)'); yaz(zem, hx + hs + 8, hy + 20, 'V_g', { k: 13, b: true, r: 'var(--tur)' });
    const k = kontrol(kap);
    const b = dugme(k, '▶ Oynat');
    const bs = dugme(k, 'Baştan', true);
    let kk = 0;
    secenek(k, ['Sürtünme yok', 'Sürtünme var'], 0, (i) => { kk = i ? 0.35 : 0; sifirla(); });
    const oku = okuma(kap, ['süre (45° K)', '|V| / V_g', 'izobarla açı']);
    let t, u, v, x, y, iz, hiz;
    function sifirla() { t = 0; u = 0; v = 0; x = 0; y = -1; iz = [[]]; hiz = []; ciz(); }
    function ciz() {
      g.innerHTML = '';
      const px = mx0 + 10 + (((x * S) % (mx1 - mx0 - 20)) + (mx1 - mx0 - 20)) % (mx1 - mx0 - 20), yy = (((y + 2) % 4) + 4) % 4 - 2, py = mcy - yy * S;
      for (const seg of iz) if (seg.length > 1) g.append(el('path', { d: yol(seg), fill: 'none', stroke: 'var(--yesil)', 'stroke-width': 2 }));
      if (hiz.length > 1) g.append(el('path', { d: yol(hiz), fill: 'none', stroke: 'var(--yesil)', 'stroke-width': 2 }));
      const L = 34;
      ok(g, px, py, px, py - L, 'var(--tur)', 2.6);
      ok(g, px, py, px + v * L, py + u * L, 'var(--acc)', 2.6);
      if (kk > 0) ok(g, px, py, px - kk * u * L, py + kk * v * L, 'var(--ikincil)', 2.6);
      ok(g, px, py, px + u * L, py - v * L, 'var(--yazi)', 3.2);
      nokta(g, px, py, 5.5, 'var(--yazi)');
      ok(g, hx, hy, hx + u * hs, hy - v * hs, 'var(--yazi)', 2.6);
      yaz(g, 30, H - 10, 'turuncu: BGK · mavi: Coriolis' + (kk > 0 ? ' · gri: sürtünme' : '') + ' · siyah: rüzgâr', { k: 12.5, r: 'var(--ikincil)' });
      const sp = Math.hypot(u, v);
      oku({ 'süre (45° K)': `${tr(t / 1.031e-4 / 3600, 1)} saat`, '|V| / V_g': tr(sp, 2), 'izobarla açı': sp > 0.05 ? `${tr(Math.atan2(v, u) * R2D, 0)}°` : '—' });
      return [px, py];
    }
    function adim(dt) {
      const h = dt * 1.6, n = 8;
      for (let i = 0; i < n; i++) { const e = h / n, du = v - kk * u, dv = 1 - u - kk * v; u += du * e; v += dv * e; x += u * e; y += v * e; t += e; }
      const [px, py] = ciz();
      const son = iz[iz.length - 1], o = son[son.length - 1];
      if (o && (Math.abs(o[0] - px) > 40 || Math.abs(o[1] - py) > 40)) iz.push([[px, py]]); else son.push([px, py]);
      if (iz.length > 6) iz.shift();
      hiz.push([hx + u * hs, hy - v * hs]); if (hiz.length > 900) hiz.shift();
      return t < 30;
    }
    bs.addEventListener('click', sifirla);
    sifirla();
    const d = dongu(b, (dt) => adim(dt));
    d.bas();
    return { dur: () => d.dur() };
  };

  /* ============================== ANİMASYON: H/L çevresinde sarmal + kesit ============================== */
  Anim.m302_sarmal = function (kap) {
    const W = 640, H = 400, C = [[165, 140, 'H', -1], [475, 140, 'L', 1]];
    const svg = svgYap(kap, W, H, 'H ve L çevresinde yer rüzgârı: sürtünmeyle dışa ve içe sarmal; kesitte düşey hareket');
    const zem = el('g'), g = el('g'); svg.append(zem, g);
    kuzey(zem, 22, 6);
    for (const [cx, cy, ad] of C) { for (const r of [40, 80, 118]) zem.append(el('circle', { cx, cy, r, fill: 'none', stroke: 'var(--ikincil)', 'stroke-width': 1.2, 'stroke-dasharray': '5 5' })); harf(zem, cx, cy + 9, ad, HR(ad), 26); }
    const Y0 = 388, YT = 290;
    zem.append(el('rect', { x: 20, y: Y0, width: W - 40, height: 8, fill: 'var(--cizgi)' }));
    yaz(zem, 24, YT - 6, 'düşey kesit', { k: 12.5, b: true, r: 'var(--ikincil)' });
    const k = kontrol(kap);
    const b = dugme(k, '▶ Oynat');
    let al = 30 / R2D;
    secenek(k, ['Sürtünme var (yer)', 'Sürtünme yok (üst seviye)'], 0, (i) => { al = i ? 0 : 30 / R2D; });
    const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    const P = []; for (const c of C) for (let i = 0; i < 26; i++) P.push({ c, r: 20 + rnd() * 96, th: rnd() * 2 * Math.PI });
    const D = []; for (const c of C) for (const dx of [-24, 0, 24]) for (let j = 0; j < 3; j++) D.push({ c, x: c[0] + dx, y: YT + j * 30 });
    const V = 60;
    function ciz() {
      g.innerHTML = '';
      for (const p of P) {
        const [cx, cy, ad, yon] = p.c, x = cx + p.r * Math.cos(p.th), y = cy - p.r * Math.sin(p.th);
        const tb = p.th - yon * V * Math.cos(al) / p.r * 0.22, rb = p.r + (ad === 'L' ? 1 : -1) * V * Math.sin(al) * 0.22;
        g.append(el('line', { x1: cx + rb * Math.cos(tb), y1: cy - rb * Math.sin(tb), x2: x, y2: y, stroke: HR(ad), 'stroke-width': 2, opacity: 0.6 }));
        g.append(el('circle', { cx: x, cy: y, r: 3.4, fill: HR(ad) }));
      }
      if (al > 0) for (const d of D) { const ad = d.c[2]; g.append(el('circle', { cx: d.x, cy: d.y, r: 3.4, fill: HR(ad) })); }
      for (const [cx, , ad] of C) {
        if (al > 0) ok(g, cx + 50, ad === 'L' ? Y0 - 20 : YT + 10, cx + 50, ad === 'L' ? YT + 10 : Y0 - 20, HR(ad), 2.6);
        yaz(g, cx + 64, (YT + Y0) / 2 + 4, al > 0 ? (ad === 'L' ? 'yükselme' : 'çökme') : 'düşey yok', { k: 13, b: true, r: HR(ad) });
        yaz(g, cx, 278, al > 0 ? (ad === 'L' ? 'içe sarmal · CONV' : 'dışa sarmal · DIV') : 'daire · izobara paralel', { h: 'middle', k: 13.5, b: true, r: HR(ad) });
      }
    }
    function adim(dt) {
      for (const p of P) {
        const [, , ad, yon] = p.c;
        p.th += yon * V * Math.cos(al) / p.r * dt;
        p.r += (ad === 'L' ? -1 : 1) * V * Math.sin(al) * dt;
        if (p.r < 16) { p.r = 116; p.th = rnd() * 2 * Math.PI; }
        if (p.r > 118) { p.r = 18; p.th = rnd() * 2 * Math.PI; }
      }
      for (const d of D) { const L = d.c[2] === 'L'; d.y += (L ? -1 : 1) * 32 * dt; if (d.y < YT) d.y = Y0 - 14; if (d.y > Y0 - 14) d.y = YT; }
      ciz(); return true;
    }
    ciz();
    const d = dongu(b, adim);
    d.bas();
    return { dur: () => d.dur() };
  };

  /* ============================== ANİMASYON: trof–sırt dalgasında akış ============================== */
  Anim.m302_dalgaakis = function (kap) {
    const W = 640, H = 340, xa = 40, A = 46;
    const svg = svgYap(kap, W, H, '500 hPa dalgasında parçacıklar: trofta yavaş, sırtta hızlı; trof önünde ıraksama');
    const zem = el('g'), g = el('g'); svg.append(zem, g);
    kuzey(zem, 22, 4);
    const yc = (i, x) => 110 + i * 70 - A * Math.cos(DK * (x - DX0));
    const c = (x) => 70 * (1 + 0.45 * Math.cos(DK * (x - DX0)));
    for (let i = 0; i < 3; i++) { const p = []; for (let x = xa; x <= xa + DLAM; x += 5) p.push([x, yc(i, x)]); zem.append(el('path', { d: yol(p), fill: 'none', stroke: 'var(--cizgi)', 'stroke-width': 2 })); }
    for (const [x, r, d, ad] of [[DX0, 'var(--tur)', '1 7', 'SIRT · hızlı'], [DX0 + DLAM / 2, 'var(--acc)', '12 7', 'TROF · yavaş']]) { zem.append(el('line', { x1: x, x2: x, y1: 40, y2: 300, stroke: r, 'stroke-width': 3, 'stroke-dasharray': d, 'stroke-linecap': 'round' })); yaz(zem, x, 322, ad, { h: 'middle', k: 13.5, b: true, r }); }
    for (const [x, ad, r] of [[310, 'CONV ↓ (trof arkası)', 'var(--tur)'], [545, 'DIV ↑', 'var(--acc)']]) { const t = yaz(zem, x, 36, ad, { h: 'middle', k: 14, b: true, r }); t.setAttribute('paint-order', 'stroke'); t.setAttribute('stroke', 'var(--yuzey)'); t.setAttribute('stroke-width', 5); }
    yaz(zem, 545, 54, '(trof önü)', { h: 'middle', k: 12.5, r: 'var(--acc)' });
    // eşit zaman aralıklı başlangıç
    const tab = []; let tt = 0; for (let x = xa; x < xa + DLAM; x += 1) { tab.push([tt, x]); tt += 1 / c(x); }
    const Tt = tt, N = 13, X = [];
    for (let i = 0; i < 3; i++) for (let j = 0; j < N; j++) { const hedef = (j + i * 0.33) / N * Tt; let q = tab.find((e) => e[0] >= hedef % Tt); X.push({ i, x: q ? q[1] : xa }); }
    const k = kontrol(kap); const b = dugme(k, '▶ Oynat');
    function ciz() { g.innerHTML = ''; for (const p of X) g.append(el('circle', { cx: p.x, cy: yc(p.i, p.x), r: 5, fill: 'var(--yazi)' })); }
    function adim(dt) { for (const p of X) { p.x += c(p.x) * dt; if (p.x >= xa + DLAM) p.x -= DLAM; } ciz(); return true; }
    ciz();
    const d = dongu(b, adim);
    d.bas();
    return { dur: () => d.dur() };
  };
})();
