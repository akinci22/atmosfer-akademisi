// Harita motoru — kendi çizimimiz: Gauss alanları → izolinler (marching squares) + gölgeli alanlar (canvas),
// cepheler, rüzgâr okları, istasyon modelleri, sıcak noktalar. Kıyı/sınır: geo.js (Natural Earth, kamu malı).
// Dış görsel kullanılmaz. Haritalar gerçek analizin SADELEŞTİRİLMİŞ çizimidir.
(function () {
  'use strict';
  const R = Math.PI / 180;
  const NS = 'http://www.w3.org/2000/svg';

  // ── İzdüşüm (Lambert konik konform; sabitler tools/kiyi.mjs ile aynı)
  function proj(g, lon, lat) {
    const r = g.F / Math.pow(Math.tan(Math.PI / 4 + (lat * R) / 2), g.n);
    const t = g.n * (lon - g.lon0) * R;
    return [(r * Math.sin(t) - g.x0) * g.k, (g.y1 - (g.r0 - r * Math.cos(t))) * g.k];
  }
  function inv(g, px, py) {
    const X = px / g.k + g.x0, Y = g.y1 - py / g.k, dy = g.r0 - Y;
    const r = Math.hypot(X, dy), t = Math.atan2(X, dy);
    return [g.lon0 + t / g.n / R, (2 * Math.atan(Math.pow(g.F / r, 1 / g.n))) / R - 90];
  }

  // ── Alan: taban + enlem/boylam eğimi + Gauss tümsek/çukurlar [boylam, enlem, genlik, sx°, sy°, dönüş°]
  function alan(s) {
    return (lon, lat) => {
      let v = s.base || 0;
      if (s.glat) v += s.glat[1] * (lat - s.glat[0]);
      if (s.glon) v += s.glon[1] * (lon - s.glon[0]);
      if (s.glat2) v += s.glat2 * (lat - s.glat[0]) * (lat - s.glat[0]);
      const c = Math.cos(lat * R);
      for (const b of s.blobs || []) {
        let dx = (lon - b[0]) * c, dy = lat - b[1];
        if (b[5]) { const a = b[5] * R, x2 = dx * Math.cos(a) + dy * Math.sin(a); dy = -dx * Math.sin(a) + dy * Math.cos(a); dx = x2; }
        v += b[2] * Math.exp(-((dx * dx) / (b[3] * b[3]) + (dy * dy) / (b[4] * b[4])));
      }
      return v;
    };
  }

  // ── Izgara + marching squares
  function izgara(g, f, adim) {
    const nx = Math.ceil(g.w / adim) + 1, ny = Math.ceil(g.h / adim) + 1, v = new Float64Array(nx * ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const [lo, la] = inv(g, i * adim, j * adim); v[j * nx + i] = f(lo, la); }
    return { nx, ny, v, adim };
  }
  function izolin(G, lev) {
    const { nx, ny, v, adim } = G, seg = [];
    const P = (i, j, i2, j2) => { const a = v[j * nx + i], b = v[j2 * nx + i2], t = (lev - a) / (b - a || 1e-9); return [(i + (i2 - i) * t) * adim, (j + (j2 - j) * t) * adim]; };
    for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
      const a = v[j * nx + i] > lev, b = v[j * nx + i + 1] > lev, c = v[(j + 1) * nx + i + 1] > lev, d = v[(j + 1) * nx + i] > lev;
      const k = (a ? 8 : 0) | (b ? 4 : 0) | (c ? 2 : 0) | (d ? 1 : 0);
      if (k === 0 || k === 15) continue;
      const T = () => P(i, j, i + 1, j), Rt = () => P(i + 1, j, i + 1, j + 1), B = () => P(i, j + 1, i + 1, j + 1), L = () => P(i, j, i, j + 1);
      const m = { 1: [[L, B]], 2: [[B, Rt]], 3: [[L, Rt]], 4: [[T, Rt]], 5: [[L, T], [B, Rt]], 6: [[T, B]], 7: [[L, T]], 8: [[L, T]], 9: [[T, B]], 10: [[T, Rt], [L, B]], 11: [[T, Rt]], 12: [[L, Rt]], 13: [[B, Rt]], 14: [[L, B]] }[k];
      for (const [p, q] of m) seg.push([p(), q()]);
    }
    // uçlardan birleştir
    const key = (p) => Math.round(p[0] * 10) + ',' + Math.round(p[1] * 10);
    const uc = new Map();
    seg.forEach((s, n) => { for (const e of [0, 1]) { const kk = key(s[e]); if (!uc.has(kk)) uc.set(kk, []); uc.get(kk).push(n); } });
    const kul = new Uint8Array(seg.length), out = [];
    for (let n = 0; n < seg.length; n++) {
      if (kul[n]) continue; kul[n] = 1; const line = [seg[n][0], seg[n][1]];
      for (const yon of [1, 0]) {
        for (;;) {
          const uç = yon ? line[line.length - 1] : line[0];
          const ad = (uc.get(key(uç)) || []).find((m) => !kul[m]); if (ad === undefined) break; kul[ad] = 1;
          const s = seg[ad], yeni = key(s[0]) === key(uç) ? s[1] : s[0];
          if (yon) line.push(yeni); else line.unshift(yeni);
        }
      }
      if (line.length > 3) out.push(line);
    }
    return out.map((l) => chaikin(chaikin(l)));
  }
  function chaikin(p) {
    if (p.length < 3) return p; const kapali = Math.hypot(p[0][0] - p[p.length - 1][0], p[0][1] - p[p.length - 1][1]) < 0.5; const o = [p[0]];
    for (let i = 0; i < p.length - 1; i++) { const a = p[i], b = p[i + 1]; o.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]); }
    o.push(kapali ? o[1] : p[p.length - 1]); return o;
  }
  const d = (pts) => 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
  const uzunluk = (pts) => { let s = 0; for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return s; };

  // ── SVG yardımcıları
  function el(tag, at, ebeveyn) { const e = document.createElementNS(NS, tag); for (const k in at) if (at[k] != null) e.setAttribute(k, at[k]); if (ebeveyn) ebeveyn.appendChild(e); return e; }
  function yazi(g, x, y, t, at) { const e = el('text', Object.assign({ x, y }, at), g); e.textContent = t; return e; }

  // ── Gölgeli alan → <image> (renk sınıfları basamaklı; gerçek haritalardaki gibi)
  function golge(svg, g, f, renk, opak) {
    const s = 3, W = Math.ceil(g.w / s), H = Math.ceil(g.h / s), cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const cx = cv.getContext('2d'), im = cx.createImageData(W, H);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const [lo, la] = inv(g, i * s + s / 2, j * s + s / 2), v = f(lo, la); let c = null;
      for (const st of renk) if (v >= st[0]) c = st; else break;
      if (!c || !c[1]) continue; const o = (j * W + i) * 4, h = c[1];
      im.data[o] = parseInt(h.slice(1, 3), 16); im.data[o + 1] = parseInt(h.slice(3, 5), 16); im.data[o + 2] = parseInt(h.slice(5, 7), 16); im.data[o + 3] = Math.round(255 * (c[2] == null ? 1 : c[2]) * (opak == null ? 1 : opak));
    }
    cx.putImageData(im, 0, 0);
    return el('image', { href: cv.toDataURL(), x: 0, y: 0, width: g.w, height: g.h, preserveAspectRatio: 'none', class: 'm-golge' }, svg);
  }

  // ── Cephe: [[boylam, enlem]…], tur: soguk | sicak | kapanmis | duragan, yan: 1 sol / -1 sağ
  const CEPHE_RENK = { soguk: '#1f5fd1', sicak: '#d62d20', kapanmis: '#8a3fb8', duragan: '#1f5fd1' };
  function cephe(gr, g, c) {
    const P = c.n.map(([lo, la]) => proj(g, lo, la)), yog = [];
    for (let i = 0; i < P.length - 1; i++) { // Catmull-Rom
      const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
      const n = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 3));
      for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t; yog.push([0, 1].map((a) => 0.5 * (2 * p1[a] + (-p0[a] + p2[a]) * t + (2 * p0[a] - 5 * p1[a] + 4 * p2[a] - p3[a]) * t2 + (-p0[a] + 3 * p1[a] - 3 * p2[a] + p3[a]) * t3))); }
    }
    yog.push(P[P.length - 1]);
    const top = [0]; for (let i = 1; i < yog.length; i++) top.push(top[i - 1] + Math.hypot(yog[i][0] - yog[i - 1][0], yog[i][1] - yog[i - 1][1]));
    const at = (s) => { let i = 1; while (i < top.length - 1 && top[i] < s) i++; const t = (s - top[i - 1]) / (top[i] - top[i - 1] || 1), a = yog[i - 1], b = yog[i]; const tx = b[0] - a[0], ty = b[1] - a[1], L = Math.hypot(tx, ty) || 1; return { x: a[0] + tx * t, y: a[1] + ty * t, tx: tx / L, ty: ty / L }; };
    const grp = el('g', { class: 'm-cephe', 'data-tur': c.tur }, gr);
    const renk = CEPHE_RENK[c.tur];
    if (c.tur === 'duragan') {
      // iki renkli çizgi parçaları
      for (let s = 0, k = 0; s < top[top.length - 1]; s += 40, k++) { const pts = []; for (let u = s; u <= Math.min(s + 40, top[top.length - 1]); u += 3) { const q = at(u); pts.push([q.x, q.y]); } el('path', { d: d(pts), fill: 'none', stroke: k % 2 ? '#d62d20' : '#1f5fd1', 'stroke-width': 3 }, grp); }
    } else el('path', { d: d(yog), fill: 'none', stroke: renk, 'stroke-width': 3, 'stroke-linejoin': 'round' }, grp);
    const yan = c.yan || 1, ara = c.ara || 42, top2 = top[top.length - 1];
    for (let s = ara / 2, k = 0; s < top2 - 8; s += ara, k++) {
      const q = at(s), nx = q.ty * yan, ny = -q.tx * yan; let tur = c.tur;
      let ny2 = ny, nx2 = nx, rk = renk;
      if (tur === 'kapanmis') tur = k % 2 ? 'sicak' : 'soguk';
      if (c.tur === 'duragan') { tur = k % 2 ? 'sicak' : 'soguk'; rk = k % 2 ? '#d62d20' : '#1f5fd1'; if (k % 2) { nx2 = -nx; ny2 = -ny; } }
      if (tur === 'soguk') { const a = at(s - 7), b = at(s + 7); el('path', { d: `M${a.x} ${a.y}L${q.x + nx2 * 11} ${q.y + ny2 * 11}L${b.x} ${b.y}Z`, fill: rk }, grp); }
      else { const pts = []; for (let th = 0; th <= 180; th += 20) { const cc = Math.cos(th * R), ss = Math.sin(th * R); pts.push([q.x + q.tx * 7 * cc + nx2 * 7 * ss, q.y + q.ty * 7 * cc + ny2 * 7 * ss]); } el('path', { d: d(pts) + 'Z', fill: rk }, grp); }
    }
    return grp;
  }

  // ── Rüzgâr oku (knot). yon = rüzgârın geldiği yön (°). NH: tüyler alçak basınç tarafında.
  function ok(gr, x, y, yon, kt, renk) {
    renk = renk || '#1d1d1f'; const g = el('g', { class: 'm-ok' }, gr);
    if (kt < 2.5) { el('circle', { cx: x, cy: y, r: 7, fill: 'none', stroke: renk, 'stroke-width': 1.4 }, g); return g; }
    const ux = Math.sin(yon * R), uy = -Math.cos(yon * R), L = 30, ex = x + ux * L, ey = y + uy * L, fx = -uy, fy = ux;
    el('line', { x1: x, y1: y, x2: ex, y2: ey, stroke: renk, 'stroke-width': 1.6 }, g);
    let k = Math.round(kt / 5) * 5, p = 0;
    const tuy = (u, boy) => el('line', { x1: x + ux * u, y1: y + uy * u, x2: x + ux * (u + 5) + fx * boy, y2: y + uy * (u + 5) + fy * boy, stroke: renk, 'stroke-width': 1.6 }, g);
    while (k >= 50) { const u = L - p; el('path', { d: `M${x + ux * u} ${y + uy * u}L${x + ux * (u - 7) + fx * 12} ${y + uy * (u - 7) + fy * 12}L${x + ux * (u - 7)} ${y + uy * (u - 7)}Z`, fill: renk }, g); k -= 50; p += 9; }
    while (k >= 10) { tuy(L - p - 5, 12); k -= 10; p += 5; }
    if (k >= 5) { if (p === 0) p = 5; tuy(L - p - 5, 6.5); }
    return g;
  }

  // ── Yüzey istasyon modeli (sadeleştirilmiş): okta, rüzgâr, T, Td, basınç, eğilim
  function istasyon(gr, x, y, s) {
    const g = el('g', { class: 'm-ist' }, gr);
    if (s.yon != null) ok(g, x, y, s.yon, s.kt || 0);
    el('circle', { cx: x, cy: y, r: 6, fill: '#fff', stroke: '#1d1d1f', 'stroke-width': 1.5 }, g);
    const o = s.okta || 0;
    if (o >= 8) el('circle', { cx: x, cy: y, r: 6, fill: '#1d1d1f' }, g);
    else if (o > 0) { const a = o <= 3 ? 90 : o === 4 ? 180 : 270, e = [x + 6 * Math.sin(a * R), y - 6 * Math.cos(a * R)]; el('path', { d: `M${x} ${y}L${x} ${y - 6}A6 6 0 ${a > 180 ? 1 : 0} 1 ${e[0]} ${e[1]}Z`, fill: '#1d1d1f' }, g); }
    const t = (dx, dy, m, at) => yazi(g, x + dx, y + dy, m, Object.assign({ class: 'm-ist-t' }, at));
    if (s.T != null) t(-10, -6, s.T, { 'text-anchor': 'end', fill: '#c0281b' });
    if (s.Td != null) t(-10, 14, s.Td, { 'text-anchor': 'end', fill: '#1a7f37' });
    if (s.p != null) t(10, -6, s.p, {});
    if (s.e != null) t(10, 14, s.e, { fill: '#1f5fd1' });
    return g;
  }
  // Üst seviye istasyon: T sol üst, T−Td sol alt (yeşil), yükseklik sağ üst, ok
  function ustIst(gr, x, y, s) {
    const g = el('g', { class: 'm-ist' }, gr);
    ok(g, x, y, s.yon, s.kt);
    el('circle', { cx: x, cy: y, r: 5, fill: '#1d1d1f' }, g);
    const t = (dx, dy, m, at) => yazi(g, x + dx, y + dy, m, Object.assign({ class: 'm-ist-t' }, at));
    t(-9, -6, s.T, { 'text-anchor': 'end', fill: '#c0281b' });
    t(-9, 14, s.dd, { 'text-anchor': 'end', fill: '#1a7f37' });
    t(9, -6, s.z, {});
    return g;
  }

  // ── Bölge (sıcak nokta) çokgeni: [batı, güney, doğu, kuzey]
  function bolgePoly(g, b) {
    const [w, s, e, n] = b, p = [];
    for (let k = 0; k <= 12; k++) p.push(proj(g, w + ((e - w) * k) / 12, s));
    for (let k = 0; k <= 12; k++) p.push(proj(g, e, s + ((n - s) * k) / 12));
    for (let k = 0; k <= 12; k++) p.push(proj(g, e - ((e - w) * k) / 12, n));
    for (let k = 0; k <= 12; k++) p.push(proj(g, w, n - ((n - s) * k) / 12));
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of p) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    return { p, kutu: [Math.max(0, x0), Math.max(0, y0), Math.min(g.w, x1), Math.min(g.h, y1)] };
  }

  // ── Haritayı kur. m = haritalar.js tanımı. Dönüş: { svg, g, katman{}, bolgeler[] }
  function ciz(kap, m) {
    const g = window.GEO[m.cerceve];
    const svg = el('svg', { viewBox: `0 0 ${g.w} ${g.h}`, class: 'm-svg', role: 'img', 'aria-label': m.alt || m.baslik });
    kap.appendChild(svg);
    const tanimlar = el('defs', {}, svg);
    const kirp = el('clipPath', { id: 'k-' + m.id }, tanimlar); el('rect', { x: 0, y: 0, width: g.w, height: g.h }, kirp);
    el('rect', { x: 0, y: 0, width: g.w, height: g.h, fill: m.zemin || '#fbfbfd', class: 'm-zemin' }, svg);
    const kok = el('g', { 'clip-path': `url(#k-${m.id})` }, svg);
    const katman = {}; const kat = (ad) => (katman[ad] = katman[ad] || el('g', { class: 'm-k m-k-' + ad, 'data-k': ad }, kok));

    // gölgeler (kıyıdan önce)
    for (const s of m.golge || []) { const k = kat(s.k || 'golge'); golge(k, g, alan(s.alan), s.renk, s.opak); }
    // kara/deniz
    const kara = kat('cografya');
    if (m.kara) el('path', { d: g.coast, fill: 'none', stroke: m.kara, 'stroke-width': 1.1, opacity: 0.9 }, kara);
    else el('path', { d: g.coast, fill: 'none', stroke: '#5b616b', 'stroke-width': 1.15 }, kara);
    el('path', { d: g.border, fill: 'none', stroke: m.sinir || '#a3a8b0', 'stroke-width': 0.8, 'stroke-dasharray': '3 2' }, kara);
    if (g.lake) el('path', { d: g.lake, fill: 'none', stroke: '#8a8f98', 'stroke-width': 0.8 }, kara);

    // radar halkaları vb. özel çizimler
    if (m.halka) { const k = kat('halka'); const [lo, la] = m.halka.merkez; const [cx, cy] = proj(g, lo, la); const [ex] = proj(g, lo + 1 / (111.32 * Math.cos(la * R)) * 100, la); const pk = ex - cx; for (const r of m.halka.km) { el('circle', { cx, cy, r: (pk * r) / 100, fill: 'none', stroke: '#9aa0a6', 'stroke-width': 0.8, 'stroke-dasharray': '4 3' }, k); yazi(k, cx + (pk * r) / 100 * 0.71 + 3, cy - (pk * r) / 100 * 0.71, r + ' km', { class: 'm-kucuk' }); } el('circle', { cx, cy, r: 4, fill: '#1d1d1f' }, k); }

    // izolinler
    for (const c of m.cizgi || []) {
      const k = kat(c.k); const G = izgara(g, alan(c.alan), c.adim || 9); const etiketler = [];
      const sev = c.seviyeler || (() => { const a = []; for (let lev = c.aralik[0]; lev <= c.aralik[1] + 1e-9; lev += c.aralik[2]) a.push(Math.round(lev * 1000) / 1000); return a; })();
      for (const lev of sev) {
        const kalin = c.kalin && Math.abs(((lev - c.kalin[0]) % c.kalin[1])) < 1e-6;
        for (const pts of izolin(G, lev)) {
          if (uzunluk(pts) < (c.enaz || 30)) continue;
          el('path', { d: d(pts), fill: 'none', stroke: c.renk, 'stroke-width': kalin ? (c.kal || 1.3) * 1.7 : c.kal || 1.3, 'stroke-dasharray': c.kesik || null, 'stroke-linejoin': 'round', opacity: c.op || 1 }, k);
          if (c.etiket === false || uzunluk(pts) < 140) continue;
          for (const oran of uzunluk(pts) > 900 ? [0.3, 0.75] : [0.42]) {
            let s = uzunluk(pts) * oran, i = 1, acc = 0; for (; i < pts.length; i++) { acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc >= s) break; }
            const [x, y] = pts[Math.min(i, pts.length - 1)]; if (x < 24 || y < 18 || x > g.w - 24 || y > g.h - 12) continue;
            if (etiketler.some(([a, b]) => Math.hypot(a - x, b - y) < 70)) continue; etiketler.push([x, y]);
            const metin = c.bicim ? c.bicim(lev) : String(Math.round(lev * 10) / 10);
            yazi(k, x, y + 4, metin, { class: 'm-etiket', fill: c.renk, 'text-anchor': 'middle' });
          }
        }
      }
    }
    // serbest çizgiler (radar paraziti, trof ekseni, jet ekseni…)
    for (const y of m.yollar || []) { const pts = y.n.map(([lo, la]) => proj(g, lo, la)); el('path', { d: d(y.egri ? chaikin(chaikin(pts)) : pts), fill: 'none', stroke: y.renk, 'stroke-width': y.kal || 2, 'stroke-dasharray': y.kesik || null, 'stroke-linecap': 'round', opacity: y.op || 1 }, kat(y.k || 'yol')); }
    // cepheler
    for (const c of m.cepheler || []) cephe(kat('cephe'), g, c);
    // merkezler
    for (const c of m.merkez || []) {
      const k = kat(c.k || 'merkez'); const [x, y] = proj(g, c.n[0], c.n[1]);
      const renk = c.renk || (c.tip === 'A' ? '#c0281b' : '#1f5fd1');
      yazi(k, x, y + 12, c.h, { class: 'm-merkez', fill: renk, 'text-anchor': 'middle' });
      if (c.v) yazi(k, x, y + 32, c.v, { class: 'm-merkez-v', fill: renk, 'text-anchor': 'middle' });
    }
    // simgeler (F/T, + vb.)
    for (const s of m.simge || []) { const [x, y] = proj(g, s.n[0], s.n[1]); yazi(kat(s.k || 'simge'), x, y + 6, s.t, { class: 'm-simge', fill: s.renk || '#1d1d1f', 'text-anchor': 'middle' }); }
    // rüzgâr okları
    for (const o of m.oklar || []) { const [x, y] = proj(g, o.n[0], o.n[1]); ok(kat('ok'), x, y, o.yon, o.kt, o.renk); }
    // istasyonlar
    for (const s of m.istasyon || []) { const [x, y] = proj(g, s.n[0], s.n[1]); (s.ust ? ustIst : istasyon)(kat('istasyon'), x, y, s); }
    // şehirler ve bölge adları
    const sk = kat('yer');
    const istVar = (m.istasyon || []).some((s) => Math.abs(s.n[0] - 28.98) < 0.2);
    for (const s of m.sehir || []) { const c = SEHIR[s]; if (!c) continue; const [x, y] = proj(g, c[0], c[1]); const ist = s === 'İstanbul'; if (!(ist && istVar)) el('circle', { cx: x, cy: y, r: ist ? 3.6 : 2.4, fill: ist ? '#e8590c' : '#3a3a3c' }, sk); yazi(sk, ist && istVar ? x + 12 : x + 5, ist && istVar ? y + 32 : y - 4, s, { class: 'm-sehir' + (ist ? ' m-ist-ad' : '') }); }
    for (const b of m.bolgeAd || []) { const [x, y] = proj(g, b[1], b[2]); yazi(sk, x, y, b[0], { class: 'm-bolgead', 'text-anchor': 'middle' }); }

    // zaman damgası (gerçek haritalardaki gibi köşede): «önce saati oku»
    if (m.damga) { const dg = kat('damga'); const w = 12 + m.damga.length * 8.6; el('rect', { x: 10, y: 10, width: w, height: 30, rx: 6, fill: 'rgba(255,255,255,.92)', stroke: '#1d1d1f', 'stroke-width': 1 }, dg); yazi(dg, 16, 30, m.damga, { class: 'm-damga' }); }
    // sıcak noktalar
    // bölge çerçeveleri altta, numaralı işaretler hepsinin üstünde: üst üste binen bölgelerde işaret kendi bölgesini açsın
    const sk2 = el('g', { class: 'm-sicak' }, svg); const pinK = el('g', { class: 'm-pinler' }, svg); const bolgeler = [];
    (m.bolgeler || []).forEach((b, i) => {
      const B = bolgePoly(g, b.kutu); const grp = el('g', { class: 'm-bolge', 'data-i': i, tabindex: 0, role: 'button', 'aria-label': (i + 1) + '. ' + b.ad }, sk2);
      el('path', { d: d(B.p) + 'Z', class: 'm-bolge-cer' }, grp);
      let [px, py] = b.pin ? proj(g, b.pin[0], b.pin[1]) : [B.kutu[0] + 16, B.kutu[1] + 16];
      px = Math.min(Math.max(px, 18), g.w - 18); py = Math.min(Math.max(py, 18), g.h - 18); // işaret harita çerçevesinin dışına taşmasın
      const pg = el('g', { class: 'm-bolge m-bolge-pin', 'data-i': i, 'aria-hidden': 'true' }, pinK);
      el('circle', { cx: px, cy: py, r: 15, class: 'm-pin' }, pg); yazi(pg, px, py + 5.5, String(i + 1), { class: 'm-pin-t', 'text-anchor': 'middle' });
      pg.addEventListener('click', (e) => { e.stopPropagation(); grp.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
      bolgeler.push({ el: grp, pin: pg, kutu: B.kutu, poly: B.p, ad: b.ad });
    });
    // karartma maskesi (sunum modu)
    const maske = el('path', { class: 'm-maske', d: '', 'fill-rule': 'evenodd' }, svg);
    return { svg, g, katman, bolgeler, maske, tam: [0, 0, g.w, g.h] };
  }

  const SEHIR = {
    İstanbul: [28.98, 41.01], Ankara: [32.85, 39.93], Edirne: [26.56, 41.68], Atina: [23.73, 37.98], Sofya: [23.32, 42.7], Bükreş: [26.1, 44.43],
    Roma: [12.5, 41.9], Paris: [2.35, 48.86], Londra: [-0.13, 51.5], Berlin: [13.4, 52.52], Varşova: [21.01, 52.23], Moskova: [37.62, 55.75],
    Kiev: [30.52, 50.45], Bağdat: [44.37, 33.31], Kahire: [31.24, 30.05], Madrid: [-3.7, 40.42], Cezayir: [3.06, 36.75], Tiflis: [44.8, 41.72],
    Trabzon: [39.72, 41.0], Çanakkale: [26.41, 40.15], Kırklareli: [27.22, 41.73], Tekirdağ: [27.51, 40.98], Bursa: [29.06, 40.18], İzmir: [27.14, 38.42],
    Antalya: [30.71, 36.9], Konya: [32.49, 37.87], Kayseri: [35.48, 38.73], Gökçeada: [25.86, 40.19], Kocaeli: [29.92, 40.77], Rize: [40.52, 41.02],
    Giresun: [38.39, 40.91], Artvin: [41.82, 41.18], Belgrad: [20.46, 44.79], Budapeşte: [19.04, 47.5], Viyana: [16.37, 48.21], Selanik: [22.94, 40.64],
    Samsun: [36.33, 41.29], Sinop: [35.15, 42.03], Muğla: [28.36, 37.22], Aydın: [27.84, 37.84], Isparta: [30.55, 37.76], Yalova: [29.27, 40.65], Sakarya: [30.4, 40.78],
  };

  // ── Sunum modu: bölgeye yakınlaş + dışını karart. i = -1 → tam görünüm
  function odak(H, i, anim) {
    const g = H.g, hedef = i < 0 ? H.tam : (() => { const k = H.bolgeler[i].kutu, pad = 26; let x0 = k[0] - pad, y0 = k[1] - pad, x1 = k[2] + pad, y1 = k[3] + pad; const asp = g.w / g.h; let w = x1 - x0, h = y1 - y0; if (w / h > asp) { const nh = w / asp; y0 -= (nh - h) / 2; h = nh; } else { const nw = h * asp; x0 -= (nw - w) / 2; w = nw; } if (w < g.w) x0 = Math.min(Math.max(0, x0), g.w - w); else x0 = (g.w - w) / 2; if (h < g.h) y0 = Math.min(Math.max(0, y0), g.h - h); else y0 = (g.h - h) / 2; return [x0, y0, w, h]; })();
    H.maske.setAttribute('d', i < 0 ? '' : `M-2000 -2000H${g.w + 2000}V${g.h + 2000}H-2000Z` + d(H.bolgeler[i].poly) + 'Z');
    H.bolgeler.forEach((b, k) => { b.el.classList.toggle('aktif', k === i); if (b.pin) b.pin.classList.toggle('aktif', k === i); });
    const bas = (H.svg.getAttribute('viewBox') || '').split(' ').map(Number), t0 = performance.now(), sure = anim === false || matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650;
    cancelAnimationFrame(H._raf);
    const adim = (t) => { const u = sure ? Math.min(1, (t - t0) / sure) : 1, e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; H.svg.setAttribute('viewBox', bas.map((v, k) => (v + (hedef[k] - v) * e).toFixed(1)).join(' ')); if (u < 1) H._raf = requestAnimationFrame(adim); };
    H._raf = requestAnimationFrame(adim);
  }

  window.Motor = { ciz, odak, proj, inv, alan, ok, el, yazi, SEHIR };
})();
