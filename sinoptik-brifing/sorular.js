// Sinoptik soru çözümleri — şekiller: kendi SVG çizimimiz (dış görsel yok). Veri: soru-veri.js (window.SORU_VERI).
// Her soru: verilenler (her zaman görünür) + çözüm katmanları (.sc-k, data-k). app.js adım adım katmanları açar:
// o adımın katmanı turuncu yanar (.yan), önceki adımlarınki mavi kalır (.eski).
// Motor.el / Motor.yazi / Motor.izolin yeniden kullanılır (izobarlar haritalarla aynı marching squares'le çizilir).
(function () {
  'use strict';
  const M = window.Motor, el = M.el, yazi = M.yazi;
  const R = Math.PI / 180;

  function yeni(w, h, ad) {
    const svg = el('svg', { viewBox: `0 0 ${w} ${h}`, class: 'sc-svg', role: 'img', 'aria-label': ad });
    el('rect', { x: 0, y: 0, width: w, height: h, rx: 10, class: 'sc-zemin' }, svg);
    return svg;
  }
  const t = (g, x, y, s, at) => yazi(g, x, y, s, Object.assign({ class: 'sc-t' }, at));
  const cizgi = (g, pts, at) => el('path', Object.assign({ d: 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L'), fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, at), g);
  // ok: gövde + elle üçgen uç (marker yok: tema/rengi currentColor'dan alır)
  function ok(g, x1, y1, x2, y2, at) {
    at = at || {}; const k = el('g', { class: 'sc-ok' }, g), w = at.w || 2.6, u = at.uc || 11;
    const L = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / L, uy = (y2 - y1) / L;
    el('line', { x1, y1, x2: x2 - ux * u * 0.8, y2: y2 - uy * u * 0.8, stroke: 'currentColor', 'stroke-width': w, 'stroke-dasharray': at.kesik || null }, k);
    el('path', { d: `M${x2} ${y2}L${x2 - ux * u - uy * u * 0.5} ${y2 - uy * u + ux * u * 0.5}L${x2 - ux * u + uy * u * 0.5} ${y2 - uy * u - ux * u * 0.5}Z`, fill: 'currentColor' }, k);
    return k;
  }
  const cift = (g, x, y1, y2) => { ok(g, x, (y1 + y2) / 2, x, y1, { w: 2.2, uc: 9 }); ok(g, x, (y1 + y2) / 2, x, y2, { w: 2.2, uc: 9 }); };
  const kutu = (g, x, y, s, at) => { const k = el('g', {}, g); const w = 12 + s.length * (at && at.fs ? at.fs * 0.6 : 10.5); el('rect', { x: x - w / 2, y: y - 17, width: w, height: 26, rx: 6, fill: 'var(--kagit)', stroke: 'currentColor', 'stroke-width': 2 }, k); t(k, x, y + 2, s, { 'text-anchor': 'middle', class: 'sc-t sc-kalin', style: at && at.fs ? `font-size:${at.fs}px` : null }); return k; };
  const kuzey = (g, x, y) => { ok(g, x, y + 30, x, y, { w: 2, uc: 9 }); t(g, x, y - 6, 'N', { 'text-anchor': 'middle', class: 'sc-t sc-kucuk' }); };
  function katmanlar(svg, adlar) { const k = {}; adlar.forEach((a) => (k[a] = el('g', { class: 'sc-k', 'data-k': a }, svg))); return k; }

  // ───────── S1 · izobar analizi
  const P1 = [[1009, 1018, 1021, 1018, 1009], [1013.5, 1022.5, 1025.5, 1022.5, 1013.5], [1015, 1024, 1027, 1024, 1015], [1013.5, 1022.5, 1025.5, 1022.5, 1013.5], [1009, 1018, 1021, 1018, 1009]];
  function s1() {
    const svg = yeni(520, 510, 'Deniz seviyesi basıncı, 5 × 5 istasyon'), X0 = 60, Y0 = 82, DX = 100, DY = 95;
    const sx = (c) => X0 + c * DX, sy = (r) => Y0 + r * DY;
    const v = el('g', {}, svg);
    t(v, 260, 32, 'Deniz seviyesi basıncı (hPa)', { 'text-anchor': 'middle', class: 'sc-t sc-baslik' }); kuzey(v, 494, 30);
    for (let i = 0; i < 5; i++) { cizgi(v, [[sx(0), sy(i)], [sx(4), sy(i)]], { class: 'sc-ince' }); cizgi(v, [[sx(i), sy(0)], [sx(i), sy(4)]], { class: 'sc-ince' }); }
    const K = katmanlar(svg, ['ornek', 'i1024', 'i1020', 'i1016', 'sik', 'H']);
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) { el('circle', { cx: sx(c), cy: sy(r), r: 4, fill: 'currentColor' }, v); t(v, sx(c), sy(r) - 10, P1[r][c].toFixed(1).replace('.', ','), { 'text-anchor': 'middle', class: 'sc-t sc-deger' }); }
    // istasyonlar arası doğrusal (bilineer) alan → Motor.izolin: çizgi istasyon çizgilerini basit orantının verdiği yerden keser
    const a = 4, nx = 4 * DX / a + 1, ny = 4 * DY / a + 1, val = new Float64Array(nx * ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const fx = Math.min(i * a / DX, 3.9999), fy = Math.min(j * a / DY, 3.9999), c0 = Math.floor(fx), r0 = Math.floor(fy), tx = fx - c0, ty = fy - r0;
      val[j * nx + i] = (1 - ty) * ((1 - tx) * P1[r0][c0] + tx * P1[r0][c0 + 1]) + ty * ((1 - tx) * P1[r0 + 1][c0] + tx * P1[r0 + 1][c0 + 1]);
    }
    const G = { nx, ny, v: val, adim: a };
    // elle analizdeki gibi: izolinin istasyon çizgilerini kestiği yerleri TAM orantıyla hesapla, eğriyi o noktalardan geçir
    const kesisim = (l, lev) => {
      const q = [], ekle = (x, y) => { const s = q[q.length - 1]; if (!s || Math.hypot(s[0] - x, s[1] - y) > 3) q.push([x, y]); };
      for (let i = 1; i < l.length; i++) {
        const [ax, ay] = l[i - 1], [bx, by] = l[i];
        if (ax !== bx) for (let c = Math.ceil(Math.min(ax, bx) / DX); c * DX <= Math.max(ax, bx) && c <= 4; c++) { const y = ay + (c * DX - ax) / (bx - ax) * (by - ay), r = Math.max(0, Math.min(Math.floor(y / DY), 3)), p1 = P1[r][c], p2 = P1[r + 1][c]; if (p1 !== p2) ekle(c * DX, (r + (lev - p1) / (p2 - p1)) * DY); }
        if (ay !== by) for (let r = Math.ceil(Math.min(ay, by) / DY); r * DY <= Math.max(ay, by) && r <= 4; r++) { const x = ax + (r * DY - ay) / (by - ay) * (bx - ax), c = Math.max(0, Math.min(Math.floor(x / DX), 3)), p1 = P1[r][c], p2 = P1[r][c + 1]; if (p1 !== p2) ekle((c + (lev - p1) / (p2 - p1)) * DX, r * DY); }
      }
      const kapali = Math.hypot(l[0][0] - l[l.length - 1][0], l[0][1] - l[l.length - 1][1]) < 2;
      if (kapali && q.length > 2 && Math.hypot(q[0][0] - q[q.length - 1][0], q[0][1] - q[q.length - 1][1]) < 3) q.pop();
      return { q, kapali };
    };
    const catmull = (p, kapali) => { // merkezcil Catmull-Rom: noktalardan TAM geçer, taşma yapmaz
      const n = p.length, P = kapali ? [p[n - 1], ...p, p[0], p[1]] : [[2 * p[0][0] - p[1][0], 2 * p[0][1] - p[1][1]], ...p, [2 * p[n - 1][0] - p[n - 2][0], 2 * p[n - 1][1] - p[n - 2][1]]];
      const out = [], d = (u, v) => Math.sqrt(Math.hypot(v[0] - u[0], v[1] - u[1])) + 1e-6, L = (u, v, s0, s1, s) => [((s1 - s) * u[0] + (s - s0) * v[0]) / (s1 - s0), ((s1 - s) * u[1] + (s - s0) * v[1]) / (s1 - s0)];
      for (let i = 1; i < P.length - 2; i++) {
        const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]], t1 = d(p0, p1), t2 = t1 + d(p1, p2), t3 = t2 + d(p2, p3);
        for (let k = 0; k < 10; k++) { const s = t1 + (t2 - t1) * k / 10, A1 = L(p0, p1, 0, t1, s), A2 = L(p1, p2, t1, t2, s), A3 = L(p2, p3, t2, t3, s), B1 = L(A1, A2, 0, t2, s), B2 = L(A2, A3, t1, t3, s); out.push(L(B1, B2, t1, t2, s)); }
      }
      out.push(kapali ? p[0] : p[n - 1]); return out;
    };
    [[1024, 3.42], [1020, 1.42], [1016, 3.42]].forEach(([lev, ry]) => {
      const g = K['i' + lev], cizgiler = M.izolin(G, lev);
      cizgiler.forEach((l) => { const { q, kapali } = kesisim(l, lev); const pts = q.length > 2 ? catmull(q, kapali) : l; cizgi(g, pts.map((p) => [X0 + p[0], Y0 + p[1]]), { 'stroke-width': 2.8 }); });
      // basit orantı noktaları (✕): istasyon satırları üstünde
      for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) { const p1 = P1[r][c], p2 = P1[r][c + 1]; if ((p1 - lev) * (p2 - lev) < 0) { const x = sx(c + (lev - p1) / (p2 - p1)), y = sy(r); el('path', { d: `M${x - 6} ${y - 6}L${x + 6} ${y + 6}M${x - 6} ${y + 6}L${x + 6} ${y - 6}`, stroke: 'currentColor', 'stroke-width': 2.4 }, g); } }
      // etiket: batı kanatta, verilen satır yüksekliğinde
      let en = null; cizgiler.forEach((l) => l.forEach((p) => { const x = X0 + p[0], y = Y0 + p[1]; if (x < 260 && (!en || Math.abs(y - sy(ry)) < Math.abs(en[1] - sy(ry)))) en = [x, y]; }));
      if (en) t(g, en[0], en[1] + 5, String(lev), { 'text-anchor': 'middle', class: 'sc-t sc-etiket' });
    });
    // örnek: orta satır batı, 1015 → 1024 arası, 1020 = 5/9 yolda
    const O = K.ornek, x5 = sx(5 / 9);
    cizgi(O, [[sx(0), sy(2) + 22], [sx(1), sy(2) + 22]], { 'stroke-width': 2 }); cizgi(O, [[sx(0), sy(2) + 16], [sx(0), sy(2) + 28]]); cizgi(O, [[sx(1), sy(2) + 16], [sx(1), sy(2) + 28]]);
    el('circle', { cx: x5, cy: sy(2), r: 7, fill: 'none', stroke: 'currentColor', 'stroke-width': 2.6 }, O);
    t(O, x5, sy(2) + 44, '5/9', { 'text-anchor': 'middle', class: 'sc-t sc-etiket' });
    t(K.H, 260, sy(2) + 54, 'H', { 'text-anchor': 'middle', class: 'sc-t sc-merkez' });
    el('circle', { cx: sx(3.5), cy: sy(2), r: 40, fill: 'none', stroke: 'currentColor', 'stroke-width': 2.4, 'stroke-dasharray': '7 5' }, K.sik);
    t(K.sik, sx(3.5), sy(2) - 48, 'sık', { 'text-anchor': 'middle', class: 'sc-t sc-etiket' });
    return { svg, k: K };
  }

  // ───────── S2 · yer basınç sistemleri
  function s2() {
    const svg = yeni(640, 470, 'İki kapalı izobar sistemi ve merkezden kesitler'), v = el('g', {}, svg);
    const K = katmanlar(svg, ['don', 'ok', 'HL', 'akis', 'kesit']);
    [['A', 165, [1020, 1028, 1036], true], ['B', 475, [1012, 1004, 996], false]].forEach(([ad, cx, deg, yuk]) => {
      const cy = 172;
      t(v, cx - 150, 34, ad, { class: 'sc-t sc-panel' });
      [125, 88, 50].forEach((r, i) => { el('circle', { cx, cy, r, fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, v); t(v, cx, cy - r + 6, String(deg[i]), { 'text-anchor': 'middle', class: 'sc-t sc-etiket' }); });
      t(K.HL, cx, cy + 15, yuk ? 'H' : 'L', { 'text-anchor': 'middle', class: 'sc-t sc-merkez' });
      [45, 135, 225, 315].forEach((a) => {
        const s = Math.sin(a * R), c = Math.cos(a * R);
        const tg = yuk ? [s, c] : [-s, -c], dis = [c, -s];               // SVG'de (y aşağı): H saat yönü, L tersi; dışa birim
        const px = cx + 88 * c, py = cy - 88 * s, L = 34;
        ok(K.don, px - tg[0] * L, py - tg[1] * L, px + tg[0] * L, py + tg[1] * L, { w: 2, kesik: '6 5' });
        const k = yuk ? 0.47 : -0.47, d = [tg[0] + k * dis[0], tg[1] + k * dis[1]], n = Math.hypot(d[0], d[1]);
        const qx = cx + 108 * c, qy = cy - 108 * s;
        ok(K.ok, qx - d[0] / n * 30, qy - d[1] / n * 30, qx + d[0] / n * 30, qy + d[1] / n * 30, { w: 3 });
      });
      const bx = cx - 110, by = 330;
      t(v, bx, by - 10, 'Akış:', { class: 'sc-t sc-etiket' }); cizgi(v, [[bx + 52, by - 8], [bx + 120, by - 8]], { 'stroke-width': 1.5 });
      t(K.akis, bx + 56, by - 12, yuk ? 'DIV' : 'CONV', { class: 'sc-t sc-kalin' });
      el('rect', { x: bx, y: by, width: 220, height: 112, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6 }, v);
      cizgi(v, [[bx, by + 92], [bx + 220, by + 92]], { 'stroke-width': 2.6 }); t(v, cx, by + 108, 'Yer', { 'text-anchor': 'middle', class: 'sc-t sc-kucuk' });
      t(v, cx, by + 18, 'Merkezden kesit', { 'text-anchor': 'middle', class: 'sc-t sc-kucuk' });
      if (yuk) { ok(K.kesit, cx, by + 26, cx, by + 82, { w: 3 }); ok(K.kesit, cx - 14, by + 84, cx - 90, by + 84); ok(K.kesit, cx + 14, by + 84, cx + 90, by + 84); t(K.kesit, cx + 10, by + 52, 'çökme', { class: 'sc-t sc-kucuk' }); }
      else { ok(K.kesit, cx, by + 84, cx, by + 26, { w: 3 }); ok(K.kesit, cx - 90, by + 84, cx - 14, by + 84); ok(K.kesit, cx + 90, by + 84, cx + 14, by + 84); t(K.kesit, cx + 10, by + 52, 'yükselme', { class: 'sc-t sc-kucuk' }); }
    });
    return { svg, k: K };
  }

  // ───────── S3 · trof ve sırt
  const s3y = (i, x) => 7.0 - 1.25 * i + 0.95 * Math.cos(2 * Math.PI * (x - (2.4 + 0.12 * i)) / 10);
  function s3() {
    const svg = yeni(640, 560, '500 hPa yükseklik konturları, P ve Q noktaları'), v = el('g', {}, svg);
    const X = (x) => 30 + x * 56, Y = (y) => 455 - (y - 0.7) * 50;
    el('rect', { x: X(0), y: Y(8.6), width: 560, height: Y(0.7) - Y(8.6), fill: 'none', stroke: 'currentColor', 'stroke-width': 1.4 }, v);
    t(v, 320, 30, '500 hPa · Z (dam)', { 'text-anchor': 'middle', class: 'sc-t sc-baslik' }); kuzey(v, 565, 70);
    const K = katmanlar(svg, ['yon', 'sirt', 'trof', 'ok', 'denge', 'yagis']);
    [534, 540, 546, 552, 558].forEach((z, i) => { const pts = []; for (let x = 0; x <= 10.001; x += 0.1) pts.push([X(x), Y(s3y(i, x))]); cizgi(v, pts, { 'stroke-width': 2.4 }); t(v, X(0.12), Y(s3y(i, 0)) - 8, String(z), { class: 'sc-t sc-etiket' }); });
    [['P', 5.9], ['Q', 9.3]].forEach(([ad, x]) => { el('circle', { cx: X(x), cy: Y(s3y(3, x)), r: 6, fill: 'currentColor' }, v); t(v, X(x), Y(s3y(3, x)) - 14, ad, { 'text-anchor': 'middle', class: 'sc-t sc-nokta' }); });
    // yön: alçak kuzeyde → batıdan doğuya
    ok(K.yon, 400, 546, 460, 546, { w: 3 }); t(K.yon, 468, 551, 'akış: batı → doğu', { class: 'sc-t sc-etiket' });
    const eksen = (g, x0, ad, kes) => { const pts = [[X(x0 - 0.06), Y(8.45)]]; for (let i = 0; i < 5; i++) pts.push([X(x0 + 0.12 * i), Y(s3y(i, x0 + 0.12 * i))]); pts.push([X(x0 + 0.54), Y(0.85)]); cizgi(g, pts, { 'stroke-width': 2.6, 'stroke-dasharray': kes }); for (let i = 0; i < 5; i++) el('circle', { cx: X(x0 + 0.12 * i), cy: Y(s3y(i, x0 + 0.12 * i)), r: 4.5, fill: 'currentColor' }, g); t(g, X(x0) + 8, Y(8.45) + 2, ad, { class: 'sc-t sc-kalin' }); };
    eksen(K.sirt, 2.4, 'SIRT', '2 6'); eksen(K.trof, 7.4, 'TROF', '12 8');
    [5.9, 9.3].forEach((x) => { const x0 = x - 0.25, x1 = x + 0.85; ok(K.ok, X(x0), Y(s3y(3, x0)), X(x1), Y(s3y(3, x1)), { w: 3.2 }); });
    // jeostrofik denge (çerçevenin altında)
    const D = K.denge, dy = 515; ok(D, 90, dy, 160, dy, { w: 3 }); t(D, 168, dy + 5, 'rüzgâr', { class: 'sc-t sc-kucuk' });
    ok(D, 125, dy, 125, dy - 34, { w: 2.2, uc: 9 }); t(D, 132, dy - 26, 'BGK (kuzeye)', { class: 'sc-t sc-kucuk' });
    ok(D, 125, dy, 125, dy + 34, { w: 2.2, uc: 9 }); t(D, 132, dy + 32, 'Coriolis (güneye)', { class: 'sc-t sc-kucuk' });
    t(D, 300, dy + 5, 'eşit ve zıt → jeostrofik denge', { class: 'sc-t sc-etiket' });
    // yağış: trof önü yükselme, arkası çökme
    const yq = Y(s3y(3, 9.3)), yp = Y(s3y(3, 5.9));
    [[-12, 0, 13], [4, -8, 16], [20, 0, 13]].forEach(([dx, dyy, r]) => el('circle', { cx: X(9.3) + dx - 30, cy: yq + 70 + dyy, r, fill: 'var(--kagit)', stroke: 'currentColor', 'stroke-width': 2 }, K.yagis));
    [-22, -8, 6].forEach((dx) => cizgi(K.yagis, [[X(9.3) + dx - 26, yq + 92], [X(9.3) + dx - 32, yq + 106]], { 'stroke-width': 2 }));
    ok(K.yagis, X(8.3), yq + 112, X(8.3), yq + 64, { w: 2.4, uc: 9 }); t(K.yagis, X(8.15), yq + 130, 'yükselme · yağış', { 'text-anchor': 'middle', class: 'sc-t sc-kucuk' });
    ok(K.yagis, X(5.9), yp + 34, X(5.9), yp + 80, { w: 2.4, uc: 9 }); t(K.yagis, X(5.9), yp + 98, 'çökme · açık', { 'text-anchor': 'middle', class: 'sc-t sc-kucuk' });
    return { svg, k: K };
  }

  // ───────── S5 · sıcak / soğuk çekirdek
  function yuzey(p, x, A) { const g = Math.exp(-x * x / 0.12); return A ? { 950: 0.55 - 0.28 * g, 850: 1.5, 700: 3.0 + 0.18 * g, 500: 5.5 + 0.75 * g }[p] : { 950: 0.55 + 0.25 * g, 850: 1.5, 700: 3.0 - 0.3 * g, 500: 5.5 - 0.95 * g }[p]; }
  const S5T = [['S1', 'H', '1560 / 1500', '5280 / 5460', '3720 / 3960', 'C', 'L'], ['S2', 'L', '1440 / 1500', '5900 / 5820', '4460 / 4320', 'W', 'H'], ['S3', 'L', '1260 / 1500', '5160 / 5520', '3900 / 4020', 'C', 'L'], ['S4', 'H', '1620 / 1500', '5980 / 5820', '4360 / 4320', 'W', 'H']];
  function s5() {
    const svg = yeni(640, 610, 'İki düşey kesit ve dört sistemin tablosu'), v = el('g', {}, svg);
    const K = katmanlar(svg, ['in', 'LH', 'kal', 't12', 't34', 'yuks']);
    const Zp = (z) => 380 - z * 48;
    [['A', 70, true], ['B', 370, false]].forEach(([ad, x0, A]) => {
      const X = (x) => x0 + (x + 1) * 110;
      t(v, X(0), 30, ad, { 'text-anchor': 'middle', class: 'sc-t sc-panel' });
      cizgi(v, [[x0, Zp(-0.2)], [x0, Zp(6.9)]], { 'stroke-width': 1.4 }); cizgi(v, [[x0, Zp(-0.2)], [X(1), Zp(-0.2)]], { 'stroke-width': 1.4 });
      if (A) for (let z = 0; z <= 7; z++) t(v, x0 - 8, Zp(z) + 5, String(z), { 'text-anchor': 'end', class: 'sc-t sc-kucuk' });
      [950, 850, 700, 500].forEach((p) => { const pts = []; for (let x = -1; x <= 1.0001; x += 0.04) pts.push([X(x), Zp(yuzey(p, x, A))]); cizgi(v, pts, { 'stroke-width': 2.2 }); t(v, X(1) + 6, Zp(yuzey(p, 1, A)) + 5, String(p), { class: 'sc-t sc-kucuk' }); });
      t(v, X(-0.75), Zp(-0.2) + 20, 'Kenar', { 'text-anchor': 'middle', class: 'sc-t sc-kucuk' }); t(v, X(0), Zp(-0.2) + 20, 'Merkez', { 'text-anchor': 'middle', class: 'sc-t sc-kucuk' });
      // in: merkezde yüzey iniyor mu çıkıyor mu
      const y95 = Zp(yuzey(950, 0, A)), y50 = Zp(yuzey(500, 0, A));
      if (A) { ok(K.in, X(0.32), y95 - 30, X(0.32), y95 + 2, { w: 2.2, uc: 9 }); ok(K.in, X(0.32), y50 + 30, X(0.32), y50 - 4, { w: 2.2, uc: 9 }); }
      else { ok(K.in, X(0.32), y95 + 26, X(0.32), y95 - 6, { w: 2.2, uc: 9 }); ok(K.in, X(0.32), y50 - 30, X(0.32), y50 + 4, { w: 2.2, uc: 9 }); }
      t(K.LH, X(0) + 26, y95 + (A ? 22 : -10), A ? 'L' : 'H', { class: 'sc-t sc-kalin' }); t(K.LH, X(0) + 26, y50 + (A ? -10 : 26), A ? 'H' : 'L', { class: 'sc-t sc-kalin' });
      [-0.75, 0].forEach((x) => { const a = Zp(yuzey(850, x, A)), b = Zp(yuzey(500, x, A)); cift(K.kal, X(x), a, b); t(K.kal, X(x) + 7, (a + b) / 2, ((yuzey(500, x, A) - 1.5)).toFixed(1).replace('.', ',') + ' km', { class: 'sc-t sc-kucuk' }); });
      kutu(K.kal, X(0.62), Zp(4.2), A ? 'W' : 'C');
    });
    // tablo
    const T = el('g', {}, svg), xs = [14, 72, 132, 250, 368, 492, 566], y0 = 438, sh = 30;
    ['Sistem', 'Yerde', 'Z850 m/k', 'Z500 m/k', 'Kalınlık m/k', 'Çekirdek', '500\'de'].forEach((s, i) => t(T, xs[i], y0, s, { class: 'sc-t sc-kalin sc-kucuk' }));
    cizgi(T, [[10, y0 + 9], [630, y0 + 9]], { 'stroke-width': 1.4 });
    S5T.forEach((r, j) => {
      const y = y0 + (j + 1) * sh + 4;
      [0, 1, 2, 3].forEach((i) => t(T, xs[i], y, r[i], { class: 'sc-t sc-tablo' }));
      const g = j < 2 ? K.t12 : K.t34; t(g, xs[4], y, r[4], { class: 'sc-t sc-tablo' }); t(g, xs[5] + 20, y, r[5], { 'text-anchor': 'middle', class: 'sc-t sc-kalin' });
      t(K.yuks, xs[6] + 20, y, r[6], { 'text-anchor': 'middle', class: 'sc-t sc-kalin' });
    });
    return { svg, k: K };
  }

  // ───────── S6 · adveksiyon yönü (4 panel)
  const S6Y = { A: [1, 0], B: [-1, 0], C: [0, 1], D: [0.7071, 0.7071] }, S6C = { A: 'C · −', B: 'W · +', C: '0 · 0', D: 'C · −' };
  function s6() {
    const svg = yeni(640, 440, '850 hPa izotermleri ve dört rüzgâr'), v = el('g', {}, svg);
    const K = katmanlar(svg, ['S', 'cAB', 'cCD', 'hesap']);
    Object.keys(S6Y).forEach((ad, n) => {
      const x0 = 12 + (n % 2) * 316, y0 = 12 + Math.floor(n / 2) * 214, W = 300, H = 200;
      el('rect', { x: x0, y: y0, width: W, height: H, rx: 6, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.4 }, v);
      t(v, x0 + 10, y0 + 26, ad, { class: 'sc-t sc-panel' });
      [[0.2, '0 °C'], [0.5, '4 °C'], [0.8, '8 °C']].forEach(([f, s]) => { cizgi(v, [[x0 + f * W, y0 + 36], [x0 + f * W, y0 + H - 8]], { 'stroke-width': 2, 'stroke-dasharray': '7 5' }); t(v, x0 + f * W, y0 + 26, s, { 'text-anchor': 'middle', class: 'sc-t sc-kucuk' }); });
      const px = x0 + 0.5 * W, py = y0 + 0.6 * H, [u, w] = S6Y[ad], L = 62;
      ok(v, px - u * L * 0.9, py + w * L * 0.9, px + u * L, py - w * L, { w: 2.8 });
      el('circle', { cx: px, cy: py, r: 6, fill: 'currentColor' }, v); t(v, px + 9, py + 22, 'P', { class: 'sc-t sc-nokta' });
      const sx = px - u * L * 0.9, sy = py + w * L * 0.9;
      el('rect', { x: sx - 7, y: sy - 7, width: 14, height: 14, fill: 'currentColor' }, K.S); t(K.S, sx - 10, sy - 12, 'S', { 'text-anchor': 'end', class: 'sc-t sc-nokta' });
      kutu(ad === 'A' || ad === 'B' ? K.cAB : K.cCD, x0 + W - 46, y0 + H - 18, S6C[ad]);
    });
    t(K.hesap, 22, 64, '10 m/s × 4 °C / 200 km', { class: 'sc-t sc-kucuk sc-kalin' }); t(K.hesap, 22, 84, '≈ 0,72 °C/sa → 6 sa: −4,3 °C', { class: 'sc-t sc-kucuk sc-kalin' });
    return { svg, k: K };
  }

  // ───────── S7 · kontur + izoterm
  const s7z = (b, x) => b + 1.7 * Math.exp(-(((x - 5) / 2) ** 2));
  function s7() {
    const svg = yeni(640, 480, '500 hPa sırtı ve doğu-batı izotermler'), v = el('g', {}, svg);
    const X = (x) => 30 + x * 56, Y = (y) => 462 - (y - 0.3) * 54;
    el('rect', { x: X(0), y: Y(8.2), width: 560, height: Y(0.35) - Y(8.2), fill: 'none', stroke: 'currentColor', 'stroke-width': 1.4 }, v);
    t(v, 320, 22, '500 hPa · düz: Z (dam) · kesik: T (°C)', { 'text-anchor': 'middle', class: 'sc-t sc-baslik' }); kuzey(v, 550, 62);
    [[-24, 7.5], [-18, 5.35], [-12, 3.25], [-6, 0.9]].forEach(([tt, y]) => { cizgi(v, [[X(0), Y(y)], [X(10), Y(y)]], { 'stroke-width': 1.8, 'stroke-dasharray': '9 6' }); t(v, X(10) + 4, Y(y) + 5, String(tt).replace('-', '−'), { class: 'sc-t sc-kucuk' }); });
    [[552, 5.6], [558, 3.4], [564, 1.2]].forEach(([z, b]) => { const pts = []; for (let x = 0; x <= 10.001; x += 0.1) pts.push([X(x), Y(s7z(b, x))]); cizgi(v, pts, { 'stroke-width': 2.6 }); t(v, X(0.1), Y(b) - 8, String(z), { class: 'sc-t sc-etiket' }); });
    const K = katmanlar(svg, ['ok', 'P', 'R', 'Q']);
    [['P', 3.3, 'W'], ['R', 5.0, '0'], ['Q', 6.7, 'C']].forEach(([ad, x, c]) => {
      el('circle', { cx: X(x), cy: Y(s7z(3.4, x)), r: 6, fill: 'currentColor' }, v); t(v, X(x), Y(s7z(3.4, x)) - 14, ad, { 'text-anchor': 'middle', class: 'sc-t sc-nokta' });
      const x0 = x - 0.1, x1 = x + 0.8; ok(K.ok, X(x0), Y(s7z(3.4, x0)), X(x1), Y(s7z(3.4, x1)), { w: 3.2 });
      kutu(K[ad], X(x), Y(s7z(3.4, x)) + 44, c);
    });
    return { svg, k: K };
  }

  // ───────── S8 · izotermleri rüzgârla taşıma
  function s8() {
    const svg = yeni(520, 520, 'Kareli eksende üç izoterm ve P noktası'), v = el('g', {}, svg);
    const X = (x) => 60 + 70 * x, Y = (y) => 470 - 70 * y;
    for (let i = 0; i <= 6; i++) { cizgi(v, [[X(i), Y(0)], [X(i), Y(6)]], { class: 'sc-ince' }); cizgi(v, [[X(0), Y(i)], [X(6), Y(i)]], { class: 'sc-ince' }); t(v, X(i), Y(0) + 20, String(i), { 'text-anchor': 'middle', class: 'sc-t sc-kucuk' }); t(v, X(0) - 10, Y(i) + 5, String(i), { 'text-anchor': 'end', class: 'sc-t sc-kucuk' }); }
    el('rect', { x: X(0), y: Y(6), width: 420, height: 420, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.4 }, v);
    t(v, X(3), Y(0) + 42, 'Doğu (kare)', { 'text-anchor': 'middle', class: 'sc-t sc-kucuk' }); t(v, 20, Y(3), 'Kuzey', { 'text-anchor': 'middle', class: 'sc-t sc-kucuk', transform: `rotate(-90 20 ${Y(3)})` });
    const iz = (g, a, b, s, x, at) => { cizgi(g, [[X(a[0]), Y(a[1])], [X(b[0]), Y(b[1])]], at); const y = a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); t(g, X(x), Y(y) + 5, s, { 'text-anchor': 'middle', class: 'sc-t sc-etiket', transform: `rotate(-26.6 ${X(x)} ${Y(y)})` }); };
    iz(v, [0, 2], [4, 0], '14 °C', 3, { 'stroke-width': 2.6 }); iz(v, [0, 4], [6, 1], '10 °C', 5, { 'stroke-width': 2.6 }); iz(v, [0, 6], [6, 3], '6 °C', 5, { 'stroke-width': 2.6 });
    el('circle', { cx: X(3), cy: Y(2), r: 7, fill: 'currentColor' }, v); t(v, X(3) + 10, Y(2) + 24, 'P', { class: 'sc-t sc-nokta' });
    ok(v, X(5.75), Y(5.75), X(5.1), Y(5.1), { w: 2.6 }); t(v, X(5.95), Y(4.8), 'rüzgâr (KD)', { 'text-anchor': 'end', class: 'sc-t sc-kucuk' });
    const K = katmanlar(svg, ['P', 'yeni', 'S', 'sonuc']);
    cift(K.P, X(3) - 16, Y(0.5), Y(2.5)); t(K.P, X(3) - 24, Y(1.4), '¾ → 11 °C', { 'text-anchor': 'end', class: 'sc-t sc-etiket' });
    iz(K.yeni, [0, 0.5], [1, 0], '14 yeni', 0.5, { 'stroke-width': 2.4, 'stroke-dasharray': '10 7' }); iz(K.yeni, [0, 2.5], [5, 0], '10 yeni', 0.6, { 'stroke-width': 2.4, 'stroke-dasharray': '10 7' }); iz(K.yeni, [0, 4.5], [6, 1.5], '6 yeni', 1.3, { 'stroke-width': 2.4, 'stroke-dasharray': '10 7' });
    el('rect', { x: X(4) - 8, y: Y(3) - 8, width: 16, height: 16, fill: 'var(--kagit)', stroke: 'currentColor', 'stroke-width': 2.8 }, K.S); t(K.S, X(4) + 14, Y(3) - 10, 'S · 8 °C', { class: 'sc-t sc-nokta' });
    ok(K.S, X(3.88), Y(2.88), X(3.12), Y(2.12), { w: 2.8 });
    kutu(K.sonuc, X(1.9), Y(5.55), 'P: 11 → 8 °C (−3)', { fs: 15 });
    return { svg, k: K };
  }

  // ───────── S9 · barotropik / baroklinik
  function s9() {
    const svg = yeni(640, 390, 'Aynı alçak, iki sıcaklık alanı'), v = el('g', {}, svg);
    const K = katmanlar(svg, ['ok', 'Aadv', 'Aad', 'B']);
    [['A', 160], ['B', 480]].forEach(([ad, cx]) => {
      const cy = 190;
      el('rect', { x: cx - 148, y: cy - 148, width: 296, height: 296, rx: 6, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.4 }, v);
      t(v, cx - 138, cy - 122, ad, { class: 'sc-t sc-panel' }); kuzey(v, cx + 126, cy - 136);
      [[48, 540], [80, 546], [112, 552]].forEach(([r, z]) => { el('circle', { cx, cy, r, fill: 'none', stroke: 'currentColor', 'stroke-width': 2.4 }, v); t(v, cx, cy + r + 5, String(z), { 'text-anchor': 'middle', class: 'sc-t sc-etiket' }); });
      if (ad === 'A') [[-24, -88], [-18, 0], [-12, 88]].forEach(([tt, dy]) => { cizgi(v, [[cx - 148, cy + dy], [cx + 148, cy + dy]], { 'stroke-width': 1.8, 'stroke-dasharray': '9 6' }); t(v, cx - 144, cy + dy - 6, String(tt).replace('-', '−'), { class: 'sc-t sc-kucuk' }); });
      else [[64, -30], [96, -24], [128, -18]].forEach(([r, tt]) => { el('circle', { cx, cy, r, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-dasharray': '9 6' }, v); t(v, cx, cy - r + 5, String(tt).replace('-', '−'), { 'text-anchor': 'middle', class: 'sc-t sc-kucuk sc-etiket' }); });
      [['W', -80], ['E', 80]].forEach(([n, dx]) => { el('circle', { cx: cx + dx, cy, r: 6, fill: 'currentColor' }, v); t(v, cx + dx + (dx < 0 ? -12 : 12), cy - 10, n, { 'text-anchor': dx < 0 ? 'end' : 'start', class: 'sc-t sc-nokta' }); });
      ok(K.ok, cx - 80, cy - 34, cx - 80, cy + 38, { w: 3.2 }); ok(K.ok, cx + 80, cy + 34, cx + 80, cy - 38, { w: 3.2 });
    });
    kutu(K.Aadv, 80 - 30, 236, 'C'); kutu(K.Aadv, 240 + 30, 236, 'W');
    t(K.Aad, 160, 370, 'baroklinik', { 'text-anchor': 'middle', class: 'sc-t sc-kalin' });
    kutu(K.B, 400 - 30, 236, '0'); kutu(K.B, 560 + 30, 236, '0'); t(K.B, 480, 370, 'eşdeğer barotropik', { 'text-anchor': 'middle', class: 'sc-t sc-kalin' });
    return { svg, k: K };
  }

  // ───────── S10 · düşey eksen
  const S10 = { A: [[528, 540, 552], [147, 141, 147], [1012, 1008, 996]], B: [[546, 534, 546], [153, 144, 153], [1010, 998, 1010]] };
  const S10K = { A: '3810 · 3990 · 4050 m', B: '3930 · 3900 · 3930 m' };
  function s10() {
    const svg = yeni(640, 450, 'Üç seviyede batı-orta-doğu değerleri'), v = el('g', {}, svg);
    const K = katmanlar(svg, ['L', 'eksen', 'kal', 'anlam']);
    ['A', 'B'].forEach((ad, n) => {
      const x0 = 18 + n * 314, W = 290, xs = [x0 + 55, x0 + 145, x0 + 235], ys = [100, 205, 310];
      el('rect', { x: x0, y: 40, width: W, height: 312, rx: 6, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.4 }, v);
      t(v, x0 + W / 2, 30, ad, { 'text-anchor': 'middle', class: 'sc-t sc-panel' });
      ['500 hPa · Z (dam)', '850 hPa · Z (dam)', 'Yer · p (hPa)'].forEach((s, r) => t(v, x0 + 10, ys[r] - 34, s, { class: 'sc-t sc-kucuk' }));
      t(v, x0 + 10, 342, 'W', { class: 'sc-t sc-kucuk' }); t(v, x0 + W - 10, 342, 'E', { 'text-anchor': 'end', class: 'sc-t sc-kucuk' });
      const mer = [];
      S10[ad].forEach((sat, r) => {
        sat.forEach((d, c) => { el('circle', { cx: xs[c], cy: ys[r] + 12, r: 3.5, fill: 'currentColor' }, v); t(v, xs[c], ys[r], String(d), { 'text-anchor': 'middle', class: 'sc-t sc-deger' }); });
        const m = sat.indexOf(Math.min(...sat)); mer.push([xs[m], ys[r] - 2]);
        el('ellipse', { cx: xs[m], cy: ys[r] - 2, rx: 32, ry: 24, fill: 'none', stroke: 'currentColor', 'stroke-width': 2.6 }, K.L); t(K.L, xs[m] + 36, ys[r] + 18, 'L', { class: 'sc-t sc-kalin' });
      });
      cizgi(K.eksen, mer.slice().reverse(), { 'stroke-width': 3 });
      t(K.eksen, x0 + W / 2, 372, ad === 'A' ? 'eksen: eğik (batıya)' : 'eksen: düşey', { 'text-anchor': 'middle', class: 'sc-t sc-kalin' });
      t(K.kal, x0 + W / 2, 400, 'kalınlık: ' + S10K[ad], { 'text-anchor': 'middle', class: 'sc-t sc-etiket' });
      t(K.anlam, x0 + W / 2, 428, ad === 'A' ? 'gelişen baroklinik alçak' : 'olgun, eşdeğer barotropik', { 'text-anchor': 'middle', class: 'sc-t sc-etiket' });
    });
    return { svg, k: K };
  }

  // adım → o adımda açılan katmanlar (adım sırası soru-veri.js'teki adımlarla aynı)
  const ADIM = {
    s1: [['H'], ['ornek'], ['i1024'], ['i1020'], ['i1016'], ['sik']],
    s2: [['HL'], ['don'], ['ok'], ['akis'], ['kesit']],
    s3: [['yon'], ['sirt'], ['trof'], ['ok'], ['denge'], ['yagis']],
    s5: [['in'], ['LH'], ['kal'], ['t12'], ['t34'], ['yuks']],
    s6: [['S'], ['cAB'], ['cCD'], ['hesap'], []],
    s7: [['ok'], ['P'], ['R'], ['Q'], []],
    s8: [['P'], ['yeni'], ['S'], ['sonuc']],
    s9: [['ok'], ['Aadv'], ['Aad'], ['B']],
    s10: [['L'], ['eksen'], ['kal'], ['anlam']],
  };
  const CIZ = { s1, s2, s3, s5, s6, s7, s8, s9, s10 };
  window.SoruCiz = { ciz: (id) => CIZ[id](), ADIM };
})();
