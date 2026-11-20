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
  const dugme = (cls, html, f, et) => { const b = h('button', cls, html); b.type = 'button'; if (et) { b.setAttribute('aria-label', et); b.title = et; } if (f) b.addEventListener('click', f); return b; };

  // ───────────────────────────────────────── KATEGORİ KATEGORİ SEÇİM
  // Önce kategori satırı (ad + sayı), sonra yalnız o kategorinin öğeleri; «‹ Önceki · Sonraki ›» kategoriler arasında da geçer.
  // Masaüstünde şerit panelin üstünde yapışkan, adım düğmeleri panelin altında; telefonda şerit yapışkan sahnenin içine taşınır
  // (app.js) ve ‹ › öğe satırının iki ucundadır.
  // kats: [{ ad, n?, baslik?, ogeler: [{ ad (html), baslik? }] }] · sec(k, i, katDegisti): sahneyi değiştir (i = −1: öğe yok)
  // se: { ilk(k) → kategoriye basınca seçilecek öğe, ogeCls, ad, bos(k) → öğesiz kategoride şerit notu, sinif }
  function katSecim(kats, sec, se) {
    se = se || {};
    const serit = h('div', 'secim-serit' + (se.sinif ? ' ' + se.sinif : ''));
    const bar = h('div', 'sekme-bar kat'); bar.setAttribute('role', 'tablist'); bar.setAttribute('aria-label', se.ad || 'Kategoriler');
    const satir = h('div', 'oge-satir'); const oge = h('div', 'oge');
    const g1 = dugme('gez-b', '‹', () => geri(), 'Önceki'), g2 = dugme('gez-b', '›', () => ileri(), 'Sonraki');
    satir.append(g1, oge, g2); serit.append(bar, satir);
    const gez = h('div', 'adim-gez'); const d1 = dugme('gez-d', '‹ Önceki', () => geri()), et = h('span', 'gez-yazi'), d2 = dugme('gez-d gez-ileri', 'Sonraki ›', () => ileri());
    et.setAttribute('aria-live', 'polite');
    gez.append(d1, et, d2);
    let K = 0, I = -1, cizilen = -1;
    const kaydirGor = (kap, el) => { if (!el || kap.scrollWidth <= kap.clientWidth + 1) return; const kr = kap.getBoundingClientRect(), r = el.getBoundingClientRect(); if (r.left < kr.left + 4 || r.right > kr.right - 4) kap.scrollLeft += r.left - kr.left - 28; };
    kats.forEach((k, j) => {
      const n = k.n != null ? k.n : k.ogeler.length;
      const b = dugme('sekme-b kat-b', `<span>${k.ad}</span>${n ? `<span class="kat-n">${n}</span>` : ''}`, () => git(j, se.ilk ? se.ilk(j) : (kats[j].ogeler.length ? 0 : -1)));
      b.setAttribute('role', 'tab'); if (k.baslik) b.title = k.baslik; bar.appendChild(b);
    });
    const ciz = () => {
      [...bar.children].forEach((b, j) => { b.setAttribute('aria-selected', String(j === K)); b.tabIndex = j === K ? 0 : -1; });
      const k = kats[K], n = k.ogeler.length;
      if (cizilen !== K) {
        cizilen = K; oge.innerHTML = '';
        if (n) k.ogeler.forEach((o, i) => { const b = dugme(se.ogeCls || 'oge-b', o.ad, () => git(K, I === i && se.kapanir ? -1 : i)); if (o.baslik) b.title = o.baslik; oge.appendChild(b); });
        else oge.appendChild(h('span', 'oge-bos', se.bos ? se.bos(K) : 'Açıklama aşağıda'));
        oge.scrollLeft = 0;
      }
      [...oge.querySelectorAll('button')].forEach((b, i) => b.setAttribute('aria-pressed', String(i === I)));
      et.innerHTML = `<b>${k.ad}</b><span>${n ? `${I >= 0 ? I + 1 : '–'} / ${n}` : `${K + 1}. kategori / ${kats.length}`}</span>`;
      const bas = K === 0 && I <= 0, son = K === kats.length - 1 && (!n || I === n - 1);
      g1.disabled = d1.disabled = bas; g2.disabled = d2.disabled = son;
      kaydirGor(bar, bar.children[K]); kaydirGor(oge, oge.children[Math.max(0, I)]);
    };
    const git = (k, i) => { const kd = k !== K; K = k; I = i; ciz(); sec(k, i, kd); };
    const ileri = () => { const n = kats[K].ogeler.length; if (n && I < n - 1) git(K, I + 1); else if (K < kats.length - 1) git(K + 1, kats[K + 1].ogeler.length ? 0 : -1); };
    const geri = () => { if (I > 0) git(K, I - 1); else if (K > 0) { const m = kats[K - 1].ogeler.length; git(K - 1, m ? m - 1 : -1); } };
    bar.addEventListener('keydown', (e) => { if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return; e.preventDefault(); const j = (K + (e.key === 'ArrowRight' ? 1 : kats.length - 1)) % kats.length; bar.children[j].click(); bar.children[j].focus(); });
    ciz();
    return { serit, gez, bar, git, ileri, geri, ayarla: (k, i) => { K = k; I = i; ciz(); }, durum: () => [K, I], sonda: () => K === kats.length - 1 && I === kats[K].ogeler.length - 1 };
  }

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
  const SYN_KISIM = { 'Kısım 0': 'Kısım 0: mesaj türü, gün-saat, istasyon', 'Kısım 1': 'Kısım 1: ana gözlem grupları', 'Kısım 3': 'Kısım 3: ek gruplar' };
  function synop(kap, gorsel) {
    // sahne (gorsel): istasyon modeli + mesajın tamamı · panel (kap): kısım → grup seçimi, açıklama
    gorsel = gorsel || kap;
    const svgKap = h('div', 'sahne-cer syn-model');
    const mesaj = h('p', 'syn-mesaj'); mesaj.setAttribute('aria-label', 'Mesajın tamamı; seçili grup vurgulu');
    const parcaM = SYNOP.map((s) => { const sp = h('span', 'syn-m', s.g); mesaj.append(sp, ' '); return sp; });
    gorsel.append(svgKap, mesaj);
    const tablo = h('div', 'syn-tablo', '<p class="ipucu">Önce kısmı, sonra grubu seç: anlamı burada; istasyon modelinde ve mesajda yeri yanar.</p>');
    // viewBox çizimin sınırına kırpılmış: boş kenar yok, sahnede yer kazanır
    const svg = el('svg', { viewBox: '22 30 182 122', class: 'syn-svg', role: 'img', 'aria-label': 'Kartal istasyon modeli' }, svgKap);
    const P = {};
    const parca = (ad, f) => { const g = el('g', { class: 'syn-p', 'data-p': ad }, svg); f(g); P[ad] = g; };
    parca('ok', (g) => { el('circle', { cx: 120, cy: 100, r: 15, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, g); tx(g, 120, 140, 'SSW 2 kt (sakin sayılır)', { 'text-anchor': 'middle', class: 'syn-k' }); });
    parca('okta', (g) => { el('circle', { cx: 120, cy: 100, r: 9, fill: 'var(--bg)', stroke: 'currentColor', 'stroke-width': 2 }, g); el('path', { d: 'M120 100V91A9 9 0 0 1 129 100Z', fill: 'currentColor' }, g); });
    parca('T', (g) => tx(g, 100, 88, '14', { 'text-anchor': 'end', class: 'syn-d', fill: '#c0281b' }));
    parca('Td', (g) => tx(g, 100, 122, '0', { 'text-anchor': 'end', class: 'syn-d', fill: '#1a7f37' }));
    parca('p', (g) => tx(g, 140, 88, '268', { class: 'syn-d' }));
    parca('e', (g) => { tx(g, 140, 122, '−20', { class: 'syn-d', fill: '#1f5fd1' }); el('path', { d: 'M178 106l16 14', fill: 'none', stroke: '#1f5fd1', 'stroke-width': 2 }, g); }); // a = 7: düzenli düşüş → tek eğik çizgi (\)
    parca('ch', (g) => { el('path', { d: 'M108 52h22m0 0q6 0 8-6', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, g); tx(g, 146, 50, 'CH 4', { class: 'syn-k' }); });
    parca('vv', (g) => tx(g, 64, 106, '10 km', { 'text-anchor': 'end', class: 'syn-k' }));
    const goster = (i) => {
      Object.values(P).forEach((g) => g.classList.remove('yan')); parcaM.forEach((sp, k) => sp.classList.toggle('yan', k === i));
      if (i < 0) return;
      const s = SYNOP[i]; (s.p || []).forEach((p) => P[p] && P[p].classList.add('yan'));
      tablo.innerHTML = `<p class="syn-baslik"><b>${s.g}</b> · ${s.ad}</p><dl>${s.r.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl>` + ((s.p || []).length ? '' : '<p class="ipucu">Bu grup istasyon modelinde gösterilmez.</p>');
      // mesaj şeridi telefonda tek satır, yana kayar: seçili grup görünsün
      const sp = parcaM[i]; if (mesaj.scrollWidth > mesaj.clientWidth + 1) { const mr = mesaj.getBoundingClientRect(), r = sp.getBoundingClientRect(); if (r.left < mr.left || r.right > mr.right) mesaj.scrollLeft += r.left - mr.left - 40; }
    };
    // kategoriler = mesajın kendi kısımları (0, 1, 3); öğeler = o kısmın grupları
    const KAT = []; SYNOP.forEach((s, i) => { if (s.k) KAT.push({ ad: s.k, baslik: SYN_KISIM[s.k], idx: [] }); KAT[KAT.length - 1].idx.push(i); });
    const ks = katSecim(KAT.map((k) => ({ ad: k.ad, baslik: k.baslik, ogeler: k.idx.map((i) => ({ ad: SYNOP[i].g, baslik: SYNOP[i].ad })) })), (k, i) => goster(i < 0 ? -1 : KAT[k].idx[i]), { ogeCls: 'syn-g', ad: 'SYNOP kısımları' });
    const tum = dugme('dugme ikincil syn-tum', 'Hepsini sırayla oynat');
    let t = null; const dur = () => { clearInterval(t); t = null; tum.textContent = 'Hepsini sırayla oynat'; };
    tum.addEventListener('click', () => { if (t) { dur(); return; } ks.git(0, 0); tum.textContent = 'Durdur'; t = setInterval(() => { if (ks.sonda()) { dur(); return; } ks.ileri(); }, 2200); });
    kap.append(ks.serit, tablo, tum, ks.gez);
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
  const INDIS_P = [[850, 500], [850, 500], [850, 500], [1028, 200], [1028, 300]]; // indisin dayandığı tabaka (diyagramda yanar)
  function skewt(kap, gorsel) {
    gorsel = gorsel || kap;
    const W = 560, H = 600, L = Math.log(1050 / 200), sx = 7;
    const Y = (p) => H * (1 - Math.log(1050 / p) / L), X = (T, p) => (T + 40) * sx + (H - Y(p));
    const svg = el('svg', { viewBox: `-44 -26 ${W + 114} ${H + 66}`, class: 'skt-svg', role: 'img', 'aria-label': 'Kartal sondajı Skew-T diyagramı' });
    const sol = h('div', 'sahne-cer skt-sol'); const sag = h('div', 'skt-sag'); sol.appendChild(svg); gorsel.appendChild(sol); kap.appendChild(sag);
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
    tx(svg, -40, -12, 'hPa', { class: 'skt-et' }); tx(svg, W, H + 37, '°C', { 'text-anchor': 'end', class: 'skt-et' });
    // vurgu bandı
    const bant = el('rect', { x: 0, width: W, y: 0, height: 0, class: 'skt-bant' }, ic);
    line(SND.map((s) => [X(s[2], s[0]), Y(s[0])]), { class: 'skt-T' });
    line(SND.filter((s) => s[3] != null).map((s) => [X(s[3], s[0]), Y(s[0])]), { class: 'skt-Td' });
    // rüzgâr okları (sağ kenar)
    for (const s of SND.filter((q) => [1000, 925, 850, 700, 500, 400, 300, 250, 200].includes(q[0]))) window.Motor.ok(svg, W + 52, Y(s[0]), s[4], s[5] * 1.944, 'currentColor');
    tx(svg, W + 52, -12, 'rüzgâr', { 'text-anchor': 'middle', class: 'skt-et' });
    // imleç okuması
    const imlec = el('g', { class: 'skt-imlec', visibility: 'hidden' }, svg); const iy = el('line', { x1: 0, x2: W, class: 'skt-iy' }, imlec);
    const oku = h('p', 'skt-oku sahne-oku', 'İmleci (ya da parmağını) diyagramın üstünde gezdir: basınç, yükseklik, T, Td ve nem okunur.'); gorsel.appendChild(oku);
    const interp = (p) => { for (let i = 0; i < SND.length - 1; i++) { const a = SND[i], b = SND[i + 1]; if (p <= a[0] && p >= b[0]) { const t = Math.log(a[0] / p) / Math.log(a[0] / b[0]); const f = (k) => (a[k] == null || b[k] == null ? null : a[k] + (b[k] - a[k]) * t); return { z: f(1), T: f(2), Td: f(3) }; } } return null; };
    const hareket = (ev) => { const r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal, y = ((ev.clientY - r.top) / r.height) * vb.height + vb.y; if (y < 0 || y > H) return; const p = 1050 / Math.exp((1 - y / H) * L), v = interp(p); if (!v) return; imlec.setAttribute('visibility', 'visible'); iy.setAttribute('y1', y); iy.setAttribute('y2', y); const rh = v.Td == null ? null : (100 * es(v.Td)) / es(v.T); oku.innerHTML = `<b>${Math.round(p)} hPa</b> · ${Math.round(v.z)} m · T ${virgul(v.T)} °C` + (v.Td == null ? '' : ` · Td ${virgul(v.Td)} °C · T − Td ${virgul(v.T - v.Td)} · nem %${Math.round(rh)}`); };
    svg.addEventListener('pointermove', hareket); svg.addEventListener('pointerdown', hareket);
    // seçim: Tabakalar (inversiyonlar, kuru tabaka) · Seviyeler (standart seviyeler) · İndisler — her öğe diyagramda bir bandı yakar
    const bantKoy = (p0, p1) => { const y0 = Y(p0), y1 = Y(p1), tek = p0 === p1; bant.setAttribute('y', Math.min(y0, y1) - (tek ? 6 : 2)); bant.setAttribute('height', Math.abs(y1 - y0) + (tek ? 12 : 4)); };
    const KAT = [
      { ad: 'Tabakalar', baslik: 'İnversiyonlar ve kuru tabaka', ogeler: ODAK.slice(0, 3).map((o) => ({ ad: o.ad, o })) },
      { ad: 'Seviyeler', baslik: 'Standart basınç seviyeleri', ogeler: ODAK.slice(3).map((o) => ({ ad: o.ad, o })) },
      { ad: 'İndisler', baslik: 'Kararlılık ve nem indisleri', ogeler: INDIS.map(([a, v, m], i) => ({ ad: `${a.replace(/ \(.*\)/, '')} <b>${v}</b>`, baslik: a, o: { ad: a, v, m, p: INDIS_P[i] } })) },
    ];
    const aciklama = h('p', 'skt-aciklama', 'Önce kategoriyi, sonra tabakayı seç: diyagramda yanar, açıklaması burada çıkar.');
    const ks = katSecim(KAT, (k, i) => {
      if (i < 0) { bant.setAttribute('height', 0); return; }
      const o = KAT[k].ogeler[i].o; bantKoy(o.p[0], o.p[1]);
      aciklama.innerHTML = o.v ? `<b>${o.ad} = ${o.v}.</b> ${o.m}` : `<b>${o.ad}.</b> ${o.m}`;
    }, { ogeCls: 'cip', ad: 'Sondaj kategorileri' });
    ks.serit.querySelector('.oge').classList.add('skt-liste');
    sag.append(ks.serit, aciklama);
    sag.appendChild(h('p', 'skt-lejant', '<span class="c-T"></span> sıcaklık (T) <span class="c-Td"></span> çiy noktası (Td) <span class="c-k"></span> kuru adyabat <span class="c-n"></span> nemli adyabat <span class="c-m"></span> karışma oranı'));
    sag.appendChild(ks.gez);
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
  function meteogram(kap, gorsel) {
    gorsel = gorsel || kap;
    let tsi = false;
    const ust = h('div', 'mg-ust'); const sw = dugme('cip', 'Saatleri TSİ göster'); sw.setAttribute('aria-pressed', 'false'); ust.appendChild(sw);
    // telefonda grafik okunur ölçekte (yana kayar); «Tümü» bütün grafiği sığdırır
    const tumu = dugme('cip mg-tumu', 'Tümü'); tumu.setAttribute('aria-pressed', 'false'); ust.appendChild(tumu);
    const oku = h('p', 'mg-oku sahne-oku', 'İmleci grafikte gezdir (ya da dokun): o saatin bütün değerleri burada.'); kap.append(ust);
    const W = 720, x0 = 46, pw = W - x0 - 46, dx = pw / 71, X = (i) => x0 + i * dx;
    const pan = [['Bulut kapalılığı (%)', 70], ['Sıcaklık (°C) · basınç (hPa)', 120], ['Saatlik yağış (mm)', 70], ['Rüzgâr (km/sa) · yön', 80]];
    let y = 14; const yer = pan.map(([ad, hh]) => { const o = { ad, y: y + 16, h: hh }; y += hh + 34; return o; });
    const svg = el('svg', { viewBox: `0 0 ${W} ${y}`, class: 'mg-svg', role: 'img', 'aria-label': 'Kartal WRF meteogramı' }); const kay = h('div', 'sahne-cer mg-kaydir'); kay.appendChild(svg);
    gorsel.append(kay, oku); // sahne: grafik + okuma birlikte (telefonda yapışkan)
    const vurgu = el('rect', { x: X(24) - dx / 2, width: dx * 10, y: 0, height: y, class: 'mg-yagisbant' }, svg);
    const secBant = el('rect', { x: 0, width: 0, y: 0, height: 0, class: 'mg-secbant' }, svg); // seçili kartın penceresi
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
    yol(MG.T, Ty, 'mg-T'); const pYol = yol(MG.p, Py, 'mg-p');
    for (const v of [8, 12, 16]) tx(svg, x0 - 6, Ty(v) + 4, String(v), { 'text-anchor': 'end', class: 'mg-et mg-Tet' });
    for (const v of [1015, 1020, 1025, 1030]) tx(svg, x0 + pw + 6, Py(v) + 4, String(v), { class: 'mg-et mg-pet' });
    // yağış
    const r = yer[2]; MG.yagis.forEach((v, i) => { if (!v) return; el('rect', { x: X(i) - dx * 0.4, width: dx * 0.8, y: r.y + r.h * (1 - v / 2), height: (r.h * v) / 2, class: 'mg-yagis' }, svg); if (v >= 0.1) tx(svg, X(i), r.y + r.h * (1 - v / 2) - 3, virgul(v), { 'text-anchor': 'middle', class: 'mg-et' }); });
    // rüzgâr
    const w = yer[3], Wy = (v) => w.y + w.h * (1 - v / 55); const rYol = yol(MG.ruzgar, Wy, 'mg-r');
    for (const v of [10, 30, 50]) tx(svg, x0 - 6, Wy(v) + 4, String(v), { 'text-anchor': 'end', class: 'mg-et' });
    for (let i = 0; i < 72; i += 3) { const a = (MG.yon[i] + 180) * R, cx = X(i), cy = w.y + w.h - 9; el('line', { x1: cx - Math.sin(a) * 7, y1: cy + Math.cos(a) * 7, x2: cx + Math.sin(a) * 7, y2: cy - Math.cos(a) * 7, class: 'mg-yon', 'marker-end': 'url(#mg-uc)' }, svg); }
    const mk = el('marker', { id: 'mg-uc', viewBox: '0 0 6 6', refX: 5, refY: 3, markerWidth: 5, markerHeight: 5, orient: 'auto' }, el('defs', {}, svg)); el('path', { d: 'M0 0L6 3L0 6Z', class: 'mg-uc' }, mk);
    // imleç
    const im = el('line', { y1: 0, y2: y, class: 'mg-im', visibility: 'hidden' }, svg);
    const hareket = (ev) => { const rr = svg.getBoundingClientRect(), xx = ((ev.clientX - rr.left) / rr.width) * W, i = Math.round((xx - x0) / dx); if (i < 0 || i > 71) return; im.setAttribute('x1', X(i)); im.setAttribute('x2', X(i)); im.setAttribute('visibility', 'visible'); const s = i + (tsi ? 3 : 0); oku.innerHTML = `<b>${GUN[Math.floor(s / 24)]} ${String(s % 24).padStart(2, '0')}:00 ${tsi ? 'TSİ' : 'UTC'}</b> · bulut %${MG.bulut[i]} · ${virgul(MG.T[i])} °C · ${virgul(MG.p[i])} hPa · yağış ${virgul(MG.yagis[i])} mm · rüzgâr ${MG.ruzgar[i]} km/sa (${MG.yon[i]}°)`; };
    svg.addEventListener('pointermove', hareket); svg.addEventListener('pointerdown', hareket);
    sw.addEventListener('click', () => { tsi = !tsi; sw.setAttribute('aria-pressed', String(tsi)); sw.textContent = tsi ? 'Saatleri UTC göster' : 'Saatleri TSİ göster'; eksenCiz(); });
    // telefonda: seçili pencere yana kayan grafikte ortalansın
    const ortala = (i0, i1) => { if (kay.scrollWidth <= kay.clientWidth + 1) return; const o = ((X(i0) + X(i1)) / 2 / W) * kay.scrollWidth - kay.clientWidth / 2; kay.scrollTo({ left: Math.max(0, o), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); };
    tumu.addEventListener('click', () => { const a = kay.classList.toggle('tumu'); tumu.setAttribute('aria-pressed', String(a)); tumu.textContent = a ? 'Yakınlaştır' : 'Tümü'; });
    // kartlar = öğeler: her biri grafikte kendi penceresini yakar (yağış: Salı sabahı · basınç: bütün dönem · lodos: Çarşamba rüzgârı)
    const KART = [
      ['Yağış penceresi', 'Salı 00–10 UTC (03–13 TSİ), toplam ~5 mm, en çok 03 UTC’de 1,6 mm', [24, 33], null, null],
      ['Basınç', 'Pazartesi ~1031 → Salı ~1025 → Çarşamba ~1017 hPa: sürekli düşüş', [0, 71], yer[1], pYol],
      ['Lodos', 'Çarşamba güneybatılı rüzgâr 48 km/sa’ya kadar', [48, 71], yer[3], rYol],
    ];
    const kart = h('div', 'mg-kartlar'); let secili = -1;
    const kartSec = (j) => {
      secili = secili === j ? -1 : j;
      [...kart.children].forEach((d, k) => d.setAttribute('aria-pressed', String(k === secili)));
      vurgu.classList.toggle('vurgu', secili === 0); pYol.classList.toggle('vurgu', secili === 1); rYol.classList.toggle('vurgu', secili === 2);
      if (secili > 0) { const [, , [i0, i1], p] = KART[secili]; secBant.setAttribute('x', X(i0) - dx / 2); secBant.setAttribute('width', X(i1) - X(i0) + dx); secBant.setAttribute('y', p.y - 2); secBant.setAttribute('height', p.h + 4); } else secBant.setAttribute('width', 0);
      if (secili >= 0) ortala(...KART[secili][2]);
    };
    KART.forEach(([a, m], j) => { const d = h('div', 'mg-kart', `<b>${a}</b><span>${m}</span>`); d.tabIndex = 0; d.setAttribute('role', 'button'); d.setAttribute('aria-pressed', 'false'); d.addEventListener('click', () => kartSec(j)); d.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), kartSec(j))); kart.appendChild(d); });
    kap.appendChild(kart); void an;
  }

  // ───────────────────────────────────────── SAAT HESAPLAYICI
  function saat(kap, gorsel) {
    gorsel = gorsel || kap;
    const gunAd = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const ay = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const iki = (n) => String(n).padStart(2, '0');
    kap.innerHTML = `<div class="saat-giris"><label>Sunum günü <input type="date" value="2026-11-10" class="saat-tarih"></label><label>Sunum saati (TSİ) <input type="time" value="09:45" class="saat-saat"></label></div><div class="saat-cevir"><label>UTC ↔ TSİ çevir <input type="range" min="0" max="23" value="12" class="saat-kay"></label><p class="saat-cevir-t"></p></div><div class="saat-sonuc"></div>`; // girdiler üstte, sonuç altta
    // sahne: iki günlük zaman çizelgesi — üst satır sunumdan önceki gün, alt satır sunum günü; her satırda üstte UTC, altta TSİ ekseni.
    // Aynı dikey çizgi aynı anı gösterir: UTC ile TSİ arasındaki 3 saatlik kayma gözle görülür.
    const cer = h('div', 'sahne-cer saat-cer'); gorsel.appendChild(cer);
    const VW = 480, x0 = 44, x1 = 470, X = (s) => x0 + (s * (x1 - x0)) / 24, R = [0, 196];
    const svg = el('svg', { viewBox: `0 0 ${VW} 392`, class: 'saat-cizgi', role: 'img', 'aria-label': 'Zaman çizelgesi: analiz anı, indirme, sunum ve tahmin günü; UTC ve TSİ' }, cer);
    const sabit = el('g', {}, svg), dyn = el('g', {}, svg);
    R.forEach((yT) => {
      tx(sabit, 4, yT + 64, 'UTC', { class: 'saat-eks' }); tx(sabit, 4, yT + 155, 'TSİ', { class: 'saat-eks' });
      for (const ey of [yT + 60, yT + 150]) el('line', { x1: X(0), x2: X(24), y1: ey, y2: ey, class: 'saat-eksen' }, sabit);
      for (let s = 0; s <= 24; s++) {
        const b = s % 3 === 0;
        el('line', { x1: X(s), x2: X(s), y1: yT + 60 - (b ? 5 : 0), y2: yT + 60 + (b ? 5 : 3), class: 'saat-centik' }, sabit);
        el('line', { x1: X(s), x2: X(s), y1: yT + 150 - (b ? 5 : 3), y2: yT + 150 + (b ? 5 : 0), class: 'saat-centik' }, sabit);
        if (b) { tx(sabit, X(s), yT + 49, iki(s), { 'text-anchor': 'middle', class: 'saat-et' }); const t = (s + 3) % 24; tx(sabit, X(s), yT + 171, iki(t), { 'text-anchor': 'middle', class: t === 0 ? 'saat-et saat-yarim' : 'saat-et' }); }
      }
    });
    const ciz = (once, gun, s, hh, mm) => {
      while (dyn.firstChild) dyn.removeChild(dyn.firstChild);
      const [r0, r1] = R;
      tx(dyn, 4, r0 + 20, `${once} · sunumdan önceki gün`, { class: 'saat-gun' }); tx(dyn, 4, r1 + 20, `${gun} · sunum günü`, { class: 'saat-gun' });
      // önceki gün: indirme penceresi (akşam) + analiz anı
      el('rect', { x: X(15), y: r0 + 108, width: X(20) - X(15), height: 26, rx: 7, class: 'saat-indir' }, dyn); tx(dyn, (X(15) + X(20)) / 2, r0 + 126, 'İndirme', { 'text-anchor': 'middle', class: 'saat-bant-t' });
      el('line', { x1: X(12), x2: X(12), y1: r0 + 60, y2: r0 + 150, class: 'saat-analiz' }, dyn);
      tx(dyn, X(12) - 8, r0 + 86, 'Analiz anı', { 'text-anchor': 'end', class: 'saat-olay saat-olay-a' }); tx(dyn, X(12) - 8, r0 + 104, '12 UTC = 15 TSİ', { 'text-anchor': 'end', class: 'saat-olay2' });
      // sunum günü: tahmin bandı (model +12 … +36 sa = bütün UTC günü) + sunum anı
      let su = hh + mm / 60 - 3, sy = r1; if (su < 0) { su += 24; sy = r0; }
      el('line', { x1: X(su), x2: X(su), y1: sy + 60, y2: sy + 150, class: 'saat-sunum' }, dyn);
      el('rect', { x: X(0), y: r1 + 122, width: X(24) - X(0), height: 20, rx: 6, class: 'saat-tahmin' }, dyn); tx(dyn, X(0) + 8, r1 + 137, 'Tahmin günü: model +12 … +36 sa', { class: 'saat-bant-t' });
      const sag = X(su) < 270; tx(dyn, X(su) + (sag ? 8 : -8), sy + 86, `Sunum ${s} TSİ`, { 'text-anchor': sag ? 'start' : 'end', class: 'saat-olay saat-olay-s' });
      // çevirici imleci: aynı an iki eksende
      const u = +kap.querySelector('.saat-kay').value, xu = X(u);
      el('line', { x1: xu, x2: xu, y1: r1 + 56, y2: r1 + 154, class: 'saat-imlec' }, dyn);
      for (const ey of [r1 + 60, r1 + 150]) el('circle', { cx: xu, cy: ey, r: 5, class: 'saat-imlec-n' }, dyn);
      const et = `${iki(u)} UTC = ${iki((u + 3) % 24)} TSİ${u + 3 >= 24 ? ' (ertesi gün)' : ''}`, ew = et.length * 7.4 + 18, ex = Math.min(Math.max(xu, x0 + ew / 2), x1 - ew / 2);
      el('rect', { x: ex - ew / 2, y: r1 + 95, width: ew, height: 22, rx: 11, class: 'saat-hap' }, dyn); tx(dyn, ex, r1 + 110, et, { 'text-anchor': 'middle', class: 'saat-hap-t' });
    };
    let son = null;
    const yaz = () => {
      const t = kap.querySelector('.saat-tarih').value, s = kap.querySelector('.saat-saat').value || '09:45'; if (!t) return;
      const d = new Date(t + 'T00:00:00Z'), once = new Date(d.getTime() - 864e5);
      const f = (x) => `${x.getUTCDate()} ${ay[x.getUTCMonth()]} ${gunAd[x.getUTCDay()]}`;
      const [hh, mm] = s.split(':').map(Number); const utc = (hh - 3 + 24) % 24;
      son = [f(once), f(d), s, hh, mm]; ciz(...son);
      kap.querySelector('.saat-sonuc').innerHTML = `<div class="saat-satir"><span>Analiz anı</span><b>${f(once)} · 12 UTC</b><em>= 15:00 TSİ. Bütün analiz haritaları bu ana ait olmalı.</em></div><div class="saat-satir"><span>Tahmin</span><b>${f(d)} · bütün gün</b><em>Model haritalarında «+12 … +36» saatleri bu güne düşer.</em></div><div class="saat-satir"><span>Sunum anı</span><b>${s} TSİ = ${String(utc).padStart(2, '0')}:${String(mm).padStart(2, '0')} UTC</b><em>Meteogramda bu saati işaretle: «şu an yağış zayıflamış olmalı» gibi cümleler buradan çıkar.</em></div><div class="saat-satir"><span>İndirme</span><b>${f(once)} akşamı</b><em>12 UTC kartları birkaç saat gecikmeyle çıkar ve sitede yalnız son hâl durur: indirdiğin anda dosya adına saati yaz.</em></div>`;
    };
    const cevir = () => { const u = +kap.querySelector('.saat-kay').value; kap.querySelector('.saat-cevir-t').innerHTML = `<b>${String(u).padStart(2, '0')}:00 UTC</b> = <b>${String((u + 3) % 24).padStart(2, '0')}:00 TSİ</b>` + (u + 3 >= 24 ? ' (ertesi gün)' : ''); if (son) ciz(...son); };
    kap.querySelectorAll('input').forEach((i) => i.addEventListener('input', () => { yaz(); cevir(); }));
    yaz(); cevir();
  }

  window.Araclar = { synop, skewt, meteogram, saat, katSecim };
})();
