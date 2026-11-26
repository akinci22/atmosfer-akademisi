/* Ders Kitaplığı · SYNOP çözücü (MTO 302E): window.DK_EKLENTI.synop = {ac(kap, {veri, kitap, git})}; veri = eklenti/synop-mto302e.json (WMO-No. 306). */
(function () {
  'use strict';
  const CSS = `.syn{display:grid;gap:12px;min-width:0}.syn *{box-sizing:border-box}.syn textarea{width:100%;font:15px/1.5 ui-monospace,monospace;padding:10px;border:1px solid var(--cizgi);border-radius:10px;background:var(--zemin);color:var(--yazi);resize:vertical}.syn-dug{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.syn select,.syn input{min-height:44px;border:1px solid var(--cizgi);border-radius:8px;background:var(--zemin);color:var(--yazi);padding:0 10px;font-size:15px;max-width:100%}.syn input{width:7.5em}.syn-serit{display:flex;flex-wrap:wrap;gap:6px}.syn-cip{font:600 15px/1 ui-monospace,monospace;border:1px solid var(--cizgi);border-left:4px solid var(--c);background:var(--yuzey);color:var(--yazi);border-radius:8px;padding:0 10px;min-height:44px;min-width:44px;cursor:pointer}.syn-cip[aria-pressed=true]{background:var(--acc-zemin)}.syn-liste{list-style:none;margin:0;padding:0;display:grid;gap:8px}.syn-g{border:1px solid var(--cizgi);border-left:4px solid var(--c);border-radius:10px;background:var(--zemin);min-width:0}.syn-g>summary{cursor:pointer;padding:10px 12px;min-height:44px;display:flex;gap:4px 10px;align-items:baseline;flex-wrap:wrap}.syn-kod{font:700 16px ui-monospace,monospace;color:var(--c)}.syn-ad{font-size:14px;color:var(--ikincil)}.syn-tk{overflow-x:auto;padding:0 12px}.syn-tab{width:100%;border-collapse:collapse;font-size:15px}.syn-tab td{border-top:1px solid var(--cizgi);padding:6px 8px;vertical-align:top}.syn-tab td:not(:last-child){font-family:ui-monospace,monospace;white-space:nowrap;color:var(--ikincil)}.syn-en{margin:8px 12px 12px;padding:8px 10px;border-radius:8px;background:var(--acc-zemin);font-size:15px;overflow-wrap:anywhere}.syn-uyari{color:var(--tur);font-size:15px;margin:0}.syn-model{width:100%;max-width:340px;height:auto;display:block;margin:0 auto;color:var(--yazi)}.syn-model text{font:600 9px ui-monospace,monospace;fill:currentColor}.syn-kutu{border:1px solid var(--cizgi);border-radius:10px;background:var(--yuzey)}.syn-kutu>summary{min-height:44px;display:flex;align-items:center;padding:0 12px;cursor:pointer;font-weight:600}.syn-ic{padding:4px 12px 12px;display:grid;gap:10px;min-width:0}.syn-soru{font:700 24px ui-monospace,monospace;letter-spacing:2px;overflow-wrap:anywhere}.syn-ok{color:var(--yesil)}.syn-yok{color:var(--yanlis)}.syn-not{font-size:14px;color:var(--ikincil);margin:0}.syn-cikti{font:700 20px ui-monospace,monospace;color:var(--acc);overflow-wrap:anywhere}`;
  const RENK = { 0: 'var(--es0)', 1: 'var(--es2)', 3: 'var(--es1)', 5: 'var(--es4)', x: 'var(--yanlis)', b: 'var(--es3)' };
  const kac = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const tr = (x, b = 1) => (x < 0 ? '−' : '') + Math.abs(x).toFixed(b).replace('.', ',');
  const trI = (x, b = 1) => (x > 0 ? '+' : '') + tr(x, b);
  const en = (x, b = 1) => (x < 0 ? '−' : x > 0 ? '+' : '') + Math.abs(x).toFixed(b);
  const sayi = (s) => (/^\d+$/.test(s) ? Number(s) : NaN);
  const bas = (s) => s.charAt(0).toLocaleUpperCase('tr-TR') + s.slice(1);
  const pad = (n, k) => String(Math.round(n)).padStart(k, '0');

  /* ---------- değer kuralları (WMO-No. 306) ---------- */
  function sicak(sn, ttt) { const n = sayi(ttt); if (!(sn === '0' || sn === '1') || isNaN(n)) return null; return (sn === '1' ? -1 : 1) * n / 10; }
  function basinc(pppp) { const n = sayi(pppp); if (isNaN(n)) return null; const v = n / 10; return v < 500 ? v + 1000 : v; }
  function gorus(vv) {
    const n = sayi(vv); if (isNaN(n)) return null;
    if (n === 0) return { tr: '0,1 km\'den az', en: 'less than 0.1 km', km: 0.05 };
    if (n <= 50) return { tr: tr(n / 10) + ' km', en: (n / 10).toFixed(1) + ' km', km: n / 10 };
    if (n <= 55) return { tr: 'kullanılmayan kod', en: 'code not used', km: null };
    if (n <= 80) return { tr: (n - 50) + ' km', en: (n - 50) + ' km', km: n - 50 };
    if (n <= 88) return { tr: ((n - 80) * 5 + 30) + ' km', en: ((n - 80) * 5 + 30) + ' km', km: (n - 80) * 5 + 30 };
    if (n === 89) return { tr: '70 km\'den fazla', en: 'more than 70 km', km: 75 };
    return { tr: 'kaba ölçek 90–99 (tabloya bak)', en: 'coarse scale 90–99: see the table', km: null };
  }
  function taban(hs) {
    const n = sayi(hs); if (isNaN(n)) return null;
    if (n === 0) return { tr: '30 m\'den az', en: 'less than 30 m', m: 15 };
    if (n <= 50) return { tr: n * 30 + ' m', en: n * 30 + ' m', m: n * 30, is: `${n} × 30 m` };
    if (n <= 55) return { tr: 'kullanılmayan kod', en: 'code not used', m: null };
    if (n <= 80) return { tr: (n - 50) * 300 + ' m', en: (n - 50) * 300 + ' m', m: (n - 50) * 300, is: `(${n} − 50) × 300 m` };
    if (n <= 88) return { tr: ((n - 80) * 1500 + 9000) + ' m', en: ((n - 80) * 1500 + 9000) + ' m', m: (n - 80) * 1500 + 9000 };
    return { tr: n === 89 ? '21 000 m\'den yüksek' : 'kaba ölçek 90–99 (tabloya bak)', en: n === 89 ? 'higher than 21 000 m' : 'see the table', m: null };
  }
  function yagis(rrr) {
    const n = sayi(rrr); if (isNaN(n)) return { tr: 'bilinmiyor', en: 'not known' };
    if (n === 0) return { tr: 'yağış yok', en: 'no precipitation', mm: 0 };
    if (n <= 988) return { tr: n + ' mm', en: n + ' mm', mm: n };
    if (n === 989) return { tr: '989 mm ya da daha fazla', en: '989 mm or more', mm: 989 };
    if (n === 990) return { tr: 'iz (ölçülemeyecek kadar az)', en: 'trace', mm: 0 };
    return { tr: tr((n - 990) / 10) + ' mm', en: ((n - 990) / 10).toFixed(1) + ' mm', mm: (n - 990) / 10 };
  }
  function yon(dd) {
    const n = sayi(dd); if (isNaN(n)) return null;
    if (n === 0) return { tr: 'sakin', en: 'calm', d: null };
    if (n === 99) return { tr: 'değişken', en: 'variable', d: null };
    if (n > 36) return { tr: 'geçersiz', en: 'invalid', d: null };
    return { tr: n * 10 + '°\'den', en: 'from ' + n * 10 + '°', d: n * 10 };
  }
  function sure(tt) {
    const n = sayi(tt); if (isNaN(n)) return null;
    if (n <= 60) return { tr: n * 6 + ' dk' + (n >= 10 ? ` (${n % 10 ? tr(n / 10) : n / 10} saat)` : ''), en: n % 10 === 0 ? (n / 10) + ' hour' + (n === 10 ? '' : 's') : n * 6 + ' min' };
    if (n <= 66) return { tr: `${n - 55}–${n - 54} saat`, en: `${n - 55} to ${n - 54} hours` };
    return n === 67 ? { tr: '12–18 saat', en: '12 to 18 hours' } : { tr: 'tabloya bak', en: 'see the table' };
  }
  function tablo(V, ad, kod) { const t = V.tablo[ad]; const x = t && t.k[kod]; return x ? { tr: x[0], en: x[1] } : { tr: 'tabloda yok', en: 'not in the table' }; }
  function ww(V, kod) {
    const t = V.tablo.ww, n = sayi(kod); if (isNaN(n)) return { tr: 'bilinmiyor', en: 'not known' };
    if (t.k[kod]) return { tr: t.k[kod][0], en: t.k[kod][1] };
    const d = t.dilim.find((x) => n >= x[0] && n <= x[1]);
    return d ? { tr: d[2] + ' (ayrıntı tabloda)', en: d[3] } : { tr: 'tabloda yok', en: 'not in the table' };
  }

  /* ---------- grup çözümü: {g, k, ad, p:[[harf, kod, anlam]], tr, en, rol} ---------- */
  const G = (g, k, ad, p, trz, enz, rol) => ({ g, k, ad, p, tr: trz, en: enz, rol });
  function coz(metin, V) {
    const t = String(metin || '').toUpperCase().replace(/=/g, ' ').split(/\s+/).filter(Boolean);
    const o = [], u = [], st = { iw: null, iR: null, ix: null, var7: false, var6: false };
    let i = 0, k = 0;
    if (t[i] === 'AAXX' || t[i] === 'BBXX') { const k0 = t[i] === 'AAXX'; o.push(G(t[i], 0, 'ileti tipi', [[t[i], t[i], k0 ? 'Kara istasyonu iletisi' : 'Gemi iletisi']], k0 ? 'Kara istasyonu iletisi' : 'Gemi iletisi', k0 ? 'Report type: SYNOP from a land station.' : 'Report type: SHIP.')); i++; } else u.push('İleti AAXX ile başlamıyor.');
    if (/^\d{4}[0-9/]$/.test(t[i] || '')) {
      const g = t[i], iw = g[4], w = tablo(V, 'iw', iw); st.iw = iw;
      o.push(G(g, 0, 'YYGGiw · gün, saat, rüzgâr birimi', [['YY', g.slice(0, 2), 'ayın ' + Number(g.slice(0, 2)) + '. günü'], ['GG', g.slice(2, 4), g.slice(2, 4) + ' UTC'], ['iw', iw, w.tr]], `Ayın ${Number(g.slice(0, 2))}. günü, ${g.slice(2, 4)} UTC; rüzgâr ${w.tr}`, `Day ${Number(g.slice(0, 2))} of the month, ${g.slice(2, 4)} UTC; wind speed ${w.en}.`)); i++;
    }
    if (/^\d{5}$/.test(t[i] || '')) {
      const g = t[i], s = (V.istasyon || {})[g], blok = g.slice(0, 2) === '17';
      o.push(G(g, 0, 'IIiii · istasyon', [['II', g.slice(0, 2), blok ? 'blok 17: Türkiye' : 'ülke blok numarası'], ['iii', g.slice(2), s ? s[0] : 'istasyon numarası']], `İstasyon ${g}${s ? ': ' + s[0] : ''}`, `Station ${g}: block ${g.slice(0, 2)}${blok ? ' (Türkiye)' : ''}${s ? ', ' + s[1] : ''}.`)); i++;
    }
    k = 1;
    if (/^[0-9/]{5}$/.test(t[i] || '')) {
      const g = t[i], R = tablo(V, 'iR', g[0]), X = tablo(V, 'ix', g[1]), H = tablo(V, 'h', g[2]), Vv = gorus(g.slice(3)) || { tr: 'bilinmiyor', en: 'not known' };
      st.iR = g[0]; st.ix = g[1];
      o.push(G(g, 1, 'iRixhVV · yağış yeri, istasyon, bulut tabanı, görüş', [['iR', g[0], R.tr], ['ix', g[1], X.tr], ['h', g[2], H.tr], ['VV', g.slice(3), Vv.tr]], `Görüş ${Vv.tr}; en alçak taban ${H.tr}`, `${bas(R.en)}; ${X.en}; lowest cloud base ${H.en}; visibility ${Vv.en}.`)); i++;
    }
    if (/^[0-9/]{5}$/.test(t[i] || '')) {
      const g = t[i], N = tablo(V, 'N', g[0]), d = yon(g.slice(1, 3)) || { tr: 'bilinmiyor', en: 'unknown' }, ff = sayi(g.slice(3)), b = birim(st.iw);
      o.push(G(g, 1, 'Nddff · toplam bulut, rüzgâr', [['N', g[0], N.tr], ['dd', g.slice(1, 3), d.tr], ['ff', g.slice(3), isNaN(ff) ? 'bilinmiyor' : ff + ' ' + b.tr]], `Bulut ${N.tr}; rüzgâr ${d.tr}${isNaN(ff) ? '' : ' ' + ff + ' ' + b.tr}`, `Total cloud cover ${N.en}; wind ${d.en}${isNaN(ff) || d.d == null ? '' : ' at ' + ff + ' ' + b.en}.`, { N: g[0], dd: d.d, ff })); i++;
    }
    for (; i < t.length; i++) {
      const g = t[i];
      if (g === '222' || g === '333' || g === '555') { k = Number(g[0]); o.push(G(g, k, 'kısım başı', [[g, g, g === '333' ? 'Kısım 3: bölgesel ek gruplar' : g === '555' ? 'Kısım 5: ulusal gruplar' : 'Kısım 2: deniz verisi']], g === '333' ? 'Kısım 3 başlıyor' : 'Kısım ' + g[0], g === '333' ? 'Section 3 (regional groups) begins.' : 'Section ' + g[0] + ' begins.', 'bolum')); continue; }
      if (!/^[0-9/]{5}$/.test(g)) { o.push(G(g, 'x', 'tanınmayan grup', [[g, g, 'beş haneli değil']], 'Beş haneli bir grup değil', 'Not a five-figure group.', 'x')); u.push(`«${g}» beş haneli bir grup değil.`); continue; }
      o.push(k === 1 ? kisim1(g, V, st) : k === 3 ? kisim3(g, V, st) : G(g, k, 'grup', [[g[0], g, 'bu araç Kısım ' + k + ' gruplarını çözmüyor']], 'Kısım ' + k + ' grubu', 'Section ' + k + ' group.'));
    }
    if (st.ix && '147'.includes(st.ix) && !st.var7) u.push('ix = ' + st.ix + ': 7 grubu bekleniyordu, yok.');
    if (st.ix && '2356'.includes(st.ix) && st.var7) u.push('ix = ' + st.ix + ' iken 7 grubu gelmemeliydi.');
    if (st.iR === '1' && !st.var6) u.push('iR = 1: 6RRRtR grubu Kısım 1\'de olmalıydı.');
    return { o, u };
  }
  function birim(iw) { return iw === '0' || iw === '1' ? { tr: 'm/s', en: 'm/s' } : { tr: 'kt', en: 'knots' }; }
  function kisim1(g, V, st) {
    const c = g[0];
    if (c === '1' || c === '2') {
      const v = sicak(g[1], g.slice(2)), ad = c === '1' ? ['sıcaklık', 'Air temperature'] : ['çiy noktası', 'Dew point'];
      return G(g, 1, `${c}snTTT · ${ad[0]}`, [[c, c, 'grup göstergesi'], ['sn', g[1], g[1] === '1' ? 'eksi' : g[1] === '0' ? 'artı ya da sıfır' : 'bilinmiyor'], ['TTT', g.slice(2), 'onda bir °C']], v == null ? ad[0] + ' bilinmiyor' : `${bas(ad[0])} ${trI(v)} °C`, v == null ? ad[1] + ' not reported.' : `${ad[1]} ${en(v)} °C.`, c === '1' ? { T: v } : { Td: v });
    }
    if (c === '3' || c === '4') {
      const v = basinc(g.slice(1)), ad = c === '3' ? ['istasyon seviyesi basıncı', 'Station-level pressure'] : ['deniz seviyesi basıncı', 'Sea-level pressure'];
      return G(g, 1, `${c}PPPP · ${ad[0]}`, [[c, c, 'grup göstergesi'], ['PPPP', g.slice(1), v == null ? 'bilinmiyor' : `${g.slice(1)} ÷ 10 = ${tr(sayi(g.slice(1)) / 10)}${sayi(g.slice(1)) / 10 < 500 ? ' → + 1000' : ''}`]], v == null ? ad[0] + ' bilinmiyor' : `${bas(ad[0])} ${tr(v)} hPa`, v == null ? ad[1] + ' not reported.' : `${ad[1]} ${v.toFixed(1)} hPa.`, c === '4' ? { P: v, PPP: g.slice(2) } : null);
    }
    if (c === '5') {
      const a = g[1], A = tablo(V, 'a', a), p = sayi(g.slice(2)), s = a < '4' ? 1 : a > '4' ? -1 : 0, dp = isNaN(p) ? null : s * p / 10;
      return G(g, 1, '5appp · basınç eğilimi', [['a', a, A.tr], ['ppp', g.slice(2), isNaN(p) ? 'bilinmiyor' : tr(p / 10) + ' hPa (işareti a\'dan)']], dp == null ? 'Eğilim bilinmiyor' : `3 saatte ${s ? (s > 0 ? 'artış ' : 'düşüş ') + tr(Math.abs(dp)) + ' hPa' : 'değişim yok'}`, dp == null ? 'Pressure tendency not reported.' : `Pressure tendency: ${A.en.split(';')[0]}; ${s ? 'the pressure is ' + Math.abs(dp).toFixed(1) + ' hPa ' + (s > 0 ? 'higher' : 'lower') + ' than 3 hours ago' : 'no change in 3 hours'}.`, { a, dp });
    }
    if (c === '6') { st.var6 = true; return g6(g, V, 1); }
    if (c === '7') {
      st.var7 = true; const w = ww(V, g.slice(1, 3)), w1 = tablo(V, 'W', g[3]), w2 = tablo(V, 'W', g[4]);
      return G(g, 1, '7wwW1W2 · şimdiki ve geçmiş hava', [['ww', g.slice(1, 3), w.tr], ['W1', g[3], w1.tr], ['W2', g[4], w2.tr]], `Şimdiki hava: ${w.tr}`, `Present weather (${g.slice(1, 3)}): ${w.en}; past weather: ${w1.en} / ${w2.en}.`, { ww: g.slice(1, 3) });
    }
    if (c === '8') {
      const N = tablo(V, 'N', g[1]), L = tablo(V, 'CL', g[2]), M = tablo(V, 'CM', g[3]), H = tablo(V, 'CH', g[4]);
      return G(g, 1, '8NhCLCMCH · bulut grubu', [['Nh', g[1], N.tr + ' (alçak bulut; yoksa orta)'], ['CL', g[2], L.tr], ['CM', g[3], M.tr], ['CH', g[4], H.tr]], `Nh: ${N.tr.toLocaleLowerCase('tr-TR')} · CL ${g[2]} · CM ${g[3]} · CH ${g[4]}`, `Amount of low (or medium) cloud: ${N.en}; CL ${g[2]}: ${L.en}; CM ${g[3]}: ${M.en}; CH ${g[4]}: ${H.en}.`);
    }
    return G(g, 1, 'tanınmayan grup', [[c, g, 'Kısım 1\'de bu rakamla başlayan grup yok']], 'Tanınmayan grup', 'Unknown group.', 'x');
  }
  function g6(g, V, k) {
    const R = yagis(g.slice(1, 4)), tR = tablo(V, 'tR', g[4]);
    return G(g, k, '6RRRtR · yağış', [['RRR', g.slice(1, 4), R.tr], ['tR', g[4], tR.tr]], `${tR.tr}: ${R.tr}`, R.mm === 0 && g.slice(1, 4) === '000' ? `No precipitation in ${tR.en}.` : `Precipitation in ${tR.en}: ${R.en}.`);
  }
  function kisim3(g, V, st) {
    const c = g[0];
    if (c === '1' || c === '2') { const v = sicak(g[1], g.slice(2)), ad = c === '1' ? ['en yüksek sıcaklık', 'Maximum temperature'] : ['en düşük sıcaklık', 'Minimum temperature']; return G(g, 3, `${c}snTTT · ${ad[0]}`, [['sn', g[1], g[1] === '1' ? 'eksi' : 'artı ya da sıfır'], ['TTT', g.slice(2), 'onda bir °C']], v == null ? ad[0] + ' bilinmiyor' : `${bas(ad[0])} ${trI(v)} °C`, v == null ? ad[1] + ' not reported.' : `${ad[1]} ${en(v)} °C.`); }
    if (c === '5') {
      return G(g, 3, '5 grubu · bölgesel ek bilgi', [[g.slice(0, 2), g, 'tabloya bak']], 'Ek bilgi grubu', 'Additional regional group: see the table.');
    }
    if (c === '6') return g6(g, V, 3);
    if (c === '7') { const n = sayi(g.slice(1)); return G(g, 3, '7RRRR · 24 saatlik yağış', [['RRRR', g.slice(1), n === 9999 ? 'iz' : tr(n / 10) + ' mm']], '24 saatte ' + (n === 9999 ? 'iz' : tr(n / 10) + ' mm'), `Total precipitation in 24 hours: ${n === 9999 ? 'trace' : (n / 10).toFixed(1) + ' mm'}.`); }
    if (c === '8') {
      const N = tablo(V, 'N', g[1]), C = tablo(V, 'C', g[2]), h = taban(g.slice(3)) || { tr: 'bilinmiyor', en: 'not known' };
      return G(g, 3, '8NsChshs · bulut katı', [['Ns', g[1], N.tr], ['C', g[2], C.tr], ['hshs', g.slice(3), h.is ? `${h.is} = ${h.tr}` : h.tr]], `${N.tr} ${C.tr}, taban ${h.tr}`, `Cloud layer: ${N.en} of ${C.en}, base ${h.en}.`, { kat: true });
    }
    if (c === '9') {
      const sp = g.slice(0, 3), v = g.slice(3), b = birim(st.iw);
      if (sp === '907') { const s = sure(v) || { tr: '?', en: '?' }; return G(g, 3, '907tt · sonraki grubun süresi', [['907', '907', 'süre grubu'], ['tt', v, s.tr]], 'Sonraki grubun kapsadığı süre: ' + s.tr, `The next group refers to the last ${s.en}.`); }
      if (sp === '910' || sp === '911') { const f = sayi(v); return G(g, 3, `${sp}ff · en büyük hamle`, [[sp, sp, sp === '910' ? 'son 10 dk' : 'geçmiş hava süresi ya da 907tt süresi'], ['ff', v, isNaN(f) ? 'bilinmiyor' : f + ' ' + b.tr]], `En büyük hamle ${f} ${b.tr}`, `Highest gust ${sp === '910' ? 'in the last 10 minutes' : 'during that period'}: ${f} ${b.en}.`); }
      return G(g, 3, '9SpSpspsp · özel olay', [[sp, sp, 'özel olay grubu: tabloya bak'], ['spsp', v, '—']], 'Özel olay grubu', 'Special phenomena group: see the table.');
    }
    return G(g, 3, 'Kısım 3 grubu', [[c, g, 'bu araçta ayrıntısı yok (tabloya bak)']], 'Kısım 3 grubu', 'Section 3 group: see the table.');
  }

  /* ---------- istasyon modeli (SVG) ---------- */
  function model(o) {
    const v = {}; for (const x of o) if (x.rol && typeof x.rol === 'object') Object.assign(v, x.rol);
    const N = v.N, r = 9, s = [];
    s.push(`<circle cx="0" cy="0" r="${r}" fill="none" stroke="currentColor" stroke-width="1.4"/>`);
    const n = sayi(N);
    if (n === 9) s.push(`<path d="M-6-6L6 6M6-6L-6 6" stroke="currentColor" stroke-width="1.4"/>`);
    else if (n >= 8) s.push(`<circle r="${r}" fill="currentColor"/>`);
    else if (n > 0) { const a = (n / 8) * 2 * Math.PI, x = r * Math.sin(a), y = -r * Math.cos(a); s.push(`<path d="M0 0L0 ${-r}A${r} ${r} 0 ${n > 4 ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)}Z" fill="currentColor"/>`); }
    if (v.dd != null && v.ff > 0) {
      const t = v.dd * Math.PI / 180, ux = Math.sin(t), uy = -Math.cos(t), L = 36, rx = -uy, ry = ux;
      const P = (d, q = 0) => `${(ux * d + rx * q).toFixed(1)} ${(uy * d + ry * q).toFixed(1)}`;
      s.push(`<path d="M${P(r)}L${P(L)}" stroke="currentColor" stroke-width="1.4"/>`);
      let kal = Math.round(v.ff / 5) * 5, d = L;
      while (kal >= 50) { s.push(`<path d="M${P(d)}L${P(d - 2, 10)}L${P(d - 5)}Z" fill="currentColor"/>`); kal -= 50; d -= 7; }
      while (kal >= 10) { s.push(`<path d="M${P(d)}L${P(d + 3, 11)}" stroke="currentColor" stroke-width="1.4"/>`); kal -= 10; d -= 4; }
      if (kal >= 5) { if (d === L) d -= 4; s.push(`<path d="M${P(d)}L${P(d + 1.5, 6)}" stroke="currentColor" stroke-width="1.4"/>`); }
    } else if (v.dd == null && v.ff === 0) s.push(`<circle r="${r + 3}" fill="none" stroke="currentColor" stroke-width="1"/>`);
    const yaz = (x, y, m, an = 'end') => s.push(`<text x="${x}" y="${y}" text-anchor="${an}">${kac(m)}</text>`);
    if (v.T != null) yaz(-13, -6, String(Math.round(v.T)).replace('-', '−'));
    if (v.Td != null) yaz(-13, 16, String(Math.round(v.Td)).replace('-', '−'));
    if (v.PPP) yaz(13, -6, v.PPP, 'start');
    if (v.dp != null) { yaz(13, 9, (v.dp > 0 ? '+' : v.dp < 0 ? '−' : '') + pad(Math.abs(v.dp * 10), 2), 'start'); s.push(egilim(v.a)); }
    return `<svg class="syn-model" viewBox="-60 -48 120 96" role="img" aria-label="İstasyon modeli (yaklaşık çizim)">${s.join('')}</svg>`;
  }
  function egilim(a) {
    const P = { 0: '0 8 5 0 10 5', 1: '0 8 5 2 10 2', 2: '0 8 10 0', 3: '0 3 4 7 10 0', 4: '0 4 10 4', 5: '0 0 5 8 10 3', 6: '0 0 5 6 10 6', 7: '0 0 10 8', 8: '0 3 4 0 10 8' }[a];
    return P ? `<polyline points="${P}" transform="translate(32 2)" fill="none" stroke="currentColor" stroke-width="1.2"/>` : '';
  }

  /* ---------- ters yön ---------- */
  const TERS = [
    { ad: 'Sıcaklık (°C) → 1snTTT', g: [['T', -10.4]], f: ([v]) => [`1${v < 0 ? 1 : 0}${pad(Math.abs(v) * 10, 3)}`, `sn = ${v < 0 ? '1 (eksi)' : '0 (artı)'} · TTT = |T| × 10`] },
    { ad: 'Çiy noktası (°C) → 2snTdTdTd', g: [['Td', -0.3]], f: ([v]) => [`2${v < 0 ? 1 : 0}${pad(Math.abs(v) * 10, 3)}`, 'Td hiçbir zaman T\'yi aşmaz'] },
    { ad: 'Deniz seviyesi basıncı (hPa) → 4PPPP', g: [['P', 1026.8]], f: ([v]) => { const k = Math.round(v * 10) % 10000; return [`4${pad(k, 4)}`, `Binler hanesi düşer, son hane ondalık · modelde «${pad(k % 1000, 3)}»`]; } },
    { ad: 'Görüş (km) → VV', g: [['km', 10]], f: ([v]) => { const k = v < 0.1 ? 0 : v < 5 ? Math.floor(v * 10) : v < 6 ? 50 : v <= 30 ? Math.floor(v) + 50 : v <= 70 ? 80 + Math.floor((v - 30) / 5) : 89; return [pad(k, 2), k <= 50 ? 'VV = km × 10' : k <= 80 ? 'VV = km + 50' : '81–89 dilimi']; } },
    { ad: 'Bulut tabanı (m) → hshs', g: [['m', 6000]], f: ([v]) => { const k = v < 30 ? 0 : v <= 1500 ? Math.floor(v / 30) : v < 1800 ? 50 : v <= 9000 ? Math.floor(v / 300) + 50 : v <= 21000 ? 80 + Math.floor((v - 9000) / 1500) : 89; return [pad(k, 2), k <= 50 ? 'hshs = m ÷ 30' : k <= 80 ? 'hshs = m ÷ 300 + 50' : '81–89 dilimi']; } },
    { ad: 'Rüzgâr: N (okta), yön (°), hız → Nddff', g: [['N', 3], ['dd°', 200], ['ff', 2]], f: ([N, d, f]) => { const dd = f === 0 ? 0 : ((Math.round(d / 10) + 35) % 36) + 1; return [`${Math.min(9, Math.max(0, Math.round(N)))}${pad(dd, 2)}${f >= 99 ? '99 00' + pad(f, 3) : pad(f, 2)}`, 'dd = geldiği yön ÷ 10']; } }
  ];

  /* ---------- kendini dene (çeldiriciler = sık hatalar) ---------- */
  const rs = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  function soru() {
    const tip = rs(0, 5);
    if (tip === 0) { const v = rs(-150, 350) / 10, g = `1${v < 0 ? 1 : 0}${pad(Math.abs(v) * 10, 3)}`; return { g, s: 'Sıcaklık kaç °C?', c: [trI(v) + ' °C', trI(-v || 0.5) + ' °C', tr(Math.abs(v) * 10, 0) + ' °C'], n: 'sn = 1 eksi demek; son üç hane onda bir °C.' }; }
    if (tip === 1) { const v = rs(9850, 10400) / 10, k = Math.round(v * 10) % 10000, g = `4${pad(k, 4)}`; return { g, s: 'Deniz seviyesi basıncı kaç hPa?', c: [tr(v) + ' hPa', tr(v >= 1000 ? v - 100 : v + 100) + ' hPa', k + ' hPa'], n: 'Dört hane ÷ 10; 500\'den küçükse + 1000.' }; }
    if (tip === 2) { const k = Math.random() < 0.5 ? rs(5, 50) : rs(56, 80), v = k <= 50 ? k / 10 : k - 50; return { g: `${rs(1, 4)}${rs(1, 3)}${rs(3, 9)}${pad(k, 2)}`, s: 'Görüş kaç km? (son iki hane VV)', c: [tr(v, k <= 50 ? 1 : 0) + ' km', k + ' km', k <= 50 ? tr(k / 100, 2) + ' km' : tr(k / 10) + ' km'], n: '01–50 → VV/10 km · 56–80 → VV − 50 km.' }; }
    if (tip === 3) { const dd = rs(1, 36), ff = rs(2, 30); return { g: `${rs(0, 8)}${pad(dd, 2)}${pad(ff, 2)}`, s: 'Rüzgâr nasıl? (iw = 4, knot)', c: [`${dd * 10}°'den ${ff} kt`, `${dd * 10}°'ye doğru ${ff} kt`, `${dd}°'den ${ff} kt`], n: 'dd onlarca derece ve GELDİĞİ yön.' }; }
    if (tip === 4) { const hs = rs(56, 80); return { g: `8${rs(1, 7)}${rs(0, 2)}${hs}`, s: 'Kısım 3 bulut katının tabanı kaç m?', c: [(hs - 50) * 300 + ' m', hs * 30 + ' m', hs * 100 + ' m'], n: '56–80 → (hshs − 50) × 300 m; 01–50 → hshs × 30 m.' }; }
    const a = rs(0, 8), p = rs(1, 45), sg = a < 4 ? 1 : a > 4 ? -1 : 0, dog = sg ? `3 saatte ${tr(p / 10)} hPa ${sg > 0 ? 'artış' : 'düşüş'}` : '3 saatte değişim yok';
    return { g: `5${a}${sg ? pad(p, 3) : '000'}`, s: 'Basınç 3 saatte nasıl değişti?', c: [dog, sg ? `3 saatte ${tr(p / 10)} hPa ${sg > 0 ? 'düşüş' : 'artış'}` : '3 saatte 1,0 hPa artış', sg ? `3 saatte ${p} hPa ${sg > 0 ? 'artış' : 'düşüş'}` : '3 saatte 1,0 hPa düşüş'], n: 'a 0–3 yüksek, 4 aynı, 5–8 düşük; ppp onda bir hPa.' };
  }

  /* ---------- arayüz ---------- */
  function ac(kap, { veri, git } = {}) {
    if (!document.getElementById('syn-stil')) { const st = document.createElement('style'); st.id = 'syn-stil'; st.textContent = CSS; document.head.append(st); }
    const V = veri && veri.tablo ? veri : null;
    if (!V) { kap.innerHTML = '<p class="yok">SYNOP tabloları yüklenemedi.</p>'; return { dur() {} }; }
    const orn = V.ornek || [];
    kap.innerHTML = `<div class="syn"><div class="syn-ic" style="padding:0"><label for="syn-g">SYNOP iletisi (yapıştır ya da örnek seç)</label>
<textarea id="syn-g" class="syn-girdi" rows="3" spellcheck="false" autocomplete="off">${kac(orn[0] ? orn[0].ileti : '')}</textarea>
<div class="syn-dug"><select class="syn-orn" aria-label="Örnek ileti">${orn.map((x, i) => `<option value="${i}">${kac(x.ad)}</option>`).join('')}</select><button type="button" class="kucuk syn-coz">Çöz</button><button type="button" class="kucuk syn-hep">Hepsini aç</button></div></div>
<div class="syn-serit" role="group" aria-label="Gruplar"></div><div class="syn-mod"></div><p class="syn-uyari" hidden></p><ol class="syn-liste"></ol>
<details class="syn-kutu syn-ters"><summary>Ters yön: değerden kod kur</summary><div class="syn-ic"><select class="syn-tsec" aria-label="Ne kodlanacak">${TERS.map((x, i) => `<option value="${i}">${kac(x.ad)}</option>`).join('')}</select><div class="syn-dug syn-tgir"></div><div class="syn-cikti" aria-live="polite"></div><p class="syn-not syn-tnot"></p></div></details>
<details class="syn-kutu syn-dene"><summary>Kendini dene: rastgele grup</summary><div class="syn-ic"><div class="syn-soru"></div><p class="syn-sor"></p><div class="syn-dug syn-sec"></div><p class="syn-geri" aria-live="polite"></p><div class="syn-dug"><button type="button" class="kucuk syn-yeni">Yeni grup</button></div></div></details>
<div class="syn-dug">${git ? '<button type="button" class="kucuk" data-git="kavram:synop">SYNOP kavramı</button><button type="button" class="kucuk" data-git="kavram:istasyon-modeli">İstasyon modeli</button><button type="button" class="kucuk" data-git="hesap:basinc-kodu">Basınç kodu aracı</button>' : ''}</div>
<p class="syn-not">${kac(V.kaynak || '')} Model çizimi yaklaşıktır.</p></div>`;
    const $ = (s) => kap.querySelector(s);
    const girdi = $('.syn-girdi'), serit = $('.syn-serit'), liste = $('.syn-liste'), uy = $('.syn-uyari'), mod = $('.syn-mod');
    function ciz() {
      const { o, u } = coz(girdi.value, V);
      serit.innerHTML = o.map((x, i) => `<button type="button" class="syn-cip" style="--c:${RENK[x.rol === 'bolum' ? 'b' : x.k] || RENK.x}" data-i="${i}" aria-pressed="false" title="${kac(x.ad)}">${kac(x.g)}</button>`).join('');
      liste.innerHTML = o.map((x, i) => `<li><details class="syn-g" style="--c:${RENK[x.rol === 'bolum' ? 'b' : x.k] || RENK.x}" data-i="${i}"><summary><span class="syn-kod">${kac(x.g)}</span><span>${kac(x.tr)}</span><span class="syn-ad">${x.k === 'x' ? '' : 'Kısım ' + x.k + ' · '}${kac(x.ad)}</span></summary><div class="syn-tk"><table class="syn-tab"><tbody>${x.p.map((p) => `<tr><td>${kac(p[0])}</td><td>${kac(p[1])}</td><td>${kac(p[2])}</td></tr>`).join('')}</tbody></table></div><p class="syn-en" lang="en"><b>Exam answer:</b> ${kac(x.en)}</p></details></li>`).join('');
      mod.innerHTML = o.some((x) => x.rol && typeof x.rol === 'object') ? model(o) : '';
      uy.hidden = !u.length; uy.textContent = u.join(' ');
    }
    serit.addEventListener('click', (e) => {
      const b = e.target.closest('.syn-cip'); if (!b) return;
      const d = liste.querySelector(`.syn-g[data-i="${b.dataset.i}"]`); if (!d) return;
      d.open = !d.open; b.setAttribute('aria-pressed', String(d.open)); if (d.open) d.scrollIntoView({ block: 'nearest' });
    });
    liste.addEventListener('toggle', (e) => { const d = e.target; if (!d.classList || !d.classList.contains('syn-g')) return; const b = serit.querySelector(`.syn-cip[data-i="${d.dataset.i}"]`); if (b) b.setAttribute('aria-pressed', String(d.open)); }, true);
    $('.syn-coz').addEventListener('click', ciz);
    $('.syn-orn').addEventListener('change', (e) => { girdi.value = (orn[+e.target.value] || {}).ileti || ''; ciz(); });
    $('.syn-hep').addEventListener('click', (e) => { const L = liste.querySelectorAll('.syn-g'), ac2 = [...L].some((d) => !d.open); L.forEach((d) => { d.open = ac2; }); e.target.textContent = ac2 ? 'Hepsini kapat' : 'Hepsini aç'; });
    girdi.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); ciz(); } });
    // ters yön
    const tsec = $('.syn-tsec'), tgir = $('.syn-tgir'), tcik = $('.syn-cikti'), tnot = $('.syn-tnot');
    function tKur() { const T = TERS[+tsec.value]; tgir.innerHTML = T.g.map((g, i) => `<label>${kac(g[0])} <input type="number" step="any" inputmode="decimal" data-i="${i}" value="${g[1]}"></label>`).join(''); tHes(); }
    function tHes() { const T = TERS[+tsec.value], v = [...tgir.querySelectorAll('input')].map((x) => Number(String(x.value).replace(',', '.'))); if (v.some((x) => !isFinite(x))) { tcik.textContent = '—'; return; } const [k, n] = T.f(v); tcik.textContent = k; tnot.textContent = n; }
    tsec.addEventListener('change', tKur); tgir.addEventListener('input', tHes); tKur();
    // kendini dene
    const dSoru = $('.syn-soru'), dSor = $('.syn-sor'), dSec = $('.syn-sec'), dGeri = $('.syn-geri');
    let q = null;
    function yeni() {
      q = soru(); const sira = [0, 1, 2].sort(() => Math.random() - 0.5);
      dSoru.textContent = q.g; dSor.textContent = q.s; dGeri.textContent = ''; dGeri.className = 'syn-geri';
      dSec.innerHTML = sira.map((j) => `<button type="button" class="kucuk" data-j="${j}">${kac(q.c[j])}</button>`).join('');
    }
    dSec.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b || !q) return; const ok = b.dataset.j === '0'; dGeri.className = 'syn-geri ' + (ok ? 'syn-ok' : 'syn-yok'); dGeri.textContent = (ok ? 'Doğru. ' : 'Olmadı: doğru cevap «' + q.c[0] + '». ') + q.n; });
    $('.syn-yeni').addEventListener('click', yeni); yeni();
    if (git) kap.addEventListener('click', (e) => { const b = e.target.closest('[data-git]'); if (b && kap.contains(b)) git(b.dataset.git); });
    ciz();
    return { dur() {} };
  }
  window.DK_EKLENTI = window.DK_EKLENTI || {};
  window.DK_EKLENTI.synop = { ac, coz };
})();
