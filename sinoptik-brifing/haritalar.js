// Harita tanımları — örnek vaka: 9 Kasım 2026 12 UTC analizi (yer üstü bazı kartlar 00 UTC), 10 Kasım tahmini.
// Gerçek haritalara bakılarak SADELEŞTİRİLMİŞ çizimler; değerler brifingde okunan sayılarla tutarlı.
// alan: { base, glat:[enlem0, eğim], glon:[boylam0, eğim], blobs:[[boylam, enlem, genlik, sx°, sy°, dönüş°]] }
// bolgeler[i].kutu = [batı, güney, doğu, kuzey]; metinleri veri.js'te aynı sırada.
(function () {
  const AT = 12;
  // Ortak alanlar
  const MSLP12 = { base: 1016, blobs: [[-22, 54, -44, 8, 9], [18, 66, -26, 6, 5], [34, 44, 15, 7, 4.5], [10, 50.5, 7, 6, 4.5], [8, 40, -6.5, 3.2, 2.6], [-28, 36, 10, 8, 6], [46, 55, 8, 8, 6], [13, 45.3, -2.5, 2, 1.6]] };
  const Z500_12 = { base: 568, glat: [41, -1.05], blobs: [[-22, 55, -19, 6, 6], [19, 54, -7, 3.5, 3], [20, 45.5, -4, 2.4, 4, 15], [45.5, 43.5, -16, 3.5, 3], [-8, 44, 9, 6, 7], [32, 37, 3, 6, 4]] };

  window.HARITALAR = {
    // ───────────── YER SİSTEMLERİ
    'yer-eu': {
      cerceve: 'eu', damga: '09.11.2026 12 UTC · Yer analizi',
      cizgi: [{ k: 'izobar', alan: MSLP12, aralik: [960, 1045, 5], renk: '#1d1d1f', kal: 1.2, kalin: [1015, 20], adim: 8 }],
      cepheler: [
        { tur: 'kapanmis', n: [[-21, 55.6], [-17, 57.3], [-12.8, 55.4], [-11.6, 51.6], [-12, 48.2]] },
        { tur: 'sicak', n: [[-12, 48.2], [-7.5, 46.6], [-3, 45.6], [2, 44.8]] },
        { tur: 'soguk', n: [[-12, 48.2], [-13.6, 44.5], [-16.5, 40], [-20.5, 35.5], [-25, 31.5]] },
        { tur: 'sicak', n: [[8, 40], [12.5, 39.7], [16, 39.1], [19.5, 38.3]] },
        { tur: 'soguk', n: [[8, 40], [6.2, 38.2], [3.6, 36.4], [0.5, 35]] },
        { tur: 'duragan', n: [[-30, 61.5], [-20, 61.8], [-9, 60.6], [0, 59.2], [8, 59.8]] },
      ],
      merkez: [{ h: 'T', v: '975', n: [-22, 54], tip: 'A' }, { h: 'T', n: [18, 66], tip: 'A' }, { h: 'T', n: [8, 40], tip: 'A' }, { h: 'H', v: '1030', n: [34, 44], tip: 'Y' }, { h: 'H', n: [10, 50.5], tip: 'Y' }, { h: 'H', n: [-27, 36.5], tip: 'Y' }],
      istasyon: [{ n: [28.98, 41.01], okta: 3, yon: 200, kt: 2, T: '14', Td: '0', p: '268', e: '−20' }],
      sehir: ['Londra', 'Paris', 'Madrid', 'Roma', 'Berlin', 'Varşova', 'Moskova', 'Kiev', 'Atina', 'Ankara', 'Cezayir', 'İstanbul'],
      bolgeAd: [['Kuzey Atlantik', -18, 45], ['Akdeniz', 17, 34.6], ['Karadeniz', 31.5, 42.3]],
      bolgeler: [{ kutu: [-30, 44, -6, 62], pin: [-28, 60.5] }, { kutu: [1, 34.5, 21, 44.5], pin: [2.5, 43.6] }, { kutu: [25, 39.5, 42, 47.5], pin: [26.5, 46.8] }],
      lejant: [['izobar', 'çizgi', '#1d1d1f', 'İzobar: eş basınç çizgisi, 5 hPa’da bir'], ['cephe', 'soguk', '#1f5fd1', 'Soğuk cephe: üçgenler gidiş yönünde'], ['cephe', 'sicak', '#d62d20', 'Sıcak cephe: yarım daireler gidiş yönünde'], ['cephe', 'kapanmis', '#8a3fb8', 'Kapanmış cephe: üçgen + yarım daire'], ['merkez', 'harf', '#c0281b', 'T (Tief) alçak · H (Hoch) yüksek'], ['istasyon', 'ist', '#1d1d1f', 'İstanbul istasyon modeli']],
    },
    'yer-tr': {
      cerceve: 'tr', damga: '09.11.2026 00 UTC · Yer kartı',
      cizgi: [{ k: 'izobar', alan: { base: 1020, blobs: [[33, 39.5, 14, 7, 4.5], [33, 44, 6, 8, 3.5], [5, 37.5, -12, 4, 3], [45, 43, -7, 3, 2.5], [2, 46, -4, 6, 4]] }, aralik: [1000, 1040, 4], renk: '#1d1d1f', kal: 1.2, adim: 7 }],
      cepheler: [
        { tur: 'sicak', n: [[5, 37.5], [8.5, 37.9], [11.5, 37.6], [14, 37]] },
        { tur: 'soguk', n: [[5, 37.5], [3.4, 35.8], [1.4, 34.3], [-0.5, 33.4]] },
        { tur: 'kapanmis', n: [[45, 43], [43.7, 42.6], [42.4, 42.2]] },
        { tur: 'soguk', n: [[42.4, 42.2], [41, 40.8], [39.8, 39.2], [39, 37.6]] },
      ],
      merkez: [{ h: 'Y', v: '1035', n: [33, 39.3], tip: 'Y' }, { h: 'A', n: [5, 37.5], tip: 'A' }, { h: 'A', v: '1016', n: [45.3, 43.4], tip: 'A' }],
      istasyon: [{ n: [28.98, 41.01], okta: 0, yon: 80, kt: 1, T: '5', Td: '3', p: '305', e: '−06' }],
      sehir: ['İstanbul', 'Ankara', 'Cezayir', 'Roma', 'Atina', 'Tiflis', 'Konya', 'Trabzon', 'Sofya'],
      bolgeAd: [['Akdeniz', 18, 34.6], ['Karadeniz', 34, 43.2], ['Anadolu', 35, 38.2]],
      bolgeler: [{ kutu: [0, 32.6, 14.5, 41.5], pin: [1.3, 40.5] }, { kutu: [26, 36.6, 40, 42.6], pin: [27, 42] }, { kutu: [39.5, 38.5, 50, 46], pin: [40.3, 45.4] }],
      lejant: [['izobar', 'çizgi', '#1d1d1f', 'İzobar: 4 hPa’da bir (1000 tabanlı)'], ['cephe', 'sicak', '#d62d20', 'Sıcak cephe (kırmızı)'], ['cephe', 'soguk', '#1f5fd1', 'Soğuk cephe (mavi)'], ['cephe', 'kapanmis', '#8a3fb8', 'Kapanmış cephe (mor)'], ['merkez', 'harf', '#1f5fd1', 'Y yüksek · A alçak (Türkçe kartlar)'], ['istasyon', 'ist', '#1d1d1f', 'Kartal istasyonu, 00 UTC']],
    },
    'ec-mslp850': {
      cerceve: 'se', damga: 'Tahmin +24 sa · 10.11.2026 12 UTC',
      golge: [{ k: 'ruzgar', alan: { base: 5, blobs: [[17, 46.2, 19, 4.2, 2.2, 32], [26.5, 36.6, 8.5, 2.5, 1.3], [8, 47, 9, 3, 2]] }, renk: [[10, '#f7e46a'], [15, '#a6dc7a'], [20, '#4cb96b'], [25, '#2c9c9c']], opak: 0.85 }],
      cizgi: [{ k: 'izobar', alan: { base: 1022, blobs: [[1, 46, -15, 6, 6], [13, 44, -4, 3, 3], [37, 44.5, 3, 6, 4], [30, 52, 2, 6, 4]] }, aralik: [1000, 1030, 5], renk: '#1d1d1f', kal: 1.2 }],
      sehir: ['İstanbul', 'Roma', 'Belgrad', 'Budapeşte', 'Atina', 'Bükreş', 'Ankara', 'Viyana'],
      bolgeAd: [['Adriyatik', 15.2, 43.2], ['Karadeniz', 34, 43.4], ['Ege', 25, 38.6]],
      bolgeler: [{ kutu: [5, 41, 22.5, 51], pin: [6.5, 50] }, { kutu: [24, 36, 44, 46.5], pin: [25, 45.8] }],
      lejant: [['izobar', 'çizgi', '#1d1d1f', 'Deniz seviyesi basıncı, 5 hPa’da bir'], ['ruzgar', 'renk', '#f7e46a', '850 hPa rüzgârı 10–15 m/s'], ['ruzgar', 'renk', '#a6dc7a', '15–20 m/s'], ['ruzgar', 'renk', '#4cb96b', '20–25 m/s']],
    },
    // ───────────── ÜST SEVİYELER (00 UTC analiz kartları)
    'h850': {
      cerceve: 'se', damga: '09.11.2026 00 UTC · 850 hPa',
      cizgi: [
        { k: 'kontur', alan: { base: 157, glat: [41, -0.6], blobs: [[42, 55, -2, 6, 5], [33, 40, 1.4, 6, 4]] }, aralik: [141, 162, 3], renk: '#1d1d1f', kal: 1.3 },
        { k: 'izoterm', alan: { base: 3, glat: [41, -1.1], blobs: [[40, 47, -8, 3.5, 2.5], [18, 44, 2, 5, 4]] }, aralik: [-20, 10, 2.5], renk: '#d62d20', kal: 1, kesik: '6 4', bicim: (v) => (v > 0 ? '+' : '') + String(v).replace('.', ',') },
      ],
      istasyon: [{ ust: true, n: [28.98, 41.01], T: '3', dd: '28', z: '157', yon: 75, kt: 5 }],
      sehir: ['İstanbul', 'Moskova', 'Kiev', 'Bükreş', 'Atina', 'Ankara', 'Roma'],
      bolgeAd: [['Karadeniz', 34, 43.4], ['Rusya', 41, 54]],
      bolgeler: [{ kutu: [26, 39, 32, 43.3], pin: [26.6, 42.8] }, { kutu: [34, 44, 46, 53], pin: [35, 52.4] }],
      lejant: [['kontur', 'çizgi', '#1d1d1f', 'Kontur: eş yükseklik, dam (3 dam’da bir)'], ['izoterm', 'kesik', '#d62d20', 'İzoterm: eş sıcaklık, °C (2,5’te bir)'], ['istasyon', 'ist', '#1d1d1f', 'Sol üst T · sol alt T − Td (yeşil) · sağ üst yükseklik']],
    },
    'h700': {
      cerceve: 'se', damga: '09.11.2026 00 UTC · 700 hPa',
      cizgi: [
        { k: 'kontur', alan: { base: 311, glat: [41, -0.75], blobs: [[22, 41, 3.4, 4, 6], [43, 55, -8, 7, 5]] }, aralik: [285, 318, 3], renk: '#1d1d1f', kal: 1.3 },
        { k: 'izoterm', alan: { base: -6, glat: [41, -0.8], blobs: [[42, 52, -4, 6, 4]] }, aralik: [-25, 5, 2.5], renk: '#d62d20', kal: 1, kesik: '6 4', bicim: (v) => String(v).replace('.', ',') },
      ],
      istasyon: [{ ust: true, n: [28.98, 41.01], T: '−6', dd: '33', z: '311', yon: 350, kt: 13 }],
      yollar: [{ k: 'eksen', n: [[22.5, 49], [22, 44], [23, 38.5]], renk: '#1f5fd1', kal: 3, kesik: '10 6', egri: true }, { k: 'eksen', n: [[43, 56], [42, 52], [42.5, 48]], renk: '#c0281b', kal: 3, kesik: '10 6', egri: true }],
      sehir: ['İstanbul', 'Moskova', 'Kiev', 'Bükreş', 'Atina', 'Ankara', 'Belgrad'],
      bolgeAd: [['Balkanlar', 20, 42.3], ['Rusya', 39, 54.5]],
      bolgeler: [{ kutu: [26, 39, 32, 43.3], pin: [26.6, 42.8] }, { kutu: [16, 37.5, 46, 56], pin: [17, 55] }],
      lejant: [['kontur', 'çizgi', '#1d1d1f', 'Kontur, dam (3’te bir)'], ['izoterm', 'kesik', '#d62d20', 'İzoterm, °C'], ['eksen', 'kesik', '#1f5fd1', 'Sırt ekseni (mavi kesikli)'], ['eksen', 'kesik', '#c0281b', 'Trof ekseni (kırmızı kesikli)']],
    },
    'h500': {
      cerceve: 'eu', damga: '09.11.2026 00 UTC · 500 hPa',
      cizgi: [
        { k: 'kontur', alan: { base: 567, glat: [41, -1.0], blobs: [[-22, 55, -18, 6, 6], [13, 51, -5, 4, 8], [44.5, 43, -20, 3.5, 3], [-10, 45, 8, 6, 8]] }, aralik: [534, 582, 6], renk: '#1d1d1f', kal: 1.4 },
        { k: 'izoterm', alan: { base: -22, glat: [41, -0.42], blobs: [[44.5, 43, -10, 3, 3], [13, 52, -2, 5, 5]] }, aralik: [-40, -10, 4], renk: '#d62d20', kal: 1, kesik: '6 4', bicim: (v) => String(v) },
      ],
      oklar: [{ n: [9, 46.5], yon: 315, kt: 70 }, { n: [12.5, 43.2], yon: 320, kt: 60 }, { n: [5, 49], yon: 320, kt: 65 }],
      istasyon: [{ ust: true, n: [28.98, 41.01], T: '−22', dd: '11', z: '567', yon: 315, kt: 32 }],
      yollar: [{ k: 'eksen', n: [[14, 57], [13, 51], [14, 46]], renk: '#c0281b', kal: 3, kesik: '10 6', egri: true }],
      sehir: ['İstanbul', 'Londra', 'Paris', 'Berlin', 'Varşova', 'Moskova', 'Roma', 'Tiflis', 'Ankara'],
      bolgeAd: [['Kuzey Denizi', 3.5, 56.5], ['Kafkasya', 44.5, 40.2]],
      bolgeler: [{ kutu: [38, 38.5, 50, 47.5], pin: [39, 47] }, { kutu: [2, 43.5, 25, 58], pin: [3.5, 57.2] }, { kutu: [25, 38.5, 33, 43.5], pin: [25.8, 43] }],
      lejant: [['kontur', 'çizgi', '#1d1d1f', 'Kontur, dam (6’da bir)'], ['izoterm', 'kesik', '#d62d20', 'İzoterm, °C'], ['eksen', 'kesik', '#c0281b', 'Yeni trofun ekseni'], ['ok', 'ok', '#1d1d1f', 'Rüzgâr oku: tam tüy 10 kt, bayrak 50 kt']],
    },
    'h300': {
      cerceve: 'eu', damga: '09.11.2026 00 UTC · 300 hPa',
      golge: [{ k: 'izotak', alan: { base: 30, blobs: [[5, 48.2, 92, 9, 2.1, -44], [10, 45.6, 18, 2.5, 1.4], [38, 31.4, 82, 9, 1.8, 14], [-24, 50, 40, 6, 2, 30]] }, renk: [[60, '#fde9a6'], [80, '#f8b056'], [100, '#ef6b3a'], [110, '#b2182b']], opak: 0.9 }],
      cizgi: [{ k: 'kontur', alan: { base: 925, glat: [41, -1.6], blobs: [[-22, 55, -26, 6, 6], [13, 51, -8, 4, 8], [44.5, 43, -26, 3.5, 3], [-10, 45, 12, 6, 8]] }, aralik: [864, 960, 12], renk: '#1d1d1f', kal: 1.2 }],
      istasyon: [{ ust: true, n: [28.98, 41.01], T: '−48', dd: '12', z: '925', yon: 310, kt: 48 }],
      yollar: [{ k: 'jet', n: [[-6, 54], [0, 50.5], [6, 47.6], [11, 45], [14, 42.5]], renk: '#7a0019', kal: 2.4, egri: true }],
      sehir: ['İstanbul', 'Londra', 'Paris', 'Roma', 'Bağdat', 'Kahire', 'Berlin', 'Ankara'],
      bolgeAd: [['Alpler', 10, 47.6]],
      bolgeler: [{ kutu: [-9, 41, 18, 56], pin: [-7.5, 55.3] }, { kutu: [28, 30, 50, 36.5], pin: [29, 35.9] }, { kutu: [25, 38.5, 33, 43.5], pin: [25.8, 43] }],
      lejant: [['izotak', 'renk', '#fde9a6', 'İzotak 60–80 kt'], ['izotak', 'renk', '#f8b056', '80–100 kt'], ['izotak', 'renk', '#ef6b3a', '100–110 kt'], ['izotak', 'renk', '#b2182b', '110 kt üstü: jet çekirdeği'], ['jet', 'çizgi', '#7a0019', 'Jet ekseni'], ['kontur', 'çizgi', '#1d1d1f', 'Kontur, dam']],
    },
    // ───────────── MODEL DİNAMİĞİ (GFS, 12 UTC)
    'gfs-500': {
      cerceve: 'eu', damga: 'GFS · 09.11.2026 12 UTC · Analiz',
      golge: [{ k: 'kalinlik', alan: { base: 552, glat: [41, -0.95], blobs: [[-22, 55, -10, 7, 6], [19, 54, -4, 4, 3], [45.5, 43.5, -7, 3.5, 3], [-10, 40, 6, 7, 6], [32, 35, 4, 8, 4]] }, renk: [[0, '#2b5cb8'], [528, '#4f8fd6'], [536, '#86c0e8'], [544, '#bfe3c4'], [552, '#f3eaa0'], [560, '#f7c46b'], [568, '#ef8e48']], opak: 0.55 }],
      cizgi: [
        { k: 'izobar', alan: { base: 1016, blobs: [[-22, 54, -38, 8, 9], [18, 66, -24, 6, 5], [34, 44, 15, 7, 4.5], [10, 50.5, 7, 6, 4.5], [13, 45.2, -5, 2.4, 2], [-28, 36, 10, 8, 6], [46, 55, 8, 8, 6]] }, aralik: [970, 1040, 5], renk: '#ffffff', kal: 1.1, etiket: false },
        { k: 'kontur', alan: Z500_12, aralik: [532, 588, 4], renk: '#1d1d1f', kal: 1.5, kalin: [552, 16] },
      ],
      merkez: [{ h: 'T', v: '536', n: [-22, 55], tip: 'A' }, { h: 'T', v: '552', n: [19, 54], tip: 'A' }, { h: 'H', n: [34, 44], tip: 'Y', k: 'merkez' }],
      sehir: ['İstanbul', 'Londra', 'Paris', 'Berlin', 'Varşova', 'Roma', 'Ankara', 'Moskova'],
      bolgeler: [{ kutu: [-30, 46, -9, 63], pin: [-28.5, 61.8] }, { kutu: [8, 39.5, 33, 58], pin: [9.3, 57.2] }],
      lejant: [['kontur', 'çizgi', '#1d1d1f', '500 hPa jeopotansiyel, gpdam (4’te bir)'], ['izobar', 'çizgi', '#ffffff', 'Yer basıncı (beyaz), 5 hPa'], ['kalinlik', 'renk', '#4f8fd6', 'Kalınlık düşük: soğuk sütun'], ['kalinlik', 'renk', '#f7c46b', 'Kalınlık yüksek: sıcak sütun']],
    },
    'gfs-vort': {
      cerceve: 'eu', damga: 'GFS · 09.11.2026 12 UTC · 500 hPa vortisite adveksiyonu',
      golge: [{ k: 'adv', alan: { base: 0, blobs: [[25.5, 41.6, 4.6, 2.6, 1.5], [6, 39.2, 7.5, 2.6, 2], [-9, 52, 5, 3, 3.5], [16.5, 47, -4, 3, 2], [33, 44, -2.5, 3, 2], [-30, 48, -4, 3, 3], [2, 44, -3, 2, 2]] }, renk: [[-99, '#3b6fc4'], [-3, '#8fd19e'], [-1, null], [1, '#fde68a'], [3, '#f59e0b'], [5, '#c2410c']], opak: 0.8 }],
      cizgi: [{ k: 'kontur', alan: Z500_12, aralik: [532, 588, 4], renk: '#1d1d1f', kal: 1.4, kalin: [552, 16] }],
      yollar: [{ k: 'eksen', n: [[20, 52], [20.3, 47], [21.5, 43]], renk: '#c0281b', kal: 3, kesik: '10 6', egri: true }],
      sehir: ['İstanbul', 'Atina', 'Sofya', 'Roma', 'Cezayir', 'Paris', 'Ankara'],
      bolgeAd: [['Balkanlar', 21, 41.7]],
      bolgeler: [{ kutu: [19, 38, 32, 46.5], pin: [20, 45.8] }, { kutu: [-2, 35, 14, 43.5], pin: [-0.6, 42.8] }],
      lejant: [['adv', 'renk', '#f59e0b', 'Pozitif vortisite adveksiyonu (PVA): yükselme'], ['adv', 'renk', '#8fd19e', 'Negatif adveksiyon (NVA): çökme'], ['kontur', 'çizgi', '#1d1d1f', '500 hPa kontur'], ['eksen', 'kesik', '#c0281b', 'Kısa dalga trof ekseni']],
    },
    'gfs-jet': {
      cerceve: 'se', damga: 'GFS · 09.11.2026 12 UTC · 300 hPa',
      golge: [{ k: 'izotak', alan: { base: 28, blobs: [[15, 47.2, 62, 4.6, 1.5, 4], [21.4, 42.5, 58, 1.6, 3.6, 0], [37, 34, 50, 6, 1.6, 10]] }, renk: [[60, '#fde9a6'], [80, '#f8b056'], [100, '#ef6b3a'], [110, '#b2182b']], opak: 0.85 }],
      cizgi: [{ k: 'div', alan: { base: 0, blobs: [[26.2, 41.2, 3.2, 1.8, 1.3], [17, 44, -2.4, 2, 2], [13, 49, 1.6, 2, 1.5]] }, seviyeler: [-2, -1, 1, 2, 3], renk: '#5b21b6', kal: 1.2, etiket: false, enaz: 20 }],
      simge: [{ t: '+', n: [26.2, 41.15], renk: '#5b21b6', k: 'div' }, { t: '−', n: [17, 44], renk: '#5b21b6', k: 'div' }, { t: 'T', n: [19.2, 47.6], renk: '#c0281b', k: 'merkez' }],
      oklar: [{ n: [14, 47.5], yon: 285, kt: 95 }, { n: [21.5, 43.5], yon: 340, kt: 90 }],
      istasyon: [{ ust: true, n: [28.98, 41.01], T: '−48', dd: '12', z: '925', yon: 310, kt: 48 }],
      sehir: ['İstanbul', 'Budapeşte', 'Belgrad', 'Atina', 'Viyana', 'Bükreş', 'Ankara'],
      bolgeler: [{ kutu: [8, 38, 24, 50.5], pin: [9, 49.8] }, { kutu: [24.5, 38.6, 32.5, 43.6], pin: [25.3, 43] }],
      lejant: [['izotak', 'renk', '#f8b056', 'Rüzgâr hızı 80–100 kt'], ['izotak', 'renk', '#fde9a6', '60–80 kt'], ['div', 'çizgi', '#5b21b6', 'Diverjans (+) / konverjans (−)'], ['merkez', 'harf', '#c0281b', 'T: 300 hPa trofu']],
    },
    'gfs-nem': {
      cerceve: 'se', damga: 'GFS · 09.11.2026 12 UTC · 700 hPa bağıl nem',
      golge: [{ k: 'nem', alan: { base: 48, blobs: [[21, 43, 48, 7.5, 2.2, -67], [34, 43.5, -38, 5, 3], [11, 40, 25, 2.5, 4], [40, 50, -12, 6, 4]] }, renk: [[-99, '#e7d3b0'], [15, '#f1e4cc'], [30, null], [70, '#a7d9a1'], [90, '#3f9b52']], opak: 0.85 }],
      cizgi: [{ k: 'kuru', alan: { base: 48, blobs: [[21, 43, 48, 7.5, 2.2, -67], [34, 43.5, -38, 5, 3], [11, 40, 25, 2.5, 4], [40, 50, -12, 6, 4]] }, aralik: [30, 30, 10], renk: '#1f5fd1', kal: 1.3, kesik: '7 5', bicim: () => '%30' }],
      simge: [{ t: 'F', n: [21.2, 43], renk: '#14532d', k: 'nem' }, { t: 'T', n: [34, 43.5], renk: '#7c4a03', k: 'nem' }],
      sehir: ['İstanbul', 'Budapeşte', 'Belgrad', 'Atina', 'Selanik', 'Ankara', 'Samsun'],
      bolgeler: [{ kutu: [16.5, 36, 27.5, 48], pin: [17.4, 47.3] }, { kutu: [27.5, 40, 42, 46.2], pin: [28.3, 45.7] }],
      lejant: [['nem', 'renk', '#3f9b52', 'Nem %90 üstü (F: %95 üstü)'], ['nem', 'renk', '#a7d9a1', 'Nem %70–90'], ['nem', 'renk', '#e7d3b0', 'Nem %15 altı (T)'], ['kuru', 'kesik', '#1f5fd1', '%30 çizgisi']],
    },
    // ───────────── GÖZLEMLER
    'uydu': {
      cerceve: 'bal', zemin: '#2a2a2a', kara: '#e9d36b', sinir: '#8f8a6a', damga: '09.11.2026 15:00 TSİ · IR',
      golge: [{ k: 'bulut', alan: { base: 6, glat: [40, -0.35], blobs: [[25.6, 41.1, -72, 1.1, 0.75], [24.6, 40.4, -55, 1.4, 0.9, 30], [26.8, 41.9, -45, 1, 0.6], [20.6, 39.1, -66, 0.9, 1.0], [19.8, 40.2, -45, 1.2, 1.3], [29.4, 41.5, -30, 2.6, 0.55, 8], [31.5, 42.4, -22, 2.4, 0.4, 12], [41, 41.9, -42, 2.2, 0.9, 5], [43.5, 42.7, -36, 1.3, 1.0], [14.5, 37.5, -48, 1.4, 3, 25], [16.5, 40.5, -30, 1.5, 2], [36, 45.8, -18, 4, 0.8, 10], [33, 37.5, -12, 3, 1]] }, renk: [[-999, '#8b0000'], [-72, '#d7191c'], [-65, '#ff8c00'], [-60, '#ffe14d'], [-55, '#4caf50'], [-50, '#e9e9e9'], [-40, '#c8c8c8'], [-30, '#a5a5a5'], [-20, '#808080'], [-10, '#5f5f5f'], [0, '#454545']], opak: 1 }],
      sehir: ['İstanbul', 'Edirne', 'Atina', 'Ankara', 'Trabzon', 'Roma'],
      bolgeler: [{ kutu: [0.3, 47.6, 13, 50], pin: [12.6, 48.3] }, { kutu: [18.5, 37.4, 28.3, 43.6], pin: [19.4, 43] }, { kutu: [28.3, 39.8, 43, 46], pin: [29.2, 45.4] }],
      lejant: [['bulut', 'renk', '#e9e9e9', 'Açık gri–beyaz: soğuk, yüksek bulut tepesi'], ['bulut', 'renk', '#4caf50', 'Yeşil −55 °C'], ['bulut', 'renk', '#ffe14d', 'Sarı −60 °C'], ['bulut', 'renk', '#d7191c', 'Kırmızı −65 °C altı: derin konveksiyon'], ['bulut', 'renk', '#454545', 'Koyu: sıcak yüzey, açık gök']],
    },
    'radar': {
      cerceve: 'tk', damga: '09.11.2026 12:00 UTC · Radar (birleşik PPI)',
      golge: [{ k: 'eko', alan: { base: -10, blobs: [[26.2, 40.7, 38, 0.55, 0.6], [25.9, 40.25, 32, 0.45, 0.32], [27.3, 42.4, 26, 0.75, 0.42], [40, 41.25, 36, 1.6, 0.34, 8], [41.8, 41.45, 30, 0.5, 0.3]] }, renk: [[5, '#a6d4ff'], [15, '#4f9df0'], [23, '#2fbf4a'], [34, '#f2d518'], [42, '#f08c1a']], opak: 1 }],
      sehir: ['İstanbul', 'Edirne', 'Kırklareli', 'Çanakkale', 'Trabzon', 'Rize', 'Giresun', 'Artvin', 'Ankara'],
      bolgeAd: [['Saros', 26.2, 40.15]],
      bolgeler: [{ kutu: [24.5, 39.6, 29, 43], pin: [25, 42.6] }, { kutu: [37.5, 40.4, 43, 42.4], pin: [38, 42.1] }],
      lejant: [['eko', 'renk', '#a6d4ff', '5–15 dBZ: çok zayıf'], ['eko', 'renk', '#4f9df0', '15–23 dBZ: zayıf'], ['eko', 'renk', '#2fbf4a', '23–34 dBZ: orta'], ['eko', 'renk', '#f2d518', '34–42 dBZ: kuvvetli']],
    },
    'ppi': {
      cerceve: 'mar', damga: '09.11.2026 12:12 UTC · İstanbul radarı PPI 0,3°',
      halka: { merkez: [28.4, 41.15], km: [50, 100, 150, 200, 250] },
      golge: [{ k: 'eko', alan: { base: -10, blobs: [[26.2, 40.7, 38, 0.55, 0.6], [25.9, 40.25, 32, 0.45, 0.32], [25.1, 40.6, 32, 0.5, 0.35], [27.3, 42.4, 30, 0.75, 0.42], [26.9, 42.9, 24, 0.5, 0.3]] }, renk: [[5, '#a6d4ff'], [15, '#4f9df0'], [23, '#2fbf4a'], [34, '#f2d518'], [42, '#f08c1a']], opak: 1 }],
      yollar: [{ k: 'parazit', n: [[28.4, 41.15], [23.5, 41.22]], renk: '#4f9df0', kal: 2.2, op: 0.9 }],
      sehir: ['İstanbul', 'Edirne', 'Kırklareli', 'Tekirdağ', 'Çanakkale', 'Gökçeada', 'Bursa', 'Kocaeli'],
      bolgeAd: [['Marmara', 28.2, 40.65], ['Saros Körfezi', 26.4, 40.42], ['Karadeniz', 30.5, 42.4]],
      bolgeler: [{ kutu: [24, 39.6, 27.3, 41.15], pin: [24.4, 39.95] }, { kutu: [26.3, 41.8, 28.7, 43.3], pin: [26.7, 43] }, { kutu: [28, 40.4, 30.3, 41.6], pin: [30, 41.4] }],
      lejant: [['halka', 'kesik', '#9aa0a6', 'Menzil halkaları, 50 km’de bir'], ['eko', 'renk', '#2fbf4a', '23–34 dBZ: orta şiddet'], ['eko', 'renk', '#4f9df0', '15–23 dBZ: zayıf'], ['parazit', 'çizgi', '#4f9df0', 'Düz çizgi: parazit, yağış değil']],
    },
    'yagis': {
      cerceve: 'tk', damga: 'Tahmin · 10.11.2026 (00–24 TSİ) toplam yağış',
      golge: [{ k: 'mm', alan: { base: 0, blobs: [[29.3, 40.7, 15, 1.6, 0.75], [27.6, 41.55, 9, 0.6, 0.45], [33.8, 38.9, 13, 2.3, 1.2, 15], [29.3, 37.5, 12, 1.8, 0.9], [26.5, 41.65, -12, 0.55, 0.5], [26.4, 40.1, -12, 0.65, 0.55]] }, renk: [[1, '#c7e9c0'], [6, '#74c476'], [20, '#238b45']], opak: 0.9 }],
      sehir: ['İstanbul', 'Edirne', 'Çanakkale', 'Kırklareli', 'Tekirdağ', 'Bursa', 'Ankara', 'Konya', 'Kayseri', 'Antalya', 'Aydın', 'Muğla', 'Trabzon', 'Isparta'],
      bolgeler: [{ kutu: [25.5, 39.4, 31.3, 42.3], pin: [26, 42] }, { kutu: [27, 36.2, 37.5, 40.3], pin: [36.8, 40] }],
      lejant: [['mm', 'renk', '#c7e9c0', '1–6 mm'], ['mm', 'renk', '#74c476', '6–20 mm'], ['mm', 'renk', '#238b45', '20 mm üstü']],
    },
  };
  void AT;
})();
