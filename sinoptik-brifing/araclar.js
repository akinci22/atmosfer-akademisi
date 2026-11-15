// Etkileşimli araçlar: SYNOP çözücü, Skew-T (gerçek sondaj verisi), meteogram, saat hesaplayıcı.
// Veri: SYNOP ve sondaj kamuya açık gözlemlerdir (Ogimet, Wyoming); meteogram değerleri model çıktısından okunmuştur.
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const R = Math.PI / 180;
  const el = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) if (at[k] != null) e.setAttribute(k, at[k]); if (p) p.appendChild(e); return e; };
  const tx = (p, x, y, t, at) => { const e = el('text', Object.assign({ x, y }, at), p); e.textContent = t; return e; };
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const virgul = (v, n) => v.toFixed(n == null ? 1 : n).replace('.', ',').replace('-', '−');

  // ───────────────────────────────────────── SYNOP
  const SYNOP = [
    { g: 'AAXX', k: 'Kısım 0', ad: 'Mesaj türü', r: [['AAXX', 'Kara istasyonu SYNOP mesajı']] },
    { g: '09124', ad: 'Gün · saat · rüzgâr birimi', r: [['YY = 09', 'Ayın 9’u'], ['GG = 12', '12 UTC (15:00 TSİ)'], ['iw = 4', 'Rüzgâr knot, anemometreyle']] },
    { g: '17064', ad: 'İstasyon', r: [['II = 17', 'Türkiye blok numarası'], ['iii = 064', 'İstanbul/Kartal']] },
    { g: '12960', k: 'Kısım 1', ad: 'Göstergeler · bulut tabanı · görüş', r: [['iR = 1', 'Yağış grubu (6RRRtR) bu kısımda var'], ['iX = 2', 'İnsanlı istasyon; 7 grubu yok: önemli hava olayı yok'], ['h = 9', 'En alçak bulut tabanı 2500 m ve üstü (ya da bulut yok)'], ['VV = 60', 'Görüş 10 km (56–80 arası: VV − 50 km)']], p: ['vv'] },
    { g: '32002', ad: 'Toplam bulut · rüzgâr', r: [['N = 3', 'Gökyüzünün 3/8’i kapalı'], ['dd = 20', 'Rüzgâr 200°’den: güney-güneybatı'], ['ff = 02', '2 knot']], p: ['okta', 'ok'] },
    { g: '10139', ad: 'Sıcaklık', r: [['1', 'Sıcaklık grubu'], ['sn = 0', 'Artı işaretli'], ['TTT = 139', '+13,9 °C']], p: ['T'] },
    { g: '21003', ad: 'Çiy noktası', r: [['sn = 1', 'Eksi işaretli'], ['TdTdTd = 003', '−0,3 °C · T − Td = 14,2 °C: çok kuru']], p: ['Td'] },
    { g: '30246', ad: 'İstasyon basıncı', r: [['P0P0P0P0 = 0246', '1024,6 hPa (baştaki 1 yazılmaz)']] },
    { g: '40268', ad: 'Deniz seviyesi basıncı', r: [['PPPP = 0268', '1026,8 hPa · istasyon modelinde «268» yazılır']], p: ['p'] },
    { g: '57020', ad: 'Basınç eğilimi (3 saat)', r: [['a = 7', 'Düşüş'], ['ppp = 020', '2,0 hPa · modelde «−20»; 00 UTC’de 1030,5 idi: 12 saatte −3,7 hPa']], p: ['e'] },
    { g: '60001', ad: 'Yağış', r: [['RRR = 000', 'Ölçülebilir yağış yok'], ['tR = 1', 'Son 6 saat']] },
    { g: '80004', ad: 'Bulut türleri', r: [['Nh = 0', 'Alçak (yoksa orta) bulut miktarı 0'], ['CL = 0', 'Alçak bulut yok'], ['CM = 0', 'Orta bulut yok'], ['CH = 4', 'Sirrus gökyüzünü giderek kaplıyor: yaklaşan sistemin habercisi']], p: ['ch'] },
    { g: '333', k: 'Kısım 3', ad: 'Ek gruplar başlıyor', r: [['333', 'Kısım 3 başlığı']] },
    { g: '83070', ad: 'Bulut katı', r: [['Ns = 3', '3/8'], ['C = 0', 'Sirrus (Ci)'], ['hshs = 70', 'Taban (70 − 50) × 300 m = 6000 m']], p: ['ch'] },
    { g: '90760', ad: 'Ek olay süresi', r: [['907', 'Sonraki 9 grubunun süresi'], ['tt = 60', '60 × 6 dk = 6 saat']] },
    { g: '91106', ad: 'En yüksek hamle', r: [['911', 'Hamle grubu'], ['ff = 06', 'Son 6 saatte en yüksek hamle 6 knot']] },
  ];
  function synop(kap) {
    const kod = h('div', 'syn-kod'); const sag = h('div', 'syn-sag'); kap.append(kod, sag);
    const svgKap = h('div', 'syn-model'); const tablo = h('div', 'syn-tablo', '<p class="ipucu">Bir gruba dokun: anlamı burada, istasyon modelindeki yeri yanda yanar.</p>'); sag.append(svgKap, tablo);
    const svg = el('svg', { viewBox: '0 0 240 200', class: 'syn-svg', role: 'img', 'aria-label': 'Kartal istasyon modeli' }, svgKap);
    const P = {};
    const parca = (ad, f) => { const g = el('g', { class: 'syn-p', 'data-p': ad }, svg); f(g); P[ad] = g; };
    parca('ok', (g) => { el('circle', { cx: 120, cy: 100, r: 15, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, g); tx(g, 120, 140, 'SSW 2 kt (sakin sayılır)', { 'text-anchor': 'middle', class: 'syn-k' }); });
    parca('okta', (g) => { el('circle', { cx: 120, cy: 100, r: 9, fill: 'var(--bg)', stroke: 'currentColor', 'stroke-width': 2 }, g); el('path', { d: 'M120 100V91A9 9 0 0 1 129 100Z', fill: 'currentColor' }, g); });
    parca('T', (g) => tx(g, 100, 88, '14', { 'text-anchor': 'end', class: 'syn-d', fill: '#c0281b' }));
    parca('Td', (g) => tx(g, 100, 122, '0', { 'text-anchor': 'end', class: 'syn-d', fill: '#1a7f37' }));
    parca('p', (g) => tx(g, 140, 88, '268', { class: 'syn-d' }));
    parca('e', (g) => { tx(g, 140, 122, '−20', { class: 'syn-d', fill: '#1f5fd1' }); el('path', { d: 'M178 112l8 8l8-14', fill: 'none', stroke: '#1f5fd1', 'stroke-width': 2 }, g); });
    parca('ch', (g) => { el('path', { d: 'M108 52h22m0 0q6 0 8-6', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, g); tx(g, 146, 50, 'CH 4', { class: 'syn-k' }); });
    parca('vv', (g) => tx(g, 64, 106, '10 km', { 'text-anchor': 'end', class: 'syn-k' }));
    const sec = (i) => {
      kod.querySelectorAll('button').forEach((b, k) => b.setAttribute('aria-pressed', k === i ? 'true' : 'false'));
      const s = SYNOP[i]; Object.values(P).forEach((g) => g.classList.remove('yan'));
      (s.p || []).forEach((p) => P[p] && P[p].classList.add('yan'));
      tablo.innerHTML = `<p class="syn-baslik"><b>${s.g}</b> · ${s.ad}</p><dl>${s.r.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl>` + ((s.p || []).length ? '' : '<p class="ipucu">Bu grup istasyon modelinde gösterilmez.</p>');
    };
    let bolum = null;
    SYNOP.forEach((s, i) => {
      if (s.k && s.k !== bolum) { bolum = s.k; kod.appendChild(h('span', 'syn-bolum', s.k)); }
      const b = h('button', 'syn-g', s.g); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.addEventListener('click', () => sec(i)); kod.appendChild(b);
    });
    const tum = h('button', 'dugme ikincil syn-tum', 'Hepsini sırayla oynat'); tum.type = 'button'; kap.appendChild(tum);
    let t = null; tum.addEventListener('click', () => { if (t) { clearInterval(t); t = null; tum.textContent = 'Hepsini sırayla oynat'; return; } let i = 0; sec(0); tum.textContent = 'Durdur'; t = setInterval(() => { i++; if (i >= SYNOP.length) { clearInterval(t); t = null; tum.textContent = 'Hepsini sırayla oynat'; return; } sec(i); }, 2200); });
  }

  // ───────────────────────────────────────── SKEW-T (Kartal 09.11.2026 00 UTC; Wyoming)
  // [p, z, T, Td, yön, m/s]
  const SND = [[1028, 19, 5.2, 2.8, 70, 0.5], [1019, 91, 7.6, 1.6, 81, 1.8], [1014, 132, 7.4, 2.4, 87, 2.6], [1007, 189, 7.2, 1.2, 96, 3.6], [1000, 247, 6.8, 0.8, 105, 4.6], [928, 858, 2.8, -3.2, 175, 2.1], [925, 884, 2.6, -3.4, 175, 2.1], [892, 1178, 1.0, -6.0, 90, 4.5], [884, 1250, 2.2, -8.8, 84, 4.5], [861, 1464, 3.2, -21.8, 81, 3.7], [850, 1568, 2.8, -25.2, 75, 2.6], [826, 1799, 1.7, -29.0, 30, 2.6], [804, 2014, 0.5, -31.5, 10, 4.1], [796, 2094, 0.1, -32.1, 5, 4.6], [700, 3112, -6.1, -39.1, 350, 6.7], [671, 3442, -7.7, -25.7, 344, 8.3], [628, 3952, -10.9, -25.6, 335, 10.8], [595, 4367, -13.5, -25.5, 333, 12.4], [556, 4879, -17.3, -27.3, 326, 14.0], [508, 5553, -20.1, -31.1, 317, 16.1], [500, 5670, -21.7, -32.7, 315, 16.5], [458, 6304, -25.4, -37.7, 320, 21.1], [400, 7280, -32.1, -45.1, 315, 25.2], [389, 7477, -33.9, -45.9, 315, 25.2], [300, 9250, -47.7, -59.7, 310, 24.7], [250, 10430, -56.3, null, 300, 17.5], [200, 11840, -60.9, null, 295, 12.4]];
  const INDIS = [
    ['Showalter (SHOW)', '13,8', '850 hPa’dan kaldırılan parselin 500 hPa’daki sıcaklık farkı. Pozitif ve büyük: çok kararlı. 0’ın altı kararsızlık, −3’ün altı kuvvetli.'],
    ['K indeksi', '−33,7', '(T850 − T500) + Td850 − (T700 − Td700). 30’un üstü gök gürültülü sağanak için elverişli; negatif değer orta seviyenin çok kuru olduğunu söyler.'],
    ['Total Totals (TT)', '21,0', 'T850 + Td850 − 2·T500. 44’ün altında konveksiyon beklenmez.'],
    ['MUCAPE', '0 J/kg', 'En kararsız parselin kaldırma enerjisi. Sıfır: kendiliğinden yükselecek parsel yok.'],
    ['Yağışa dönüşebilir su (PWAT)', '7,9 mm', 'Sütundaki toplam su buharı. Çok düşük: sütun kuru; yağış için nemin dışarıdan gelmesi gerekir.'],
  ];
  const ODAK = [
    { ad: 'Yüzey ışınım inversiyonu', p: [1028, 1014], m: 'Yerde 5,2 °C, ~70 m yukarıda 7,6 °C: gece yer ışınımla soğumuş, sıcaklık yükseklikle artıyor.' },
    { ad: 'Çökme inversiyonu', p: [892, 861], m: '892–861 hPa (~1,2–1,5 km) arasında sıcaklık 1,0’dan 3,2 °C’ye artıyor. Yüksek basınçta çöken hava ısınmış; üstünde Td birden düşüyor.' },
    { ad: 'Aşırı kuru tabaka', p: [861, 700], m: 'Td −22 → −39 °C; 850’de nem %11, 700’de %5. Haritalardaki büyük T − Td değerlerinin kaynağı.' },
    { ad: '850 hPa', p: [850, 850], m: 'T 2,8 °C · Td −25,2 °C · 1568 m · 75° 2,6 m/s. 850 hPa haritasındaki «3 / 28 / 157» bu satırdan.' },
    { ad: '700 hPa', p: [700, 700], m: 'T −6,1 °C · Td −39,1 °C · 3112 m · 350° 6,7 m/s. 700 haritasındaki «−6 / 33 / 311».' },
    { ad: '500 hPa', p: [500, 500], m: 'T −21,7 °C · 5670 m · 315° 16,5 m/s ≈ 32 kt. 500 haritasındaki «567 dam».' },
    { ad: '300 hPa', p: [300, 300], m: 'T −47,7 °C · 9250 m · 310° 24,7 m/s ≈ 48 kt: jetin dışında.' },
  ];
  function skewt(kap) {
    const W = 560, H = 600, L = Math.log(1050 / 200), sx = 7;
    const Y = (p) => H * (1 - Math.log(1050 / p) / L), X = (T, p) => (T + 40) * sx + (H - Y(p));
    const svg = el('svg', { viewBox: `-40 -10 ${W + 110} ${H + 40}`, class: 'skt-svg', role: 'img', 'aria-label': 'Kartal sondajı Skew-T diyagramı' });
    const sol = h('div', 'skt-sol'); const sag = h('div', 'skt-sag'); sol.appendChild(svg); kap.append(sol, sag);
    const clip = el('clipPath', { id: 'skt-k' }, el('defs', {}, svg)); el('rect', { x: 0, y: 0, width: W, height: H }, clip);
    const ic = el('g', { 'clip-path': 'url(#skt-k)' }, svg);
    el('rect', { x: 0, y: 0, width: W, height: H, class: 'skt-zemin' }, ic);
    const line = (pts, at) => el('path', Object.assign({ d: 'M' + pts.map((q) => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('L'), fill: 'none' }, at), ic);
    const ps = []; for (let p = 1050; p >= 200; p -= 10) ps.push(p);
    for (let th = 250; th <= 420; th += 10) line(ps.map((p) => [X(th * Math.pow(p / 1000, 0.2857) - 273.15, p), Y(p)]), { class: 'skt-kuru' });
    const es = (T) => 6.112 * Math.exp((17.67 * T) / (T + 243.5));
    for (const tw of [-8, -4, 0, 4, 8, 12, 16, 20, 24, 28]) { let T = tw + 273.15; const pts = []; for (let p = 1000; p >= 200; p -= 5) { pts.push([X(T - 273.15, p), Y(p)]); const e = es(T - 273.15), rs = (0.622 * e) / (p - e), num = 287 * T + 2.5e6 * rs, den = 1004 + (2.5e6 * 2.5e6 * rs * 0.622) / (287 * T * T); T -= (num / den / p) * 5; } line(pts, { class: 'skt-nemli' }); }
    for (const w of [1, 2, 4, 8, 16]) { const pts = []; for (let p = 1050; p >= 600; p -= 25) { const e = ((w / 1000) * p) / (0.622 + w / 1000), Td = (243.5 * Math.log(e / 6.112)) / (17.67 - Math.log(e / 6.112)); pts.push([X(Td, p), Y(p)]); } line(pts, { class: 'skt-karisim' }); }
    for (let T = -110; T <= 40; T += 10) line([[X(T, 1050), Y(1050)], [X(T, 200), Y(200)]], { class: T === 0 ? 'skt-izo0' : 'skt-izo' });
    for (const p of [1000, 850, 700, 500, 400, 300, 250, 200]) { el('line', { x1: 0, x2: W, y1: Y(p), y2: Y(p), class: 'skt-izobar' }, svg); tx(svg, -6, Y(p) + 4, String(p), { 'text-anchor': 'end', class: 'skt-et' }); }
    for (let T = -40; T <= 40; T += 10) tx(svg, X(T, 1050), H + 18, String(T).replace('-', '−'), { 'text-anchor': 'middle', class: 'skt-et' });
    tx(svg, -36, -2, 'hPa', { class: 'skt-et' }); tx(svg, W, H + 34, '°C', { 'text-anchor': 'end', class: 'skt-et' });
    // vurgu bandı
    const bant = el('rect', { x: 0, width: W, y: 0, height: 0, class: 'skt-bant' }, ic);
    line(SND.map((s) => [X(s[2], s[0]), Y(s[0])]), { class: 'skt-T' });
    line(SND.filter((s) => s[3] != null).map((s) => [X(s[3], s[0]), Y(s[0])]), { class: 'skt-Td' });
    // rüzgâr okları (sağ kenar)
    for (const s of SND.filter((q) => [1000, 925, 850, 700, 500, 400, 300, 250, 200].includes(q[0]))) window.Motor.ok(svg, W + 52, Y(s[0]), s[4], s[5] * 1.944, 'currentColor');
    tx(svg, W + 52, -2, 'rüzgâr', { 'text-anchor': 'middle', class: 'skt-et' });
    // imleç okuması
    const imlec = el('g', { class: 'skt-imlec', visibility: 'hidden' }, svg); const iy = el('line', { x1: 0, x2: W, class: 'skt-iy' }, imlec);
    const oku = h('p', 'skt-oku', 'İmleci (ya da parmağını) diyagramın üstünde gezdir: basınç, yükseklik, T, Td ve nem okunur.'); sol.appendChild(oku);
    const interp = (p) => { for (let i = 0; i < SND.length - 1; i++) { const a = SND[i], b = SND[i + 1]; if (p <= a[0] && p >= b[0]) { const t = Math.log(a[0] / p) / Math.log(a[0] / b[0]); const f = (k) => (a[k] == null || b[k] == null ? null : a[k] + (b[k] - a[k]) * t); return { z: f(1), T: f(2), Td: f(3) }; } } return null; };
    const hareket = (ev) => { const r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal, y = ((ev.clientY - r.top) / r.height) * vb.height + vb.y; if (y < 0 || y > H) return; const p = 1050 / Math.exp((1 - y / H) * L), v = interp(p); if (!v) return; imlec.setAttribute('visibility', 'visible'); iy.setAttribute('y1', y); iy.setAttribute('y2', y); const rh = v.Td == null ? null : (100 * es(v.Td)) / es(v.T); oku.innerHTML = `<b>${Math.round(p)} hPa</b> · ${Math.round(v.z)} m · T ${virgul(v.T)} °C` + (v.Td == null ? '' : ` · Td ${virgul(v.Td)} °C · T − Td ${virgul(v.T - v.Td)} · nem %${Math.round(rh)}`); };
    svg.addEventListener('pointermove', hareket); svg.addEventListener('pointerdown', hareket);
    // odak listesi
    const liste = h('div', 'skt-liste'); sag.appendChild(h('p', 'kucuk-baslik', 'Diyagramda göster')); sag.appendChild(liste);
    const aciklama = h('p', 'skt-aciklama', 'Bir tabakaya dokun: diyagramda yanar, açıklaması burada çıkar.');
    ODAK.forEach((o) => { const b = h('button', 'cip', o.ad); b.type = 'button'; b.addEventListener('click', () => { liste.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false')); const y0 = Y(o.p[0]), y1 = Y(o.p[1]); bant.setAttribute('y', Math.min(y0, y1) - (o.p[0] === o.p[1] ? 6 : 2)); bant.setAttribute('height', Math.abs(y1 - y0) + (o.p[0] === o.p[1] ? 12 : 4)); aciklama.textContent = o.m; }); b.setAttribute('aria-pressed', 'false'); liste.appendChild(b); });
    sag.appendChild(aciklama);
    sag.appendChild(h('p', 'kucuk-baslik', 'İndisler'));
    const ind = h('div', 'skt-indis'); sag.appendChild(ind);
    INDIS.forEach(([a, v, m]) => { const d = h('details', 'satir'); d.innerHTML = `<summary><span>${a}</span><b>${v}</b></summary><p>${m}</p>`; ind.appendChild(d); });
    sag.appendChild(h('p', 'skt-lejant', '<span class="c-T"></span> sıcaklık (T) <span class="c-Td"></span> çiy noktası (Td) <span class="c-k"></span> kuru adyabat <span class="c-n"></span> nemli adyabat <span class="c-m"></span> karışma oranı'));
  }

  // ───────────────────────────────────────── METEOGRAM (Kartal, 09.11.2026 00 UTC koşusu; saatler UTC)
  const MG = {
    bulut: [0, 0, 0, 0, 1, 0, 0, 50, 32, 25, 23, 10, 35, 85, 70, 65, 75, 88, 85, 84, 99, 100, 100, 100, 100, 100, 100, 100, 100, 99, 88, 60, 53, 35, 29, 31, 24, 13, 5, 10, 12, 10, 19, 26, 48, 100, 92, 82, 81, 73, 84, 78, 96, 77, 80, 40, 15, 68, 75, 81, 79, 93, 65, 55, 62, 82, 66, 64, 45, 40, 42, 35],
    T: [8.8, 8.0, 7.8, 8.1, 8.0, 9.4, 11.2, 12.1, 12.8, 13.5, 13.9, 14.2, 14.2, 13.3, 11.8, 11.3, 11.5, 12.1, 12.4, 12.1, 13.0, 13.6, 13.3, 13.1, 12.6, 11.2, 11.1, 11.5, 12.1, 12.0, 12.0, 11.7, 12.2, 13.4, 13.7, 13.8, 13.5, 12.4, 12.3, 12.5, 12.6, 12.8, 12.6, 12.7, 12.8, 12.7, 12.3, 13.3, 13.2, 13.3, 14.4, 14.8, 14.8, 15.3, 16.1, 16.6, 16.6, 16.9, 17.2, 17.1, 16.4, 15.5, 16.5, 16.8, 17.0, 17.1, 17.1, 17.1, 17.2, 17.4, 17.4, 17.4],
    p: [1030.4, 1030.4, 1030.2, 1030.1, 1030.5, 1030.8, 1031.0, 1030.3, 1029.6, 1029.7, 1029.0, 1028.3, 1027.6, 1027.2, 1027.1, 1026.9, 1027.0, 1026.8, 1026.2, 1026.4, 1026.1, 1026.2, 1025.7, 1025.6, 1025.8, 1025.6, 1025.4, 1025.2, 1025.5, 1025.7, 1025.4, 1025.2, 1025.0, 1024.6, 1024.0, 1023.4, 1023.3, 1023.5, 1023.3, 1022.6, 1022.5, 1022.4, 1022.2, 1021.7, 1021.3, 1021.2, 1020.7, 1020.3, 1019.8, 1019.6, 1019.4, 1019.0, 1018.6, 1018.9, 1019.2, 1019.1, 1018.9, 1018.6, 1018.7, 1018.1, 1017.0, 1016.8, 1017.1, 1016.9, 1016.8, 1017.0, 1017.0, 1016.8, 1016.4, 1016.5, 1016.3, 1015.6],
    yagis: [], ruzgar: [16, 15, 15, 15, 15, 16, 13, 16, 16, 14, 9, 8, 7, 8, 15, 16, 11, 10, 12, 11, 17, 24, 16, 22, 20, 9, 8, 12, 19, 21, 20, 13, 13, 19, 22, 22, 18, 15, 10, 9, 6, 8, 10, 16, 15, 15, 17, 19, 19, 17, 18, 29, 25, 22, 26, 26, 29, 30, 29, 26, 48, 39, 37, 33, 29, 31, 30, 33, 31, 36, 36, 33],
    yon: [],
  };
  for (let i = 0; i < 72; i++) { MG.yagis.push([0.1, 0.2, 1.1, 1.6, 0.7, 0.7, 0.3, 0.3, 0.1][i - 24] || (i === 61 ? 0.1 : 0)); MG.yon.push(i < 13 ? 70 : i < 24 ? 80 : i < 31 ? 30 : i < 42 ? 60 : i < 48 ? 190 : 215); }
  const GUN = ['Pzt', 'Sal', 'Çrş', 'Prş'];
  function meteogram(kap) {
    let tsi = false;
    const ust = h('div', 'mg-ust'); const sw = h('button', 'cip', 'Saatleri TSİ göster'); sw.type = 'button'; sw.setAttribute('aria-pressed', 'false'); ust.appendChild(sw);
    const oku = h('p', 'mg-oku', 'İmleci grafikte gezdir: o saatin bütün değerleri burada.'); kap.append(ust);
    const W = 720, x0 = 46, pw = W - x0 - 46, dx = pw / 71, X = (i) => x0 + i * dx;
    const pan = [['Bulut kapalılığı (%)', 70], ['Sıcaklık (°C) · basınç (hPa)', 120], ['Saatlik yağış (mm)', 70], ['Rüzgâr (km/sa) · yön', 80]];
    let y = 14; const yer = pan.map(([ad, hh]) => { const o = { ad, y: y + 16, h: hh }; y += hh + 34; return o; });
    const svg = el('svg', { viewBox: `0 0 ${W} ${y}`, class: 'mg-svg', role: 'img', 'aria-label': 'Kartal WRF meteogramı' }); const kay = h('div', 'mg-kaydir'); kay.appendChild(svg); kap.append(kay, oku);
    const vurgu = el('rect', { x: X(24) - dx / 2, width: dx * 10, y: 0, height: y, class: 'mg-yagisbant' }, svg);
    const an = el('line', { x1: X(30.75), x2: X(30.75), y1: 0, y2: y, class: 'mg-an' }, svg); tx(svg, X(30.75) + 4, 10, 'sunum anı', { class: 'mg-et mg-an-t' });
    const eksenG = el('g', {}, svg);
    yer.forEach((o) => { tx(svg, x0, o.y - 4, o.ad, { class: 'mg-baslik' }); el('rect', { x: x0, y: o.y, width: pw, height: o.h, class: 'mg-cerceve' }, svg); });
    const eksenCiz = () => { eksenG.innerHTML = ''; yer.forEach((o) => { for (let i = 0; i <= 72; i += 6) { const xx = X(Math.min(i, 71)); el('line', { x1: xx, x2: xx, y1: o.y, y2: o.y + o.h, class: i % 24 === 0 ? 'mg-gun' : 'mg-izgara' }, eksenG); const saat = (i + (tsi ? 3 : 0)) % 24, gun = Math.floor((i + (tsi ? 3 : 0)) / 24); if (o === yer[3]) tx(eksenG, xx, o.y + o.h + 14, saat === 0 || (tsi && saat === 3 && i === 0) ? GUN[gun] : String(saat).padStart(2, '0'), { 'text-anchor': 'middle', class: saat === 0 ? 'mg-et mg-gunet' : 'mg-et' }); } }); };
    eksenCiz();
    // bulut
    const b = yer[0]; MG.bulut.forEach((v, i) => el('rect', { x: X(i) - dx * 0.4, width: dx * 0.8, y: b.y + b.h * (1 - v / 100), height: (b.h * v) / 100, class: 'mg-bulut' }, svg));
    // sıcaklık + basınç
    const t = yer[1], Ty = (v) => t.y + t.h * (1 - (v - 6) / 13), Py = (v) => t.y + t.h * (1 - (v - 1014) / 18);
    const yol = (arr, f, cls) => el('path', { d: 'M' + arr.map((v, i) => X(i).toFixed(1) + ' ' + f(v).toFixed(1)).join('L'), class: cls }, svg);
    yol(MG.T, Ty, 'mg-T'); yol(MG.p, Py, 'mg-p');
    for (const v of [8, 12, 16]) tx(svg, x0 - 6, Ty(v) + 4, String(v), { 'text-anchor': 'end', class: 'mg-et mg-Tet' });
    for (const v of [1015, 1020, 1025, 1030]) tx(svg, x0 + pw + 6, Py(v) + 4, String(v), { class: 'mg-et mg-pet' });
    // yağış
    const r = yer[2]; MG.yagis.forEach((v, i) => { if (!v) return; el('rect', { x: X(i) - dx * 0.4, width: dx * 0.8, y: r.y + r.h * (1 - v / 2), height: (r.h * v) / 2, class: 'mg-yagis' }, svg); if (v >= 0.1) tx(svg, X(i), r.y + r.h * (1 - v / 2) - 3, virgul(v), { 'text-anchor': 'middle', class: 'mg-et' }); });
    // rüzgâr
    const w = yer[3], Wy = (v) => w.y + w.h * (1 - v / 55); yol(MG.ruzgar, Wy, 'mg-r');
    for (const v of [10, 30, 50]) tx(svg, x0 - 6, Wy(v) + 4, String(v), { 'text-anchor': 'end', class: 'mg-et' });
    for (let i = 0; i < 72; i += 3) { const a = (MG.yon[i] + 180) * R, cx = X(i), cy = w.y + w.h - 9; el('line', { x1: cx - Math.sin(a) * 7, y1: cy + Math.cos(a) * 7, x2: cx + Math.sin(a) * 7, y2: cy - Math.cos(a) * 7, class: 'mg-yon', 'marker-end': 'url(#mg-uc)' }, svg); }
    const mk = el('marker', { id: 'mg-uc', viewBox: '0 0 6 6', refX: 5, refY: 3, markerWidth: 5, markerHeight: 5, orient: 'auto' }, el('defs', {}, svg)); el('path', { d: 'M0 0L6 3L0 6Z', class: 'mg-uc' }, mk);
    // imleç
    const im = el('line', { y1: 0, y2: y, class: 'mg-im', visibility: 'hidden' }, svg);
    const hareket = (ev) => { const rr = svg.getBoundingClientRect(), xx = ((ev.clientX - rr.left) / rr.width) * W, i = Math.round((xx - x0) / dx); if (i < 0 || i > 71) return; im.setAttribute('x1', X(i)); im.setAttribute('x2', X(i)); im.setAttribute('visibility', 'visible'); const s = i + (tsi ? 3 : 0); oku.innerHTML = `<b>${GUN[Math.floor(s / 24)]} ${String(s % 24).padStart(2, '0')}:00 ${tsi ? 'TSİ' : 'UTC'}</b> · bulut %${MG.bulut[i]} · ${virgul(MG.T[i])} °C · ${virgul(MG.p[i])} hPa · yağış ${virgul(MG.yagis[i])} mm · rüzgâr ${MG.ruzgar[i]} km/sa (${MG.yon[i]}°)`; };
    svg.addEventListener('pointermove', hareket); svg.addEventListener('pointerdown', hareket);
    sw.addEventListener('click', () => { tsi = !tsi; sw.setAttribute('aria-pressed', String(tsi)); sw.textContent = tsi ? 'Saatleri UTC göster' : 'Saatleri TSİ göster'; eksenCiz(); });
    const kart = h('div', 'mg-kartlar');
    [['Yağış penceresi', 'Salı 00–10 UTC (03–13 TSİ), toplam ~5 mm, en çok 03 UTC’de 1,6 mm', () => vurgu.classList.toggle('vurgu')], ['Basınç', 'Pazartesi ~1031 → Salı ~1025 → Çarşamba ~1017 hPa: sürekli düşüş', null], ['Lodos', 'Çarşamba güneybatılı rüzgâr 48 km/sa’ya kadar', null]].forEach(([a, m, f]) => { const d = h('div', 'mg-kart', `<b>${a}</b><span>${m}</span>`); if (f) { d.tabIndex = 0; d.setAttribute('role', 'button'); d.addEventListener('click', f); d.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), f())); } kart.appendChild(d); });
    kap.appendChild(kart); void an;
  }

  // ───────────────────────────────────────── SAAT HESAPLAYICI
  function saat(kap) {
    const gunAd = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const ay = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    kap.innerHTML = `<div class="saat-giris"><label>Sunum günü <input type="date" value="2026-11-10" class="saat-tarih"></label><label>Sunum saati (TSİ) <input type="time" value="09:45" class="saat-saat"></label></div><div class="saat-sonuc"></div><div class="saat-cevir"><label>UTC ↔ TSİ çevir <input type="range" min="0" max="23" value="12" class="saat-kay"></label><p class="saat-cevir-t"></p></div>`;
    const yaz = () => {
      const t = kap.querySelector('.saat-tarih').value, s = kap.querySelector('.saat-saat').value || '09:45'; if (!t) return;
      const d = new Date(t + 'T00:00:00Z'), once = new Date(d.getTime() - 864e5);
      const f = (x) => `${x.getUTCDate()} ${ay[x.getUTCMonth()]} ${gunAd[x.getUTCDay()]}`;
      const [hh, mm] = s.split(':').map(Number); const utc = (hh - 3 + 24) % 24;
      kap.querySelector('.saat-sonuc').innerHTML = `<div class="saat-satir"><span>Analiz anı</span><b>${f(once)} · 12 UTC</b><em>= 15:00 TSİ. Bütün analiz haritaları bu ana ait olmalı.</em></div><div class="saat-satir"><span>Tahmin</span><b>${f(d)} · bütün gün</b><em>Model haritalarında «+12 … +36» saatleri bu güne düşer.</em></div><div class="saat-satir"><span>Sunum anı</span><b>${s} TSİ = ${String(utc).padStart(2, '0')}:${String(mm).padStart(2, '0')} UTC</b><em>Meteogramda bu saati işaretle: «şu an yağış zayıflamış olmalı» gibi cümleler buradan çıkar.</em></div><div class="saat-satir"><span>İndirme</span><b>${f(once)} akşamı</b><em>12 UTC kartları birkaç saat gecikmeyle çıkar ve sitede yalnız son hâl durur: indirdiğin anda dosya adına saati yaz.</em></div>`;
    };
    const cevir = () => { const u = +kap.querySelector('.saat-kay').value; kap.querySelector('.saat-cevir-t').innerHTML = `<b>${String(u).padStart(2, '0')}:00 UTC</b> = <b>${String((u + 3) % 24).padStart(2, '0')}:00 TSİ</b>` + (u + 3 >= 24 ? ' (ertesi gün)' : ''); };
    kap.querySelectorAll('input').forEach((i) => i.addEventListener('input', () => { yaz(); cevir(); }));
    yaz(); cevir();
  }

  window.Araclar = { synop, skewt, meteogram, saat };
})();
